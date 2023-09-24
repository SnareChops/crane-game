import { linearInterpolate } from '../core/trig';
import { config } from './config';

export function screenToVTSCoords(sx: number, sy: number): [number, number] {
    return [
        linearInterpolate(-1, 1, sx / config.SCREEN_WIDTH),
        linearInterpolate(1, -1, sy / config.SCREEN_HEIGHT),
    ];
}

export function vtsToScreenCoords(vx: number, vy: number): [number, number] {
    return [
        linearInterpolate(0, 1920, (vx + 1) / 2),
        linearInterpolate(1080, 0, (vy + 1) / 2),
    ];
}