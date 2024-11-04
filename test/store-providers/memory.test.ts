import { describe, test, expect} from 'vitest';
import { AirhornNotificationStatus } from '../../src/notification.js';
import { AirhornProviderType } from '../../src/provider-type.js';
import { MemoryStoreProvider } from '../../src/store-providers/memory.js';
import {
	createSubscriptionOneTestData, createSubscriptionTwoTestData, createNotificationOneTestData, createNotificationTwoTestData,
	airhornTestTemplate,
} from '../testing-data.js';

describe('MemoryStoreProvider', () => {
	test('initialize the store', () => {
		const store = new MemoryStoreProvider();
		expect(store).toBeDefined();
	});

	test('can get and set the name', () => {
		const store = new MemoryStoreProvider();
		expect(store.name).toBe('memory');
		store.name = 'test';
		expect(store.name).toBe('test');
	});

	test('can get and set the uri', () => {
		const store = new MemoryStoreProvider();
		expect(store.uri).toBe('memory://localhost');
		store.uri = 'test';
		expect(store.uri).toBe('test');
	});

	test('can generate an id', () => {
		const store = new MemoryStoreProvider();
		const id = store.generateId();
		expect(id).toBeDefined();
	});
});

describe('MemoryStoreProvider - Subscriptions', () => {
	test('create a subscription', async () => {
		const store = new MemoryStoreProvider();
		const subscription = await store.createSubscription(createSubscriptionOneTestData);
		expect(subscription).toBeDefined();
		expect(subscription.id).toBeDefined();
		expect(subscription.createdAt).toBeDefined();
		expect(subscription.modifiedAt).toBeDefined();
	});

	test('update a subscription', async () => {
		const store = new MemoryStoreProvider();
		const subscription = await store.createSubscription(createSubscriptionOneTestData);
		subscription.to = 'john@doe.org';
		const updatedSubscription = await store.updateSubscription(subscription);
		expect(updatedSubscription).toBeDefined();
		expect(updatedSubscription.id).toBe(subscription.id);
		expect(updatedSubscription.to).toBe('john@doe.org');
	});

	test('delete a subscription', async () => {
		const store = new MemoryStoreProvider();
		const subscription = await store.createSubscription(createSubscriptionOneTestData);
		await store.deleteSubscriptionById(subscription.id);
		const subscriptions = await store.getSubscriptions();
		expect(subscriptions.length).toBe(0);
	});

	test('get all subscriptions', async () => {
		const store = new MemoryStoreProvider();
		await store.createSubscription(createSubscriptionOneTestData);
		await store.createSubscription(createSubscriptionOneTestData);
		const subscriptions = await store.getSubscriptions();
		expect(subscriptions.length).toBe(2);
	});

	test('get a subscription by id', async () => {
		const store = new MemoryStoreProvider();
		const subscription = await store.createSubscription(createSubscriptionOneTestData);
		const foundSubscription = await store.getSubscriptionById(subscription.id);
		expect(foundSubscription).toBeDefined();
		expect(foundSubscription?.id).toBe(subscription.id);
	});

	test('get subscriptions by to', async () => {
		const store = new MemoryStoreProvider();
		const alternateSubscription = {
			...createSubscriptionOneTestData,
			to: 'foo@foo.com',
		};
		await store.createSubscription(createSubscriptionOneTestData);
		await store.createSubscription(createSubscriptionOneTestData);
		await store.createSubscription(alternateSubscription);
		const subscriptions = await store.getSubscriptionsByTo(alternateSubscription.to);
		expect(subscriptions.length).toBe(1);
	});

	test('get subscriptions by external id', async () => {
		const store = new MemoryStoreProvider();
		const alternateSubscription = {
			...createSubscriptionOneTestData,
			externalId: '123',
		};
		await store.createSubscription(createSubscriptionOneTestData);
		await store.createSubscription(createSubscriptionTwoTestData);
		await store.createSubscription(alternateSubscription);
		const subscriptions = await store.getSubscriptionsByExternalId('123');
		expect(subscriptions.length).toBe(2);
	});

	test('get subscriptions by template name', async () => {
		const store = new MemoryStoreProvider();
		const alternateSubscription = {
			...createSubscriptionOneTestData,
			templateName: 'foo',
		};
		await store.createSubscription(createSubscriptionOneTestData);
		await store.createSubscription(createSubscriptionTwoTestData);
		await store.createSubscription(alternateSubscription);
		const subscriptions = await store.getSubscriptionsByTemplateName('foo');
		expect(subscriptions.length).toBe(1);
	});

	test('get subscriptions by provider type', async () => {
		const store = new MemoryStoreProvider();
		const alternateSubscription = {
			...createSubscriptionOneTestData,
			providerType: AirhornProviderType.SMS,
		};
		await store.createSubscription(createSubscriptionOneTestData);
		await store.createSubscription(createSubscriptionTwoTestData);
		await store.createSubscription(alternateSubscription);
		const subscriptions = await store.getSubscriptionsByProviderType(AirhornProviderType.SMS);
		expect(subscriptions.length).toBe(1);
	});
});

