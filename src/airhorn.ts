import {Config} from './config';
import {TemplateService} from './template-service';
import {ProviderService} from './provider-service';

export class Airhorn {
	config = new Config();

	private readonly _templateService = new TemplateService();
	private readonly _providerService = new ProviderService();

	constructor(options?: any) {
		if (options) {
			this.config = new Config(options);
			this._templateService = new TemplateService(options);
			this._providerService = new ProviderService(options);
		}
	}

	public get templates(): TemplateService {
		return this._templateService;
	}

	public get providers(): ProviderService {
		return this._providerService;
	}
}
