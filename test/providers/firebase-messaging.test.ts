import {jest} from '@jest/globals';
import {FirebaseMessaging} from '../../src/providers/firebase-messaging.js';

jest.mock('firebase-admin', () => ({
	...jest.mock('firebase-admin'),
	credential: {
		cert: jest.fn(),
	},
	initializeApp: jest.fn(),
	firestore: jest.fn(),
	messaging: jest.fn().mockImplementation(() => ({
		send: jest.fn().mockImplementation(async () => true),
	})),

	apps: jest.fn().mockImplementation(() => ['apps']),
}));

const notification = {
	title: 'Sample notification Title',
	body: 'Sample push notification content',
};

test('Firebase Messaging to Device  - Send', async () => {
	const firebaseAdmin = new FirebaseMessaging('this.json');
	const token = 'deviceIdToken';
	const message = JSON.stringify(notification);

	firebaseAdmin.client = {
		send: jest.fn().mockReturnValue({}),
	} as any;

	expect(await firebaseAdmin.send(token, '', message)).toEqual(true);
});

test('Firebase Messaging to Device  - JSON', async () => {
	const firebaseAdmin = new FirebaseMessaging('this.json');
	const token = 'deviceIdToken';
	const message = JSON.stringify(notification);

	firebaseAdmin.client = {
		send: jest.fn().mockReturnValue({}),
	} as any;

	expect(await firebaseAdmin.send(token, '', message)).toEqual(true);
});

test('Firebase Messaging - No Client to Send too', async () => {
	const firebaseAdmin = new FirebaseMessaging('this.json');
	const token = 'deviceIdToken';
	const message = JSON.stringify(notification);

	firebaseAdmin.client = undefined;

	expect(await firebaseAdmin.send(token, '', message)).toEqual(false);
});
