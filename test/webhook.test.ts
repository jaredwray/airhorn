
import path from 'node:path';
import {
	describe, test, expect, vi,
} from 'vitest';
import type * as admin from 'firebase-admin';
import {createAirhorn} from '../src/airhorn.js';
import {AirhornTemplateSync} from '../src/template-sync.js';
import {TestingDataTwo} from './testing-data.js';

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
			verifyIdToken: vi.fn().mockResolvedValue({uid: 'mocked-uid'}), // Mock specific methods
		})),
	};
});

const FIREBASE_CERT = process.env.FIREBASE_CERT ?? './firebase-cert.json';

const WEBHOOK_MOCK_URL = process.env.WEBHOOK_MOCK_URL ?? 'https://mockhttp.org/post';

describe('Airhorn', async () => {
	test('Airhorn - Send Friendly WebHook', async () => {
		const options = {
			TEMPLATE_PATH: './test/templates',
		};
		const airhorn = await createAirhorn(options);

		const airhornTemplateSync = new AirhornTemplateSync(path.resolve(options.TEMPLATE_PATH), airhorn.templates.provider);
		await airhornTemplateSync.sync();

		const userData = new TestingDataTwo();

		expect(await airhorn.sendWebhook(WEBHOOK_MOCK_URL, '', 'cool-multi-lingual', userData.userOne)).toEqual(true);
	}, 40_000);
});
