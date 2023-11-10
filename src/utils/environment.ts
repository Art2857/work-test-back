import { config } from 'dotenv';
import Joi from 'joi';

config({ path: '.env' });

export interface IEnvironment {
    PRIMARY_APPLICATION_PORT: number;
    WORKER_APPLICATION_PORT: number;
}

const schema = Joi.object<IEnvironment>({
    PRIMARY_APPLICATION_PORT: Joi.number().required(),
    WORKER_APPLICATION_PORT: Joi.number().required(),
});

const { PRIMARY_APPLICATION_PORT, WORKER_APPLICATION_PORT } = process.env;

const { error, value } = schema.validate({ PRIMARY_APPLICATION_PORT, WORKER_APPLICATION_PORT });
if (error) {
    throw new Error(`Error validation environment: ${error.message}, ${value}`);
}

export const Environment = value;
