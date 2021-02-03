
import { Injectable } from '@angular/core';
import { InitService } from '@exlibris/exl-cloudapp-angular-lib';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AppService {
    /*setTitle(arg0: string) {
      throw new Error('Method not implemented.');
    }*/

    private title = new BehaviorSubject<String>('App title');
    private title$ = this.title.asObservable();

  setTitle(title: String) {
      this.title.next(title);
  }
  
  getTitle(): Observable<String> {
      return this.title$;
  }

    constructor(private initService: InitService) {}

}