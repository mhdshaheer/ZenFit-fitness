import { NextFunction, Request, Response } from "express";
import { ICategoryController } from "../interface/category.controller.interface";
import { inject } from "inversify";
import { TYPES } from "../../shared/types/inversify.types";
import { ICategoryService } from "../../services/interface/category.service.interface";
import { HttpStatus } from "../../const/statuscode.const";
import { CategoryDto } from "../../dtos/category.dtos";

export class CategoryController implements ICategoryController {
  constructor(
    @inject(TYPES.CategoryService) private categoryService: ICategoryService
  ) {}
  async findAllCategory(
    _req: Request,
    res: Response,
    _next:NextFunction
  ): Promise<Response<CategoryDto[]>> {
      const categories = await this.categoryService.findAllCategory();
      return res.status(HttpStatus.OK).json(categories);
  }
  async findAllSubCategory(
    _req: Request,
    res: Response,
    _next:NextFunction
  ): Promise<Response<CategoryDto>> {
      const subCategories: CategoryDto[] =
        await this.categoryService.findALlSubCategory();
      return res.status(HttpStatus.OK).json(subCategories);
 
  }

  async createCategory(
    req: Request,
    res: Response,
    _next:NextFunction
  ): Promise<Response<CategoryDto>> {
      const categoryData = req.body;
      const response = await this.categoryService.createCategory(categoryData);
      return res.status(HttpStatus.OK).json(response);
    
  }

  async updateCategory(
    req: Request,
    res: Response,
    _next:NextFunction
  ): Promise<Response<CategoryDto>> {
      const { id } = req.params;
      const category = req.body;
      const response = await this.categoryService.updateCategory(id, category);
      return res.status(HttpStatus.OK).json(response);
  }

  async getCategory(
    req: Request,
    res: Response,
    _next:NextFunction
  ): Promise<Response<CategoryDto>> {
      const categoryId = req.params.id;
      const response = await this.categoryService.getCategory(categoryId);
      return res.status(HttpStatus.OK).json(response);
  }
}
