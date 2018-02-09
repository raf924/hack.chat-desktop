import {UserData} from "../userData";

export default class UserDataCordova extends UserData {
    get(prop: string, successCallBack: Function, errorCallBack: Function): void {
        window.NativeStorage.getItem(prop, function (obj) {
            successCallBack(obj);
        }, function (error) {
            if (typeof errorCallBack === "function") {
                errorCallBack(error);
            }
        });
    }

    set(prop: string, value: any, successCallBack: Function, errorCallBack: Function): void {
        window.NativeStorage.setItem(prop, value, function (obj) {
            if (typeof successCallBack === "function") {
                successCallBack(obj);
            }
        }, function (error) {
            if (typeof errorCallBack === "function") {
                errorCallBack(error);
            }
        });
    }
}