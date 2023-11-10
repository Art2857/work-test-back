import cron from 'node-cron';
import { bootstrap } from '../..';
import { TaskUserStress } from '../tasks/task-user-stress.class';
import { getIntRandomNumber, getRandomElement } from '../../utils/random';
import { IPrimaryBootstrap } from './primary.bootstrap';
import { sleep } from '../../utils/sleep';
import { Emptyble } from '../../utils/types';
import { TaskTest1 } from '../tasks/task-test1.class';
import { TaskTest2 } from '../tasks/task-test2.class';
import { TaskTest3 } from '../tasks/task-test3.class';

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

            const newableTask = getRandomElement([TaskUserStress, TaskTest1, TaskTest2, TaskTest3])!;

            const task = new newableTask(duration, count);

            taskManager.add(
                task,
                // Пишем условие запуска задачи - Каждая задача, если её запустила какая-то из копий приложения, не должна запуститься на другой копии, пока где-либо запущена.
                () => {
                    const workers = taskManager.workers.workers.filter((worker) => {
                        const workersExceptMe = new Set(taskManager.workers.workers);
                        workersExceptMe.delete(worker);

                        // На этом моменте уже устал :( Получаем все названия выполняемых задач других воркеров
                        const tasksNames = new Set(
                            [...workersExceptMe]
                                .map((worker) => {
                                    const tasks = taskManager.getTasksByWorker(worker);

                                    const tasksNames = new Set(
                                        tasks.map((task) => {
                                            return task.name;
                                        }),
                                    );

                                    return [...tasksNames];
                                })
                                .flat(1),
                        );

                        if (tasksNames.has(task.name)) {
                            return false;
                        }

                        return true;
                    });

                    const worker = taskManager.leastStress(workers);

                    return worker;

                    // Ищем воркера с наименьшим стрессом
                    // const worker = taskManager.leastStress();

                    // if (!worker) {
                    //     return null;
                    // }

                    // return worker;
                },
            );
        },
        {
            scheduled: true,
            timezone: 'Europe/Moscow',
        },
    );

    task.start();
}
