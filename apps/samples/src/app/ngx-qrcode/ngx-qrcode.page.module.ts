import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { NgxQrcodePage } from './ngx-qrcode.page';

const routes: Routes = [
  { path: '', component: NgxQrcodePage },
];

@NgModule({
  declarations: [NgxQrcodePage],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  bootstrap: [NgxQrcodePage],
})
export class NgxQrcodePageModule {}
