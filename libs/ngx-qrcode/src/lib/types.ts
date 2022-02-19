import { InjectionToken } from '@angular/core';

export type QRCodeCorrectionLevel = 'L' | 'M' | 'Q' | 'H' | 'low' | 'medium' | 'quartile' | 'high';

export type QRCodeType = 'url' | 'img' | 'canvas' | 'svg';

// TODO A little-bit-of-a-better solution
// https://stackoverflow.com/a/67511209
export type RGBAColor = `#${string}`;

export interface QRCodeConfig {
  qrcodeRemoteScript: string;
  colorDark?: RGBAColor;
	colorLight?: RGBAColor;
	cssClass?: string;
	type?: QRCodeType;
	correctionLevel?: QRCodeCorrectionLevel;
	margin?: number;
	scale?: number;
	version?: number;
	width?: number;
}

export const DEFAULT_QRCODE_CONFIG: QRCodeConfig = {
  qrcodeRemoteScript: 'https://cdn.jsdelivr.net/npm/qrcode@1.5.0/build/qrcode.min.js',
  colorDark: '#000',
  colorLight: '#fff',
  cssClass: 'qrcode',
  type: 'canvas',
  correctionLevel: 'M',
  margin: 4,
  scale: 4,
  width: 10,
};

export const QRCODE_CONFIG_TOKEN = new InjectionToken<QRCodeConfig>(
  'QRCODE_CONFIG',
  {
    providedIn: 'root',
    factory: () => ({...DEFAULT_QRCODE_CONFIG}),
  }
);
