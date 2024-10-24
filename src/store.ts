import { type AirhornProviderType } from './provider-type.js';
import { type AirhornSubscription } from './subscription.js';
import { type AirhornNotificationStatus, type AirhornNotification } from './notification.js';
import { type AirhornTemplate } from './template.js';

export type CreateAirhornSubscription = {
	to: string;
	templateName: string;
	providerType: AirhornProviderType;
	externalId?: string;
};

export type CreateAirhornNotification = {
	to: string;
	from: string;
	subscriptionId: string;
	externalId?: string;
	providerType: AirhornProviderType;
	status: AirhornNotificationStatus;
	templateName: string;
	templateData?: any;
	providerName: string;
};

export type AirhornStoreProvider = {
	name: string;
	uri: string;
	createSubscription(subscription: CreateAirhornSubscription): Promise<AirhornSubscription>;
	updateSubscription(subscription: AirhornSubscription): Promise<AirhornSubscription>;
	deleteSubscriptionById(id: string): Promise<void>;
	getSubscriptions(): Promise<AirhornSubscription[]>;
	getSubscriptionById(id: string): Promise<AirhornSubscription | undefined>;
	getSubscriptionsByTo(to: string): Promise<AirhornSubscription[]>;
	getSubscriptionsByExternalId(externalId: string): Promise<AirhornSubscription[]>;
	getSubscriptionsByTemplateName(templateName: string): Promise<AirhornSubscription[]>;
	getSubscriptionsByProviderType(providerType: AirhornProviderType): Promise<AirhornSubscription[]>;

	createNotification(notification: CreateAirhornNotification): Promise<AirhornNotification>;
	updateNotification(notification: AirhornNotification): Promise<AirhornNotification>;
	deleteNotificationById(id: string): Promise<void>;
	getNotifications(): Promise<AirhornNotification[]>;
	getNotificationById(id: string): Promise<AirhornNotification | undefined>;
	getNotificationByTo(to: string): Promise<AirhornNotification[]>;
	getNotificationByExternalId(externalId: string): Promise<AirhornNotification[]>;
	getNotificationByTemplateName(templateName: string): Promise<AirhornNotification[]>;
	getNotificationByProviderType(providerType: AirhornProviderType): Promise<AirhornNotification[]>;
	getNotificationByStatus(status: AirhornNotificationStatus): Promise<AirhornNotification[]>;
	getNotificationByProviderName(providerName: string): Promise<AirhornNotification[]>;

	createTemplate(template: AirhornTemplate): Promise<AirhornTemplate>;
	updateTemplate(template: AirhornTemplate): Promise<AirhornTemplate>;
	deleteTemplateById(name: string): Promise<void>;
	getTemplates(): Promise<AirhornTemplate[]>;
	getTemplateById(name: string): Promise<AirhornTemplate | undefined>;
};

export class AirhornStore {
	private _provider: AirhornStoreProvider;
	constructor(provider: AirhornStoreProvider) {
		this._provider = provider;
	}

	public get provider(): AirhornStoreProvider | undefined {
		return this._provider;
	}

	public set provider(provider: AirhornStoreProvider) {
		this._provider = provider;
	}

	public async createSubscription(subscription: CreateAirhornSubscription): Promise<AirhornSubscription> {
		return this._provider.createSubscription(subscription);
	}

	public async updateSubscription(subscription: AirhornSubscription): Promise<AirhornSubscription> {
		return this._provider.updateSubscription(subscription);
	}

	public async deleteSubscription(subscription: AirhornSubscription): Promise<void> {
		return this.deleteSubscriptionById(subscription.id);
	}

	public async deleteSubscriptionById(id: string): Promise<void> {
		return this._provider.deleteSubscriptionById(id);
	}

	public async getSubscriptionById(id: string): Promise<AirhornSubscription | undefined> {
		return this._provider.getSubscriptionById(id);
	}

	public async getSubscriptionsByExternalId(externalId: string): Promise<AirhornSubscription[]> {
		return this._provider.getSubscriptionsByExternalId(externalId);
	}

	public async createNotification(notification: CreateAirhornNotification): Promise<AirhornNotification> {
		return this._provider.createNotification(notification);
	}

	public async updateNotification(notification: AirhornNotification): Promise<AirhornNotification> {
		return this._provider.updateNotification(notification);
	}

	public async deleteNotification(notification: AirhornNotification): Promise<void> {
		return this.deleteNotificationById(notification.id);
	}

	public async deleteNotificationById(id: string): Promise<void> {
		return this._provider.deleteNotificationById(id);
	}

	public async getNotificationById(id: string): Promise<AirhornNotification | undefined> {
		return this._provider.getNotificationById(id);
	}

	public async createTemplate(template: AirhornTemplate): Promise<AirhornTemplate> {
		return this._provider.createTemplate(template);
	}

	public async updateTemplate(template: AirhornTemplate): Promise<AirhornTemplate> {
		return this._provider.updateTemplate(template);
	}

	public async getTemplates(): Promise<AirhornTemplate[]> {
		return this._provider.getTemplates();
	}

	public async deleteTemplateById(name: string): Promise<void> {
		return this.deleteTemplateById(name);
	}
}

