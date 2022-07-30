/* eslint-disable n/prefer-global/process */
import {getFirebaseCert, getSendgridAPIKey} from './testing-data.js';

class NoErrorThrownError extends Error {}

const getError = <TError>(call: () => unknown): TError => {
	try {
		call();

		throw new NoErrorThrownError();
	} catch (error: unknown) {
		return error as TError;
	}
};

test('getFirebaseCert throws an error', () => {
	delete process.env.FIREBASE_CERT;
	const error = getError<Error>(getFirebaseCert);

	expect(error).toEqual(new Error('FIREBASE_CERT not defined. Please refer to the README.md under Testing Integrations.'));
});

test('getSendgridAPIKey throws an error', () => {
	delete process.env.TWILIO_SENDGRID_API_KEY;
	const error = getError<Error>(getSendgridAPIKey);

	expect(error).toEqual(new Error('TWILIO_SENDGRID_API_KEY not defined. Please refer to the README.md under Testing Integrations.'));
});
