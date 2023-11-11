import cron from 'node-cron';
import {
    UserStressTask1,
    UserStressTask10,
    UserStressTask11,
    UserStressTask2,
    UserStressTask3,
    UserStressTask4,
    UserStressTask5,
    UserStressTask6,
    UserStressTask7,
    UserStressTask8,
    UserStressTask9,
} from '../tasks/user-stress.tasks';
import { getIntRandomNumber, getRandomElement } from '../../utils/random';
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
    console.log(`Start cron schedule!`);

    // Немного ждём чтобы поднялись ещё несколько воркеров
    await sleep(2000);

    const task = cron.schedule(
        `*/3 * * * * *`,
        () => {
            const { taskManager } = primary;

            const duration = getIntRandomNumber(10000, 300000); // Длительность задачи в миллисекундах
            const count = getIntRandomNumber(1, 2500); // Количество запросов
            const amount = getIntRandomNumber(-2, 2) || 1; // Изменение баланса пользователя

            console.log(`Cron task ${duration} ${count} ${amount}`);

            // Добавляем случайную задачу в очередь
            const newableTask = getRandomElement([
                UserStressTask1,
                UserStressTask2,
                UserStressTask3,
                UserStressTask4,
                UserStressTask5,
                UserStressTask6,
                UserStressTask7,
                UserStressTask8,
                UserStressTask9,
                UserStressTask10,
                UserStressTask11,
            ])!;

            const task = new newableTask(duration, count, amount);

            taskManager.add(
                task,
                // Пишем условие запуска задачи - Каждая задача, если её запустила какая-то из копий приложения, не должна запуститься на другой копии, пока где-либо запущена.
                () => {
                    const workers = taskManager.workers.workers.filter((currentWorker) => {
                        const otherWorkers = new Set(taskManager.workers.workers);
                        otherWorkers.delete(currentWorker);

                        const taskNames = Array.from(otherWorkers)
                            .flatMap((worker) => taskManager.getTasksByWorker(worker))
                            .map((task) => task.name);

                        return !taskNames.includes(task.name);
                    });

                    // Ищем среди подходящих воркеров самого не загруженного
                    const worker = taskManager.leastStress(workers);

                    return worker;

                    // Другой вариант: Ищем воркера с наименьшим стрессом
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
