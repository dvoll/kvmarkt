import { BackandService } from '../../service/backand.service';
import { DataService } from '../../service/data.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Blogpost } from '../../model/blogpost.model';
import { Scheme } from '../../model/scheme.model';
import { User } from '../../model/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  blogpost: Blogpost;
  blogposts: Blogpost[];
  hint: string;
  errorMessage: string;

  user_firstname: string;

  favSchemes: Scheme[];
  ownSchemes: Scheme[] = null;

  constructor(private _backandService: BackandService, private _dataService: DataService,
    private router: Router) {
    // _schemeDataService.createIndexedDB();
  }

  getBlogposts() {
    this._backandService.getBlogposts()
      .subscribe(
      bp => this.blogposts = bp,
      error => this.errorMessage = <any>error);
  }

  ngOnInit() {
    this.getBlogposts();
    this._dataService.getSchemes().subscribe(
      (schemes: Scheme[]) => {
        this.favSchemes = schemes.filter((scheme) => {
          return scheme.isFavorite;
        });
      }
    );
    console.time('Dashboard get Schemes');
    this._dataService.getUser().subscribe((user: User) => {
      this._dataService.getSchemes().subscribe((schemes: Scheme[]) => {
        schemes = schemes.filter((scheme, index) => {
          if (+scheme.author === user.contributor) {
            return scheme;
          }
        });
        if (schemes.length > 3) {
          schemes = schemes.slice(0, 3);
        }
        this.ownSchemes = schemes;
        console.timeEnd('Dashboard get Schemes');
      });
    });
    this.hint = 'Wird geladen...';
    this.user_firstname = localStorage.getItem('backand_user_firstname');
  }
}
