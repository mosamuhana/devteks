import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { SvgIconComponent } from './svg-icon.component';

@NgModule({
	imports: [
    CommonModule,
    HttpClientModule,
  ],
	declarations: [ SvgIconComponent ],
	exports: [ SvgIconComponent ],
})
export class NgxSvgIconModule {}
