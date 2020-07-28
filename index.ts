import {Converter} from "./utils/Converter";

/*Converter.overlay(
    'https://ias.dmcmedia.co.kr/openapi/creative/shop-products/14/73/templates/188',
    'https://ias.dmcmedia.co.kr/openapi/creative/shop-products/14/36/templates/182',
    `${new Date().getTime()}.mp4`
).then(() => console.log('success'));*/

Converter.concat([
        'https://ias.dmcmedia.co.kr/openapi/creative/shop-products/14/73/templates/188',
        'https://ias.dmcmedia.co.kr/openapi/creative/shop-products/14/36/templates/188',
    ],
    `${new Date().getTime()}.mp4`
).then(() => console.log('success'));
