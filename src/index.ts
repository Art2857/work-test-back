import cluster from 'cluster';
import { DatabaseManager } from './database/database';
import DatabaseConfig from '../config/config.json';
import { Dialect } from 'sequelize';
import { WorkerBootstrap } from './cluster/bootstraps/worker.bootstrap';
import { PrimaryBootstrap } from './cluster/bootstraps/primary.bootstrap';
import { clamp } from './utils/clamp';
import os from 'os';
import { schedule } from './cluster/bootstraps/schedule';

// Выбираем конфигурацию
const DatabaseDevelopment = DatabaseConfig['development'];

// Подключаемся к базе данных
export const Database = new DatabaseManager({
    username: DatabaseDevelopment.username,
    password: DatabaseDevelopment.password,
    database: DatabaseDevelopment.database,
    host: DatabaseDevelopment.host,
    dialect: DatabaseDevelopment.dialect as Dialect, // Можно было бы добавить где-то валидацию, но ладно...
    pool: DatabaseDevelopment.pool,
});

// Своебразный способ доступа к primary / worker
function Bootstrap(): { primary?: ReturnType<typeof PrimaryBootstrap>; worker?: ReturnType<typeof WorkerBootstrap> } {
    if (cluster.isPrimary) {
        const countWorkers = clamp(os.cpus().length, 5, 10);

        const primary = PrimaryBootstrap(countWorkers);

        schedule(primary);

        return { primary };
    } else {
        const worker = WorkerBootstrap();

        return { worker };
    }
}

export const bootstrap = Bootstrap();
