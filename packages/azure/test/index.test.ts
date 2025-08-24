import { AirhornSendType } from "airhorn";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AirhornAzure } from "../src/index";
import { mockEmailBeginSend, mockNotificationSend, mockSmsSend } from "./setup";

describe("AirhornAzure", () => {
	let provider: AirhornAzure;
	const mockOptions = {
		connectionString:
			"endpoint=https://test.communication.azure.com/;accesskey=test",
		notificationHubConnectionString:
			"Endpoint=sb://test.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=test",
		notificationHubName: "test-hub",
	};

	beforeEach(() => {
		vi.clearAllMocks();
		provider = new AirhornAzure(mockOptions);
	});

	describe("constructor", () => {
		it("should create instance with SMS, MobilePush, and Email capabilities by default", () => {
			expect(provider).toBeDefined();
			expect(provider.name).toBe("azure");
			expect(provider.capabilities).toContain(AirhornSendType.SMS);
			expect(provider.capabilities).toContain(AirhornSendType.MobilePush);
			expect(provider.capabilities).toContain(AirhornSendType.Email);
		});

		it("should accept custom capabilities", () => {
			const smsOnlyProvider = new AirhornAzure({
				...mockOptions,
				capabilities: [AirhornSendType.SMS],
			});
			expect(smsOnlyProvider.capabilities).toEqual([AirhornSendType.SMS]);
			expect(smsOnlyProvider.capabilities).not.toContain(AirhornSendType.Email);

			const emailOnlyProvider = new AirhornAzure({
				...mockOptions,
				capabilities: [AirhornSendType.Email],
			});
			expect(emailOnlyProvider.capabilities).toEqual([AirhornSendType.Email]);
			expect(emailOnlyProvider.capabilities).not.toContain(AirhornSendType.SMS);
		});

		it("should handle separate connection strings", () => {
			const provider = new AirhornAzure({
				emailConnectionString: "endpoint=https://email.azure.com/;key=test",
				smsConnectionString: "endpoint=https://sms.azure.com/;key=test",
				notificationHubConnectionString:
					mockOptions.notificationHubConnectionString,
				notificationHubName: mockOptions.notificationHubName,
			});
			expect(provider.capabilities).toContain(AirhornSendType.SMS);
			expect(provider.capabilities).toContain(AirhornSendType.Email);
			expect(provider.capabilities).toContain(AirhornSendType.MobilePush);
		});
	});

	describe("SMS sending", () => {
		const mockMessage = {
			to: "+0987654321",
			from: "+1234567890",
			content: "Test SMS message",
			type: AirhornSendType.SMS,
		};

		it("should send SMS successfully", async () => {
			mockSmsSend.mockResolvedValueOnce([
				{
					to: "+0987654321",
					messageId: "msg-123",
					successful: true,
					repeatabilityResult: {
						accepted: true,
						firstSendResult: {
							messageId: "msg-123",
							successful: true,
						},
					},
				},
			]);

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(true);
			expect(result.response).toHaveProperty("successful", 1);
			expect(result.response).toHaveProperty("failed", 0);
			expect(result.errors).toHaveLength(0);
		});

		it("should require from phone number in message", async () => {
			const messageWithoutFrom = { ...mockMessage, from: "" };
			const result = await provider.send(messageWithoutFrom);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain(
				"From phone number is required for SMS messages",
			);
		});

		it("should handle SMS send errors", async () => {
			const errorMessage = "Invalid phone number";
			mockSmsSend.mockRejectedValueOnce(new Error(errorMessage));

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe(errorMessage);
		});

		it("should handle partial SMS failures", async () => {
			mockSmsSend.mockResolvedValueOnce([
				{
					to: "+0987654321",
					messageId: "msg-123",
					successful: false,
					errorMessage: "Invalid number format",
				},
			]);

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(false);
			expect(result.response).toHaveProperty("successful", 0);
			expect(result.response).toHaveProperty("failed", 1);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain("Failed to send SMS");
		});

		it("should throw error when SMS is not in capabilities", async () => {
			const emailOnlyProvider = new AirhornAzure({
				connectionString: mockOptions.connectionString,
				capabilities: [AirhornSendType.Email],
			});

			const result = await emailOnlyProvider.send(mockMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain(
				"SMS client is not configured",
			);
		});
	});

	describe("Email sending", () => {
		const mockEmailMessage = {
			to: "recipient@example.com",
			from: "sender@example.com",
			subject: "Test Email",
			content: "Test email content",
			type: AirhornSendType.Email,
		};

		it("should send email successfully", async () => {
			const mockPoller = {
				pollUntilDone: vi.fn().mockResolvedValueOnce({
					id: "email-123",
					status: "Succeeded",
				}),
			};
			mockEmailBeginSend.mockResolvedValueOnce(mockPoller);

			const result = await provider.send(mockEmailMessage);

			expect(result.success).toBe(true);
			expect(result.response).toHaveProperty("id", "email-123");
			expect(result.response).toHaveProperty("status", "Succeeded");
			expect(result.errors).toHaveLength(0);
		});

		it("should require from email in message", async () => {
			const messageWithoutFrom = { ...mockEmailMessage, from: "" };
			const result = await provider.send(messageWithoutFrom);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain(
				"From email address is required for email messages",
			);
		});

		it("should use default subject when not provided", async () => {
			const mockPoller = {
				pollUntilDone: vi.fn().mockResolvedValueOnce({
					id: "email-456",
					status: "Succeeded",
				}),
			};
			mockEmailBeginSend.mockResolvedValueOnce(mockPoller);

			const messageWithoutSubject = {
				...mockEmailMessage,
				subject: undefined,
			};
			const result = await provider.send(messageWithoutSubject);

			expect(result.success).toBe(true);
			expect(mockEmailBeginSend).toHaveBeenCalledWith(
				expect.objectContaining({
					content: expect.objectContaining({
						subject: "Notification",
					}),
				}),
			);
		});

		it("should handle email send errors", async () => {
			const mockPoller = {
				pollUntilDone: vi.fn().mockResolvedValueOnce({
					id: "email-789",
					status: "Failed",
					error: {
						message: "Invalid email address",
					},
				}),
			};
			mockEmailBeginSend.mockResolvedValueOnce(mockPoller);

			const result = await provider.send(mockEmailMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain("Email send failed");
		});

		it("should pass additional email options", async () => {
			const mockPoller = {
				pollUntilDone: vi.fn().mockResolvedValueOnce({
					id: "email-999",
					status: "Succeeded",
				}),
			};
			mockEmailBeginSend.mockResolvedValueOnce(mockPoller);

			const additionalOptions = {
				cc: ["cc@example.com"],
				bcc: ["bcc@example.com"],
				replyTo: "reply@example.com",
				html: "<p>HTML content</p>",
			};

			await provider.send(mockEmailMessage, additionalOptions);

			expect(mockEmailBeginSend).toHaveBeenCalledWith(
				expect.objectContaining({
					recipients: expect.objectContaining({
						cc: [{ address: "cc@example.com" }],
						bcc: [{ address: "bcc@example.com" }],
					}),
					replyTo: [{ address: "reply@example.com" }],
					content: expect.objectContaining({
						html: "<p>HTML content</p>",
					}),
				}),
			);
		});

		it("should throw error when Email is not in capabilities", async () => {
			const smsOnlyProvider = new AirhornAzure({
				connectionString: mockOptions.connectionString,
				capabilities: [AirhornSendType.SMS],
			});

			const result = await smsOnlyProvider.send(mockEmailMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain(
				"Email client is not configured",
			);
		});
	});

	describe("MobilePush sending", () => {
		const mockPushMessage = {
			to: "user-tag",
			from: "MyApp",
			content: JSON.stringify({
				aps: {
					alert: "Test push notification",
				},
			}),
			type: AirhornSendType.MobilePush,
		};

		it("should send mobile push notification successfully", async () => {
			mockNotificationSend.mockResolvedValueOnce({
				notificationId: "push-123",
				state: "Enqueued",
				correlationId: "corr-123",
			});

			const result = await provider.send(mockPushMessage);

			expect(result.success).toBe(true);
			expect(result.response).toHaveProperty("notificationId", "push-123");
			expect(result.response).toHaveProperty("state", "Enqueued");
			expect(result.errors).toHaveLength(0);
		});

		it("should send Apple push notification", async () => {
			mockNotificationSend.mockResolvedValueOnce({
				notificationId: "apple-123",
				state: "Enqueued",
			});

			const appleMessage = {
				...mockPushMessage,
				to: "apple-device-tag",
			};

			await provider.send(appleMessage, { platform: "apple" });

			expect(mockNotificationSend).toHaveBeenCalledWith(
				expect.objectContaining({
					platform: "apple",
				}),
				expect.any(Object),
			);
		});

		it("should send Android push notification", async () => {
			mockNotificationSend.mockResolvedValueOnce({
				notificationId: "android-123",
				state: "Enqueued",
			});

			const androidMessage = {
				to: "android-device-tag",
				from: "MyApp",
				content: JSON.stringify({
					notification: {
						title: "Test",
						body: "Test notification",
					},
				}),
				type: AirhornSendType.MobilePush,
			};

			await provider.send(androidMessage, { platform: "android" });

			expect(mockNotificationSend).toHaveBeenCalledWith(
				expect.objectContaining({
					platform: "fcm",
				}),
				expect.any(Object),
			);
		});

		it("should require from identifier for mobile push", async () => {
			const messageWithoutFrom = { ...mockPushMessage, from: "" };
			const result = await provider.send(messageWithoutFrom);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain(
				"From identifier is required for mobile push messages",
			);
		});

		it("should handle push notification errors", async () => {
			mockNotificationSend.mockResolvedValueOnce({
				notificationId: "push-456",
				state: "Failed",
			});

			const result = await provider.send(mockPushMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain(
				"Notification failed with state: Failed",
			);
		});

		it("should throw error when MobilePush is not in capabilities", async () => {
			const emailOnlyProvider = new AirhornAzure({
				connectionString: mockOptions.connectionString,
				capabilities: [AirhornSendType.Email],
			});

			const result = await emailOnlyProvider.send(mockPushMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain(
				"Notification Hub client is not configured",
			);
		});

		it("should handle Apple push with object content", async () => {
			mockNotificationSend.mockResolvedValueOnce({
				notificationId: "apple-obj-123",
				state: "Enqueued",
			});

			const appleMessage = {
				to: "apple-device-tag",
				from: "MyApp",
				content: {
					aps: {
						alert: "Test notification",
					},
				},
				type: AirhornSendType.MobilePush,
			};

			const result = await provider.send(appleMessage);

			expect(result.success).toBe(true);
			expect(mockNotificationSend).toHaveBeenCalled();
		});

		it("should handle Android push with object content", async () => {
			mockNotificationSend.mockResolvedValueOnce({
				notificationId: "android-obj-123",
				state: "Enqueued",
			});

			const androidMessage = {
				to: "android-device-tag",
				from: "MyApp",
				content: {
					notification: {
						title: "Test",
						body: "Test notification",
					},
				},
				type: AirhornSendType.MobilePush,
			};

			const result = await provider.send(androidMessage);

			expect(result.success).toBe(true);
			expect(mockNotificationSend).toHaveBeenCalled();
		});

		it("should handle FCM push notification with data only", async () => {
			mockNotificationSend.mockResolvedValueOnce({
				notificationId: "fcm-data-123",
				state: "Enqueued",
			});

			const fcmMessage = {
				to: "user-tag",
				from: "MyApp",
				content: {
					data: {
						key: "value",
						type: "silent",
					},
				},
				type: AirhornSendType.MobilePush,
			};

			const result = await provider.send(fcmMessage);

			expect(result.success).toBe(true);
			expect(mockNotificationSend).toHaveBeenCalled();
		});

		it("should throw error for invalid notification payload", async () => {
			const invalidMessage = {
				to: "user-tag",
				from: "MyApp",
				content: {
					invalidKey: "invalidValue",
				},
				type: AirhornSendType.MobilePush,
			};

			const result = await provider.send(invalidMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain(
				"Invalid notification payload structure",
			);
		});
	});

	describe("Unsupported message types", () => {
		it("should reject unsupported message types", async () => {
			const unsupportedMessage = {
				to: "test",
				from: "test",
				content: "test",
				// biome-ignore lint/suspicious/noExplicitAny: testing unsupported type
				type: "unsupported" as any,
			};

			const result = await provider.send(unsupportedMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain(
				"AirhornAzure does not support message type",
			);
		});
	});
});
