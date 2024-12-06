import {test, expect, vi} from 'vitest';
import type * as admin from 'firebase-admin';

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

const {FirebaseMessaging} = await import('../../src/providers/firebase-messaging.js');

const notification = {
	title: 'Sample notification Title',
	body: 'Sample push notification content',
};

test('Firebase Messaging to Device  - Send', async () => {
	const firebaseAdmin = new FirebaseMessaging(FIREBASE_CERT);
	const token = 'deviceIdToken';
	const message = JSON.stringify(notification);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	firebaseAdmin.client = {
		send: vi.fn().mockReturnValue({}),
	} as any;

	expect(await firebaseAdmin.send(token, '', message)).toEqual(true);
});

test('Firebase Messaging to Device  - JSON', async () => {
	const firebaseAdmin = new FirebaseMessaging(FIREBASE_CERT);
	const token = 'deviceIdToken';
	const message = JSON.stringify(notification);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	firebaseAdmin.client = {
		send: vi.fn().mockReturnValue({}),
	} as any;

	expect(await firebaseAdmin.send(token, '', message)).toEqual(true);
});

test('Firebase Messaging - No Client to Send too', async () => {
	const firebaseAdmin = new FirebaseMessaging(FIREBASE_CERT);
	const token = 'deviceIdToken';
	const message = JSON.stringify(notification);

	firebaseAdmin.client = undefined;

	expect(await firebaseAdmin.send(token, '', message)).toEqual(false);
});
