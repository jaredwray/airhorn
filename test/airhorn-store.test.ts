import {test, describe, expect} from 'vitest';
import {type CreateAirhornNotification, AirhornStore, AirhornNotificationStatus} from '../src/airhorn-store.js';
import { MongoStoreProvider } from '../src/store-providers/mongo.js';
import { AirhornProviderType } from '../src/provider-type.js';

const mongoUri = 'mongodb://localhost:27017/airhorn';

describe('AirhornStore', async () => {
	test('Airhorn Store Initialization', async () => {
		const provider = new MongoStoreProvider({uri: mongoUri});
		const store = new AirhornStore(provider);
		expect(store).toBeDefined();
		expect(store.provider).toBeDefined();
		expect(store.provider?.name).toBe('MongoStoreProvider');
	});

	test('Set Provider', async () => {
		const provider = new MongoStoreProvider({uri: mongoUri});
		const providerNew = new MongoStoreProvider({uri: mongoUri + 'new'});
		const store = new AirhornStore(provider);
		expect(store.provider).toBeDefined();
		store.provider = providerNew;
		expect(store.provider).toBeDefined();
		expect(store.provider?.uri).toBe('mongodb://localhost:27017/airhornnew');
	});

	test('Create Subscription', async () => {
		const provider = new MongoStoreProvider({uri: mongoUri});
		const store = new AirhornStore(provider);
		const createSubscription = {
			to: 'foo@bar.com',
			templateName: 'test-template',
			providerType: AirhornProviderType.SMTP,
		};

		const subscription = await store.createSubscription(createSubscription);
		expect(subscription).toBeDefined();
		expect(subscription.id).toBeDefined();
		expect(subscription.to).toBe(createSubscription.to);

		await store.deleteSubscription(subscription);
	});

	test('Update Subscription', async () => {
		const provider = new MongoStoreProvider({uri: mongoUri});
		const store = new AirhornStore(provider);
		const createSubscription = {
			to: 'foo@bar.com',
			templateName: 'test-template',
			providerType: AirhornProviderType.SMTP,
		};

		const subscription = await store.createSubscription(createSubscription);
		expect(subscription).toBeDefined();
		subscription.templateName = 'updated-template';
		const updatedSubscription = await store.updateSubscription(subscription);
		expect(updatedSubscription).toBeDefined();
		expect(updatedSubscription.id).toStrictEqual(subscription.id);
		expect(updatedSubscription.templateName).toBe('updated-template');
		await store.deleteSubscriptionById(updatedSubscription.id);
	});

	test('Get Subscription by Id', async () => {
		const provider = new MongoStoreProvider({uri: mongoUri});
		const store = new AirhornStore(provider);
		const createSubscription = {
			to: 'foo@bar.com',
			templateName: 'test-template',
			providerType: AirhornProviderType.SMTP,
		};

		const subscription = await store.createSubscription(createSubscription);
		expect(subscription).toBeDefined();
		const subscriptionById = await store.getSubscriptionById(subscription.id);
		expect(subscriptionById).toBeDefined();
		expect(subscriptionById.id).toStrictEqual(subscription.id);
		await store.deleteSubscriptionById(subscription.id);
	});

	test('Create Notification', async () => {
		const provider = new MongoStoreProvider({uri: mongoUri});
		const store = new AirhornStore(provider);
		const createNotification: CreateAirhornNotification = {
			to: 'foo@foo.com',
			subscriptionId: '123',
			status: AirhornNotificationStatus.QUEUED,
			templateName: 'test-template',
			providerType: AirhornProviderType.SMTP,
			providerName: 'smtp-provider',
		};

		const notification = await store.createNotification(createNotification);
		expect(notification).toBeDefined();
		expect(notification.id).toBeDefined();
		expect(notification.to).toBe(createNotification.to);
		await store.deleteNotification(notification);
	});

	test('Update Notification', async () => {
		const provider = new MongoStoreProvider({uri: mongoUri});
		const store = new AirhornStore(provider);
		const createNotification: CreateAirhornNotification = {
			to: 'foo@foo.com',
			subscriptionId: '123',
			status: AirhornNotificationStatus.QUEUED,
			templateName: 'test-template',
			providerType: AirhornProviderType.SMTP,
			providerName: 'smtp-provider',
		};
		const notification = await store.createNotification(createNotification);
		notification.status = AirhornNotificationStatus.SENT;
		const updatedNotification = await store.updateNotification(notification);
		expect(updatedNotification).toBeDefined();
		expect(updatedNotification.id).toStrictEqual(notification.id);
		expect(updatedNotification.status).toBe(AirhornNotificationStatus.SENT);
		await store.deleteNotificationById(updatedNotification.id);
	});

	test('Get Notification by Id', async () => {
		const provider = new MongoStoreProvider({uri: mongoUri});
		const store = new AirhornStore(provider);
		const createNotification: CreateAirhornNotification = {
			to: 'foo@foo.com',
			subscriptionId: '123',
			status: AirhornNotificationStatus.QUEUED,
			templateName: 'test-template',
			providerType: AirhornProviderType.SMTP,
			providerName: 'smtp-provider',
		};
		const notification = await store.createNotification(createNotification);
		expect(notification).toBeDefined();
		const notificationById = await store.getNotificationById(notification.id);
		expect(notificationById).toBeDefined();
		expect(notificationById.id).toStrictEqual(notification.id);
		await store.deleteNotificationById(notification.id);
	});
});
