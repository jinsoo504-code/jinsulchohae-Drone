import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
import { useAppStore } from "@/src/store/appStore";

export default function FieldDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fields, refresh } = useFields();
  const field = useMemo(
    () => fields.find((item) => item.field.id === id) ?? sampleFields[0],
    [fields, id]
  );
  const [status, setStatus] = useState(field.job?.status ?? "pending");
  const [busy, setBusy] = useState(false);
  const updateSampleJobStatus = useAppStore((state) => state.updateSampleJobStatus);
  const addSampleJobPhoto = useAppStore((state) => state.addSampleJobPhoto);
  const photos = field.photos ?? [];

  useEffect(() => {
    setStatus(field.job?.status ?? "pending");
  }, [field.job?.status]);

  async function handleStatusChange(nextStatus: JobStatus) {
    setStatus(nextStatus);

    if (!field.job?.id || field.job.id.startsWith("job-")) {
      if (field.job?.id) {
        updateSampleJobStatus(field.job.id, nextStatus);
      }
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
      setBusy(true);

      try {
        const photo = await pickCompletionPhoto();

        if (!photo || !field.job?.id) {
          return;
        }

        addSampleJobPhoto(field.job.id, photo.uri);
        setStatus("completed");
        Alert.alert("샘플 사진 저장", "선택한 사진이 샘플 완료 사진 목록에 추가되었습니다.");
      } catch (error) {
        const message = error instanceof Error ? error.message : "사진 선택에 실패했습니다.";
        Alert.alert("사진 선택 실패", message);
      } finally {
        setBusy(false);
      }

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
      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>작업 예정일</Text>
          <Text style={styles.infoValue}>{field.job?.scheduled_date ?? "미정"}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>완료 사진</Text>
          <Text style={styles.infoValue}>{photos.length}장</Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>작업 메모</Text>
        <Text style={styles.value}>{field.job?.memo ?? field.field.memo ?? "메모 없음"}</Text>
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
      <View style={styles.photoSection}>
        <Text style={styles.photoTitle}>완료 사진 확인</Text>
        {photos.length === 0 ? (
          <Text style={styles.photoEmpty}>아직 업로드된 완료 사진이 없습니다.</Text>
        ) : (
          photos.map((photo, index) => (
            <View key={photo.id} style={styles.photoCard}>
              <Image source={{ uri: photo.photo_url }} style={styles.photoThumb} />
              <View style={styles.photoTextBlock}>
                <Text style={styles.photoName}>사진 {index + 1}</Text>
                <Text style={styles.photoMeta}>
                  {new Date(photo.uploaded_at).toLocaleString("ko-KR")}
                </Text>
              </View>
              <Pressable
                style={styles.photoButton}
                onPress={() => Linking.openURL(photo.photo_url)}
              >
                <Text style={styles.photoButtonText}>열기</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
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
  infoGrid: {
    flexDirection: "row",
    gap: 10
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    gap: 6
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#78716C"
  },
  infoValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#14213D"
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
  photoSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    gap: 10
  },
  photoTitle: {
    color: "#14213D",
    fontSize: 18,
    fontWeight: "800"
  },
  photoEmpty: {
    color: "#78716C",
    fontSize: 14
  },
  photoCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    padding: 12
  },
  photoThumb: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: "#E7E5E4"
  },
  photoTextBlock: {
    flex: 1,
    gap: 4
  },
  photoName: {
    color: "#1C1917",
    fontSize: 15,
    fontWeight: "800"
  },
  photoMeta: {
    color: "#57534E",
    fontSize: 12
  },
  photoButton: {
    backgroundColor: "#E0F2FE",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9
  },
  photoButtonText: {
    color: "#075985",
    fontWeight: "800"
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
