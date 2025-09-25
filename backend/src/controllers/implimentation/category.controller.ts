import { Request, Response } from "express";
import { ICategoryController } from "../interface/category.controller.interface";
import { inject } from "inversify";
import { TYPES } from "../../shared/types/inversify.types";
import { ICategoryService } from "../../services/interface/category.service.interface";
import { HttpStatus } from "../../const/statuscode.const";
import { CategoryDto } from "../../dtos/category.dtos";
import { HttpResponse } from "../../const/response_message.const";

export class CategoryController implements ICategoryController {
  constructor(
    @inject(TYPES.CategoryService) private categoryService: ICategoryService
  ) {}
  async findAllCategory(
    _req: Request,
    res: Response
  ): Promise<Response<CategoryDto[]>> {
    try {
      const categories: CategoryDto[] =
        await this.categoryService.findAllCategory();

      return res.status(HttpStatus.OK).json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to fetch categories" });
    }
  }
  async findAllSubCategory(
    _req: Request,
    res: Response
  ): Promise<Response<CategoryDto>> {
    try {
      const subCategories: CategoryDto[] =
        await this.categoryService.findALlSubCategory();

      return res.status(HttpStatus.OK).json(subCategories);
    } catch (error) {
      console.error("Error fetching sub categories:", error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to fetch sub categories" });
    }
  }

  async createCategory(
    req: Request,
    res: Response
  ): Promise<Response<CategoryDto>> {
    try {
      const categoryData = req.body;
      const response = await this.categoryService.createCategory(categoryData);
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(HttpResponse.SERVER_ERROR);
    }
  }

  async updateCategory(
    req: Request,
    res: Response
  ): Promise<Response<CategoryDto>> {
    try {
      const { id } = req.params;
      const category = req.body;
      const response = await this.categoryService.updateCategory(id, category);
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(HttpResponse.SERVER_ERROR);
    }
  }

  async getCategory(
    req: Request,
    res: Response
  ): Promise<Response<CategoryDto>> {
    try {
      const categoryId = req.params.id;
      const response = await this.categoryService.getCategory(categoryId);
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(HttpResponse.SERVER_ERROR);
    }
  }
}
