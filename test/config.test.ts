import {Config} from '../src/config';

test('Config - init', () => {
	expect(new Config()).toEqual(new Config());
});

test('Config - default settings', () => {
	const config = new Config();

	expect(config.templatePath).toEqual('./templates');
	expect(config.defaultTemplateLanguage).toEqual('en');
});

test('Config - settings on constructor', () => {
	const object = {
		templatePath: './foo',
		defaultTemplateLanguage: 'es',
	};

	const config = new Config(object);

	expect(config.templatePath).toEqual(object.templatePath);
});

test('Config - parse with object', () => {
	const object = {
		templatePath: './foo',
		defaultTemplateLanguage: 'es',
	};

	const config = new Config();
	config.parse(object);

	expect(config.templatePath).toEqual(object.templatePath);
});

test('Config - defaultTemplateLanguage Should Not Be Default en', () => {
	const object = {
		templatePath: './foo',
	};

	const config = new Config();
	config.parse(object);

	expect(config.defaultTemplateLanguage).toEqual('en');
});

test('Config - settings on constructor', () => {
	const object = {
		defaultTemplateLanguage: 'es',
	};

	const config = new Config();
	config.parse(object);

	expect(config.defaultTemplateLanguage).toEqual(object.defaultTemplateLanguage);
});
