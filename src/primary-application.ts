import express, { Request, Response } from 'express';
import { Environment } from './utils/environment';
import { ErrorMiddleware } from './middlewares/error.middleware';
import { TasksRouter } from './routers/tasks.router';

export function PrimaryApplicationBootstrap() {
    const { PRIMARY_APPLICATION_PORT } = Environment;

    const app = express();

    app.use(express.json());

    app.get('/', (req: Request, res: Response) => {
        res.send('Hello I am primary!');
    });

    app.use('/tasks', TasksRouter);

    app.use(ErrorMiddleware);

    app.listen(PRIMARY_APPLICATION_PORT, () => {
        console.log(`Listening on port ${PRIMARY_APPLICATION_PORT}`);
    });

    return app;
}
