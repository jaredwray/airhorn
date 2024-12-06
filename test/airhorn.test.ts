/* eslint-disable unicorn/no-useless-promise-resolve-reject */
import {
	describe, test, expect, vi,
} from 'vitest';
import type * as admin from 'firebase-admin';
import {AirhornProviderType} from '../src/provider-type.js';
import {Airhorn, createAirhorn} from '../src/airhorn.js';
import {FirebaseMessaging} from '../src/providers/firebase-messaging.js';
import {MemoryTemplateProvider} from '../src/template-providers/memory.js';
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
			verifyIdToken: vi.fn().mockResolvedValue({uid: 'mocked-uid'}), // Mock specific methods
		})),
	};
});

// eslint-disable-next-line n/prefer-global/process
const FIREBASE_CERT = process.env.FIREBASE_CERT ?? './firebase-cert.json';

// eslint-disable-next-line n/prefer-global/process
const WEBHOOK_MOCK_URL = process.env.WEBHOOK_MOCK_URL ?? 'https://mockhttp.org/post';

describe('Airhorn', async () => {
	test('Airhorn - Init', () => {
		expect(new Airhorn()).toEqual(new Airhorn());
	});

	test('Airhorn - Get Templates', async () => {
		const options = {TEMPLATE_PATH: './test/templates'};
		const airhorn = await createAirhorn(options);

		expect(airhorn.templates).toBeDefined();
	});

	test('Airhorn - set the template provider', async () => {
		const TEMPLATE_PROVIDER = new MemoryTemplateProvider();
		const options = {TEMPLATE_PROVIDER};
		const airhorn = await createAirhorn(options);

		expect(airhorn.templates.provider).toBeDefined();
	});

	test('Airhorn - Get Provider By Type', async () => {
		const options = {
			TEMPLATE_PATH: './test/templates',
		};
		const airhorn = await createAirhorn(options);

		expect(airhorn.providers.getProviderByType(AirhornProviderType.WEBHOOK).length).toEqual(1);
	});

	test('Airhorn - Send Friendly WebHook', async () => {
		const options = {
			TEMPLATE_PATH: './test/templates',
		};
		const airhorn = await createAirhorn(options);

		const userData = new TestingDataTwo();

		expect(await airhorn.sendWebhook(WEBHOOK_MOCK_URL, '', 'cool-multi-lingual', userData.userOne)).toEqual(true);
	});

	test('Airhorn - Send Friendly WebHook in Spanish', async () => {
		const options = {
			TEMPLATE_PATH: './test/templates',
		};
		const airhorn = await createAirhorn(options);

		const userData = new TestingDataTwo();

		expect(await airhorn.sendWebhook(WEBHOOK_MOCK_URL, '', 'cool-multi-lingual', userData.userOne, 'es')).toEqual(true);
	});

	test('Airhorn - Get Loaded Providers', () => {
		const airhorn = new Airhorn({
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
		const airhorn = await createAirhorn(options);

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

		const airhorn = await createAirhorn(options);

		airhorn.send = vi.fn().mockReturnValue(true) as any;
		const userData = new TestingData();

		expect(await airhorn.sendSMTP('me@you.com', 'you@me.com', 'cool-multi-lingual', userData.users[0])).toEqual(true);
	});

	test('Airhorn - Send Friendly SMS', async () => {
		const options = {
			TEMPLATE_PATH: './test/templates',
		};
		const airhorn = await createAirhorn(options);

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
		const airhorn = await createAirhorn(options);

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
		const airhorn = await createAirhorn(options);

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

		const airhorn = await createAirhorn(options);

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

		const airhorn = await createAirhorn(options);

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
