import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";

// S3/Supabase Storage config from env
/**
 * S3/Supabase Storage config from env
 * Throws an error at module load if any required variable is missing.
 */
const S3_ENDPOINT = process.env.EXPO_PUBLIC_SUPABASE_S3_ENDPOINT;
const S3_ACCESS_KEY_ID = process.env.EXPO_PUBLIC_SUPABASE_S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.EXPO_PUBLIC_SUPABASE_S3_SECRET_ACCESS_KEY;
const S3_BUCKET = process.env.EXPO_PUBLIC_SUPABASE_S3_BUCKET_NAME;
const S3_REGION = process.env.EXPO_PUBLIC_SUPABASE_S3_REGION || "us-east-1";

if (!S3_ENDPOINT) throw new Error("Missing env: SUPABASE_S3_ENDPOINT");
if (!S3_ACCESS_KEY_ID) throw new Error("Missing env: SUPABASE_S3_ACCESS_KEY_ID");
if (!S3_SECRET_ACCESS_KEY) throw new Error("Missing env: SUPABASE_S3_SECRET_ACCESS_KEY");
if (!S3_BUCKET) throw new Error("Missing env: SUPABASE_S3_BUCKET_NAME");

function getS3Config() {
  return {
    endpoint: S3_ENDPOINT,
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
    bucket: S3_BUCKET,
    region: S3_REGION,
  };
}

function getS3Client() {
  const {
    endpoint,
    accessKeyId,
    secretAccessKey,
    bucket,
    region,
  } = getS3Config();

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("Missing Supabase S3 storage environment variables");
  }

  return {
    s3Client: new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    }),
    bucket,
  };
}

/**
 * Upload a file buffer to Supabase S3 storage.
 * @param buffer File buffer (e.g. from React Native FS or Node)
 * @param key S3 object key (path/filename)
 * @param mimeType MIME type of the file
 * @returns The S3 key of the uploaded file
 */
/**
 * Upload a file buffer to Supabase S3 storage.
 * @param buffer File buffer (ArrayBuffer or Uint8Array, compatible with React Native and Node)
 * @param key S3 object key (path/filename)
 * @param mimeType MIME type of the file
 * @returns The S3 key of the uploaded file
 */
export async function uploadFile(
  buffer: Uint8Array | ArrayBuffer,
  key: string,
  mimeType: string
): Promise<string> {
  const { s3Client, bucket } = getS3Client();
  // Ensure buffer is a Uint8Array for AWS SDK compatibility
  const body =
    buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: mimeType,
  });
  await s3Client.send(command);
  return key;
}

/**
 * Get a signed URL for a file in Supabase S3 storage.
 * @param key S3 object key
 * @param expiresInSeconds Expiration in seconds (default: 1 hour)
 * @returns Signed URL string
 */
export async function getSignedUrlForKey(
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  const { s3Client, bucket } = getS3Client();
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Delete a file from Supabase S3 storage.
 * @param key S3 object key
 */
export async function deleteFile(key: string): Promise<void> {
  const { s3Client, bucket } = getS3Client();
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  await s3Client.send(command);
}

/**
 * Download an image from a URL to a Buffer.
 * @param url Image URL
 * @returns Buffer with image data
 */
/**
 * Download an image from a URL to a Uint8Array.
 * @param url Image URL
 * @returns Uint8Array with image data
 */
export async function downloadImageToBuffer(url: string): Promise<Uint8Array> {
  const maxAttempts = 3;
  const timeout = 20000;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await axios.get(url, { responseType: "arraybuffer", timeout });
      if (res.status !== 200) {
        throw new Error(
          `Failed to download image: ${url} (status: ${res.status})`
        );
      }
      const buffer = new Uint8Array(res.data);
      if (!buffer || buffer.length === 0) {
        throw new Error(`Downloaded image is empty: ${url}`);
      }
      return buffer;
    } catch (error) {
      lastError = error;
      let errorMsg = "";
      if (typeof error === "object" && error !== null && "message" in error) {
        errorMsg = (error as any).message;
      } else {
        errorMsg = String(error);
      }
      console.warn(
        `⚠️ Attempt ${attempt} to download image failed: ${url} - ${errorMsg}`
      );
      if (attempt < maxAttempts) {
        await new Promise((res) => setTimeout(res, 1000));
      }
    }
  }
  throw new Error(
    `Failed to download image after ${maxAttempts} attempts: ${url} - ${
      lastError?.message || lastError
    }`
  );
}
