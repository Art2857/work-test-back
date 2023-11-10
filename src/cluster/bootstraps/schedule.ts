import cron from 'node-cron';
import { bootstrap } from '../..';
import { TaskUserStress } from '../tasks/task-user-stress.class';
import { getIntRandomNumber } from '../../utils/random';
import { IPrimaryBootstrap } from './primary.bootstrap';
import { sleep } from '../../utils/sleep';

/*

| | | | | 6-- День недели (0 - 6) (Воскресенье = 0 или 7)
| | | | 5---- Месяц (1 - 12)
| | | 4------ День месяца (1 - 31)
| | 3-------- Час (0 - 23)
| 2---------- Минута (0 - 59)
1------------ Секунда (0 - 59)

*/

export async function schedule(primary: IPrimaryBootstrap) {
    console.log(`Start cron`);

    // Немного ждём чтобы поднялись ещё несколько воркеров
    await sleep(2000);

    const task = cron.schedule(
        `*/3 * * * * *`,
        () => {
            const { taskManager } = primary;

            const duration = getIntRandomNumber(10000, 300000);
            const count = getIntRandomNumber(1, 300);

            console.log(`Cron task ${duration} ${count}`);

            taskManager.add(new TaskUserStress(duration, count));
        },
        {
            scheduled: true,
            timezone: 'Europe/Moscow',
        },
    );

    task.start();
}
