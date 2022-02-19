import { NgModule, ModuleWithProviders } from '@angular/core';

import { NgxQRCodeComponent } from "./ngx-qrcode.component"
import { QRCodeConfig, QRCODE_CONFIG_TOKEN, DEFAULT_QRCODE_CONFIG } from './types';

@NgModule({
  declarations: [NgxQRCodeComponent],
  exports: [NgxQRCodeComponent],
})
export class NgxQRCodeModule {
  static forRoot(config?: QRCodeConfig): ModuleWithProviders<NgxQRCodeModule> {
    return {
      ngModule: NgxQRCodeModule,
      providers: [
        { provide: QRCODE_CONFIG_TOKEN, useValue: config ?? DEFAULT_QRCODE_CONFIG },
      ],
    };
  }
}
