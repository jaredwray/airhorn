import {describe, test, expect} from 'vitest';
import { AirhornStore } from '../src/store.js';
import {AirhornTemplateService} from '../src/template-service.js';
import { MemoryStoreProvider } from '../src/template-providers/memory.js';

describe('TemplateService', () => {
	test('template service can initialize', () => {
		const airhornStore = new AirhornStore(new MemoryStoreProvider());
		const service = new AirhornTemplateService(airhornStore);
		expect(service).toBeDefined();
	});

	test('template store property is set', () => {
		const airhornStore = new AirhornStore(new MemoryStoreProvider());
		const service = new AirhornTemplateService(airhornStore);
		expect(service.store).toBeDefined();
	});
});
