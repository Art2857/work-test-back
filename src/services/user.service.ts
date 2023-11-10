import { fetch } from 'undici';
import { Environment } from '../utils/environment';

export class UserService {
    /** Задача может падать из-за того что исполнитель обращается сам к себе или другому исполнителю который занят...
     *
     * Для того чтобы этого избежать, нужно пилить более гибкую настройку масштабируемого роутинга
     *
     * @param count - кол-во пользователей */
    public static async testStress(count: number = 10000, amount: number = -2) {
        const { WORKER_APPLICATION_PORT } = Environment;

        let successed = 0;

        console.log(`Start stress test with ${count} users`);

        const promises: Promise<void>[] = [];
        for (let i = 0; i < count; i++) {
            const promise = (async () => {
                const workerApplicationUrl = `http://localhost:${WORKER_APPLICATION_PORT}/user/1/balance`;

                const response = await fetch(workerApplicationUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount,
                    }),
                });

                if (response && response.status === 200) {
                    successed++;
                }
            })();

            promises.push(promise);
        }

        await Promise.all(promises);

        console.log(`Finish stress test with ${count} users, successed: ${successed}`);

        return successed;
    }
}
