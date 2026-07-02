import {
	type AirhornProvider,
	type AirhornProviderMessage,
	type AirhornProviderSendResult,
	AirhornSendType,
} from "airhorn";
import {
	ChannelsEnum,
	Pingram,
	type PingramRegion,
	type SenderPostBody,
} from "pingram";

export type AirhornPingramOptions = {
	/**
	 * Pingram API key (starts with `pingram_sk_`). Required.
	 */
	apiKey: string;
	/**
	 * Pingram API region: "us" (default), "eu", or "ca".
	 */
	region?: PingramRegion;
	/**
	 * Custom base URL for the Pingram API (overrides region).
	 */
	baseUrl?: string;
	/**
	 * The Pingram notification type identifier used for sends. Pingram creates
	 * the notification type automatically if it does not exist.
	 * @default "airhorn"
	 */
	notificationType?: string;
	/**
	 * The capabilities to enable (defaults to SMS, Email, and MobilePush).
	 */
	capabilities?: AirhornSendType[];
};

export class AirhornPingram implements AirhornProvider {
	public name = "pingram";
	public capabilities: AirhornSendType[];

	private client: Pingram;
	private notificationType: string;

	constructor(options: AirhornPingramOptions) {
		if (!options.apiKey) {
			throw new Error("AirhornPingram requires an apiKey");
		}

		// Set capabilities from options or default to SMS, Email, and MobilePush
		this.capabilities = options.capabilities || [
			AirhornSendType.SMS,
			AirhornSendType.Email,
			AirhornSendType.MobilePush,
		];

		this.notificationType = options.notificationType || "airhorn";

		this.client = new Pingram({
			apiKey: options.apiKey,
			region: options.region,
			baseUrl: options.baseUrl,
		});
	}

	async send(
		message: AirhornProviderMessage,
		// biome-ignore lint/suspicious/noExplicitAny: expected
		options?: any,
	): Promise<AirhornProviderSendResult> {
		const result: AirhornProviderSendResult = {
			success: false,
			response: null,
			errors: [],
		};

		try {
			if (!this.capabilities.includes(message.type)) {
				throw new Error(
					`AirhornPingram is not configured for message type: ${message.type}`,
				);
			}

			if (message.type === AirhornSendType.SMS) {
				return await this.sendSMS(message, options);
			}

			if (message.type === AirhornSendType.Email) {
				return await this.sendEmail(message, options);
			}

			if (message.type === AirhornSendType.MobilePush) {
				return await this.sendMobilePush(message, options);
			}

			throw new Error(
				`AirhornPingram does not support message type: ${message.type}`,
			);
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			result.errors.push(err);
			result.response = {
				error: err.message,
				details: error,
			};
		}

		return result;
	}

	private async sendSMS(
		message: AirhornProviderMessage,
		// biome-ignore lint/suspicious/noExplicitAny: expected
		options?: any,
	): Promise<AirhornProviderSendResult> {
		const body: SenderPostBody = {
			type: this.notificationType,
			to: {
				id: message.to,
				number: message.to,
			},
			forceChannels: [ChannelsEnum.SMS],
			sms: {
				message: message.content,
				from: message.from || undefined,
			},
			...options,
		};

		return this.executeSend(body);
	}

	private async sendEmail(
		message: AirhornProviderMessage,
		// biome-ignore lint/suspicious/noExplicitAny: expected
		options?: any,
	): Promise<AirhornProviderSendResult> {
		const body: SenderPostBody = {
			type: this.notificationType,
			to: {
				id: message.to,
				email: message.to,
			},
			forceChannels: [ChannelsEnum.EMAIL],
			email: {
				subject: message.subject || "Notification",
				html: message.content,
				senderEmail: message.from || undefined,
			},
			...options,
		};

		return this.executeSend(body);
	}

	private async sendMobilePush(
		message: AirhornProviderMessage,
		// biome-ignore lint/suspicious/noExplicitAny: expected
		options?: any,
	): Promise<AirhornProviderSendResult> {
		// Pingram delivers mobile push to the device tokens registered for the
		// user, so `to` is the Pingram user identifier
		const body: SenderPostBody = {
			type: this.notificationType,
			to: {
				id: message.to,
			},
			forceChannels: [ChannelsEnum.PUSH],
			mobile_push: {
				title: message.subject || "Notification",
				message: message.content,
			},
			...options,
		};

		return this.executeSend(body);
	}

	private async executeSend(
		body: SenderPostBody,
	): Promise<AirhornProviderSendResult> {
		const result: AirhornProviderSendResult = {
			success: false,
			response: null,
			errors: [],
		};

		try {
			const response = await this.client.send(body);

			result.success = true;
			result.response = {
				trackingId: response.trackingId,
				messages: response.messages,
			};
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			result.errors.push(err);
			result.response = {
				error: err.message,
				details: error,
			};
		}

		return result;
	}
}
