import * as AWS from 'aws-sdk';
import {ProviderInterface} from '../provider-interface';
import {ProviderType} from '../provider-type';

export class AWSSNS implements ProviderInterface {
	client: AWS.SNS;
	name = 'aws-sns';
	type = ProviderType.MOBILE_PUSH;
	region?: string;

	constructor(region?: string) {
		this.region = region;

		AWS.config.update({region});
		this.client = new AWS.SNS({apiVersion: '2010-03-31'});
	}

	public async send(to: string, from: string, message: string): Promise<boolean> {
		const parameters = {
			Message: message,
			TopicArn: to,
		};

		await this.client.publish(parameters).promise();

		return true;
	}
}
