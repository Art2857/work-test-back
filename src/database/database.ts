import { Sequelize, Dialect, PoolOptions } from 'sequelize';
import { UserInit } from './models/user.model';

export class DatabaseManager {
    readonly connection: Sequelize;

    constructor({
        database,
        username,
        password,
        host,
        dialect,
        pool,
    }: {
        database: string;
        username: string;
        password?: string;
        host?: string;
        dialect?: Dialect;
        pool?: PoolOptions;
    }) {
        this.connection = new Sequelize(database, username, password, {
            host,
            dialect,
            pool,   
            logging: false,
        });

        this.init();
    }

    private init() {
        UserInit(this.connection);

        return this;
    }

    public async sync(): Promise<void> {
        await this.connection.sync();
    }
}
