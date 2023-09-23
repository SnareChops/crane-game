
export interface Vector {
    vec2(): [number, number];
    setVec2(x: number, y: number): void;
    vec3(): [number, number, number];
    setVec3(x: number, y: number, z: number): void;
}

export class RawVector {
    x: number = 0;
    y: number = 0;
    z: number = 0;

    vec2(): [number, number] {
        return [this.x, this.y];
    }

    setVec2(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    vec3(): [number, number, number] {
        return [this.x, this.y, this.z];
    }

    setVec3(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

export class PhysicsVector {
    x: number = 0;
    y: number = 0;
    z: number = 0;
    vx: number = 0;
    vy: number = 0;
    ax: number = 0;
    ay: number = 0;

    vec2(): [number, number] {
        return [this.x, this.y];
    }

    setVec2(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    vec3(): [number, number, number] {
        return [this.x, this.y, this.z];
    }

    setVec3(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    velocity(): [number, number] {
        return [this.vx, this.vy];
    }

    setRawVelocity(x: number, y: number) {
        this.vx = x;
        this.vy = y;
    }

    setVelocity(angle: number, magnitude: number) {
        this.vx = Math.cos(angle) * magnitude;
        this.vy = Math.sin(angle) * magnitude;
    }

    acceleration(): [number, number] {
        return [this.ax, this.ay];
    }

    setAcceration(angle: number, magnitude: number) {
        this.ax = Math.cos(angle) * magnitude;
        this.ay = Math.sin(angle) * magnitude;
    }

    update(delta: number) {
        this.vx += this.ax * delta
        this.vy += this.ay * delta

        this.x += this.vx * delta
        this.y += this.vy * delta
    }
}
