import {test, describe, expect} from 'vitest';
import {AirhornStore} from '../../src/store/airhorn-store.js';
import { MongoStoreProvider } from '../../src/store/mongo-store-provider.js';

const mongoUri = 'mongodb://localhost:27017/airhorn';

describe('AirhornStore', async () => {
	test('Airhorn Store Initialization', async () => {
		const provider = new MongoStoreProvider({uri: mongoUri});
		const store = new AirhornStore(provider);
		expect(store).toBeDefined();
		expect(store.provider).toBeDefined();
		expect(store.provider?.name).toBe('MongoStoreProvider');
	});

	test('Set Provider', async () => {
		const provider = new MongoStoreProvider({uri: mongoUri});
		const providerNew = new MongoStoreProvider({uri: mongoUri + 'new'});
		const store = new AirhornStore(provider);
		expect(store.provider).toBeDefined();
		store.provider = providerNew;
		expect(store.provider).toBeDefined();
		expect(store.provider?.uri).toBe('mongodb://localhost:27017/airhornnew');
	});
});
