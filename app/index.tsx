import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect } from "expo-router";
import { getSession } from "@/src/services/authService";

export default function Index() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    getSession()
      .then(({ data }) => {
        setSignedIn(Boolean(data.session));
      })
      .finally(() => {
        setReady(true);
      });
  }, []);

  if (!ready) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#14213D" />
      </View>
    );
  }

  return <Redirect href={signedIn ? "/(tabs)/dashboard" : "/login"} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC"
  }
});
