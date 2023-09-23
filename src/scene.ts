import { Renderer } from '../core/renderer';
import { isSet } from '../core/util';
import { CraneSprite } from './crane';
import { Model } from './model';
import { VTS } from './vts';

export enum CraneState {
    IDLE = 1 << 1,
    ACTIVE = 1 << 2,
    MOVETO = 1 << 3,
    LOWERING = 1 << 4,
    GRABBING = 1 << 5,
    RAISING = 1 << 6,
    MOVEBACK = 1 << 7,
    DROPPING = 1 << 8,
}

export class CraneScene {
    renderer = new Renderer();
    crane = new CraneSprite();
    state = CraneState.IDLE;
    vts = new VTS();
    model: Model;
    savedPos: [number, number, number, number] = [0, 0, 0, 0];
    cooldown: number = 2000;

    constructor() {
        this.renderer.addToScreen(this.crane);
        this.model = new Model(this.vts);
        this.vts.onOpen(async () => {
            await this.vts.authorize();
            this.savedPos = await this.model.Pos();
            console.log(this.savedPos);
        });
    }

    update(delta: number) {
        if (isSet(this.state, CraneState.IDLE)) {
            this.cooldown -= delta;
            if (this.cooldown <= 0) {
                this.state = CraneState.ACTIVE;
                this.cooldown = 2000;
                const [x, y, r, s] = this.savedPos;
                console.log('centering');
                this.model.SetPos(0, 0, 0, s);
            }
            return;
        }
        if (isSet(this.state, CraneState.ACTIVE)) {
            this.cooldown -= delta;
            if (this.cooldown <= 0) {
                this.state = CraneState.IDLE;
                this.cooldown = 2000;
                console.log('resetting');
                this.model.SetPos(...this.savedPos);
            }
        }
    }

    draw(screen: CanvasRenderingContext2D) {
        this.renderer.draw(screen);
    }
}