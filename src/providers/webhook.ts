import axios from "axios";
import type { ProviderInterface } from "../provider-service.js";
import { AirhornProviderType } from "../provider-type.js";

export class WebHook implements ProviderInterface {
	name = "webhook";
	type = AirhornProviderType.WEBHOOK;

	public async send(
		to: string,
		// biome-ignore lint/correctness/noUnusedFunctionParameters: allowing unused parameters for webhook
		from: string,
		message: string,
		subject?: string,
	): Promise<boolean> {
		const messageData = JSON.parse(message);

		if (!subject) {
			messageData.subject = subject;
		}

		const messageString = JSON.stringify(messageData);
		await axios.post(to, { json: messageString });

		return true;
	}
}
