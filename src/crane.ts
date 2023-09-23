import { RawBounds } from '../core/bounds';
import { createCanvas } from '../core/util';

export class CraneSprite extends RawBounds {
    image: CanvasImageSource;

    constructor() {
        super(100, 100);
        const [canvas, context] = createCanvas(...this.size());
        context.fillStyle = 'red';
        context.fillRect(0, 0, 10, 100);
        context.fillRect(90, 0, 10, 100);
        context.fillRect(0, 0, 100, 10);
        this.image = canvas;
    }

    Image(): CanvasImageSource {
        return this.image;
    }
}