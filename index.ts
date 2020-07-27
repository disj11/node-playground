import {Converter} from "./utils/Converter";

Converter.overlay(
    '',
    '',
    `${new Date().getTime()}.mp4`
).then(() => console.log('success'));
