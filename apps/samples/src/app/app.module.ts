import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxSvgIconModule } from '@devteks/ngx-svg-icon';
import { initializeAppProvider } from './init-app';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxSvgIconModule,
  ],
  providers: [initializeAppProvider],
  bootstrap: [AppComponent],
})
export class AppModule { }
