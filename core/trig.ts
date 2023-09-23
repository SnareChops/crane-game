export function normalizeVector(x: number, y: number): [number, number] {
    const length = Math.sqrt(x * x + y * y);
    if (length == 0) {
        return [0, 0];
    }
    return [x / length, y / length];
}

export function normalVector(x1: number, y1: number, x2: number, y2: number): [number, number] {
    return [-(y2 - y1), x2 - x1];
}

export function pointAtAngleWithDistance(x: number, y: number, angle: number, dist: number): [number, number] {
    return [
        x + dist * Math.cos(angle),
        y + dist * Math.sin(angle),
    ];
}

export function angleBetweenPoints(x1: number, y1: number, x2: number, y2: number): number {
    const result = Math.atan2(y2 - y1, x2 - x1)
    if (result < 0) {
        return result + 2 * Math.PI
    }
    return result
}

/** Translates a number in a given range, to the same value in a different range */
export function translateNumberBetweenRanges(value: number, minA: number, maxA: number, minB: number, maxB: number): number {
    return (value - minA) / (maxA - minA) * (maxB - minB) + minA;
}
