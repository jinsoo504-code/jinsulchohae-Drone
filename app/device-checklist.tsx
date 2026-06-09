import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { env } from "@/src/lib/env";

type ChecklistItem = {
  id: string;
  title: string;
  detail: string;
};

type ChecklistRecord = {
  checked: boolean;
  checkedAt: string | null;
};

type ChecklistState = Record<string, ChecklistRecord>;

const STORAGE_KEY = "drone-device-checklist-v1";

const CHECKLIST: ChecklistItem[] = [
  {
    id: "sample-login",
    title: "샘플 모드 진입",
    detail: "로그인 화면에서 샘플 데이터로 둘러보기를 눌러 대시보드로 이동합니다."
  },
  {
    id: "dashboard",
    title: "대시보드 확인",
    detail: "오늘 작업 현황 카드와 상태별 건수가 보이는지 확인합니다."
  },
  {
    id: "map",
    title: "지도/필지 선택",
    detail: "지도 탭에서 필지 선택 후 하단 상세 카드가 바뀌는지 확인합니다."
  },
  {
    id: "job-status",
    title: "상태 변경",
    detail: "필지 상세에서 방제 시작, 완료, 문제 발생 상태가 목록/대시보드에 반영되는지 확인합니다."
  },
  {
    id: "photo",
    title: "사진 선택",
    detail: "필지 상세에서 사진 업로드를 눌러 사진을 선택하고 완료 사진 목록에 표시되는지 확인합니다."
  },
  {
    id: "team",
    title: "방제팀 관리",
    detail: "관리자 화면에서 방제팀 저장, 목록 확인, 수정 저장을 확인합니다."
  },
  {
    id: "field",
    title: "필지 등록",
    detail: "농가 검색/신규 입력, 현재 위치 좌표, 임시 필지 생성, 팀 배정 후 저장 흐름을 확인합니다."
  },
  {
    id: "supabase",
    title: "Supabase 연결 점검",
    detail: "실제 .env 설정 후 관리자 화면의 연결 점검에서 핵심 테이블이 정상으로 표시되는지 확인합니다."
  }
];

