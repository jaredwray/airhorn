import {test, expect} from 'vitest';
import {Template} from '../src/template.js';
import {TestingData} from './testing-data.js';

const templateCoolMultiLingual = './test/templates/cool-multi-lingual';
const templateGenericTemplateFoo = './test/templates/generic-template-foo';
const templateMultipleTypesBar = './test/templates/multiple-types-bar';
const testingData = new TestingData();

test('Template Init', () => {
	const template = new Template();

	expect(template).toEqual(new Template());
});

test('Template - Load Generic Template', () => {
	const template = new Template(templateGenericTemplateFoo);

	expect(template.name).toEqual('generic-template-foo');
});

test('Template - Load Multilingual', () => {
	const template = new Template(templateCoolMultiLingual);

	expect(template.name).toEqual('cool-multi-lingual');
	expect(template.getText('smtp', 'en').text).toContain('<p>Click here to download the following files from this email: </p>');
});

test('Template - Load Generic Template with multiple types', () => {
	const template = new Template(templateMultipleTypesBar);

	expect(template.name).toEqual('multiple-types-bar');
});

test('Template - Generic Text Versions', () => {
	const template = new Template(templateGenericTemplateFoo);

	expect(template.getText('smtp').text).toContain('<p>Your email is {{ email }} and this is a generic template</p>');
});

test('Template - Generic No Template Default to Blank', () => {
	const template = new Template(templateGenericTemplateFoo);

	expect(template.getText('sms').text).toEqual('');
});

test('Template - Multilingual Text - en-smtp', () => {
	const template = new Template(templateCoolMultiLingual);

	expect(template.getText('smtp').text).toContain('<p>Click here to download the following files from this email: </p>');
});

test('Template - Multilingual Text - es-smtp', () => {
	const template = new Template(templateCoolMultiLingual);

	expect(template.getText('smtp', 'es').text).toContain('<p>Haga clic aquí para descargar los siguientes archivos: </p>');
});

test('Template - Set/Get Text', () => {
	const template = new Template(templateMultipleTypesBar);

	template.setText('sms', 'es', 'sms es', 'handlebars');
	template.setText('smtp', 'en', 'smtp en', 'handlebars');

	expect(template.getText('sms', 'es').text).toEqual('sms es');
	expect(template.getText('smtp', 'en').text).toEqual('smtp en');
});

test('Template - Render undefined file path', async () => {
	const template = new Template();

	const renderedText = await template.render('smtp', testingData.users[0]);

	expect(renderedText).toContain('');
});

test('Template - Render en-smtp', async () => {
	const template = new Template(templateCoolMultiLingual);

	const renderedText = await template.render('smtp', testingData.users[0]);

	expect(template.getText('smtp', 'es').text).toContain('<p>Haga clic aquí para descargar los siguientes archivos: </p>');
	expect(testingData.users[0].email).toEqual('john@gmail.com');
	expect(renderedText).toContain('john@gmail.com');
});

test('Template - Get File Name - Path', async () => {
	const template = new Template();

	const filePath = templateCoolMultiLingual;

	expect(template.getFileName(filePath)).toContain('cool-multi-lingual');
});

test('Template - Get File Name - Undefined', async () => {
	const template = new Template();

	const filePath = undefined;

	expect(template.getFileName(filePath)).toContain('');
});

test('Template - Get File Name - File', async () => {
	const template = new Template();

	const filePath = './foo/bar/you.hbs';

	expect(template.getFileName(filePath)).toEqual('you.hbs');
});

test('Template - Get File Name - Dir', async () => {
	const template = new Template();

	const filePath = './foo/bar/';

	expect(template.getFileName(filePath)).toEqual('');
});

test('Template - Get File Name - Dir2', async () => {
	const template = new Template();

	const filePath = './foo/bar';

	expect(template.getFileName(filePath)).toEqual('bar');
});

test('Template - Load Template File', async () => {
	const template = new Template();

	const filePath = templateCoolMultiLingual + '/en/webhook.hbs';
	template.loadTemplateFile(filePath);

	expect(template.getText('webhook').text).toContain('{{#each downloads}}');
});

test('Template - Load Template Directory', async () => {
	const template = new Template();

	const filePath = templateCoolMultiLingual + '/en';
	template.loadTemplateDirectory(filePath, 'en');

	expect(template.getText('smtp', 'en').text).toContain('{{#each downloads}}');
});

test('Template - Set/Get Text with Matter Subject', () => {
	const template = new Template(templateCoolMultiLingual);

	expect(template.getProperty('smtp', 'subject', 'es')).toEqual('Hola');
	expect(template.getProperty('smtp', 'subject')).toEqual('Hello');
});

test('Template - Set/Get Text with Matter Subject Undefined', () => {
	const template = new Template(templateCoolMultiLingual);

	expect(template.getProperty('smtp', 'foo', 'es')).toEqual('');
});

test('Template - get/set defaultLanguageCode', () => {
	const template = new Template();

	template.defaultLanguageCode = 'es';

	expect(template.defaultLanguageCode).toEqual('es');
});
