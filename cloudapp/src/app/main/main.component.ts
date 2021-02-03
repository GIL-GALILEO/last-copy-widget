import { config, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  CloudAppRestService, CloudAppEventsService, Request, HttpMethod,
  Entity, PageInfo, RestErrorResponse, CloudAppConfigService
} from '@exlibris/exl-cloudapp-angular-lib';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';

export interface Criteria {
  id: number;
  name: string;
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  
  private pageLoad$: Subscription;
  base_url: string;
  private vid: string;
  pageEntities: Entity[];
  private _apiResult: any;

  hasApiResult: boolean = false;
  loading = false;
  almaResult: any;
  network_numbers: any;
  primo_url = '';
  title_primo_url = '';

  criteriaData: Criteria[] = [
    { id: 0, name: 'Title' },
    { id: 1, name: 'Author' },
    { id: 2, name: 'Publication Date' },
    { id: 3, name: 'ISBN' },
    { id: 4, name: 'ISSN' },
    { id: 5, name: 'Publisher'}
  ];
  search_form: FormGroup;

  constructor(private restService: CloudAppRestService,
    private fb: FormBuilder,
    private eventsService: CloudAppEventsService,
    private configService: CloudAppConfigService,
    private toastr: ToastrService) { }

  onChange(name: string, isChecked: boolean) {
      const cartoons = (this.search_form.controls.name as FormArray);
  
      if (isChecked) {
        cartoons.push(new FormControl(name));
      } else {
        const index = cartoons.controls.findIndex(x => x.value === name);
        cartoons.removeAt(index);
      }
  }
  
    ngOnInit() {
    this.pageLoad$ = this.eventsService.onPageLoad(this.onPageLoad);
    this.search_form = this.fb.group({
      name: this.fb.array([])
    });
    this.configService.get().subscribe( response => {
      console.log("Got the config:");
      console.log(response.serviceUrl);
      this.base_url = response.serviceUrl.substring(0,response.serviceUrl.indexOf('?'));
      this.vid = response.serviceUrl.substring((response.serviceUrl.lastIndexOf("=")+1), response.serviceUrl.length);
    },
    err => console.log(err.message));
  }

  submit() {
    let search_url = this.base_url.concat('?');
    let url_end = ',AND&tab=default_tab&search_scope=USG&sortby=rank&lang=en_US&mode=advanced&offset=0&vid='.concat(this.vid);
    let search_cond = this.search_form.value.name;
    const last_item = search_cond[search_cond.length - 1];
    search_cond.forEach(element => {
        switch (element) {
            case 'Title':
                search_url= search_url.concat('query=title,contains,', this.apiResult.title);
                if (element != last_item) {
                  search_url = search_url.concat(',OR&')
                }
                break;
            case 'Author':
                search_url= search_url.concat('query=creator,contains,', this.apiResult.author);
                if (element != last_item) {
                  search_url = search_url.concat(',OR&')
                }
                break;
            case 'ISBN':
              if (this.apiResult.isbn != null){
                search_url= search_url.concat('query=isbn,contains,', this.apiResult.isbn);
                if (element != last_item) {
                  search_url = search_url.concat(',OR&')
                }
              }
                break;
            case 'ISSN':
                if (this.apiResult.issn != null){
                  search_url= search_url.concat('query=issn,contains,', this.apiResult.issn);
                  if (element != last_item) {
                    search_url = search_url.concat(',OR&')
                  }
                }
                break;
            case 'Publisher':
                if (this.apiResult.publisher_const != null){
                  search_url= search_url.concat('query=lsr06,contains,', this.apiResult.publisher_const);
                  if (element != last_item) {
                    search_url = search_url.concat(',OR&')
                  }
                }
                break;
            default:
        }
    });
    search_url = search_url.concat(url_end);
    window.open(search_url, '_blank');
  }

  ngOnDestroy(): void {
    this.pageLoad$.unsubscribe();
  }

  get apiResult() {
    return this._apiResult;
  }

  set apiResult(result: any) {
    this._apiResult = result;
    this.hasApiResult = result && Object.keys(result).length > 0;
  }

  onPageLoad = (pageInfo: PageInfo) => {
    this.pageEntities = pageInfo.entities;
    if ((pageInfo.entities || []).length == 1) {
      const entity = pageInfo.entities[0];
      this.restService.call(entity.link).subscribe(result => {
        console.log(result);
        this.primo_url = this.createPrimoUrl(result.network_number);
        this.apiResult = result;
      })
    } else {
      this.apiResult = {};
    }
    
  }

  refreshPage = () => {
    this.loading = true;
    this.eventsService.refreshPage().subscribe({
      next: () => this.toastr.success('Success!'),
      error: e => {
        console.error(e);
        this.toastr.error('Failed to refresh page');
      },
      complete: () => this.loading = false
    });
  }

  private tryParseJson(value: any) {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error(e);
    }
    return undefined;
  }
  
  createPrimoUrl(value: any){
    console.log("Went into fucntion");
    //console.log(value);
    let net_nums = value;
    let search_url = this.base_url.concat('?query=any,contains,');
    let url_end = ',AND&tab=default_tab&search_scope=USG&sortby=rank&lang=en_US&mode=advanced&offset=0&vid='.concat(this.vid);
    let nz_number = ''; 
    net_nums.forEach(element => {
      if (element.search(/EXLNZ-01GALI_NETWORK/) != -1){
        nz_number = element.slice(23);
        search_url = search_url.concat(nz_number);
      }
      else{
        search_url = search_url.concat(element);
        search_url = search_url.concat(',OR&query=any,contains,');
      }
    });

    search_url = search_url.concat(url_end);
    console.log(search_url);
    return search_url;
  }

}
