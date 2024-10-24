import { AirhornTemplateService } from './template-service.js';
import { ProviderService } from './provider-service.js';
import { AirhornProviderType } from './provider-type.js';
import { type AirhornSubscription } from './subscription.js';
import {
	AirhornStore, type AirhornStoreProvider, type CreateAirhornSubscription,
} from './store.js';
import { MemoryStoreProvider } from 'store-providers/memory.js';

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
	STORE_PROVIDER?: AirhornStoreProvider;
};

export class Airhorn {
	options: AirhornOptions = {
		TEMPLATE_PATH: './templates',
		DEFAULT_TEMPLATE_LANGUAGE: 'en',
	};

	private readonly _templates: AirhornTemplateService;
	private readonly _providerService = new ProviderService();
	private readonly _store = new AirhornStore(new MemoryStoreProvider());

	constructor(options?: AirhornOptions) {
		if (options) {
			this.options = { ...this.options, ...options };

			if (this.options.STORE_PROVIDER) {
				this._store = new AirhornStore(this.options.STORE_PROVIDER);
			}

			this._providerService = new ProviderService(options);
		}

		this._templates = new AirhornTemplateService(this._store);
	}

	public get templates(): AirhornTemplateService {
		return this._templates;
	}

	public get providers(): ProviderService {
		return this._providerService;
	}

	public get store(): AirhornStore | undefined {
		return this._store;
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

	public async createSubscription(subscription: CreateAirhornSubscription): Promise<AirhornSubscription> {
		if (this._store) {
			return this._store.createSubscription(subscription);
		}

		throw new Error('Airhorn store not available');
	}

	public async updateSubscription(subscription: AirhornSubscription): Promise<AirhornSubscription> {
		if (this._store) {
			return this._store.updateSubscription(subscription);
		}

		throw new Error('Airhorn store not available');
	}

	public async getSubscriptionById(id: string): Promise<AirhornSubscription | undefined> {
		if (this._store) {
			return this._store.getSubscriptionById(id);
		}

		throw new Error('Airhorn store not available');
	}

	public async getSubscriptionByExternalId(externalId: string): Promise<AirhornSubscription[]> {
		if (this._store) {
			return this._store.getSubscriptionsByExternalId(externalId);
		}

		throw new Error('Airhorn store not available');
	}

	public async deleteSubscription(subscription: AirhornSubscription): Promise<void> {
		if (this._store) {
			return this._store.deleteSubscription(subscription);
		}

		throw new Error('Airhorn store not available');
	}
}

export { AirhornProviderType } from './provider-type.js';
export {
	AirhornStore, type AirhornStoreProvider,
} from './store.js';
export {type AirhornNotification, AirhornNotificationStatus} from './notification.js';
export {type AirhornSubscription} from './subscription.js';
