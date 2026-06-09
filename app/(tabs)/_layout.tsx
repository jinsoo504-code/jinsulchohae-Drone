import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#14213D",
        tabBarInactiveTintColor: "#78716C"
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "대시보드",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "지도",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: "작업목록",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "관리",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          )
        }}
      />
    </Tabs>
  );
}
