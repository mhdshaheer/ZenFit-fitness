import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICategory, IParams } from '../../interface/category.interface';
import { CategoryRoutes } from '../constants/api-routes.const';
export type { ICategory };

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private api = environment.apiUrl + CategoryRoutes.BASE;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(this.api);
  }
  createCategory(data: Partial<ICategory>): Observable<ICategory> {
    return this.http.post<ICategory>(this.api, data);
  }
  getSubcateories(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(this.api + CategoryRoutes.SUBCATEGORIES);
  }
  getCategory(categoryId: string): Observable<ICategory> {
    return this.http.get<ICategory>(
      this.api + CategoryRoutes.BY_CategoryID(categoryId)
    );
  }
  updateCategory(categoryId: string, data: Partial<ICategory>) {
    return this.http.put<ICategory>(
      this.api + CategoryRoutes.BY_CategoryID(categoryId),
      data
    );
  }
  getCategoryTable(
    params: IParams
  ): Observable<{ total: number; data: ICategory[] }> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString())
      .set('sortBy', params.sortBy || 'createdAt')
      .set('sortOrder', params.sortOrder || 'asc');

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    return this.http.get<{ total: number; data: ICategory[] }>(
      this.api + CategoryRoutes.TABLE,
      {
        params: httpParams,
        withCredentials: true,
      }
    );
  }
  checkDuplicateName(categoryName: string): Observable<boolean> {
    return this.http.get<boolean>(
      this.api + CategoryRoutes.CHECK_NAME + `?name=${categoryName}`
    );
  }
  updateStatus(categoryId: string, isBlocked: boolean): Observable<ICategory> {
    return this.http.put<ICategory>(
      this.api + CategoryRoutes.STATUS(categoryId),
      {
        isBlocked,
      }
    );
  }
}
