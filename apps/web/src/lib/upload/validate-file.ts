import { ALLOWED_MIME_TYPES, MAX_RAW_INPUT_SIZE_BYTES, MAX_UPLOAD_SIZE_BYTES } from "./constraints";

type FileValidationResult =
  { valid: true } | { valid: false; reason: "invalid_type" | "file_too_large" };

export function validateFileTypeAndSize(
  file: File | Blob,
  maxSizeBytes: number
): FileValidationResult {
  const isAllowedType = ALLOWED_MIME_TYPES.includes(
    file.type as (typeof ALLOWED_MIME_TYPES)[number]
  );

  if (!isAllowedType) {
    return { valid: false, reason: "invalid_type" };
  }

  if (file.size > maxSizeBytes) {
    return { valid: false, reason: "file_too_large" };
  }

  return { valid: true };
}

export function getRawInputSizeCeiling(file: File): number {
  return file.type === "application/pdf" ? MAX_UPLOAD_SIZE_BYTES : MAX_RAW_INPUT_SIZE_BYTES;
}
