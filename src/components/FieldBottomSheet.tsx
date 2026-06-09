import { Pressable, StyleSheet, Text, View } from "react-native";
import { FieldWithRelations } from "@/src/types/domain";
import { StatusChip } from "@/src/components/StatusChip";

type Props = {
  field: FieldWithRelations | null;
  onOpenDetail: () => void;
};

export function FieldBottomSheet({ field, onOpenDetail }: Props) {
  if (!field) {
    return null;
  }

  return (
    <View style={styles.sheet}>
      <Text style={styles.title}>{field.field.field_name}</Text>
      <Text style={styles.subtitle}>{field.farmer?.name ?? "농가 미지정"}</Text>
      <StatusChip status={field.job?.status ?? "pending"} />
      <Text style={styles.meta}>{field.field.address ?? "주소 미입력"}</Text>
      <Pressable style={styles.button} onPress={onOpenDetail}>
        <Text style={styles.buttonText}>필지 상세 보기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    gap: 8,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  title: {
    fontSize: 18,
    fontWeight: "800"
  },
  subtitle: {
    fontSize: 14,
    color: "#57534E"
  },
  meta: {
    fontSize: 13,
    color: "#78716C"
  },
  button: {
    marginTop: 4,
    backgroundColor: "#14213D",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center"
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700"
  }
});
