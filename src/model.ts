import { VTS, VTSMessageType } from './vts';

export interface CurrentModel {
    modelLoaded: boolean;
    modelName: string;
    modelID: string;
    vtsModelName: string;
    vtsModelIconName: string;
    live2DModelName: string;
    modelLoadTime: number;
    timeSinceModelLoaded: number;
    numberOfLive2DParameters: number;
    numberOfLive2DArtmeshes: number;
    hasPhysicsFile: boolean;
    numberOfTextures: number;
    textureResolution: number;
    modelPosition: {
        positionX: number;
        positionY: number;
        rotation: number;
        size: number;
    }
}

export interface MoveRequest {
    timeInSeconds: number;
    valuesArerelativeToModel: false;
    positionX: number; // -1 to 1
    positionY: number; // -1 to 1
    rotation: number; // degrees
    size: number; // -100 to 100
}

export class Model {
    constructor(public vts: VTS) { }

    async Pos(): Promise<[number, number, number, number]> {
        const response = await this.vts.request<CurrentModel>(VTSMessageType.CurrentModelRequest);
        console.log('model position response', response);
        return [
            response.modelPosition.positionX,
            response.modelPosition.positionY,
            response.modelPosition.rotation,
            response.modelPosition.size,
        ];
    }

    async SetPos(x: number, y: number, rotation: number, size: number, time: number = 0, relative: boolean = false) {
        await this.vts.request<{}>(VTSMessageType.MoveModelRequest, {
            timeInSeconds: time,
            valuesAreRelativeToModel: relative,
            positionX: x,
            positionY: y,
            rotation,
            size,
        });
    }
}