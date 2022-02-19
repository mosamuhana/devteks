import { Renderer2 } from "@angular/core";

import { QRCodeType } from "./types";

// https://cdn.jsdelivr.net/npm/qrcode@1.5.0/build/qrcode.min.js
declare var QRCode: any;
const QRCODE_SCRIPT_ID = 'qrcode-script';
let _scriptPromise: Promise<boolean> | null = null;

export const renderQrcode = async (
  data: string,
  options: any,
  type: QRCodeType,
  renderer: Renderer2,
): Promise<any> => {
  switch (type) {
    case 'canvas':
      try {
        const canvas = renderer.createElement('canvas') as HTMLCanvasElement;
        await _renderCanvas(canvas, data, options);
        return canvas;
      } catch (ex) {
        console.error('[qrcode] canvas error:', ex);
      }
      break;
    case 'svg':
      try {
        const svgString = await _renderSVG(data, options);
        const div = renderer.createElement('div');
        renderer.setProperty(div, 'innerHTML', svgString);
        const svg = div.firstChild;
        renderer.setAttribute(svg, 'height', `${options.width}`);
        renderer.setAttribute(svg, 'width', `${options.width}`);
        return svg;
      } catch (ex) {
        console.error('[qrcode] svg error:', ex);
      }
      break;
    case 'url':
    case 'img':
    default:
      try {
        const dataUrl = await _renderDataURL(data, options);
        const img = renderer.createElement('img') as HTMLImageElement;
        img.setAttribute('src', dataUrl);
        renderer.setStyle(img, 'object-fit', 'none');
        renderer.setStyle(img, 'width', `${options.width}px`);
        renderer.setStyle(img, 'height', `${options.width}px`);
        return img;
      } catch (ex) {
        console.error('[qrcode] img/url error:', ex);
      }
  }
  return null;
};

export const loadScript = (renderer: Renderer2, doc: Document, url: string) => {
  if (isQrcodeLibLoaded()) return Promise.resolve(true);

  const scriptEl = doc.querySelector(`#${QRCODE_SCRIPT_ID}`);
  if (scriptEl != null) return Promise.resolve(true);

  if (_scriptPromise == null) {
    _scriptPromise = new Promise<boolean>(resolve => {
      const el = renderer.createElement('script') as HTMLScriptElement;
      el.type = 'text/javascript';
      el.src = url;
      el.id = QRCODE_SCRIPT_ID;
      el.onload = () => resolve(true);
      el.onerror = () => { el.remove(); resolve(false); };
      renderer.appendChild(doc.body, el);
    });
  }

  return _scriptPromise.then(loaded => {
    if (!loaded) {
      _scriptPromise = null;
    }
    return loaded;
  });
};

const isQrcodeLibLoaded = () => typeof QRCode !== 'undefined' && typeof QRCode.toCanvas === 'function';

const _renderDataURL = (data: string, options: any) => {
  return new Promise<string>((resolve, reject) => {
    QRCode.toDataURL(data, options, (error: Error, url: string) => {
      if (error) return reject(error);
      resolve(url);
    });
  });
};

const _renderCanvas = (canvas: HTMLCanvasElement, data: string, options: any) => {
  return new Promise<void>((resolve, reject) => {
    QRCode.toCanvas(canvas, data, options, (error: Error) => {
      if (error) return reject(error);
      resolve();
    });
  });
};

const _renderSVG = (data: string, options: any) => {
  return new Promise<string>((resolve, reject) => {
    QRCode.toString(data, {...options, type: 'svg'}, (error: Error, url: string) => {
      if (error) return reject(error);
      resolve(url);
    });
  });
};
