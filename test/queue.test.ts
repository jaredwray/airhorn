import {describe, test, expect} from 'vitest';
import {AirhornQueue, AirhornQueueType} from '../src/queue.js';

const providerMock = {
	name: 'mock',
	uri: 'mock://localhost',
};

describe('AirhornQueue', async () => {
	test('should create a new instance of AirhornQueue', async () => {
		const queue = new AirhornQueue({ provider: providerMock, type: AirhornQueueType.DELIVER });
		expect(queue.provider).toEqual(providerMock);
		expect(queue.type).toEqual(AirhornQueueType.DELIVER);
	});
});
