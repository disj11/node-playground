import * as fs from "fs";
import fetch from "node-fetch";

export class HttpUtils {
    public static async downloadResource(url: string, savePath: string): Promise<string> {
        const response = await fetch(url);
        const dest = fs.createWriteStream(savePath);

        return new Promise<string>((resolve, reject) => {
            response.body.pipe(dest)
                .on('finish', () => resolve(savePath))
                .on('error', reject);
        });
    }
}
