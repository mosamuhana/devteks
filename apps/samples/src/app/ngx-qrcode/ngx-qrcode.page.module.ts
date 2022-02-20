import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { NgxQRCodeModule } from '@devteks/ngx-qrcode';
import { NgxQrcodePage } from './ngx-qrcode.page';

const routes: Routes = [
  { path: '', component: NgxQrcodePage },
];

@NgModule({
  declarations: [NgxQrcodePage],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxQRCodeModule,
  ],
  bootstrap: [NgxQrcodePage],
})
export class NgxQrcodePageModule {}
