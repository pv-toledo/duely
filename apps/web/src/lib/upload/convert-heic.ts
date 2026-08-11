import heicConvert from "heic-convert";
import sharp from "sharp";
import { IMAGE_RESIZE_MAX_DIMENSION_PX, WEBP_QUALITY } from "./constraints";

export type ConvertedImage = {
  buffer: Buffer;
  width: number;
  height: number;
};

export async function convertHeicToWebp(heicBuffer: Buffer): Promise<ConvertedImage> {
  const pngBuffer = await heicConvert({
    buffer: heicBuffer,
    format: "PNG",
    quality: 1,
  });

  const { data, info } = await sharp(pngBuffer)
    .resize(IMAGE_RESIZE_MAX_DIMENSION_PX, IMAGE_RESIZE_MAX_DIMENSION_PX, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: Math.round(WEBP_QUALITY * 100) })
    .toBuffer({ resolveWithObject: true });

  return { buffer: data, width: info.width, height: info.height };
}
