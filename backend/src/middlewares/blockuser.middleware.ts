import { Request, Response, NextFunction } from "express";
import { AuthRepository } from "../repositories/implimentation/auth.repository"; // adjust path

export const blockUserMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as any).user;

    if (!user || !user.id) {
      res.status(401).json({ message: "Unauthorized: User not found" });
      return;
    }

    const authRepo = new AuthRepository();
    const foundUser = await authRepo.findById(user.id);

    if (!foundUser) {
      res.status(404).json({ message: "User not found in DB" });
      return;
    }

    if (foundUser.status == "blocked") {
      res
        .status(403)
        .json({ message: "Access denied: User account is blocked" });
      return;
    }

    next();
    return;
  } catch (err) {
    console.error("blockUserMiddleware error:", err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
