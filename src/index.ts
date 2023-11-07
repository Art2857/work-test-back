import express, { Request, Response } from 'express';
import { Environment } from './utils/environment';
import { DatabaseManager } from './database/database';
// import { UserModel } from './database/models/user.model';
import { migration } from './database/migrations/migration';
import { UserInit, UserModel } from './database/models/user.model';
import { UserRouter } from './routers/user.router';
import { ErrorMiddleware } from './middlewares/error.middleware';

const { APPLICATION_PORT } = Environment;

export const Database = new DatabaseManager({
    username: 'username',
    password: 'password',
    database: 'database',
    host: 'localhost',
    dialect: 'postgres',
});

// Database.sync().then(migration);

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
