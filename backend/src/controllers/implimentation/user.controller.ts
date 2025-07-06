import { Request, Response } from "express";
import { AuthService } from "../../services/implimentation/auth.service";

export class UserController {
  private userService: AuthService;

  constructor() {
    this.userService = new AuthService();
  }

  public getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  };
  blockUser = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const user = await this.userService.blockUser(userId);
      res.status(200).json({ message: "User blocked successfully", user });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  unblockUser = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const user = await this.userService.unblockUser(userId);
      res.status(200).json({ message: "User unblocked successfully", user });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };
}
