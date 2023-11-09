import { EmitterSymbol, Emitter } from '../utils/emitter.class';
import { TaskEvents, Task, TaskEventSuccess, TaskEventReject, TaskEventSetId } from './task.class';

export class TaskManagerEventAdd {
    constructor(public task: Task) {}
}

export class TaskManagerEventRemove {
    constructor(public task: Task) {}
}

export class TaskManagerEventTask {
    constructor(public task: Task, public event: TaskEvents) {}
}

export type EventsTaskManager = TaskManagerEventAdd | TaskManagerEventRemove | TaskManagerEventTask;

export class TaskManager {
    public [EmitterSymbol] = new Emitter<EventsTaskManager>();

    private nextId = 0;

    private _tasks = new Map<number, Task>();
    private _indexNames = new Map<string, Task[]>(); // { [task-name]: Task[] } // Можно бы и через Set сделать

    get tasks() {
        return new Map(this._tasks);
    }

    get tasksByNames() {
        return new Map(this._indexNames);
    }

    add(task: Task, notify = true) {
        let indexName = this._indexNames.get(task.name);

        if (!indexName) {
            indexName = [];
            this._indexNames.set(task.name, indexName);
        }

        indexName.push(task);

        task[EmitterSymbol].subscribe((event) => {

            const isSuccessed = event instanceof TaskEventSuccess;
            const isRejected = event instanceof TaskEventReject;

            if (isSuccessed || isRejected) {
                return this.remove(task);
            }

            if (event instanceof TaskEventSetId) {
                const { previous, id } = event;

                if (previous) {
                    this._tasks.delete(previous);
                    this._tasks.set(id!, task);
                }

                return;
            }

            this[EmitterSymbol].emit(new TaskManagerEventTask(task, event));
        });

        this[EmitterSymbol].emit(new TaskManagerEventAdd(task));

        task.id = this.nextId++;
        this._tasks.set(task.id, task);

        return task;
    }

    remove(task: Task) {
        if (!task.id) {
            return false;
        }

        const indexName = this._indexNames.get(task.name);

        if (!indexName) {
            return false;
        }

        indexName.splice(indexName.indexOf(task), 1);

        if (indexName.length === 0) {
            this._indexNames.delete(task.name);
        }

        this._tasks.delete(task.id!);

        task[EmitterSymbol].subscribesClear();

        this[EmitterSymbol].emit(new TaskManagerEventRemove(task));

        return true;
    }
}
