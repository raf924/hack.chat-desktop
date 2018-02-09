export class ServiceManager {
    services: Map<string, Function> = new Map();

    static instance: ServiceManager;

    constructor() {
        if (ServiceManager.instance) {
            throw "ServiceManager is a singleton";
        }
        let r = require.context(`./services`, false, /\.ts$/);
        let services = r.keys();
        for (let service of services) {
            let serviceClass = r(service).service;
            this.services[serviceClass.service] = serviceClass;
        }
    }

    static load(): ServiceManager {
        if (!ServiceManager.instance) {
            ServiceManager.instance = new ServiceManager();
        }
        return ServiceManager.instance;
    }
}