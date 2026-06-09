import { PropsWithChildren } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { FieldWithRelations } from "@/src/types/domain";
import { JOB_STATUS_LABELS } from "@/src/constants/status";

type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type MapAdapterProps = PropsWithChildren<{
  fields: FieldWithRelations[];
  selectedFieldId?: string | null;
  onSelectField: (fieldId: string) => void;
  initialRegion: MapRegion;
}>;

export function MapAdapter({ fields, selectedFieldId, onSelectField, children }: MapAdapterProps) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>지도 미리보기</Text>
        <Text style={styles.caption}>
          웹에서는 지도 엔진 대신 필지 목록으로 확인합니다. 갤럭시 앱에서는 실제 지도가 표시됩니다.
        </Text>
        {fields.map((item) => {
          const selected = selectedFieldId === item.field.id;

          return (
            <Pressable
              key={item.field.id}
              style={[styles.card, selected && styles.cardSelected]}
              onPress={() => onSelectField(item.field.id)}
            >
              <Text style={styles.title}>{item.field.field_name}</Text>
              <Text style={styles.meta}>{item.field.address ?? "주소 미입력"}</Text>
              <Text style={styles.meta}>
                {item.field.center_lat.toFixed(5)}, {item.field.center_lng.toFixed(5)}
              </Text>
              <Text style={styles.status}>
                {JOB_STATUS_LABELS[item.job?.status ?? "pending"]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E0F2FE"
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 240,
    gap: 12
  },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: "#14213D"
  },
  caption: {
    fontSize: 14,
    color: "#57534E",
    lineHeight: 20
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    gap: 6,
    borderWidth: 2,
    borderColor: "transparent"
  },
  cardSelected: {
    borderColor: "#14213D"
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#14213D"
  },
  meta: {
    fontSize: 13,
    color: "#57534E"
  },
  status: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "800",
    color: "#2563EB"
  }
});
