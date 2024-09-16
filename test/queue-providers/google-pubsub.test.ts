import {describe, test, expect} from 'vitest';
import {GooglePubSubQueue} from '../../src/queue-providers/google-pubsub.js';
import { type AirhornNotification, AirhornNotificationStatus } from '../../src/notification.js';
import { AirhornProviderType } from '../../src/provider-type.js';

// eslint-disable-next-line n/prefer-global/process
process.env.PUBSUB_EMULATOR_HOST = 'localhost:8085';

// eslint-disable-next-line no-promise-executor-return
const sleep = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const notificationMock: AirhornNotification = {
	id: '1',
	to: 'john@doe.org',
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

describe('GooglePubSubQueue', async () => {
	test('should create a new instance of GooglePubSubQueue', async () => {
		const queue = new GooglePubSubQueue();
		expect(queue.name).toEqual('google-pubsub');
		expect(queue.uri).toEqual('google-pubsub://localhost');
		expect(queue.queueName).toEqual('airhorn-queue');
	});
	test('should create new insance with options', async () => {
		const options = {
			projectId: 'test',
			uri: 'test',
			queueName: 'test',
			subscriptionName: 'test',
		};
		const queue = new GooglePubSubQueue(options);
		expect(queue.name).toEqual('google-pubsub');
		expect(queue.uri).toEqual('test');
		expect(queue.queueName).toEqual('test');
		expect(queue.subscriptionName).toEqual('test');
		expect(queue.projectId).toEqual('test');
	});
	test('should create a queue if it does not exist', async () => {
		const options = {
			queueName: 'queue-test-1',
			subscriptionName: 'subscription-test-1',
		};
		const pubsub = new GooglePubSubQueue(options);
		let queueExists = await pubsub.queueExists();
		expect(queueExists).toEqual(false);
		await pubsub.setQueue();
		queueExists = await pubsub.queueExists();
		expect(queueExists).toEqual(true);
		await pubsub.deleteQueue();
	});
	test('should handle the queue if it already exists', async () => {
		const options = {
			queueName: 'queue-test-2',
			subscriptionName: 'subscription-test-2',
		};
		const pubsub = new GooglePubSubQueue(options);
		let queueExists = await pubsub.queueExists();
		expect(queueExists).toEqual(false);
		await pubsub.setQueue();
		queueExists = await pubsub.queueExists();
		expect(queueExists).toEqual(true);
		await pubsub.setQueue();
		await pubsub.deleteQueue();
	});
});
