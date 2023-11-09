import { EmitterSymbol, Emitter } from '../utils/emitter.class';
import { Function, Nullable } from '../utils/types';

export class TaskEventSetId {
    constructor(readonly previous: Nullable<number>, readonly id: Nullable<number>) {}
}

export class TaskEventSuccess {
    constructor(readonly result: any, readonly params?: any[]) {}
}

export class TaskEventReject {
    constructor(readonly error?: Error) {}
}

export type TaskEvents = TaskEventSetId | TaskEventSuccess | TaskEventReject;

export enum TaskStatusEnum {
    Pending = 'pending',
    Running = 'running',
    Success = 'success',
    Reject = 'reject',
    // Cancled = 'canceled',
}

export class Task<T extends Function = Function> {
    public [EmitterSymbol] = new Emitter<TaskEvents>();

    readonly name: string;
    private _start: Nullable<Date> = null;
    private _end: Nullable<Date> = null;
    public params?: any[];

    private _id: Nullable<number> = null;

    get id() {
        return this._id;
    }

    set id(id: Nullable<number>) {
        const previous = this._id;

        this._id = id;

        this[EmitterSymbol].emit(new TaskEventSetId(previous, id));
    }

    private _status: TaskStatusEnum = TaskStatusEnum.Pending;

    get status() {
        return this._status;
    }

    set status(status: TaskStatusEnum) {
        this._status = status;
    }

    get start() {
        return this._start;
    }

    get end() {
        return this._end;
    }

    readonly perform: T;

    constructor(perform?: T, params?: Parameters<T>, name?: string) {
        this.name = name ?? this.constructor.name;

        this.params = params;

        this.perform = perform ?? (() => {}) as T;
    }

    async execute() {
        if (this.status !== TaskStatusEnum.Pending) {
            return false;
        }

        this._start = new Date();
        this._status = TaskStatusEnum.Running;

        try {
            const result = await this.perform(this.params);

            this._end = new Date();
            this._status = TaskStatusEnum.Success;
            this[EmitterSymbol].emit(new TaskEventSuccess(result, this.params));
        } catch (error: any) {
            this._end = new Date();
            this._status = TaskStatusEnum.Reject;
            this[EmitterSymbol].emit(new TaskEventReject(error));
        }

        return true;
    }
}
