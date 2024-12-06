import {text} from 'node:stream/consumers';
import {test, describe, expect} from 'vitest';
import {MongoTemplateProvider} from '../../src/template-providers/mongo.js';
import {airhornTestTemplate} from '../testing-data.js';
import {AirhornTemplateText} from '../../src/template.js';
import {AirhornProviderType} from '../../src/provider-type.js';

const uri = 'mongodb://localhost:27017';
const mongoStoreProvider = new MongoTemplateProvider({uri});

describe('MongoStoreProvider', () => {
	test('init with name', () => {
		const provider = new MongoTemplateProvider();
		expect(provider.name).toBe('MongoStoreProvider');
	});

	test('init with all options', () => {
		const uri = 'mongodb://127.0.0.1:27017';
		const provider = new MongoTemplateProvider({uri});
		expect(provider.uri).toBe(uri);
	});

	test('init with some options', () => {
		const uri = 'mongodb://127.0.0.1:27017';
		const provider = new MongoTemplateProvider({uri});
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

	test('update template', async () => {
		const provider = mongoStoreProvider;
		await provider.templatesCollection.deleteMany({});
		const template = await provider.createTemplate(airhornTestTemplate);
		template.text = [new AirhornTemplateText({text: 'updated', providerType: AirhornProviderType.SMS})];
		const updatedTemplate = await provider.updateTemplate(template);
		expect(updatedTemplate.getText(AirhornProviderType.SMS, 'en')?.text).toBe('updated');
		await provider.templatesCollection.deleteMany({});
	});

	test('delete template by name', async () => {
		const provider = mongoStoreProvider;
		await provider.templatesCollection.deleteMany({});
		const template = await provider.createTemplate(airhornTestTemplate);
		await provider.deleteTemplateById(template.name);
		const result = await provider.getTemplateById(template.name);
		expect(result).toBeUndefined();
	});
});
