import {imageSize} from "image-size";
import fetch from "node-fetch";

interface ImageSize {
    width: number;
    height: number;
}

export class ImageUtils {
    public static getImageSize(filepath: string): ImageSize {
        return imageSize(filepath);
    }

    public static async getImageSizeByUrl(imageUrl: string): Promise<ImageSize> {
        const response = await fetch(imageUrl);
        const buffer = await response.buffer();
        return imageSize(buffer);
    }
}
