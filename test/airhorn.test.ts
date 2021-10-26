import {Airhorn} from '../src/airhorn';
import {Config} from '../src/config';

test('Airhorn Init', () => {
	expect(new Airhorn()).toEqual(new Airhorn());
});

test('Get Templates', () => {
	const airhorn = new Airhorn();

	expect(airhorn.templates.config).toEqual(new Config());
});
