const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables are missing. Copy .env.example to .env before running the app."
  );
}

export const env = {
  supabaseUrl: supabaseUrl ?? "",
  supabaseAnonKey: supabaseAnonKey ?? "",
  naverMapClientId: process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID ?? "",
  kakaoMapAppKey: process.env.EXPO_PUBLIC_KAKAO_MAP_APP_KEY ?? ""
};
