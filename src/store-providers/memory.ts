import { Airhorn } from "airhorn";
import { AirhornNotification, AirhornNotificationStatus } from "notification";
import { AirhornProviderType } from "provider-type";
import { AirhornStoreProvider, CreateAirhornNotification, CreateAirhornSubscription } from "store";
import { AirhornSubscription } from "subscription";
import { AirhornTemplate } from "template";


export class MemoryStoreProvider implements AirhornStoreProvider {
	private _name = 'memory';
	private _uri = 'memory://localhost';
	private _subscriptions: Map<string, AirhornSubscription> = new Map<string, AirhornSubscription>();
	private _notifications: Map<string, AirhornNotification> = new Map<string, AirhornNotification>();
	private _templates: Map<string, AirhornTemplate> = new Map<string, AirhornTemplate>();

	public get name(): string {
		return this._name;
	}

	public get uri(): string {
		return this._uri;
	}

	public generateId(): string {
		return Math.random().toString(36).substring(7);
	}

	async createSubscription(subscription: CreateAirhornSubscription): Promise<AirhornSubscription> {
		const newSubscription: AirhornSubscription = {
			...subscription,
			id: this.generateId(),
			createdAt: new Date(),
			modifiedAt: new Date(),
		};
		this._subscriptions.set(newSubscription.id, newSubscription);
		return newSubscription;
	}
	async updateSubscription(subscription: AirhornSubscription): Promise<AirhornSubscription> {
		this._subscriptions.set(subscription.id, subscription);
		return subscription;
	}
	async deleteSubscriptionById(id: string): Promise<void> {
		this._subscriptions.delete(id);
	}
	async getSubscriptions(): Promise<AirhornSubscription[]> {
		return Array.from(this._subscriptions.values());
	}
	async getSubscriptionById(id: string): Promise<AirhornSubscription | undefined> {
		return this._subscriptions.get(id);
	}
	async getSubscriptionsByTo(to: string): Promise<AirhornSubscription[]> {
		const subscriptions = await this.getSubscriptions();
		return subscriptions.filter(subscription => subscription.to === to);
	}
	async getSubscriptionsByExternalId(externalId: string): Promise<AirhornSubscription[]> {
		const subscriptions = await this.getSubscriptions();
		return subscriptions.filter(subscription => subscription.externalId === externalId);
	}
	async getSubscriptionsByTemplateName(templateName: string): Promise<AirhornSubscription[]> {
		const subscriptions = await this.getSubscriptions();
		return subscriptions.filter(subscription => subscription.templateName === templateName);
	}
	async getSubscriptionsByProviderType(providerType: AirhornProviderType): Promise<AirhornSubscription[]> {
		const subscriptions = await this.getSubscriptions();
		return subscriptions.filter(subscription => subscription.providerType === providerType);
	}
	async createNotification(notification: CreateAirhornNotification): Promise<AirhornNotification> {
		const newNotification: AirhornNotification = {
			...notification,
			id: this.generateId(),
			createdAt: new Date(),
			modifiedAt: new Date(),
			providerResponse: [],
		};
		this._notifications.set(newNotification.id, newNotification);
		return newNotification;
	}
	async updateNotification(notification: AirhornNotification): Promise<AirhornNotification> {
		this._notifications.set(notification.id, notification);
		return notification;
	}
	async deleteNotificationById(id: string): Promise<void> {
		this._notifications.delete(id);
	}
	async getNotifications(): Promise<AirhornNotification[]> {
		return Array.from(this._notifications.values());
	}
	async getNotificationById(id: string): Promise<AirhornNotification | undefined> {
		return this._notifications.get(id);
	}
	async getNotificationByTo(to: string): Promise<AirhornNotification[]> {
		const notifications = await this.getNotifications();
		return notifications.filter(notification => notification.to === to);
	}
	async getNotificationByExternalId(externalId: string): Promise<AirhornNotification[]> {
		const notifications = await this.getNotifications();
		return notifications.filter(notification => notification.externalId === externalId);
	}
	async getNotificationByTemplateName(templateName: string): Promise<AirhornNotification[]> {
		const notifications = await this.getNotifications();
		return notifications.filter(notification => notification.templateName === templateName);
	}
	async getNotificationByProviderType(providerType: AirhornProviderType): Promise<AirhornNotification[]> {
		const notifications = await this.getNotifications();
		return notifications.filter(notification => notification.providerType === providerType);
	}
	async getNotificationByStatus(status: AirhornNotificationStatus): Promise<AirhornNotification[]> {
		const notifications = await this.getNotifications();
		return notifications.filter(notification => notification.status === status);
	}
	async getNotificationByProviderName(providerName: string): Promise<AirhornNotification[]> {
		const notifications = await this.getNotifications();
		return notifications.filter(notification => notification.providerName === providerName);
	}
	
	async createTemplate(template: AirhornTemplate): Promise<AirhornTemplate> {
		this._templates.set(template.name, template);
		return template;
	}
	async updateTemplate(template: AirhornTemplate): Promise<AirhornTemplate> {
		this._templates.set(template.name, template);
		return template;
	}
	async deleteTemplateById(id: string): Promise<void> {
		this._templates.delete(id);
	}
	async getTemplates(): Promise<AirhornTemplate[]> {
		return Array.from(this._templates.values());
	}

	async getTemplateById(name: string): Promise<AirhornTemplate | undefined> {
		return this._templates.get(name);
	}
}