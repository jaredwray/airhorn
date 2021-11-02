import {Config} from './config';

export class ProviderService {
	config = new Config();
	private readonly _providers = new Array<ProviderInterface>();

	constructor(options?: any) {
		if (options) {
			this.config = new Config(options);
		}
	}

	public get providers(): ProviderInterface[] {
		return this._providers;
	}

	public addProvider(provider: ProviderInterface) {
		if (this.providerExists(provider.name)) {
			throw new Error(`Provider ${provider.name} already exists`);
		} else {
			this._providers.push(provider);
		}
	}

	public providerExists(name: string): boolean {
		let result = false;

		for (const provider of this._providers) {
			if (provider.name === name) {
				result = true;
				break;
			}
		}

		return result;
	}
}
