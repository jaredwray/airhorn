import {Airhorn} from '../src/airhorn';

test('Test Init Error', () => {
	expect(new Airhorn()).toEqual(new Airhorn());
});
