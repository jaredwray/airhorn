export class WebHook implements ProviderInterface {
	name = 'webhook';
	types = [ProviderType.WEBHOOK];

	public async send(): Promise<void> {
		throw new Error('Method not implemented.');
	}
}
