"use server";

import { createClient } from "@/lib/supabase/server";
import { checkImageResolutionServer } from "@/lib/upload/check-image-resolution-server";
import { MIME_TO_EXTENSION } from "@/lib/upload/constraints";
import { validateFileTypeAndSize } from "@/lib/upload/validate-file";

type UploadDocumentResult =
  | { success: true; documentId: string }
  | {
      success: false;
      reason:
        | "not_authenticated"
        | "invalid_type"
        | "file_too_large"
        | "image_too_small"
        | "unreadable_image"
        | "upload_failed"
        | "insert_failed";
    };

export async function uploadDocumentAction(file: File): Promise<UploadDocumentResult> {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData) {
    return { success: false, reason: "not_authenticated" };
  }
  const userId = claimsData.claims.sub;

  const typeAndSize = validateFileTypeAndSize(file);
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
