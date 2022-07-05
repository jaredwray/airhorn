import { TwilioSMS } from '../../src/providers/twilio-sms.js';

const TWILIO_SMS_ACCOUNT_SID = 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const TWILIO_SMS_AUTH_TOKEN = 'your_auth_token';

test('TwilioSMS - Init', () => {
	expect(new TwilioSMS(TWILIO_SMS_ACCOUNT_SID, TWILIO_SMS_AUTH_TOKEN)).toEqual(new TwilioSMS(TWILIO_SMS_ACCOUNT_SID, TWILIO_SMS_AUTH_TOKEN));
});

test('TwilioSMS - Send', async () => {
	const twilioSMS = new TwilioSMS(TWILIO_SMS_ACCOUNT_SID, TWILIO_SMS_AUTH_TOKEN);

	twilioSMS.client = {
		messages: {
			create: jest.fn().mockReturnValue({}),
		},
	} as any;

	expect(await twilioSMS.send('5555555555', '5552223333', 'just testing this send')).toEqual(true);
});
