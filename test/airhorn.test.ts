/* eslint-disable unicorn/no-useless-promise-resolve-reject */
import {
	describe, test, expect, vi,
} from 'vitest';
import type * as admin from 'firebase-admin';
import {AirhornProviderType} from '../src/provider-type.js';
import {Airhorn, AirhornNotificationStatus} from '../src/airhorn.js';
import {FirebaseMessaging} from '../src/providers/firebase-messaging.js';
import { MongoStoreProvider } from '../src/store-providers/mongo.js';
import { GooglePubSubQueue } from '../src/queue-providers/google-pubsub.js';
import { type CreateAirhornNotification } from '../src/store.js';
import {TestingData} from './testing-data.js';

// eslint-disable-next-line n/prefer-global/process
process.env.PUBSUB_EMULATOR_HOST = 'localhost:8085';

vi.mock('firebase-admin', async () => {
	const actual: typeof admin = await vi.importActual('firebase-admin'); // Import the actual module

	return {
		...actual, // Spread the actual implementations
		initializeApp: vi.fn(),
		messaging: vi.fn(),
		apps: [],
		auth: vi.fn(() => ({
			...actual.auth(), // Use actual auth methods
			verifyIdToken: vi.fn().mockResolvedValue({ uid: 'mocked-uid' }), // Mock specific methods
		})),
	};
});

// eslint-disable-next-line n/prefer-global/process
const FIREBASE_CERT = process.env.FIREBASE_CERT ?? './firebase-cert.json';

// eslint-disable-next-line n/prefer-global/process
const WEBHOOK_MOCK_URL = process.env.WEBHOOK_MOCK_URL ?? 'http://localhost:8081/post';

test('Airhorn - Init', () => {
	expect(new Airhorn()).toEqual(new Airhorn());
});

test('Airhorn - Get Templates', () => {
	const airhorn = new Airhorn();

	expect(airhorn.templates.options).toEqual({ TEMPLATE_PATH: './templates' });
});

test('Airhorn - Get Providers', () => {
	const options = { TEMPLATE_PATH: './foo/templates' };
	const airhorn = new Airhorn(options);

	expect(airhorn.providers.options.TEMPLATE_PATH).toEqual(options.TEMPLATE_PATH);
});

test('Airhorn - Options Validated in Config', () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
	};
	const airhorn = new Airhorn(options);

	expect(airhorn.options.TEMPLATE_PATH).toEqual(options.TEMPLATE_PATH);
});

test('Airhorn - Get Provider By Type', () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
	};
	const airhorn = new Airhorn(options);

	expect(airhorn.providers.getProviderByType(AirhornProviderType.WEBHOOK).length).toEqual(1);
});

test('Airhorn - Send Friendly WebHook', async () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
	};
	const airhorn = new Airhorn(options);
	const userData = new TestingData();

	expect(await airhorn.sendWebhook(WEBHOOK_MOCK_URL, '', 'cool-multi-lingual', userData.users[0])).toEqual(true);
}, 40_000);

test('Airhorn - Get Loaded Providers', () => {
	const airhorn = new Airhorn({
		TEMPLATE_PATH: './test/templates',
		TWILIO_SMS_ACCOUNT_SID: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		TWILIO_SMS_AUTH_TOKEN: 'baz',
		TWILIO_SENDGRID_API_KEY: 'foo',
		FIREBASE_CERT,
	});

	expect(airhorn.providers.providers.length).toEqual(4);
});

test('Airhorn - Send SMTP', async () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
	};
	const airhorn = new Airhorn(options);
	const userData = new TestingData();

	airhorn.providers.addProvider({
		type: AirhornProviderType.SMTP,
		name: 'smtp',
		async send() {
			return Promise.resolve(true);
		},
	});

	expect(await airhorn.send('me@you.com', 'you@me.com', 'cool-multi-lingual', AirhornProviderType.SMTP, userData.users[0])).toEqual(true);
});

test('Airhorn - Send Friendly SMTP', async () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
		TWILIO_SENDGRID_API_KEY: 'SG.test-key',
	};

	const airhorn = new Airhorn(options);

	airhorn.send = vi.fn().mockReturnValue(true) as any;
	const userData = new TestingData();

	expect(await airhorn.sendSMTP('me@you.com', 'you@me.com', 'cool-multi-lingual', userData.users[0])).toEqual(true);
});

