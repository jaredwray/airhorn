/* eslint-disable unicorn/no-useless-promise-resolve-reject */
import {jest} from '@jest/globals';
import {Config} from '../src/config.js';
import {ProviderType} from '../src/provider-type.js';
import {TestingData} from './testing-data.js';

jest.mock('firebase-admin', () => ({
	apps: ['testAppId'],
}));

const {FirebaseMessaging} = await import ('../src/providers/firebase-messaging.js');
const {Airhorn} = await import('../src/airhorn.js');

test('Airhorn - Init', () => {
	expect(new Airhorn()).toEqual(new Airhorn());
});

test('Airhorn - Get Templates', () => {
	const airhorn = new Airhorn();

	expect(airhorn.templates.config).toEqual(new Config());
});

test('Airhorn - Get Providers', () => {
	const airhorn = new Airhorn();

	expect(airhorn.providers.config).toEqual(new Config());
});

test('Airhorn - Options Validated in Config', () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
	};
	const airhorn = new Airhorn(options);

	expect(airhorn.config.TEMPLATE_PATH).toEqual(options.TEMPLATE_PATH);
});

test('Airhorn - Get Provider By Type', () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
	};
	const airhorn = new Airhorn(options);

	expect(airhorn.providers.getProviderByType(ProviderType.WEBHOOK).length).toEqual(1);
});

test('Airhorn - Send Friendly WebHook', async () => {
	jest.setTimeout(20_000);
	const options = {
		TEMPLATE_PATH: './test/templates',
	};
	const airhorn = new Airhorn(options);
	const userData = new TestingData();

	expect(await airhorn.sendWebhook('https://httpbin.org/post', '', 'cool-multi-lingual', userData.users[0])).toEqual(true);
});

test('Airhorn - Get Loaded Providers', () => {
	const airhorn = new Airhorn({
		TEMPLATE_PATH: './test/templates',
		TWILIO_SMS_ACCOUNT_SID: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		TWILIO_SMS_AUTH_TOKEN: 'baz',
		TWILIO_SENDGRID_API_KEY: 'foo',
		FIREBASE_CERT: 'bar',
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
		type: ProviderType.SMTP,
		name: 'smtp',
		async send() {
			return Promise.resolve(true);
		},
	});

	expect(await airhorn.send('me@you.com', 'you@me.com', 'cool-multi-lingual', ProviderType.SMTP, userData.users[0])).toEqual(true);
});

test('Airhorn - Send Friendly SMTP', async () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
		TWILIO_SENDGRID_API_KEY: 'SG.test-key',
	};

	const airhorn = new Airhorn(options);

	airhorn.send = jest.fn().mockReturnValue(true) as any;
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
		type: ProviderType.SMS,
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
		FIREBASE_CERT: 'this.json',
	};
	const airhorn = new Airhorn(options);

	const notification = {
		title: 'Airhorn',
		body: 'Welcome to airhorn!',
	};

	airhorn.providers.removeProvider('firebase-messaging');
	const firebaseAdmin = new FirebaseMessaging('this.json');
	firebaseAdmin.client = {
		send: jest.fn().mockReturnValue({}),
	} as any;
	airhorn.providers.addProvider(firebaseAdmin);

	expect(await airhorn.send('deviceToken', '', 'generic-template-foo', ProviderType.MOBILE_PUSH, notification)).toEqual(true);
});

test('Airhorn - Send Friendly Mobile Push with Notification', async () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
		FIREBASE_CERT: 'this.json',
	};
	const airhorn = new Airhorn(options);

	const notification = {
		title: 'Airhorn',
		body: 'Welcome to airhorn!',
	};

	airhorn.providers.removeProvider('firebase-messaging');
	const firebaseAdmin = new FirebaseMessaging('this.json');
	firebaseAdmin.client = {
		send: jest.fn().mockReturnValue({}),
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
		type: ProviderType.MOBILE_PUSH,
		name: 'aws-sns',
		async send() {
			return Promise.resolve(true);
		},
	});

	expect(await airhorn.send('topicArnFromSns', '', 'generic-template-foo', ProviderType.MOBILE_PUSH)).toEqual(true);
});

test('Airhorn - Send Friendly Mobile Push', async () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
	};

	const airhorn = new Airhorn(options);

	airhorn.providers.removeProvider('firebase-messaging');

	airhorn.providers.addProvider({
		type: ProviderType.MOBILE_PUSH,
		name: 'aws-sns',
		async send() {
			return Promise.resolve(true);
		},
	});

	expect(await airhorn.sendMobilePush('topicArnFromSns', '', 'generic-template-foo')).toEqual(true);
});
