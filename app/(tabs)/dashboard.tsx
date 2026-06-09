import { StyleSheet, Text, View } from "react-native";
import { DASHBOARD_STATUS_ORDER, JOB_STATUS_LABELS } from "@/src/constants/status";
import { useFields } from "@/src/hooks/useFields";

export default function DashboardScreen() {
  const { fields, errorMessage } = useFields();
  const counts = DASHBOARD_STATUS_ORDER.map((status) => ({
    status,
    count: fields.filter((item) => (item.job?.status ?? "pending") === status).length
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>오늘 작업 현황</Text>
      <Text style={styles.caption}>실시간 작업 상태를 한 화면에서 확인합니다.</Text>
      {errorMessage ? <Text style={styles.notice}>Supabase 연결 전 샘플 데이터입니다.</Text> : null}
      <View style={styles.grid}>
        {counts.map((item) => (
          <View key={item.status} style={styles.card}>
            <Text style={styles.cardCount}>{item.count}</Text>
            <Text style={styles.cardLabel}>{JOB_STATUS_LABELS[item.status]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingTop: 72
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#14213D"
  },
  caption: {
    marginTop: 8,
    fontSize: 15,
    color: "#57534E"
  },
  notice: {
    marginTop: 12,
    color: "#B45309",
    fontWeight: "700"
  },
  grid: {
    marginTop: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  card: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    minHeight: 110,
    justifyContent: "space-between"
  },
  cardCount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#14213D"
  },
  cardLabel: {
    fontSize: 14,
    color: "#44403C"
  }
});
