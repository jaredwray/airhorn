import {test, describe, expect} from 'vitest';
import { ObjectId } from 'mongodb';
import {MongoStoreProvider} from '../../src/store/mongo-store-provider.js';
import { AirhornNotificationStatus } from '../../src/store/airhorn-store.js';
import { AirhornProviderType } from '../../src/provider-type.js';

const uri = 'mongodb://localhost:27017';
const mongoStoreProvider = new MongoStoreProvider({uri});

describe('MongoStoreProvider', () => {
	test('init with name', () => {
		const provider = new MongoStoreProvider();
		expect(provider.name).toBe('MongoStoreProvider');
	});

	test('init with all options', () => {
		const uri = 'mongodb://127.0.0.1:27017';
		const notificationsCollectionName = 'notifications';
		const subscriptionsCollectionName = 'subscriptions';
		const provider = new MongoStoreProvider({uri, notificationsCollectionName, subscriptionsCollectionName});
		expect(provider.uri).toBe(uri);
		expect(provider.notificationsCollectionName).toBe(notificationsCollectionName);
		expect(provider.subscriptionsCollectionName).toBe(subscriptionsCollectionName);
	});

	test('init with some options', () => {
		const uri = 'mongodb://127.0.0.1:27017';
		const provider = new MongoStoreProvider({uri});
		expect(provider.uri).toBe(uri);
		expect(provider.notificationsCollectionName).toBe('airhornNotifications');
		expect(provider.subscriptionsCollectionName).toBe('airhornSubscriptions');
	});
});

