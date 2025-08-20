import axios from "axios";
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
	public async send(to: string, message: AirhornProviderMessage, options?: { headers?: Record<string, string> }): Promise<AirhornProviderSendResult> {
		const errors: Array<Error> = [];
		let response: any = {};
		let success = false;

		try {
			const payload = {
				type: message.type,
				from: message.from,
				content: message.content,
				timestamp: new Date().toISOString(),
			};

			const axiosResponse = await axios.post(to, payload, {
				headers: {
					"Content-Type": "application/json",
					...options?.headers,
				},
			});

			response = {
				status: axiosResponse.status,
				statusText: axiosResponse.statusText,
				data: axiosResponse.data,
				headers: axiosResponse.headers,
			};
			success = axiosResponse.status >= 200 && axiosResponse.status < 300;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				errors.push(new Error(`Webhook request failed: ${error.message}`));
				if (error.response) {
					response = {
						status: error.response.status,
						statusText: error.response.statusText,
						data: error.response.data,
					};
				}
			} else {
				errors.push(error instanceof Error ? error : new Error(String(error)));
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
