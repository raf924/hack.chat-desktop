import sequelize = require("sequelize");
import Sequelize = sequelize.Sequelize;
import Model = sequelize.Model;
import fn = sequelize.fn;


interface DBConfig {
    database: string;
    username: string;
    host: string;
    password: string;
}

export interface Property {
    name: string;
    value: string;
}

class ConfigSequelize extends Config {
    sequelize: Sequelize;
    Property: any;

    constructor(dbConfig: DBConfig) {
        super();
        this.config = new ConfigObject();
        this.sequelize = new sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
            host: dbConfig.host || null,
            storage: dbConfig.host || 'localConfig.db'
        });
        this.Property = this.sequelize.define('config', {
            name: {
                type: sequelize.STRING,
            }, value: {
                type: sequelize.STRING
            }
        }, {
            freezeTableName: true
        });
        let that = this;
        this.Property.sync().then(function () {
            that.Property.findAll().then((properties: Property[]) => {
                properties.forEach((prop) => {
                    this.config[prop.name] = prop.value;
                })
            });
        });
    }

    save(): void {
        for(let propName in this.config){
            this.Property.upsert({name: propName, value: this.config[propName]});
        }
    }

    set(name: string, value: any): void {
        this.config[name] = value;
    }

    get(name: string): any {
        return this.config[name];
    }
}
