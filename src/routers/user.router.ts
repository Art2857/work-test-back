import { NextFunction, Request, Response, Router } from 'express';
import { UserRepository } from '../database/repositories/user.repository';
import { HttpError } from '../utils/http-error.class';
import { UserService } from '../services/user.service';

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
    const count = 10000;

    const successed = await UserService.testStress(count);

    res.json({ message: `Test balance user successed: ${successed} / ${count}` });
});
