import { Request, Response } from "express";
import { AuthService } from "../../services/implimentation/auth.service";
import { AdminService } from "../../services/implimentation/admin.service";
import { HttpStatus } from "../../const/statuscode.const";

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = (req.query.search as string) || "";
      const sortBy = (req.query.sortBy as string) || "createdAt";
      const sortOrder = (req.query.sortOrder as string) === "desc" ? -1 : 1;

      const result = await this.adminService.getUsers({
        page,
        pageSize,
        search,
        sortBy,
        sortOrder,
      });

      console.log("result is :", result);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateUserStatus(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const { status } = req.body;

      if (!["active", "blocked"].includes(status)) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Invalid status: must be "active" or "blocked"' });
        return;
      }

      const user = await this.adminService.updateUserStatus(id, status);
      res.status(HttpStatus.OK).json({
        message: `User status updated to ${status}`,
        user,
      });
      return;
    } catch (error: any) {
      res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      return;
    }
  }
}
