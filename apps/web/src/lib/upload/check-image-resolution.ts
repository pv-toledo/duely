"use client";

import { imageDimensionsFromStream } from "image-dimensions";
import { MIN_IMAGE_DIMENSION_PX } from "./constraints";

type ImageResolutionResult = { checked: true; meetsMinimum: boolean } | { checked: false };

export async function checkImageResolution(file: File): Promise<ImageResolutionResult> {
  if (!file.type.startsWith("image/")) {
    return { checked: false };
  }

  const dimensions = await imageDimensionsFromStream(file.stream());
  if (!dimensions) {
    return { checked: false };
  }

  const shorterSide = Math.min(dimensions.width, dimensions.height);
  return { checked: true, meetsMinimum: shorterSide >= MIN_IMAGE_DIMENSION_PX };
}
