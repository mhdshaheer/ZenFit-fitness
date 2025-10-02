import { NextFunction, Request, Response } from "express";
import { CategoryDto } from "../../dtos/category.dtos";

export interface ICategoryController {
  findAllCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<CategoryDto[]>>;
  findAllSubCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<CategoryDto>>;
  createCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<CategoryDto>>;
  updateCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<CategoryDto>>;
  getCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<CategoryDto>>;
  checkCategoryName(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<boolean>>;
}
