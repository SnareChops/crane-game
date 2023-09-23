import { Bounds } from './bounds';
import { ParticleEmitter } from './particle';

export interface Sprite extends Bounds {
    Image(): CanvasImageSource;
}

export class Renderer {
    background: Sprite[] = [];
    effects: ParticleEmitter[] = [];
    screen: Sprite[] = [];

    addToBackground(sprite: Sprite) {
        if (this.background.includes(sprite)) return;
        this.screen.push(sprite);
    }

    removeFromBackground(sprite: Sprite) {
        const i = this.background.indexOf(sprite);
        if (i > -1) this.background.splice(i, 1);
    }

    addEffect(effect: ParticleEmitter) {
        if (this.effects.includes(effect)) return;
        this.effects.push(effect);
    }

    removeEffect(effect: ParticleEmitter) {
        const i = this.effects.indexOf(effect);
        if (i > -1) this.effects.splice(i, 1);
    }

    addToScreen(sprite: Sprite) {
        if (this.screen.includes(sprite)) return;
        this.screen.push(sprite);
    }

    removeFromScreen(sprite: Sprite) {
        const i = this.screen.indexOf(sprite);
        if (i > -1) this.screen.splice(i, 1);
    }

    draw(ctx: CanvasRenderingContext2D) {
        for (let effect of this.effects) {
            for (let particle of effect.particles) {
                const image = particle.Image();
                if (!!image) {
                    ctx.drawImage(image, ...particle.bounds.rawPos())
                }
            }
        }

        this.screen.sort((a, b) => {
            const [ax, ay, az] = a.vector.vec3();
            const [bx, by, bz] = b.vector.vec3();
            return az - bz;
        });
        for (const item of this.screen) {
            const image = item.Image();
            if (!!image) {
                ctx.drawImage(image, ...item.rawPos());
            }
        }
    }
}