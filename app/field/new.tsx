import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { createField, createSprayJob } from "@/src/services/fieldService";
import { GeoJsonPolygon } from "@/src/types/domain";

export default function NewFieldScreen() {
  const [farmerId, setFarmerId] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [address, setAddress] = useState("");
  const [centerLat, setCenterLat] = useState("");
  const [centerLng, setCenterLng] = useState("");
  const [cropName, setCropName] = useState("");
  const [polygonText, setPolygonText] = useState(
    "[[127.2852,34.6122],[127.2861,34.6123],[127.2862,34.6115],[127.2854,34.6114],[127.2852,34.6122]]"
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!farmerId.trim() || !fieldName.trim() || !centerLat.trim() || !centerLng.trim()) {
      Alert.alert("입력 확인", "농가 ID, 필지명, 중심 좌표는 필수입니다.");
      return;
    }

    setSaving(true);

    try {
      const coordinates = JSON.parse(polygonText) as number[][];
      const polygon_geojson: GeoJsonPolygon = {
        type: "Polygon",
        coordinates: [coordinates]
      };

      const { data, error } = await createField({
        farmer_id: farmerId.trim(),
        field_name: fieldName.trim(),
        address: address.trim() || undefined,
        center_lat: Number(centerLat),
        center_lng: Number(centerLng),
        polygon_geojson,
        crop_name: cropName.trim() || undefined
      });

      if (error) {
        throw error;
      }

      await createSprayJob({
        field_id: data.id,
        farmer_id: farmerId.trim()
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
      <Text style={styles.caption}>MVP에서는 직접 polygon 좌표를 입력하는 구조로 먼저 시작합니다.</Text>
      <TextInput style={styles.input} placeholder="농가 ID 또는 농가 선택" value={farmerId} onChangeText={setFarmerId} />
      <TextInput style={styles.input} placeholder="필지명" value={fieldName} onChangeText={setFieldName} />
      <TextInput style={styles.input} placeholder="주소" value={address} onChangeText={setAddress} />
      <TextInput style={styles.input} placeholder="중심 위도" keyboardType="numeric" value={centerLat} onChangeText={setCenterLat} />
      <TextInput style={styles.input} placeholder="중심 경도" keyboardType="numeric" value={centerLng} onChangeText={setCenterLng} />
      <TextInput style={styles.input} placeholder="작물명" value={cropName} onChangeText={setCropName} />
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
