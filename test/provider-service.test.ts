import {test, expect} from 'vitest';
import {ProviderService} from '../src/provider-service.js';
import {AirhornProviderType} from '../src/provider-type.js';
import {WebHook} from '../src/providers/webhook.js';

test('Provider Service Init', () => {
	const providerService = new ProviderService();

	expect(providerService).toEqual(new ProviderService());
});

test('Provider Service - Options', () => {
	const options = {TEMPLATE_PATH: './test/templates/'};
	const providerService = new ProviderService(options);

	expect(providerService.options.TEMPLATE_PATH).toEqual(options.TEMPLATE_PATH);
});

test('Provider Service - Get Providers', () => {
	const providerService = new ProviderService();

	expect(providerService.providers.length).toEqual(1);
});

test('Provider Service - Get SMS Providers', () => {
	const providerService = new ProviderService();

	expect(providerService.sms).toEqual([]);
});

test('Provider Service - Get smtp Provider', () => {
	const providerService = new ProviderService();

	expect(providerService.smtp).toEqual([]);
});

test('Provider Service - Get webhook Provider', () => {
	const providerService = new ProviderService();

	expect(providerService.webhook.length).toEqual(1);
});

test('Provider Service - Get mobilePush Provider', () => {
	const providerService = new ProviderService();

	expect(providerService.mobilePush).toEqual([]);
});

test('Provider Service - Get Provider By Type With No Result', () => {
	const providerService = new ProviderService();

	expect(providerService.getProviderByType(AirhornProviderType.SMS).length).toEqual(0);
});

test('Provider Service - Get Provider By Type', () => {
	const providerService = new ProviderService();

	expect(providerService.getProviderByType(AirhornProviderType.WEBHOOK).length).toEqual(1);
});

test('Provider Service - Add Provider', () => {
	const providerService = new ProviderService();
	providerService.removeProvider('webhook');

	const webHook = new WebHook();

	providerService.addProvider(webHook);

	expect(providerService.providers.length).toEqual(1);
});

test('Provider Service - Add Provider Exists', () => {
	const providerService = new ProviderService();
	const webHook = new WebHook();

	expect(() => {
		providerService.addProvider(webHook);
	}).toThrow('Provider webhook already exists');

	expect(providerService.providers.length).toEqual(1);
});

test('Provider Service - Remove Provider', () => {
	const providerService = new ProviderService();

	expect(providerService.providers.length).toEqual(1);

	providerService.removeProvider('webhook');

	expect(providerService.providers.length).toEqual(0);
});

test('Provider Service - Remove Provider Does Not Exist', () => {
	const providerService = new ProviderService();

	expect(providerService.providers.length).toEqual(1);

	providerService.removeProvider('sms');

	expect(providerService.providers.length).toEqual(1);
});

test('Provider Service - Update Provider', () => {
	const providerService = new ProviderService();
	const webHook = new WebHook();

	providerService.updateProvider(webHook);

	expect(providerService.providers.length).toEqual(1);
});

test('Provider Service - Update Provider Does Not Exist', () => {
	const providerService = new ProviderService();
	providerService.removeProvider('webhook');

	const webHook = new WebHook();

	providerService.updateProvider(webHook);

	expect(providerService.providers.length).toEqual(1);
});

test('Provider Service - Load Twilio SMS Service from Config', () => {
	const providerService = new ProviderService({
		TWILIO_SMS_ACCOUNT_SID: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		TWILIO_SMS_AUTH_TOKEN: 'your_auth_token',
	});

	expect(providerService.getProvider('twilio-sms')?.name).toEqual('twilio-sms');
});

test('Provider Service - Load AWS SES and Twilio Service from Config', () => {
	const providerService = new ProviderService({
		TWILIO_SMS_ACCOUNT_SID: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		TWILIO_SMS_AUTH_TOKEN: 'your_auth_token',
		AWS_SES_REGION: 'us-east-1',
		AWS_SMS_REGION: 'us-west-1',
	});

	expect(providerService.getProvider('aws-ses')?.name).toEqual('aws-ses');
	expect(providerService.getProvider('twilio-sms')?.name).toEqual('twilio-sms');
});

test('Provider service - Load AWS SNS from Config', () => {
	const providerService = new ProviderService({
		AWS_SNS_REGION: 'us-west-1',
	});

	expect(providerService.getProvider('aws-sns')?.name).toEqual('aws-sns');
});
