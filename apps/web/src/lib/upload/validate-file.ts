import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "./constraints";

type FileValidationResult =
  { valid: true } | { valid: false; reason: "invalid_type" | "file_too_large" };

export function validateFileTypeAndSize(file: File): FileValidationResult {
  const isAllowedType = ALLOWED_MIME_TYPES.includes(
    file.type as (typeof ALLOWED_MIME_TYPES)[number]
  );

  if (!isAllowedType) {
    return { valid: false, reason: "invalid_type" };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, reason: "file_too_large" };
  }

  return { valid: true };
}
