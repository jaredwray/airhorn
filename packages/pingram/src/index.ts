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
	type SenderPostBodyEmail,
	type SenderPostBodyMobilePush,
	type SenderPostBodySms,
} from "pingram";

/**
 * Typed Pingram request defaults merged into every send request. Top-level
 * fields (e.g. `templateId`, `schedule`, `parameters`) are applied beneath
 * the provider-managed fields, and the channel content objects (`email`,
 * `sms`, `mobile_push`) and `to` are merged beneath the message-derived
 * values, so the message always wins. The notification `type` comes from
 * `notificationType` and the channels from the Airhorn message type.
 */
export type AirhornPingramSendDefaults = Omit<
	Partial<SenderPostBody>,
	"type" | "forceChannels" | "email" | "sms" | "mobile_push"
> & {
	email?: Partial<SenderPostBodyEmail>;
	sms?: Partial<SenderPostBodySms>;
	mobile_push?: Partial<SenderPostBodyMobilePush>;
};

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
	/**
	 * Pingram request defaults merged into every send request, e.g.
	 * `templateId`, `parameters`, or channel content defaults such as
	 * `email.senderName` and `sms.from`. Message-derived values take
	 * precedence over these defaults.
	 */
	sendDefaults?: AirhornPingramSendDefaults;
};

export class AirhornPingram implements AirhornProvider {
	public name = "pingram";
	public capabilities: AirhornSendType[];

	private client: Pingram;
	private notificationType: string;
	private baseDefaults: Omit<
		AirhornPingramSendDefaults,
		"to" | "email" | "sms" | "mobile_push"
	>;
	private channelDefaults: Pick<
		AirhornPingramSendDefaults,
		"to" | "email" | "sms" | "mobile_push"
	>;

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

		// Split the send defaults so each send only carries the top-level
		// defaults plus the content defaults for its own channel
		const {
			to,
			email,
			sms,
			mobile_push: mobilePush,
			...baseDefaults
		} = options.sendDefaults ?? {};
		this.baseDefaults = baseDefaults;
		this.channelDefaults = { to, email, sms, mobile_push: mobilePush };

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
		const smsDefaults = this.channelDefaults.sms;
		const body: SenderPostBody = {
			...this.baseDefaults,
			type: this.notificationType,
			to: {
				...this.channelDefaults.to,
				id: message.to,
				number: message.to,
			},
			forceChannels: [ChannelsEnum.SMS],
			sms: {
				...smsDefaults,
				message: message.content,
				from: message.from || smsDefaults?.from,
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
		const emailDefaults = this.channelDefaults.email;
		const body: SenderPostBody = {
			...this.baseDefaults,
			type: this.notificationType,
			to: {
				...this.channelDefaults.to,
				id: message.to,
				email: message.to,
			},
			forceChannels: [ChannelsEnum.EMAIL],
			email: {
				...emailDefaults,
				subject: message.subject || emailDefaults?.subject || "Notification",
				html: message.content,
				senderEmail: message.from || emailDefaults?.senderEmail,
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
		const pushDefaults = this.channelDefaults.mobile_push;
		const body: SenderPostBody = {
			...this.baseDefaults,
			type: this.notificationType,
			to: {
				...this.channelDefaults.to,
				id: message.to,
			},
			forceChannels: [ChannelsEnum.PUSH],
			mobile_push: {
				...pushDefaults,
				title: message.subject || pushDefaults?.title || "Notification",
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
