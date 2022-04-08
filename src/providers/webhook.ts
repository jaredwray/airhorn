/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import got from 'got';
import {ProviderInterface} from '../provider-interface';
import {ProviderType} from '../provider-type';

export class WebHook implements ProviderInterface {
	name = 'webhook';
	type = ProviderType.WEBHOOK;

	public async send(to: string, from: string, message: string, subject?: string): Promise<boolean> {
		const messageData = JSON.parse(message);

		if (!subject) {
			messageData.subject = subject;
		}

		await got.post(to, {
			json: {...messageData},
		});

		return true;
	}
}
