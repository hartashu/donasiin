// lib/barcodeService.ts
import {
  BinaryBitmap,
  HybridBinarizer,
  NotFoundException,
  RGBLuminanceSource,
  MultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library";
import { Jimp } from "jimp";

export async function readBarcodeFromUrl(
  imageUrl: string
): Promise<string | null> {
  try {
    const image = await Jimp.read(imageUrl);


    image.greyscale().contrast(1);

    const rawImageData = {
      data: new Uint8ClampedArray(image.bitmap.data),
      width: image.bitmap.width,
      height: image.bitmap.height,
    };

    const luminanceSource = new RGBLuminanceSource(
      rawImageData.data,
      rawImageData.width,
      rawImageData.height
    );
    const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

    const hints = new Map();
    const formats = [BarcodeFormat.CODE_128, BarcodeFormat.CODE_39];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);

    const reader = new MultiFormatReader();
    reader.setHints(hints);

    const result = reader.decode(binaryBitmap);

    return result.getText();
  } catch (error) {
    if (error instanceof NotFoundException) {
      console.log("Barcode not found in image.");
    } else {
      console.error("Barcode reading failed:", error);
    }
    return null;
  }
}
