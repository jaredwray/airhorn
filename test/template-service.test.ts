import {describe, test, expect} from 'vitest';
import {AirhornTemplateService} from '../src/template-service.js';
import { MemoryTemplateProvider } from '../src/template-providers/memory.js';

describe('TemplateService', () => {
	test('template service can initialize', () => {
		const airhornStore = new MemoryTemplateProvider();
		const service = new AirhornTemplateService(airhornStore);
		expect(service).toBeDefined();
	});

	test('template store property is set', () => {
		const airhornStore = new MemoryTemplateProvider();
		const service = new AirhornTemplateService(airhornStore);
		expect(service.provider).toBeDefined();
	});
});
