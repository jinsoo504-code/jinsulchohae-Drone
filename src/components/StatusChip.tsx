import { Text, View, StyleSheet } from "react-native";
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from "@/src/constants/status";
import { JobStatus } from "@/src/types/domain";

export function StatusChip({ status }: { status: JobStatus }) {
  return (
    <View style={[styles.chip, { backgroundColor: `${JOB_STATUS_COLORS[status]}22` }]}>
      <View style={[styles.dot, { backgroundColor: JOB_STATUS_COLORS[status] }]} />
      <Text style={styles.label}>{JOB_STATUS_LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999
  },
  label: {
    fontSize: 12,
    fontWeight: "700"
  }
});
