import * as twilio from 'twilio';
import {ProviderInterface} from '../provider-interface';
import {ProviderType} from '../provider-type';

export class TwilioSMS implements ProviderInterface {
	name = 'twilio-sms';
	type = ProviderType.SMS;

	accountSID = '';
	authToken = '';

	client: twilio.Twilio;

	constructor(accountSID?: string, authToken?: string) {
		if (accountSID) {
			this.accountSID = accountSID;
		}

		if (authToken) {
			this.authToken = authToken;
		}

		this.client = twilio(this.accountSID, this.authToken);
	}

	public async send(to: string, from: string, message: string): Promise<boolean> {
		await this.client.messages.create({ from, to, body: message});

		return true;
	}
}
