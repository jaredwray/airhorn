
import path from 'node:path';
import {
	describe, test, expect, vi,
} from 'vitest';
import type * as admin from 'firebase-admin';
import {AirhornProviderType} from '../src/provider-type.js';
import {Airhorn, type AirhornNotification, AirhornNotificationStatus} from '../src/airhorn.js';
import {FirebaseMessaging} from '../src/providers/firebase-messaging.js';
import { MongoStoreProvider } from '../src/template-providers/mongo.js';
import { MemoryStoreProvider } from '../src/template-providers/memory.js';
import { AirhornStore } from '../src/store.js';
import { AirhornTemplateSync } from '../src/template-sync.js';
import {TestingData, TestingDataTwo} from './testing-data.js';

// eslint-disable-next-line n/prefer-global/process
process.env.PUBSUB_EMULATOR_HOST = 'localhost:8085';

vi.mock('firebase-admin', async () => {
	const actual: typeof admin = await vi.importActual('firebase-admin'); // Import the actual module

	return {
		...actual, // Spread the actual implementations
		initializeApp: vi.fn(),
		messaging: vi.fn(),
		apps: [],
		auth: vi.fn(() => ({
			...actual.auth(), // Use actual auth methods
			verifyIdToken: vi.fn().mockResolvedValue({ uid: 'mocked-uid' }), // Mock specific methods
		})),
	};
});

// eslint-disable-next-line n/prefer-global/process
const FIREBASE_CERT = process.env.FIREBASE_CERT ?? './firebase-cert.json';

// eslint-disable-next-line n/prefer-global/process
const WEBHOOK_MOCK_URL = process.env.WEBHOOK_MOCK_URL ?? 'https://mockhttp.org/post';

describe('Airhorn', async () => {
	test('Airhorn - Send Friendly WebHook', async () => {
		const options = {
			TEMPLATE_PATH: './test/templates',
		};
		const airhorn = new Airhorn(options);

		const airhornTemplateSync = new AirhornTemplateSync(path.resolve(options.TEMPLATE_PATH), airhorn.store);
		await airhornTemplateSync.sync();

		const userData = new TestingDataTwo();

		expect(await airhorn.sendWebhook(WEBHOOK_MOCK_URL, '', 'cool-multi-lingual', userData.userOne)).toEqual(true);
	}, 40_000);
});
