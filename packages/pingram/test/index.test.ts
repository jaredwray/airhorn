import { AirhornSendType } from "airhorn";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AirhornPingram } from "../src/index";
import { mockPingramClient, mockPingramSend } from "./setup";

describe("AirhornPingram", () => {
	let provider: AirhornPingram;
	const mockOptions = {
		apiKey: "pingram_sk_test_key",
	};

	beforeEach(() => {
		vi.clearAllMocks();
		provider = new AirhornPingram(mockOptions);
	});

	describe("constructor", () => {
		it("should create instance with SMS, Email, and MobilePush capabilities by default", () => {
			expect(provider).toBeDefined();
			expect(provider.name).toBe("pingram");
			expect(provider.capabilities).toContain(AirhornSendType.SMS);
			expect(provider.capabilities).toContain(AirhornSendType.Email);
			expect(provider.capabilities).toContain(AirhornSendType.MobilePush);
		});

		it("should throw an error when apiKey is missing", () => {
			expect(() => new AirhornPingram({ apiKey: "" })).toThrow(
				"AirhornPingram requires an apiKey",
			);
		});

		it("should accept custom capabilities", () => {
			const smsOnlyProvider = new AirhornPingram({
				...mockOptions,
				capabilities: [AirhornSendType.SMS],
			});
			expect(smsOnlyProvider.capabilities).toEqual([AirhornSendType.SMS]);
			expect(smsOnlyProvider.capabilities).not.toContain(AirhornSendType.Email);

			const emailOnlyProvider = new AirhornPingram({
				...mockOptions,
				capabilities: [AirhornSendType.Email],
			});
			expect(emailOnlyProvider.capabilities).toEqual([AirhornSendType.Email]);
			expect(emailOnlyProvider.capabilities).not.toContain(AirhornSendType.SMS);
		});

		it("should pass the api key, region, and base url to the Pingram client", () => {
			new AirhornPingram({
				apiKey: "pingram_sk_eu_key",
				region: "eu",
				baseUrl: "https://custom.api.example.com",
			});

			expect(mockPingramClient).toHaveBeenCalledWith({
				apiKey: "pingram_sk_eu_key",
				region: "eu",
				baseUrl: "https://custom.api.example.com",
			});
		});
	});

	describe("SMS sending", () => {
		const mockMessage = {
			to: "+16175551212",
			from: "+1234567890",
			content: "Test SMS message",
			type: AirhornSendType.SMS,
		};

		it("should send SMS successfully", async () => {
			mockPingramSend.mockResolvedValueOnce({
				trackingId: "tracking-123",
				messages: ["queued"],
			});

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(true);
			expect(result.response).toEqual({
				trackingId: "tracking-123",
				messages: ["queued"],
			});
			expect(result.errors).toHaveLength(0);
			expect(mockPingramSend).toHaveBeenCalledWith({
				type: "airhorn",
				to: {
					id: "+16175551212",
					number: "+16175551212",
				},
				forceChannels: ["SMS"],
				sms: {
					message: "Test SMS message",
					from: "+1234567890",
				},
			});
		});

		it("should send SMS without a from number", async () => {
			mockPingramSend.mockResolvedValueOnce({
				trackingId: "tracking-124",
				messages: [],
			});

			const result = await provider.send({ ...mockMessage, from: "" });

			expect(result.success).toBe(true);
			expect(mockPingramSend).toHaveBeenCalledWith(
				expect.objectContaining({
					sms: {
						message: "Test SMS message",
						from: undefined,
					},
				}),
			);
		});

		it("should use a custom notification type", async () => {
			const customProvider = new AirhornPingram({
				...mockOptions,
				notificationType: "order_updates",
			});
			mockPingramSend.mockResolvedValueOnce({
				trackingId: "tracking-125",
				messages: [],
			});

			await customProvider.send(mockMessage);

			expect(mockPingramSend).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "order_updates",
				}),
			);
		});

		it("should merge additional send options into the request", async () => {
			mockPingramSend.mockResolvedValueOnce({
				trackingId: "tracking-126",
				messages: [],
			});

			await provider.send(mockMessage, {
				parameters: { firstName: "John" },
				schedule: "2026-12-25T00:00:00Z",
			});

			expect(mockPingramSend).toHaveBeenCalledWith(
				expect.objectContaining({
					parameters: { firstName: "John" },
					schedule: "2026-12-25T00:00:00Z",
				}),
			);
		});

		it("should let send options override the provider-built fields", async () => {
			mockPingramSend.mockResolvedValueOnce({
				trackingId: "tracking-127",
				messages: [],
			});

			await provider.send(mockMessage, {
				forceChannels: ["SMS", "CALL"],
				to: { id: "user-42", number: "+15550001111" },
			});

			expect(mockPingramSend).toHaveBeenCalledWith(
				expect.objectContaining({
					forceChannels: ["SMS", "CALL"],
					to: { id: "user-42", number: "+15550001111" },
				}),
			);
		});

		it("should handle SMS send errors", async () => {
			const errorMessage = "Invalid phone number";
			mockPingramSend.mockRejectedValueOnce(new Error(errorMessage));

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe(errorMessage);
			expect(result.response).toHaveProperty("error", errorMessage);
		});

		it("should handle non-Error rejections", async () => {
			mockPingramSend.mockRejectedValueOnce("string failure");

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe("string failure");
		});
	});

	describe("Email sending", () => {
		const mockEmailMessage = {
			to: "recipient@example.com",
			from: "sender@example.com",
			subject: "Test Subject",
			content: "<p>Test email content</p>",
			type: AirhornSendType.Email,
		};

		it("should send email successfully", async () => {
			mockPingramSend.mockResolvedValueOnce({
				trackingId: "tracking-200",
				messages: ["queued"],
			});

			const result = await provider.send(mockEmailMessage);

			expect(result.success).toBe(true);
			expect(result.response).toEqual({
				trackingId: "tracking-200",
				messages: ["queued"],
			});
			expect(result.errors).toHaveLength(0);
			expect(mockPingramSend).toHaveBeenCalledWith({
				type: "airhorn",
				to: {
					id: "recipient@example.com",
					email: "recipient@example.com",
				},
				forceChannels: ["EMAIL"],
				email: {
					subject: "Test Subject",
					html: "<p>Test email content</p>",
					senderEmail: "sender@example.com",
				},
			});
		});

		it("should default the subject when not provided", async () => {
			mockPingramSend.mockResolvedValueOnce({
				trackingId: "tracking-201",
				messages: [],
			});

			const result = await provider.send({
				...mockEmailMessage,
				subject: undefined,
			});

			expect(result.success).toBe(true);
			expect(mockPingramSend).toHaveBeenCalledWith(
				expect.objectContaining({
					email: expect.objectContaining({
						subject: "Notification",
					}),
				}),
			);
		});

		it("should send email without a sender email", async () => {
			mockPingramSend.mockResolvedValueOnce({
				trackingId: "tracking-202",
				messages: [],
			});

			const result = await provider.send({ ...mockEmailMessage, from: "" });

			expect(result.success).toBe(true);
			expect(mockPingramSend).toHaveBeenCalledWith(
				expect.objectContaining({
					email: expect.objectContaining({
						senderEmail: undefined,
					}),
				}),
			);
		});

		it("should merge send options and use a custom notification type", async () => {
			const customProvider = new AirhornPingram({
				...mockOptions,
				notificationType: "order_updates",
			});
			mockPingramSend.mockResolvedValueOnce({
				trackingId: "tracking-203",
				messages: [],
			});

			await customProvider.send(mockEmailMessage, {
				parameters: { firstName: "John" },
			});

			expect(mockPingramSend).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "order_updates",
					parameters: { firstName: "John" },
				}),
			);
		});

		it("should handle email send errors", async () => {
			const errorMessage = "Sender domain not verified";
			mockPingramSend.mockRejectedValueOnce(new Error(errorMessage));

			const result = await provider.send(mockEmailMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe(errorMessage);
		});
	});

	describe("Mobile push sending", () => {
		const mockPushMessage = {
			to: "user-123",
			from: "YourApp",
			subject: "New Order",
			content: "You have a new order #12345",
			type: AirhornSendType.MobilePush,
		};

		it("should send mobile push successfully", async () => {
			mockPingramSend.mockResolvedValueOnce({
				trackingId: "tracking-300",
				messages: ["queued"],
			});

			const result = await provider.send(mockPushMessage);

			expect(result.success).toBe(true);
			expect(result.response).toEqual({
				trackingId: "tracking-300",
				messages: ["queued"],
			});
			expect(result.errors).toHaveLength(0);
			expect(mockPingramSend).toHaveBeenCalledWith({
				type: "airhorn",
				to: {
					id: "user-123",
				},
				forceChannels: ["PUSH"],
				mobile_push: {
					title: "New Order",
					message: "You have a new order #12345",
				},
			});
		});

		it("should default the title when subject is not provided", async () => {
			mockPingramSend.mockResolvedValueOnce({
				trackingId: "tracking-301",
				messages: [],
			});

			const result = await provider.send({
				...mockPushMessage,
				subject: undefined,
			});

			expect(result.success).toBe(true);
			expect(mockPingramSend).toHaveBeenCalledWith(
				expect.objectContaining({
					mobile_push: expect.objectContaining({
						title: "Notification",
					}),
				}),
			);
		});

		it("should merge send options and use a custom notification type", async () => {
			const customProvider = new AirhornPingram({
				...mockOptions,
				notificationType: "order_updates",
			});
			mockPingramSend.mockResolvedValueOnce({
				trackingId: "tracking-302",
				messages: [],
			});

			await customProvider.send(mockPushMessage, {
				parameters: { firstName: "John" },
			});

			expect(mockPingramSend).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "order_updates",
					parameters: { firstName: "John" },
				}),
			);
		});

		it("should handle mobile push send errors", async () => {
			const errorMessage = "No push tokens registered for user";
			mockPingramSend.mockRejectedValueOnce(new Error(errorMessage));

			const result = await provider.send(mockPushMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe(errorMessage);
		});
	});

	describe("send defaults", () => {
		const sendDefaults = {
			templateId: "my_template",
			parameters: { firstName: "John" },
			to: { timezone: "America/New_York" },
			sms: { from: "+15550009999", mediaUrls: ["https://example.com/a.png"] },
			email: {
				subject: "Default Subject",
				senderEmail: "default@example.com",
				senderName: "Acme",
			},
			mobile_push: { title: "Default Title" },
		};

		let defaultsProvider: AirhornPingram;

		beforeEach(() => {
			defaultsProvider = new AirhornPingram({
				...mockOptions,
				sendDefaults,
			});
		});

		it("should apply defaults to SMS sends beneath the message values", async () => {
			mockPingramSend.mockResolvedValueOnce({
				trackingId: "tracking-400",
				messages: [],
			});

			await defaultsProvider.send({
				to: "+16175551212",
				from: "",
				content: "Hello",
				type: AirhornSendType.SMS,
			});

			expect(mockPingramSend).toHaveBeenCalledWith({
				templateId: "my_template",
				parameters: { firstName: "John" },
				type: "airhorn",
				to: {
					timezone: "America/New_York",
					id: "+16175551212",
					number: "+16175551212",
				},
				forceChannels: ["SMS"],
				sms: {
					from: "+15550009999",
					mediaUrls: ["https://example.com/a.png"],
					message: "Hello",
				},
			});
		});

		it("should let the message from win over the SMS default", async () => {
			mockPingramSend.mockResolvedValueOnce({
				trackingId: "tracking-401",
				messages: [],
			});

			await defaultsProvider.send({
				to: "+16175551212",
				from: "+1234567890",
				content: "Hello",
				type: AirhornSendType.SMS,
			});

			expect(mockPingramSend).toHaveBeenCalledWith(
				expect.objectContaining({
					sms: expect.objectContaining({
						from: "+1234567890",
						message: "Hello",
					}),
				}),
			);
		});

		it("should apply defaults to email sends beneath the message values", async () => {
			mockPingramSend.mockResolvedValueOnce({
				trackingId: "tracking-402",
				messages: [],
			});

			await defaultsProvider.send({
				to: "recipient@example.com",
				from: "",
				content: "<p>Hi</p>",
				type: AirhornSendType.Email,
			});

			expect(mockPingramSend).toHaveBeenCalledWith(
				expect.objectContaining({
					templateId: "my_template",
					email: {
						subject: "Default Subject",
						senderName: "Acme",
						senderEmail: "default@example.com",
						html: "<p>Hi</p>",
					},
				}),
			);
		});

		it("should let the message subject and sender win over email defaults", async () => {
			mockPingramSend.mockResolvedValueOnce({
				trackingId: "tracking-403",
				messages: [],
			});

			await defaultsProvider.send({
				to: "recipient@example.com",
				from: "sender@example.com",
				subject: "Real Subject",
				content: "<p>Hi</p>",
				type: AirhornSendType.Email,
			});

			expect(mockPingramSend).toHaveBeenCalledWith(
				expect.objectContaining({
					email: expect.objectContaining({
						subject: "Real Subject",
						senderEmail: "sender@example.com",
					}),
				}),
			);
		});

		it("should apply defaults to mobile push sends beneath the message values", async () => {
			mockPingramSend.mockResolvedValueOnce({
				trackingId: "tracking-404",
				messages: [],
			});

			await defaultsProvider.send({
				to: "user-123",
				from: "YourApp",
				content: "You have a new order",
				type: AirhornSendType.MobilePush,
			});

			expect(mockPingramSend).toHaveBeenCalledWith(
				expect.objectContaining({
					to: {
						timezone: "America/New_York",
						id: "user-123",
					},
					mobile_push: {
						title: "Default Title",
						message: "You have a new order",
					},
				}),
			);
		});

		it("should let per-call send options override the defaults", async () => {
			mockPingramSend.mockResolvedValueOnce({
				trackingId: "tracking-405",
				messages: [],
			});

			await defaultsProvider.send(
				{
					to: "+16175551212",
					from: "+1234567890",
					content: "Hello",
					type: AirhornSendType.SMS,
				},
				{ templateId: "override_template" },
			);

			expect(mockPingramSend).toHaveBeenCalledWith(
				expect.objectContaining({
					templateId: "override_template",
				}),
			);
		});
	});

	describe("send dispatch", () => {
		it("should return an error for unsupported message types", async () => {
			const result = await provider.send({
				to: "https://example.com/webhook",
				from: "airhorn",
				content: "{}",
				type: AirhornSendType.Webhook,
			});

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain(
				"AirhornPingram is not configured for message type: webhook",
			);
			expect(mockPingramSend).not.toHaveBeenCalled();
		});

		it("should return an error when the message type is not in capabilities", async () => {
			const smsOnlyProvider = new AirhornPingram({
				...mockOptions,
				capabilities: [AirhornSendType.SMS],
			});

			const result = await smsOnlyProvider.send({
				to: "recipient@example.com",
				from: "sender@example.com",
				content: "Test",
				type: AirhornSendType.Email,
			});

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain(
				"AirhornPingram is not configured for message type: email",
			);
			expect(mockPingramSend).not.toHaveBeenCalled();
		});

		it("should handle non-Error values thrown during dispatch", async () => {
			vi.spyOn(
				provider as unknown as { sendSMS: () => Promise<never> },
				"sendSMS",
			).mockRejectedValueOnce("dispatch failure");

			const result = await provider.send({
				to: "+16175551212",
				from: "+1234567890",
				content: "Test",
				type: AirhornSendType.SMS,
			});

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe("dispatch failure");
		});

		it("should return an error for capability values it cannot dispatch", async () => {
			const webhookProvider = new AirhornPingram({
				...mockOptions,
				capabilities: [AirhornSendType.Webhook],
			});

			const result = await webhookProvider.send({
				to: "https://example.com/webhook",
				from: "airhorn",
				content: "{}",
				type: AirhornSendType.Webhook,
			});

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain(
				"AirhornPingram does not support message type: webhook",
			);
			expect(mockPingramSend).not.toHaveBeenCalled();
		});
	});
});
