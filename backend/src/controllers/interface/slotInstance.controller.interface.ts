import { Request, Response } from "express";

export interface ISlotInstanceController {
    getInstances(req: Request, res: Response): Promise<Response<any>>;
    generateForTemplate(req: Request, res: Response): Promise<Response<any>>;
    getInstancesForProgram(req: Request, res: Response): Promise<Response<any>>;
    cancelInstance(req: Request, res: Response): Promise<Response<any>>;
}
