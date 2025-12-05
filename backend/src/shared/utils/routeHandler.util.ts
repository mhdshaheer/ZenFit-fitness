import { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncResult = Promise<unknown> | unknown;

type ControllerHandler<Req extends Request> =
    | ((req: Req, res: Response) => AsyncResult)
    | ((req: Req, res: Response, next: NextFunction) => AsyncResult);

type ControllerMiddleware<Req extends Request> = (
    req: Req,
    res: Response,
    next: NextFunction
) => AsyncResult;

export const adaptHandler =
    <Req extends Request = Request>(
        handler: ControllerHandler<Req>
    ): RequestHandler =>
        (req, res, next) => {
            const result =
                handler.length >= 3
                    ? (
                        handler as (
                            req: Req,
                            res: Response,
                            next: NextFunction
                        ) => AsyncResult
                    )(req as Req, res, next)
                    : (handler as (req: Req, res: Response) => AsyncResult)(
                        req as Req,
                        res
                    );

            Promise.resolve(result).catch(next);
        };

export const adaptMiddleware =
    <Req extends Request = Request>(
        handler: ControllerMiddleware<Req>
    ): RequestHandler =>
        (req, res, next) => {
            Promise.resolve(handler(req as Req, res, next)).catch(next);
        };
