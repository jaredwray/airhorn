import {test, expect, vi} from 'vitest';
import { AirhornStore } from '../../src/airhorn.js';
import { MongodbProvider } from '../../src/store/mongodb-provider.js';

const mongodbUri = 'mongodb://localhost:27017/airhorn';

test('AirhornStore - Init', () => {
	const store = new AirhornStore(new MongodbProvider(mongodbUri));
	expect(store.provider).toBeDefined();
});
