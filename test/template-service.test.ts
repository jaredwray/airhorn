import {describe, test, expect} from 'vitest';
import {AirhornTemplateService} from '../src/template-service.js';
import {MemoryTemplateProvider} from '../src/template-providers/memory.js';
import {AirhornTemplate, AirhornTemplateText} from '../src/template.js';
import {AirhornProviderType} from '../src/provider-type.js';

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

	test('template service can get and set provider', () => {
		const airhornStore = new MemoryTemplateProvider();
		const service = new AirhornTemplateService(airhornStore);
		const newStore = new MemoryTemplateProvider();
		service.provider = newStore;
		expect(service.provider).toBe(newStore);
	});

	test('template service can create a template', async () => {
		const airhornStore = new MemoryTemplateProvider();
		const service = new AirhornTemplateService(airhornStore);
		const template1 = new AirhornTemplate('template1');
		template1.text.push(new AirhornTemplateText({
			text: 'Hello, {{name}}!',
			providerType: AirhornProviderType.SMTP,
			properties: new Map<string, string>([['name', 'world']]),
		}));
		const template = await service.createTemplate(template1);
		expect(template).toBeDefined();
	});

	test('template service can update a template', async () => {
		const airhornStore = new MemoryTemplateProvider();
		const service = new AirhornTemplateService(airhornStore);
		const template1 = new AirhornTemplate('template1');
		template1.text.push(new AirhornTemplateText({
			text: 'Hello, {{name}}!',
			providerType: AirhornProviderType.SMTP,
			properties: new Map<string, string>([['name', 'world']]),
		}));
		const template = await service.createTemplate(template1);
		expect(template).toBeDefined();
		const updatedTemplate = await service.updateTemplate(template1);
		expect(updatedTemplate).toBeDefined();
	});

	test('template service can get templates', async () => {
		const airhornStore = new MemoryTemplateProvider();
		const service = new AirhornTemplateService(airhornStore);
		const template1 = new AirhornTemplate('template1');
		template1.text.push(new AirhornTemplateText({
			text: 'Hello, {{name}}!',
			providerType: AirhornProviderType.SMTP,
			properties: new Map<string, string>([['name', 'world']]),
		}));
		await service.createTemplate(template1);
		const templates = await service.getTemplates();
		expect(templates).toBeDefined();
	});

	test('template service can get a template by id', async () => {
		const airhornStore = new MemoryTemplateProvider();
		const service = new AirhornTemplateService(airhornStore);
		const template1 = new AirhornTemplate('template1');
		template1.text.push(new AirhornTemplateText({
			text: 'Hello, {{name}}!',
			providerType: AirhornProviderType.SMTP,
			properties: new Map<string, string>([['name', 'world']]),
		}));
		await service.createTemplate(template1);
		const template = await service.getTemplateById('template1');
		expect(template).toBeDefined();
	});

	test('template service can delete a template by id', async () => {
		const airhornStore = new MemoryTemplateProvider();
		const service = new AirhornTemplateService(airhornStore);
		const template1 = new AirhornTemplate('template1');
		template1.text.push(new AirhornTemplateText({
			text: 'Hello, {{name}}!',
			providerType: AirhornProviderType.SMTP,
			properties: new Map<string, string>([['name', 'world']]),
		}));
		await service.createTemplate(template1);
		await service.deleteTemplateById('template1');
		const template = await service.getTemplateById('template1');
		expect(template).toBeUndefined();
	});
});
