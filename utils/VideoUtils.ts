import {PassThrough} from "stream";
import fetch from "node-fetch";
import * as ffmpeg from "fluent-ffmpeg";
import {FfprobeData} from "fluent-ffmpeg";

export class VideoUtils {
    public static async getMetadataByUrl(url: string): Promise<FfprobeData> {
        const response = await fetch(url);
        const passThrough = new PassThrough();
        response.body.pipe(passThrough);

        return new Promise((resolve, reject) => {
            ffmpeg()
                .addInput(passThrough)
                .ffprobe((err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
        })
    }

    public static async getMetadata(path: string): Promise<FfprobeData> {
        return new Promise((resolve, reject) => {
            ffmpeg()
                .addInput(path)
                .ffprobe((err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
        })
    }

    public static getSize(metadata: FfprobeData) {
        const data = metadata.streams.find(d => d.codec_type === 'video');
        return {
            width: data.width,
            height: data.height,
        }
    }
}
