import {describe, test, expect} from 'vitest';
import {GooglePubSubQueue} from '../../src/queue-providers/google-pubsub.js';
import { type AirhornNotification, AirhornNotificationStatus } from '../../src/notification.js';
import { AirhornProviderType } from '../../src/provider-type.js';

// eslint-disable-next-line n/prefer-global/process
process.env.PUBSUB_EMULATOR_HOST = 'localhost:8085';

// eslint-disable-next-line n/prefer-global/process
process.env.VITEST_MAX_THREADS = '1';

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
		expect(queue.topicName).toEqual('airhorn-delivery-queue');
	});
	test('should create the topic if it does not exist', async () => {
		const queue = new GooglePubSubQueue();
		const topicExists = await queue.topicExists();
		if (topicExists) {
			const topic = await queue.getTopic();
			const [subscriptions] = await topic.getSubscriptions();
			await Promise.all(subscriptions.map(async subscription => subscription.delete()));
			await topic.delete();
		}

		expect(queue.topicCreated).toEqual(false);
		await queue.setTopic();
		expect(queue.topicCreated).toEqual(true);
	});
	
	test('should handle the topic if it already exists', async () => {
		const queue = new GooglePubSubQueue();
		expect(queue.topicCreated).toEqual(false);
		await queue.setTopic();
		expect(queue.topicCreated).toEqual(true);
		await queue.setTopic();
	});

	test('ability to get the queue topic', async () => {
		const queue = new GooglePubSubQueue();
		const topic = await queue.getTopic();
		expect(topic.name).toEqual('projects/airhorn-project/topics/airhorn-delivery-queue');
	});

	test('publish and subscribe to a message', async () => {
		const queue = new GooglePubSubQueue();
		// Clear the subscription
		await queue.clearSubscription();
		let itWorked = false;
		const onMessage = (notification: AirhornNotification, acknowledge: () => void) => {
			expect(notification.to).toEqual('john@doe.org');
			acknowledge();
			itWorked = true;
		};

		await queue.subscribe(onMessage);
		await queue.publish(notificationMock);
		await queue.publish(notificationMock);
		await sleep(1000);
		expect(itWorked).toEqual(true);
		//await queue.clearSubscription();
	});

	test('set topic when it does not exists', async () => {
		const queue = new GooglePubSubQueue();
		const topicExists = await queue.topicExists();
		console.log('topicExists', topicExists);
		if (topicExists) {
			try {
				const topic = await queue.getTopic();
				const [subscriptions] = await topic.getSubscriptions();
				await Promise.all(subscriptions.map(async subscription => subscription.delete()));
				await topic.delete();
			} catch (error) {
				console.log('error', error);
			}
		}
		try {
			await queue.setTopic();
		} catch (error) {
			console.log('error', error);
		}
		expect(queue.topicCreated).toEqual(true);
	});
	
});
