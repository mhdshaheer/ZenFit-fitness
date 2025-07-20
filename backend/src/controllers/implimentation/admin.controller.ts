import { Request, Response } from "express";
import { AuthService } from "../../services/implimentation/auth.service";
import { AdminService } from "../../services/implimentation/admin.service";

export class AdminController {
  private userService: AuthService;
  private adminService: AdminService;

  constructor() {
    this.userService = new AuthService();
    this.adminService = new AdminService();
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
      res.status(200).json({ message: "User unblocked successfully", user });
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

  async updateUserStatus(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const { status } = req.body;

      if (!["active", "blocked"].includes(status)) {
        return res
          .status(400)
          .json({ message: 'Invalid status: must be "active" or "blocked"' });
      }

      const user = await this.adminService.updateUserStatus(id, status);
      res.status(200).json({
        message: `User status updated to ${status}`,
        user,
      });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }
}
