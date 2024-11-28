import { type AirhornTemplateProvider, AirhornTemplateService } from './template-service.js';
import { ProviderService } from './provider-service.js';
import { AirhornProviderType } from './provider-type.js';
import { AirhornTemplateSync } from './template-sync.js';

export type CreateAirhornOptions = {
	TEMPLATE_PATH: string;
} & AirhornOptions;

export type AirhornOptions = {
	DEFAULT_TEMPLATE_LANGUAGE?: string;
	TWILIO_SMS_ACCOUNT_SID?: string;
	TWILIO_SMS_AUTH_TOKEN?: string;
	TWILIO_SENDGRID_API_KEY?: string;
	AWS_SES_REGION?: string;
	AWS_SMS_REGION?: string;
	AWS_SNS_REGION?: string;
	FIREBASE_CERT?: string;
	TEMPLATE_PROVIDER?: AirhornTemplateProvider;
};

export class Airhorn {
	options: AirhornOptions = {
		DEFAULT_TEMPLATE_LANGUAGE: 'en',
	};

	private readonly _templates: AirhornTemplateService = new AirhornTemplateService();
	private readonly _providerService = new ProviderService();

	constructor(options?: AirhornOptions) {
		if (options) {
			this.options = { ...this.options, ...options };

			if (this.options.TEMPLATE_PROVIDER) {
				this._templates = new AirhornTemplateService(this.options.TEMPLATE_PROVIDER);
			}

			this._providerService = new ProviderService(options);
		}
	}

	public get templates(): AirhornTemplateService {
		return this._templates;
	}

	public get providers(): ProviderService {
		return this._providerService;
	}

	/* eslint max-params: [2, 6] */
	public async send(to: string, from: string, templateName: string, providerType: AirhornProviderType, data?: any, languageCode?: string): Promise<boolean> {
		let result = false;

		const template = await this._templates.get(templateName);
		if (template) {
			const providers = this._providerService.getProviderByType(providerType);

			if (providers.length > 0) {
				const message = template.render(providerType, data, languageCode);

				if (message) {
					const random = Math.floor(Math.random() * providers.length);
					const provider = providers[random];

					if (providerType === AirhornProviderType.SMTP) {
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
		return this.send(to, from, templateName, AirhornProviderType.SMTP, data, languageCode);
	}

	public async sendSMS(to: string, from: string, templateName: string, data?: any, languageCode?: string): Promise<boolean> {
		return this.send(to, from, templateName, AirhornProviderType.SMS, data, languageCode);
	}

	public async sendWebhook(to: string, from: string, templateName: string, data?: any, languageCode?: string): Promise<boolean> {
		return this.send(to, from, templateName, AirhornProviderType.WEBHOOK, data, languageCode);
	}

	public async sendMobilePush(to: string, from: string, templateName: string, data?: any, languageCode?: string): Promise<boolean> {
		return this.send(to, from, templateName, AirhornProviderType.MOBILE_PUSH, data, languageCode);
	}
}

export const createAirhorn = async (options?: CreateAirhornOptions) => {
	const airhorn = new Airhorn(options);
	if (options && options.TEMPLATE_PATH) {
		const templateSync = new AirhornTemplateSync(options.TEMPLATE_PATH, airhorn.templates.provider, airhorn.options.DEFAULT_TEMPLATE_LANGUAGE);
		await templateSync.sync();
	}

	return airhorn;
};

export { AirhornProviderType } from './provider-type.js';
export { type AirhornTemplateProvider } from './template-service.js';
