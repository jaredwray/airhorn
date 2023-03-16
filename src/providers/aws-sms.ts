import {SNS} from '@aws-sdk/client-sns';
import type {ProviderInterface} from '../provider-interface.js';
import {ProviderType} from '../provider-type.js';

export class AWSSMS implements ProviderInterface {
	client: SNS;
	name = 'aws-sms';
	type = ProviderType.SMS;
	region?: string;

	constructor(region?: string) {
		this.region = region;

		this.client = new SNS({apiVersion: '2010-03-31', region: this.region});
	}

	public async send(to: string, from: string, message: string): Promise<boolean> {
		const parameters = {
			Message: message,
			PhoneNumber: to,
		};

		await this.client.publish(parameters);

		return true;
	}
}
