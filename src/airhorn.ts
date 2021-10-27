import {Config} from './config';
import {TemplateService} from './template-service';

export class Airhorn {
	private readonly _config = new Config();

	private readonly _templateService = new TemplateService();

	constructor(options?: any) {
		if (options) {
			this._config = new Config(options);
		}
	}

	public get config(): Config {
		return this._config;
	}

	public get templates(): TemplateService {
		return this._templateService;
	}
}
