import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import { AirhornWebhookProvider } from "../src/webhook.js";
import { AirhornProviderType } from "../src/provider.js";
import type { AirhornProviderMessage } from "../src/provider.js";

vi.mock("axios");

describe("AirhornWebhookProvider", () => {
	let provider: AirhornWebhookProvider;
	const mockAxios = axios as typeof axios & {
		post: ReturnType<typeof vi.fn>;
		isAxiosError: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		provider = new AirhornWebhookProvider();
		vi.clearAllMocks();
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
		const mockMessage: AirhornProviderMessage = {
			type: AirhornProviderType.Webhook,
			content: "Test message content",
			from: "sender@example.com",
			subject: "Test Subject",
		};

		const webhookUrl = "https://example.com/webhook";

		test("should send successful webhook request", async () => {
			const mockResponse = {
				status: 200,
				statusText: "OK",
				data: { success: true },
				headers: { "content-type": "application/json" },
			};

			mockAxios.post.mockResolvedValueOnce(mockResponse);

			const result = await provider.send(webhookUrl, mockMessage);

			expect(result.success).toBe(true);
			expect(result.errors).toEqual([]);
			expect(result.response).toEqual({
				status: 200,
				statusText: "OK",
				data: { success: true },
				headers: { "content-type": "application/json" },
			});

			expect(mockAxios.post).toHaveBeenCalledWith(
				webhookUrl,
				{
					type: AirhornProviderType.Webhook,
					from: "sender@example.com",
					content: "Test message content",
					timestamp: expect.any(String),
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		});

		test("should send webhook request with custom headers", async () => {
			const mockResponse = {
				status: 200,
				statusText: "OK",
				data: { success: true },
				headers: {},
			};

			mockAxios.post.mockResolvedValueOnce(mockResponse);

			const customHeaders = {
				"X-API-Key": "test-key",
				"X-Custom-Header": "custom-value",
			};

			await provider.send(webhookUrl, mockMessage, { headers: customHeaders });

			expect(mockAxios.post).toHaveBeenCalledWith(
				webhookUrl,
				expect.any(Object),
				{
					headers: {
						"Content-Type": "application/json",
						"X-API-Key": "test-key",
						"X-Custom-Header": "custom-value",
					},
				}
			);
		});

		test("should handle successful response with status 201", async () => {
			const mockResponse = {
				status: 201,
				statusText: "Created",
				data: { id: "123" },
				headers: {},
			};

			mockAxios.post.mockResolvedValueOnce(mockResponse);

			const result = await provider.send(webhookUrl, mockMessage);

			expect(result.success).toBe(true);
			expect(result.errors).toEqual([]);
		});

		test("should handle failed response with status 400", async () => {
			const errorResponse = {
				response: {
					status: 400,
					statusText: "Bad Request",
					data: { error: "Invalid payload" },
				},
				message: "Request failed with status code 400",
			};

			mockAxios.post.mockRejectedValueOnce(errorResponse);
			mockAxios.isAxiosError.mockReturnValueOnce(true);

			const result = await provider.send(webhookUrl, mockMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe("Webhook request failed: Request failed with status code 400");
			expect(result.response).toEqual({
				status: 400,
				statusText: "Bad Request",
				data: { error: "Invalid payload" },
			});
		});

		test("should handle network error without response", async () => {
			const networkError = {
				message: "Network Error",
				code: "ECONNREFUSED",
			};

			mockAxios.post.mockRejectedValueOnce(networkError);
			mockAxios.isAxiosError.mockReturnValueOnce(true);

			const result = await provider.send(webhookUrl, mockMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe("Webhook request failed: Network Error");
			expect(result.response).toEqual({});
		});

		test("should handle non-axios error", async () => {
			const genericError = new Error("Something went wrong");

			mockAxios.post.mockRejectedValueOnce(genericError);
			mockAxios.isAxiosError.mockReturnValueOnce(false);

			const result = await provider.send(webhookUrl, mockMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe("Something went wrong");
			expect(result.response).toEqual({});
		});

		test("should handle non-error thrown value", async () => {
			mockAxios.post.mockRejectedValueOnce("String error");
			mockAxios.isAxiosError.mockReturnValueOnce(false);

			const result = await provider.send(webhookUrl, mockMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe("String error");
		});

		test("should include timestamp in payload", async () => {
			const mockResponse = {
				status: 200,
				statusText: "OK",
				data: {},
				headers: {},
			};

			mockAxios.post.mockResolvedValueOnce(mockResponse);

			await provider.send(webhookUrl, mockMessage);

			const callArgs = mockAxios.post.mock.calls[0];
			const payload = callArgs[1];

			expect(payload.timestamp).toBeDefined();
			expect(new Date(payload.timestamp).toISOString()).toBe(payload.timestamp);
		});

		test("should handle message without optional fields", async () => {
			const minimalMessage: AirhornProviderMessage = {
				type: AirhornProviderType.Webhook,
				content: "Minimal content",
			};

			const mockResponse = {
				status: 200,
				statusText: "OK",
				data: {},
				headers: {},
			};

			mockAxios.post.mockResolvedValueOnce(mockResponse);

			const result = await provider.send(webhookUrl, minimalMessage);

			expect(result.success).toBe(true);
			expect(mockAxios.post).toHaveBeenCalledWith(
				webhookUrl,
				{
					type: AirhornProviderType.Webhook,
					from: undefined,
					content: "Minimal content",
					timestamp: expect.any(String),
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		});

		test("should mark as unsuccessful for 3xx status codes", async () => {
			const mockResponse = {
				status: 301,
				statusText: "Moved Permanently",
				data: {},
				headers: { location: "https://new-url.com" },
			};

			mockAxios.post.mockResolvedValueOnce(mockResponse);

			const result = await provider.send(webhookUrl, mockMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toEqual([]);
			expect(result.response.status).toBe(301);
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