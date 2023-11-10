import { Emitter, EmitterSymbol } from '../utils/emitter.class';
import { Function, Nullable } from '../utils/types';

/** Статус изменён на "выполняется" */
export class TaskEventRunning<T extends any[] = any[]> {
    constructor(readonly params?: T) {}
}

/** Статус изменён на "успешно" */
export class TaskEventSuccess<T extends any[] = any[]> {
    constructor(readonly result: any, readonly params?: T) {}
}

/** Статус изменён на "ошибку" */
export class TaskEventReject {
    constructor(readonly error?: Error) {}
}

export type TaskEvents = TaskEventRunning | TaskEventSuccess | TaskEventReject;

export enum TaskStatusEnum {
    Pending = 'pending',
    Running = 'running',
    Successed = 'successed',
    Rejected = 'rejected',
    // Cancled = 'canceled',
}

export class Task {
    public readonly [EmitterSymbol] = new Emitter<TaskEvents>();

    readonly name: string;

    private _start: Nullable<Date> = null;

    get start() {
        return this._start;
    }

    private _end: Nullable<Date> = null;

    get end() {
        return this._end;
    }

    private _status: TaskStatusEnum = TaskStatusEnum.Pending;

    get status() {
        return this._status;
    }

    set status(status: TaskStatusEnum) {
        this._status = status;

        if (status === TaskStatusEnum.Pending) {
            this._start = null;
            this._end = null;
        }

        if (status === TaskStatusEnum.Running) {
            this._start = new Date();

            this[EmitterSymbol].emit(new TaskEventRunning(this._params));
        }

        if (status === TaskStatusEnum.Successed || status === TaskStatusEnum.Rejected) {
            this._end = new Date();
        }
    }

    /** Функция выполнения задачи */
    private _perform: Function;

    /** Параметры функции задачи */
    private _params: any[]; // JSON

    get params() {
        return this._params;
    }

    constructor(perform: Function, params: Parameters<typeof perform>, name?: string) {
        this.name = name ?? this.constructor.name;

        this._perform = perform;
        this._params = params;
    }

    running() {
        if (this.status !== TaskStatusEnum.Pending) {
            console.log(`Task ${this.name} not pending`);
            return false;
        }

        this.status = TaskStatusEnum.Running;

        return true;
    }

    success(result: any) {
        if (this.status !== TaskStatusEnum.Running) {
            console.log(`Task ${this.name} not running`);
            return false;
        }

        this.status = TaskStatusEnum.Successed;

        this[EmitterSymbol].emit(new TaskEventSuccess(result, this._params));

        return true;
    }

    reject(error: any) {
        if (this.status !== TaskStatusEnum.Running) {
            console.log(`Task ${this.name} not running`);
            return false;
        }

        this.status = TaskStatusEnum.Rejected;

        this[EmitterSymbol].emit(new TaskEventReject(error));

        return true;
    }

    /** Исполнение задачи */
    async execute() {
        if (!this.running()) {
            return false;
        }

        try {
            const result = await this._perform(...this._params);

            this.success(result);
        } catch (error: any) {
            this.reject(error);
        }

        return true;
    }
}
