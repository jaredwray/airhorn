import {
	MongoClient, type Db, type Collection, ObjectId, type Document,
} from 'mongodb';
import { type AirhornProviderType } from '../provider-type.js';
import { type AirhornStoreProvider } from '../airhorn.js';
import {
	type AirhornSubscription, type AirhornNotification, type AirhornNotificationStatus, type CreateAirhornNotification,
	type CreateAirhornSubscription,
} from './airhorn-store.js';

export type MongoStoreProviderOptions = {
	uri?: string;
	subscriptionsCollectionName?: string;
	notificationsCollectionName?: string;
};

export class MongoStoreProvider implements AirhornStoreProvider {
	public subscriptionsCollectionName = 'airhornSubscriptions';
	public notificationsCollectionName = 'airhornNotifications';
	public uri = 'mongodb://localhost:27017';
	public readonly db: Db;
	public readonly subscriptionsCollection: Collection;
	public readonly notificationsCollection: Collection;

	constructor(options?: MongoStoreProviderOptions) {
		if (options) {
			this.loadOptions(options);
		}

		const client = new MongoClient(this.uri);
		this.db = client.db();
		this.subscriptionsCollection = this.db.collection(this.subscriptionsCollectionName);
		this.notificationsCollection = this.db.collection(this.notificationsCollectionName);
	}

	get name(): string {
		return 'MongoStoreProvider';
	}

	async createSubscription(createSubcription: CreateAirhornSubscription): Promise<AirhornSubscription> {
		const subscription: Document = {
			to: createSubcription.to,
			templateName: createSubcription.templateName,
			providerType: createSubcription.providerType,
			externalId: createSubcription.externalId,
			createdAt: new Date(),
			modifiedAt: new Date(),
		};
		const result = await this.subscriptionsCollection.insertOne(subscription);
		const document = await this.subscriptionsCollection.findOne({_id: result.insertedId});
		/* c8 ignore next 3 */
		if (!document) {
			throw new Error('Failed to create subscription');
		}

		return this.mapDocumentToSubscription(document);
	}

	async updateSubscription(subscription: AirhornSubscription): Promise<AirhornSubscription> {
		const result = await this.subscriptionsCollection.updateOne({_id: new ObjectId(subscription.id)}, {
			$set: {
				to: subscription.to,
				templateName: subscription.templateName,
				providerType: subscription.providerType,
				externalId: subscription.externalId,
				modifiedAt: new Date(),
			},
		});
		const updatedSubscription = await this.subscriptionsCollection.findOne({_id: new ObjectId(subscription.id)});
		/* c8 ignore next 3 */
		if (!updatedSubscription) {
			throw new Error('Failed to update subscription');
		}

		return this.mapDocumentToSubscription(updatedSubscription);
	}

	async deleteSubscriptionById(id: string): Promise<void> {
		await this.subscriptionsCollection.deleteOne({_id: new ObjectId(id)});
	}

	async getSubscriptions(): Promise<AirhornSubscription[]> {
		const documents = await this.subscriptionsCollection.find({}).toArray();
		return this.mapDocumentsToSubscriptions(documents);
	}

	async getSubscriptionById(id: string): Promise<AirhornSubscription> {
		const document = await this.subscriptionsCollection.findOne({_id: new ObjectId(id)});
		if (!document) {
			throw new Error(`Subscription with id ${id} not found`);
		}

		return this.mapDocumentToSubscription(document);
	}

	async getSubscriptionsByTo(to: string): Promise<AirhornSubscription[]> {
		const documents = await this.subscriptionsCollection.find({to}).toArray();
		return this.mapDocumentsToSubscriptions(documents);
	}

	async getSubscriptionsByExternalId(externalId: string): Promise<AirhornSubscription[]> {
		const documents = await this.subscriptionsCollection.find({externalId}).toArray();
		return this.mapDocumentsToSubscriptions(documents);
	}

	async getSubscriptionsByTemplateName(templateName: string): Promise<AirhornSubscription[]> {
		const documents = await this.subscriptionsCollection.find({templateName}).toArray();
		return this.mapDocumentsToSubscriptions(documents);
	}

	async getSubscriptionsByProviderType(providerType: AirhornProviderType): Promise<AirhornSubscription[]> {
		const documents = await this.subscriptionsCollection.find({providerType}).toArray();
		return this.mapDocumentsToSubscriptions(documents);
	}

	async createNotification(createNotification: CreateAirhornNotification): Promise<AirhornNotification> {
		const notificationDocument: Document = {
			to: createNotification.to,
			subscriptionId: createNotification.subscriptionId,
			externalId: createNotification.externalId,
			providerType: createNotification.providerType,
			status: createNotification.status,
			templateName: createNotification.templateName,
			providerName: createNotification.providerName,
			providerResponse: new Array<string>(),
			createdAt: new Date(),
			modifiedAt: new Date(),
		};

		const result = await this.notificationsCollection.insertOne(notificationDocument);
		const document = await this.notificationsCollection.findOne({_id: result.insertedId});
		/* c8 ignore next 3 */
		if (!document) {
			throw new Error('Failed to create notification');
		}

		return this.mapDocumentToNotification(document);
	}

