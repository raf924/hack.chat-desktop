import {UserData} from "../userData";
class UserDataElectron extends UserData {
    get(prop: string, successCallBack: (value) => any, errorCallBack?: (error: Error) => any): void {
        if (localStorage.hasOwnProperty(prop)) {
            successCallBack(JSON.parse(localStorage.getItem(prop)));
        } else {
            if (typeof errorCallBack === "function") {
                let error = new Error();
                error.message = `${prop} doesn't exist`;
                error.name = "NotFound";
                errorCallBack(error);
            }
        }
    }

    set(prop: string, value: any, successCallBack?: (value) => void, errorCallBack?: (error: Error) => void): void {
        localStorage.setItem(prop, JSON.stringify(value));
        if (typeof successCallBack === "function") {
            successCallBack(JSON.parse(localStorage.getItem(prop)));
        }
    }
}

module.exports = UserDataElectron;