import { BOTTOM, CENTER, RawBounds } from '../core/bounds';
import { linearInterpolate } from '../core/trig';
import { createCanvas } from '../core/util';

export class CraneSprite extends RawBounds {
    image: [HTMLCanvasElement, CanvasRenderingContext2D];
    top: CanvasImageSource;
    left: CanvasImageSource;
    right: CanvasImageSource;
    closePercent: number = 0;

    constructor() {
        super(100, 100);
        this.setAnchor(CENTER, BOTTOM);
        this.image = createCanvas(...this.size());
        const [topCanvas, topContext] = createCanvas(100, 10);
        topContext.fillStyle = 'red';
        topContext.fillRect(0, 0, 100, 10);
        this.top = topCanvas;
        const [leftCanvas, leftContext] = createCanvas(10, 100);
        leftContext.fillStyle = 'red';
        leftContext.fillRect(0, 0, 10, 100);
        this.left = leftCanvas;
        this.right = leftCanvas;
        this.render();
    }

    close(percent: number) {
        this.closePercent = percent;
        this.render();
    }

    open(percent: number) {
        this.closePercent = 1 - percent;
        this.render();
    }

    render() {
        this.image[1].reset();
        this.image[1].drawImage(this.top, 0, 0);
        this.image[1].rotate(linearInterpolate(0, (7 * Math.PI) / 4, this.closePercent));
        this.image[1].drawImage(this.left, 0, 0);
        this.image[1].resetTransform();
        this.image[1].rotate(linearInterpolate(0, Math.PI / 4, this.closePercent));
        this.image[1].drawImage(this.right, 90, 0);
        this.image[1].resetTransform();
    }

    Image(): CanvasImageSource {
        return this.image[0];
    }
}