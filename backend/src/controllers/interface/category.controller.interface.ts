import { Request, Response } from "express";
import { CategoryDto } from "../../dtos/category.dtos";

export interface ICategoryController {
  findAllCategory(
    req: Request,
    res: Response
  ): Promise<Response<CategoryDto[]>>;
  findAllSubCategory(
    req: Request,
    res: Response
  ): Promise<Response<CategoryDto>>;
  createCategory(req: Request, res: Response): Promise<Response<CategoryDto>>;
  updateCategory(req: Request, res: Response): Promise<Response<CategoryDto>>;
  getCategory(req: Request, res: Response): Promise<Response<CategoryDto>>;
}
