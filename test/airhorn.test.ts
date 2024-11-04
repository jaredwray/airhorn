/* eslint-disable unicorn/no-useless-promise-resolve-reject */
import {
	describe, test, expect, vi,
} from 'vitest';
import type * as admin from 'firebase-admin';
import {AirhornProviderType} from '../src/provider-type.js';
import {Airhorn} from '../src/airhorn.js';
import {FirebaseMessaging} from '../src/providers/firebase-messaging.js';
import { MongoStoreProvider } from '../src/store-providers/mongo.js';
import {TestingData, TestingDataTwo} from './testing-data.js';

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

describe('Airhorn', async () => {
	test('Airhorn - Init', () => {
		expect(new Airhorn()).toEqual(new Airhorn());
	});

	test('Airhorn - Get Providers', () => {
		const options = { TEMPLATE_PATH: './foo/templates' };
		const airhorn = new Airhorn(options);

		expect(airhorn.providers.options.TEMPLATE_PATH).toEqual(options.TEMPLATE_PATH);
	});

	test('Airhorn - Get Templates', async () => {
		const options = { TEMPLATE_PATH: './foo/templates' };
		const airhorn = new Airhorn(options);

		expect(airhorn.templates).toBeDefined();
	});

	test('Airhorn - sync template throws due to invalid path', async () => {
		const airhorn = new Airhorn();
		airhorn.options.TEMPLATE_PATH = undefined;
		await expect(airhorn.syncTemplates()).rejects.toThrow();
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
		await airhorn.syncTemplates();

		const userData = new TestingDataTwo();

		expect(await airhorn.sendWebhook(WEBHOOK_MOCK_URL, '', 'cool-multi-lingual', userData.userOne)).toEqual(true);
	});

	test('Airhorn - Send Friendly WebHook in Spanish', async () => {
		const options = {
			TEMPLATE_PATH: './test/templates',
		};
		const airhorn = new Airhorn(options);
		await airhorn.syncTemplates();

		const userData = new TestingDataTwo();

		expect(await airhorn.sendWebhook(WEBHOOK_MOCK_URL, '', 'cool-multi-lingual', userData.userOne, 'es')).toEqual(true);
	});

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
		await airhorn.syncTemplates();

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
		await airhorn.syncTemplates();

		airhorn.send = vi.fn().mockReturnValue(true) as any;
		const userData = new TestingData();

		expect(await airhorn.sendSMTP('me@you.com', 'you@me.com', 'cool-multi-lingual', userData.users[0])).toEqual(true);
	});

	test('Airhorn - Send Friendly SMS', async () => {
		const options = {
			TEMPLATE_PATH: './test/templates',
		};
		const airhorn = new Airhorn(options);
		await airhorn.syncTemplates();

		const userData = new TestingData();

		airhorn.providers.addProvider({
			type: AirhornProviderType.SMS,
			name: 'sms',
			async send() {
				return Promise.resolve(true);
			},
		});

		expect(await airhorn.sendSMS('5555555555', '5552223333', 'cool-multi-lingual', userData.users[2])).toEqual(true);
	});

	test('Airhorn - Send Mobile Push with Notification', async () => {
		const options = {
			TEMPLATE_PATH: './test/templates',
			FIREBASE_CERT,
		};
		const airhorn = new Airhorn(options);
		await airhorn.syncTemplates();

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
		await airhorn.syncTemplates();

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
		await airhorn.syncTemplates();

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
		await airhorn.syncTemplates();

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
		expect(updatedSubscription2?.templateName).toBe('updated-template');
		await airhorn.deleteSubscription(updatedSubscription);
	});
});
