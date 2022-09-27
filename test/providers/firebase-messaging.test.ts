import {jest} from '@jest/globals';

jest.mock('firebase-admin', () => ({
	initializeApp: jest.fn(),
	messaging: jest.fn(),
	apps: [],
	credential: {
		cert: jest.fn(),
	},
}));

const {FirebaseMessaging} = await import ('../../src/providers/firebase-messaging.js');

const notification = {
	title: 'Sample notification Title',
	body: 'Sample push notification content',
};

test('Firebase Messaging to Device  - Send', async () => {
	const serviceAccount = {
		projectId: 'test-project-id',
		clientEmail: 'test-client-email',
		privateKey: 'test-private-key',
	};
	const firebaseAdmin = new FirebaseMessaging(`${JSON.stringify(serviceAccount)}`);
	const token = 'deviceIdToken';
	const message = JSON.stringify(notification);

	firebaseAdmin.client = {
		send: jest.fn().mockReturnValue({}),
	} as any;

	expect(await firebaseAdmin.send(token, '', message)).toEqual(true);
});

test('Firebase Messaging to Device  - JSON', async () => {
	const firebaseAdmin = new FirebaseMessaging('file.json');
	const token = 'deviceIdToken';
	const message = JSON.stringify(notification);

	firebaseAdmin.client = {
		send: jest.fn().mockReturnValue({}),
	} as any;

	expect(await firebaseAdmin.send(token, '', message)).toEqual(true);
});

test('Firebase Messaging - No Client to Send too', async () => {
	const firebaseAdmin = new FirebaseMessaging('file.json');
	const token = 'deviceIdToken';
	const message = JSON.stringify(notification);

	firebaseAdmin.client = undefined;

	expect(await firebaseAdmin.send(token, '', message)).toEqual(false);
});
