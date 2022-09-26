import {jest} from '@jest/globals';

jest.mock('firebase-admin', () => ({
	apps: ['testAppId'],
}));

const {FirebaseMessaging} = await import ('../../src/providers/firebase-messaging.js');

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
