import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import {
  SupabaseHealthCheck,
  checkSupabaseConnection,
  createSprayTeam,
  fetchSprayTeams,
  updateSprayTeam
} from "@/src/services/fieldService";
import { SprayTeam } from "@/src/types/domain";

export default function AdminScreen() {
  const [teams, setTeams] = useState<SprayTeam[]>([]);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [teamPhone, setTeamPhone] = useState("");
  const [savingTeam, setSavingTeam] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [healthCheck, setHealthCheck] = useState<SupabaseHealthCheck | null>(null);

  useEffect(() => {
    refreshTeams();
  }, []);

  async function refreshTeams() {
    setLoadingTeams(true);

    try {
      const nextTeams = await fetchSprayTeams();
      setTeams(nextTeams);
    } catch {
      setTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  }

  function resetTeamForm() {
    setEditingTeamId(null);
    setTeamName("");
    setManagerName("");
    setTeamPhone("");
  }

  function handleEditTeam(team: SprayTeam) {
    setEditingTeamId(team.id);
    setTeamName(team.team_name);
    setManagerName(team.manager_name ?? "");
    setTeamPhone(team.phone ?? "");
  }

  async function handleCheckConnection() {
    setCheckingConnection(true);

    try {
      const result = await checkSupabaseConnection();
      setHealthCheck(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Supabase 연결 점검에 실패했습니다.";
      Alert.alert("연결 점검 실패", message);
    } finally {
      setCheckingConnection(false);
    }
  }

  async function handleCreateTeam() {
    if (!teamName.trim()) {
      Alert.alert("입력 확인", "방제팀명은 필수입니다.");
      return;
    }

    setSavingTeam(true);

    try {
      const payload = {
        team_name: teamName.trim(),
        manager_name: managerName.trim() || null,
        phone: teamPhone.trim() || null
      };
      const { error } = editingTeamId
        ? await updateSprayTeam(editingTeamId, payload)
        : await createSprayTeam(payload);

      if (error) {
        throw error;
      }

      resetTeamForm();
      await refreshTeams();
      Alert.alert("저장 완료", editingTeamId ? "방제팀 정보가 수정되었습니다." : "방제팀이 등록되었습니다.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "방제팀 저장에 실패했습니다.";
      Alert.alert("저장 실패", message);
    } finally {
      setSavingTeam(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>관리자 화면</Text>
      <Text style={styles.caption}>농가, 필지, 팀, 작업 배정 관리의 시작점입니다.</Text>
      <Pressable style={styles.button} onPress={() => router.push("/field/new")}>
        <Text style={styles.buttonText}>필지 등록 시작</Text>
      </Pressable>
      <Pressable
        style={styles.checklistButton}
        onPress={() => router.push("/device-checklist" as never)}
      >
        <Text style={styles.checklistButtonText}>갤럭시 실기기 점검표 열기</Text>
      </Pressable>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>Supabase 연결 점검</Text>
            <Text style={styles.sectionCaption}>
              실제 프로젝트 연결 후 필수 테이블 접근 여부를 확인합니다.
            </Text>
          </View>
          <Pressable
            style={styles.refreshButton}
            onPress={handleCheckConnection}
            disabled={checkingConnection}
          >
            <Text style={styles.refreshButtonText}>
              {checkingConnection ? "점검 중" : "점검"}
            </Text>
          </Pressable>
        </View>
        {healthCheck ? (
          <View style={styles.healthBox}>
            <Text style={styles.healthSummary}>
              {healthCheck.configured ? "Supabase 환경변수 있음" : "Supabase 환경변수 미설정"}
            </Text>
            <Text style={styles.healthTime}>
              마지막 점검: {new Date(healthCheck.checkedAt).toLocaleString("ko-KR")}
            </Text>
            {healthCheck.tables.map((table) => (
              <View key={table.name} style={styles.healthRow}>
                <Text style={styles.healthTableName}>{table.name}</Text>
                <Text style={[styles.healthStatus, table.ok ? styles.healthOk : styles.healthFail]}>
                  {table.ok ? `정상 ${table.count ?? 0}건` : "확인 필요"}
                </Text>
                {table.message ? <Text style={styles.healthMessage}>{table.message}</Text> : null}
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>아직 연결 점검을 실행하지 않았습니다.</Text>
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{editingTeamId ? "방제팀 수정" : "방제팀 등록"}</Text>
        <Text style={styles.sectionCaption}>
          등록한 팀은 필지 등록 화면에서 바로 작업 담당팀으로 선택할 수 있습니다.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="방제팀명 예: 1팀"
          value={teamName}
          onChangeText={setTeamName}
        />
        <TextInput
          style={styles.input}
          placeholder="담당자명"
          value={managerName}
          onChangeText={setManagerName}
        />
        <TextInput
          style={styles.input}
          placeholder="팀 연락처"
          keyboardType="phone-pad"
          value={teamPhone}
          onChangeText={setTeamPhone}
        />
        <Pressable style={styles.secondaryButton} onPress={handleCreateTeam} disabled={savingTeam}>
          <Text style={styles.secondaryButtonText}>
            {savingTeam ? "방제팀 저장 중..." : editingTeamId ? "방제팀 수정 저장" : "방제팀 저장"}
          </Text>
        </Pressable>
        {editingTeamId ? (
          <Pressable style={styles.cancelButton} onPress={resetTeamForm} disabled={savingTeam}>
            <Text style={styles.cancelButtonText}>수정 취소</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>방제팀 목록</Text>
            <Text style={styles.sectionCaption}>팀을 눌러 담당자와 연락처를 수정합니다.</Text>
          </View>
          <Pressable style={styles.refreshButton} onPress={refreshTeams} disabled={loadingTeams}>
            <Text style={styles.refreshButtonText}>{loadingTeams ? "확인 중" : "새로고침"}</Text>
          </Pressable>
        </View>
        {teams.length === 0 ? (
          <Text style={styles.emptyText}>등록된 방제팀이 없거나 Supabase 연결 전입니다.</Text>
        ) : (
          teams.map((team) => (
            <Pressable
              key={team.id}
              style={[styles.teamCard, editingTeamId === team.id && styles.teamCardActive]}
              onPress={() => handleEditTeam(team)}
            >
              <Text style={styles.teamName}>{team.team_name}</Text>
              <Text style={styles.teamMeta}>담당자: {team.manager_name ?? "미입력"}</Text>
              <Text style={styles.teamMeta}>연락처: {team.phone ?? "미입력"}</Text>
            </Pressable>
          ))
        )}
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
    paddingBottom: 40
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
  button: {
    marginTop: 24,
    backgroundColor: "#14213D",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center"
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700"
  },
  checklistButton: {
    marginTop: 12,
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center"
  },
  checklistButtonText: {
    color: "#166534",
    fontWeight: "800"
  },
  section: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    gap: 12
  },
  sectionTitle: {
    color: "#14213D",
    fontSize: 18,
    fontWeight: "800"
  },
  sectionCaption: {
    color: "#57534E",
    fontSize: 14,
    lineHeight: 20
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15
  },
  secondaryButton: {
    backgroundColor: "#E0F2FE",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: "#075985",
    fontWeight: "800"
  },
  cancelButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#F5F5F4"
  },
  cancelButtonText: {
    color: "#57534E",
    fontWeight: "800"
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start"
  },
  sectionHeaderText: {
    flex: 1,
    gap: 4
  },
  refreshButton: {
    borderRadius: 999,
    backgroundColor: "#E7E5E4",
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  refreshButtonText: {
    color: "#44403C",
    fontWeight: "800",
    fontSize: 12
  },
  emptyText: {
    color: "#B45309",
    fontSize: 13,
    fontWeight: "700"
  },
  healthBox: {
    gap: 10
  },
  healthSummary: {
    color: "#14213D",
    fontSize: 15,
    fontWeight: "800"
  },
  healthTime: {
    color: "#57534E",
    fontSize: 12
  },
  healthRow: {
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    padding: 12,
    gap: 4
  },
  healthTableName: {
    color: "#1C1917",
    fontSize: 14,
    fontWeight: "800"
  },
  healthStatus: {
    fontSize: 13,
    fontWeight: "800"
  },
  healthOk: {
    color: "#15803D"
  },
  healthFail: {
    color: "#B45309"
  },
  healthMessage: {
    color: "#57534E",
    fontSize: 12,
    lineHeight: 17
  },
  teamCard: {
    borderRadius: 16,
    padding: 14,
    gap: 5,
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "transparent"
  },
  teamCardActive: {
    borderColor: "#14213D"
  },
  teamName: {
    color: "#14213D",
    fontSize: 16,
    fontWeight: "800"
  },
  teamMeta: {
    color: "#57534E",
    fontSize: 13
  }
});
