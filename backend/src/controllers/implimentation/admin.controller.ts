import { Request, Response } from "express";
import { HttpStatus } from "../../const/statuscode.const";
import { IAdminController } from "../interface/admin.controller.interface";
import { inject, injectable } from "inversify";
import { mapToUserStatusDto } from "../../mapper/user.mapper";
import { TYPES } from "../../shared/types/inversify.types";
import { IAdminService } from "../../services/interface/admin.service.interface";
import { AppError } from "../../shared/utils/appError.util";

// admin controller
@injectable()
export class AdminController implements IAdminController {
  constructor(
    @inject(TYPES.AdminService) private adminService: IAdminService
  ) {}

  async getUsers(req: Request, res: Response): Promise<void> {
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

    if (!result) {
      throw new AppError(
        "Failed to fetch users",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    res.status(HttpStatus.OK).json(result);
  }

  async updateUserStatus(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const { status } = req.body;

    if (!["active", "blocked"].includes(status)) {
      throw new AppError(
        'Invalid status: must be "active" or "blocked"',
        HttpStatus.BAD_REQUEST
      );
    }

    const user = await this.adminService.updateUserStatus(id, status);

    if (!user) {
      throw new AppError("User not found", HttpStatus.NOT_FOUND);
    }

    const responseDto = mapToUserStatusDto(user, status);

    res.status(HttpStatus.OK).json({
      responseDto,
    });
  }
}
