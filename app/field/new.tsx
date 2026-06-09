import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as Location from "expo-location";
import { router } from "expo-router";
import {
  createFarmer,
  createField,
  createSprayJob,
  fetchSprayTeams,
  searchFarmers
} from "@/src/services/fieldService";
import { Farmer, GeoJsonPolygon, SprayTeam } from "@/src/types/domain";

export default function NewFieldScreen() {
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [farmerMatches, setFarmerMatches] = useState<Farmer[]>([]);
  const [teams, setTeams] = useState<SprayTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [farmerName, setFarmerName] = useState("");
  const [farmerPhone, setFarmerPhone] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [address, setAddress] = useState("");
  const [centerLat, setCenterLat] = useState("");
  const [centerLng, setCenterLng] = useState("");
  const [polygonRadiusM, setPolygonRadiusM] = useState("60");
  const [cropName, setCropName] = useState("");
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().slice(0, 10));
  const [polygonText, setPolygonText] = useState(
    "[[127.2852,34.6122],[127.2861,34.6123],[127.2862,34.6115],[127.2854,34.6114],[127.2852,34.6122]]"
  );
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    fetchSprayTeams()
      .then(setTeams)
      .catch(() => {
        setTeams([]);
      });
  }, []);

  async function handleFarmerSearch() {
    const keyword = farmerPhone.trim() || farmerName.trim();

    if (!keyword) {
      Alert.alert("검색 확인", "농가명 또는 전화번호를 먼저 입력해 주세요.");
      return;
    }

    setSearching(true);
    setSelectedFarmer(null);

    try {
      const matches = await searchFarmers(keyword);
      setFarmerMatches(matches);

      if (matches.length === 0) {
        Alert.alert("검색 결과 없음", "저장 시 새 농가로 등록됩니다.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "농가 검색에 실패했습니다.";
      Alert.alert("검색 실패", message);
    } finally {
      setSearching(false);
    }
  }

  function handleSelectFarmer(farmer: Farmer) {
    setSelectedFarmer(farmer);
    setFarmerName(farmer.name);
    setFarmerPhone(farmer.phone ?? "");
    setFarmerMatches([]);
  }

  async function handleUseCurrentLocation() {
    setLocating(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("위치 권한 필요", "현재 위치로 중심 좌표를 입력하려면 위치 권한이 필요합니다.");
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      setCenterLat(position.coords.latitude.toFixed(7));
      setCenterLng(position.coords.longitude.toFixed(7));
    } catch (error) {
      const message = error instanceof Error ? error.message : "현재 위치를 가져오지 못했습니다.";
      Alert.alert("위치 확인 실패", message);
    } finally {
      setLocating(false);
    }
  }

  function handleGeneratePolygon() {
    const lat = Number(centerLat);
    const lng = Number(centerLng);
    const radiusM = Number(polygonRadiusM);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      Alert.alert("좌표 확인", "중심 위도와 경도를 먼저 숫자로 입력해 주세요.");
      return;
    }

    if (!Number.isFinite(radiusM) || radiusM <= 0) {
      Alert.alert("반경 확인", "필지 반경은 0보다 큰 숫자로 입력해 주세요.");
      return;
    }

    const latDelta = radiusM / 111320;
    const lngDelta = radiusM / (111320 * Math.cos((lat * Math.PI) / 180));
    const coordinates = [
      [lng - lngDelta, lat + latDelta],
      [lng + lngDelta, lat + latDelta],
      [lng + lngDelta, lat - latDelta],
      [lng - lngDelta, lat - latDelta],
      [lng - lngDelta, lat + latDelta]
    ];

    setPolygonText(JSON.stringify(coordinates.map(([x, y]) => [Number(x.toFixed(7)), Number(y.toFixed(7))])));
  }

  async function handleSave() {
    if (!farmerName.trim() || !fieldName.trim() || !centerLat.trim() || !centerLng.trim()) {
      Alert.alert("입력 확인", "농가명, 필지명, 중심 좌표는 필수입니다.");
      return;
    }

    setSaving(true);

    try {
      const coordinates = JSON.parse(polygonText) as number[][];
      const lat = Number(centerLat);
      const lng = Number(centerLng);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        Alert.alert("좌표 확인", "중심 위도와 경도는 숫자로 입력해 주세요.");
        return;
      }

      if (
        !Array.isArray(coordinates) ||
        coordinates.length < 4 ||
        coordinates.some(
          (point) =>
            !Array.isArray(point) ||
            point.length !== 2 ||
            !Number.isFinite(Number(point[0])) ||
            !Number.isFinite(Number(point[1]))
        )
      ) {
        Alert.alert("좌표 확인", "Polygon 좌표는 최소 4개 지점이 필요합니다.");
        return;
      }

      const polygon_geojson: GeoJsonPolygon = {
        type: "Polygon",
        coordinates: [coordinates]
      };

      const farmer = selectedFarmer;
      const farmerResult = farmer
        ? { data: farmer, error: null }
        : await createFarmer({
            name: farmerName.trim(),
            phone: farmerPhone.trim() || null,
            address: address.trim() || null
          });

      if (farmerResult.error) {
        throw farmerResult.error;
      }

      const { data, error } = await createField({
        farmer_id: farmerResult.data.id,
        field_name: fieldName.trim(),
        address: address.trim() || undefined,
        center_lat: lat,
        center_lng: lng,
        polygon_geojson,
        crop_name: cropName.trim() || undefined
      });

      if (error) {
        throw error;
      }

      await createSprayJob({
        field_id: data.id,
        farmer_id: farmerResult.data.id,
        assigned_team_id: selectedTeamId,
        scheduled_date: scheduledDate.trim() || null
      });

      Alert.alert("저장 완료", "필지와 기본 방제 예정 작업이 생성되었습니다.");
      router.replace("/(tabs)/map");
    } catch (error) {
      const message = error instanceof Error ? error.message : "필지 저장에 실패했습니다.";
      Alert.alert("저장 실패", message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>필지 등록</Text>
      <Text style={styles.caption}>농가, 필지, 기본 방제 예정 작업을 한 번에 만듭니다.</Text>
      {selectedFarmer ? (
        <View style={styles.selectedFarmerBox}>
          <Text style={styles.selectedFarmerTitle}>선택된 기존 농가</Text>
          <Text style={styles.selectedFarmerText}>
            {selectedFarmer.name} · {selectedFarmer.phone ?? "전화번호 없음"}
          </Text>
          <Pressable style={styles.clearButton} onPress={() => setSelectedFarmer(null)}>
            <Text style={styles.clearButtonText}>새 농가로 입력</Text>
          </Pressable>
        </View>
      ) : null}
      <TextInput style={styles.input} placeholder="농가명" value={farmerName} onChangeText={setFarmerName} />
      <TextInput style={styles.input} placeholder="농가 전화번호" keyboardType="phone-pad" value={farmerPhone} onChangeText={setFarmerPhone} />
      <Pressable style={styles.lookupButton} onPress={handleFarmerSearch} disabled={searching}>
        <Text style={styles.lookupButtonText}>
          {searching ? "농가 검색 중..." : "기존 농가 검색"}
        </Text>
      </Pressable>
      {farmerMatches.map((farmer) => (
        <Pressable
          key={farmer.id}
          style={styles.matchCard}
          onPress={() => handleSelectFarmer(farmer)}
        >
          <Text style={styles.matchName}>{farmer.name}</Text>
          <Text style={styles.matchMeta}>{farmer.phone ?? "전화번호 없음"}</Text>
          <Text style={styles.matchMeta}>{farmer.address ?? "주소 없음"}</Text>
        </Pressable>
      ))}
      <TextInput style={styles.input} placeholder="필지명" value={fieldName} onChangeText={setFieldName} />
      <TextInput style={styles.input} placeholder="주소" value={address} onChangeText={setAddress} />
      <TextInput style={styles.input} placeholder="중심 위도" keyboardType="numeric" value={centerLat} onChangeText={setCenterLat} />
      <TextInput style={styles.input} placeholder="중심 경도" keyboardType="numeric" value={centerLng} onChangeText={setCenterLng} />
      <View style={styles.coordinateTools}>
        <Pressable style={styles.toolButton} onPress={handleUseCurrentLocation} disabled={locating}>
          <Text style={styles.toolButtonText}>
            {locating ? "현재 위치 확인 중..." : "현재 위치로 좌표 입력"}
          </Text>
        </Pressable>
        <TextInput
          style={[styles.input, styles.radiusInput]}
          placeholder="필지 반경 m"
          keyboardType="numeric"
          value={polygonRadiusM}
          onChangeText={setPolygonRadiusM}
        />
        <Pressable style={styles.toolButton} onPress={handleGeneratePolygon}>
          <Text style={styles.toolButtonText}>중심좌표로 임시 필지 만들기</Text>
        </Pressable>
      </View>
      <TextInput style={styles.input} placeholder="작물명" value={cropName} onChangeText={setCropName} />
      <TextInput style={styles.input} placeholder="작업 예정일 YYYY-MM-DD" value={scheduledDate} onChangeText={setScheduledDate} />
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>담당 방제팀</Text>
        <Text style={styles.sectionCaption}>팀을 선택하지 않으면 배정 전 작업으로 저장됩니다.</Text>
        <View style={styles.teamList}>
          <Pressable
            style={[styles.teamButton, selectedTeamId === null && styles.teamButtonActive]}
            onPress={() => setSelectedTeamId(null)}
          >
            <Text
              style={[
                styles.teamButtonText,
                selectedTeamId === null && styles.teamButtonTextActive
              ]}
            >
              배정 전
            </Text>
          </Pressable>
          {teams.map((team) => (
            <Pressable
              key={team.id}
              style={[styles.teamButton, selectedTeamId === team.id && styles.teamButtonActive]}
              onPress={() => setSelectedTeamId(team.id)}
            >
              <Text
                style={[
                  styles.teamButtonText,
                  selectedTeamId === team.id && styles.teamButtonTextActive
                ]}
              >
                {team.team_name}
              </Text>
            </Pressable>
          ))}
        </View>
        {teams.length === 0 ? (
          <Text style={styles.emptyTeamText}>등록된 팀이 없거나 Supabase 연결 전입니다.</Text>
        ) : null}
      </View>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Polygon 좌표"
        multiline
        value={polygonText}
        onChangeText={setPolygonText}
      />
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderText}>추후 지도 위 직접 그리기 UI 연결 예정</Text>
      </View>
      <Pressable style={styles.button} onPress={handleSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? "저장 중..." : "저장"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC"
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 40,
    gap: 12
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#14213D"
  },
  caption: {
    fontSize: 15,
    color: "#57534E",
    marginBottom: 8
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15
  },
  coordinateTools: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    gap: 10
  },
  toolButton: {
    backgroundColor: "#E0F2FE",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center"
  },
  toolButtonText: {
    color: "#075985",
    fontWeight: "800"
  },
  radiusInput: {
    backgroundColor: "#F8FAFC"
  },
  selectedFarmerBox: {
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: "#86EFAC"
  },
  selectedFarmerTitle: {
    color: "#166534",
    fontSize: 13,
    fontWeight: "800"
  },
  selectedFarmerText: {
    color: "#14532D",
    fontSize: 15,
    fontWeight: "700"
  },
  clearButton: {
    alignSelf: "flex-start",
    marginTop: 2,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  clearButtonText: {
    color: "#166534",
    fontWeight: "800"
  },
  lookupButton: {
    backgroundColor: "#E0F2FE",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center"
  },
  lookupButtonText: {
    color: "#075985",
    fontWeight: "800"
  },
  matchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: "#BFDBFE"
  },
  matchName: {
    color: "#14213D",
    fontSize: 16,
    fontWeight: "800"
  },
  matchMeta: {
    color: "#57534E",
    fontSize: 13
  },
  sectionBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    gap: 10
  },
  sectionTitle: {
    color: "#14213D",
    fontSize: 16,
    fontWeight: "800"
  },
  sectionCaption: {
    color: "#57534E",
    fontSize: 13
  },
  teamList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  teamButton: {
    borderRadius: 999,
    backgroundColor: "#E7E5E4",
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  teamButtonActive: {
    backgroundColor: "#14213D"
  },
  teamButtonText: {
    color: "#44403C",
    fontWeight: "800"
  },
  teamButtonTextActive: {
    color: "#FFFFFF"
  },
  emptyTeamText: {
    color: "#B45309",
    fontSize: 13,
    fontWeight: "700"
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: "top"
  },
  mapPlaceholder: {
    height: 180,
    borderRadius: 18,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center"
  },
  mapPlaceholderText: {
    color: "#1D4ED8",
    fontWeight: "700"
  },
  button: {
    marginTop: 8,
    backgroundColor: "#14213D",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center"
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700"
  }
});
