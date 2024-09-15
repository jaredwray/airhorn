import { TemplateService } from './template-service.js';
import { ProviderService } from './provider-service.js';
import { AirhornProviderType } from './provider-type.js';
import { type AirhornSubscription } from './subscription.js';
import { AirhornNotificationStatus, type AirhornNotification } from './notification.js';
import { AirhornQueue, type AirhornQueueProvider } from './queue.js';
import {
	AirhornStore, type CreateAirhornNotification, type AirhornStoreProvider, type CreateAirhornSubscription,
} from './store.js';

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
	QUEUE_PROVIDER?: AirhornQueueProvider;
};

export class Airhorn {
	options: AirhornOptions = {
		TEMPLATE_PATH: './templates',
		DEFAULT_TEMPLATE_LANGUAGE: 'en',
	};

	private readonly _templateService = new TemplateService();
	private readonly _providerService = new ProviderService();
	private readonly _store?: AirhornStore;
	private readonly _queue?: AirhornQueue;

	constructor(options?: AirhornOptions) {
		if (options) {
			this.options = { ...this.options, ...options };
			this._templateService = new TemplateService(options);
			this._providerService = new ProviderService(options);
		}

		if (this.options.STORE_PROVIDER) {
			this._store = new AirhornStore(this.options.STORE_PROVIDER);
		}

		if (this.options.QUEUE_PROVIDER) {
			this._queue = new AirhornQueue(this.options.QUEUE_PROVIDER);
		}
	}

	public get templates(): TemplateService {
		return this._templateService;
	}

	public get providers(): ProviderService {
		return this._providerService;
	}

	public get store(): AirhornStore | undefined {
		return this._store;
	}

	public get queue(): AirhornQueue | undefined {
		return this._queue;
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

	public async getSubscriptionById(id: string): Promise<AirhornSubscription> {
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

	public async publishNotification(notification: CreateAirhornNotification): Promise<void> {
		if (this._queue && this._store) {
			const updatedNotification = await this._store.createNotification(notification);

			await this._queue.publishNotification(updatedNotification);

			updatedNotification.status = AirhornNotificationStatus.QUEUED;

			await this._store.updateNotification(updatedNotification);

			return;
		}

		throw new Error('Airhorn queue and store needed for notifications');
	}
}

export { AirhornProviderType } from './provider-type.js';
export {
	AirhornStore, type AirhornStoreProvider,
} from './store.js';
export {type AirhornNotification, AirhornNotificationStatus} from './notification.js';
export {type AirhornSubscription} from './subscription.js';
