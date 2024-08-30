import {describe, test, expect} from 'vitest';
import {GooglePubSubQueue} from '../../src/queue-providers/google-pubsub.js';

// eslint-disable-next-line n/prefer-global/process
process.env.PUBSUB_EMULATOR_HOST = 'localhost:8085';

describe('GooglePubSubQueue', async () => {
	test('should create a new instance of GooglePubSubQueue', async () => {
		const queue = new GooglePubSubQueue();
		expect(queue.name).toEqual('google-pubsub');
		expect(queue.uri).toEqual('google-pubsub://localhost');
		expect(queue.topicName).toEqual('airhorn-delivery-queue');
	});
	test('should create the topic if it does not exist', async () => {
		const queue = new GooglePubSubQueue();
		if ((await queue.topicExists())) {
			const topic = await queue.getTopic();
			await topic.delete();
		}

		expect(queue.topicCreated).toEqual(false);
		await queue.createTopic();
		expect(queue.topicCreated).toEqual(true);
	});

	test('should handle the topic if it already exists', async () => {
		const queue = new GooglePubSubQueue();
		expect(queue.topicCreated).toEqual(false);
		await queue.createTopic();
		expect(queue.topicCreated).toEqual(true);
		await queue.createTopic();
	});
});
