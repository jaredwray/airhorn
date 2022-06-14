import { Config } from './config';
import { TemplateService } from './template-service';
import { ProviderService } from './provider-service';
import { ProviderType } from './provider-type';

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

	/* eslint max-params: [2, 6] */
	public async send(to: string, from: string, templateName: string, providerType: ProviderType, data?: any, languageCode?: string): Promise<boolean> {
		let result = false;

		const template = this._templateService.getTemplate(templateName);

		if (template) {
			const providers = this._providerService.getProviderByType(providerType);

			if (providers.length > 0) {
				const message = await template.render(providerType, data, languageCode);

				if (message) {
					const rand = Math.floor(Math.random() * providers.length);
					const provider = providers[rand];

					if (providerType === ProviderType.SMTP) {
						const subject = template.getProperty(providerType, 'subject');

						result = await provider.send(to, from, message, subject);
					} else {
						result = await provider.send(to, from, message);
					}
				}
			}
		}

		return result;
	}
}
