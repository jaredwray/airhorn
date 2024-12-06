import {describe, test, expect} from 'vitest';
import {MemoryTemplateProvider} from '../../src/template-providers/memory.js';
import {
	airhornTestTemplate,
} from '../testing-data.js';

describe('MemoryStoreProvider', () => {
	test('initialize the store', () => {
		const store = new MemoryTemplateProvider();
		expect(store).toBeDefined();
	});

	test('can get and set the name', () => {
		const store = new MemoryTemplateProvider();
		expect(store.name).toBe('memory');
		store.name = 'test';
		expect(store.name).toBe('test');
	});

	test('can get and set the uri', () => {
		const store = new MemoryTemplateProvider();
		expect(store.uri).toBe('memory://localhost');
		store.uri = 'test';
		expect(store.uri).toBe('test');
	});

	test('can generate an id', () => {
		const store = new MemoryTemplateProvider();
		const id = store.generateId();
		expect(id).toBeDefined();
	});
});

describe('MemoryStoreProvider - Templates', () => {
	test('create a template', async () => {
		const store = new MemoryTemplateProvider();
		const template = await store.createTemplate(airhornTestTemplate);
		expect(template).toBeDefined();
		expect(template.name).toBeDefined();
	});

	test('get template by id', async () => {
		const store = new MemoryTemplateProvider();
		const template = await store.createTemplate(airhornTestTemplate);
		const foundTemplate = await store.getTemplateById(template.name);
		expect(foundTemplate).toBeDefined();
		expect(foundTemplate?.name).toBe(template.name);
	});

	test('get template by name and return undefined if not found', async () => {
		const store = new MemoryTemplateProvider();
		const template = await store.getTemplateById('not-found');
		expect(template).toBeUndefined();
	});

	test('delete template by id', async () => {
		const store = new MemoryTemplateProvider();
		const template = await store.createTemplate(airhornTestTemplate);
		await store.deleteTemplateById(template.name);
		const templates = await store.getTemplates();
		expect(templates.length).toBe(0);
	});
});
