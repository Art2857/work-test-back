import express, { Request, Response } from 'express';
import { Environment } from './utils/environment';
import { UserRouter } from './routers/user.router';
import { ErrorMiddleware } from './middlewares/error.middleware';

export function ApplicationBootstrap() {
    const { APPLICATION_PORT } = Environment;

    const app = express();

    app.use(express.json());

    app.get('/', (req: Request, res: Response) => {
        res.send('Hello Test!');
    });

    app.use('/user', UserRouter);

    app.use(ErrorMiddleware);

    app.listen(APPLICATION_PORT, () => {
        console.log(`Listening on port ${APPLICATION_PORT}`);
    });

    return app;
}
