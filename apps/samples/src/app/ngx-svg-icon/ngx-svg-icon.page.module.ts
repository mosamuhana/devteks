import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { NgxSvgIconModule } from '@devteks/ngx-svg-icon';
import { NgxSvgIconPage } from './ngx-svg-icon.page';

const routes: Routes = [
  { path: '', component: NgxSvgIconPage },
];

@NgModule({
  declarations: [NgxSvgIconPage],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxSvgIconModule,
  ],
  bootstrap: [NgxSvgIconPage],
})
export class NgxSvgIconPageModule {}
