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
	const firebaseAdmin = new FirebaseMessaging('path-to-certificate');
	const token = 'deviceIdToken';

	const message = {
		notification,
		token,
	};

	firebaseAdmin.client = {
		send: jest.fn().mockReturnValue({}),
	} as any;

	expect(await firebaseAdmin.send(message)).toEqual(true);
});

test('Firebase Messaging to Topic  - Send', async () => {
	const firebaseAdmin = new FirebaseMessaging('path-to-certificate');

	const topic = 'firebaseTopicName';

	const message = {
		notification,
		topic,
	};

	firebaseAdmin.client = {
		send: jest.fn().mockReturnValue({}),
	} as any;

	expect(await firebaseAdmin.send(message)).toEqual(true);
});
