export abstract class ChannelEventListener {
    protected static events = ["addUser", "removeUser", "tripCodeSet", "messageReceived"];

    abstract addUser(user: string): void

    abstract removeUser(user: string): void

    abstract tripCodeSet(user: string, trip: string): void

    abstract messageReceived(args: MessageData): void
}
