import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { sampleFields } from "@/src/mocks/sampleData";
import { StatusChip } from "@/src/components/StatusChip";
import { JOB_STATUS_LABELS } from "@/src/constants/status";
import { openNavigation } from "@/src/services/navigationService";
import { updateJobStatus } from "@/src/services/fieldService";
import { pickCompletionPhoto, uploadJobPhoto } from "@/src/services/photoService";
import { getSession } from "@/src/services/authService";
import { JobStatus } from "@/src/types/domain";
import { useFields } from "@/src/hooks/useFields";

export default function FieldDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fields, refresh } = useFields();
  const field = useMemo(
    () => fields.find((item) => item.field.id === id) ?? sampleFields[0],
    [fields, id]
  );
  const [status, setStatus] = useState(field.job?.status ?? "pending");
  const [busy, setBusy] = useState(false);

  async function handleStatusChange(nextStatus: JobStatus) {
    setStatus(nextStatus);

    if (!field.job?.id || field.job.id.startsWith("job-")) {
      return;
    }

    setBusy(true);

    try {
      const { data } = await getSession();
      await updateJobStatus(field.job.id, nextStatus, data.session?.user.id);
      await refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "상태 변경에 실패했습니다.";
      Alert.alert("상태 변경 실패", message);
    } finally {
      setBusy(false);
    }
  }

  async function handlePhotoUpload() {
    if (!field.job?.id || field.job.id.startsWith("job-")) {
      Alert.alert("Supabase 연결 필요", "실제 작업 데이터가 연결되면 사진 업로드가 저장됩니다.");
      return;
    }

    setBusy(true);

    try {
      const photo = await pickCompletionPhoto();

      if (!photo) {
        return;
      }

      const { data } = await getSession();
      await uploadJobPhoto(field.job.id, photo.uri, data.session?.user.id);
      await handleStatusChange("completed");
      Alert.alert("업로드 완료", "완료 사진이 저장되었습니다.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "사진 업로드에 실패했습니다.";
      Alert.alert("사진 업로드 실패", message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{field.field.field_name}</Text>
      <Text style={styles.subtitle}>{field.farmer?.name ?? "농가 미지정"}</Text>
      <StatusChip status={status} />
      <View style={styles.section}>
        <Text style={styles.label}>주소</Text>
        <Text style={styles.value}>{field.field.address ?? "주소 미입력"}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>작물명</Text>
        <Text style={styles.value}>{field.field.crop_name ?? "작물 미입력"}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>담당팀</Text>
        <Text style={styles.value}>{field.team?.team_name ?? "배정 전"}</Text>
      </View>
      <Pressable
        style={styles.primaryButton}
        onPress={() =>
          openNavigation(field.field.center_lat, field.field.center_lng, field.field.field_name)
        }
      >
        <Text style={styles.primaryButtonText}>내비게이션 열기</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryButton}
        onPress={() => handleStatusChange("in_progress")}
        disabled={busy}
      >
        <Text style={styles.secondaryButtonText}>{busy ? "처리 중..." : "방제 시작"}</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryButton}
        onPress={() => handleStatusChange("completed")}
        disabled={busy}
      >
        <Text style={styles.secondaryButtonText}>방제 완료</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={handlePhotoUpload} disabled={busy}>
        <Text style={styles.secondaryButtonText}>사진 업로드</Text>
      </Pressable>
      <View style={styles.section}>
        <Text style={styles.label}>상태 변경 빠른 선택</Text>
        <View style={styles.statusList}>
          {Object.entries(JOB_STATUS_LABELS).map(([key, label]) => (
            <Pressable
              key={key}
              style={[styles.statusButton, status === key && styles.statusButtonActive]}
              onPress={() => handleStatusChange(key as JobStatus)}
            >
              <Text
                style={[styles.statusButtonText, status === key && styles.statusButtonTextActive]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
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
    gap: 16
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#14213D"
  },
  subtitle: {
    fontSize: 16,
    color: "#57534E"
  },
  section: {
    gap: 6
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#78716C"
  },
  value: {
    fontSize: 16,
    color: "#1C1917"
  },
  primaryButton: {
    backgroundColor: "#14213D",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center"
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700"
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: "#14213D",
    fontWeight: "700"
  },
  statusList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#E7E5E4"
  },
  statusButtonActive: {
    backgroundColor: "#14213D"
  },
  statusButtonText: {
    color: "#44403C",
    fontWeight: "600"
  },
  statusButtonTextActive: {
    color: "#FFFFFF"
  }
});
