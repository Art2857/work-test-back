import { UserModel } from '../models/user.model';

export async function migration() {
    try {
        await UserModel.create({ balance: 10000 });
        console.log('Пользователь добавлен');
    } catch (error) {
        console.error('Error:', error);
    }
} 
