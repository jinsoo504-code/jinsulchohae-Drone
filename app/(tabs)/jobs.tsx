import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { StatusChip } from "@/src/components/StatusChip";
import { JOB_STATUS_LABELS } from "@/src/constants/status";
import { useFields } from "@/src/hooks/useFields";
import { FieldWithRelations, JobStatus } from "@/src/types/domain";

type JobFilter = "all" | "today" | JobStatus;

const FILTERS: { key: JobFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "today", label: "오늘" },
  { key: "pending", label: "예정" },
  { key: "in_progress", label: "진행" },
  { key: "completed", label: "완료" },
  { key: "issue", label: "문제" }
];

function isTodayJob(item: FieldWithRelations) {
  const today = new Date().toISOString().slice(0, 10);
  return item.job?.scheduled_date === today;
}

export default function JobsScreen() {
  const { fields, errorMessage } = useFields();
  const [filter, setFilter] = useState<JobFilter>("today");
  const todayCount = fields.filter(isTodayJob).length;
  const activeCount = fields.filter((item) => item.job?.status === "in_progress").length;
  const issueCount = fields.filter((item) => item.job?.status === "issue").length;
  const filteredFields = useMemo(() => {
    if (filter === "all") {
      return fields;
    }

    if (filter === "today") {
      return fields.filter(isTodayJob);
    }

    return fields.filter((item) => (item.job?.status ?? "pending") === filter);
  }, [fields, filter]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>작업 목록</Text>
      <Text style={styles.caption}>오늘 처리할 필지와 문제 현장을 빠르게 확인합니다.</Text>
      {errorMessage ? <Text style={styles.notice}>Supabase 연결 전 샘플 데이터입니다.</Text> : null}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCount}>{todayCount}</Text>
          <Text style={styles.summaryLabel}>오늘 작업</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCount}>{activeCount}</Text>
          <Text style={styles.summaryLabel}>진행 중</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryCount, issueCount > 0 && styles.issueText]}>
            {issueCount}
          </Text>
          <Text style={styles.summaryLabel}>문제 현장</Text>
        </View>
      </View>
      <View style={styles.filterRow}>
        {FILTERS.map((item) => (
          <Pressable
            key={item.key}
            style={[styles.filterButton, filter === item.key && styles.filterButtonActive]}
            onPress={() => setFilter(item.key)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === item.key && styles.filterButtonTextActive
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={filteredFields}
        keyExtractor={(item) => item.field.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>해당 조건의 작업이 없습니다.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/field/${item.field.id}`)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleBlock}>
                <Text style={styles.title}>{item.field.field_name}</Text>
                <Text style={styles.meta}>{item.farmer?.name ?? "농가 미지정"}</Text>
              </View>
              <StatusChip status={item.job?.status ?? "pending"} />
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>예정일</Text>
              <Text style={styles.infoValue}>{item.job?.scheduled_date ?? "미정"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>담당팀</Text>
              <Text style={styles.infoValue}>{item.team?.team_name ?? "배정 전"}</Text>
            </View>
            <Text style={styles.address}>{item.field.address ?? "주소 미입력"}</Text>
            <Text style={styles.detailHint}>
              {JOB_STATUS_LABELS[item.job?.status ?? "pending"]} · 눌러서 상세/상태 변경
            </Text>
          </Pressable>
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
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    gap: 4
  },
  summaryCount: {
    fontSize: 26,
    fontWeight: "800",
    color: "#14213D"
  },
  summaryLabel: {
    fontSize: 12,
    color: "#57534E",
    fontWeight: "700"
  },
  issueText: {
    color: "#DC2626"
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 18
  },
  filterButton: {
    borderRadius: 999,
    backgroundColor: "#E7E5E4",
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  filterButtonActive: {
    backgroundColor: "#14213D"
  },
  filterButtonText: {
    color: "#44403C",
    fontWeight: "700"
  },
  filterButtonTextActive: {
    color: "#FFFFFF"
  },
  list: {
    paddingTop: 16,
    paddingBottom: 32,
    gap: 12
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    gap: 8
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  cardTitleBlock: {
    flex: 1,
    gap: 4
  },
  title: {
    fontSize: 18,
    fontWeight: "700"
  },
  meta: {
    fontSize: 14,
    color: "#57534E"
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  infoLabel: {
    fontSize: 13,
    color: "#78716C",
    fontWeight: "700"
  },
  infoValue: {
    fontSize: 13,
    color: "#1C1917",
    fontWeight: "700"
  },
  address: {
    fontSize: 14,
    color: "#57534E"
  },
  detailHint: {
    marginTop: 4,
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "700"
  },
  emptyText: {
    paddingVertical: 32,
    textAlign: "center",
    color: "#78716C",
    fontWeight: "700"
  }
});
