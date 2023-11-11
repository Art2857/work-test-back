import { EmitterSymbol, Emitter } from '../utils/emitter.class';
import { Emptyble, Nullable, Optional } from '../utils/types';
import { Task, TaskEvents, TaskStatusEnum } from './task.class';

import { Worker } from 'cluster';

import { Subscription } from 'rxjs';
import { Workers, WorkersEvents } from './workers.class';
import { MappingById } from '../utils/mapping/mapping-by-id.class';
import { MappingOneToMany } from '../utils/mapping/mapping-one-to-many.class';
import { Mapping } from '../utils/mapping/mapping.class';

// События класса TaskManager
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

export type Condition = (event: any) => Emptyble<Worker> | Promise<Emptyble<Worker>>;

/** Класс для управления задачами */
export class TaskManager {
    public [EmitterSymbol] = new Emitter<EventsTaskManager>();

    private mappingById = new MappingById<Task>(); // id <-> task
    private mappingByName = new MappingOneToMany<string, Task>(); // name <-> task[]
    private mappingByWorker = new MappingOneToMany<Worker, Task>(); // worker <-> task[]
    private mappingByCondition = new Mapping<Task, Condition>(); // task <-> condition
    private mappingBySubscription = new Mapping<Task, Subscription>(); // task <-> subscription

    constructor(readonly workers: Workers) {
        // Случаем свои события
        this[EmitterSymbol].subscribe((event) => {
            // Проверяем стало ли условие исполения задачи истинным, если да, то исполняем
            this.mappingByCondition.mapping.forEach(async (task, condition) => {
                try {
                    const worker = await condition(event);
                    // Проверяем что условие исполения задачи выполнено
                    if (!worker) {
                        return console.log(`Couldn't find worker for task ${task.name}`);
                    }

                    // Назначаем исполнителя задачи, если ещё не был назначен (работает только для addFor)
                    if (!this.mappingByWorker.getIdByValue(task)) {
                        this.mappingByWorker.add(worker, task);
                    }

                    // Удаляем задачу из ожидающих исполнения
                    this.mappingByCondition.removeById(task);

                    // Устанавливаем задаче статус исполения, но не запускаем, так как мы не исполнитель
                    if (task.status === TaskStatusEnum.Pending) {
                        task.running();
                    }
                } catch (error) {
                    task.reject(error);
                }
            });
        });

        // Подписываемся на события воркеров
        this.workers[EmitterSymbol].subscribe((event) => {
            this[EmitterSymbol].emit(event);
        });
    }

    get tasks() {
        return this.mappingById.values;
    }

    /** Возвращает id задачи */
    getIdByTask(task: Task) {
        return this.mappingById.getIdByValue(task);
    }

    /** Возвращает задачу по id */
    getTaskById(id: number) {
        return this.mappingById.getValueById(id);
    }

    /** Проверяет существование задачи */
    isExists(task: Task) {
        return this.mappingById.getIdByValue(task) !== undefined;
    }

    /** Возвращает задачи конкретного исполнителя */
    getTasksByWorker(worker: Worker) {
        const tasks = this.mappingByWorker.getValuesById(worker);

        if (!tasks) {
            return [];
        }

        return [...tasks];
    }

    /** Возвращает исполнителя задачи */
    getWorkerByTask(task: Task): Optional<Worker> {
        return this.mappingByWorker.getIdByValue(task);
    }

    /** Возвращает стресс воркера */
    getStress(worker: Worker) {
        return this.getTasksByWorker(worker).length;
    }

    /** Возвращает воркера с наименьшим стрессом */
    leastStress(workers?: Worker[]) {
        let leastStress = Infinity;
        let leastStressWorker: Nullable<Worker> = null;

        if (!workers) {
            workers = this.workers.workers;
        }

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

    /** Подписка на события задачи */
    private subscribeTask(task: Task) {
        const subscription = task[EmitterSymbol].subscribe((event) => {
            this[EmitterSymbol].emit(
                new TaskManagerEventTask(this.mappingById.getIdByValue(task)!, task, event, this.getWorkerByTask(task)),
            );
        });

        this.mappingBySubscription.add(task, subscription);

        return subscription;
    }

    /** Отписка от событий задачи */
    private unsubscribeTask(task: Task) {
        const subscription = this.mappingBySubscription.getValueById(task);

        if (!subscription) {
            return false;
        }

        subscription.unsubscribe();

        return this.mappingBySubscription.removeById(task);
    }

    /** Добавляет задачу конкретному исполнителю */
    addFor(task: Task, worker: Worker, condition: Condition) {
        if (this.isExists(task)) {
            throw new Error(`Task ${task.name} already exists`);
        }

        this.mappingById.increment(task);
        this.mappingByName.add(task.name, task);
        this.mappingByWorker.add(worker, task);
        this.mappingByCondition.add(task, condition);
        this.subscribeTask(task);

        this[EmitterSymbol].emit(new TaskManagerEventAdd(this.mappingById.getIdByValue(task)!, task, worker));

        return task;
    }

    /** Добавляет задачу */
    add(task: Task, condition: Condition) {
        if (this.isExists(task)) {
            throw new Error(`Task ${task.name} already exists`);
        }

        this.mappingById.increment(task);
        this.mappingByName.add(task.name, task);
        this.mappingByCondition.add(task, condition);
        this.subscribeTask(task);

        this[EmitterSymbol].emit(new TaskManagerEventAdd(this.mappingById.getIdByValue(task)!, task));

        return task;
    }

    /** Удаляет задачу */
    remove(task: Task) {
        if (!this.isExists(task)) {
            throw new Error(`Task ${task.name} not exists`);
        }

        this.mappingById.removeByValue(task);
        this.mappingByName.remove(task);
        this.mappingByWorker.remove(task);
        this.mappingByCondition.removeById(task);
        this.unsubscribeTask(task);

        this[EmitterSymbol].emit(new TaskManagerEventRemove(this.mappingById.getIdByValue(task)!, task));

        return task;
    }
}
