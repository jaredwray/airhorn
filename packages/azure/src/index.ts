import {
	EmailClient,
	type EmailMessage,
	type EmailSendResult,
} from "@azure/communication-email";
import { SmsClient } from "@azure/communication-sms";
import {
	createAppleNotification,
	createFcmLegacyNotification,
	NotificationHubsClient,
} from "@azure/notification-hubs";
import {
	type AirhornProvider,
	type AirhornProviderMessage,
	type AirhornProviderSendResult,
	AirhornSendType,
} from "airhorn";

export type AirhornAzureOptions = {
	connectionString?: string;
	emailConnectionString?: string;
	smsConnectionString?: string;
	notificationHubConnectionString?: string;
	notificationHubName?: string;
	capabilities?: AirhornSendType[];
};

export class AirhornAzure implements AirhornProvider {
	public name = "azure";
	public capabilities: AirhornSendType[];

	private emailClient?: EmailClient;
	private smsClient?: SmsClient;
	private notificationHubClient?: NotificationHubsClient;

	constructor(options: AirhornAzureOptions) {
		// Set capabilities from options or default to SMS, MobilePush, and Email
		this.capabilities = options.capabilities || [
			AirhornSendType.SMS,
			AirhornSendType.MobilePush,
			AirhornSendType.Email,
		];

		// Configure Email client if Email capability is enabled
		if (this.capabilities.includes(AirhornSendType.Email)) {
			const emailConnStr =
				options.emailConnectionString || options.connectionString;
			if (emailConnStr) {
				this.emailClient = new EmailClient(emailConnStr);
			}
		}

		// Configure SMS client if SMS capability is enabled
		if (this.capabilities.includes(AirhornSendType.SMS)) {
			const smsConnStr =
				options.smsConnectionString || options.connectionString;
			if (smsConnStr) {
				this.smsClient = new SmsClient(smsConnStr);
			}
		}

		// Configure Notification Hub client if MobilePush capability is enabled
		if (this.capabilities.includes(AirhornSendType.MobilePush)) {
			if (
				options.notificationHubConnectionString &&
				options.notificationHubName
			) {
				this.notificationHubClient = new NotificationHubsClient(
					options.notificationHubConnectionString,
					options.notificationHubName,
				);
			}
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

			if (message.type === AirhornSendType.MobilePush) {
				return this.sendMobilePush(message, options);
			}

			throw new Error(
				`AirhornAzure does not support message type: ${message.type}`,
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
			if (!this.smsClient) {
				throw new Error("SMS client is not configured");
			}

			if (!message.from) {
				throw new Error("From phone number is required for SMS messages");
			}

			const sendResult = await this.smsClient.send({
				from: message.from,
				to: [message.to],
				message: message.content,
				...options,
			});

			// Check if all messages were sent successfully
			const successfulMessages = sendResult.filter(
				// biome-ignore lint/suspicious/noExplicitAny: Azure SDK type
				(msg: any) => msg.successful,
			);
			const failedMessages = sendResult.filter(
				// biome-ignore lint/suspicious/noExplicitAny: Azure SDK type
				(msg: any) => !msg.successful,
			);

			if (failedMessages.length > 0) {
				for (const failed of failedMessages) {
					result.errors.push(
						new Error(
							`Failed to send SMS to ${failed.to}: ${failed.errorMessage}`,
						),
					);
				}
			}

			result.success = successfulMessages.length > 0;
			result.response = {
				successful: successfulMessages.length,
				failed: failedMessages.length,
				results: sendResult,
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
			if (!this.emailClient) {
				throw new Error("Email client is not configured");
			}

			if (!message.from) {
				throw new Error("From email address is required for email messages");
			}

			const emailMessage: EmailMessage = {
				senderAddress: message.from,
				recipients: {
					to: [{ address: message.to }],
					cc: options?.cc?.map((email: string) => ({ address: email })),
					bcc: options?.bcc?.map((email: string) => ({ address: email })),
				},
				content: {
					subject: message.subject || "Notification",
					plainText: message.content,
					html: options?.html || message.content,
				},
				attachments: options?.attachments,
				replyTo: options?.replyTo ? [{ address: options.replyTo }] : undefined,
				headers: options?.headers,
			};

			const poller = await this.emailClient.beginSend(emailMessage);
			const sendResult: EmailSendResult = await poller.pollUntilDone();

			result.success = sendResult.status === "Succeeded";
			result.response = {
				id: sendResult.id,
				status: sendResult.status,
				error: sendResult.error,
			};

			if (sendResult.error) {
				result.errors.push(
					new Error(`Email send failed: ${sendResult.error.message}`),
				);
			}
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

	private async sendMobilePush(
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
			if (!this.notificationHubClient) {
				throw new Error("Notification Hub client is not configured");
			}

			if (!message.from) {
				throw new Error("From identifier is required for mobile push messages");
			}

			// Determine platform and create appropriate notification
			// biome-ignore lint/suspicious/noExplicitAny: notification type varies
			let notification: any;
			// biome-ignore lint/suspicious/noExplicitAny: flexible options type
			const sendOptions: any = {
				tagExpression: options?.tags,
			};

			if (options?.platform === "apple" || message.to.includes("apple")) {
				// Apple Push Notification
				const apnsPayload =
					typeof message.content === "string"
						? JSON.parse(message.content)
						: message.content;
				notification = createAppleNotification({
					body: JSON.stringify(apnsPayload),
					headers: options?.apnsHeaders,
				});
			} else if (
				options?.platform === "android" ||
				message.to.includes("android") ||
				message.to.includes("fcm")
			) {
				// Android/FCM notification
				const fcmPayload =
					typeof message.content === "string"
						? JSON.parse(message.content)
						: message.content;
				notification = createFcmLegacyNotification({
					body: JSON.stringify(fcmPayload),
				});
			} else {
				// Default to broadcast with tag expression
				sendOptions.tagExpression = message.to; // Use 'to' as tag expression for targeted sends
				const payload =
					typeof message.content === "string"
						? JSON.parse(message.content)
						: message.content;

				// Send to both platforms if not specified
				if (payload.aps) {
					notification = createAppleNotification({
						body: JSON.stringify(payload),
					});
				} else if (payload.notification || payload.data) {
					notification = createFcmLegacyNotification({
						body: JSON.stringify(payload),
					});
				} else {
					throw new Error("Invalid notification payload structure");
				}
			}

			// Send notification
			const notificationResult =
				await this.notificationHubClient.sendNotification(
					notification,
					sendOptions,
				);

			result.success = notificationResult.state === "Enqueued";
			result.response = {
				notificationId: notificationResult.notificationId,
				state: notificationResult.state,
				correlationId: notificationResult.correlationId,
			};

			if (notificationResult.state !== "Enqueued") {
				result.errors.push(
					new Error(
						`Notification failed with state: ${notificationResult.state}`,
					),
				);
			}
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
