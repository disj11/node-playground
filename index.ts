import {Converter} from "./utils/Converter";
import * as path from "path";

const savePath = path.resolve(__dirname, `${new Date().getTime()}.mp4`);
Converter.concatWithoutTransition([
    '',
    '',
], savePath).then((videoPath) => {
    console.log(videoPath);
});
