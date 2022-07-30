/* eslint-disable n/prefer-global/process */
import {getFirebaseCert, getSendgridAPIKey} from './testing-data.js';

test('getFirebaseCert throws an error', () => {
	delete process.env.FIREBASE_CERT;

	try {
		getFirebaseCert();
	} catch (error) {
		expect(error).toEqual(new Error('FIREBASE_CERT not defined. Please refer to the README.md under Testing Integrations.'));
	}
});

test('getSendgridAPIKey throws an error', () => {
	delete process.env.TWILIO_SENDGRID_API_KEY;

	try {
		getSendgridAPIKey();
	} catch (error) {
		expect(error).toEqual(new Error('TWILIO_SENDGRID_API_KEY not defined. Please refer to the README.md under Testing Integrations.'));
	}
});
