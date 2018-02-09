export abstract class ChannelEventListener extends Polymer.GestureEventListeners(Polymer.Element) {
    protected static events = ["addUser", "removeUser", "tripCodeSet", "messageReceived", "disconnected"];

    abstract addUser(user: string): void

    abstract removeUser(user: string): void

    abstract tripCodeSet(user: string, trip: string): void

    abstract messageReceived(args: MessageData): void

    abstract disconnected(code: number, reason: string): void
}
