/* eslint-disable unicorn/no-useless-promise-resolve-reject */
import {jest} from '@jest/globals';
import {Airhorn} from '../src/airhorn.js';
import {Config} from '../src/config.js';
import {ProviderType} from '../src/provider-type.js';
import {TestingData} from './testing-data.js';

jest.mock('firebase-admin', () => ({
	messaging: jest.fn().mockImplementation(() => ({
		send: jest.fn().mockImplementation(async () => Promise.resolve()),
	})),
	initializeApp: jest.fn(),
	credential: {
		cert: jest.fn(),
	},
}));

const firebaseCertContent = JSON.stringify({
	type: 'service_account',
	project_id: 'airhorn-sample',
	private_key_id: 'private_key_',
	private_key: '-----BEGIN PRIVATE KEY-----\ncertificateContent\n-----END PRIVATE KEY-----\n',
	client_email: 'user@project.iam.gserviceaccount.com',
	client_id: '1234567890',
	auth_uri: 'https://accounts.google.com/o/oauth2/auth',
	token_uri: 'https://oauth2.googleapis.com/token',
	auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
	client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/user%40project.iam.gserviceaccount.com',
},
);

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

test('Airhorn - Send WebHook', async () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
	};
	const airhorn = new Airhorn(options);
	const userData = new TestingData();

	expect(await airhorn.send('https://httpbin.org/post', '', 'cool-multi-lingual', ProviderType.WEBHOOK, userData.users[0])).toEqual(true);
});

test('Airhorn - Send Friendly WebHook', async () => {
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
		FIREBASE_CERT: firebaseCertContent,
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
		FIREBASE_CERT: firebaseCertContent,
	};
	const airhorn = new Airhorn(options);

	const notification = {
		title: 'Airhorn',
		body: 'Welcome to airhorn!',
	};

	expect(await airhorn.send('deviceToken', '', 'generic-template-foo', ProviderType.MOBILE_PUSH, notification)).toEqual(true);
});

test('Airhorn - Send Friendly Mobile Push with Notification', async () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
		FIREBASE_CERT: firebaseCertContent,
	};
	const airhorn = new Airhorn(options);

	const notification = {
		title: 'Airhorn',
		body: 'Welcome to airhorn!',
	};

	expect(await airhorn.sendMobilePush('deviceToken', '', 'generic-template-foo', notification)).toEqual(true);
});

test('Airhorn - Send Mobile Push', async () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
	};

	const airhorn = new Airhorn(options);

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

	airhorn.providers.addProvider({
		type: ProviderType.MOBILE_PUSH,
		name: 'aws-sns',
		async send() {
			return Promise.resolve(true);
		},
	});

	expect(await airhorn.sendMobilePush('topicArnFromSns', '', 'generic-template-foo')).toEqual(true);
});
