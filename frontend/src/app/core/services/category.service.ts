import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICategory, IParams } from '../../interface/category.interface';
import { CategoryRoutes } from '../constants/api-routes.const';
export type { ICategory };

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly _api = environment.apiUrl + CategoryRoutes.BASE;
  private readonly _http = inject(HttpClient);

  getCategories(): Observable<ICategory[]> {
    return this._http.get<ICategory[]>(this._api);
  }
  createCategory(data: Partial<ICategory>): Observable<ICategory> {
    return this._http.post<ICategory>(this._api, data);
  }
  getSubcateories(): Observable<ICategory[]> {
    return this._http.get<ICategory[]>(
      this._api + CategoryRoutes.SUBCATEGORIES
    );
  }
  getCategory(categoryId: string): Observable<ICategory> {
    return this._http.get<ICategory>(
      this._api + CategoryRoutes.BY_CategoryID(categoryId)
    );
  }
  updateCategory(categoryId: string, data: Partial<ICategory>) {
    return this._http.put<ICategory>(
      this._api + CategoryRoutes.BY_CategoryID(categoryId),
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
    return this._http.get<{ total: number; data: ICategory[] }>(
      this._api + CategoryRoutes.TABLE,
      {
        params: httpParams,
        withCredentials: true,
      }
    );
  }
  checkDuplicateName(categoryName: string): Observable<boolean> {
    return this._http.get<boolean>(
      this._api + CategoryRoutes.CHECK_NAME + `?name=${categoryName}`
    );
  }
  updateStatus(categoryId: string, isBlocked: boolean): Observable<ICategory> {
    return this._http.put<ICategory>(
      this._api + CategoryRoutes.STATUS(categoryId),
      {
        isBlocked,
      }
    );
  }
}
