import * as ImagePicker from "expo-image-picker";
import { getSignedUrlForKey, uploadFile } from "./supabaseS3Storage";

/**
 * Picks an image using expo-image-picker, uploads it to Supabase S3 storage, and returns a signed URL.
 * @param chatId string - used for key organization
 * @param userId string - user uploading the image
 * @returns {Promise<string|undefined>} - Signed URL of the image, or undefined if cancelled or error
 */
export async function pickAndUploadChatImageS3(chatId: string, userId: string): Promise<string | undefined> {
  try {
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: false,
    });
    if (pickerResult.canceled || !pickerResult.assets?.[0]?.uri) {
      console.log("Image picking canceled/invalid");
      return undefined;
    }
    const imageAsset = pickerResult.assets[0];
    let uri = imageAsset.uri;
    // Get file extension
    const fileExt = uri.split(".").pop() || "jpg";
    const key = `chats/${chatId}/${Date.now()}.${fileExt}`;
    // Get array buffer from fetch response (React Native safe)
    const resp = await fetch(uri);
    const buffer = await resp.arrayBuffer();
    // Try to determine MIME from asset or ext, fallback to image/jpeg
    const mimeType = imageAsset.mimeType || "image/jpeg";
    await uploadFile(buffer, key, mimeType);
    // Get signed URL for the image
    const url = await getSignedUrlForKey(key, 7 * 24 * 60 * 60); // 7d expiration
    return url;
  } catch (err) {
    console.error("Image upload to Supabase S3 error:", err);
    return undefined;
  }
}
