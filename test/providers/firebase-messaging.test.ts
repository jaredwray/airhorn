/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {FirebaseMessaging} from '../../src/providers/firebase-messaging';

jest.mock('firebase-admin', () => ({
	messaging: jest.fn().mockImplementation(() => ({})),
	initializeApp: jest.fn(),
	credential: {
		cert: jest.fn(),
	},
}));

const notification = {
	title: 'Sample notification Title',
	body: 'Sample push notification content',
};

test('Firebase Messaging to Device  - Send', async () => {
	const certContent = JSON.stringify({
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
	const firebaseAdmin = new FirebaseMessaging(certContent);
	const token = 'deviceIdToken';
	const message = JSON.stringify(notification);

	firebaseAdmin.client = {
		send: jest.fn().mockReturnValue({}),
	} as any;

	expect(await firebaseAdmin.send(token, '', message)).toEqual(true);
});
