import cluster from 'cluster';
import os from 'os';
import { DatabaseManager } from './database/database';
import DatabaseConfig from '../config/config.json';
import { Dialect } from 'sequelize';
import { ApplicationBootstrap } from './application';
import { Workers } from './cluster/workers.class';
import {
    TaskManagerEventAdd,
    TaskManagerEventRemove,
    TaskManager,
    TaskManagerEventTask,
} from './cluster/task-manager.class';
import { Task1 } from './tasks/task1.class';
import { EmitterSymbol } from './utils/emitter.class';
import { Task, TaskEventReject, TaskEventSuccess, TaskStatusEnum } from './cluster/task.class';

const DatabaseDevelopment = DatabaseConfig['development'];

export const Database = new DatabaseManager({
    username: DatabaseDevelopment.username,
    password: DatabaseDevelopment.password,
    database: DatabaseDevelopment.database,
    host: DatabaseDevelopment.host,
    dialect: DatabaseDevelopment.dialect as Dialect, // Можно было бы добавить где-то валидацию, но ладно...
    pool: DatabaseDevelopment.pool,
});

const taskManager = new TaskManager();

// taskManager.add(new Task1()).execute();

if (cluster.isPrimary) {
    const numWorkers = Math.max(5, os.cpus().length);

    const workers = new Workers(numWorkers);
    console.log(`Master cluster setting up ${numWorkers} workers...`);

    cluster.on('online', (worker) => {
        console.log(`Worker ${worker.process.pid} is online`);
    });

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);

        workers.create();
    });

    cluster.on('message', (worker, message) => {
        console.log(`Received message from worker ${worker.id}:`, message);
        // Обработка сообщения

        if (message.event === 'add') {
            const { id, name } = message;

            // Какая-то проверка исполение задачи
            if (taskManager.tasksByNames.get(name)) {
                return worker.send({ event: 'reject', id });
            }

            const task = new Task(undefined, name);
            task.status = TaskStatusEnum.Running; // Эмулируем выполнение задачи

            taskManager.add(task);

            const taskId = task.id!;

            worker.send({ event: 'confirm', id, confirmedId: taskId });
        }

        if (message.event === 'remove') {
            const { id } = message;

            const task = taskManager.tasks.get(id);

            if (!task) {
                return false;
            }

            taskManager.remove(task);
        }

        if (message.event === 'success') {
            const { id, result, params } = message;

            const task = taskManager.tasks.get(id);

            if (!task) {
                return false;
            }

            task.status = TaskStatusEnum.Success;
            task[EmitterSymbol].emit(new TaskEventSuccess(result, params));

            taskManager.remove(task);
        }

        if (message.event === 'reject') {
            const { id } = message;

            const task = taskManager.tasks.get(id);

            if (!task) {
                return false;
            }

            task.status = TaskStatusEnum.Reject;

            task[EmitterSymbol].emit(new TaskEventReject());

            taskManager.remove(task);
        }
    });
} else {
    const application = ApplicationBootstrap();

    taskManager[EmitterSymbol].subscribe((event) => {
        if (event instanceof TaskManagerEventAdd) {
            const {
                task: { id, name },
            } = event;

            process.send!({ event: 'add', id, name });
        }

        if (event instanceof TaskManagerEventRemove) {
            const {
                task: { id },
            } = event;

            process.send!({ event: 'remove', id });
        }

        if (event instanceof TaskManagerEventTask) {
            const {
                task: { id },
                event: taskEvent,
            } = event;

            if (taskEvent instanceof TaskEventSuccess) {
                const { result, params } = taskEvent;
                return process.send!({ event: 'success', id, result, params });
            }

            if (taskEvent instanceof TaskEventReject) {
                return process.send!({ event: 'reject', id });
            }
        }
    });

    process.on('message', (message: any) => {
        console.log(`Received message from primary:`, message);
        // Обработка сообщения

        if (message.event === 'confirm') {
            const { id, confirmedId } = message;

            const task = taskManager.tasks.get(id);

            if (!task) {
                return false;
            }

            task.id = confirmedId;

            task.execute();
        }

        if (message.event === 'reject') {
            const { id } = message;

            const task = taskManager.tasks.get(id);

            if (!task) {
                return false;
            }

            task.status = TaskStatusEnum.Reject;

            task[EmitterSymbol].emit(new TaskEventReject());

            taskManager.remove(task);
        }
    });
}
