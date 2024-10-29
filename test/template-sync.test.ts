import path from 'node:path';
import process from 'node:process';
import { describe, test, expect} from 'vitest';
import { AirhornTemplateSync } from '../src/template-sync.js';
import { MemoryStoreProvider } from '../src/store-providers/memory.js';
import { AirhornStore } from '../src/store.js';
import { AirhornProviderType } from '../src/provider-type.js';

enum AirhornTemplatePaths {
	DEFAULT = 'test/templates',
	GENERIC = 'test/templates/generic-template-foo',
	MULTI_LANGUAGE = 'test/templates/cool-multi-lingual',
	MUTLIPLE_TYPES = 'test/templates/multiple-types-bar',
}

const defaultStore = new AirhornStore(new MemoryStoreProvider());

describe('template-sync', async () => {
	test('should initialize with a default language', async () => {
		const airhornTemplateSync = new AirhornTemplateSync(AirhornTemplatePaths.DEFAULT, defaultStore);
		expect(airhornTemplateSync.defaultLanguage).toBe('en');
	});

	test('should initialize with a custom default language', async () => {
		const airhornTemplateSync = new AirhornTemplateSync(AirhornTemplatePaths.DEFAULT, defaultStore, 'es');
		expect(airhornTemplateSync.defaultLanguage).toBe('es');
	});

	test('should set a new default language', async () => {
		const airhornTemplateSync = new AirhornTemplateSync(AirhornTemplatePaths.DEFAULT, defaultStore);
		expect(airhornTemplateSync.defaultLanguage).toBe('en');
		airhornTemplateSync.defaultLanguage = 'es';
		expect(airhornTemplateSync.defaultLanguage).toBe('es');
	});

	test('should check if the directory exists', async () => {
		const directory = path.resolve(process.cwd(), AirhornTemplatePaths.DEFAULT);
		const airhornTemplateSync = new AirhornTemplateSync(directory, defaultStore);
		expect(await airhornTemplateSync.dirExists(directory)).toBe(true);
		expect(await airhornTemplateSync.dirExists('')).toBe(false);
	});

	test('should get all directories in a directory', async () => {
		const directory = path.resolve(process.cwd(), AirhornTemplatePaths.DEFAULT);
		const airhornTemplateSync = new AirhornTemplateSync(directory, defaultStore);
		const directories = await airhornTemplateSync.getDirectories(directory);
		expect(directories).toHaveLength(3);
	});
});

describe('create template text', async () => {
	test('should create a template text with default language', async () => {
		const airhornTemplateSync = new AirhornTemplateSync(AirhornTemplatePaths.GENERIC, defaultStore);
		const filePath = path.resolve(process.cwd(), AirhornTemplatePaths.GENERIC + '/smtp.hbs');
		const templateText = await airhornTemplateSync.createTemplateText(filePath);
		expect(templateText).toBeDefined();
		expect(templateText.langCode).toBe('en');
	});

	test('should create a template text with a specific language', async () => {
		const airhornTemplateSync = new AirhornTemplateSync(AirhornTemplatePaths.MULTI_LANGUAGE, defaultStore);
		const filePath = path.resolve(process.cwd(), AirhornTemplatePaths.GENERIC + '/smtp.hbs');
		const templateText = await airhornTemplateSync.createTemplateText(filePath, 'es');
		expect(templateText).toBeDefined();
		expect(templateText.langCode).toBe('es');
	});

	test('should create a template text and get type', async () => {
		const airhornTemplateSync = new AirhornTemplateSync(AirhornTemplatePaths.GENERIC, defaultStore);
		const filePath = path.resolve(process.cwd(), AirhornTemplatePaths.GENERIC + '/smtp.hbs');
		const templateText = await airhornTemplateSync.createTemplateText(filePath);
		expect(templateText).toBeDefined();
		expect(templateText.providerType).toBe(AirhornProviderType.SMTP);
	});

	test('should create a template text and get type mobile push', async () => {
		const airhornTemplateSync = new AirhornTemplateSync(AirhornTemplatePaths.GENERIC, defaultStore);
		const filePath = path.resolve(process.cwd(), AirhornTemplatePaths.GENERIC + '/mobile-push.hbs');
		const templateText = await airhornTemplateSync.createTemplateText(filePath);
		expect(templateText).toBeDefined();
		expect(templateText.providerType).toBe(AirhornProviderType.MOBILE_PUSH);
	});

	test('should create a template text and get type sms', async () => {
		const airhornTemplateSync = new AirhornTemplateSync(AirhornTemplatePaths.GENERIC, defaultStore);
		const filePath = path.resolve(process.cwd(), AirhornTemplatePaths.MULTI_LANGUAGE + '/en/sms.hbs');
		const templateText = await airhornTemplateSync.createTemplateText(filePath);
		expect(templateText).toBeDefined();
		expect(templateText.providerType).toBe(AirhornProviderType.SMS);
	});

	test('should create a template text and get type webhook', async () => {
		const airhornTemplateSync = new AirhornTemplateSync(AirhornTemplatePaths.GENERIC, defaultStore);
		const filePath = path.resolve(process.cwd(), AirhornTemplatePaths.MULTI_LANGUAGE + '/en/webhook.hbs');
		const templateText = await airhornTemplateSync.createTemplateText(filePath);
		expect(templateText).toBeDefined();
		expect(templateText.providerType).toBe(AirhornProviderType.WEBHOOK);
	});

	test('should create a template text and text source', async () => {
		const airhornTemplateSync = new AirhornTemplateSync(AirhornTemplatePaths.GENERIC, defaultStore);
		const filePath = path.resolve(process.cwd(), AirhornTemplatePaths.GENERIC + '/smtp.hbs');
		const templateText = await airhornTemplateSync.createTemplateText(filePath);
		expect(templateText).toBeDefined();
		expect(templateText.text).not.toContain('---');
	});

	test('should create a template text and property subject', async () => {
		const airhornTemplateSync = new AirhornTemplateSync(AirhornTemplatePaths.GENERIC, defaultStore);
		const filePath = path.resolve(process.cwd(), AirhornTemplatePaths.GENERIC + '/smtp.hbs');
		const templateText = await airhornTemplateSync.createTemplateText(filePath);
		expect(templateText).toBeDefined();
		expect(templateText.properties.get('subject')).toBe('Generic Hello');
	});
});

describe('create template', async () => {
	test('should create a template with default language', async () => {
		const airhornTemplateSync = new AirhornTemplateSync(AirhornTemplatePaths.GENERIC, defaultStore);
		const filePath = path.resolve(process.cwd(), AirhornTemplatePaths.GENERIC);
		const template = await airhornTemplateSync.createTemplate(filePath);
		expect(template).toBeDefined();
		expect(template.text).toHaveLength(2);
	});
	test('should create a template with a specific language', async () => {
		const airhornTemplateSync = new AirhornTemplateSync(AirhornTemplatePaths.MULTI_LANGUAGE, defaultStore);
		const filePath = path.resolve(process.cwd(), AirhornTemplatePaths.MULTI_LANGUAGE);
		const template = await airhornTemplateSync.createTemplate(filePath);
		expect(template).toBeDefined();
		expect(template.text).toHaveLength(6);
	});
});
