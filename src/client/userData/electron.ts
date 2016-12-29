import {UserData} from "../userData";
import {NativeStorage} from "./cordova";
class UserDataElectron extends UserData {
    get(prop: string, successCallBack: Function, errorCallBack: Function): void {
        if (localStorage.hasOwnProperty(prop)) {
            successCallBack(localStorage[prop]);
        } else {
            if (errorCallBack) {
                let error = new Error();
                error.message = `${prop} doesn't exist`;
                error.name = "NotFound";
                errorCallBack(error);
            }
        }
    }

    set(prop: string, value: any, successCallBack: Function, errorCallBack: Function): void {
        if (localStorage.hasOwnProperty(prop)) {
            localStorage[prop] = value;
            if (successCallBack) {
                successCallBack(localStorage[prop]);
            }
        } else {
            let error = new Error();
            error.message = `${prop} doesn't exist`;
            error.name = "NotFound";
            if (errorCallBack) {
                errorCallBack(error);
            }
        }
    }
}

module.exports = UserDataElectron;