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

const firebaseCertContent = `{
	"type": "service_account",
	"project_id": "pwa-native-firebase",
	"private_key_id": "2ea6c821385575249ad8e1a941843b80250bc342",
	"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCOyjvdH2Xzj6bx\nffFziOXrhVKeqqMMwaCn8Mx6YjaQLqvdWpozoMgIE2sqQaK+A6wnUTwgHhSTncjx\nrUKaADGl51J5cfRpLm4b9jwljkFF59VGspdI4+moP21B56E1IyFQgbKmPuYUWJIz\nJ9PXUiQyFGgSkGtDNIhetfLg4/jqzWf1Cd1HL6tYqThlsnSHkXKi5Ae7XbX+WDxW\n7wH5ayrS6JKWsgDl3aqxJprJ0HK55Fs0p2gJY8RNDp0PcDuCixIr+NMk6xMSUEcj\nVv0PM1AdDIrjaElIltpaTU5JLks1z3bJDRkhEHLH9dMc2sgfwvIpQVGElkXi57il\n0+1ENzPDAgMBAAECggEAFimVeRCyhkc5piniHAiXhyK+XBooDIbRJL/fPO+ZgG9+\nBXFWlcTSx04cSAa/97YiNkgJiQKiNvc6hShbOgPlsNZimq7xPJIUTQq+8yVNREhj\ndgGqMYoObirKDnyhLNozBYfb7qm8lFPa/U2lN7psG8nHDXqU621v7SNYe0dnDypv\nJJZaEEJycq+uAmB86PTaS2SB1ZqsmajcmMbLKE8+nZsOyQHbaQLu+M0yItr876aI\nk5b5PS0shQrwqXsbD5Bw8en7pdN2ZChpQx80iVpY2UPjMu1E3wrSMVtNBtUSo75g\ntsq7DaNO7q+oOh2aZauwLUY6Q9Ivf3tzKHeJ4uWooQKBgQDEl201GF1p7bdBETN9\nF9USHDPh3FlakDN+GOq9/dXwNnlDPmT5NEyXigttFLe1za1ia5rRkSkTUqkBEt6k\ntdXUF3gJMSYjEWk6loDY4vbXpItvJyHucTbLyH0+/VC0Ul4dgtSTmF4JRQtSBJzB\ndSAs4dA8xwLdjSj7L4NnEPdaBwKBgQC58KaoN8SY3sLV9P/XFeUqqYyuhp4FwMFt\nXT0+3wiFfK6e3xRxoBeRf5btRz0vasS1FSp3KHBn1kVAd+S6RLelToPey5/8mL2j\ndsdAPsmNa2YeFKZlzmxodkrqf6gys+bRPeEYTKOZeuXmn+W6E3rcAYRrxGjxTYRJ\nMTAmgPoZZQKBgGejxQj2vVh43+FHpjNOex+/CoMJ3XlnCB50GFztEvo+XZNbs3PF\nZJOHTRrGj0sjEUMPo2DT/CmZrEtKnWGMExxq+vctmANozGb8rRSqIqPwtSl2IedI\nfDDWk2C/vuoxejhonpTpALo2Ug99Kv66NqoyqctAx3vxTSePFuEhCqXFAoGBAJDN\nDSxBSdP23mo6wqZggbfolAsyAIvgYYHms5Rrojo6L86/US9vigsf/oxIBykPD6Mp\nmYl0L51dq06aT8CTVSTh8SYnEy9mT4CmNmMcwl9kfQD9+duclqX/QTY/NeBOY3kd\npFcFD/6tS65/ZSq0kuAUOmima0dHo7ZQHPxPQvVVAoGBAIUgyNbMyk2cnHcYbVJK\n6EYX2E99I14xdnSKJEQhwhUuYmeLKrERU9tUcud25IYeeMV6oSAteXNMITeS4hud\nk4pTK3fhWjgT2yf7pzlpINm0I8Q5Aq4FW7CkDUoGBcwRp3ZSZysPXBjvRC9MwNZQ\ngDz9+2qxT9u4HGQ+kUTcJM4O\n-----END PRIVATE KEY-----\n",
	"client_email": "firebase-adminsdk-aooda@pwa-native-firebase.iam.gserviceaccount.com",
	"client_id": "113928589312682169224",
	"auth_uri": "https://accounts.google.com/o/oauth2/auth",
	"token_uri": "https://oauth2.googleapis.com/token",
	"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
	"client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-aooda%40pwa-native-firebase.iam.gserviceaccount.com"
  },`;

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

	console.log(airhorn.templates.templates);
	expect(airhorn.templates.getTemplate('cool-multi-lingual')).toEqual(1);

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
