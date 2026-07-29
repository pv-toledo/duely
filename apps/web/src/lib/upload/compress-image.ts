"use client";

import { IMAGE_RESIZE_MAX_DIMENSION_PX, WEBP_QUALITY } from "./constraints";

type CompressImageResult = { converted: true; blob: Blob } | { converted: false };

export function withExtension(filename: string, extension: string): string {
  const dotIndex = filename.lastIndexOf(".");
  const base = dotIndex > 0 ? filename.slice(0, dotIndex) : filename;
  return `${base}.${extension}`;
}

export async function compressImageToWebp(file: File): Promise<CompressImageResult> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return { converted: false };
  }
  const scale = Math.min(1, IMAGE_RESIZE_MAX_DIMENSION_PX / Math.max(bitmap.width, bitmap.height));
  const targetWidth = Math.round(bitmap.width * scale);
  const targetHeight = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return { converted: false };
  }

  context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY)
  );

  return blob ? { converted: true, blob } : { converted: false };
}
