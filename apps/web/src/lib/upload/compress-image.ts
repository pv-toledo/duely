"use client";

import { IMAGE_RESIZE_MAX_DIMENSION_PX, WEBP_QUALITY } from "./constraints";

type CompressImageResult = { converted: true; blob: Blob } | { converted: false };

export async function compressImageToWebp(
  file: File,
  originalWidth: number,
  originalHeight: number
): Promise<CompressImageResult> {
  const scale = Math.min(
    1,
    IMAGE_RESIZE_MAX_DIMENSION_PX / Math.max(originalWidth, originalHeight)
  );
  const targetWidth = Math.round(originalWidth * scale);
  const targetHeight = Math.round(originalHeight * scale);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, {
      resizeWidth: targetWidth,
      resizeHeight: targetHeight,
      resizeQuality: "medium",
    });
  } catch {
    return { converted: false };
  }

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
