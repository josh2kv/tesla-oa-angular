import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CountryService } from '../../services/country.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.css'],
  imports: [CommonModule, RouterModule],
})
export class AutocompleteComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(
    private countryService: CountryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams
      .pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap((params) => {
          const q = params['q'];
          if (this.searchInput?.nativeElement) {
            this.searchInput.nativeElement.value = q || '';
          }
          return this.countryService.searchCountries(q);
        })
      )
      .subscribe();
  }

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: query },
      queryParamsHandling: 'merge',
    });
  }

  onSelect(country: string) {
    this.searchInput.nativeElement.value = country;
  }

  get countries$() {
    return this.countryService.countries$;
  }

  get loading$() {
    return this.countryService.loading$;
  }

  get error$() {
    return this.countryService.error$;
  }
}
