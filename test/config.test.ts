/* eslint-disable node/prefer-global/process */
import {Config} from '../src/config';

test('Config - init', () => {
	expect(new Config()).toEqual(new Config());
});

test('Config - default settings', () => {
	const config = new Config();

	expect(config.TEMPLATE_PATH).toEqual('./templates');
	expect(config.DEFAULT_TEMPLATE_LANGUAGE).toEqual('en');
});

test('Config - test if environment defaults to development', () => {
	process.env.NODE_ENV = undefined;
	const config = new Config();

	expect(config.ENVIRONMENT).toEqual('development');
});

test('Config - settings on constructor', () => {
	const object = {
		TEMPLATE_PATH: './foo',
		DEFAULT_TEMPLATE_LANGUAGE: 'es',
	};

	const config = new Config(object);

	expect(config.TEMPLATE_PATH).toEqual(object.TEMPLATE_PATH);
	expect(config.DEFAULT_TEMPLATE_LANGUAGE).toEqual(object.DEFAULT_TEMPLATE_LANGUAGE);
});

test('Config - parse with object', () => {
	const object = {
		TEMPLATE_PATH: './foo',
		DEFAULT_TEMPLATE_LANGUAGE: 'es',
	};

	const config = new Config();
	config.parse(object);

	expect(config.TEMPLATE_PATH).toEqual(object.TEMPLATE_PATH);
	expect(config.DEFAULT_TEMPLATE_LANGUAGE).toEqual(object.DEFAULT_TEMPLATE_LANGUAGE);
});

test('Config - defaultTemplateLanguage Should Not Be Default en', () => {
	const object = {
		TEMPLATE_PATH: './foo',
	};

	const config = new Config();
	config.parse(object);

	expect(config.DEFAULT_TEMPLATE_LANGUAGE).toEqual('en');
});

test('Config - settings on constructor as language es', () => {
	const object = {
		DEFAULT_TEMPLATE_LANGUAGE: 'es',
	};

	const config = new Config();
	config.parse(object);

	expect(config.DEFAULT_TEMPLATE_LANGUAGE).toEqual(object.DEFAULT_TEMPLATE_LANGUAGE);
});
