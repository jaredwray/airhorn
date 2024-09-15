/* eslint-disable @typescript-eslint/no-empty-function */
import { subscribe } from 'node:diagnostics_channel';
import {describe, test, expect} from 'vitest';
import {AirhornQueue} from '../src/queue.js';
import { AirhornNotificationStatus, type AirhornNotification } from '../src/notification.js';
import { AirhornProviderType } from '../src/provider-type.js';

const providerMock = {
	name: 'mock',
	uri: 'mock://localhost',
	async publish(notification: AirhornNotification) {},
	async subscribe(callback: (notification: AirhornNotification, acknowledge: () => void) => void) {},
	async clearSubscription() {},
};

const notificationMock: AirhornNotification = {
	id: '1',
	to: '1',
	from: '1',
	subscriptionId: '1',
	templateName: '1',
	providerName: '1',
	providerResponse: [],
	providerType: AirhornProviderType.SMTP,
	status: AirhornNotificationStatus.QUEUED,
	createdAt: new Date(),
	modifiedAt: new Date(),
};

describe('AirhornQueue', async () => {
	test('should create a new instance of AirhornQueue', async () => {
		const queue = new AirhornQueue(providerMock);
		expect(queue.provider).toEqual(providerMock);
		expect(queue.provider.name).toEqual('mock');
	});

	test('should publish a notification', async () => {
		const queue = new AirhornQueue(providerMock);
		await queue.publishNotification(notificationMock);
	});

	test('should listen for notifications', async () => {
		const queue = new AirhornQueue(providerMock);
		await queue.subscribe((notification, acknowledge) => {});
	});

	test('should clear the subscription', async () => {
		const queue = new AirhornQueue(providerMock);
		await queue.clearSubscription();
	});
});
