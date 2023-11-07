import { NextFunction, Request, Response, Router } from 'express';
import { UserRepository } from '../database/repositories/user.repository';
import { HttpError } from '../utils/error.class';
import { fetch } from 'undici';

export const UserRouter = Router();

UserRouter.put('/:userId/balance', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = parseInt(req.params.userId);
        const amount = parseInt(req.body.amount);

        if (isNaN(amount)) {
            throw new HttpError(400, 'Invalid amount');
        }

        await UserRepository.balanceIncrease(userId, amount);

        res.json({ message: 'Balance user updated' });
    } catch (error) {
        next(error);
    }
});

UserRouter.post('/test', async (req: Request, res: Response, next: NextFunction) => {
    let successed = 0;
    for (let i = 0; i < 10000; i++) {
        (async () => {
            const response = await fetch('http://localhost:3000/user/14/balance', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    amount: -2,
                }),
            });

            if (response && response.status === 200) {
                successed++;
            }

            // console.log(await response.json());
        })();
    }

    res.json({ message: `Test balance user successed: ${successed} / 10000` });
});

// try {
// // Найти пользователя по ID и обновить его баланс
// const user = await UserModel.findByPk(userId);
// if (!user) {
//     return res.status(404).json({ error: 'User not found' });
// }

// // Проверка, что баланс пользователя не будет отрицательным
// // const newBalance = user.balance + amount;
// // if (newBalance < 0) {
// //     return res.status(400).json({ error: 'Баланс пользователя не может быть отрицательным' });
// // }
// // user.balance = newBalance;
// // await user.save();

// const [affectedRows] = await UserModel.update(
//     { balance: Database.connection.literal(`balance + ${amount}`) },
//     { where: { id: userId, balance: { [Op.gte]: -amount } } },
// );

// if (affectedRows === 0) {
//     return res.status(400).json({ error: 'Баланс пользователя не может быть отрицательным' });
// }

// return res.json({ message: 'Balance user updated' });
// } catch (error) {
//     console.error('Ошибка:', error);

//     if (error instanceof HttpError) {
//         return res.status(error.status).json({ error: error.message });
//     }

//     return res.status(500).json({ error: 'Internal server error' });
// }
