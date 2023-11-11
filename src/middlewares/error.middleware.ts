import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/error.class';

export function ErrorMiddleware(error: Error, req: Request, res: Response, next: NextFunction) {
    if (error instanceof HttpError) {
        return res.status(error.status).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Internal server error' });
}
