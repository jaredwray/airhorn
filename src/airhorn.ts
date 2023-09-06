import { Options } from './options.js';
import { TemplateService } from './template-service.js';
import { ProviderService } from './provider-service.js';
import { ProviderType } from './provider-type.js';

export class Airhorn {
	options = new Options();

	private readonly _templateService = new TemplateService();
	private readonly _providerService = new ProviderService();

	constructor(options?: any) {
		if (options) {
			this.options = new Options(options);
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

	public async sendSMTP(to: string, from: string, templateName: string, data?: any, languageCode?: string): Promise<boolean> {
		return this.send(to, from, templateName, ProviderType.SMTP, data, languageCode);
	}

	public async sendSMS(to: string, from: string, templateName: string, data?: any, languageCode?: string): Promise<boolean> {
		return this.send(to, from, templateName, ProviderType.SMS, data, languageCode);
	}

	public async sendWebhook(to: string, from: string, templateName: string, data?: any, languageCode?: string): Promise<boolean> {
		return this.send(to, from, templateName, ProviderType.WEBHOOK, data, languageCode);
	}

	public async sendMobilePush(to: string, from: string, templateName: string, data?: any, languageCode?: string): Promise<boolean> {
		return this.send(to, from, templateName, ProviderType.MOBILE_PUSH, data, languageCode);
	}
}

export { ProviderType } from './provider-type.js';
