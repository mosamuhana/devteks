import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home').then((m) => m.HomePageModule),
  },
  {
    path: 'ngx-qrcode',
    loadChildren: () => import('./ngx-qrcode').then((m) => m.NgxQrcodePageModule),
  },
  {
    path: 'ngx-svg-icon',
    loadChildren: () => import('./ngx-svg-icon').then((m) => m.NgxSvgIconPageModule),
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabledBlocking',
      paramsInheritanceStrategy: 'always',
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      enableTracing: false,
      useHash: false,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