export default function DeviceChecklistScreen() {
  const [checkState, setCheckState] = useState<ChecklistState>({});
  const [deviceStatus, setDeviceStatus] = useState<string | null>(null);
  const [checkingDevice, setCheckingDevice] = useState(false);
  const completedCount = CHECKLIST.filter((item) => checkState[item.id]?.checked).length;
  const allCompleted = completedCount === CHECKLIST.length;
  const progressText = useMemo(
    () => `${completedCount}/${CHECKLIST.length} 완료`,
    [completedCount]
  );

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((rawValue) => {
        if (rawValue) {
          const parsedValue = JSON.parse(rawValue);

          if (Array.isArray(parsedValue)) {
            setCheckState(
              parsedValue.reduce<ChecklistState>((acc, id) => {
                acc[id] = {
                  checked: true,
                  checkedAt: null
                };
                return acc;
              }, {})
            );
            return;
          }

          setCheckState(parsedValue);
        }
      })
      .catch(() => {
        setCheckState({});
      });
  }, []);

  async function persist(nextState: ChecklistState) {
    setCheckState(nextState);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }

  async function toggleItem(id: string) {
    const current = checkState[id];
    const nextState = {
      ...checkState,
      [id]: {
        checked: !current?.checked,
        checkedAt: current?.checked ? null : new Date().toISOString()
      }
    };

    await persist(nextState);
  }

  async function resetChecklist() {
    await persist({});
  }

  async function checkDeviceReadiness() {
    setCheckingDevice(true);

    try {
      const locationPermission = await Location.requestForegroundPermissionsAsync();
      const photoPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const lines = [
        `위치 권한: ${locationPermission.granted ? "허용됨" : "확인 필요"}`,
        `사진 권한: ${photoPermission.granted ? "허용됨" : "확인 필요"}`,
        `Supabase: ${env.isSupabaseConfigured ? "실제 연결 설정됨" : "샘플 모드"}`
      ];

      setDeviceStatus(lines.join("\n"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "기기 준비 상태를 확인하지 못했습니다.";
      setDeviceStatus(`확인 실패: ${message}`);
    } finally {
      setCheckingDevice(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>갤럭시 실기기 점검</Text>
      <Text style={styles.caption}>
        MVP 현장 흐름을 갤럭시에서 직접 확인하며 완료 표시합니다.
      </Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>점검 진행</Text>
        <Text style={styles.summaryValue}>{progressText}</Text>
        <Text style={styles.summaryHint}>
          {allCompleted
            ? "갤럭시 실기기 MVP 흐름 점검이 모두 완료되었습니다."
            : "각 항목을 완료하면 완료 시간이 함께 저장됩니다."}
        </Text>
      </View>
      <View style={styles.deviceCard}>
        <Text style={styles.deviceTitle}>기기 준비 상태</Text>
        <Text style={styles.deviceDetail}>
          갤럭시에서 위치 권한, 사진 권한, Supabase 연결 모드를 한 번에 확인합니다.
        </Text>
        <Pressable
          style={styles.deviceButton}
          onPress={checkDeviceReadiness}
          disabled={checkingDevice}
        >
          <Text style={styles.deviceButtonText}>
            {checkingDevice ? "확인 중..." : "권한/연결 상태 확인"}
          </Text>
        </Pressable>
        {deviceStatus ? <Text style={styles.deviceStatus}>{deviceStatus}</Text> : null}
      </View>
      {CHECKLIST.map((item) => {
        const record = checkState[item.id];
        const checked = Boolean(record?.checked);

        return (
          <Pressable
            key={item.id}
            style={[styles.itemCard, checked && styles.itemCardDone]}
            onPress={() => toggleItem(item.id)}
          >
            <View style={[styles.checkbox, checked && styles.checkboxDone]}>
              <Text style={[styles.checkboxText, checked && styles.checkboxTextDone]}>
                {checked ? "✓" : ""}
              </Text>
            </View>
            <View style={styles.itemTextBlock}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDetail}>{item.detail}</Text>
              {record?.checkedAt ? (
                <Text style={styles.checkedAt}>
                  완료 시간: {new Date(record.checkedAt).toLocaleString("ko-KR")}
                </Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
      <Pressable style={styles.resetButton} onPress={resetChecklist}>
        <Text style={styles.resetButtonText}>점검표 초기화</Text>
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
  heading: {
    color: "#14213D",
    fontSize: 28,
    fontWeight: "800"
  },
  caption: {
    color: "#57534E",
    fontSize: 15,
    lineHeight: 21
  },
  summaryCard: {
    marginTop: 8,
    backgroundColor: "#14213D",
    borderRadius: 20,
    padding: 18,
    gap: 6
  },
  summaryLabel: {
    color: "#BFDBFE",
    fontSize: 13,
    fontWeight: "800"
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800"
  },
  summaryHint: {
    color: "#DBEAFE",
    fontSize: 13,
    lineHeight: 19
  },
  deviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "#BFDBFE"
  },
  deviceTitle: {
    color: "#14213D",
    fontSize: 17,
    fontWeight: "800"
  },
  deviceDetail: {
    color: "#57534E",
    fontSize: 13,
    lineHeight: 19
  },
  deviceButton: {
    backgroundColor: "#E0F2FE",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center"
  },
  deviceButtonText: {
    color: "#075985",
    fontWeight: "800"
  },
  deviceStatus: {
    color: "#1C1917",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700"
  },
  itemCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 2,
    borderColor: "transparent"
  },
  itemCardDone: {
    borderColor: "#86EFAC",
    backgroundColor: "#F0FDF4"
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center"
  },
  checkboxDone: {
    backgroundColor: "#16A34A",
    borderColor: "#16A34A"
  },
  checkboxText: {
    color: "#FFFFFF",
    fontWeight: "800"
  },
  checkboxTextDone: {
    color: "#FFFFFF"
  },
  itemTextBlock: {
    flex: 1,
    gap: 5
  },
  itemTitle: {
    color: "#14213D",
    fontSize: 16,
    fontWeight: "800"
  },
  itemDetail: {
    color: "#57534E",
    fontSize: 13,
    lineHeight: 19
  },
  checkedAt: {
    color: "#15803D",
    fontSize: 12,
    fontWeight: "800"
  },
  resetButton: {
    marginTop: 8,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#E7E5E4"
  },
  resetButtonText: {
    color: "#44403C",
    fontWeight: "800"
  }
});
