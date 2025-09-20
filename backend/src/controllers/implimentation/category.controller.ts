import { Request, Response } from "express";
import { ICategoryController } from "../interface/category.controller.interface";
import { inject } from "inversify";
import { TYPES } from "../../shared/types/inversify.types";
import { ICategoryService } from "../../services/interface/category.service.interface";
import { HttpStatus } from "../../const/statuscode.const";

export class CategoryController implements ICategoryController {
  constructor(
    @inject(TYPES.CategoryService) private categoryService: ICategoryService
  ) {}
  async findAllCategory(_req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.categoryService.findAllCategory();
      res.status(HttpStatus.OK).json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to fetch categories" });
    }
  }
}
