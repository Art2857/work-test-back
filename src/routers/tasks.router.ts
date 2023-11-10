import { NextFunction, Request, Response, Router } from 'express';
import { bootstrap } from '..';
import { IPrimaryBootstrap } from '../cluster/bootstraps/primary.bootstrap';
import { Optional } from '../utils/types';
import { TaskModel } from '../database/models/tasks.model';

export const TasksRouter = Router();

function isPrimary(bootstrap: Optional<IPrimaryBootstrap>) {
    if (!bootstrap) {
        throw new Error('Primary not found');
    }

    return bootstrap;
}

// Получение списка исполняемых задач
TasksRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
    const primary = isPrimary(bootstrap?.primary);

    const { taskManager } = primary;

    const tasks = taskManager.tasks.map((task) => {
        return {
            id: taskManager.getIdByTask(task),
            name: task.constructor.name,
            status: task.status,
            start: task.start,
            end: task.end,
            workerId: taskManager.getWorkerByTask(task)!.id,
        };
    });

    return res.json(tasks);
});

// Получение списка воркеров и их задач
TasksRouter.get('/workers', async (req: Request, res: Response, next: NextFunction) => {
    const primary = isPrimary(bootstrap?.primary);

    const { taskManager } = primary;

    const workers = taskManager.workers.workers.map((worker) => {
        return {
            id: worker.id,
            stress: taskManager.getStress(worker),
            tasks: taskManager.getTasksByWorker(worker),
        };
    });

    return res.json(workers);
});

// Получение общего стресса
TasksRouter.get('/general-stress', async (req: Request, res: Response, next: NextFunction) => {
    const primary = isPrimary(bootstrap?.primary);

    const { taskManager } = primary;

    const stress = taskManager.workers.workers.reduce((stress, worker) => {
        return stress + taskManager.getStress(worker)!;
    }, 0);

    return res.json(stress);
});

// Получаем список выполненных задач
TasksRouter.get('/history', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string);
        if (isNaN(page)) {
            throw new Error('Invalid page');
        }

        const limit = parseInt(req.query.limit as string);
        if (isNaN(limit)) {
            throw new Error('Invalid limit');
        }

        const offset = (page - 1) * limit;

        const tasks = await TaskModel.findAndCountAll({
            offset,
            limit: limit,
            order: [['id', 'ASC']],
        });

        const totalPages = Math.ceil(tasks.count / limit);

        res.json({
            totalTasks: tasks.count,
            totalPages,
            currentPage: page,
            tasks: tasks.rows,
        });
    } catch (error) {
        next(error);
    }
});
