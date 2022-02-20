import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, share, tap } from 'rxjs/operators';

import { createSvgElement } from './utils';

@Injectable({ providedIn: 'root' })
export class SvgIconRegistryService {
	private _map = new Map<string, SVGElement>();
	private _loadingMap = new Map<string, Observable<SVGElement>>();

	constructor(
    private _http: HttpClient,
    @Inject(DOCUMENT) private _doc: Document,
	) {}

	public addSvg(name: string, data: string) {
		if (!this._map.has(name)) {
			this._map.set(name, createSvgElement(data, this._doc));
		}
	}

	public loadSvg(url: string, name: string = url): Observable<SVGElement | undefined> | undefined {
    const svgObs = this._getSvg(name);
    if (svgObs) return svgObs;

		const obs = this._loadSvg(url).pipe(
			map(svgString => createSvgElement(svgString, this._doc)),
			tap(svg => this._map.set(name, svg)),
			catchError((err) => {
				//console.error(err);
				return throwError(() => err);
			}),
			finalize(() => this._loadingMap.delete(name)),
			share(),
		);

		this._loadingMap.set(name, obs);

		return obs;
	}

	public getSvgByName(name: string): Observable<SVGElement | undefined> | undefined {
    const svgObs = this._getSvg(name);
    if (svgObs) return svgObs;
		return throwError(() => `No svg with name '${name}' has been loaded`);
	}

	public removeSvg(url: string) {
		if (this._map.has(url)) this._map.delete(url);
		if (this._loadingMap.has(url)) this._loadingMap.delete(url);
	}

	public clear() {
		this._map.clear();
		this._loadingMap.clear();
	}

  private _getSvg(name: string) {
		if (this._map.has(name)) {
			return of(this._map.get(name));
		} else if (this._loadingMap.has(name)) {
			return this._loadingMap.get(name);
		}
		return undefined;
	}

  private _loadSvg(url: string): Observable<string> {
		return this._http.get(url, { responseType: 'text' });
	}
}
