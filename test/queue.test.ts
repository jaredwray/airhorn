/* eslint-disable @typescript-eslint/no-empty-function */
import {describe, test, expect} from 'vitest';
import {AirhornQueue} from '../src/queue.js';
import { type AirhornNotification } from '../src/notification.js';

const providerMock = {
	name: 'mock',
	uri: 'mock://localhost',
	async createQueue(queueName: string) {},
	queueExists: async (queueName: string) => true,
	async deleteQueue(queueName: string) {},
	async publishNotification(notification: AirhornNotification) {},
	async acknowledgeNotification(notification: AirhornNotification) {},
	async listenForNotifications(queueName: string, callback: (notification: AirhornNotification) => void) {},
};

describe('AirhornQueue', async () => {
	test('should create a new instance of AirhornQueue', async () => {
		const queue = new AirhornQueue({ provider: providerMock });
		expect(queue.provider).toEqual(providerMock);
	});
});
