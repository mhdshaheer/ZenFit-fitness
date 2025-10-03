import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICategory, IParams } from '../../interface/category.interface';
export type { ICategory };

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private api = environment.apiUrl + '/category';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(`${this.api}`);
  }
  getSubcateories(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(`${this.api}/subcategories`);
  }
  getCategory(id: string): Observable<ICategory> {
    return this.http.get<ICategory>(`${this.api}/${id}`);
  }
  createCategory(data: Partial<ICategory>): Observable<ICategory> {
    return this.http.post<ICategory>(`${this.api}`, data);
  }
  updateCategory(id: string, data: Partial<ICategory>) {
    return this.http.put<ICategory>(`${this.api}/${id}`, data);
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
      `${this.api}/table`,
      {
        params: httpParams,
        withCredentials: true,
      }
    );
  }
  checkDuplicateName(name: String): Observable<boolean> {
    return this.http.get<boolean>(`${this.api}/check-name?name=${name}`);
  }
  updateStatus(id: String, isBlocked: boolean): Observable<ICategory> {
    return this.http.put<ICategory>(`${this.api}/status/${id}`, { isBlocked });
  }
}
