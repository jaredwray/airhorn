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
	public async send(message: AirhornProviderMessage, options?: { headers?: Record<string, string> }): Promise<AirhornProviderSendResult> {
		const errors: Array<Error> = [];
		// biome-ignore lint/suspicious/noExplicitAny: fetch response
		let response: any = {};
		let success = false;

		try {
			const payload = {
				from: message.from,
				content: message.content,
				timestamp: new Date().toISOString(),
			};

			const fetchResponse = await fetch(message.to, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...options?.headers,
				},
				body: JSON.stringify(payload),
			});

			const responseData = await fetchResponse.json().catch(() => ({}));

			response = {
				status: fetchResponse.status,
				statusText: fetchResponse.statusText,
				data: responseData,
				headers: Object.fromEntries(fetchResponse.headers.entries()),
			};
			success = fetchResponse.status >= 200 && fetchResponse.status < 300;
		} catch (error) {
			if (error instanceof Error) {
				errors.push(new Error(`Webhook request failed: ${error.message}`));
				response = {
					error: error.message,
				};
			} else {
				errors.push(new Error(String(error)));
			}
		}

		return {
			success,
			response,
			errors,
		};
	}

	public get name(): string {
		return this._name;
	}

	public get capabilities(): Array<AirhornProviderType> {
		return this._capabilities;
	}
}
