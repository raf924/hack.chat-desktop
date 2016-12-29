import sequelize = require("sequelize");
import Sequelize = sequelize.Sequelize;
import Model = sequelize.Model;
import fn = sequelize.fn;
import {ConfigObject, Property, Config} from "../app/config";


interface DBConfig {
    database: string;
    username: string;
    host: string;
    password: string;
}

class ConfigDBObject extends ConfigObject{
    nickName: string;
}

class ConfigDB extends Config {
    private sequelize: Sequelize;
    private Property: any;
    private changed : boolean;

    constructor(dbConfig: DBConfig) {
        super();
        this.config = new ConfigDBObject();
        this.sequelize = new sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
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
        this.changed = false;
    }

    save(): void {
        for(let propName in this.config){
            this.Property.upsert({name: propName, value: this.config[propName]});
        }
        this.changed = false;
    }

    set(name: string, value: any): void {
        if (this.config.hasOwnProperty(name)) {
            this.config[name] = value;
            this.changed = true;
        }
    }

    get(name: string): any {
        return this.config[name];
    }
}

module.exports = ConfigDB;