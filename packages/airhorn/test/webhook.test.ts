import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { AirhornWebhookProvider } from "../src/webhook.js";
import { AirhornProviderType } from "../src/provider.js";
import type { AirhornProviderMessage } from "../src/provider.js";

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
			expect(provider.capabilities).toEqual([AirhornProviderType.Webhook]);
		});
	});

	describe("send", () => {
		const webhookUrl = "https://example.com/webhook";

		const mockMessage: AirhornProviderMessage = {
			to: webhookUrl,
			type: AirhornProviderType.Webhook,
			content: "Test message content",
			from: "sender@example.com",
			subject: "Test Subject",
			template: {
				from: "sender@example.com",
				subject: "Test Subject",
				content: "Test message content",
			}
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

			expect(mockFetch).toHaveBeenCalledWith(
				mockMessage.to,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: expect.any(String),
				}
			);

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

			expect(mockFetch).toHaveBeenCalledWith(
				webhookUrl,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"X-API-Key": "test-key",
						"X-Custom-Header": "custom-value",
					},
					body: expect.any(String),
				}
			);
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
			expect(result.errors[0].message).toBe("Webhook request failed: Network Error");
			expect(result.response).toEqual({ error: "Network Error" });
		});

		test("should handle generic error", async () => {
			const genericError = new Error("Something went wrong");

			mockFetch.mockRejectedValueOnce(genericError);

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe("Webhook request failed: Something went wrong");
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
				type: AirhornProviderType.Webhook,
				content: "Minimal content",
				template: {
					from: "test@example.com",
					content: "Test Body"
				}
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
			expect(mockFetch).toHaveBeenCalledWith(
				webhookUrl,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: expect.any(String),
				}
			);
			
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
	});

	describe("getters", () => {
		test("should return correct name", () => {
			expect(provider.name).toBe("AirhornWebhookProvider");
		});

		test("should return correct capabilities", () => {
			expect(provider.capabilities).toEqual([AirhornProviderType.Webhook]);
			expect(provider.capabilities).toHaveLength(1);
		});
	});
});