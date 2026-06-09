import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import {
  createFarmer,
  createField,
  createSprayJob,
  searchFarmers
} from "@/src/services/fieldService";
import { Farmer, GeoJsonPolygon } from "@/src/types/domain";

export default function NewFieldScreen() {
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [farmerMatches, setFarmerMatches] = useState<Farmer[]>([]);
  const [farmerName, setFarmerName] = useState("");
  const [farmerPhone, setFarmerPhone] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [address, setAddress] = useState("");
  const [centerLat, setCenterLat] = useState("");
  const [centerLng, setCenterLng] = useState("");
  const [cropName, setCropName] = useState("");
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().slice(0, 10));
  const [polygonText, setPolygonText] = useState(
    "[[127.2852,34.6122],[127.2861,34.6123],[127.2862,34.6115],[127.2854,34.6114],[127.2852,34.6122]]"
  );
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);

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

      if (!Array.isArray(coordinates) || coordinates.length < 4) {
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
      <TextInput style={styles.input} placeholder="작물명" value={cropName} onChangeText={setCropName} />
      <TextInput style={styles.input} placeholder="작업 예정일 YYYY-MM-DD" value={scheduledDate} onChangeText={setScheduledDate} />
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
