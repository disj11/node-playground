import {Converter} from "./utils/Converter";
import * as path from "path";

const savePath = path.resolve(__dirname, `${new Date().getTime()}.mp4`);
Converter.cut(
    'http://caching.lottecinema.co.kr//Media/MovieFile/MovieMedia/201712/11977_301_1.mp4',
    0,
    5,
    savePath,
).then((videoPath) => {
    console.log(videoPath);
});
