import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SVG_ICON_REGISTRY_PROVIDER } from './svg-icon-registry.service';
import { SvgIconComponent } from './svg-icon.component';
import { SvgHttpLoader } from './svg-http-loader';
import { NgxSvgIconConfig, SvgLoader } from './types';

@NgModule({
	imports: [ CommonModule ],
	declarations: [ SvgIconComponent ],
	exports: [ SvgIconComponent ],
})
export class NgxSvgIconModule {
	static forRoot(config: NgxSvgIconConfig = {}): ModuleWithProviders<NgxSvgIconModule> {
		return {
			ngModule: NgxSvgIconModule,
			providers: [
				SVG_ICON_REGISTRY_PROVIDER,
				config.loader || { provide: SvgLoader, useClass: SvgHttpLoader }
			]
		};
	}
}
