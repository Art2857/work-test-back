export class MessageDTO {
    readonly name: string;

    constructor(name?: string) {
        this.name = name ?? this.constructor.name;
    }
}
