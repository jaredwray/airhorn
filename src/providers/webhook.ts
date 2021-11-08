import axios from 'axios';
import {ProviderInterface} from '../provider-interface';
import {ProviderType} from '../provider-type';

export class WebHook implements ProviderInterface {
	name = 'webhook';
	type = ProviderType.WEBHOOK;

	public async send(): Promise<boolean> {
		await axios.post('https://httpbin.org/post', {answer: 42});

		return true;
	}
}
