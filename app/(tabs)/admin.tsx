import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

export default function AdminScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>관리자 화면</Text>
      <Text style={styles.caption}>농가, 필지, 팀, 작업 배정 관리의 시작점입니다.</Text>
      <Pressable style={styles.button} onPress={() => router.push("/field/new")}>
        <Text style={styles.buttonText}>필지 등록 시작</Text>
      </Pressable>
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
  }
});
