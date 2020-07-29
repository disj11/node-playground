import {ffmpeg} from "ffmpeg-stream";
import * as path from "path";
import {HttpUtils} from "./HttpUtils";
import * as fs from "fs";
import {Writable} from "stream";
import {ImageUtils} from "./ImageUtils";
import * as Xvfb from "xvfb";

const concat = require('ffmpeg-concat');
const xvfb = new Xvfb();

export class Converter {
    private static readonly TEMP_DIR = 'tmp/node-converter';

    public static async overlay(videoUrl: string, imageUrl: string, savePath: string) {
        await this._overlay(videoUrl, imageUrl, fs.createWriteStream(savePath));
        return savePath;
    }

    private static async _overlay(videoUrl: string, imageUrl: string, writable: Writable) {
        this.createTempDirIfNotExist();
        const converter = ffmpeg();

        console.log('Downloading resource files...');
        const date = new Date();
        const videoPath = await HttpUtils.downloadResource(videoUrl, path.resolve(this.TEMP_DIR, `${date.getTime()}_video`));
        const imagePath = await HttpUtils.downloadResource(imageUrl, path.resolve(this.TEMP_DIR, `${date.getTime()}_image`));

        console.log('Resizing video...');
        const imageSize = ImageUtils.getImageSize(imagePath);
        await this.resize(videoPath, imageSize.width, -2, converter.createInputStream({f: 'mp4'}));

        converter.createInputFromFile(imagePath, {f: 'image2'});
        converter.createOutputStream({
            f: 'ismv',
            filter_complex: '[0:v][1:v] overlay=0:0',
        }).pipe(writable);

        console.log('Processing(overlay)...');
        await converter.run();

        console.log('deleting temp files...');
        fs.unlinkSync(videoPath);
        fs.unlinkSync(imagePath);
        console.log('successful completion!');
    }

    public static async concat(videoUrls: Array<string>, savePath: string): Promise<string> {
        this.createTempDirIfNotExist();

        const videos = [];
        const date = new Date();
        for (let i = 0; i < videoUrls.length; i++) {
            videos.push(await HttpUtils.downloadResource(videoUrls[i], path.resolve(this.TEMP_DIR, `${date.getTime()}_video_${i}`)));
        }

        console.log('Processing(concat)...');
        xvfb.startSync();
        await concat({
            tempDir: this.TEMP_DIR,
            output: savePath,
            videos: videos,
            transition: {
                name: 'InvertedPageCurl',
                duration: 1000,
            }
        });
        xvfb.stopSync();

        console.log('deleting temp files...');
        for (const video of videos) {
            fs.unlinkSync(video);
        }
        console.log('successful completion!');

        return savePath;
    }

    private static async resize(videoPath: string, width: number, height: number, writable: Writable) {
        const converter = ffmpeg();
        converter.createInputFromFile(videoPath, {f: 'mp4'});
        converter.createOutputStream({
            f: 'ismv',
            vf: `scale=${width}:${height}`,
        }).pipe(writable);
        await converter.run();
    }

    private static createTempDirIfNotExist() {
        if (!fs.existsSync(this.TEMP_DIR)) {
            fs.mkdirSync(this.TEMP_DIR, {recursive: true});
        }
    }
}
