import { MIN_IMAGE_DIMENSION_PX } from "./constraints";

type ImageResolutionResult = { checked: true; meetsMinimum: boolean } | { checked: false };

export async function checkImageResolution(file: File): Promise<ImageResolutionResult> {
  if (!file.type.startsWith("image/")) {
    return { checked: false };
  }

  try {
    const bitmap = await createImageBitmap(file);
    const shorterSide = Math.min(bitmap.width, bitmap.height);
    bitmap.close();
    return { checked: true, meetsMinimum: shorterSide >= MIN_IMAGE_DIMENSION_PX };
  } catch {
    return { checked: false };
  }
}
