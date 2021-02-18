import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CloudAppConfigService, AlertService } from '@exlibris/exl-cloudapp-angular-lib';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  form: FormGroup;
  saving = false;
  
  constructor(
    private appService: AppService,
    private fb: FormBuilder,
    private configService: CloudAppConfigService,
    private alert: AlertService
  ) { }

  ngOnInit() {
    this.appService.setTitle('Configuration');
    this.form = this.fb.group({
      serviceUrl: this.fb.control('')
    });
    this.load();
  }

  load() {
    this.configService.getAsFormGroup().subscribe( config => {
      if (Object.keys(config.value).length!=0) {
        this.form = config;
      }
    });   
  }

  save() {
    this.saving = true;
    this.configService.set(this.form.value).subscribe(
      () => {
        this.alert.success('Configuration successfully saved.');
        this.form.markAsPristine();
      },
      err => this.alert.error(err.message),
      ()  => this.saving = false
    );
  }  

}