	async updateNotification(notification: AirhornNotification): Promise<AirhornNotification> {
		const result = await this.notificationsCollection.updateOne({_id: new ObjectId(notification.id)}, {
			$set: {
				to: notification.to,
				subscriptionId: notification.subscriptionId,
				externalId: notification.externalId,
				providerType: notification.providerType,
				status: notification.status,
				templateName: notification.templateName,
				providerName: notification.providerName,
				providerResponse: notification.providerResponse,
				modifiedAt: new Date(),
			},
		});
		const updatedNotification = await this.notificationsCollection.findOne({_id: new ObjectId(notification.id)});
		/* c8 ignore next 3 */
		if (!updatedNotification) {
			throw new Error('Failed to update notification');
		}

		return this.mapDocumentToNotification(updatedNotification);
	}

	async deleteNotificationById(id: string): Promise<void> {
		await this.notificationsCollection.deleteOne({_id: new ObjectId(id)});
	}

	async getNotifications(): Promise<AirhornNotification[]> {
		const documents = await this.notificationsCollection.find({}).toArray();
		return this.mapDocumentsToNotifications(documents);
	}

	async getNotificationById(id: string): Promise<AirhornNotification> {
		const document = await this.notificationsCollection.findOne({_id: new ObjectId(id)});
		if (!document) {
			throw new Error(`Notification with id ${id} not found`);
		}

		return this.mapDocumentToNotification(document);
	}

	async getNotificationByTo(to: string): Promise<AirhornNotification[]> {
		const documents = await this.notificationsCollection.find({to}).toArray();
		return this.mapDocumentsToNotifications(documents);
	}

	async getNotificationByExternalId(externalId: string): Promise<AirhornNotification[]> {
		const documents = await this.notificationsCollection.find({externalId}).toArray();
		return this.mapDocumentsToNotifications(documents);
	}

	async getNotificationByTemplateName(templateName: string): Promise<AirhornNotification[]> {
		const documents = await this.notificationsCollection.find({templateName}).toArray();
		return this.mapDocumentsToNotifications(documents);
	}

	async getNotificationByProviderType(providerType: AirhornProviderType): Promise<AirhornNotification[]> {
		const documents = await this.notificationsCollection.find({providerType}).toArray();
		return this.mapDocumentsToNotifications(documents);
	}

	async getNotificationByStatus(status: AirhornNotificationStatus): Promise<AirhornNotification[]> {
		const documents = await this.notificationsCollection.find({status}).toArray();
		return this.mapDocumentsToNotifications(documents);
	}

	async getNotificationByProviderName(providerName: string): Promise<AirhornNotification[]> {
		const documents = await this.notificationsCollection.find({providerName}).toArray();
		return this.mapDocumentsToNotifications(documents);
	}

	loadOptions(options: MongoStoreProviderOptions) {
		if (options.uri) {
			this.uri = options.uri;
		}

		if (options.subscriptionsCollectionName) {
			this.subscriptionsCollectionName = options.subscriptionsCollectionName;
		}

		if (options.notificationsCollectionName) {
			this.notificationsCollectionName = options.notificationsCollectionName;
		}
	}

	mapDocumentToSubscription(document: Document): AirhornSubscription {
		const notification: AirhornSubscription = {
			id: document._id,
			to: document.to,
			templateName: document.templateName,
			providerType: document.providerType as AirhornProviderType,
			externalId: document.externalId,
			createdAt: document.createdAt,
			modifiedAt: document.modifiedAt,
		};

		return notification;
	}

	mapDocumentsToSubscriptions(documents: Document[]): AirhornSubscription[] {
		const subscriptions = new Array<AirhornSubscription>();
		for (const document of documents) {
			subscriptions.push(this.mapDocumentToSubscription(document));
		}

		return subscriptions;
	}

	mapDocumentToNotification(document: Document): AirhornNotification {
		const notification: AirhornNotification = {
			id: document._id,
			to: document.to,
			subscriptionId: document.subscriptionId,
			externalId: document.externalId,
			providerType: document.providerType as AirhornProviderType,
			status: document.status as AirhornNotificationStatus,
			templateName: document.templateName,
			templateData: document.templateData,
			providerName: document.providerName,
			providerResponse: document.providerResponse,
			createdAt: document.createdAt,
			modifiedAt: document.modifiedAt,
		};

		return notification;
	}

	mapDocumentsToNotifications(documents: Document[]): AirhornNotification[] {
		const notifications = new Array<AirhornNotification>();
		for (const document of documents) {
			notifications.push(this.mapDocumentToNotification(document));
		}

		return notifications;
	}
}
