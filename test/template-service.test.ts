import {Config} from '../src/config';
import {TemplateService} from '../src/template-service';

test('Template Service Init', () => {
	const templateService = new TemplateService();

	expect(templateService).toEqual(new TemplateService());
});

test('Template Service - Config Updated', () => {
	const templateService = new TemplateService();
	templateService.config = new Config({
		templatePath: './test/templates',
	});

	expect(templateService.config.templatePath).toEqual('./test/templates');
});

test('Template Service - Load Templates', () => {
	const templateService = new TemplateService();
	templateService.config = new Config({
		templatePath: './test/templates',
	});

	templateService.loadTemplates();
	expect(templateService.templates.length).toEqual(3);
});

test('Template Service - Get Template Returning Undefined', () => {
	const templateService = new TemplateService();
	templateService.config = new Config({
		templatePath: './test/templates',
	});

	templateService.loadTemplates();
	expect(templateService.getTemplate('foo')).toEqual(undefined);
});

