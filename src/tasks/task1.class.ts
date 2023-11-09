import { Task } from '../cluster/task.class';
import { sleep } from '../utils/sleep';

export async function FunctionTask1(duration?: number) {
    return await sleep(duration);
}

export class Task1 extends Task<typeof FunctionTask1> {
    constructor(duration: number = 120000) {
        super(FunctionTask1, [duration]);
    }
}
