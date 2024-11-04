import {describe, test, expect} from 'vitest';
import { AirhornProviderType } from '../src/provider-type.js';
import { AirhornTemplate, AirhornTemplateText } from '../src/template.js';

describe('AirhornTemplate', () => {
	test('AirhornTemplate initialize', () => {
		const template = new AirhornTemplate('name');
		expect(template.name).toBeDefined();
	});
	test('can set the name', () => {
		const template = new AirhornTemplate('name');
		template.name = 'new name';
		expect(template.name).toBe('new name');
	});
});

describe('AirhornTemplateText', () => {
	test('AirhornTemplateText initialize', () => {
		const template = new AirhornTemplateText({
			langCode: 'en',
			text: 'text',
			providerType: AirhornProviderType.SMTP,
			properties: new Map(),
		});
		expect(template).toBeDefined();
	});

	test('can set the properties', () => {
		const template = new AirhornTemplateText({
			langCode: 'en',
			text: 'text',
			providerType: AirhornProviderType.SMTP,
			properties: new Map(),
		});
		template.langCode = 'fr';
		template.text = 'new text';
		template.providerType = AirhornProviderType.SMS;
		template.properties = new Map([['key', 'value']]);
		expect(template.langCode).toBe('fr');
		expect(template.text).toBe('new text');
		expect(template.providerType).toBe(AirhornProviderType.SMS);
		expect(template.properties.get('key')).toBe('value');
	});
});
