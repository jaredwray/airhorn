import {test, expect, vi} from 'vitest';
import {AWSSES} from '../../src/providers/aws-ses.js';

const AWS_SES_REGION = 'us-east-1';

test('AWS SES - Init', () => {
	expect(new AWSSES(AWS_SES_REGION).region).toEqual(AWS_SES_REGION);
});

test('AWS SES - Send', async () => {
	const awsSES = new AWSSES(AWS_SES_REGION);

	awsSES.client = {
		send: vi.fn().mockReturnValue({}),
	} as any;

	expect(await awsSES.send('me@you.com', 'test@foo.org', 'just testing this send', 'testing message')).toEqual(true);
});

test('AWS SES - Send with no Subject', async () => {
	const awsSES = new AWSSES(AWS_SES_REGION);

	awsSES.client = {
		send: vi.fn().mockReturnValue({}),
	} as any;

	expect(await awsSES.send('me@you.com', 'test@foo.org', 'just testing this send')).toEqual(true);
});
