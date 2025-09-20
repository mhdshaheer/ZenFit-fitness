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
}
