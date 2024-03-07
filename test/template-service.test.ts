import {test, expect} from 'vitest';
import {Options} from '../src/options.js';
import {TemplateService} from '../src/template-service.js';

test('Template Service Init', () => {
	const templateService = new TemplateService();

	expect(templateService).toEqual(new TemplateService());
});

test('Template Service - options Updated', () => {
	const templateService = new TemplateService();
	templateService.options = new Options({
		TEMPLATE_PATH: './test/templates',
	});

	expect(templateService.options.TEMPLATE_PATH).toEqual('./test/templates');
});

test('Template Service - Load Templates', () => {
	const templateService = new TemplateService();
	templateService.options = new Options({
		TEMPLATE_PATH: './test/templates',
	});

	templateService.loadTemplates();
	expect(templateService.templates.length).toEqual(3);
});

test('Template Service - Load Templates from Options', () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
	};
	const templateService = new TemplateService(options);

	expect(templateService.templates.length).toEqual(3);
});

test('Template Service - Template Load Resets Each Time', () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
	};
	const templateService = new TemplateService(options);
	expect(templateService.templates.length).toEqual(3);

	templateService.loadTemplates();

	expect(templateService.templates.length).toEqual(3);
});

test('Template Service - Get Template from Options', () => {
	const options = {
		TEMPLATE_PATH: './test/templates',
	};
	const templateService = new TemplateService(options);

	expect(templateService.getTemplate('cool-multi-lingual')?.name).toEqual('cool-multi-lingual');
});

test('Template Service - Get Template Returning Undefined', () => {
	const templateService = new TemplateService();
	templateService.options = new Options({
		TEMPLATE_PATH: './test/templates',
	});

	templateService.loadTemplates();
	expect(templateService.getTemplate('foo')).toEqual(undefined);
});

