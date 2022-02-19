import { Provider } from "@angular/core";
import { Observable } from "rxjs";

export abstract class SvgLoader {
	abstract getSvg(url: string): Observable<string>;
}

export interface NgxSvgIconConfig {
	loader?: Provider;
}
