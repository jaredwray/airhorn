import {test, describe, expect} from 'vitest';
import { AirhornTemplate, AirhornTemplateText } from '../src/template.js';
import {AirhornStore} from '../src/store.js';
import { MongoStoreProvider } from '../src/store-providers/mongo.js';

const mongoUri = 'mongodb://localhost:27017/airhorn';

describe('AirhornStore', async () => {
	test('Airhorn Store Initialization', async () => {
		const provider = new MongoStoreProvider({uri: mongoUri});
		const store = new AirhornStore(provider);
		expect(store).toBeDefined();
		expect(store.provider).toBeDefined();
		expect(store.provider?.name).toBe('MongoStoreProvider');
	});

	test('Set Provider', async () => {
		const provider = new MongoStoreProvider({uri: mongoUri});
		const providerNew = new MongoStoreProvider({uri: mongoUri + 'new'});
		const store = new AirhornStore(provider);
		expect(store.provider).toBeDefined();
		store.provider = providerNew;
		expect(store.provider).toBeDefined();
		expect(store.provider?.uri).toBe('mongodb://localhost:27017/airhornnew');
	});

	test('Update Template', async () => {
		const provider = new MongoStoreProvider({uri: mongoUri});
		const store = new AirhornStore(provider);
		const template = new AirhornTemplate('test-template');
		template.text.push(new AirhornTemplateText());
		const createdTemplate = await store.createTemplate(template);
		expect(createdTemplate).toBeDefined();
		const updatedTemplate = await store.updateTemplate(createdTemplate);
		expect(updatedTemplate).toBeDefined();
		expect(updatedTemplate.name).toBe('test-template');
		await store.deleteTemplateById(updatedTemplate.name);
	});
});
