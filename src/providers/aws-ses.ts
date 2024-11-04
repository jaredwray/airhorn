import {SendEmailCommand, SESClient} from '@aws-sdk/client-ses';
import type {ProviderInterface} from '../provider-service.js';
import {AirhornProviderType} from '../provider-type.js';

export class AWSSES implements ProviderInterface {
	client: SESClient;
	name = 'aws-ses';
	type = AirhornProviderType.SMTP;
	region?: string;

	constructor(region?: string) {
		this.region = region;

		this.client = new SESClient({region: this.region});
	}

	public async send(to: string, from: string, message: string, subject?: string): Promise<boolean> {
		const parameters = {
			Destination: {
				CcAddresses: [],
				ToAddresses: [to],
			},
			Message: {
				Body: {
					Html: {
						Charset: 'utf8',
						Data: message,
					},
					Text: {
						Charset: 'utf8',
						Data: message,
					},
				},
				Subject: {
					Charset: 'utf8',
					Data: subject ?? '',
				},
			},
			Source: 'SENDER_ADDRESS',
			ReplyToAddresses: [from],
		};

		await this.client.send(new SendEmailCommand(parameters));

		return true;
	}
}
