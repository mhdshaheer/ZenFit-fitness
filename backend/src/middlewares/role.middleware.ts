import { RequestHandler } from "express";
import { HttpStatus } from "../const/statuscode.const";
import { AuthenticatedRequest } from "../types/authenticated-request.type";

export const allowRoles = (...roles: string[]): RequestHandler => {
    return (req, res, next) => {
        const { role } = (req as AuthenticatedRequest).user ?? {};
        if (!role || !roles.includes(role)) {
            res.status(HttpStatus.FORBIDDEN).json({
                success: false,
                message: "Forbidden",
            });
            return;
        }
        next();
    };
};
