import { RequestHandler } from 'express';
import { HttpStatus } from '../const/statuscode.const';

export const allowRoles = (...roles: string[]): RequestHandler => {
    return (req, res, next) => {
        const role = (req as any)?.user?.role;
        if (!role || !roles.includes(role)) {
            res.status(HttpStatus.FORBIDDEN).json({
                success: false,
                message: 'Forbidden',
            });
            return;
        }
        next();
    };
};
