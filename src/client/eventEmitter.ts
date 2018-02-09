export class EventEmitter {
    private listeners: Map<String, Function[]> = new Map();

    constructor() {

    }

    public emit(event: string, ...args) {
        this.listeners[event].forEach(async (callback: Function) => {
            return new Promise((resolve, reject) => {
                callback(args);
                resolve();
            });
        });
    }

    public on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
}