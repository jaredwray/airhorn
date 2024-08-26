import {describe, test, expect} from 'vitest';
import { type AirhornSubscription } from '../src/subscription.js';
import { AirhornProviderType } from '../src/provider-type.js';

describe('AirhornSubscription', async () => {
	test('Init AirhornSubscription', async () => {
		const subscription: AirhornSubscription = {
			id: '123',
			to: 'foo',
			templateName: 'test-template',
			providerType: AirhornProviderType.SMTP,
			createdAt: new Date(),
			modifiedAt: new Date(),
		};
		expect(subscription).toBeDefined();
	});
});
