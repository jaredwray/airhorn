import {Template} from '../src/template';
import {TestingData} from './testing-data';

const templateCoolMultiLingual = './test/templates/cool-multi-lingual';
const templateGenericTemplateFoo = './test/templates/generic-template-foo';
const templateMultipleTypesBar = './test/templates/multiple-types-bar';
const testingData = new TestingData();

test('Template Init', () => {
	const template = new Template();

	expect(template).toEqual(new Template());
});

test('Template - Load Generic Template ', () => {
	const template = new Template(templateGenericTemplateFoo);

	expect(template.name).toEqual('generic-template-foo');
});

test('Template - Load Multi Lingual ', () => {
	const template = new Template(templateCoolMultiLingual);

	expect(template.name).toEqual('cool-multi-lingual');
});

test('Template - Load Generic Template ', () => {
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

test('Template - Set/Get Text ', () => {
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

	expect(template.getFileName(filePath)).toContain('you.hbs');
});

test('Template - Get File Name - Dir', async () => {
	const template = new Template();

	const filePath = './foo/bar/';

	expect(template.getFileName(filePath)).toContain('');
});
