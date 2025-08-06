import {test, expect, vi} from 'vitest';
import {TwilioSendgrid} from '../../src/providers/twilio-sendgrid.js';

const TWILIO_SENGRID_API_KEY = 'SG.test-key';

test('TwilioSendgrid - Init', () => {
	expect(new TwilioSendgrid(TWILIO_SENGRID_API_KEY)).toEqual(new TwilioSendgrid(TWILIO_SENGRID_API_KEY));
});

test('TwilioSendgrid - Init with No Api Key', () => {
	expect(new TwilioSendgrid()).toEqual(new TwilioSendgrid());
});

test('TwilioSMS - Send', async () => {
	const twilioSendgrid = new TwilioSendgrid(TWILIO_SENGRID_API_KEY);

	twilioSendgrid.client = {
		setApiKey: vi.fn().mockReturnValue({}),
		send: vi.fn().mockReturnValue({}),
	} as any;

	expect(await twilioSendgrid.send('john@doe.com', 'me@you.com', 'just testing this send', 'subject')).toEqual(true);
});

test('TwilioSMS - Send with undefined subject will replace with `no subject` in  the field', async () => {
	const twilioSendgrid = new TwilioSendgrid(TWILIO_SENGRID_API_KEY);

	twilioSendgrid.client = {
		setApiKey: vi.fn().mockReturnValue({}),
		send: vi.fn().mockReturnValue({}),
	} as any;
	expect(await twilioSendgrid.send('john@doe.com', 'me@you.com', 'just testing this send', undefined)).toEqual(true);
});
