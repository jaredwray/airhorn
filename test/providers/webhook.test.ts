import {test, expect} from 'vitest';
import {WebHook} from '../../src/providers/webhook.js';

test('WebHook - Init', () => {
	expect(new WebHook()).toEqual(new WebHook());
});
