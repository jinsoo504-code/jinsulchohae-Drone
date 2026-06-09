import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { env } from "@/src/lib/env";
import { signIn } from "@/src/services/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("로그인 확인", "이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(email.trim(), password);

      if (error) {
        throw error;
      }

      router.replace("/(tabs)/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "로그인에 실패했습니다.";
      Alert.alert("로그인 실패", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>드론방제팀 로그인</Text>
      <Text style={styles.caption}>Supabase Auth 계정으로 로그인합니다.</Text>
      {!env.isSupabaseConfigured ? (
        <View style={styles.sampleNotice}>
          <Text style={styles.sampleNoticeTitle}>샘플 모드 사용 가능</Text>
          <Text style={styles.sampleNoticeText}>
            Supabase 연결 전에도 갤럭시에서 화면 흐름을 먼저 확인할 수 있습니다.
          </Text>
        </View>
      ) : null}
      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "로그인 중..." : "로그인"}</Text>
      </Pressable>
      {!env.isSupabaseConfigured ? (
        <Pressable
          style={styles.sampleButton}
          onPress={() => router.replace("/(tabs)/dashboard")}
          disabled={loading}
        >
          <Text style={styles.sampleButtonText}>샘플 데이터로 둘러보기</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    justifyContent: "center",
    gap: 12
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#14213D"
  },
  caption: {
    marginBottom: 16,
    fontSize: 15,
    color: "#57534E"
  },
  sampleNotice: {
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: "#FDE68A"
  },
  sampleNoticeTitle: {
    color: "#92400E",
    fontSize: 14,
    fontWeight: "800"
  },
  sampleNoticeText: {
    color: "#92400E",
    fontSize: 13,
    lineHeight: 19
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15
  },
  button: {
    marginTop: 12,
    backgroundColor: "#14213D",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center"
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16
  },
  sampleButton: {
    backgroundColor: "#E0F2FE",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center"
  },
  sampleButtonText: {
    color: "#075985",
    fontWeight: "800",
    fontSize: 16
  }
});
