import { AWSSMS } from '../../src/providers/aws-sms.js';

const AWS_SES_REGION = 'us-east-1';

test('AWS SNS - Init', () => {
	expect(new AWSSMS(AWS_SES_REGION).region).toEqual(AWS_SES_REGION);
});

test('AWS SMS - Send', async () => {
	const awsSMS = new AWSSMS(AWS_SES_REGION);

	awsSMS.client = {
		publish: jest.fn().mockReturnValue({
			promise: jest.fn().mockResolvedValue({}),
		}),
	} as any;

	expect(await awsSMS.send('5555555555', '', 'testing message')).toEqual(true);
});
