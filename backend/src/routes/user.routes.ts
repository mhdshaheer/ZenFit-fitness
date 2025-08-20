import { Request, Response, Router } from "express";
import authMiddleware from "../middlewares/verifyToken.middleware";

const userRouter = Router();

userRouter.get("/profile", authMiddleware, (req: Request, res: Response) => {
  console.log("Request : ", (req as any).user.id);
});

export default userRouter;
