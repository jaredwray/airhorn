import { AWSSNS } from '../../src/providers/aws-sns.js';

const AWS_SNS_REGION = 'us-east-1';

test('AWS SNS - Init', () => {
	expect(new AWSSNS(AWS_SNS_REGION).region).toEqual(AWS_SNS_REGION);
});

test('AWS SNS - Send to TopicArn', async () => {
	const awsSNS = new AWSSNS(AWS_SNS_REGION);
	const topicArn = 'topicArnDeviceIdFromSns';

	awsSNS.client = {
		publish: jest.fn().mockReturnValue({
			promise: jest.fn().mockResolvedValue({}),
		}),
	} as any;

	expect(await awsSNS.send(topicArn, '', 'testing message')).toEqual(true);
});
