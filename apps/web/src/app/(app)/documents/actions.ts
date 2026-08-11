"use server";

import { createClient } from "@/lib/supabase/server";
import { checkImageResolutionServer } from "@/lib/upload/check-image-resolution-server";
import { convertHeicToWebp } from "@/lib/upload/convert-heic";
import {
  MAX_RAW_INPUT_SIZE_BYTES,
  MAX_UPLOAD_SIZE_BYTES,
  MIME_TO_EXTENSION,
  MIN_IMAGE_DIMENSION_PX,
} from "@/lib/upload/constraints";
import { validateFileTypeAndSize } from "@/lib/upload/validate-file";

export type UploadFailureReason =
  | "not_authenticated"
  | "invalid_type"
  | "file_too_large"
  | "image_too_small"
  | "unreadable_image"
  | "upload_failed"
  | "insert_failed";

type UploadDocumentResult =
  { success: true; documentId: string } | { success: false; reason: UploadFailureReason };

export async function uploadDocumentAction(file: File): Promise<UploadDocumentResult> {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData) {
    return { success: false, reason: "not_authenticated" };
  }
  const userId = claimsData.claims.sub;

  const typeAndSize = validateFileTypeAndSize(file, MAX_UPLOAD_SIZE_BYTES);
  if (!typeAndSize.valid) {
    return { success: false, reason: typeAndSize.reason };
  }

  const resolution = await checkImageResolutionServer(file);
  if (resolution.outcome === "unreadable") {
    return { success: false, reason: "unreadable_image" };
  }
  if (resolution.outcome === "below_minimum") {
    return { success: false, reason: "image_too_small" };
  }

  const documentId = crypto.randomUUID();
  const extension = MIME_TO_EXTENSION[file.type as keyof typeof MIME_TO_EXTENSION];
  const storagePath = `${userId}/${documentId}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) {
    return { success: false, reason: "upload_failed" };
  }

  const { error: insertError } = await supabase.from("documents").insert({
    id: documentId,
    user_id: userId,
    storage_path: storagePath,
    original_filename: file.name,
    mime_type: file.type,
  });

  if (insertError) {
    await supabase.storage.from("documents").remove([storagePath]);
    return { success: false, reason: "insert_failed" };
  }

  return { success: true, documentId };
}

export async function deleteDocumentAction(
  documentId: string
): Promise<{ success: true } | { success: false; reason: "not_authenticated" | "delete_failed" }> {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData) {
    return { success: false, reason: "not_authenticated" };
  }

  const { data: deletedDocument, error: deleteError } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .select("storage_path")
    .single();

  if (deleteError || !deletedDocument) {
    return { success: false, reason: "delete_failed" };
  }

  await supabase.storage.from("documents").remove([deletedDocument.storage_path]);

  return { success: true };
}

export type ConvertHeicFailureReason =
  | "not_authenticated"
  | "not_found"
  | "file_too_large"
  | "conversion_failed"
  | "image_too_small"
  | "upload_failed"
  | "insert_failed";

type ConvertHeicResult =
  { success: true; documentId: string } | { success: false; reason: ConvertHeicFailureReason };

export async function confirmHeicUploadAction(input: {
  documentId: string;
  storagePath: string;
  originalFilename: string;
}): Promise<ConvertHeicResult> {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData) {
    return { success: false, reason: "not_authenticated" };
  }
  const userId = claimsData.claims.sub;

  if (!input.storagePath.startsWith(`${userId}/`)) {
    return { success: false, reason: "not_authenticated" };
  }

  const { data: rawBlob, error: downloadError } = await supabase.storage
    .from("documents")
    .download(input.storagePath);

  if (downloadError || !rawBlob) {
    return { success: false, reason: "not_found" };
  }

  if (rawBlob.size > MAX_RAW_INPUT_SIZE_BYTES) {
    await supabase.storage.from("documents").remove([input.storagePath]);
    return { success: false, reason: "file_too_large" };
  }

  const rawBuffer = Buffer.from(await rawBlob.arrayBuffer());

  // A partir daqui, o arquivo cru já está em memória -- a cópia no Storage
  // não tem mais utilidade, seja qual for o resultado da conversão.
  await supabase.storage.from("documents").remove([input.storagePath]);

  let converted: { buffer: Buffer; width: number; height: number };
  try {
    converted = await convertHeicToWebp(rawBuffer);
  } catch {
    return { success: false, reason: "conversion_failed" };
  }

  const shorterSide = Math.min(converted.width, converted.height);
  if (shorterSide < MIN_IMAGE_DIMENSION_PX) {
    return { success: false, reason: "image_too_small" };
  }

  const webpStoragePath = `${userId}/${input.documentId}.webp`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(webpStoragePath, converted.buffer, { contentType: "image/webp" });

  if (uploadError) {
    return { success: false, reason: "upload_failed" };
  }

  const { error: insertError } = await supabase.from("documents").insert({
    id: input.documentId,
    user_id: userId,
    storage_path: webpStoragePath,
    original_filename: input.originalFilename,
    mime_type: "image/webp",
  });

  if (insertError) {
    await supabase.storage.from("documents").remove([webpStoragePath]);
    return { success: false, reason: "insert_failed" };
  }

  return { success: true, documentId: input.documentId };
}