test('Airhorn - Send Friendly SMS', async () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
	};
	const airhorn = new Airhorn(options);
	const userData = new TestingData();

	airhorn.providers.addProvider({
		type: AirhornProviderType.SMS,
		name: 'sms',
		async send() {
			return Promise.resolve(true);
		},
	});

	expect(await airhorn.sendSMS('5555555555', '5552223333', 'cool-multi-lingual', userData.users[0])).toEqual(true);
});

test('Airhorn - Send Mobile Push with Notification', async () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
		FIREBASE_CERT,
	};
	const airhorn = new Airhorn(options);

	const notification = {
		title: 'Airhorn',
		body: 'Welcome to airhorn!',
	};

	airhorn.providers.removeProvider('firebase-messaging');
	const firebaseAdmin = new FirebaseMessaging('{}');
	firebaseAdmin.client = {
		send: vi.fn().mockReturnValue({}),
	} as any;
	airhorn.providers.addProvider(firebaseAdmin);

	expect(await airhorn.send('deviceToken', '', 'generic-template-foo', AirhornProviderType.MOBILE_PUSH, notification)).toEqual(true);
});

test('Airhorn - Send Friendly Mobile Push with Notification', async () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
		FIREBASE_CERT,
	};
	const airhorn = new Airhorn(options);

	const notification = {
		title: 'Airhorn',
		body: 'Welcome to airhorn!',
	};

	airhorn.providers.removeProvider('firebase-messaging');
	const firebaseAdmin = new FirebaseMessaging(FIREBASE_CERT);
	firebaseAdmin.client = {
		send: vi.fn().mockReturnValue({}),
	} as any;
	airhorn.providers.addProvider(firebaseAdmin);

	expect(await airhorn.sendMobilePush('deviceToken', '', 'generic-template-foo', notification)).toEqual(true);
});

test('Airhorn - Send Mobile Push', async () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
	};

	const airhorn = new Airhorn(options);

	airhorn.providers.removeProvider('firebase-messaging');

	airhorn.providers.addProvider({
		type: AirhornProviderType.MOBILE_PUSH,
		name: 'aws-sns',
		async send() {
			return Promise.resolve(true);
		},
	});

	expect(await airhorn.send('topicArnFromSns', '', 'generic-template-foo', AirhornProviderType.MOBILE_PUSH)).toEqual(true);
});

test('Airhorn - Send Friendly Mobile Push', async () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
	};

	const airhorn = new Airhorn(options);

	airhorn.providers.removeProvider('firebase-messaging');

	airhorn.providers.addProvider({
		type: AirhornProviderType.MOBILE_PUSH,
		name: 'aws-sns',
		async send() {
			return Promise.resolve(true);
		},
	});

	expect(await airhorn.sendMobilePush('topicArnFromSns', '', 'generic-template-foo')).toEqual(true);
});

