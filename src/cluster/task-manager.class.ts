import { DualMap } from '../utils/dual-map.class';
import { EmitterSymbol, Emitter } from '../utils/emitter.class';
import { Emptyble, Nullable, Optional } from '../utils/types';
import { Task, TaskEvents, TaskStatusEnum } from './task.class';

import { Worker } from 'cluster';

import { Subscription } from 'rxjs';
import { Workers, WorkersEvents } from './workers.class';

export class TaskManagerEventAdd {
    constructor(public id: number, public task: Task, public worker?: Worker) {}
}

export class TaskManagerEventRemove {
    constructor(public id: number, public task: Task, public worker?: Worker) {}
}

export class TaskManagerEventTask {
    constructor(public id: number, public task: Task, public event: TaskEvents, public worker?: Worker) {}
}

export type EventsTaskManager = TaskManagerEventAdd | TaskManagerEventRemove | TaskManagerEventTask | WorkersEvents;

/**
 * Этот класс декомпозировать по хорошему и разбить на классы...
 */
export class TaskManager {
    public [EmitterSymbol] = new Emitter<EventsTaskManager>();

    private _nextId = 0;

    private _mappingById = new DualMap<number, Task>();

    get mappingById() {
        return new DualMap(this._mappingById);
    }

    get tasks() {
        return this._mappingById.valuesRight;
    }

    private mappingByIdAdd(task: Task) {
        return this._mappingById.set(this._nextId++, task);
    }

    private mappingByIdRemove(task: Task) {
        const id = this._mappingById.getLeft(task);

        if (!id) {
            return false;
        }

        return this._mappingById.removeRight(id);
    }

    getIdByTask(task: Task) {
        return this._mappingById.getLeft(task);
    }

    getTaskById(id: number) {
        return this._mappingById.getRight(id);
    }

    private _mappingByName = new Map<string, Set<Task>>();

    get mappingByName() {
        return new Map(this._mappingByName);
    }

    private mappingByNameAdd(task: Task) {
        const { name } = task;

        let mappingByName = this._mappingByName.get(name);

        if (!mappingByName) {
            mappingByName = new Set();

            this._mappingByName.set(name, mappingByName);
        }

        return mappingByName.add(task);
    }

    private mappingByNameRemove(task: Task) {
        const { name } = task;

        const mappingByName = this._mappingByName.get(name);

        if (!mappingByName) {
            return false;
        }
        mappingByName.delete(task);

        if (mappingByName.size === 0) {
            this._mappingByName.delete(name);
        }

        return true;
    }

    private _mappingByWorker = new Map<Worker, Set<Task>>(); // { [worker]: Set<Task> }
    private _mappingWorkerByTask = new Map<Task, Worker>(); // { [task]: worker }

    get mappingByWorkerId() {
        return new Map(this._mappingByWorker);
    }

    get mappingWorkerIdByTask() {
        return new Map(this._mappingWorkerByTask);
    }

    private mappingByWorkerAdd(task: Task, worker: Worker) {
        let mappingByWorker = this._mappingByWorker.get(worker);

        if (!mappingByWorker) {
            mappingByWorker = new Set();

            this._mappingByWorker.set(worker, mappingByWorker);
        }

        this._mappingWorkerByTask.set(task, worker);

        return mappingByWorker.add(task);
    }

    private mappingByWorkerRemove(task: Task) {
        const worker = this._mappingWorkerByTask.get(task);

        if (!worker) {
            return false;
        }

        const mappingByWorker = this._mappingByWorker.get(worker);

        if (!mappingByWorker) {
            return false;
        }

        mappingByWorker.delete(task);

        if (mappingByWorker.size === 0) {
            this._mappingByWorker.delete(worker);
        }

        this._mappingWorkerByTask.delete(task);

        return true;
    }

    getTasksByWorker(worker: Worker) {
        const tasks = this._mappingByWorker.get(worker);

        if (!tasks) {
            return [];
        }

        return [...tasks];
    }

    getWorkerByTask(task: Task): Optional<Worker> {
        return this._mappingWorkerByTask.get(task);
    }

    private _mappingTaskWaiting = new Map<Task, (event: any) => boolean | Promise<boolean>>();

