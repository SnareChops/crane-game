export enum VTSMessageType {
    APIStateRequest = 'APIStateRequest',
    AuthenticationTokenRequest = 'AuthenticationTokenRequest',
    AuthenticationRequest = 'AuthenticationRequest',
    CurrentModelRequest = 'CurrentModelRequest',
    MoveModelRequest = 'MoveModelRequest',
}

export interface VTSResponse<T> {
    apiName: 'VTubeStudioPublicAPI';
    apiVersion: '1.0';
    timestamp: number;
    messageType: VTSMessageType;
    requestID: string;
    data: T;
}

export class VTS {
    socket: WebSocket;
    pending = new Map<string, (any) => void>();
    counter = 0;
    pluginName = 'Crane Game';
    pluginDeveloper = 'SnareChops';
    #token: string;
    #onopen: () => void;
    constructor() {
        this.socket = new WebSocket('ws://localhost:8001');
        this.socket.onopen = event => {
            console.log('connected', event);
            this.#onopen();
        }
        this.socket.onerror = event => console.error(event);
        this.socket.onmessage = event => this.#message(event.data);
    }

    onOpen(fn: () => void) {
        this.#onopen = fn;
    }

    async authorize(): Promise<void> {
        const response = await this.request<{ authenticationToken: string }>(VTSMessageType.AuthenticationTokenRequest, {
            pluginName: this.pluginName,
            pluginDeveloper: this.pluginDeveloper,
        });
        if (!response.authenticationToken) return console.error('VTS authentication failed');
        this.#token = response.authenticationToken;
        await this.request<{ authenticated: boolean, reason: string }>(VTSMessageType.AuthenticationRequest, {
            pluginName: this.pluginName,
            pluginDeveloper: this.pluginDeveloper,
            authenticationToken: this.#token,
        });
    }

    async request<T extends object>(messageType: VTSMessageType, data?: object): Promise<T> {
        return new Promise<T>(resolve => {
            this.socket.send(JSON.stringify({
                apiName: "VTubeStudioPublicAPI",
                apiVersion: "1.0",
                requestID: this.counter.toString(),
                messageType,
                data,
            }));
            this.pending.set(this.counter.toString(), resolve);
            this.counter += 1;
        });
    }

    #message(message: string) {
        const response = JSON.parse(message) as VTSResponse<any>;
        const resolve = this.pending.get(response.requestID);
        if (!!resolve) resolve(response.data);
    }
}