import {
	Component,
	Inject,
	ChangeDetectorRef,
	DoCheck,
	ElementRef,
	Input,
	KeyValueDiffer,
	KeyValueDiffers,
	OnChanges,
	OnDestroy,
	OnInit,
	Renderer2,
	SimpleChanges,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';

import { SvgIconRegistryService } from './svg-icon-registry.service';
import { classesToArray } from './utils';

@Component({
	selector: 'svg-icon',
	template: '<ng-content></ng-content>',
})
export class SvgIconComponent implements OnInit, OnDestroy, OnChanges, DoCheck {
	@Input() src!: string;
	@Input() name?: string;
	@Input() stretch = false;
	@Input() applyClass = false;
	@Input() svgClass?: any;
	@Input('class') klass?: any;
	@Input() viewBox?: string;
	@Input() svgAriaLabel?: string;
	@Input() title?: string;

	// Adapted from ngStyle (see:  angular/packages/common/src/directives/ng_style.ts)
	@Input()
	set svgStyle(values: { [key: string]: any } | null) {
		this._svgStyle = values;
		if (!this._differ && values) {
			this._differ = this._differs.find(values).create();
		}
	}

  private _subscription?: Subscription;
  private _loaded = false;
  private _differ?: KeyValueDiffer<string, string | number>;
	private _svgStyle: { [key: string]: any } | null = null;
	private _element!: HTMLElement;
	private get _svg() { return this._element.firstChild as SVGElement; }

	constructor(
		private _registry: SvgIconRegistryService,
    private _differs: KeyValueDiffers,
		private _renderer: Renderer2,
		private _cdr: ChangeDetectorRef,
		@Inject(DOCUMENT) private _doc: Document,
		elRef: ElementRef<HTMLElement>,
	) {
    this._element = elRef.nativeElement;
  }

	ngOnInit() {
		this._init();
	}

	ngOnDestroy() {
		this._destroy();
	}

	ngOnChanges(changeRecord: SimpleChanges) {
		const svg = this._svg;

		if (changeRecord['src'] || changeRecord['name']) {
			if (this._loaded) {
				this._destroy();
			}
			this._init();
		}

		if (changeRecord['stretch']) {
			this._preserveAspectRatio();
		}

		if (changeRecord['applyClass']) {
			if (this.applyClass) {
				this._setClass(svg, null, this.klass);
			} else {
				this._setClass(svg, this.klass, null);
			}
		}

		const svgClassChange = changeRecord['svgClass'];
		if (svgClassChange) {
			this._setClass(svg, svgClassChange.previousValue, svgClassChange.currentValue);
		}

		const klassChange = changeRecord['klass'];
		if (klassChange) {
			this._setClass(this._element, klassChange.previousValue, klassChange.currentValue);
			if (this.applyClass) {
				this._setClass(svg, klassChange.previousValue, klassChange.currentValue);
			} else {
				this._setClass(svg, klassChange.previousValue, null);
			}
		}

		const viewBoxChange = changeRecord['viewBox'];
		if (viewBoxChange) {
			if (this._loaded) {
				this._destroy();
			}
			this._init();
		}

		const svgAriaLabelChange = changeRecord['svgAriaLabel'];
		if (svgAriaLabelChange) {
			this._setAriaLabel(svgAriaLabelChange.currentValue);
		}
	}

	ngDoCheck() {
		if (this._svg && this._differ) {
			const changes = this._differ.diff(this._svgStyle!);
			if (changes) {
				changes.forEachRemovedItem(record => this._setStyle(record.key, null));
				changes.forEachAddedItem(record => this._setStyle(record.key, record.currentValue));
				changes.forEachChangedItem(record => this._setStyle(record.key, record.currentValue));
			}
		}
	}

	private _init() {
		if (this.name) {
			const svgObservable = this._registry.getSvgByName(this.name);
			if (svgObservable) {
				this._subscription = svgObservable.subscribe(svg => this._initSvg(svg));
			}
		} else if (this.src) {
			const svgObservable = this._registry.loadSvg(this.src);
			if (svgObservable) {
				this._subscription = svgObservable.subscribe(svg => this._initSvg(svg));
			}
		} else {
			this._element.innerHTML = '';
			this._cdr.markForCheck();
		}
	}

	private _initSvg(svg: SVGElement | undefined): void {
		if (this._loaded || !svg) return;

		//this._svg = svg;
		svg = svg.cloneNode(true) as SVGElement;

		this._element.innerHTML = '';
		this._renderer.appendChild(this._element, svg);
		this._loaded = true;

		this._initTitle(svg);

		const attributes = this._element.attributes as NamedNodeMap;
		const len = attributes.length;
		for (let i = 0; i < len; i++) {
			const attr = attributes.item(i);
			if (attr && attr.name.startsWith('_ngcontent')) {
				this._setNgContentAttribute(svg, attr.name);
				break;
			}
		}

		if (this.klass && this.applyClass) {
			this._setClass(svg, null, this.klass);
		}

		if (this.svgClass) {
			this._setClass(svg, null, this.svgClass);
		}

    this._initViewBox();

		this._preserveAspectRatio();

		// If there is not a svgAriaLabel and the SVG has an arial-label, then do not override
		// the SVG's aria-label.
		if (this.svgAriaLabel !== undefined || !svg.hasAttribute('aria-label')) {
			this._setAriaLabel(this.svgAriaLabel);
		}

		this._cdr.markForCheck();

		if (this._svgStyle && !this._differ) {
			this._differ = this._differs.find(this._svgStyle).create();
		}
	}

	private _destroy() {
    this._subscription?.unsubscribe();
    this._subscription = undefined;
    this._loaded = false;
    //this._svg = undefined;
	}

	private _setNgContentAttribute(parent: Node, attributeName: string) {
		this._renderer.setAttribute(parent, attributeName, '');
		const n = parent.childNodes.length;
		for (let i = 0; i < n; i++) {
			const child = parent.childNodes[i];
			if (child instanceof Element) {
				this._setNgContentAttribute(child, attributeName);
			}
		}
	}

	private _preserveAspectRatio() {
		if (this.stretch === true) {
			this._renderer.setAttribute(this._svg, 'preserveAspectRatio', 'none');
		} else if (this.stretch === false) {
			this._renderer.removeAttribute(this._svg, 'preserveAspectRatio');
		}
	}

	private _setStyle(nameAndUnit: string, value: string | number | null | undefined) {
		const [name, unit] = nameAndUnit.split('.');
		value = value != null && !!unit ? `${value}${unit}` : value;
		if (value != null) {
			this._renderer.setStyle(this._svg, name, value as string);
		} else {
			this._renderer.removeStyle(this._svg, name);
		}
	}

	private _setClass(target: HTMLElement | SVGElement, previous: string | string[] | null, current: string | string[] | null) {
		if (!target) return;
		previous = classesToArray(previous);
		if (previous) {
			for (const k of previous) this._renderer.removeClass(target, k);
		}
		current = classesToArray(current);
		if (current) {
			for (const k of current) this._renderer.addClass(target, k);
		}
	}

	private _setAriaLabel(label?: string) {
    const svg = this._svg;
		if (!svg) return;
		if (!label || label === '') {
			this._renderer.setAttribute(svg, 'aria-hidden', 'true');
			this._renderer.removeAttribute(svg, 'aria-label');
		} else {
			this._renderer.removeAttribute(svg, 'aria-hidden');
			this._renderer.setAttribute(svg, 'aria-label', label);
		}
	}

	private _initTitle(svg: SVGElement) {
		if (!this.title) return;
		const titleEl = this._doc.createElementNS('http://www.w3.org/2000/svg', 'title');
		titleEl.textContent = this.title;
		svg.insertBefore(titleEl, svg.firstChild);
	}

	private _initViewBox() {
    const svg = this._svg;
    if (!this.viewBox || !svg) return;
    if (this.viewBox === 'auto') {
      // Attempt to convert height & width to a viewBox.
      const w = svg.getAttribute('width');
      const h = svg.getAttribute('height');
      if (h && w) {
        this._renderer.setAttribute(svg, 'viewBox', `0 0 ${w} ${h}`);
        this._renderer.removeAttribute(svg, 'width');
        this._renderer.removeAttribute(svg, 'height');
      }
    } else if (this.viewBox !== '') {
      this._renderer.setAttribute(svg, 'viewBox', this.viewBox);
      this._renderer.removeAttribute(svg, 'width');
      this._renderer.removeAttribute(svg, 'height');
    }
  }
}
