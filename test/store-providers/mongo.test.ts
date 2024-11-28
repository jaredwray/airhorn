import {test, describe, expect} from 'vitest';
import {MongoStoreProvider} from '../../src/template-providers/mongo.js';
import { airhornTestTemplate } from '../testing-data.js';

const uri = 'mongodb://localhost:27017';
const mongoStoreProvider = new MongoStoreProvider({uri});

describe('MongoStoreProvider', () => {
	test('init with name', () => {
		const provider = new MongoStoreProvider();
		expect(provider.name).toBe('MongoStoreProvider');
	});

	test('init with all options', () => {
		const uri = 'mongodb://127.0.0.1:27017';
		const provider = new MongoStoreProvider({uri});
		expect(provider.uri).toBe(uri);
	});

	test('init with some options', () => {
		const uri = 'mongodb://127.0.0.1:27017';
		const provider = new MongoStoreProvider({uri});
		expect(provider.uri).toBe(uri);
	});
});

describe('MongoStoreProvider Templates', () => {
	test('createTemplate', async () => {
		const provider = mongoStoreProvider;
		const template = await provider.createTemplate(airhornTestTemplate);
		expect(template.name).toBe('airhorn-test-template');
		await provider.templatesCollection.deleteMany({});
	});

	test('get templates', async () => {
		const provider = mongoStoreProvider;
		await provider.templatesCollection.deleteMany({});
		const templateOne = await provider.createTemplate(airhornTestTemplate);
		const templateTwo = await provider.createTemplate(airhornTestTemplate);
		const templates = await provider.getTemplates();
		expect(templates.length).toBe(2);
		expect(templates[0].name).toBe(templateOne.name);
		await provider.templatesCollection.deleteMany({});
	});

	test('get template by name', async () => {
		const provider = mongoStoreProvider;
		await provider.templatesCollection.deleteMany({});
		const template = await provider.createTemplate(airhornTestTemplate);
		const result = await provider.getTemplateById(template.name);
		expect(result?.name).toBe(template.name);
		await provider.templatesCollection.deleteMany({});
	});

	test('get umndefined template by name', async () => {
		const provider = mongoStoreProvider;
		const result = await provider.getTemplateById('undefined-template');
		expect(result).toBeUndefined();
	});
});
