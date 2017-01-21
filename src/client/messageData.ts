declare interface MessageData{
    nick?: string,
    trip?: string,
    mod?: boolean,
    cmd: string,
    nicks? : string[],
    text: string,
    time?: number,
    mention?: boolean
}
