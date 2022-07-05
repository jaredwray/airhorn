import sendgrid from '@sendgrid/mail';
import {ProviderInterface} from '../provider-interface.js';
import {ProviderType} from '../provider-type.js';

export class TwilioSendgrid implements ProviderInterface {
	client = sendgrid;
	name = 'twilio-sendgrid';
	type = ProviderType.SMTP;

	private readonly apiKey: string;

	constructor(apiKey?: string) {
		this.apiKey = apiKey ?? '';
	}

	public async send(to: string, from: string, message: string, subject?: string): Promise<boolean> {
		const smtpMessage = {
			to,
			from,
			subject: subject ?? '',
			html: message,
		};

		this.client.setApiKey(this.apiKey);
		await this.client.send(smtpMessage);

		return true;
	}
}
