import {Airhorn} from '../src/airhorn';
import {Config} from '../src/config';
import {ProviderType} from '../src/provider-type';
import {TestingData} from './testing-data';

test('Airhorn - Init', () => {
	expect(new Airhorn()).toEqual(new Airhorn());
});

test('Airhorn - Get Templates', () => {
	const airhorn = new Airhorn();

	expect(airhorn.templates.config).toEqual(new Config());
});

test('Airhorn - Get Providers', () => {
	const airhorn = new Airhorn();

	expect(airhorn.providers.config).toEqual(new Config());
});

test('Airhorn - Options Validated in Config', () => {
	const options = {
		templatePath: './test/templates',
	};
	const airhorn = new Airhorn(options);

	expect(airhorn.config.templatePath).toEqual(options.templatePath);
});

test('Airhorn - Get Provider By Type', () => {
	const options = {
		templatePath: './test/templates',
	};
	const airhorn = new Airhorn(options);

	expect(airhorn.providers.getProviderByType(ProviderType.WEBHOOK).length).toEqual(1);
});

test('Airhorn - Send WebHook', async () => {
	const options = {
		templatePath: './test/templates',
	};
	const airhorn = new Airhorn(options);
	const userData = new TestingData();

	expect(await airhorn.send('cool-multi-lingual', ProviderType.WEBHOOK, userData.users[0])).toEqual(true);
});
