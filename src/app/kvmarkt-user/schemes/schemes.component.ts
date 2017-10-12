import { BackandService } from '../../service/backand.service';
import { DataService } from '../../service/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs/operator/filter';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Scheme } from '../../model/scheme.model';
import { slideTileAnimation, slideAnimation } from '../../fade.animation';

@Component({
  selector: 'app-schemes',
  templateUrl: './schemes.component.html',
  styleUrls: ['./schemes.component.css'],
  animations: [slideTileAnimation, slideAnimation]
})
export class SchemesComponent implements OnInit, AfterViewInit {

  schemes: Scheme[] = [];

  typePagination = false;

  page = 1;
  pageSize = 4;
  totalRows: number;
  countPages: Array<any> = new Array<any>();

  categoriesID: number[];
  categories: any[];

  private readonly defaultSortingField = 'title';
  private readonly defaultSortingOrderAsc = true;
  private readonly defaultSortingString = 'alpha_asc';

  selectedSortingField = this.defaultSortingField;
  selectedSortingOrderAsc = this.defaultSortingOrderAsc;
  selectedSortingString = this.defaultSortingString;

  loading = false;
  firstLoad = true;
  private schouldAnimateSchemes = 'yes';

  scheme_categories: Array<{ name: string, id: number }> = [];
  scheme_places: Array<{ name: string, id: number }> = [];
  scheme_ages: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  age_start = this.scheme_ages[0];
  age_end = this.scheme_ages[this.scheme_ages.length - 1];
  scheme_category = 0;
  scheme_place = 0;

  constructor(private backandService: BackandService, private _dataService: DataService,
    private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
    this.route.params
      .subscribe(params => {
        if (this.firstLoad) {
          // set page
          this.page = +params['page'] || this.page;
          this.scheme_place = +params['place'] || this.scheme_place;
          this.scheme_category = +params['categories'] || this.scheme_category;
          this.age_start = +params['age_start'] || this.age_start;
          this.age_end = +params['age_end'] || this.age_end;
          // this.setCategories(params['categories'] || '');
          this.setSorting(params['sort'] || '');
          this.loadSchemes(1, this.pageSize * this.page);
          this.firstLoad = false;
        }
      });
    this._dataService.getCategories()
      .subscribe(data => this.scheme_categories = this.scheme_categories.concat(data));
    this._dataService.getPlaces()
      .subscribe(data => this.scheme_places = this.scheme_places.concat(data));
  }

  ngAfterViewInit() {
    // this.animate = 10;
  }

  private setSorting(sortingString: string) {
    if (sortingString === '') { return; }
    switch (sortingString) {
      case 'date_desc':
        this.selectedSortingString = 'date_desc';
        this.selectedSortingField = 'created';
        this.selectedSortingOrderAsc = false;
        break;
      case 'date_asc':
        this.selectedSortingString = 'date_asc';
        this.selectedSortingField = 'created';
        this.selectedSortingOrderAsc = true;
        break;
      case 'alpha_desc':
        this.selectedSortingString = 'alpha_desc';
        this.selectedSortingField = 'title';
        this.selectedSortingOrderAsc = false;
        break;
      case 'alpha_asc':
        this.selectedSortingString = 'alpha_asc';
        this.selectedSortingField = 'title';
        this.selectedSortingOrderAsc = true;
        break;
      default:
        this.selectedSortingString = this.defaultSortingString;
        this.selectedSortingField = this.defaultSortingField;
        this.selectedSortingOrderAsc = this.defaultSortingOrderAsc;
        break;
    }
  }

  onParameterChange() {
    this.setSorting(this.selectedSortingString);
    // this.schemes = [];
    this.page = 1;
    this.loadSchemes(this.page, this.pageSize);
    this.setRouteUrl();
  }

  appendSchemes() {
    this.page++;
    this.loadSchemes(this.page, this.pageSize);
    this.setRouteUrl();
  }

  private setRouteUrl() {
    // set params
    // page
    const params: any = {};
    params.page = this.page;

    if (this.scheme_category !== 0) {
      params.categories = this.scheme_category;
    }

    // place
    if (this.scheme_place !== 0) {
      params.place = this.scheme_place;
    }
    // age
    if (this.age_start > this.scheme_ages[0]) {
      params.age_start = this.age_start;
    }
    if (this.age_end < this.scheme_ages[this.scheme_ages.length - 1]) {
      params.age_end = this.age_end;
    }

    // sorting
    if (this.selectedSortingString !== this.defaultSortingString) {
      params.sort = this.selectedSortingString;
    }
    this.router.navigate(['/schemes', params]);
  }

  loadSchemes(page: number, pageSize: number) {
    this.loading = true;
    this.schouldAnimateSchemes = 'no';
    setTimeout(() => this.loadSchemesFromService(page, pageSize), 1);
  }

  private loadSchemesFromService(page: number, pageSize: number) {
    this._dataService.getSchemes().subscribe((schemes) => {
      const result = schemes.filter((scheme) => {
        if (this.checkSchemeParameters(scheme)) {
          return true;
        }
      });
      this.totalRows = result.length;
      // this.countPages = new Array(Math.ceil(this.totalRows / this.pageSize));
      this.loading = false;
      this.schemes = result;
      this.schouldAnimateSchemes = 'yes';
    });
  }

  checkSchemeParameters(scheme: Scheme): boolean {
    let filter = scheme.age_end >= this.age_start && scheme.age_start <= this.age_end;
    if (this.scheme_category !== 0) {
      filter = filter && +scheme.category === this.scheme_category;
    }
    if (this.scheme_place !== 0) {
      filter = filter && +scheme.place === this.scheme_place;
    }
    if (this.age_start > this.scheme_ages[0]) {
      filter = filter && +scheme.age_end >= this.age_start;
    }
    if (this.age_end <= this.scheme_ages[this.scheme_ages.length - 1]) {
      filter = filter && +scheme.age_start <= this.age_end;
    }
    return filter;
  }

  handleSchemes(body: any) {
    if (this.schemes === undefined) {
      this.schemes = [];
    }
    body.data.forEach(
      (scheme: Scheme) => {
        this.schemes.push(scheme);
      }
    );
    this.totalRows = body.totalRows;
    // this.countPages = new Array(Math.ceil(this.totalRows / this.pageSize));
    this.loading = false;
  }

  getSchemeAnimateState() {
    return this.schouldAnimateSchemes; // + this.schemes.length;
  }
}