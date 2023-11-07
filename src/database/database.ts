import { Sequelize, Dialect } from 'sequelize';
import { UserInit } from './models/user.model';

export class DatabaseManager {
    readonly connection: Sequelize;

    constructor({
        database,
        username,
        password,
        host,
        dialect,
    }: {
        database: string;
        username: string;
        password?: string;
        host?: string;
        dialect?: Dialect;
    }) {
        this.connection = new Sequelize(database, username, password, {
            host,
            dialect,
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
