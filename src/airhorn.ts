import {Config} from './config';
import {TemplateService} from './template-service';

export class Airhorn {
	config = new Config();

	private readonly _templateService = new TemplateService();

	public get templates(): TemplateService {
		return this._templateService;
	}
}
