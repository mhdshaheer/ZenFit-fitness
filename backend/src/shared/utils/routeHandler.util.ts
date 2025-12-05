import { NextFunction, Request, RequestHandler, Response } from "express";

type ControllerHandler<Req extends Request> = (
    req: Req,
    res: Response,
    next?: NextFunction
) => Promise<unknown> | unknown;

type ControllerMiddleware<Req extends Request> = (
    req: Req,
    res: Response,
    next: NextFunction
) => Promise<unknown> | unknown;

export const adaptHandler =
    <Req extends Request = Request>(
        handler: ControllerHandler<Req>
    ): RequestHandler =>
        (req, res, next) => {
            Promise.resolve(handler(req as Req, res, next)).catch(next);
        };

export const adaptMiddleware =
    <Req extends Request = Request>(
        handler: ControllerMiddleware<Req>
    ): RequestHandler =>
        (req, res, next) => {
            Promise.resolve(handler(req as Req, res, next)).catch(next);
        };
