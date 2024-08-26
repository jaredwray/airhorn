import {test, describe, expect} from 'vitest';
import {AirhornStore} from '../../src/store/airhorn-store.js';
import { MongoStoreProvider } from '../../src/store/mongo-store-provider.js';
import { AirhornProviderType } from '../../src/provider-type.js';

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

	test('Create Subscription', async () => {
		const provider = new MongoStoreProvider({uri: mongoUri});
		const store = new AirhornStore(provider);
		const createSubscription = {
			to: 'foo@bar.com',
			templateName: 'test-template',
			providerType: AirhornProviderType.SMTP,
		};

		const subscription = await store.createSubscription(createSubscription);
		expect(subscription).toBeDefined();
		expect(subscription.id).toBeDefined();
		expect(subscription.to).toBe(createSubscription.to);

		await store.deleteSubscription(subscription);
	});

	test('Update Subscription', async () => {
		const provider = new MongoStoreProvider({uri: mongoUri});
		const store = new AirhornStore(provider);
		const createSubscription = {
			to: 'foo@bar.com',
			templateName: 'test-template',
			providerType: AirhornProviderType.SMTP,
		};

		const subscription = await store.createSubscription(createSubscription);
		expect(subscription).toBeDefined();
		subscription.templateName = 'updated-template';
		const updatedSubscription = await store.updateSubscription(subscription);
		expect(updatedSubscription).toBeDefined();
		expect(updatedSubscription.id).toStrictEqual(subscription.id);
		expect(updatedSubscription.templateName).toBe('updated-template');
		await store.deleteSubscriptionById(updatedSubscription.id);
	});

	test('Get Subscription by Id', async () => {
		const provider = new MongoStoreProvider({uri: mongoUri});
		const store = new AirhornStore(provider);
		const createSubscription = {
			to: 'foo@bar.com',
			templateName: 'test-template',
			providerType: AirhornProviderType.SMTP,
		};

		const subscription = await store.createSubscription(createSubscription);
		expect(subscription).toBeDefined();
		const subscriptionById = await store.getSubscriptionById(subscription.id);
		expect(subscriptionById).toBeDefined();
		expect(subscriptionById.id).toStrictEqual(subscription.id);
		await store.deleteSubscriptionById(subscription.id);
	});
});
