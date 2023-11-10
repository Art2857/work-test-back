import express, { Request, Response } from 'express';
import { Environment } from './utils/environment';
import { UserRouter } from './routers/user.router';
import { ErrorMiddleware } from './middlewares/error.middleware';

export function WorkerApplicationBootstrap() {
    const { WORKER_APPLICATION_PORT } = Environment;

    const app = express();

    app.use(express.json());

    app.get('/', (req: Request, res: Response) => {
        res.send('Hello I am worker!');
    });

    app.use('/user', UserRouter);

    app.use(ErrorMiddleware);

    app.listen(WORKER_APPLICATION_PORT, () => {
        console.log(`Listening on port ${WORKER_APPLICATION_PORT}`);
    });

    return app;
}
