import {
	type AirhornProvider,
	type AirhornProviderMessage,
	type AirhornProviderSendResult,
	AirhornProviderType,
} from "./provider.js";

export class AirhornWebhookProvider implements AirhornProvider {
	private _name: string;
	private _capabilities: Array<AirhornProviderType>;

	constructor() {
		this._name = "AirhornWebhookProvider";
		this._capabilities = [AirhornProviderType.Webhook];
	}

	// biome-ignore format: disable for this function
	public async send(message: AirhornProviderMessage): Promise<AirhornProviderSendResult> {
		return {
			success: true,
			response: {},
			errors: [],
		};
	}

	public get name(): string {
		return this._name;
	}

	public get capabilities(): Array<AirhornProviderType> {
		return this._capabilities;
	}
}
