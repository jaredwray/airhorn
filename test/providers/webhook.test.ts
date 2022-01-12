import {WebHook} from '../../src/providers/webhook';

test('WebHook - Init', () => {
	expect(new WebHook()).toEqual(new WebHook());
});

test('WebHook - Send', async () => {
	const webhook = new WebHook();
	const messageData = { answer: 42 };
	const message = JSON.stringify(messageData);
	expect(await webhook.send('https://httpbin.org/post', '', message)).toEqual(true);
});
