import {UserData} from "../userData";
export declare const NativeStorage;
class UserDataCordova extends UserData{
    get(prop: string, successCallBack: Function, errorCallBack: Function): void {
        NativeStorage.getItem(prop, function (obj) {
            successCallBack(obj);
        }, function (error) {
            errorCallBack(error);
        });
    }

    set(prop: string, value: any, successCallBack: Function, errorCallBack: Function): void {
        NativeStorage.setItem(prop, value, function (obj) {
            successCallBack(obj);
        }, function (error) {
            errorCallBack(error);
        });
    }
}

module.exports = UserDataCordova;