describe('MongoStoreProvider Subscriptions', () => {
	test('createSubscription', async () => {
		const provider = mongoStoreProvider;
		const subscription = await provider.createSubscription({
			to: 'foo@foo.com', templateName: 'foo.template', providerType: AirhornProviderType.SMTP, externalId: 'externalId',
		});
		expect(subscription.id).toBeDefined();
		expect(subscription.to).toBe('foo@foo.com');
		expect(subscription.templateName).toBe('foo.template');
		expect(subscription.providerType).toBe(AirhornProviderType.SMTP);
		expect(subscription.externalId).toBe('externalId');
		expect(subscription.isDeleted).toBe(false);
		await provider.deleteSubscription(subscription);
	});

	test('updateSubscription', async () => {
		const provider = mongoStoreProvider;
		let subscription = await provider.createSubscription({ to: 'foo@bar.com', templateName: 'bar.template', providerType: AirhornProviderType.SMTP});
		subscription.to = 'meow@bar.com';
		subscription = await provider.updateSubscription(subscription);
		expect(subscription.to).toBe('meow@bar.com');
		expect(subscription.modifiedAt.getTime()).toBeGreaterThan(subscription.createdAt.getTime());
		await provider.deleteSubscription(subscription);
	});

	test('getSubscriptions', async () => {
		const provider = mongoStoreProvider;
		await provider.subscriptionsCollection.deleteMany({});
		const subscriptionOne = await provider.createSubscription({to: 'foo@foo.com', templateName: 'foo.template', providerType: AirhornProviderType.SMTP});
		const subscriptionTwo = await provider.createSubscription({to: 'bar@bar.com', templateName: 'bar.template', providerType: AirhornProviderType.SMTP});
		const subscriptions = await provider.getSubscriptions();
		expect(subscriptions.length).toBe(2);
		expect(subscriptions[0].id).toStrictEqual(subscriptionOne.id);
		await provider.subscriptionsCollection.deleteMany({});
	});

	test('getSubscriptionById', async () => {
		const provider = mongoStoreProvider;
		const subscription = await provider.createSubscription({ to: 'john@doe.com', templateName: 'foo.template', providerType: AirhornProviderType.SMTP });
		const result = await provider.getSubscriptionById(subscription.id);
		expect(result.id).toStrictEqual(subscription.id);
	});

	test('getSubscriptionById should throw if not found', async t => {
		const provider = mongoStoreProvider;
		const id = new ObjectId().toHexString();
		try {
			await provider.getSubscriptionById(id);
		} catch (error) {
			expect((error as Error).message).toBe(`Subscription with id ${id} not found`);
		}
	});

	test('getSubscriptionByTo', async () => {
		const provider = mongoStoreProvider;
		const to = 'cat@dog.com';
		const subscriptionOne = await provider.createSubscription({to, templateName: 'foo.template', providerType: AirhornProviderType.SMTP});
		const subscriptionTwo = await provider.createSubscription({to, templateName: 'bar.template', providerType: AirhornProviderType.SMTP});
		const result = await provider.getSubscriptionsByTo(to);
		expect(result.length).toBe(2);
		expect(result[0].id).toStrictEqual(subscriptionOne.id);
		expect(result[1].id).toStrictEqual(subscriptionTwo.id);
		await provider.subscriptionsCollection.deleteMany({});
	});

	test('getSubscriptionByExternalId', async () => {
		const provider = mongoStoreProvider;
		const externalId = 'externalId123456';
		const subscriptionOne = await provider.createSubscription({
			to: 'foo@foo.com', templateName: 'foo.template', providerType: AirhornProviderType.SMTP, externalId,
		});
		const subscriptionTwo = await provider.createSubscription({
			to: 'bar@bar.com', templateName: 'bar.template', providerType: AirhornProviderType.SMTP, externalId,
		});
		const result = await provider.getSubscriptionsByExternalId(externalId);
		expect(result.length).toBe(2);
		expect(result[0].id).toStrictEqual(subscriptionOne.id);
		expect(result[1].id).toStrictEqual(subscriptionTwo.id);
		await provider.subscriptionsCollection.deleteMany({});
	});

	test('getSubscriptionByTemplateName', async () => {
		const provider = mongoStoreProvider;
		await provider.subscriptionsCollection.deleteMany({});
		const templateName = 'foo.template';
		const subscriptionOne = await provider.createSubscription({to: 'foo@foo.com', templateName: 'foo.template', providerType: AirhornProviderType.SMTP});
		const subscriptionTwo = await provider.createSubscription({to: 'bar@bar.com', templateName: 'foo.template', providerType: AirhornProviderType.SMTP});
		const result = await provider.getSubscriptionsByTemplateName(templateName);
		expect(result.length).toBe(2);
		expect(result[0].id).toStrictEqual(subscriptionOne.id);
		expect(result[1].id).toStrictEqual(subscriptionTwo.id);
		await provider.subscriptionsCollection.deleteMany({});
	});

	test('getSubscriptionByProviderType', async () => {
		const provider = mongoStoreProvider;
		await provider.subscriptionsCollection.deleteMany({});
		const providerType = AirhornProviderType.SMTP;
		const subscriptionOne = await provider.createSubscription({to: 'foo@foo.com', templateName: 'foo.template', providerType: AirhornProviderType.SMTP});
		const subscriptionTwo = await provider.createSubscription({to: 'bar@bar.com', templateName: 'bar.template', providerType: AirhornProviderType.SMTP});
		const result = await provider.getSubscriptionsByProviderType(providerType);
		expect(result.length).toBe(2);
		expect(result[0].id).toStrictEqual(subscriptionOne.id);
		expect(result[1].id).toStrictEqual(subscriptionTwo.id);
		await provider.subscriptionsCollection.deleteMany({});
	});
});