describe('Airhorn Store and Subscription', async () => {
	test('Airhorn Store Initialization', async () => {
		const provider = new MongoStoreProvider({uri: 'mongodb://localhost:27017/airhorn'});
		const airhorn = new Airhorn({STORE_PROVIDER: provider});
		expect(airhorn.store).toBeDefined();
		expect(airhorn?.store?.provider?.name).toBe('MongoStoreProvider');
	});

	test('Create Subscription', async () => {
		const provider = new MongoStoreProvider({uri: 'mongodb://localhost:27017/airhorn'});
		const airhorn = new Airhorn({STORE_PROVIDER: provider});
		const createSubscription = {
			to: 'john@doe.org',
			templateName: 'test-template',
			providerType: AirhornProviderType.SMTP,
			externalId: '1234',
		};
		await airhorn.createSubscription(createSubscription);
		const subscriptions = await airhorn.getSubscriptionByExternalId('1234');
		expect(subscriptions.length).toBe(1);
		await airhorn.deleteSubscription(subscriptions[0]);
	});

	test('Create Subscription with no Store', async () => {
		const airhorn = new Airhorn();
		const createSubscription = {
			to: 'john@doe.org',
			templateName: 'test-template',
			providerType: AirhornProviderType.SMTP,
			externalId: '1234',
		};
		await expect(airhorn.createSubscription(createSubscription)).rejects.toThrowError(new Error('Airhorn store not available'));
	});

	test('Update Subscription', async () => {
		const airhorn = new Airhorn({STORE_PROVIDER: new MongoStoreProvider({uri: 'mongodb://localhost:27017/airhorn'})});
		const createSubscription = {
			to: 'joe@mo.org',
			templateName: 'test-template',
			providerType: AirhornProviderType.SMTP,
			externalId: '1234',
		};
		const subscription = await airhorn.createSubscription(createSubscription);
		expect(subscription).toBeDefined();
		subscription.templateName = 'updated-template';
		const updatedSubscription = await airhorn.updateSubscription(subscription);
		expect(updatedSubscription).toBeDefined();
		const updatedSubscription2 = await airhorn.getSubscriptionById(updatedSubscription.id);
		expect(updatedSubscription2.templateName).toBe('updated-template');
		await airhorn.deleteSubscription(updatedSubscription);
	});

	test('Update Subscription with no Store', async () => {
		const airhorn = new Airhorn();
		const mockSubscription = {
			id: '1234',
			to: 'joe@mo.org',
			templateName: 'test-template',
			providerType: AirhornProviderType.SMTP,
			externalId: '1234',
			createdAt: new Date(),
			modifiedAt: new Date(),
		};
		await expect(airhorn.updateSubscription(mockSubscription)).rejects.toThrowError(new Error('Airhorn store not available'));
	});

	test('Get Subscription by Id with no Store', async () => {
		const airhorn = new Airhorn();
		await expect(airhorn.getSubscriptionById('1234')).rejects.toThrowError(new Error('Airhorn store not available'));
	});

	test('Get Subscription by External Id with no Store', async () => {
		const airhorn = new Airhorn();
		await expect(airhorn.getSubscriptionByExternalId('1234')).rejects.toThrowError(new Error('Airhorn store not available'));
	});

	test('Delete Subscription with No Store', async () => {
		const airhorn = new Airhorn();
		const mockSubscription = {
			id: '1234',
			to: 'john@doe.org',
			templateName: 'test-template',
			providerType: AirhornProviderType.SMTP,
			externalId: '1234',
			createdAt: new Date(),
			modifiedAt: new Date(),
		};
		await expect(airhorn.deleteSubscription(mockSubscription)).rejects.toThrowError(new Error('Airhorn store not available'));
	});
});

describe('Airhorn - Notification / Queue', async () => {
	test('Airhorn Queue Initialization', async () => {
		const QUEUE_PROVIDER = new GooglePubSubQueue();
		const airhorn = new Airhorn({QUEUE_PROVIDER});
		expect(airhorn.queue?.provider).toBeDefined();
	});
	test('Airhorn Queue Publish Notification', async () => {
		const QUEUE_PROVIDER = new GooglePubSubQueue();
		const STORE_PROVIDER = new MongoStoreProvider({uri: 'mongodb://localhost:27017/airhorn'});
		const createNotification: CreateAirhornNotification = {
			to: 'john@doe.org',
			from: 'me@you.com',
			subscriptionId: '1234',
			externalId: '1234',
			providerType: AirhornProviderType.SMTP,
			status: AirhornNotificationStatus.QUEUED,
			templateName: 'test-template',
			templateData: {},
			providerName: 'smtp',
		};

		const airhorn = new Airhorn({QUEUE_PROVIDER, STORE_PROVIDER});
		await airhorn.publishNotification(createNotification);
	});
	test('Airhorn Queue Publish Notification with no Store', async () => {
		const QUEUE_PROVIDER = new GooglePubSubQueue();
		const airhorn = new Airhorn({QUEUE_PROVIDER});
		const createNotification: CreateAirhornNotification = {
			to: 'john@doe.org',
			from: 'me@you.com',
			subscriptionId: '1234',
			externalId: '1234',
			providerType: AirhornProviderType.SMTP,
			status: AirhornNotificationStatus.QUEUED,
			templateName: 'test-template',
			templateData: {},
			providerName: 'smtp',
		};
		await expect(airhorn.publishNotification(createNotification)).rejects.toThrowError(new Error('Airhorn queue and store needed for notifications'));
	});
});
