import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { createSprayTeam } from "@/src/services/fieldService";

export default function AdminScreen() {
  const [teamName, setTeamName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [teamPhone, setTeamPhone] = useState("");
  const [savingTeam, setSavingTeam] = useState(false);

  async function handleCreateTeam() {
    if (!teamName.trim()) {
      Alert.alert("입력 확인", "방제팀명은 필수입니다.");
      return;
    }

    setSavingTeam(true);

    try {
      const { error } = await createSprayTeam({
        team_name: teamName.trim(),
        manager_name: managerName.trim() || null,
        phone: teamPhone.trim() || null
      });

      if (error) {
        throw error;
      }

      setTeamName("");
      setManagerName("");
      setTeamPhone("");
      Alert.alert("저장 완료", "방제팀이 등록되었습니다.");
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>방제팀 등록</Text>
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
            {savingTeam ? "방제팀 저장 중..." : "방제팀 저장"}
          </Text>
        </Pressable>
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
  }
});