    private mappingTaskWaitingAdd(task: Task, condition: (event: any) => boolean | Promise<boolean>) {
        return this._mappingTaskWaiting.set(task, condition);
    }

    private mappingTaskWaitingRemove(task: Task) {
        return this._mappingTaskWaiting.delete(task);
    }

    getStress(worker: Worker) {
        const stress = this._mappingByWorker.get(worker)?.size;

        if (!stress) {
            return null;
        }

        return stress;
    }

    /** Возвращает работника с наименьшим стрессом */
    leastStress() {
        let leastStress = Infinity;
        let leastStressWorker: Nullable<Worker> = null;

        const { workers } = this.workers;

        for (const worker of workers) {
            const stress = this.getStress(worker);

            if (stress === null) {
                return worker;
            }

            if (stress < leastStress) {
                leastStress = stress;
                leastStressWorker = worker;
            }
        }

        return leastStressWorker;
    }

    constructor(readonly workers: Workers) {
        this[EmitterSymbol].subscribe((event) => {
            this._mappingTaskWaiting.forEach(async (condition, task) => {
                try {
                    if (await condition(event)) {
                        let worker: Emptyble<Worker> = this.getWorkerByTask(task);

                        // Если нету исполнителя для задачи, то ищем работника с наименьшим стрессом
                        if (!worker) {
                            worker = this.leastStress();

                            if (!worker) {
                                console.log(`Couldn't find worker for task ${task.name}`);
                                return;
                            }

                            this.mappingByWorkerAdd(task, worker);
                        }

                        this.mappingTaskWaitingRemove(task);

                        if (task.status === TaskStatusEnum.Pending) {
                            task.running();
                        }
                    }
                } catch (error) {
                    task.reject(error);
                }
            });
        });

        this.workers[EmitterSymbol].subscribe((event) => {
            this[EmitterSymbol].emit(event);
        });
    }

    private _mappingSubscriptions = new Map<Task, Subscription>();

    private mappingSubscriptionsAdd(task: Task) {
        const subscription = task[EmitterSymbol].subscribe((event) => {
            this[EmitterSymbol].emit(
                new TaskManagerEventTask(this.getIdByTask(task)!, task, event, this.getWorkerByTask(task)),
            );
        });

        this._mappingSubscriptions.set(task, subscription);

        return subscription;
    }

    private mappingSubscriptionsRemove(task: Task) {
        const subscription = this._mappingSubscriptions.get(task);

        if (!subscription) {
            return false;
        }

        subscription.unsubscribe();

        return this._mappingSubscriptions.delete(task);
    }

    isExists(task: Task) {
        return this._mappingById.getLeft(task) !== undefined;
    }

    addFor(task: Task, worker: Worker, condition: (event: any) => boolean | Promise<boolean> = () => true) {
        if (this.isExists(task)) {
            throw new Error(`Task ${task.name} already exists`);
        }

        this.mappingByIdAdd(task);
        this.mappingByNameAdd(task);
        this.mappingByWorkerAdd(task, worker);
        this.mappingTaskWaitingAdd(task, condition);
        this.mappingSubscriptionsAdd(task);

        this[EmitterSymbol].emit(new TaskManagerEventAdd(this.getIdByTask(task)!, task, worker));

        return task;
    }

    add(task: Task, condition: (event: any) => boolean | Promise<boolean> = () => true) {
        if (this.isExists(task)) {
            throw new Error(`Task ${task.name} already exists`);
        }

        this.mappingByIdAdd(task);
        this.mappingByNameAdd(task);
        this.mappingTaskWaitingAdd(task, condition);
        this.mappingSubscriptionsAdd(task);

        this[EmitterSymbol].emit(new TaskManagerEventAdd(this.getIdByTask(task)!, task));

        return task;
    }

    remove(task: Task) {
        if (!this.isExists(task)) {
            throw new Error(`Task ${task.name} not exists`);
        }

        this.mappingByIdRemove(task);
        this.mappingByNameRemove(task);
        this.mappingByWorkerRemove(task);
        this.mappingTaskWaitingRemove(task);
        this.mappingSubscriptionsRemove(task);

        this[EmitterSymbol].emit(new TaskManagerEventRemove(this.getIdByTask(task)!, task));

        return task;
    }
}
