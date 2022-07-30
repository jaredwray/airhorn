import AWS from 'aws-sdk';
import {ProviderInterface} from '../provider-interface.js';
import {ProviderType} from '../provider-type.js';

export class AWSSMS implements ProviderInterface {
	client: AWS.SNS;
	name = 'aws-sms';
	type = ProviderType.SMS;
	region?: string;

	constructor(region?: string) {
		this.region = region;

		AWS.config.update({region: this.region});
		this.client = new AWS.SNS({apiVersion: '2010-03-31'});
	}

	public async send(to: string, from: string, message: string): Promise<boolean> {
		const parameters = {
			Message: message,
			PhoneNumber: to,
		};

		await this.client.publish(parameters).promise();

		return true;
	}
}
