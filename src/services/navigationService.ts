import * as Linking from "expo-linking";
import { Platform } from "react-native";

export async function openNavigation(latitude: number, longitude: number, label: string) {
  const encodedLabel = encodeURIComponent(label);
  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?ll=${latitude},${longitude}&q=${encodedLabel}`
      : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`;

  const supported = await Linking.canOpenURL(url);

  if (!supported) {
    throw new Error("내비게이션 앱을 열 수 없습니다.");
  }

  await Linking.openURL(url);
}
