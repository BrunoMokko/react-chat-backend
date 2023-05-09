import express from 'express';
import { UserModel } from '../models';

export default async (req: express.Request, _: express.Response, next: express.NextFunction) => {
    if (req.user) {
        const user = await UserModel.findOneAndUpdate(
            { _id: req.user._id },
            {
                last_seen: new Date(),
            },
            { new: true },
        ).exec();

        // проверяем, был ли найден пользователь и обновлен last_seen
        if (user) {
            console.log('User last_seen updated:', user.last_seen);
        } else {
            console.log('User not found');
        }
    }
    next();
};
