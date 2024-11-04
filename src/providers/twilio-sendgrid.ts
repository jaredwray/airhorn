import sendgrid from '@sendgrid/mail';
import type {ProviderInterface} from '../provider-service.js';
import {AirhornProviderType} from '../provider-type.js';

export class TwilioSendgrid implements ProviderInterface {
	client = sendgrid;
	name = 'twilio-sendgrid';
	type = AirhornProviderType.SMTP;

	private readonly apiKey: string;

	constructor(apiKey?: string) {
		this.apiKey = apiKey ?? '';
	}

	public async send(to: string, from: string, message: string, subject?: string): Promise<boolean> {
		const smtpMessage = {
			to,
			from,
			subject: subject ?? 'no subject',
			html: message,
			mail_settings: {
				sandbox_mode: {
					enable: process.env.NODE_ENV === 'test', // eslint-disable-line n/prefer-global/process
				},
			},
		};

		this.client.setApiKey(this.apiKey);
		await this.client.send(smtpMessage);

		return true;
	}
}
