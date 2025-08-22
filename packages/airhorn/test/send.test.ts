import { describe, test, expect, vi, beforeEach } from "vitest";
import { Airhorn, AirhornSendStrategy } from "../src/index.js";
import { AirhornWebhookProvider } from "../src/webhook.js";
import type { AirhornTemplate } from "../src/template.js";

describe("Airhorn send function", () => {
	let airhorn: Airhorn;
	const mockFetch = vi.fn();

	beforeEach(() => {
		airhorn = new Airhorn();
		vi.clearAllMocks();
		global.fetch = mockFetch;
	});

	test("should send webhook using provider from _providers", async () => {
		const webhookUrl = "https://api.example.com/webhook";
		
		// Mock successful webhook response  
		const mockResponse = {
			ok: true,
			status: 200,
			statusText: "OK",
			json: vi.fn().mockResolvedValue({ success: true }),
			headers: new Headers({ "content-type": "application/json" }),
		};
		mockFetch.mockResolvedValueOnce(mockResponse);

		// Create template
		const template: AirhornTemplate = {
			from: "test@example.com",
			subject: "Test Subject",
			content: "Hello <%= name %>!",
			templateEngine: "ejs",
		};

		// Send webhook
		const result = await airhorn.sendWebhook(
			webhookUrl,
			template,
			{ name: "John" }
		);

		// Verify the result
		expect(result.success).toBe(true);
		expect(result.errors).toEqual([]);
		expect(result.message).toBeDefined();
		expect(result.message?.to).toBe(webhookUrl);
		expect(result.message?.content).toBe("Hello John!");
		expect(result.providers).toHaveLength(1);
		expect(result.providers[0]).toBeInstanceOf(AirhornWebhookProvider);
		
		// Verify fetch was called
		expect(mockFetch).toHaveBeenCalledWith(
			webhookUrl,
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({
					"Content-Type": "application/json",
				}),
				body: expect.any(String),
			})
		);
	});

	test("should handle no providers available", async () => {
		// Remove all providers
		airhorn.providers = [];
		
		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test content",
		};

		// Send should fail with no providers
		const result = await airhorn.sendWebhook(
			"https://example.com",
			template,
			{}
		);

		expect(result.success).toBe(false);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].message).toContain("No providers available");
	});

	test("should use All send strategy", async () => {
		// Add multiple webhook providers
		const provider1 = new AirhornWebhookProvider();
		const provider2 = new AirhornWebhookProvider();
		airhorn.providers = [provider1, provider2];
		
		// Mock successful responses for both
		const mockResponse = {
			ok: true,
			status: 200,
			statusText: "OK",
			json: vi.fn().mockResolvedValue({ success: true }),
			headers: new Headers(),
		};
		mockFetch.mockResolvedValue(mockResponse);

		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test content",
		};

		// Send with All strategy
		const result = await airhorn.sendWebhook(
			"https://example.com",
			template,
			{},
			{ 
				sendStrategy: AirhornSendStrategy.All
			}
		);

		expect(result.success).toBe(true);
		expect(result.providers).toHaveLength(2);
		// Both providers should have been called
		expect(mockFetch).toHaveBeenCalledTimes(2);
	});

	test("should use RoundRobin send strategy", async () => {
		// Add multiple webhook providers
		const provider1 = new AirhornWebhookProvider();
		const provider2 = new AirhornWebhookProvider();
		airhorn.providers = [provider1, provider2];
		airhorn.sendStrategy = AirhornSendStrategy.RoundRobin;
		
		// Mock successful response
		const mockResponse = {
			ok: true,
			status: 200,
			statusText: "OK",
			json: vi.fn().mockResolvedValue({ success: true }),
			headers: new Headers(),
		};
		mockFetch.mockResolvedValue(mockResponse);

		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test content",
		};

		// First send should use first provider
		const result1 = await airhorn.sendWebhook(
			"https://example.com",
			template,
			{}
		);
		expect(result1.success).toBe(true);
		expect(result1.providers).toHaveLength(1);

		// Second send should use second provider
		const result2 = await airhorn.sendWebhook(
			"https://example.com",
			template,
			{}
		);
		expect(result2.success).toBe(true);
		expect(result2.providers).toHaveLength(1);

		// Third send should use first provider again
		const result3 = await airhorn.sendWebhook(
			"https://example.com",
			template,
			{}
		);
		expect(result3.success).toBe(true);
		expect(result3.providers).toHaveLength(1);

		// Should have been called 3 times total
		expect(mockFetch).toHaveBeenCalledTimes(3);
	});

	test("should use FailOver send strategy", async () => {
		// Clear default providers and add two new ones
		const provider1 = new AirhornWebhookProvider();
		const provider2 = new AirhornWebhookProvider();
		airhorn.providers = [provider1, provider2]; // This replaces all providers
		airhorn.sendStrategy = AirhornSendStrategy.FailOver;
		
		// First call fails, second succeeds
		mockFetch
			.mockRejectedValueOnce(new Error("Network error"))
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				statusText: "OK",
				json: vi.fn().mockResolvedValue({ success: true }),
				headers: new Headers(),
			});

		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test content",
		};

		const result = await airhorn.sendWebhook(
			"https://example.com",
			template,
			{}
		);

		// Should succeed with second provider
		expect(result.success).toBe(true);
		expect(result.providers).toHaveLength(1);
		// Since both providers try and first fails, we should have 1 error
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].message).toContain("Network error");
		// Should have tried both providers
		expect(mockFetch).toHaveBeenCalledTimes(2);
	});

	test("should update statistics when enabled", async () => {
		airhorn.statistics.enabled = true;
		
		// Mock successful response
		const mockResponse = {
			ok: true,
			status: 200,
			statusText: "OK",
			json: vi.fn().mockResolvedValue({ success: true }),
			headers: new Headers(),
		};
		mockFetch.mockResolvedValueOnce(mockResponse);

		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test content",
		};

		// Check initial stats
		expect(airhorn.statistics.totalSendSuccesses).toBe(0);
		expect(airhorn.statistics.totalSendFailures).toBe(0);

		// Send successful message
		await airhorn.sendWebhook(
			"https://example.com",
			template,
			{}
		);

		// Stats should be updated
		expect(airhorn.statistics.totalSendSuccesses).toBe(1);
		expect(airhorn.statistics.totalSendFailures).toBe(0);

		// Send failed message
		mockFetch.mockRejectedValueOnce(new Error("Network error"));
		airhorn.providers = [new AirhornWebhookProvider()]; // Reset providers
		
		await airhorn.sendWebhook(
			"https://example.com",
			template,
			{}
		);

		// Stats should be updated
		expect(airhorn.statistics.totalSendSuccesses).toBe(1);
		expect(airhorn.statistics.totalSendFailures).toBe(1);
	});

	test("should emit events on send", async () => {
		const sentEvents: any[] = [];
		const failedEvents: any[] = [];
		
		airhorn.on("notification.sent", (result) => {
			sentEvents.push(result);
		});
		
		airhorn.on("notification.failed", (result) => {
			failedEvents.push(result);
		});
		
		// Mock successful response
		const mockResponse = {
			ok: true,
			status: 200,
			statusText: "OK",
			json: vi.fn().mockResolvedValue({ success: true }),
			headers: new Headers(),
		};
		mockFetch.mockResolvedValueOnce(mockResponse);

		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test content",
		};

		// Send successful message
		await airhorn.sendWebhook(
			"https://example.com",
			template,
			{}
		);

		expect(sentEvents).toHaveLength(1);
		expect(failedEvents).toHaveLength(0);
		expect(sentEvents[0].success).toBe(true);

		// Send failed message
		mockFetch.mockRejectedValueOnce(new Error("Network error"));
		airhorn.providers = [new AirhornWebhookProvider()]; // Reset providers
		
		await airhorn.sendWebhook(
			"https://example.com",
			template,
			{}
		);

		expect(sentEvents).toHaveLength(1);
		expect(failedEvents).toHaveLength(1);
		expect(failedEvents[0].success).toBe(false);
	});
});