import { type AirhornProviderType } from '../provider-type.js';

export type AirhornSubscription = {
	id: string;
	to: string;
	templateName: string;
	providerType: AirhornProviderType;
	externalId?: string;
	createdAt: Date;
	modifiedAt: Date;
	isDeleted: boolean;
};

export type CreateAirhornSubscription = {
	to: string;
	templateName: string;
	providerType: AirhornProviderType;
	externalId?: string;
};

export enum AirhornNotificationStatus {
	QUEUED = 'QUEUED',
	SENT = 'SENT',
	DELIVERED = 'DELIVERED',
	FAILED = 'FAILED',
	CANCELLED = 'CANCELLED',
}

export type AirhornNotification = {
	id: string;
	to: string;
	subscriptionId: string;
	externalId?: string;
	providerType: AirhornProviderType;
	status: AirhornNotificationStatus;
	templateName: string;
	templateData?: any;
	providerName: string;
	providerResponse: string[];
	createdAt: Date;
	modifiedAt: Date;
};

export type CreateAirhornNotification = {
	to: string;
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
	createSubscription(subscription: CreateAirhornNotification): Promise<AirhornSubscription>;
	updateSubscription(notification: AirhornSubscription): Promise<AirhornSubscription>;
	deleteSubscription(notification: AirhornSubscription): Promise<void>;
	deleteSubscriptionById(id: string): Promise<void>;
	getSubscriptions(): Promise<AirhornSubscription[]>;
	getSubscriptionById(id: string): Promise<AirhornSubscription>;
	getSubscriptionsByTo(to: string): Promise<AirhornSubscription[]>;
	getSubscriptionsByExternalId(externalId: string): Promise<AirhornSubscription[]>;
	getSubscriptionsByTemplateName(templateName: string): Promise<AirhornSubscription[]>;
	getSubscriptionsByProviderType(providerType: AirhornProviderType): Promise<AirhornSubscription[]>;
	createNotification(notification: CreateAirhornNotification): Promise<AirhornNotification>;
	updateNotification(status: AirhornNotification): Promise<AirhornNotification>;
	deleteNotification(status: AirhornNotification): Promise<void>;
	deleteNotificationById(id: string): Promise<void>;
	getNotification(): Promise<AirhornNotification[]>;
	getNotificationById(id: string): Promise<AirhornNotification>;
	getNotificationByTo(to: string): Promise<AirhornNotification[]>;
	getNotificationByNotificationId(notificationId: string): Promise<AirhornNotification[]>;
	getNotificationByExternalId(externalId: string): Promise<AirhornNotification[]>;
	getNotificationByTemplateName(templateName: string): Promise<AirhornNotification[]>;
	getNotificationByProviderType(providerType: AirhornProviderType): Promise<AirhornNotification[]>;
	getNotificationByStatus(status: AirhornNotificationStatus): Promise<AirhornNotification[]>;
	getNotificationByProviderName(providerName: string): Promise<AirhornNotification[]>;
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
}
