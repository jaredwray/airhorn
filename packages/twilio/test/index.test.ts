// biome-ignore-all lint/suspicious/noExplicitAny: test file
import { AirhornProviderType } from "airhorn";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AirhornTwilio } from "../src/index";
import { mockSgSend, mockSgSetApiKey, mockTwilioCreate } from "./setup";

describe("AirhornTwilio", () => {
	let provider: AirhornTwilio;
	const mockOptions = {
		accountSid: "AC1234567890",
		authToken: "test-auth-token",
	};

	beforeEach(() => {
		vi.clearAllMocks();
		provider = new AirhornTwilio(mockOptions);
	});

	describe("constructor", () => {
		it("should create instance with both SMS and Email capabilities", () => {
			expect(provider).toBeDefined();
			expect(provider.name).toBe("twilio");
			expect(provider.capabilities).toContain(AirhornProviderType.SMS);
			expect(provider.capabilities).toContain(AirhornProviderType.Email);
		});

		it("should configure SendGrid when API key is provided", () => {
			vi.clearAllMocks();
			const providerWithEmail = new AirhornTwilio({
				...mockOptions,
				sendGridApiKey: "SG.test-api-key",
			});

			expect(providerWithEmail.capabilities).toContain(AirhornProviderType.SMS);
			expect(providerWithEmail.capabilities).toContain(
				AirhornProviderType.Email,
			);
			expect(mockSgSetApiKey).toHaveBeenCalledWith("SG.test-api-key");
		});

		it("should throw error when accountSid is missing", () => {
			expect(() => {
				new AirhornTwilio({
					accountSid: "",
					authToken: "token",
				});
			}).toThrowError("AirhornTwilio requires accountSid and authToken");
		});

		it("should throw error when authToken is missing", () => {
			expect(() => {
				new AirhornTwilio({
					accountSid: "AC123",
					authToken: "",
				});
			}).toThrowError("AirhornTwilio requires accountSid and authToken");
		});
	});

	describe("SMS sending", () => {
		const mockMessage = {
			to: "+0987654321",
			from: "+1234567890",
			content: "Test SMS message",
			type: AirhornProviderType.SMS,
			template: {} as any,
		};

		it("should send SMS successfully", async () => {
			mockTwilioCreate.mockResolvedValueOnce({
				sid: "SM123",
				status: "sent",
				dateCreated: new Date(),
				dateSent: new Date(),
				to: mockMessage.to,
				from: mockMessage.from,
				body: mockMessage.content,
				errorCode: null,
				errorMessage: null,
			});

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(true);
			expect(result.response).toHaveProperty("sid", "SM123");
			expect(result.response).toHaveProperty("status", "sent");
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
			mockTwilioCreate.mockRejectedValueOnce(new Error(errorMessage));

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe(errorMessage);
		});
	});

	describe("Email sending", () => {
		let providerWithEmail: AirhornTwilio;
		const mockEmailMessage = {
			to: "recipient@example.com",
			from: "sender@example.com",
			subject: "Test Email",
			content: "<p>Test email content</p>",
			type: AirhornProviderType.Email,
			template: {} as any,
		};

		beforeEach(() => {
			vi.clearAllMocks();
			providerWithEmail = new AirhornTwilio({
				...mockOptions,
				sendGridApiKey: "SG.test-api-key",
			});
		});

		it("should send email successfully via SendGrid", async () => {
			mockSgSend.mockResolvedValueOnce([
				{
					statusCode: 202,
					headers: {
						"x-message-id": "msg-123",
					},
					body: "",
				},
			]);

			const result = await providerWithEmail.send(mockEmailMessage);

			expect(result.success).toBe(true);
			expect(result.response).toHaveProperty("accepted", true);
			expect(result.response).toHaveProperty("messageId", "msg-123");
			expect(result.response).toHaveProperty("statusCode", 202);
			expect(result.errors).toHaveLength(0);

			expect(mockSgSend).toHaveBeenCalledWith({
				to: mockEmailMessage.to,
				from: mockEmailMessage.from,
				subject: mockEmailMessage.subject,
				text: mockEmailMessage.content,
				html: mockEmailMessage.content,
			});
		});

		it("should require from email in message", async () => {
			const messageWithoutFrom = { ...mockEmailMessage, from: "" };
			const result = await providerWithEmail.send(messageWithoutFrom);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain(
				"From email address is required for email messages",
			);
		});

		it("should use default subject when not provided", async () => {
			mockSgSend.mockResolvedValueOnce([
				{
					statusCode: 202,
					headers: { "x-message-id": "msg-789" },
					body: "",
				},
			]);

			const messageWithoutSubject = { ...mockEmailMessage, subject: undefined };
			const result = await providerWithEmail.send(messageWithoutSubject);

			expect(result.success).toBe(true);
			expect(mockSgSend).toHaveBeenCalledWith(
				expect.objectContaining({
					subject: "Notification",
				}),
			);
		});

		it("should handle email send errors", async () => {
			const errorMessage = "Invalid API key";
			mockSgSend.mockRejectedValueOnce(new Error(errorMessage));

			const result = await providerWithEmail.send(mockEmailMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe(errorMessage);
		});

		it("should throw error when trying to send email without SendGrid configured", async () => {
			const result = await provider.send(mockEmailMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain("SendGrid is not configured");
		});

		it("should require from email for email messages", async () => {
			const providerWithoutFromEmail = new AirhornTwilio({
				...mockOptions,
				sendGridApiKey: "SG.test-api-key",
			});

			const messageWithoutFrom = { ...mockEmailMessage, from: "" };
			const result = await providerWithoutFromEmail.send(messageWithoutFrom);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain(
				"From email address is required",
			);
		});
	});

	describe("Unsupported message types", () => {
		it("should reject unsupported message types", async () => {
			const unsupportedMessage = {
				to: "test",
				from: "test",
				content: "test",
				type: AirhornProviderType.MobilePush,
				template: {} as any,
			};

			const result = await provider.send(unsupportedMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain(
				"AirhornTwilio does not support message type",
			);
		});
	});

	describe("Additional options", () => {
		it("should pass additional options to Twilio SMS", async () => {
			mockTwilioCreate.mockResolvedValueOnce({
				sid: "SM789",
				status: "sent",
			});

			const message = {
				to: "+0987654321",
				from: "+1234567890",
				content: "Test",
				type: AirhornProviderType.SMS,
				template: {} as any,
			};

			const additionalOptions = {
				statusCallback: "https://example.com/callback",
				maxPrice: "0.50",
			};

			await provider.send(message, additionalOptions);

			expect(mockTwilioCreate).toHaveBeenCalledWith({
				body: message.content,
				from: message.from,
				to: message.to,
				...additionalOptions,
			});
		});

		it("should pass additional options to SendGrid email", async () => {
			mockSgSend.mockResolvedValueOnce([
				{
					statusCode: 202,
					headers: { "x-message-id": "msg-custom" },
					body: "",
				},
			]);

			const providerWithEmail = new AirhornTwilio({
				...mockOptions,
				sendGridApiKey: "SG.test-api-key",
			});

			const message = {
				to: "recipient@example.com",
				from: "sender@example.com",
				subject: "Test",
				content: "Test content",
				type: AirhornProviderType.Email,
				template: {} as any,
			};

			const additionalOptions = {
				replyTo: "reply@example.com",
				categories: ["test", "notification"],
			};

			await providerWithEmail.send(message, additionalOptions);

			expect(mockSgSend).toHaveBeenCalledWith({
				to: message.to,
				from: message.from,
				subject: message.subject,
				text: message.content,
				html: message.content,
				...additionalOptions,
			});
		});
	});
});
