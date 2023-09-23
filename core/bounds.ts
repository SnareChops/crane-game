import { normalVector, normalizeVector } from './trig';
import { PhysicsVector, RawVector, Vector } from './vector';

export const TOP = 0;
export const CENTER = 1;
export const BOTTOM = 2;
export const LEFT = 3;
export const RIGHT = 4;

export interface Bounds {
    vector: Vector;
    rawPos(): [number, number];
    anchor(): [number, number];
    setAnchor(x: number, y: number);
    vecOf(h: number, v: number): [number, number];
    offset(): [number, number];
    size(): [number, number];
    setSize(w: number, h: number);
    dx(): number;
    dy(): number;
    isWithin(x: number, y: number): boolean;
    normalVectorOf(edge: number): [number, number];
}

export abstract class BaseBounds<T extends Vector> {
    vector: T;
    offsetX: number = 0;
    offsetY: number = 0;
    anchorX: number = 0;
    anchorY: number = 0;

    constructor(public width: number, public height: number) { }

    rawPos(): [number, number] {
        const [ox, oy] = this.offset();
        const [vx, vy] = this.vector.vec2();
        return [vx - ox, vy - oy];
    }

    setAnchor(x: number, y: number) {
        this.anchorX = x;
        this.anchorY = y;
        switch (x) {
            case LEFT:
                this.offsetX = 0;
                break;
            case CENTER:
                this.offsetX = this.width / 2;
                break;
            case RIGHT:
                this.offsetX = this.width;
                break;
        }
        switch (y) {
            case TOP:
                this.offsetY = 0;
                break;
            case CENTER:
                this.offsetY = this.height / 2;
                break;
            case BOTTOM:
                this.offsetY = this.height;
                break;
        }
    }

    vecOf(h: number, v: number): [number, number] {
        let x = 0;
        let y = 0;
        const [vx, vy] = this.vector.vec2();
        switch (h) {
            case LEFT:
                x = vx - this.offsetX;
                break;
            case CENTER:
                x = (vx - this.offsetX) + (this.width / 2);
                break;
            case RIGHT:
                x = vx - this.offsetX + this.width;
                break;
        }
        switch (v) {
            case TOP:
                y = vy - this.offsetY;
                break;
            case CENTER:
                y = (vy - this.offsetY) + (this.height / 2);
                break;
            case BOTTOM:
                y = vy - this.offsetY + this.height;
                break;
        }
        return [x, y];
    }

    anchor(): [number, number] {
        return [this.anchorX, this.anchorY];
    }

    offset(): [number, number] {
        return [this.offsetX, this.offsetY];
    }

    size(): [number, number] {
        return [this.width, this.height];
    }

    setSize(w: number, h: number) {
        this.width = w;
        this.height = h;
    }

    dx(): number {
        return this.width;
    }

    dy(): number {
        return this.height;
    }

    normalVectorOf(edge: number): [number, number] {
        switch (edge) {
            case LEFT:
                return [-1, 0]
            case TOP:
                return [0, -1]
            case RIGHT:
                return [1, 0]
            case BOTTOM:
                return [0, 1]
            default:
                throw new Error('Invalid edge');
        }
    }

    isWithin(x: number, y: number): boolean {
        const [x1, y1] = this.rawPos();
        if (this.width == 1 && this.height == 1) {
            return x == x1 && y == y1;
        }
        const x2 = x1 + this.width;
        const y2 = y1 + this.height;
        return x > x1 && x < x2 && y > y1 && y < y2;
    }

    doesCollide(other: Bounds): boolean {
        const [w1, h1] = this.size();
        const [x1, y1] = this.rawPos();
        const [w2, h2] = other.size();
        const [x2, y2] = other.rawPos();
        return !(x2 + w2 < x1 || x2 > x1 + w1 || y2 + h2 < y1 || y2 > y1 + h1);
    }

    collisionEdges(other: Bounds): [number, number] {
        const [w1, h1] = this.size();
        const [x1, y1] = this.rawPos();
        const [w2, h2] = other.size();
        const [x2, y2] = other.rawPos();

        if (x1 + w1 >= x2 && x1 < x2) {
            return [LEFT, RIGHT];
        }
        if (x1 <= x2 + w2 && x1 + w1 > x2 + w2) {
            return [RIGHT, LEFT];
        }
        if (y1 + h1 >= y2 && y1 < y2) {
            return [TOP, BOTTOM];
        }
        if (y1 <= y2 + h2 && y1 + h1 > y2 + h2) {
            return [BOTTOM, TOP];
        }
        return [0, 0];
    }
}

export class RawBounds extends BaseBounds<RawVector> {
    constructor(public width: number = 0, public height: number = 0) {
        super(width, height);
        this.vector = new RawVector();
    }
}

export class PhysicsBounds extends BaseBounds<PhysicsVector> {
    constructor(width: number = 0, height: number = 0) {
        super(width, height);
        this.vector = new PhysicsVector();
    }

    velocity(): [number, number] {
        return this.vector.velocity()
    }

    setRawVelocity(x: number, y: number) {
        this.vector.setRawVelocity(x, y);
    }

    update(delta: number) {
        this.vector.update(delta);
    }
}