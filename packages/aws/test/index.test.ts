import { AirhornSendType } from "airhorn";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AirhornAws } from "../src/index";
import { mockSesSend, mockSnsPublish } from "./setup";

describe("AirhornAws", () => {
	let provider: AirhornAws;
	const mockOptions = {
		region: "us-east-1",
		accessKeyId: "test-access-key",
		secretAccessKey: "test-secret-key",
	};

	beforeEach(() => {
		vi.clearAllMocks();
		provider = new AirhornAws(mockOptions);
	});

	describe("constructor", () => {
		it("should create instance with both SMS and Email capabilities by default", () => {
			expect(provider).toBeDefined();
			expect(provider.name).toBe("aws");
			expect(provider.capabilities).toContain(AirhornSendType.SMS);
			expect(provider.capabilities).toContain(AirhornSendType.Email);
		});

		it("should handle credentials from environment when not provided", () => {
			const providerWithoutCreds = new AirhornAws({
				region: "us-east-1",
			});
			expect(providerWithoutCreds.capabilities).toContain(AirhornSendType.SMS);
			expect(providerWithoutCreds.capabilities).toContain(
				AirhornSendType.Email,
			);
		});

		it("should accept custom capabilities", () => {
			const smsOnlyProvider = new AirhornAws({
				...mockOptions,
				capabilities: [AirhornSendType.SMS],
			});
			expect(smsOnlyProvider.capabilities).toEqual([AirhornSendType.SMS]);
			expect(smsOnlyProvider.capabilities).not.toContain(AirhornSendType.Email);

			const emailOnlyProvider = new AirhornAws({
				...mockOptions,
				capabilities: [AirhornSendType.Email],
			});
			expect(emailOnlyProvider.capabilities).toEqual([AirhornSendType.Email]);
			expect(emailOnlyProvider.capabilities).not.toContain(AirhornSendType.SMS);
		});

		it("should throw error when region is missing", () => {
			expect(() => {
				new AirhornAws({
					region: "",
					accessKeyId: "key",
					secretAccessKey: "secret",
				});
			}).toThrowError("AirhornAws requires region");
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
			mockSnsPublish.mockResolvedValueOnce({
				MessageId: "msg-123",
				SequenceNumber: "seq-123",
				$metadata: { httpStatusCode: 200 },
			});

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(true);
			expect(result.response).toHaveProperty("messageId", "msg-123");
			expect(result.response).toHaveProperty("sequenceNumber", "seq-123");
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
			mockSnsPublish.mockRejectedValueOnce(new Error(errorMessage));

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe(errorMessage);
		});

		it("should pass custom SMS options", async () => {
			mockSnsPublish.mockResolvedValueOnce({
				MessageId: "msg-456",
				$metadata: { httpStatusCode: 200 },
			});

			const customOptions = {
				smsType: "Promotional",
				maxPrice: "0.50",
			};

			await provider.send(mockMessage, customOptions);

			expect(mockSnsPublish).toHaveBeenCalledWith(
				expect.objectContaining({
					PhoneNumber: mockMessage.to,
					Message: mockMessage.content,
					MessageAttributes: expect.objectContaining({
						"AWS.SNS.SMS.SMSType": {
							DataType: "String",
							StringValue: "Promotional",
						},
					}),
					maxPrice: "0.50",
				}),
			);
		});
	});

	describe("Email sending", () => {
		const mockEmailMessage = {
			to: "recipient@example.com",
			from: "sender@example.com",
			subject: "Test Email",
			content: "<p>Test email content</p>",
			type: AirhornSendType.Email,
		};

		it("should send email successfully via SES", async () => {
			mockSesSend.mockResolvedValueOnce({
				MessageId: "ses-msg-123",
				$metadata: { httpStatusCode: 200 },
			});

			const result = await provider.send(mockEmailMessage);

			expect(result.success).toBe(true);
			expect(result.response).toHaveProperty("messageId", "ses-msg-123");
			expect(result.errors).toHaveLength(0);

			expect(mockSesSend).toHaveBeenCalledWith(
				expect.objectContaining({
					Source: mockEmailMessage.from,
					Destination: {
						ToAddresses: [mockEmailMessage.to],
					},
					Message: {
						Subject: {
							Data: mockEmailMessage.subject,
							Charset: "UTF-8",
						},
						Body: {
							Text: {
								Data: mockEmailMessage.content,
								Charset: "UTF-8",
							},
							Html: {
								Data: mockEmailMessage.content,
								Charset: "UTF-8",
							},
						},
					},
				}),
			);
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
			mockSesSend.mockResolvedValueOnce({
				MessageId: "ses-msg-456",
				$metadata: { httpStatusCode: 200 },
			});

			const messageWithoutSubject = { ...mockEmailMessage, subject: undefined };
			const result = await provider.send(messageWithoutSubject);

			expect(result.success).toBe(true);
			expect(mockSesSend).toHaveBeenCalledWith(
				expect.objectContaining({
					Message: expect.objectContaining({
						Subject: {
							Data: "Notification",
							Charset: "UTF-8",
						},
					}),
				}),
			);
		});

		it("should handle email send errors", async () => {
			const errorMessage = "Invalid email address";
			mockSesSend.mockRejectedValueOnce(new Error(errorMessage));

			const result = await provider.send(mockEmailMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe(errorMessage);
		});

		it("should pass additional email options", async () => {
			mockSesSend.mockResolvedValueOnce({
				MessageId: "ses-msg-789",
				$metadata: { httpStatusCode: 200 },
			});

			const additionalOptions = {
				ccAddresses: ["cc@example.com"],
				bccAddresses: ["bcc@example.com"],
				replyToAddresses: ["reply@example.com"],
				configurationSetName: "my-config-set",
			};

			await provider.send(mockEmailMessage, additionalOptions);

			expect(mockSesSend).toHaveBeenCalledWith(
				expect.objectContaining({
					Destination: expect.objectContaining({
						CcAddresses: ["cc@example.com"],
						BccAddresses: ["bcc@example.com"],
					}),
					ReplyToAddresses: ["reply@example.com"],
					ConfigurationSetName: "my-config-set",
				}),
			);
		});
	});

	describe("Unsupported message types", () => {
		it("should reject unsupported message types", async () => {
			const unsupportedMessage = {
				to: "test",
				from: "test",
				content: "test",
				type: AirhornSendType.MobilePush,
			};

			const result = await provider.send(unsupportedMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain(
				"AirhornAws does not support message type",
			);
		});
	});

	describe("Additional options", () => {
		it("should pass additional options to SNS", async () => {
			mockSnsPublish.mockResolvedValueOnce({
				MessageId: "msg-custom",
				$metadata: { httpStatusCode: 200 },
			});

			const message = {
				to: "+0987654321",
				from: "+1234567890",
				content: "Test",
				type: AirhornSendType.SMS,
			};

			const additionalOptions = {
				smsType: "Promotional",
				maxPrice: "1.00",
			};

			await provider.send(message, additionalOptions);

			expect(mockSnsPublish).toHaveBeenCalledWith(
				expect.objectContaining({
					maxPrice: "1.00",
				}),
			);
		});

		it("should pass additional options to SES", async () => {
			mockSesSend.mockResolvedValueOnce({
				MessageId: "ses-custom",
				$metadata: { httpStatusCode: 200 },
			});

			const message = {
				to: "recipient@example.com",
				from: "sender@example.com",
				subject: "Test",
				content: "Test content",
				type: AirhornSendType.Email,
			};

			const additionalOptions = {
				tags: [
					{ Name: "campaign", Value: "test" },
					{ Name: "type", Value: "transactional" },
				],
			};

			await provider.send(message, additionalOptions);

			expect(mockSesSend).toHaveBeenCalledWith(
				expect.objectContaining({
					Tags: additionalOptions.tags,
				}),
			);
		});

		it("should throw error when SMS is not in capabilities", async () => {
			const emailOnlyProvider = new AirhornAws({
				...mockOptions,
				capabilities: [AirhornSendType.Email],
			});

			const message = {
				to: "+0987654321",
				from: "+1234567890",
				content: "Test",
				type: AirhornSendType.SMS,
			};

			const result = await emailOnlyProvider.send(message);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain("SNS is not configured");
		});

		it("should throw error when Email is not in capabilities", async () => {
			const smsOnlyProvider = new AirhornAws({
				...mockOptions,
				capabilities: [AirhornSendType.SMS],
			});

			const message = {
				to: "recipient@example.com",
				from: "sender@example.com",
				subject: "Test",
				content: "Test content",
				type: AirhornSendType.Email,
			};

			const result = await smsOnlyProvider.send(message);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain("SES is not configured");
		});
	});
});
