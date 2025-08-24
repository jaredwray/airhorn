import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import {
	type AirhornProvider,
	type AirhornProviderMessage,
	type AirhornProviderSendResult,
	AirhornSendType,
} from "airhorn";

export type AirhornAwsOptions = {
	region: string;
	accessKeyId?: string;
	secretAccessKey?: string;
	sessionToken?: string;
	capabilities?: AirhornSendType[];
};

export class AirhornAws implements AirhornProvider {
	public name = "aws";
	public capabilities: AirhornSendType[];

	private snsClient?: SNSClient;
	private sesClient?: SESClient;

	constructor(options: AirhornAwsOptions) {
		if (!options.region) {
			throw new Error("AirhornAws requires region");
		}

		// Set capabilities from options or default to both SMS and Email
		this.capabilities = options.capabilities || [
			AirhornSendType.SMS,
			AirhornSendType.Email,
		];

		const credentials =
			options.accessKeyId && options.secretAccessKey
				? {
						accessKeyId: options.accessKeyId,
						secretAccessKey: options.secretAccessKey,
						sessionToken: options.sessionToken,
					}
				: undefined;

		// Configure SNS if SMS capability is enabled
		if (this.capabilities.includes(AirhornSendType.SMS)) {
			this.snsClient = new SNSClient({
				region: options.region,
				credentials,
			});
		}

		// Configure SES if Email capability is enabled
		if (this.capabilities.includes(AirhornSendType.Email)) {
			this.sesClient = new SESClient({
				region: options.region,
				credentials,
			});
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
				return this.sendEmail(message, options);
			}

			throw new Error(
				`AirhornAws does not support message type: ${message.type}`,
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
			if (!this.snsClient) {
				throw new Error("SNS is not configured");
			}

			if (!message.from) {
				throw new Error("From phone number is required for SMS messages");
			}

			const command = new PublishCommand({
				PhoneNumber: message.to,
				Message: message.content,
				MessageAttributes: {
					"AWS.SNS.SMS.SenderID": {
						DataType: "String",
						StringValue: message.from,
					},
					"AWS.SNS.SMS.SMSType": {
						DataType: "String",
						StringValue: options?.smsType || "Transactional",
					},
				},
				...options,
			});

			const response = await this.snsClient.send(command);

			result.success = true;
			result.response = {
				messageId: response.MessageId,
				sequenceNumber: response.SequenceNumber,
				metadata: response.$metadata,
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
			if (!this.sesClient) {
				throw new Error("SES is not configured");
			}

			if (!message.from) {
				throw new Error("From email address is required for email messages");
			}

			const command = new SendEmailCommand({
				Source: message.from,
				Destination: {
					ToAddresses: [message.to],
					CcAddresses: options?.ccAddresses,
					BccAddresses: options?.bccAddresses,
				},
				Message: {
					Subject: {
						Data: message.subject || "Notification",
						Charset: "UTF-8",
					},
					Body: {
						Text: {
							Data: message.content,
							Charset: "UTF-8",
						},
						Html: {
							Data: message.content,
							Charset: "UTF-8",
						},
					},
				},
				ReplyToAddresses: options?.replyToAddresses,
				ReturnPath: options?.returnPath,
				ConfigurationSetName: options?.configurationSetName,
				Tags: options?.tags,
			});

			const response = await this.sesClient.send(command);

			result.success = true;
			result.response = {
				messageId: response.MessageId,
				metadata: response.$metadata,
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
