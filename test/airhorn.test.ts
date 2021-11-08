import {Airhorn} from '../src/airhorn';
import {Config} from '../src/config';

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
