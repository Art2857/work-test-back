import { UserService } from '../../services/user.service';
import { getIntRandomNumber } from '../../utils/random';
import { sleep } from '../../utils/sleep';

/** duration - минимальная задержка выполнения задачи */
export async function userStressTaskFunction(
    duration: number = 120000,
    count: number = 1000,
    amount: number = getIntRandomNumber(-2, 2),
) {
    console.log(`User stress task function started. Duration: ${duration}, count: ${count}, amount: ${amount}`);

    // Выполняем задачу
    const testStress = UserService.testStress(count, amount);

    // Делаем минимальную задержку
    const awaiting = sleep(duration);

    await Promise.all([testStress, awaiting]);

    // Для теста иногда выкидываем ошибку
    if (Math.random() < 0.3) {
        throw new Error('Test Error!');
    }

    return `User stress task function finished! Duration: ${duration}, count: ${count}, amount: ${amount}. Successed: ${await testStress}`;
}
