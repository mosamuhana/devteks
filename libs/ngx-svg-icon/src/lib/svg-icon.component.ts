import {
	ChangeDetectorRef,
	Component,
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
	Inject,
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
		if (!this.helper.differ && values) {
			this.helper.differ = this.differs.find(values).create();
		}
	}

	private helper = new SvgIconHelper();
	private _svgStyle: { [key: string]: any } | null = null;

	private get el() { return this.elRef.nativeElement; }

	constructor(
		private elRef: ElementRef<HTMLElement>,
		private differs: KeyValueDiffers,
		private renderer: Renderer2,
		private iconReg: SvgIconRegistryService,
		private cdr: ChangeDetectorRef,
		@Inject(DOCUMENT) private doc: Document,
	) {}

	ngOnInit() {
		this._init();
	}

	ngOnDestroy() {
		this._destroy();
	}

	ngOnChanges(changeRecord: SimpleChanges) {
		const svg = this.el.firstChild as SVGElement;

		if (changeRecord['src'] || changeRecord['name']) {
			if (this.helper.loaded) {
				this._destroy();
			}
			this._init();
		}

		if (changeRecord['stretch']) {
			this._stylize();
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
			this._setClass(this.el, klassChange.previousValue, klassChange.currentValue);
			if (this.applyClass) {
				this._setClass(svg, klassChange.previousValue, klassChange.currentValue);
			} else {
				this._setClass(svg, klassChange.previousValue, null);
			}
		}

		const viewBoxChange = changeRecord['viewBox'];
		if (viewBoxChange) {
			if (this.helper.loaded) {
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
		if (this.helper.svg && this.helper.differ) {
			const changes = this.helper.differ.diff(this._svgStyle!);
			if (changes) {
				changes.forEachRemovedItem(record => this._setStyle(record.key, null));
				changes.forEachAddedItem(record => this._setStyle(record.key, record.currentValue));
				changes.forEachChangedItem(record => this._setStyle(record.key, record.currentValue));
			}
		}
	}

	private _init() {
		if (this.name) {
			const svgObservable = this.iconReg.getSvgByName(this.name);
			if (svgObservable) {
				this.helper.subscription = svgObservable.subscribe(svg => this._initSvg(svg));
			}
		} else if (this.src) {
			const svgObservable = this.iconReg.loadSvg(this.src);
			if (svgObservable) {
				this.helper.subscription = svgObservable.subscribe(svg => this._initSvg(svg));
			}
		} else {
			this.el.innerHTML = '';
			this.cdr.markForCheck();
		}
	}

	private _initSvg(svg: SVGElement | undefined): void {
		if (this.helper.loaded || !svg) return;

		this.helper.svg = svg;
		svg = svg.cloneNode(true) as SVGElement;
		const elem = this.el;

		elem.innerHTML = '';
		this.renderer.appendChild(elem, svg);
		this.helper.loaded = true;

		this._addSvgTitle(svg);

		const attributes = elem.attributes as NamedNodeMap;
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

		if (this.viewBox) {
			if (this.viewBox === 'auto') {
				// Attempt to convert height & width to a viewBox.
				const w = svg.getAttribute('width');
				const h = svg.getAttribute('height');
				if (h && w) {
					const vb = `0 0 ${w} ${h}`;
					this.renderer.setAttribute(svg, 'viewBox', vb);
					this.renderer.removeAttribute(svg, 'width');
					this.renderer.removeAttribute(svg, 'height');
				}
			} else if (this.viewBox !== '') {
				this.renderer.setAttribute(svg, 'viewBox', this.viewBox);
				this.renderer.removeAttribute(svg, 'width');
				this.renderer.removeAttribute(svg, 'height');
			}
		}

		this._stylize();

		// If there is not a svgAriaLabel and the SVG has an arial-label, then do not override
		// the SVG's aria-label.
		if (this.svgAriaLabel !== undefined || !svg.hasAttribute('aria-label')) {
			this._setAriaLabel(this.svgAriaLabel || '');
		}

		this.cdr.markForCheck();

		if (this._svgStyle && !this.helper.differ) {
			this.helper.differ = this.differs.find(this._svgStyle).create();
		}
	}

	private _destroy() {
		if (this.helper.subscription) {
			this.helper.subscription.unsubscribe();
		}
		this.helper = new SvgIconHelper();
	}

	private _setNgContentAttribute(parent: Node, attributeName: string) {
		this.renderer.setAttribute(parent, attributeName, '');
		const n = parent.childNodes.length;
		for (let i = 0; i < n; i++) {
			const child = parent.childNodes[i];
			if (child instanceof Element) {
				this._setNgContentAttribute(child, attributeName);
			}
		}
	}

	private _stylize() {
		if (!this.helper.svg) return;
		const svg = this.el.firstChild;
		if (this.stretch === true) {
			this.renderer.setAttribute(svg, 'preserveAspectRatio', 'none');
		} else if (this.stretch === false) {
			this.renderer.removeAttribute(svg, 'preserveAspectRatio');
		}
	}

	private _setStyle(nameAndUnit: string, value: string | number | null | undefined) {
		const [name, unit] = nameAndUnit.split('.');
		value = value != null && !!unit ? `${value}${unit}` : value;
		const svg = this.el.firstChild;
		if (value != null) {
			this.renderer.setStyle(svg, name, value as string);
		} else {
			this.renderer.removeStyle(svg, name);
		}
	}

	private _setClass(
		target: HTMLElement | SVGElement,
		previous: string | string[] | null,
		current: string | string[] | null,
	) {
		if (!target) return;
		previous = classesToArray(previous);
		if (previous) {
			for (const k of previous) this.renderer.removeClass(target, k);
		}
		current = classesToArray(current);
		if (current) {
			for (const k of current) this.renderer.addClass(target, k);
		}
	}

	private _setAriaLabel(label: string) {
		const svg = this.el.firstChild;
		if (!svg) return;
		if (label === '') {
			this.renderer.setAttribute(svg, 'aria-hidden', 'true');
			this.renderer.removeAttribute(svg, 'aria-label');
		} else {
			this.renderer.removeAttribute(svg, 'aria-hidden');
			this.renderer.setAttribute(svg, 'aria-label', label);
		}
	}

	private _addSvgTitle(svg: SVGElement) {
		if (!this.title) return;
		const titleEl = this.doc.createElementNS('http://www.w3.org/2000/svg', 'title');
		titleEl.textContent = this.title;
		svg.insertBefore(titleEl, svg.firstChild);
	}
}

class SvgIconHelper {
	svg!: SVGElement;
	subscription!: Subscription;
	differ?: KeyValueDiffer<string, string | number>;
	loaded = false;
}
