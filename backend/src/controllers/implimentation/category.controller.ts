import { NextFunction, Request, Response } from "express";
import { ICategoryController } from "../interface/category.controller.interface";
import { inject, injectable } from "inversify";
import { TYPES } from "../../shared/types/inversify.types";
import { ICategoryService } from "../../services/interface/category.service.interface";
import { HttpStatus } from "../../const/statuscode.const";
import { CategoryDto } from "../../dtos/category.dtos";
import { AppError } from "../../shared/utils/appError.util";
import { HttpResponse } from "../../const/response_message.const";

@injectable()
export class CategoryController implements ICategoryController {
  constructor(
    @inject(TYPES.CategoryService)
    private readonly _categoryService: ICategoryService
  ) { }
  async findAllCategory(
    _req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<Response<CategoryDto[]>> {
    const categories = await this._categoryService.findAllCategory();
    return res.status(HttpStatus.OK).json(categories);
  }
  /**
   *
   * @param _req
   * @param res
   * @param _next
   * @returns
   */
  async findAllSubCategory(
    _req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<Response<CategoryDto>> {
    const subCategories: CategoryDto[] =
      await this._categoryService.findALlSubCategory();
    return res.status(HttpStatus.OK).json(subCategories);
  }

  async createCategory(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<Response<CategoryDto>> {
    const categoryData = req.body;
    const response = await this._categoryService.createCategory(categoryData);
    return res.status(HttpStatus.OK).json(response);
  }

  async updateCategory(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<Response<CategoryDto>> {
    const { id } = req.params;
    const category = req.body;
    const response = await this._categoryService.updateCategory(id, category);
    return res.status(HttpStatus.OK).json(response);
  }

  async getCategory(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<Response<CategoryDto>> {
    const categoryId = req.params.id;
    const response = await this._categoryService.getCategory(categoryId);
    return res.status(HttpStatus.OK).json(response);
  }

  async checkCategoryName(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<Response<boolean>> {
    const { name } = req.query;
    if (!name || typeof name !== "string") {
      throw new AppError(
        HttpResponse.CATEGORY_NAME_REQUIRED,
        HttpStatus.BAD_REQUEST
      );
    }
    const isDuplicate = await this._categoryService.checkDuplicateName(name);
    return res.status(HttpStatus.OK).json(isDuplicate);
  }

  async updateStatus(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<Response<CategoryDto>> {
    const { id } = req.params;
    const { isBlocked } = req.body;
    const category = await this._categoryService.updateStatus(id, isBlocked);
    return res.status(HttpStatus.OK).json(category);
  }

  async getTableCategories(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<Response<CategoryDto[]>> {
    const page = parseInt(req.query.page as string);
    const pageSize = parseInt(req.query.pageSize as string);
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string;
    const sortOrder = (req.query.sortOrder as string) === "desc" ? -1 : 1;

    const result = await this._categoryService.getTableCategories({
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
    });

    if (!result) {
      throw new AppError(
        HttpResponse.CATEGORY_FETCH_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    return res.status(HttpStatus.OK).json(result);
  }
}
