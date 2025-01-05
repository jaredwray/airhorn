import {type AirhornTemplateProvider, AirhornTemplateService} from './template-service.js';
import {ProviderService} from './provider-service.js';
import {AirhornProviderType} from './provider-type.js';
import {AirhornTemplateSync} from './template-sync.js';

export type CreateAirhornOptions = {
	TEMPLATE_PATH?: string;
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

	/**
	 * Create a new instance of Airhorn
	 * @param {AirhornOptions} options - The options for the airhorn instance
	 */
	constructor(options?: AirhornOptions) {
		if (options) {
			this.options = {...this.options, ...options};

			if (this.options.TEMPLATE_PROVIDER) {
				this._templates = new AirhornTemplateService(this.options.TEMPLATE_PROVIDER);
			}

			this._providerService = new ProviderService(options);
		}
	}

	/**
	 * Get the template service
	 */
	public get templates(): AirhornTemplateService {
		return this._templates;
	}

	/**
	 * Get the provider service
	 */
	public get providers(): ProviderService {
		return this._providerService;
	}

	/**
	 * Send a message based on the provider type
	 * @param {string} to - The recipient
	 * @param {string} from - The sender
	 * @param {string} templateName - The template name
	 * @param {AirhornProviderType} providerType - The provider type such as SMTP, SMS, WEBHOOK, MOBILE_PUSH
	 * @param {any} data - The data to send which should be an object with key value pairs
	 * @param {string} languageCode - The language code in ISO 639-1 format (e.g. en, es, fr)
	 * @returns {boolean} - The result if it was sent or not
	 */
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

	/**
	 * Send SMTP / Email
	 * @param {string} to - The recipient
	 * @param {string} from - The sender
	 * @param {string} templateName - The template name
	 * @param {any} data - The data to send which should be an object with key value pairs
	 * @param {string} languageCode - The language code in ISO 639-1 format (e.g. en, es, fr)
	 * @returns {boolean} - The result if it was sent or not
	 */
	public async sendSMTP(to: string, from: string, templateName: string, data?: any, languageCode?: string): Promise<boolean> {
		return this.send(to, from, templateName, AirhornProviderType.SMTP, data, languageCode);
	}

	/**
	 * Send SMS
	 * @param {string} to - The recipient
	 * @param {string} from - The sender
	 * @param {string} templateName - The template name
	 * @param {any} data - The data to send which should be an object with key value pairs
	 * @param {string} languageCode - The language code in ISO 639-1 format (e.g. en, es, fr)
	 * @returns {boolean} - The result if it was sent or not
	 */
	public async sendSMS(to: string, from: string, templateName: string, data?: any, languageCode?: string): Promise<boolean> {
		return this.send(to, from, templateName, AirhornProviderType.SMS, data, languageCode);
	}

	/**
	 * Send Webhook
	 * @param {string} to - The recipient
	 * @param {string} from - The sender
	 * @param {string} templateName - The template name
	 * @param {any} data - The data to send which should be an object with key value pairs
	 * @param {string} languageCode - The language code in ISO 639-1 format (e.g. en, es, fr)
	 * @returns {boolean} - The result if it was sent or not
	 */
	public async sendWebhook(to: string, from: string, templateName: string, data?: any, languageCode?: string): Promise<boolean> {
		return this.send(to, from, templateName, AirhornProviderType.WEBHOOK, data, languageCode);
	}

	/**
	 * Send Mobile Push Notification
	 * @param {string} to - The recipient
	 * @param {string} from - The sender
	 * @param {string} templateName - The template name
	 * @param {any} data - The data to send which should be an object with key value pairs
	 * @param {string} languageCode - The language code in ISO 639-1 format (e.g. en, es, fr)
	 * @returns {boolean} - The result if it was sent or not
	 */
	public async sendMobilePush(to: string, from: string, templateName: string, data?: any, languageCode?: string): Promise<boolean> {
		return this.send(to, from, templateName, AirhornProviderType.MOBILE_PUSH, data, languageCode);
	}
}

/**
 * This will create a new instance of Airhorn
 * @param {CreateAirhornOptions} options - The options for the airhorn instance
 * @returns {Airhorn} - The airhorn instance
 */
export const createAirhorn = async (options?: CreateAirhornOptions) => {
	const airhorn = new Airhorn(options);
	if (options && options.TEMPLATE_PATH) {
		await syncTemplatesToAirhorn(options.TEMPLATE_PATH, airhorn);
	}

	return airhorn;
};

/**
 * This will sync your templates to the airhorn instance
 * @param templatePath - The path to the templates
 * @param airhorn - The airhorn instance
 */
export const syncTemplatesToAirhorn = async (templatePath: string, airhorn: Airhorn) => {
	const templateSync = new AirhornTemplateSync(templatePath, airhorn.templates.provider, airhorn.options.DEFAULT_TEMPLATE_LANGUAGE);
	await templateSync.sync();
};

export {AirhornProviderType} from './provider-type.js';
export {type AirhornTemplateProvider} from './template-service.js';
export {AirhornTemplateSync} from './template-sync.js';
export {MemoryTemplateProvider} from './template-providers/memory.js';
export {MongoTemplateProvider} from './template-providers/mongo.js';
