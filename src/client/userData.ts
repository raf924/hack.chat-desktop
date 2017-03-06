export abstract class UserData {
    public abstract get(prop: string, successCallBack: (value) => void, errorCallBack?: (error: Error) => void): void;

    public abstract set(prop: string, value: any, successCallBack?: (value) => void, errorCallBack?: (error: Error) => void): void;

    static defaultData = {
        "loginMethod": "mixedLogin",
        "favourites": ["programming@hack.chat", "test@hack.chat", "test@dummy"]
    };
}
