import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Airhorn, AirhornSendType } from "../src/index.js";
import type { AirhornProviderMessage } from "../src/provider.js";
import type { AirhornTemplate } from "../src/template.js";
import { AirhornWebhookProvider } from "../src/webhook.js";

describe("AirhornWebhookProvider", () => {
	let provider: AirhornWebhookProvider;
	const mockFetch = vi.fn();

	beforeEach(() => {
		provider = new AirhornWebhookProvider();
		vi.clearAllMocks();
		global.fetch = mockFetch;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("constructor", () => {
		test("should initialize with correct name and capabilities", () => {
			expect(provider.name).toBe("AirhornWebhookProvider");
			expect(provider.capabilities).toEqual([AirhornSendType.Webhook]);
		});
	});

	describe("send", () => {
		const webhookUrl = "https://example.com/webhook";

		const mockMessage: AirhornProviderMessage = {
			to: webhookUrl,
			type: AirhornSendType.Webhook,
			content: "Test message content",
			from: "sender@example.com",
			subject: "Test Subject",
		};

		test("should send successful webhook request", async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: "OK",
				json: vi.fn().mockResolvedValue({ success: true }),
				headers: new Headers({ "content-type": "application/json" }),
			};

			mockFetch.mockResolvedValueOnce(mockResponse);

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(true);
			expect(result.errors).toEqual([]);
			expect(result.response).toEqual({
				status: 200,
				statusText: "OK",
				data: { success: true },
				headers: { "content-type": "application/json" },
			});

			expect(mockFetch).toHaveBeenCalledWith(mockMessage.to, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: expect.any(String),
			});

			const callArgs = mockFetch.mock.calls[0];
			const body = JSON.parse(callArgs[1].body);
			expect(body.from).toBe("sender@example.com");
			expect(body.content).toBe("Test message content");
			expect(body.timestamp).toBeDefined();
		});

		test("should send webhook request with custom headers", async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: "OK",
				json: vi.fn().mockResolvedValue({ success: true }),
				headers: new Headers(),
			};

			mockFetch.mockResolvedValueOnce(mockResponse);

			const customHeaders = {
				"X-API-Key": "test-key",
				"X-Custom-Header": "custom-value",
			};

			await provider.send(mockMessage, { headers: customHeaders });

			expect(mockFetch).toHaveBeenCalledWith(webhookUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": "test-key",
					"X-Custom-Header": "custom-value",
				},
				body: expect.any(String),
			});
		});

		test("should handle successful response with status 201", async () => {
			const mockResponse = {
				ok: true,
				status: 201,
				statusText: "Created",
				json: vi.fn().mockResolvedValue({ id: "123" }),
				headers: new Headers(),
			};

			mockFetch.mockResolvedValueOnce(mockResponse);

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(true);
			expect(result.errors).toEqual([]);
		});

		test("should handle failed response with status 400", async () => {
			const mockResponse = {
				ok: false,
				status: 400,
				statusText: "Bad Request",
				json: vi.fn().mockResolvedValue({ error: "Invalid payload" }),
				headers: new Headers(),
			};

			mockFetch.mockResolvedValueOnce(mockResponse);

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toEqual([]);
			expect(result.response).toEqual({
				status: 400,
				statusText: "Bad Request",
				data: { error: "Invalid payload" },
				headers: {},
			});
		});

		test("should handle network error", async () => {
			const networkError = new Error("Network Error");

			mockFetch.mockRejectedValueOnce(networkError);

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe(
				"Webhook request failed: Network Error",
			);
			expect(result.response).toEqual({ error: "Network Error" });
		});

		test("should handle generic error", async () => {
			const genericError = new Error("Something went wrong");

			mockFetch.mockRejectedValueOnce(genericError);

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe(
				"Webhook request failed: Something went wrong",
			);
			expect(result.response).toEqual({ error: "Something went wrong" });
		});

		test("should handle non-error thrown value", async () => {
			mockFetch.mockRejectedValueOnce("String error");

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe("String error");
		});

		test("should include timestamp in payload", async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: "OK",
				json: vi.fn().mockResolvedValue({}),
				headers: new Headers(),
			};

			mockFetch.mockResolvedValueOnce(mockResponse);

			await provider.send(mockMessage);

			const callArgs = mockFetch.mock.calls[0];
			const body = JSON.parse(callArgs[1].body);

			expect(body.timestamp).toBeDefined();
			expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
		});

		test("should handle message without optional fields", async () => {
			const minimalMessage: AirhornProviderMessage = {
				to: webhookUrl,
				from: "test@example.com",
				type: AirhornSendType.Webhook,
				content: "Minimal content",
			};

			const mockResponse = {
				ok: true,
				status: 200,
				statusText: "OK",
				json: vi.fn().mockResolvedValue({}),
				headers: new Headers(),
			};

			mockFetch.mockResolvedValueOnce(mockResponse);

			const result = await provider.send(minimalMessage);

			expect(result.success).toBe(true);
			expect(mockFetch).toHaveBeenCalledWith(webhookUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: expect.any(String),
			});

			const callArgs = mockFetch.mock.calls[0];
			const body = JSON.parse(callArgs[1].body);
			expect(body.from).toBe("test@example.com");
			expect(body.content).toBe("Minimal content");
			expect(body.timestamp).toBeDefined();
		});

		test("should mark as unsuccessful for 3xx status codes", async () => {
			const mockResponse = {
				ok: false,
				status: 301,
				statusText: "Moved Permanently",
				json: vi.fn().mockResolvedValue({}),
				headers: new Headers({ location: "https://new-url.com" }),
			};

			mockFetch.mockResolvedValueOnce(mockResponse);

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toEqual([]);
			expect(result.response.status).toBe(301);
		});

		test("should handle response body parse error", async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: "OK",
				json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
				headers: new Headers(),
			};

			mockFetch.mockResolvedValueOnce(mockResponse);

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(true);
			expect(result.errors).toEqual([]);
			expect(result.response.data).toEqual({});
		});

		test("should send webhook with template converted to message", async () => {
			const airhorn = new Airhorn();
			const webhookUrl = "https://api.example.com/webhooks/notifications";

			// Load template from file
			const template = await airhorn.loadTemplate(
				"./test/fixtures/webhook-simple.md",
			);

			// Verify template loaded correctly
			expect(template.from).toBe("webhook@notifications.com");
			expect(template.subject).toBe("User Profile Update");
			expect(template.templateEngine).toBe("ejs");
			expect(template.requiredFields).toEqual(["name", "age", "vegetables"]);

			// Data to populate the template
			const templateData = {
				name: "John Doe",
				age: 30,
				vegetables: ["carrots", "broccoli", "spinach"],
			};

			// Generate message from template
			const message = await airhorn.generateMessage(
				webhookUrl,
				template,
				templateData,
				AirhornSendType.Webhook,
			);

			// Verify the generated message
			expect(message.to).toBe(webhookUrl);
			expect(message.from).toBe("webhook@notifications.com");
			expect(message.subject).toBe("User Profile Update");
			expect(message.type).toBe(AirhornSendType.Webhook);

			// Parse the JSON content that was generated
			const generatedContent = JSON.parse(message.content);
			expect(generatedContent.event).toBe("user.profile.updated");
			expect(generatedContent.user.name).toBe("John Doe");
			expect(generatedContent.user.age).toBe(30);
			expect(generatedContent.user.preferences.favoriteVegetables).toEqual([
				"carrots",
				"broccoli",
				"spinach",
			]);
			expect(generatedContent.metadata.source).toBe("profile-service");
			expect(generatedContent.metadata.version).toBe("1.0.0");

			// Mock successful webhook response
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: "OK",
				json: vi.fn().mockResolvedValue({
					received: true,
					message: "Webhook processed successfully",
				}),
				headers: new Headers({
					"content-type": "application/json",
					"x-webhook-id": "webhook-123",
				}),
			};

			mockFetch.mockResolvedValueOnce(mockResponse);

			// Send the generated message via webhook
			const result = await provider.send(message);

			// Verify the webhook was called correctly
			expect(mockFetch).toHaveBeenCalledWith(webhookUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: expect.any(String),
			});

			// Verify the payload sent to webhook
			const callArgs = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
			const body = JSON.parse(callArgs[1].body);
			expect(body.from).toBe("webhook@notifications.com");
			expect(body.timestamp).toBeDefined();

			// Verify the webhook payload contains the generated JSON content
			const payloadContent = JSON.parse(body.content);
			expect(payloadContent.event).toBe("user.profile.updated");
			expect(payloadContent.user.name).toBe("John Doe");
			expect(payloadContent.user.age).toBe(30);

			// Verify the result
			expect(result.success).toBe(true);
			expect(result.errors).toEqual([]);
			expect(result.response.status).toBe(200);
			expect(result.response.data.received).toBe(true);
		});

		test("should send webhook with JSON template content", async () => {
			const airhorn = new Airhorn();
			const webhookUrl = "https://api.example.com/webhooks/json";

			// Create a template with JSON content
			const template: AirhornTemplate = {
				from: "api@myservice.com",
				content: JSON.stringify({
					event: "user.updated",
					user: {
						name: "<%= name %>",
						email: "<%= email %>",
						status: "<%= status %>",
					},
					timestamp: "<%= new Date().toISOString() %>",
				}),
				templateEngine: "ejs",
				requiredFields: ["name", "email", "status"],
			};

			// Data to populate the template
			const templateData = {
				name: "Jane Smith",
				email: "jane@example.com",
				status: "active",
			};

			// Generate message from template
			const message = await airhorn.generateMessage(
				webhookUrl,
				template,
				templateData,
				AirhornSendType.Webhook,
			);

			// Parse the generated JSON content to verify it
			const generatedContent = JSON.parse(message.content);
			expect(generatedContent.event).toBe("user.updated");
			expect(generatedContent.user.name).toBe("Jane Smith");
			expect(generatedContent.user.email).toBe("jane@example.com");
			expect(generatedContent.user.status).toBe("active");
			expect(generatedContent.timestamp).toBeDefined();

			// Mock successful webhook response
			const mockResponse = {
				ok: true,
				status: 201,
				statusText: "Created",
				json: vi.fn().mockResolvedValue({ id: "event-456" }),
				headers: new Headers(),
			};

			mockFetch.mockResolvedValueOnce(mockResponse);

			// Send the generated message via webhook with custom headers
			const customHeaders = {
				"X-API-Key": "secret-key-123",
				"X-Webhook-Version": "2.0",
			};

			const result = await provider.send(message, { headers: customHeaders });

			// Verify the webhook was called with custom headers
			expect(mockFetch).toHaveBeenCalledWith(webhookUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": "secret-key-123",
					"X-Webhook-Version": "2.0",
				},
				body: expect.any(String),
			});

			// Verify the result
			expect(result.success).toBe(true);
			expect(result.response.status).toBe(201);
			expect(result.response.data.id).toBe("event-456");
		});
	});

	describe("getters", () => {
		test("should return correct name", () => {
			expect(provider.name).toBe("AirhornWebhookProvider");
		});

		test("should return correct capabilities", () => {
			expect(provider.capabilities).toEqual([AirhornSendType.Webhook]);
			expect(provider.capabilities).toHaveLength(1);
		});
	});
});
