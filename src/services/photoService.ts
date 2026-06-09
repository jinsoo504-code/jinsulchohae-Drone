import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { supabase } from "@/src/lib/supabase";

export async function pickCompletionPhoto() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error("사진 접근 권한이 필요합니다.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.7,
    allowsEditing: false
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0] ?? null;
}

export async function uploadJobPhoto(jobId: string, uri: string, uploadedBy?: string) {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64
  });
  const fileName = `${jobId}/${Date.now()}.jpg`;

  const { error: storageError } = await supabase.storage
    .from("spray-photos")
    .upload(fileName, decode(base64), {
      contentType: "image/jpeg",
      upsert: false
    });

  if (storageError) {
    throw storageError;
  }

  const { data } = supabase.storage.from("spray-photos").getPublicUrl(fileName);
  const publicUrl = data.publicUrl;

  const { error: dbError } = await supabase.from("spray_photos").insert({
    job_id: jobId,
    photo_url: publicUrl,
    uploaded_by: uploadedBy ?? null
  });

  if (dbError) {
    throw dbError;
  }

  return publicUrl;
}
