import { Component, Inject, Input, OnChanges, ElementRef, Renderer2, ViewChild, ChangeDetectionStrategy, SimpleChanges } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { createRetryHtml, checkNumberProperty, createLoadingHtml, getConfig } from './utils';
import { renderQrcode, loadScript } from './qrcode';
import { QRCodeCorrectionLevel, QRCodeType, RGBAColor, QRCodeConfig, QRCODE_CONFIG_TOKEN } from './types';

@Component({
	selector: 'ngx-qrcode',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div #containerEl [class]="cssClass"></div>`,
})
export class NgxQRCodeComponent implements OnChanges {
	@Input() public colorDark?: RGBAColor;
	@Input() public colorLight?: RGBAColor;
	@Input() public cssClass?: string;
	@Input() public type?: QRCodeType;
	@Input() public correctionLevel?: QRCodeCorrectionLevel;
	@Input() public margin?: number | string;
	@Input() public scale?: number | string;
	@Input() public text: string = '';
	@Input() public version?: number | string;
	@Input() public width?: number | string;

	@ViewChild('containerEl', { static: true })
  public containerEl!: ElementRef;

	constructor(
    @Inject(QRCODE_CONFIG_TOKEN) private _config: QRCodeConfig,
    @Inject(DOCUMENT) private _doc: Document,
		private renderer: Renderer2,
	) {
    this._config = getConfig(_config);
  }

  ngOnChanges(changes: SimpleChanges): void {
    /*
    this.version = checkNumberProperty('version', this.version, 1, 40, undefined);
    this.margin = checkNumberProperty('margin', this.margin, 0, 100, DEFAULT_MARGIN)!;
    this.scale = checkNumberProperty('scale', this.scale, 1, 100, DEFAULT_SCALE)!;
    this.width = checkNumberProperty('width', this.width, 10, 2400, DEFAULT_WIDTH)!;
    */
    const c = this._config;
    this.version = checkNumberProperty('version', this.version, 1, 40, c.version);
    this.margin = checkNumberProperty('margin', this.margin, 0, 100, c.margin)!;
    this.scale = checkNumberProperty('scale', this.scale, 1, 100, c.scale)!;
    this.width = checkNumberProperty('width', this.width, 10, 2400, c.width)!;
    if (this.text == null || this.text === '') this.text = ' ';
    this._createLoading();
		this._load();
	}

  private _createOptions() {
    const c = this._config;
    const options = {
      color: {
        dark: this.colorDark ?? c.colorDark,
        light: this.colorLight ?? c.colorLight,
      },
      errorCorrectionLevel: this.correctionLevel ?? c.correctionLevel,
      margin: this.margin ?? c.margin,
      scale: this.scale ?? c.scale,
      version: this.version ?? c.version,
      width: this.width ?? c.width,
    };
    return options;
  }

  private async _load() {
    this._createLoading();
    const ok = await this._createQrcode();
    if (!ok) {
      this._createRetryButton();
    }
  }

	private async _createQrcode() {
    //const res = await loadScript(this.renderer, this._doc, 'assets/qrcode.min.js');
    const res = await loadScript(this.renderer, this._doc, this._config.qrcodeRemoteScript);
    if (!res) return false;

    const options = this._createOptions();
    const type = this.type ?? this._config.type ?? 'canvas';

    const el = await renderQrcode(this.text, options, type, this.renderer);
    if (el) {
      const container = this.containerEl.nativeElement;
      this.renderer.setProperty(container, 'innerHTML', '');
      this.renderer.appendChild(container, el);
    }
    return el != null;
	}

  private _createRetryButton() {
    const container = this.containerEl.nativeElement;
    this.renderer.setProperty(container, 'innerHTML', createRetryHtml(this.width));
    let busy = false;
    container.querySelector('button')?.addEventListener('click', () => {
      if (busy) return;
      busy = true;
      this._load();
    });
  }

  private _createLoading() {
    this.renderer.setProperty(this.containerEl.nativeElement, 'innerHTML', createLoadingHtml(this.width));
  }
}
