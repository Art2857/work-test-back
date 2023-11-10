import { PrimaryApplicationBootstrap } from '../../primary-application';
import { DTO } from '../../utils/dto.class';
import { EmitterSymbol } from '../../utils/emitter.class';
import { TaskRejectedDTO } from '../dtos/task-rejected.dto';
import { TaskRunningDTO } from '../dtos/task-running.dto';
import { TaskSuccessedDTO } from '../dtos/task-success.dto';
import { TaskManager, TaskManagerEventTask } from '../task-manager.class';
import { TaskEventRunning } from '../task.class';
import { Workers } from '../workers.class';
import cluster, { Worker } from 'cluster';
import { schedule } from './schedule';
import { Express } from 'express';
import { TaskModel } from '../../database/models/tasks.model';

export interface IPrimaryBootstrap {
    taskManager: TaskManager;
    workers: Workers;
    application: Express;
}

export function PrimaryBootstrap(numWorkers = 1): IPrimaryBootstrap {
    const primaryApplication = PrimaryApplicationBootstrap();

    const workers = new Workers(numWorkers);
    console.log(`Master cluster setting up ${numWorkers} workers...`);

    const taskManager = new TaskManager(workers);

    cluster.on('message', async (worker: Worker, message: DTO) => {
        console.log(`Received message from worker ${worker.id}:`, message);

        // Если исполнитель успешно завершил задачу
        if (message.name === TaskSuccessedDTO.name) {
            const { id, result } = <TaskSuccessedDTO>message;

            const task = taskManager.getTaskById(id);

            if (!task) {
                return false;
            }

            task.success(result);

            await TaskModel.create({
                name: task.name,
                params: task.params,
                result,
                start: task.start,
                end: task.end,
                status: task.status,
            });
        }

        // Если исполнитель не смог завершить задачу
        if (message.name === TaskRejectedDTO.name) {
            const { id, error } = <TaskRejectedDTO>message;

            const task = taskManager.getTaskById(id);

            if (!task) {
                return false;
            }

            task.reject(error);

            await TaskModel.create({
                name: task.name,
                params: task.params,
                result: error,
                start: task.start,
                end: task.end,
                status: task.status,
            });
        }
    });

    // Получаем события из TaskManager
    taskManager[EmitterSymbol].subscribe(async (event) => {
        if (event instanceof TaskManagerEventTask) {
            const { id, task, event: taskEvent, worker } = event;

            // Если задача готова к исполнению, то передаем ее исполнителю
            if (taskEvent instanceof TaskEventRunning) {
                const params = taskEvent.params;

                if (!worker) {
                    throw new Error('Worker not found');
                }

                const mappingConstructor = task.constructor.name;

                console.log(`Task running: ${mappingConstructor}`);

                worker.send!(new TaskRunningDTO(id, mappingConstructor, params));
            }
        }
    });

    return {
        taskManager,
        workers,
        application: primaryApplication,
    };
}
