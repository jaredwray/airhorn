import { TwilioSendgrid } from '../../src/providers/twilio-sendgrid.js';
import {getSendgridAPIKey} from '../testing-data.js';

const TWILIO_SENGRID_API_KEY = getSendgridAPIKey();

test('TwilioSendgrid - Init', () => {
	expect(new TwilioSendgrid(TWILIO_SENGRID_API_KEY)).toEqual(new TwilioSendgrid(TWILIO_SENGRID_API_KEY));
});

test('TwilioSendgrid - Init with No Api Key', () => {
	expect(new TwilioSendgrid()).toEqual(new TwilioSendgrid());
});

test('TwilioSMS - Send', async () => {
	const twilioSendgrid = new TwilioSendgrid(TWILIO_SENGRID_API_KEY);

	expect(await twilioSendgrid.send('john@doe.com', 'me@you.com', 'just testing this send', 'subject')).toEqual(true);
});

test('TwilioSMS - Send with undefined subject will replace with `no subject` in  the field', async () => {
	const twilioSendgrid = new TwilioSendgrid(TWILIO_SENGRID_API_KEY);

	expect(await twilioSendgrid.send('john@doe.com', 'me@you.com', 'just testing this send', undefined)).toEqual(true);
});
