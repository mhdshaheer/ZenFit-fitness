import { inject } from "inversify";
import { ICategoryService } from "../interface/category.service.interface";
import { ICategoryRepository } from "../../repositories/interface/category.repository.interface";
import { TYPES } from "../../shared/types/inversify.types";
import logger from "../../shared/services/logger.service";
import { mapToCategoryDto } from "../../mapper/category.mapper";
import { CategoryDto } from "../../dtos/category.dtos";
import { ICategory } from "../../models/category.model";
import { AppError } from "../../shared/utils/appError.util";
import { HttpStatus } from "../../const/statuscode.const";
import { GetCategoryParams } from "../../interfaces/category.interface";
import { HttpResponse } from "../../const/response_message.const";

export class CategoryService implements ICategoryService {
  @inject(TYPES.CategoryRepository)
  private readonly _categoryRepository!: ICategoryRepository;

  async findAllCategory(): Promise<CategoryDto[]> {
    try {
      const categories = await this._categoryRepository.findAllCategory({
        parantId: null,
      });
      if (categories === null) {
        throw new AppError(
          HttpResponse.CATEGORY_NOTFOUND,
          HttpStatus.NOT_FOUND
        );
      }
      const categoryDto = categories?.map(mapToCategoryDto);

      return categoryDto;
    } catch (error) {
      logger.error("Error fetching categories:", error);
      throw new AppError(
        HttpResponse.CATEGORY_FETCH_FAILED,
        HttpStatus.CONFLICT
      );
    }
  }
  async findALlSubCategory(): Promise<CategoryDto[]> {
    try {
      const subCategories = await this._categoryRepository.findAllCategory({
        parantId: { $ne: null },
      });
      if (subCategories === null) {
        throw new AppError(
          HttpResponse.CATEGORY_NOTFOUND,
          HttpStatus.NOT_FOUND
        );
      }
      const subCategoryDto = subCategories?.map(mapToCategoryDto);

      return subCategoryDto;
    } catch (error) {
      logger.error("Error fetching sub categories:", error);
      throw new AppError(
        HttpResponse.CATEGORY_FETCH_FAILED,
        HttpStatus.NOT_FOUND
      );
    }
  }

  async createCategory(data: Partial<ICategory>): Promise<CategoryDto> {
    const category = await this._categoryRepository.createCategory(data);
    if (category === null || category === undefined) {
      throw new AppError(
        HttpResponse.CATEGOTY_CREATION_FAILED,
        HttpStatus.CONFLICT
      );
    }
    const mappedResult = mapToCategoryDto(category);
    return mappedResult;
  }

  async updateCategory(
    categoryId: string,
    categoryData: Partial<ICategory>
  ): Promise<CategoryDto> {
    const category = await this._categoryRepository.updateCategory(
      categoryId,
      categoryData
    );
    if (!category) {
      throw new AppError(
        HttpResponse.CATEGORY_UPDATION_FAILED,
        HttpStatus.CONFLICT
      );
    }
    const mappedCategory = mapToCategoryDto(category);
    return mappedCategory;
  }

  async getCategory(categoryId: string): Promise<CategoryDto> {
    const category = await this._categoryRepository.getCategory(categoryId);
    if (!category) {
      throw new AppError(
        HttpResponse.CATEGORY_FETCH_FAILED,
        HttpStatus.NOT_FOUND
      );
    }
    const mappedCategory = mapToCategoryDto(category);
    return mappedCategory;
  }
  async checkDuplicateName(name: string): Promise<boolean> {
    const category = await this._categoryRepository.findByCategoryName(
      name.trim()
    );
    return !!category;
  }
  async updateStatus(
    categoryId: string,
    isBlocked: boolean
  ): Promise<CategoryDto> {
    const category = await this._categoryRepository.updateStatus(
      categoryId,
      isBlocked
    );
    if (!category) {
      throw new AppError(HttpResponse.CATEGORY_NOTFOUND, HttpStatus.NOT_FOUND);
    }
    const categoryDto = mapToCategoryDto(category);
    return categoryDto;
  }

  async getTableCategories(
    params: GetCategoryParams
  ): Promise<{ data: CategoryDto[]; total: number }> {
    const { total, data } = await this._categoryRepository.getAllForTable(
      params
    );
    const categoryDto = data.map(mapToCategoryDto);
    return { data: categoryDto, total };
  }
}
