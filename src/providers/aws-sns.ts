import {SNS} from '@aws-sdk/client-sns';
import type {ProviderInterface} from '../provider-interface.js';
import {ProviderType} from '../provider-type.js';

export class AWSSNS implements ProviderInterface {
	client: SNS;
	name = 'aws-sns';
	type = ProviderType.MOBILE_PUSH;
	region?: string;

	constructor(region?: string) {
		this.region = region;

		this.client = new SNS({apiVersion: '2010-03-31', region: this.region});
	}

	public async send(to: string, from: string, message: string): Promise<boolean> {
		const parameters = {
			Message: message,
			TopicArn: to,
		};

		await this.client.publish(parameters);

		return true;
	}
}
