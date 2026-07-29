export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/webp",
  "application/pdf",
] as const;

export const MIME_TO_EXTENSION: Record<(typeof ALLOWED_MIME_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/heic": "heic",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export const MIN_IMAGE_DIMENSION_PX = 1000;

export const MAX_RAW_INPUT_SIZE_BYTES = 50 * 1024 * 1024;

export const MAX_UPLOAD_SIZE_BYTES = 4 * 1024 * 1024;

export const IMAGE_RESIZE_MAX_DIMENSION_PX = 2000;
export const WEBP_QUALITY = 0.85;
