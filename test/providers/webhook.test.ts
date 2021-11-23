import {WebHook} from '../../src/providers/webhook';

test('WebHook - Init', () => {
	expect(new WebHook()).toEqual(new WebHook());
});

test('WebHook - Send', async () => {
	const webhook = new WebHook();
	expect(await webhook.send('https://httpbin.org/post', '', '{answer: 42}')).toEqual(true);
});
