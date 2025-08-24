import sgMail from "@sendgrid/mail";
import {
	type AirhornProvider,
	type AirhornProviderMessage,
	type AirhornProviderSendResult,
	AirhornSendType,
} from "airhorn";
import { Twilio } from "twilio";

export type AirhornTwilioOptions = {
	accountSid: string;
	authToken: string;
	sendGridApiKey?: string;
	region?: string;
	edge?: string;
};

export class AirhornTwilio implements AirhornProvider {
	public name = "twilio";
	public capabilities: AirhornSendType[] = [
		AirhornSendType.SMS,
		AirhornSendType.Email,
	];

	private twilioClient: Twilio;
	private sendGridEnabled = false;

	constructor(options: AirhornTwilioOptions) {
		if (!options.accountSid || !options.authToken) {
			throw new Error("AirhornTwilio requires accountSid and authToken");
		}

		this.twilioClient = new Twilio(options.accountSid, options.authToken, {
			region: options.region,
			edge: options.edge,
		});

		// Configure SendGrid if API key is provided
		if (options.sendGridApiKey) {
			sgMail.setApiKey(options.sendGridApiKey);
			this.sendGridEnabled = true;
		}
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
			if (message.type === AirhornSendType.SMS) {
				return this.sendSMS(message, options);
			}

			if (message.type === AirhornSendType.Email) {
				if (!this.sendGridEnabled) {
					throw new Error(
						"SendGrid is not configured. Please provide sendGridApiKey in options",
					);
				}
				return this.sendEmail(message, options);
			}

			throw new Error(
				`AirhornTwilio does not support message type: ${message.type}`,
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
		const result: AirhornProviderSendResult = {
			success: false,
			response: null,
			errors: [],
		};

		try {
			if (!message.from) {
				throw new Error("From phone number is required for SMS messages");
			}

			const twilioMessage = await this.twilioClient.messages.create({
				body: message.content,
				from: message.from,
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

	private async sendEmail(
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
			if (!message.from) {
				throw new Error("From email address is required for email messages");
			}

			const msg = {
				to: message.to,
				from: message.from,
				subject: message.subject || "Notification",
				text: message.content,
				html: message.content,
				...options,
			};

			const response = await sgMail.send(msg);

			result.success = true;
			result.response = {
				accepted: response[0].statusCode === 202,
				messageId: response[0].headers["x-message-id"],
				statusCode: response[0].statusCode,
				body: response[0].body,
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
