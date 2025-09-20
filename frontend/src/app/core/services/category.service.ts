import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ICategory {
  _id: string;
  name: string;
  description: string;
  parantId: string | null;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private api = environment.apiUrl + '/category';

  constructor(private http: HttpClient) {}
  getCategories(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(`${this.api}`);
  }
}
