import * as fs from "fs";
import * as Xvfb from "xvfb";
import * as ffmpeg from "fluent-ffmpeg";
import {HttpUtils} from "./HttpUtils";
import * as path from "path";

const concat = require('ffmpeg-concat');
const xvfb = new Xvfb();

export class Converter {
    private static readonly TEMP_DIR = 'tmp/node-converter';

    public static async overlay(videoUrl: string, imageUrl: string, savePath: string): Promise<string> {
        const tempDir = this.createTempDirIfNotExist();

        const date = new Date();
        const videoPath = await HttpUtils.downloadResource(videoUrl, path.resolve(tempDir, `${date.getTime()}_video`));
        const imagePath = await HttpUtils.downloadResource(imageUrl, path.resolve(tempDir, `${date.getTime()}_image`));

        return new Promise((resolve, reject) => {
            const cmd = ffmpeg(videoPath)
                .addInput(imagePath)
                .complexFilter('[0:v][1:v]overlay=0:0')
                .outputOptions([
                    '-loglevel', 'info',
                ])
                .saveToFile(savePath)
                .on('start', (cmd) => console.log({ cmd }))
                .on('end', () => resolve(savePath))
                .on('error', (err) => reject(err))

            cmd.run();
        });
    }

    public static async concat(videoUrls: Array<string>, savePath: string): Promise<string> {
        const tempDir = this.createTempDirIfNotExist();

        const videos = [];
        const date = new Date();
        for (let i = 0; i < videoUrls.length; i++) {
            videos.push(await HttpUtils.downloadResource(videoUrls[i], path.resolve(tempDir, `${date.getTime()}_video_${i}`)));
        }

        await this._concat(videos, savePath);
        for (const video of videos) {
            fs.unlinkSync(video);
        }

        return savePath
    }

    private static async _concat(videoPaths: Array<string>, savePath: string): Promise<string> {
        const tempDir = this.createTempDirIfNotExist();

        xvfb.startSync();
        await concat({
            tempDir: tempDir,
            output: savePath,
            videos: videoPaths,
            log: stdout => console.log(stdout),
            transition: {
                name: 'InvertedPageCurl',
                duration: 1000,
            }
        });
        xvfb.stopSync();

        return savePath;
    }

    /**
     * @param videoUrl 동영상 URL
     * @param start seconds
     * @param duration seconds
     * @param savePath 동영상 저장 위치
     */
    public static async cut(videoUrl: string, start: number, duration: number, savePath: string) {
        const tempDir = this.createTempDirIfNotExist();

        const videoPath = await HttpUtils.downloadResource(videoUrl, path.resolve(tempDir, `${new Date().getTime()}_video`));
        return new Promise((resolve, reject) => {
            const cmd = ffmpeg(videoPath)
                .setStartTime(start)
                .setDuration(duration)
                .outputOptions([
                    '-loglevel', 'info',
                ])
                .saveToFile(savePath)
                .on('start', (cmd) => console.log({ cmd }))
                .on('end', () => resolve(savePath))
                .on('error', (err) => reject(err))

            cmd.run();
        })
    }

    private static async _resize(filePath: string, size: string, savePath: string) {
        return new Promise<string>((resolve, reject) => {
            const cmd = ffmpeg(filePath)
                .size(size)
                .autoPad(true)
                .outputOptions([
                    '-loglevel', 'info',
                ])
                .outputFormat("mp4")
                .saveToFile(savePath)
                .on('start', (cmd) => console.log({cmd}))
                .on('end', () => resolve(savePath))
                .on('error', (err) => reject(err))

            cmd.run();
        });
    }

    private static createTempDirIfNotExist() {
        const tempDir = path.resolve(this.TEMP_DIR, new Date().getTime().toString(10));
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, {recursive: true});
        }

        return tempDir;
    }
}
