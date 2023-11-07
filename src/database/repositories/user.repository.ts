import { Op, Sequelize } from 'sequelize';
import { Database } from '../..';
import { UserModel } from '../models/user.model';
import { HttpError } from '../../utils/error.class';

export class UserRepository {
    static async balanceIncrease(userId: number, amount: number) {
        // Найти пользователя по ID и обновить его баланс
        const user = await UserModel.findByPk(userId);
        if (!user) {
            throw new HttpError(400, 'User not found');
        }

        const [affectedRows] = await UserModel.update(
            { balance: Database.connection.literal(`balance + ${amount}`) },
            { where: { id: userId, balance: { [Op.gte]: -amount } } },
        );

        if (affectedRows === 0) {
            throw new HttpError(400, 'Баланс пользователя не может быть отрицательным');
        }

        return true;
    }
}
