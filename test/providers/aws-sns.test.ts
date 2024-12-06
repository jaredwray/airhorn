import {test, expect, vi} from 'vitest';
import {AWSSNS} from '../../src/providers/aws-sns.js';

const AWS_SNS_REGION = 'us-east-1';

test('AWS SNS - Init', () => {
	expect(new AWSSNS(AWS_SNS_REGION).region).toEqual(AWS_SNS_REGION);
});

test('AWS SNS - Send to TopicArn', async () => {
	const awsSNS = new AWSSNS(AWS_SNS_REGION);
	const topicArn = 'topicArnDeviceIdFromSns';

	awsSNS.client = {
		publish: vi.fn().mockReturnValue({
			promise: vi.fn(),
		}),
	} as any;

	expect(await awsSNS.send(topicArn, '', 'testing message')).toEqual(true);
});
