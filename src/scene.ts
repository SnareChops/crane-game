import { lerp, linearInterpolate, translateNumberBetweenRanges } from '../core/trig';
import { isSet } from '../core/util';
import { config } from './config';
import { CraneSprite } from './crane';
import { Model } from './model';
import { screenToVTSCoords, vtsToScreenCoords } from './util';
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
    FALLING = 1 << 9,
    RESTING = 1 << 10,
}

export class CraneScene {
    crane = new CraneSprite();
    state = CraneState.IDLE;
    prev = CraneState.IDLE;
    vts = new VTS();
    model: Model;
    savedPos: [number, number, number, number] = [0, 0, 0, 0];
    canvasPos: [number, number] = [0, 0];
    cooldown: number = 2000;

    constructor() {
        this.crane.vector.setVec2(100, 100);
        this.model = new Model(this.vts);
        this.vts.onOpen(async () => {
            await this.vts.authorize();
            this.savedPos = await this.model.Pos();
            this.canvasPos = vtsToScreenCoords(this.savedPos[0], this.savedPos[1] + config.MODEL_HEIGHT_OFFSET);
            console.log(this.canvasPos);
            console.log(this.savedPos, this.canvasPos);
        });

        setTimeout(() => this.trigger(), 2000);
    }

    trigger() {
        if (!isSet(this.state, CraneState.IDLE)) return;
        this.cooldown = config.MOVE_TO_DURATION;
        this.state = CraneState.MOVETO | CraneState.ACTIVE;
    }

    update(delta: number) {
        if (isSet(this.state, CraneState.MOVETO)) this.moveToUpdate(delta);
        if (isSet(this.state, CraneState.LOWERING)) this.loweringUpdate(delta);
        if (isSet(this.state, CraneState.GRABBING)) this.grabbingUpdate(delta);
        if (isSet(this.state, CraneState.RAISING)) this.raisingUpdate(delta);
        if (isSet(this.state, CraneState.MOVEBACK)) this.moveBackUpdate(delta);
        if (isSet(this.state, CraneState.DROPPING)) this.droppingUpdate(delta);
        if (isSet(this.state, CraneState.FALLING)) this.fallingUpdate(delta);
        if (isSet(this.state, CraneState.RESTING)) this.restingUpdate(delta);
    }

    moveToUpdate(delta: number) {
        this.cooldown -= delta;
        if (this.cooldown <= 0) {
            this.cooldown = config.LOWERING_DURATION + this.cooldown;
            this.state = CraneState.LOWERING | CraneState.ACTIVE;
            return;
        }
        this.prev = CraneState.MOVETO;
        // Move crane to right over model using the whole duration
        const percent = 1 - this.cooldown / config.MOVE_TO_DURATION;
        this.crane.vector.setVec2(...lerp(100, 100, this.canvasPos[0], 100, percent));
    }

    loweringUpdate(delta: number) {
        this.cooldown -= delta;
        if (this.cooldown <= 0) {
            this.cooldown = config.GRABBING_DURATION + this.cooldown;
            this.state = CraneState.GRABBING | CraneState.ACTIVE;
            return;
        }
        this.prev = CraneState.LOWERING;
        // Move the crane down over the model
        const percent = 1 - this.cooldown / config.LOWERING_DURATION;
        this.crane.vector.setVec2(...lerp(this.canvasPos[0], 100, ...this.canvasPos, percent));
    }

    grabbingUpdate(delta: number) {
        this.cooldown -= delta;
        if (this.cooldown <= 0) {
            this.cooldown = config.RAISING_DURATION + this.cooldown;
            this.state = CraneState.RAISING | CraneState.ACTIVE;
            return;
        }
        this.prev = CraneState.GRABBING;
        // Animate the claw closing
        this.crane.close(1 - this.cooldown / config.GRABBING_DURATION);
    }

    raisingUpdate(delta: number) {
        this.cooldown -= delta;
        if (this.cooldown <= 0) {
            this.cooldown = config.MOVE_BACK_DURATION + this.cooldown;
            this.state = CraneState.MOVEBACK | CraneState.ACTIVE;
            return;
        }
        this.prev = CraneState.RAISING;
        // Move the crane back up
        const percent = 1 - this.cooldown / config.RAISING_DURATION;
        this.crane.vector.setVec2(...lerp(...this.canvasPos, this.canvasPos[0], 100, percent));
        // Move the model with the crane
        const [x, y] = screenToVTSCoords(0, linearInterpolate(this.canvasPos[1], 100, percent));
        this.model.SetPos(this.savedPos[0], y - config.MODEL_HEIGHT_OFFSET, this.savedPos[2], this.savedPos[3]);
    }

    moveBackUpdate(delta: number) {
        this.cooldown -= delta;
        if (this.cooldown <= 0) {
            this.cooldown = config.DROPPING_DURATION + this.cooldown;
            this.state = CraneState.DROPPING | CraneState.ACTIVE;
            return;
        }
        this.prev = CraneState.MOVEBACK;
        // Move the crane and model to the left starting position
        const percent = 1 - this.cooldown / config.MOVE_BACK_DURATION;
        this.crane.vector.setVec2(...lerp(this.canvasPos[0], 100, 100, 100, percent));
        const [x, y] = screenToVTSCoords(...this.crane.vector.vec2());
        this.model.SetPos(x, y - config.MODEL_HEIGHT_OFFSET, this.savedPos[2], this.savedPos[3]);
    }

    droppingUpdate(delta: number) {
        this.cooldown -= delta;
        if (this.cooldown <= 0) {
            this.cooldown = config.FALLING_DURATION + this.cooldown;
            this.state = CraneState.FALLING | CraneState.ACTIVE;
            return;
        }
        this.prev = CraneState.DROPPING;
        // Open the crane arms
        this.crane.open(1 - this.cooldown / config.DROPPING_DURATION)
    }

    fallingUpdate(delta: number) {
        this.cooldown -= delta;
        if (this.cooldown <= 0) {
            this.cooldown = config.RESTING_DURATION + this.cooldown;
            this.state = CraneState.RESTING | CraneState.ACTIVE;
            return;
        }
        if (this.prev != CraneState.FALLING) {
            const [x, y] = screenToVTSCoords(...this.crane.vector.vec2());
            this.model.SetPos(x, -2, this.savedPos[2], this.savedPos[3], 0.5);
        }
        this.prev = CraneState.FALLING;
    }

    restingUpdate(delta: number) {
        this.cooldown -= delta
        if (this.cooldown <= 0) {
            this.state = CraneState.IDLE;
            this.model.SetPos(...this.savedPos);
        }
    }

    draw(screen: CanvasRenderingContext2D) {
        screen.drawImage(this.crane.Image(), ...this.crane.rawPos());
    }
}