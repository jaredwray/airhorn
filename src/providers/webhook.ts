import axios from 'axios';
import type {ProviderInterface} from '../provider-interface.js';
import {ProviderType} from '../provider-type.js';

export class WebHook implements ProviderInterface {
	name = 'webhook';
	type = ProviderType.WEBHOOK;

	public async send(to: string, from: string, message: string, subject?: string): Promise<boolean> {
		const messageData = JSON.parse(message);

		if (!subject) {
			messageData.subject = subject;
		}

		const messageString = JSON.stringify(messageData);
		await axios.post(to, {json: messageString});

		return true;
	}
}
