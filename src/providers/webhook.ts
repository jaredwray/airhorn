/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios';
import {ProviderInterface} from '../provider-interface';
import {ProviderType} from '../provider-type';

export class WebHook implements ProviderInterface {
	name = 'webhook';
	type = ProviderType.WEBHOOK;

	public async send(to: string, from: string, message: string, subject?: string): Promise<boolean> {
		await axios.post(to, message);

		return true;
	}
}
