import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, delay, finalize, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private readonly apiUrl = 'assets/data/countries.json';

  private readonly countriesSubject = new BehaviorSubject<string[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly countries$ = this.countriesSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  searchCountries(q: string): Observable<string[]> {
    if (!q.trim()) {
      this.countriesSubject.next([]);
      return of([]);
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    const params = new HttpParams({ fromObject: { q } });
    return this.http.get<{ items: string[] }>(this.apiUrl, { params }).pipe(
      delay(500),
      map((response) => response.items),
      tap((countries) => {
        const filteredCountries = countries
          .filter((country) => country.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 10);
        this.countriesSubject.next(filteredCountries);
      }),
      catchError((error) => {
        console.error('Error fetching countries:', error);
        this.errorSubject.next(error.message);
        return of([]);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }
}
