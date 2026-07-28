import { imageSize } from "image-size";
import { MIN_IMAGE_DIMENSION_PX } from "./constraints";

type ServerResolutionResult =
  | { outcome: "not_applicable" } // PDF
  | { outcome: "meets_minimum" }
  | { outcome: "below_minimum" }
  | { outcome: "unreadable" };

export async function checkImageResolutionServer(file: File): Promise<ServerResolutionResult> {
  if (!file.type.startsWith("image/")) {
    return { outcome: "not_applicable" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let dimensions: { width?: number; height?: number };
  try {
    dimensions = imageSize(buffer);
  } catch {
    return { outcome: "unreadable" };
  }

  if (!dimensions.width || !dimensions.height) {
    return { outcome: "unreadable" };
  }

  const shorterSide = Math.min(dimensions.width, dimensions.height);
  return shorterSide >= MIN_IMAGE_DIMENSION_PX
    ? { outcome: "meets_minimum" }
    : { outcome: "below_minimum" };
}