describe('MemoryStoreProvider - Templates', () => {
	test('create a template', async () => {
		const store = new MemoryStoreProvider();
		const template = await store.createTemplate(airhornTestTemplate);
		expect(template).toBeDefined();
		expect(template.name).toBeDefined();
	});

	test('get template by id', async () => {
		const store = new MemoryStoreProvider();
		const template = await store.createTemplate(airhornTestTemplate);
		const foundTemplate = await store.getTemplateById(template.name);
		expect(foundTemplate).toBeDefined();
		expect(foundTemplate?.name).toBe(template.name);
	});

	test('get template by name and return undefined if not found', async () => {
		const store = new MemoryStoreProvider();
		const template = await store.getTemplateById('not-found');
		expect(template).toBeUndefined();
	});

	test('delete template by id', async () => {
		const store = new MemoryStoreProvider();
		const template = await store.createTemplate(airhornTestTemplate);
		await store.deleteTemplateById(template.name);
		const templates = await store.getTemplates();
		expect(templates.length).toBe(0);
	});
});

describe('MemoryStoreProvider - Notifications', () => {
	test('create a notification', async () => {
		const store = new MemoryStoreProvider();
		const notification = await store.createNotification(createNotificationOneTestData);
		expect(notification).toBeDefined();
		expect(notification.id).toBeDefined();
		expect(notification.createdAt).toBeDefined();
		expect(notification.modifiedAt).toBeDefined();
	});

	test('update notification', async () => {
		const store = new MemoryStoreProvider();
		const notification = await store.createNotification(createNotificationOneTestData);
		notification.to = 'me@you.com';
		const updatedNotification = await store.updateNotification(notification);
		expect(updatedNotification).toBeDefined();
		expect(updatedNotification.id).toBe(notification.id);
		expect(updatedNotification.to).toBe('me@you.com');
	});

	test('delete notification by id', async () => {
		const store = new MemoryStoreProvider();
		const notification = await store.createNotification(createNotificationOneTestData);
		await store.deleteNotificationById(notification.id);
		const notifications = await store.getNotifications();
		expect(notifications.length).toBe(0);
	});

	test('get notification by id', async () => {
		const store = new MemoryStoreProvider();
		const notification = await store.createNotification(createNotificationOneTestData);
		const foundNotification = await store.getNotificationById(notification.id);
		expect(foundNotification).toBeDefined();
		expect(foundNotification?.id).toBe(notification.id);
	});

	test('get notifications by to', async () => {
		const store = new MemoryStoreProvider();
		const alternateNotification = {
			...createNotificationOneTestData,
			to: 'me@you.com',
		};
		await store.createNotification(createNotificationOneTestData);
		await store.createNotification(createNotificationOneTestData);
		await store.createNotification(alternateNotification);
		const notifications = await store.getNotificationsByTo(alternateNotification.to);
		expect(notifications.length).toBe(1);
	});

	test('get notifications by external id', async () => {
		const store = new MemoryStoreProvider();
		const alternateNotification = {
			...createNotificationOneTestData,
			externalId: '123',
		};
		await store.createNotification(createNotificationOneTestData);
		await store.createNotification(createNotificationTwoTestData);
		await store.createNotification(alternateNotification);
		const notifications = await store.getNotificationsByExternalId('123');
		expect(notifications.length).toBe(1);
	});

	test('get notifications by template name', async () => {
		const store = new MemoryStoreProvider();
		const alternateNotification = {
			...createNotificationOneTestData,
			templateName: 'foo',
		};
		await store.createNotification(createNotificationOneTestData);
		await store.createNotification(createNotificationTwoTestData);
		await store.createNotification(alternateNotification);
		const notifications = await store.getNotificationsByTemplateName('foo');
		expect(notifications.length).toBe(1);
	});

	test('get notifications by provider type', async () => {
		const store = new MemoryStoreProvider();
		const alternateNotification = {
			...createNotificationOneTestData,
			providerType: AirhornProviderType.SMS,
		};
		await store.createNotification(createNotificationOneTestData);
		await store.createNotification(createNotificationTwoTestData);
		await store.createNotification(alternateNotification);
		const notifications = await store.getNotificationsByProviderType(AirhornProviderType.SMS);
		expect(notifications.length).toBe(1);
	});

	test('get notifications by status', async () => {
		const store = new MemoryStoreProvider();
		const alternateNotification = {
			...createNotificationOneTestData,
			status: AirhornNotificationStatus.CANCELLED,
		};
		await store.createNotification(createNotificationOneTestData);
		await store.createNotification(createNotificationTwoTestData);
		await store.createNotification(alternateNotification);
		const notifications = await store.getNotificationsByStatus(AirhornNotificationStatus.CANCELLED);
		expect(notifications.length).toBe(1);
	});

	test('get notifications by provider name', async () => {
		const store = new MemoryStoreProvider();
		const alternateNotification = {
			...createNotificationOneTestData,
			providerName: 'foo',
		};
		await store.createNotification(createNotificationOneTestData);
		await store.createNotification(createNotificationTwoTestData);
		await store.createNotification(alternateNotification);
		const notifications = await store.getNotificationsByProviderName('foo');
		expect(notifications.length).toBe(1);
	});
});
