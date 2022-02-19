import { Inject, Injectable, InjectionToken, Optional, PLATFORM_ID, SkipSelf } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, share, tap } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

import { SvgLoader } from './types';

export const SERVER_URL = new InjectionToken<string>('SERVER_URL');

@Injectable({ providedIn: 'root' })
export class SvgIconRegistryService {
	private _iconsMap = new Map<string, SVGElement>();
	private _iconsLoadingMap = new Map<string, Observable<SVGElement>>();

	constructor(
		private loader: SvgLoader,
		@Inject(PLATFORM_ID) private platformId: Object,
		@Optional() @Inject(SERVER_URL) protected serverUrl: string | undefined,
		@Optional() @Inject(DOCUMENT) private document: Document,
	) { }

	/** Add a SVG to the registry by passing a name and the SVG. */
	public addSvg(name: string, data: string) {
		if (!this._iconsMap.has(name)) {
			this._iconsMap.set(name, this._createSvgElement(data));
		}
	}

	/** Load a SVG to the registry from a URL. */
	public loadSvg(url: string, name: string = url): Observable<SVGElement | undefined> | undefined {
		if (this.serverUrl && url.match(/^(http(s)?):/) === null) {
			const hasName = !!name && name !== url;
			url = this.serverUrl + url;
			if (!hasName) name = url;
		}

		if (this._iconsMap.has(name)) {
			return of(this._iconsMap.get(name));
		} else if (this._iconsLoadingMap.has(name)) {
			return this._iconsLoadingMap.get(name);
		}

		const svgObservable = this.loader.getSvg(url).pipe(
			map(svgString => this._createSvgElement(svgString)),
			tap(svg => this._iconsMap.set(name, svg)),
			catchError((err) => {
				console.error(err);
				return throwError(() => err);
			}),
			finalize(() => this._iconsLoadingMap.delete(name)),
			share(),
		);

		this._iconsLoadingMap.set(name, svgObservable);
		return svgObservable;
	}

	/** Get loaded SVG from registry by name. (also works by url because of blended map) */
	public getSvgByName(name: string): Observable<SVGElement | undefined> | undefined {
		if (this._iconsMap.has(name)) {
			return of(this._iconsMap.get(name));
		} else if (this._iconsLoadingMap.has(name)) {
			return this._iconsLoadingMap.get(name);
		}
		return throwError(() => `No svg with name '${name}' has been loaded`);
	}

	/** Remove a SVG from the registry by URL (or name). */
	public unloadSvg(url: string) {
		if (this._iconsMap.has(url)) {
			this._iconsMap.delete(url);
		}
	}

	private	_createSvgElement(data: string) {
		const div = this.document.createElement('DIV');
		div.innerHTML = data;
		return div.querySelector('svg') as SVGElement;
	}
}

export function SVG_ICON_REGISTRY_PROVIDER_FACTORY(
	parentRegistry: SvgIconRegistryService,
	loader: SvgLoader,
	platformId: object,
	serverUrl?: string,
	document?: any,
) {
	return (
		parentRegistry || new SvgIconRegistryService(loader, platformId, serverUrl, document)
	);
}

export const SVG_ICON_REGISTRY_PROVIDER = {
	provide: SvgIconRegistryService,
	deps: [
		[new Optional(), new SkipSelf(), SvgIconRegistryService],
		SvgLoader,
		[PLATFORM_ID as InjectionToken<any>],
		[new Optional(), SERVER_URL as InjectionToken<string>],
		[new Optional(), DOCUMENT as InjectionToken<any>],
	],
	useFactory: SVG_ICON_REGISTRY_PROVIDER_FACTORY,
};
