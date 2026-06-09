import { FlatList, StyleSheet, Text, View } from "react-native";
import { StatusChip } from "@/src/components/StatusChip";
import { useFields } from "@/src/hooks/useFields";

export default function JobsScreen() {
  const { fields, errorMessage } = useFields();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>작업 목록</Text>
      {errorMessage ? <Text style={styles.notice}>Supabase 연결 전 샘플 데이터입니다.</Text> : null}
      <FlatList
        data={fields}
        keyExtractor={(item) => item.field.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.field.field_name}</Text>
            <Text style={styles.meta}>{item.farmer?.name ?? "농가 미지정"}</Text>
            <Text style={styles.meta}>{item.field.address ?? "주소 미입력"}</Text>
            <StatusChip status={item.job?.status ?? "pending"} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 72,
    paddingHorizontal: 20
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#14213D"
  },
  notice: {
    marginTop: 12,
    color: "#B45309",
    fontWeight: "700"
  },
  list: {
    paddingTop: 20,
    paddingBottom: 32,
    gap: 12
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    gap: 8
  },
  title: {
    fontSize: 18,
    fontWeight: "700"
  },
  meta: {
    fontSize: 14,
    color: "#57534E"
  }
});
