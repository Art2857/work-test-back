import { MappingTasks } from '../mapping-tasks.class';
import { Task } from '../task.class';
import { UserService } from '../../services/user.service';
import { sleep } from '../../utils/sleep';
import { getIntRandomNumber } from '../../utils/random';

export class TaskUserStress extends Task {
    /** duration - минимальная задержка выполнения задачи */
    constructor(duration: number = 120000, count: number = 10, amount = getIntRandomNumber(-2, 2)) {
        super(
            async (/*duration: number, count: number, amount*/) => {
                console.log(`TaskUserStress ${duration} ${count} ${amount}`);

                const testStress = UserService.testStress(count, amount);
                const awaiting = sleep(duration);

                await Promise.all([testStress, awaiting]);

                if (Math.random() < 0.3) {
                    throw new Error('Test Error!');
                }

                return `TaskUserStress Success! Successed: ${await testStress}`;
            },
            [...arguments], //[duration, count, amount],
        );
    }
}
MappingTasks.add(TaskUserStress);