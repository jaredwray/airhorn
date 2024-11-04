import {test, describe, expect} from 'vitest';
import { ObjectId } from 'mongodb';
import {MongoStoreProvider} from '../../src/store-providers/mongo.js';
import { AirhornNotificationStatus } from '../../src/notification.js';
import { AirhornProviderType } from '../../src/provider-type.js';
import { createNotificationOneTestData, createNotificationTwoTestData, airhornTestTemplate } from '../testing-data.js';

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
		await provider.deleteSubscriptionById(subscription.id);
	});

	test('updateSubscription', async () => {
		const provider = mongoStoreProvider;
		let subscription = await provider.createSubscription({ to: 'foo@bar.com', templateName: 'bar.template', providerType: AirhornProviderType.SMTP});
		subscription.to = 'meow@bar.com';
		subscription = await provider.updateSubscription(subscription);
		expect(subscription.to).toBe('meow@bar.com');
		expect(subscription.modifiedAt.getTime()).toBeGreaterThan(subscription.createdAt.getTime());
		await provider.deleteSubscriptionById(subscription.id);
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
			from: '',
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
			from: '',
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
			from: '',
			subscriptionId: new ObjectId().toHexString(),
			externalId: 'externalId',
			providerType: AirhornProviderType.SMTP,
			status: AirhornNotificationStatus.QUEUED,
			templateName: 'foo.template',
			providerName: 'foo.provider',
		};
		const notification = await provider.createNotification(createNotification);
		await provider.deleteNotificationById(notification.id);
		const result = await provider.notificationsCollection.findOne({_id: new ObjectId(notification.id)});
		expect(result).toBeNull();
	});

	test('getNotiffications', async () => {
		const provider = mongoStoreProvider;
		await provider.notificationsCollection.deleteMany({});
		const createNotificationOne = {
			to: 'one@bar.com',
			from: '',
			subscriptionId: new ObjectId().toHexString(),
			externalId: 'externalId',
			providerType: AirhornProviderType.SMTP,
			status: AirhornNotificationStatus.QUEUED,
			templateName: 'foo.template',
			providerName: 'foo.provider',
		};
		const createNotificationTwo = {
			to: 'two@bar.com',
			from: '',
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
			from: '',
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
			from: '',
			subscriptionId: new ObjectId().toHexString(),
			externalId: 'externalId',
			providerType: AirhornProviderType.SMTP,
			status: AirhornNotificationStatus.QUEUED,
			templateName: 'foo.template',
			providerName: 'foo.provider',
		};
		const createNotificationTwo = {
			to: 'joe1@bar.com',
			from: '',
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

	test('getNotificationByExternalId', async () => {
		const provider = mongoStoreProvider;
		const externalId = 'externalfoo';
		await provider.notificationsCollection.deleteMany({});
		const createNotificationOne = {
			to: 'joe1@bar.com',
			from: '',
			subscriptionId: new ObjectId().toHexString(),
			externalId,
			providerType: AirhornProviderType.SMTP,
			status: AirhornNotificationStatus.QUEUED,
			templateName: 'foo.template',
			providerName: 'foo.provider',
		};
		const createNotificationTwo = {
			to: 'joe1@bar.com',
			from: '',
			subscriptionId: new ObjectId().toHexString(),
			externalId,
			providerType: AirhornProviderType.SMTP,
			status: AirhornNotificationStatus.QUEUED,
			templateName: 'foo.template',
			providerName: 'foo.provider',
		};
		await provider.createNotification(createNotificationOne);
		await provider.createNotification(createNotificationTwo);

		const result = await provider.getNotificationByExternalId(externalId);
		expect(result.length).toBe(2);
		expect(result[0].externalId).toBe(externalId);
		await provider.notificationsCollection.deleteMany({});
	});

	test('getNotificationByTemplateName', async () => {
		const provider = mongoStoreProvider;
		const templateName = 'template.foo';
		await provider.notificationsCollection.deleteMany({});
		const createNotificationOne = {
			to: 'joe1@bar.com',
			from: '',
			subscriptionId: new ObjectId().toHexString(),
			providerType: AirhornProviderType.SMTP,
			status: AirhornNotificationStatus.QUEUED,
			templateName,
			providerName: 'foo.provider',
		};
		const createNotificationTwo = {
			to: 'joe1@bar.com',
			from: '',
			subscriptionId: new ObjectId().toHexString(),
			providerType: AirhornProviderType.SMTP,
			status: AirhornNotificationStatus.QUEUED,
			templateName,
			providerName: 'foo.provider',
		};
		await provider.createNotification(createNotificationOne);
		await provider.createNotification(createNotificationTwo);

		const result = await provider.getNotificationByTemplateName(templateName);
		expect(result.length).toBe(2);
		expect(result[0].templateName).toBe(templateName);
		await provider.notificationsCollection.deleteMany({});
	});

	test('getNotificationByProviderType', async () => {
		const provider = mongoStoreProvider;
		const providerType = AirhornProviderType.SMTP;
		await provider.notificationsCollection.deleteMany({});
		const createNotificationOne = {
			to: 'joe1@bar.com',
			from: '',
			subscriptionId: new ObjectId().toHexString(),
			providerType: AirhornProviderType.SMTP,
			status: AirhornNotificationStatus.QUEUED,
			templateName: 'foo.template',
			providerName: 'foo.provider',
		};
		const createNotificationTwo = {
			to: 'joe1@bar.com',
			from: '',
			subscriptionId: new ObjectId().toHexString(),
			providerType: AirhornProviderType.SMTP,
			status: AirhornNotificationStatus.QUEUED,
			templateName: 'foo.template',
			providerName: 'foo.provider',
		};
		await provider.createNotification(createNotificationOne);
		await provider.createNotification(createNotificationTwo);

		const result = await provider.getNotificationByProviderType(providerType);
		expect(result.length).toBe(2);
		expect(result[0].providerType).toBe(providerType);
		await provider.notificationsCollection.deleteMany({});
	});

	test('getNotificationByStatus', async () => {
		const provider = mongoStoreProvider;
		const status = AirhornNotificationStatus.QUEUED;
		await provider.notificationsCollection.deleteMany({});

		const createNotificationOne = {
			...createNotificationOneTestData,
			subscriptionId: new ObjectId().toHexString(),
			status,
		};

		const createNotificationTwo = {
			...createNotificationTwoTestData,
			subscriptionId: new ObjectId().toHexString(),
			status,
		};

		await provider.createNotification(createNotificationOne);
		await provider.createNotification(createNotificationTwo);

		const result = await provider.getNotificationByStatus(status);
		expect(result.length).toBe(2);
		expect(result[0].status).toBe(status);
		await provider.notificationsCollection.deleteMany({});
	});

	test('getNotificationByProviderName', async () => {
		const provider = mongoStoreProvider;
		const providerName = 'foo.provider';
		await provider.notificationsCollection.deleteMany({});
		const createNotificationOne = {
			...createNotificationOneTestData,
			subscriptionId: new ObjectId().toHexString(),
			providerName,
		};
		const createNotificationTwo = {
			...createNotificationTwoTestData,
			subscriptionId: new ObjectId().toHexString(),
			providerName,
		};
		await provider.createNotification(createNotificationOne);
		await provider.createNotification(createNotificationTwo);

		const result = await provider.getNotificationByProviderName(providerName);
		expect(result.length).toBe(2);
		expect(result[0].providerName).toBe(providerName);
		await provider.notificationsCollection.deleteMany({});
	});
});

describe('MongoStoreProvider Templates', () => {
	test('createTemplate', async () => {
		const provider = mongoStoreProvider;
		const template = await provider.createTemplate(airhornTestTemplate);
		expect(template.name).toBe('airhorn-test-template');
		await provider.templatesCollection.deleteMany({});
	});

	test('get templates', async () => {
		const provider = mongoStoreProvider;
		await provider.templatesCollection.deleteMany({});
		const templateOne = await provider.createTemplate(airhornTestTemplate);
		const templateTwo = await provider.createTemplate(airhornTestTemplate);
		const templates = await provider.getTemplates();
		expect(templates.length).toBe(2);
		expect(templates[0].name).toBe(templateOne.name);
		await provider.templatesCollection.deleteMany({});
	});

	test('get template by name', async () => {
		const provider = mongoStoreProvider;
		await provider.templatesCollection.deleteMany({});
		const template = await provider.createTemplate(airhornTestTemplate);
		const result = await provider.getTemplateById(template.name);
		expect(result?.name).toBe(template.name);
		await provider.templatesCollection.deleteMany({});
	});

	test('get umndefined template by name', async () => {
		const provider = mongoStoreProvider;
		const result = await provider.getTemplateById('undefined-template');
		expect(result).toBeUndefined();
	});
});
