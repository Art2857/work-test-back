import { Newable } from '../utils/types';
import { Task } from './task.class';

export class MappingTasks {
    private static readonly mapping = {
        [Task.name]: Task,
    };

    static get(name: string): Newable<Task> {
        const task = this.mapping[name];

        if (!task) {
            throw new Error(`Task not found: ${name}`);
        }

        return task;
    }

    static add(task: Newable<Task>) {
        const name = task.name;

        if (this.mapping[name]) {
            throw new Error(`Task already exists: ${name}`);
        }

        this.mapping[name] = task;
    }
}
