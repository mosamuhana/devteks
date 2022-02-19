import { QRCodeConfig, DEFAULT_QRCODE_CONFIG } from './types';

const DEFAULT_MARGIN = 4;
const DEFAULT_SCALE = 4;
const DEFAULT_WIDTH = 10;

export const getConfig = (cfg?: QRCodeConfig): QRCodeConfig => {
  const c = Object.assign({}, DEFAULT_QRCODE_CONFIG, cfg ?? {});

  c.version = checkNumberProperty('version', c.version, 1, 40, undefined);
  c.margin = checkNumberProperty('margin', c.margin, 0, 100, DEFAULT_MARGIN)!;
  c.scale = checkNumberProperty('scale', c.scale, 1, 100, DEFAULT_SCALE)!;
  c.width = checkNumberProperty('width', c.width, 10, 2400, DEFAULT_WIDTH)!;

  return c;
}

export const checkNumberProperty = (
    name: string,
    value: string | number | undefined | null,
    min?: number,
    max?: number,
    defValue?: number
) => {
  let v = _toInt(value);
  if (v) {
    if (min && v < min) {
      console.warn(`[qrcode] min value for ${name} is ${min}`);
      v = min;
    }
    if (max && v > max) {
      console.warn(`[qrcode] max value for ${name} is ${max}`);
      v = max;
    }
    return v;
  }
  return defValue;
};

const _toInt = (v: string | number | undefined | null, defValue?: number) => {
  if (v != null) {
    const n = parseInt(v.toString(), 10);
    if (!isNaN(n) && isFinite(n)) return n;
  }
  return defValue;
};

export const createRetryHtml = (width: any) => createHtml(width, RELOAD_BUTTON);

export const createLoadingHtml = (width: any) => createHtml(width, '<span>Loading...</span>');

const createHtml = (width: any, content: string) => {
  const style = `width:${width}px; height: ${width}px; border:1px solid #ccc; display:flex; justify-content:center; align-items:center;`;
  return `<div style="${style}">${content}</div>`;
};

const RELOAD_BUTTON = '<button style="padding:3px; border-radius:50%;" title="Reload"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="32" height="32" fill="#000"><path d="M984.7,66.1c-1.8-2-4-3.7-6.5-4.9c-7.5-3.6-16.2-2-22.5,3.6l-95.6,85.7C735.9,25.3,548.9-29.8,367.7,23.1C104.3,100-46.9,375.9,30,639.2c76.9,263.4,352.8,414.5,616.1,337.6C816.9,927,940.5,793.6,985.3,634.1c1.6-5.6,1.4-11.7,1.4-17.8c0-35.6-28.9-64.5-64.5-64.5c-28.7,0-53.4,18.6-61.8,44.6c-32,118-122.8,217-248.8,253.8c-192.5,56.2-394-54.3-450.3-246.8c-56.2-192.5,54.3-394,246.7-450.2c129.1-37.7,262.2-0.4,352.9,86.2l-98.2,88c-6.3,5.6-8.8,14.1-6,22c2.8,7.9,10.1,13.4,18.4,13.8l292.7,33.2c11.4,0.6,21.2-8.2,21.8-19.6L990,81.1C990.3,75.5,988.3,70.1,984.7,66.1z" /></svg></button>';
