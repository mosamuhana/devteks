import { APP_INITIALIZER, Provider } from '@angular/core';
import { SvgIconRegistryService } from '@devteks/ngx-svg-icon';

export const initializeAppProvider: Provider = {
  provide: APP_INITIALIZER,
  multi: true,
  useFactory: (reg: SvgIconRegistryService) => () => registerSvgIcons(reg),
  deps: [SvgIconRegistryService],
};

function registerSvgIcons(registry: SvgIconRegistryService) {
  for (const icon of SVG_ICONS) {
    registry.loadSvg(`assets/icons/${icon}.svg`, icon);
  }
}

const SVG_ICONS = [
  'close',
  'comments',
  'home',
  'login',
  'logout',
  'map',
  'menu',
  'moon',
  'sun',
  'notification',
  'settings',
  'qrcode',
  'whatsapp',
  'twitter',
  'facebook',
  'snapchat',
  'instagram',
  'plus',
  'error',
  'warning',
  'success',
  'info',
];
