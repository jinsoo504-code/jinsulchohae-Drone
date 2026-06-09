import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { FieldBottomSheet } from "@/src/components/FieldBottomSheet";
import { MapAdapter } from "@/src/lib/map/MapAdapter";
import { useAppStore } from "@/src/store/appStore";
import { useFields } from "@/src/hooks/useFields";

export default function MapScreen() {
  const { fields, errorMessage } = useFields();
  const selectedField = useAppStore((state) => state.selectedField);
  const setSelectedField = useAppStore((state) => state.setSelectedField);

  useEffect(() => {
    if (fields.length === 0) {
      setSelectedField(null);
      return;
    }

    const selectedStillExists = fields.some((item) => item.field.id === selectedField?.field.id);

    if (!selectedField || !selectedStillExists) {
      setSelectedField(fields[0]);
    }
  }, [fields, selectedField, setSelectedField]);

  const mapCenter = selectedField ?? fields[0];

  return (
    <View style={styles.container}>
      <MapAdapter
        fields={fields}
        selectedFieldId={selectedField?.field.id}
        onSelectField={(fieldId) => {
          const found = fields.find((item) => item.field.id === fieldId) ?? null;
          setSelectedField(found);
        }}
        initialRegion={{
          latitude: mapCenter?.field.center_lat ?? 34.6118,
          longitude: mapCenter?.field.center_lng ?? 127.2857,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03
        }}
      >
        {errorMessage ? <Text style={styles.notice}>샘플 데이터 표시 중</Text> : null}
        <FieldBottomSheet
          field={selectedField}
          onOpenDetail={() => {
            if (selectedField) {
              router.push(`/field/${selectedField.field.id}`);
            }
          }}
        />
      </MapAdapter>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  notice: {
    position: "absolute",
    top: 56,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#57534E",
    fontWeight: "700",
    overflow: "hidden"
  }
});
