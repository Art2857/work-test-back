import { config } from 'dotenv';
import Joi from 'joi';

config({ path: '.env' });

export interface IEnvironment {
    APPLICATION_PORT: number;
}

const schema = Joi.object<IEnvironment>({
    APPLICATION_PORT: Joi.number().required(),
});

const { APPLICATION_PORT } = process.env;

const { error, value } = schema.validate({ APPLICATION_PORT });
if (error) {
    throw new Error(`Error validation environment: ${error.message}, ${value}`);
}

export const Environment = value;
