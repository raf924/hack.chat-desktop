export abstract class UserData{
    public abstract get(prop: string, successCallBack: Function, errorCallBack?: Function) : void;
    public abstract set(prop: string, value: any, successCallBack?: Function, errorCallBack?: Function) : void;
}
