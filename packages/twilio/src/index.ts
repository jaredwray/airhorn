import type {
	AirhornProvider,
	AirhornProviderMessage,
	AirhornProviderSendResult,
	AirhornProviderType,
} from "airhorn";
import { Twilio } from "twilio";

export type TwilioProviderOptions = {
	accountSid: string;
	authToken: string;
	fromPhoneNumber?: string;
	region?: string;
	edge?: string;
};

export class TwilioProvider implements AirhornProvider {
	public name = "twilio";
	public capabilities: AirhornProviderType[] = ["sms" as AirhornProviderType];

	private client: Twilio;
	private fromPhoneNumber?: string;

	constructor(options: TwilioProviderOptions) {
		if (!options.accountSid || !options.authToken) {
			throw new Error("TwilioProvider requires accountSid and authToken");
		}

		this.client = new Twilio(options.accountSid, options.authToken, {
			region: options.region,
			edge: options.edge,
		});

		this.fromPhoneNumber = options.fromPhoneNumber;
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
			if (message.type !== "sms") {
				throw new Error(
					`TwilioProvider only supports SMS, got ${message.type}`,
				);
			}

			const from = message.from || this.fromPhoneNumber;
			if (!from) {
				throw new Error("From phone number is required for SMS messages");
			}

			const twilioMessage = await this.client.messages.create({
				body: message.content,
				from,
				to: message.to,
				...options,
			});

			result.success = true;
			result.response = {
				sid: twilioMessage.sid,
				status: twilioMessage.status,
				dateCreated: twilioMessage.dateCreated,
				dateSent: twilioMessage.dateSent,
				to: twilioMessage.to,
				from: twilioMessage.from,
				body: twilioMessage.body,
				errorCode: twilioMessage.errorCode,
				errorMessage: twilioMessage.errorMessage,
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
