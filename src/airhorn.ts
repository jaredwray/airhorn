import { TemplateService } from './template-service.js';
import { ProviderService } from './provider-service.js';
import { AirhornProviderType } from './provider-type.js';

export type AirhornOptions = {
	TEMPLATE_PATH?: string;
	DEFAULT_TEMPLATE_LANGUAGE?: string;
	TWILIO_SMS_ACCOUNT_SID?: string;
	TWILIO_SMS_AUTH_TOKEN?: string;
	TWILIO_SENDGRID_API_KEY?: string;
	AWS_SES_REGION?: string;
	AWS_SMS_REGION?: string;
	AWS_SNS_REGION?: string;
	FIREBASE_CERT?: string;
};

export class Airhorn {
	options: AirhornOptions = {
		TEMPLATE_PATH: './templates',
		DEFAULT_TEMPLATE_LANGUAGE: 'en',
	};

	private readonly _templateService = new TemplateService();
	private readonly _providerService = new ProviderService();

	constructor(options?: AirhornOptions) {
		if (options) {
			this.options = { ...this.options, ...options };
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
	public async send(to: string, from: string, templateName: string, providerType: AirhornProviderType, data?: any, languageCode?: string): Promise<boolean> {
		let result = false;

		const template = this._templateService.getTemplate(templateName);
		if (template) {
			const providers = this._providerService.getProviderByType(providerType);

			if (providers.length > 0) {
				const message = await template.render(providerType, data, languageCode);

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

export { AirhornProviderType } from './provider-type.js';
export {
	AirhornStore, type AirhornStoreProvider,
} from './store.js';
export {type AirhornNotification, AirhornNotificationStatus} from './notification.js';
export {type AirhornSubscription} from './subscription.js';