describe('MongoStoreProvider Notifications', () => {
	test('createNotification', async () => {
		const provider = mongoStoreProvider;
		const createNotification = {
			to: 'joe@bar.com',
			subscriptionId: new ObjectId().toHexString(),
			externalId: 'externalId',
			providerType: AirhornProviderType.SMTP,
			status: AirhornNotificationStatus.QUEUED,
			templateName: 'foo.template',
			providerName: 'foo.provider',
		};

		const notification = await provider.createNotification(createNotification);
		expect(notification.id).toBeDefined();
		expect(notification.to).toBe(createNotification.to);
		expect(notification.subscriptionId).toBe(createNotification.subscriptionId);
		expect(notification.externalId).toBe(createNotification.externalId);
		await provider.notificationsCollection.deleteMany({});
	});

	test('updateNotification', async () => {
		const provider = mongoStoreProvider;
		const createNotification = {
			to: 'joe@bar.com',
			subscriptionId: new ObjectId().toHexString(),
			externalId: 'externalId',
			providerType: AirhornProviderType.SMTP,
			status: AirhornNotificationStatus.QUEUED,
			templateName: 'foo.template',
			providerName: 'foo.provider',
		};
		const notification = await provider.createNotification(createNotification);
		notification.to = 'foo@bar.com';
		const updatedNotification = await provider.updateNotification(notification);
		expect(updatedNotification.to).toBe('foo@bar.com');
		await provider.notificationsCollection.deleteMany({});
	});

	test('deleteNotification', async () => {
		const provider = mongoStoreProvider;
		const createNotification = {
			to: 'joe@bar.com',
			subscriptionId: new ObjectId().toHexString(),
			externalId: 'externalId',
			providerType: AirhornProviderType.SMTP,
			status: AirhornNotificationStatus.QUEUED,
			templateName: 'foo.template',
			providerName: 'foo.provider',
		};
		const notification = await provider.createNotification(createNotification);
		await provider.deleteNotification(notification);
		const result = await provider.notificationsCollection.findOne({_id: new ObjectId(notification.id)});
		expect(result).toBeNull();
	});

	test('getNotiffications', async () => {
		const provider = mongoStoreProvider;
		await provider.notificationsCollection.deleteMany({});
		const createNotificationOne = {
			to: 'one@bar.com',
			subscriptionId: new ObjectId().toHexString(),
			externalId: 'externalId',
			providerType: AirhornProviderType.SMTP,
			status: AirhornNotificationStatus.QUEUED,
			templateName: 'foo.template',
			providerName: 'foo.provider',
		};
		const createNotificationTwo = {
			to: 'two@bar.com',
			subscriptionId: new ObjectId().toHexString(),
			externalId: 'externalId',
			providerType: AirhornProviderType.SMTP,
			status: AirhornNotificationStatus.QUEUED,
			templateName: 'foo.template',
			providerName: 'foo.provider',
		};
		await provider.createNotification(createNotificationOne);
		await provider.createNotification(createNotificationTwo);
		const result = await provider.getNotifications();
		expect(result.length).toBe(2);
		await provider.notificationsCollection.deleteMany({});
	});

	test('getNotificationById', async () => {
		const provider = mongoStoreProvider;
		const createNotification = {
			to: 'joe@bar.com',
			subscriptionId: new ObjectId().toHexString(),
			externalId: 'externalId',
			providerType: AirhornProviderType.SMTP,
			status: AirhornNotificationStatus.QUEUED,
			templateName: 'foo.template',
			providerName: 'foo.provider',
		};
		const notification = await provider.createNotification(createNotification);
		const result = await provider.getNotificationById(notification.id);
		expect(result.id).toStrictEqual(notification.id);
		await provider.notificationsCollection.deleteMany({});
	});

	test('getNotificationById should throw if not found', async t => {
		const provider = mongoStoreProvider;
		const id = new ObjectId().toHexString();
		try {
			await provider.getNotificationById(id);
		} catch (error) {
			expect((error as Error).message).toBe(`Notification with id ${id} not found`);
		}
	});

	test('getNotificationByTo', async () => {
		const provider = mongoStoreProvider;
		await provider.notificationsCollection.deleteMany({});
		const createNotificationOne = {
			to: 'joe1@bar.com',
			subscriptionId: new ObjectId().toHexString(),
			externalId: 'externalId',
			providerType: AirhornProviderType.SMTP,
			status: AirhornNotificationStatus.QUEUED,
			templateName: 'foo.template',
			providerName: 'foo.provider',
		};
		const createNotificationTwo = {
			to: 'joe1@bar.com',
			subscriptionId: new ObjectId().toHexString(),
			externalId: 'externalId',
			providerType: AirhornProviderType.SMTP,
			status: AirhornNotificationStatus.QUEUED,
			templateName: 'foo.template',
			providerName: 'foo.provider',
		};
		await provider.createNotification(createNotificationOne);
		await provider.createNotification(createNotificationTwo);

		const result = await provider.getNotificationByTo('joe1@bar.com');
		expect(result.length).toBe(2);
		await provider.notificationsCollection.deleteMany({});
	});
});
