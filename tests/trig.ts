import { translateNumberBetweenRanges } from '../core/trig';
import { screenToVTSCoords, vtsToScreenCoords } from '../src/util';

export function testTransalateNumberBetweenRanges() {
    let result = translateNumberBetweenRanges(-1, -1, 1, 0, 1920);
    if (result != 0) throw new Error('should be 0');

    result = translateNumberBetweenRanges(1, -1, 1, 0, 1920);
    if (result != 1920) throw new Error('should be 1920');

    result = translateNumberBetweenRanges(0.8421875238418579, -1, 1, 0, 1920);

    result = translateNumberBetweenRanges(1, 2, 0, 0, 1080);

    result = translateNumberBetweenRanges(100, 0, 1080, 1, -1);
}



export function testScreenToVTSCoords() {
    let [x, y] = screenToVTSCoords(0, 0);
    if (x != -1 || y != 1) throw new Error('should be top left corner');

    [x, y] = screenToVTSCoords(1920, 1080);
    if (x != 1 || y != -1) throw new Error('should be top left corner');

    [x, y] = screenToVTSCoords(960, 540);
    if (x != 0 || y != 0) throw new Error('should be top left corner');
}

export function testvtsToScreenCoords() {
    let [x, y] = vtsToScreenCoords(-1, 1);
    console.log(x, y);
    if (x != 0 || y != 0) throw new Error('should be top left corner');

    [x, y] = vtsToScreenCoords(1, -1);
    console.log(x, y);
    if (x != 1920 || y != 1080) throw new Error('should be bottom right corner');

    [x, y] = vtsToScreenCoords(0, 0);
    console.log(x, y);
    if (x != 960 || y != 540) throw new Error('should be center');
}