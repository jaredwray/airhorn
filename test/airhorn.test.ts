/* eslint-disable unicorn/no-useless-promise-resolve-reject */
import {jest} from '@jest/globals';
import {Options} from '../src/options.js';
import {ProviderType} from '../src/provider-type.js';
import {Airhorn} from '../src/airhorn.js';
import {FirebaseMessaging} from '../src/providers/firebase-messaging.js';
import {TestingData} from './testing-data.js';

const FIREBASE_CERT = JSON.stringify({
	type: 'service_account',
	project_id: 'jw-integration-testing',
	private_key_id: '3ced989823434298afdca76bd25643303c',
	private_key: '-----BEGIN PRIVATE KEY-----\nTHISISAFAKEKEYBAQEFAASCBKcwggSjAgEAAoIBAQCy9b2i2Tyo78pR\nFXAbnbNe8T/X4L8CREs/79SRObLbqHaoWWtb7OLAqTm6wjYyZFt2M66VD/GTWTxS\nnEIdBv0+PJRHgGLTvB5LE6RbAXrEnqbhnJr9gyZSBPT5iedh8muTsiN2gBri3hvQ\nTqRpqBetvxj0Bsh3cPwA0uEOcGR6reDc9XQhrrHt3xajzFvFr6PuSdsnkcuNB5cY\n4lrur2wg5j4ILpL+3NnQ2g8Rp1z+8OquOYo8t44ZV0KXjIdqdVq7mzkXXCTr0//l\nisKgdlW0rCDCDvoqtkbVejRIywWv56AoHTBUkY1p2N0fdqrwdnWTJKhHR5g0Dkpf\nKrDgAXH7AgMBAAECggEALw1baciyITzCteTsD+a7tXe6sHi/38my+0GEYxaHhydY\n41R3XLkAuWUE76yGcWNfhMl72mdRvcsViCbbXyRqSwXEerQvx7nLQTQN33uZGr8X\n43O4cHUeCyyQeFegxWjmjfOlTU/LQeDh8TfsFHeEmkMHPYnXBUhoiZLoZ1J3qKVE\nSc6e5Lrytev6bbl5YJrZUCEyGTZhGk2edlFeXlovtN/rh+0TfRhMaHN2TXO4X9v7\nM1EcmtFLlbj9wn3bZcOKQGrt3ZIfFoKVAv+/7GUfIpVxAOF5LI2HUl/FRRy9OTly\nw3mCQxrOpsCgtt1vaAmoxQpoVDg4WD0O2fcEN+PmqQKBgQDaQqaZm0XmLH0vSCXn\n1kR/0SKy0pPer2HDfvYHzwYZlUGsig73YeewzrPT+6952EPOUWJjH17O2daP3+AX\nDjsroHS4UmmBmWigeuW5wE8qgt8JmNRhf3B8NUqZhBA77WoCsBhuWQrBnzkwwbB7\nN0QzMNFu+AhqiPnrf5vfanUPdQKBgQDR53JWIS0u7WxMY7+p4S6lEo1qHMu724My\n0gK4AagxQ9hDtDkzQWHzOuAFQqhcVJ+a3Xeb5CntRkx0NQb+XlpN8x+EGs5oLpMT\n3EJe8JG6zl6x1PfUFOFUqbzTOgKd0Dz80mOq9cLSXWQt3fFbToH0byTdXY+Ly4k4\nGKeza3k9rwKBgQC3aWUZFhuiNmaocgewkCWWB4gSH9U1P8p2/1z+6ODmZMAAny++\ngV6y/LCvhgRK7wrj+Q4l3/nK99JPq0Fj/oiIu9j5//87clAy87PS6aFdRwboyK5I\nlFBRgHMFGK6PvY3lXlfZeygH16a2qz2D/chpADAvAW4JILxsQxsYnxxp9QKBgCTv\nYQMe22CCjqfydWtjIF4ToaamYoMv4So0Ih5WzE2+7nMbZ2VJf/7YwUqrrAxzJ5KM\nndtkjqwdzp40JoLj/2fv+/+259MVPvQjsdoa4snIPol0PBephOzs4TkZ4BP87H5g\nVwFiNWHm5RXdE/dJHTzxwb7iE7w5mG+yhu/fXXopAoGASsXqc/8v2/sZezw214Eh\nVEu0lHyG8ISu3LiNQJTBfLCJ/S4Dk09N0dS99KhqSXRCdIEYa70Ixctgd9xeFKcn\ntFK+0HRyZ1/Wr/ENH2GY1rA1/vLi3grXJQhCuP6uLy+AvRzWwIKxdLsA5EObaZSQ\n8euXtvya75ZPLT4idBTkmDI=\n-----END PRIVATE KEY-----\n',
	client_email: 'firebase-afake-account@jw-integration-testing.iam.gserviceaccount.com',
	client_id: '118126203046790821734',
	auth_uri: 'https://accounts.google.com/o/oauth2/auth',
	token_uri: 'https://oauth2.googleapis.com/token',
	auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
	client_x509_cert_url: '',
});

jest.mock('firebase-admin', () => ({
	initializeApp: jest.fn(),
	messaging: jest.fn(),
	apps: [],
	credential: {
		cert: jest.fn(),
	},
}));

// eslint-disable-next-line n/prefer-global/process
const WEBHOOK_MOCK_URL = process.env.WEBHOOK_MOCK_URL ?? 'https://httpbin.org/post';

test('Airhorn - Init', () => {
	expect(new Airhorn()).toEqual(new Airhorn());
});

test('Airhorn - Get Templates', () => {
	const airhorn = new Airhorn();

	expect(airhorn.templates.options).toEqual(new Options());
});

test('Airhorn - Get Providers', () => {
	const airhorn = new Airhorn();

	expect(airhorn.providers.options).toEqual(new Options());
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

	expect(airhorn.providers.getProviderByType(ProviderType.WEBHOOK).length).toEqual(1);
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
		send: jest.fn().mockReturnValue({}),
	} as any;
	airhorn.providers.addProvider(firebaseAdmin);

	expect(await airhorn.send('deviceToken', '', 'generic-template-foo', ProviderType.MOBILE_PUSH, notification)).toEqual(true);
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
