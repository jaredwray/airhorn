/* eslint-disable n/prefer-global/process */
import {Config} from '../src/config.js';

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

test('Config - clean value', () => {
	const config = new Config();

	expect(config.cleanValue('test')).toEqual('test');
	expect(config.cleanValue('test ')).toEqual('test');
	expect(config.cleanValue()).toEqual('');
});

test('Config - settings as object', () => {
	const object = {
		TWILIO_SMS_ACCOUNT_SID: 'foo',
		TWILIO_SMS_AUTH_TOKEN: 'bar',
		TWILIO_SENDGRID_API_KEY: 'baz',
		AWS_SES_REGION: 'eu-west-1',
		AWS_SMS_REGION: 'us-west-1',
		AWS_SNS_REGION: 'us-east-2',
		FIREBASE_CERT: './foo',
	};

	const config = new Config();
	config.parse(object);

	expect(config.TWILIO_SMS_ACCOUNT_SID).toEqual(object.TWILIO_SMS_ACCOUNT_SID);
	expect(config.TWILIO_SMS_AUTH_TOKEN).toEqual(object.TWILIO_SMS_AUTH_TOKEN);
	expect(config.TWILIO_SENDGRID_API_KEY).toEqual(object.TWILIO_SENDGRID_API_KEY);
	expect(config.AWS_SES_REGION).toEqual(object.AWS_SES_REGION);
	expect(config.AWS_SMS_REGION).toEqual(object.AWS_SMS_REGION);
	expect(config.AWS_SNS_REGION).toEqual(object.AWS_SNS_REGION);
	expect(config.FIREBASE_CERT).toEqual(object.FIREBASE_CERT);
});

test('Config - settings on process', () => {
	process.env.TWILIO_SMS_ACCOUNT_SID = 'foo';
	process.env.TWILIO_SMS_AUTH_TOKEN = 'bar';
	process.env.TWILIO_SENDGRID_API_KEY = 'baz';
	process.env.AWS_SES_REGION = 'eu-west-1';
	process.env.AWS_SMS_REGION = 'us-west-1';
	process.env.AWS_SNS_REGION = 'us-east-2';
	process.env.FIREBASE_CERT = './foo';

	const config = new Config();
	config.parse({});

	expect(config.TWILIO_SMS_ACCOUNT_SID).toEqual(process.env.TWILIO_SMS_ACCOUNT_SID);
	expect(config.TWILIO_SMS_AUTH_TOKEN).toEqual(process.env.TWILIO_SMS_AUTH_TOKEN);
	expect(config.TWILIO_SENDGRID_API_KEY).toEqual(process.env.TWILIO_SENDGRID_API_KEY);
	expect(config.AWS_SES_REGION).toEqual(process.env.AWS_SES_REGION);
	expect(config.AWS_SMS_REGION).toEqual(process.env.AWS_SMS_REGION);
	expect(config.AWS_SNS_REGION).toEqual(process.env.AWS_SNS_REGION);
	expect(config.FIREBASE_CERT).toEqual(process.env.FIREBASE_CERT);
});
