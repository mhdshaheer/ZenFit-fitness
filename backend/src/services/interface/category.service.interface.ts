import { CategoryDto } from "../../dtos/category.dtos";

export interface ICategoryService {
  findAllCategory(): Promise<CategoryDto[]>;
  findALlSubCategory(): Promise<CategoryDto[]>;
}
