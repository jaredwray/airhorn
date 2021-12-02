import { TwilioSendgrid } from '../../src/providers/twilio-sendgrid';

const TWILIO_SENGRID_API_KEY = 'SG_TWILIO_SENGRID_API_KEY';

test('TwilioSendgrid - Init', () => {
	expect(new TwilioSendgrid(TWILIO_SENGRID_API_KEY)).toEqual(new TwilioSendgrid(TWILIO_SENGRID_API_KEY));
});

test('TwilioSendgrid - Init with No Api Key', () => {
	expect(new TwilioSendgrid()).toEqual(new TwilioSendgrid());
});

test('TwilioSMS - Send', async () => {
	const twilioSendgrid = new TwilioSendgrid(TWILIO_SENGRID_API_KEY);

	twilioSendgrid.client = {
		send: jest.fn().mockResolvedValue(true),
		setApiKey: jest.fn().mockResolvedValue(true),
		setClient: jest.fn().mockResolvedValue(true),
		setTwilioEmailAuth: jest.fn().mockResolvedValue(true),
		setSubstitutionWrappers: jest.fn().mockResolvedValue(true),
		setTimeout: jest.fn().mockResolvedValue(true),
		sendMultiple: jest.fn().mockResolvedValue(true),
	};

	expect(await twilioSendgrid.send('john@doe.com', 'me@you.com', 'just testing this send', 'subject')).toEqual(true);
});

test('TwilioSMS - Send with undefined subject', async () => {
	const twilioSendgrid = new TwilioSendgrid(TWILIO_SENGRID_API_KEY);

	twilioSendgrid.client = {
		send: jest.fn().mockResolvedValue(true),
		setApiKey: jest.fn().mockResolvedValue(true),
		setClient: jest.fn().mockResolvedValue(true),
		setTwilioEmailAuth: jest.fn().mockResolvedValue(true),
		setSubstitutionWrappers: jest.fn().mockResolvedValue(true),
		setTimeout: jest.fn().mockResolvedValue(true),
		sendMultiple: jest.fn().mockResolvedValue(true),
	};

	expect(await twilioSendgrid.send('john@doe.com', 'me@you.com', 'just testing this send', undefined)).toEqual(true);
});
