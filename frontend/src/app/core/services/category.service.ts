import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICategory } from '../../interface/category.interface';
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
  createCategory(data: Partial<ICategory>): Observable<ICategory> {
    return this.http.post<ICategory>(`${this.api}`, data);
  }
  checkDuplicateName(name: String): Observable<boolean> {
    return this.http.get<boolean>(`${this.api}/check-name?name=${name}`);
  }
}
