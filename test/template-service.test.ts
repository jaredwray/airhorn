import {Config} from '../src/config.js';
import {TemplateService} from '../src/template-service.js';

test('Template Service Init', () => {
	const templateService = new TemplateService();

	expect(templateService).toEqual(new TemplateService());
});

test('Template Service - Config Updated', () => {
	const templateService = new TemplateService();
	templateService.config = new Config({
		TEMPLATE_PATH: './test/templates',
	});

	expect(templateService.config.TEMPLATE_PATH).toEqual('./test/templates');
});

test('Template Service - Load Templates', () => {
	const templateService = new TemplateService();
	templateService.config = new Config({
		TEMPLATE_PATH: './test/templates',
	});

	templateService.loadTemplates();
	expect(templateService.templates.length).toEqual(3);
});

test('Template Service - Get Template Returning Undefined', () => {
	const templateService = new TemplateService();
	templateService.config = new Config({
		TEMPLATE_PATH: './test/templates',
	});

	templateService.loadTemplates();
	expect(templateService.getTemplate('foo')).toEqual(undefined);
});

