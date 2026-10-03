// biome-ignore-all lint/suspicious/noExplicitAny: test file
import { beforeEach, describe, expect, test, vi } from "vitest";
import {
	Airhorn,
	AirhornEvent,
	AirhornSendStrategy,
	AirhornSendType,
} from "../src/index.js";
import type { AirhornTemplate } from "../src/template.js";
import { AirhornWebhookProvider } from "../src/webhook.js";

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
		const result = await airhorn.sendWebhook(webhookUrl, template, {
			name: "John",
		});

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
			}),
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
			{},
		);

		expect(result.success).toBe(false);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].error.message).toContain("No providers available");
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
				sendStrategy: AirhornSendStrategy.All,
			},
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
			{},
		);
		expect(result1.success).toBe(true);
		expect(result1.providers).toHaveLength(1);

		// Second send should use second provider
		const result2 = await airhorn.sendWebhook(
			"https://example.com",
			template,
			{},
		);
		expect(result2.success).toBe(true);
		expect(result2.providers).toHaveLength(1);

		// Third send should use first provider again
		const result3 = await airhorn.sendWebhook(
			"https://example.com",
			template,
			{},
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
			{},
		);

		// Should succeed with second provider
		expect(result.success).toBe(true);
		expect(result.providers).toHaveLength(1);
		// Since both providers try and first fails, we should have 1 error
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].error.message).toContain("Network error");
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
		expect(airhorn.statistics.executionTimes).toEqual([]);

		// Send successful message
		const result1 = await airhorn.sendWebhook(
			"https://example.com",
			template,
			{},
		);

		// Stats should be updated
		expect(airhorn.statistics.totalSendSuccesses).toBe(1);
		expect(airhorn.statistics.totalSendFailures).toBe(0);
		expect(airhorn.statistics.executionTimes).toHaveLength(1);
		expect(airhorn.statistics.executionTimes[0].duration).toBe(
			result1.executionTime,
		);
		expect(airhorn.statistics.executionTimes[0].to).toBe("https://example.com");
		expect(airhorn.statistics.totalExecutionTime).toBe(result1.executionTime);

		// Send failed message
		mockFetch.mockRejectedValueOnce(new Error("Network error"));
		airhorn.providers = [new AirhornWebhookProvider()]; // Reset providers

		const result2 = await airhorn.sendWebhook(
			"https://example.com",
			template,
			{},
		);

		// Stats should be updated
		expect(airhorn.statistics.totalSendSuccesses).toBe(1);
		expect(airhorn.statistics.totalSendFailures).toBe(1);
		expect(airhorn.statistics.executionTimes).toHaveLength(2);
		expect(airhorn.statistics.executionTimes[1].duration).toBe(
			result2.executionTime,
		);
		expect(airhorn.statistics.executionTimes[1].to).toBe("https://example.com");
		expect(airhorn.statistics.totalExecutionTime).toBe(
			result1.executionTime + result2.executionTime,
		);
		expect(airhorn.statistics.averageExecutionTime).toBe(
			(result1.executionTime + result2.executionTime) / 2,
		);
	});

	test("sendAll should send to all providers simultaneously", async () => {
		const provider1 = new AirhornWebhookProvider();
		const provider2 = new AirhornWebhookProvider();
		airhorn.providers = [provider1, provider2];

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

		const result = await airhorn.sendAll(
			"https://example.com",
			template,
			{},
			AirhornSendType.Webhook,
		);

		expect(result.success).toBe(true);
		expect(result.providers).toHaveLength(2);
		expect(mockFetch).toHaveBeenCalledTimes(2);
	});

	test("sendAll should handle all providers failing", async () => {
		const provider1 = new AirhornWebhookProvider();
		const provider2 = new AirhornWebhookProvider();
		airhorn.providers = [provider1, provider2];

		mockFetch.mockRejectedValue(new Error("Network error"));

		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test content",
		};

		const result = await airhorn.sendAll(
			"https://example.com",
			template,
			{},
			AirhornSendType.Webhook,
		);

		expect(result.success).toBe(false);
		expect(result.providers).toHaveLength(2);
		expect(mockFetch).toHaveBeenCalledTimes(2);
	});

	test("sendFailOver should try next provider on failure", async () => {
		const provider1 = new AirhornWebhookProvider();
		const provider2 = new AirhornWebhookProvider();
		airhorn.providers = [provider1, provider2];

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

		const result = await airhorn.sendFailOver(
			"https://example.com",
			template,
			{},
			AirhornSendType.Webhook,
		);

		expect(result.success).toBe(true);
		expect(result.providers).toHaveLength(1);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].error.message).toContain("Network error");
		expect(mockFetch).toHaveBeenCalledTimes(2);
	});

	test("sendRoundRobin should cycle through providers", async () => {
		const provider1 = new AirhornWebhookProvider();
		const provider2 = new AirhornWebhookProvider();
		airhorn.providers = [provider1, provider2];

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

		const result1 = await airhorn.sendRoundRobin(
			"https://example.com",
			template,
			{},
			AirhornSendType.Webhook,
		);
		expect(result1.success).toBe(true);
		expect(result1.providers).toHaveLength(1);

		const result2 = await airhorn.sendRoundRobin(
			"https://example.com",
			template,
			{},
			AirhornSendType.Webhook,
		);
		expect(result2.success).toBe(true);
		expect(result2.providers).toHaveLength(1);

		const result3 = await airhorn.sendRoundRobin(
			"https://example.com",
			template,
			{},
			AirhornSendType.Webhook,
		);
		expect(result3.success).toBe(true);
		expect(result3.providers).toHaveLength(1);

		expect(mockFetch).toHaveBeenCalledTimes(3);
	});

	test("sendAll should handle no providers available", async () => {
		airhorn.providers = [];

		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test content",
		};

		const result = await airhorn.sendAll(
			"https://example.com",
			template,
			{},
			AirhornSendType.Webhook,
		);

		expect(result.success).toBe(false);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].error.message).toContain("No providers available");
	});

	test("sendFailOver should handle no providers available", async () => {
		airhorn.providers = [];

		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test content",
		};

		const result = await airhorn.sendFailOver(
			"https://example.com",
			template,
			{},
			AirhornSendType.Webhook,
		);

		expect(result.success).toBe(false);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].error.message).toContain("No providers available");
	});

	test("sendRoundRobin should handle no providers available", async () => {
		airhorn.providers = [];

		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test content",
		};

		const result = await airhorn.sendRoundRobin(
			"https://example.com",
			template,
			{},
			AirhornSendType.Webhook,
		);

		expect(result.success).toBe(false);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].error.message).toContain("No providers available");
	});

	test("should emit events on send", async () => {
		const sentEvents: any[] = [];
		const failedEvents: any[] = [];

		airhorn.on(AirhornEvent.SendSuccess, (result) => {
			sentEvents.push(result);
		});

		airhorn.on(AirhornEvent.SendFailure, (result) => {
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
		await airhorn.sendWebhook("https://example.com", template, {});

		expect(sentEvents).toHaveLength(1);
		expect(failedEvents).toHaveLength(0);
		expect(sentEvents[0].success).toBe(true);

		// Send failed message
		mockFetch.mockRejectedValueOnce(new Error("Network error"));
		airhorn.providers = [new AirhornWebhookProvider()]; // Reset providers

		await airhorn.sendWebhook("https://example.com", template, {});

		expect(sentEvents).toHaveLength(1);
		expect(failedEvents).toHaveLength(1);
		expect(failedEvents[0].success).toBe(false);
	});
});

describe("Airhorn from precedence", () => {
	let airhorn: Airhorn;
	const mockFetch = vi.fn();

	beforeEach(() => {
		airhorn = new Airhorn();
		vi.clearAllMocks();
		global.fetch = mockFetch;
	});

	test("should generate a message without a from on the template", async () => {
		const template: AirhornTemplate = {
			content: "Test content",
		};

		const message = await airhorn.generateMessage(
			"https://example.com",
			template,
			{},
			AirhornSendType.Webhook,
		);

		expect(message.from).toBe("");
	});

	test("should use the template from when options do not set one", async () => {
		const template: AirhornTemplate = {
			from: "template@example.com",
			content: "Test content",
		};

		const message = await airhorn.generateMessage(
			"https://example.com",
			template,
			{},
			AirhornSendType.Webhook,
			{ sendStrategy: AirhornSendStrategy.RoundRobin },
		);

		expect(message.from).toBe("template@example.com");
	});

	test("should override the template from with options.from", async () => {
		const template: AirhornTemplate = {
			from: "template@example.com",
			content: "Test content",
		};

		const message = await airhorn.generateMessage(
			"https://example.com",
			template,
			{},
			AirhornSendType.Webhook,
			{ from: "options@example.com" },
		);

		expect(message.from).toBe("options@example.com");
	});

	test("should send using options.from when the template has no from", async () => {
		const mockResponse = {
			ok: true,
			status: 200,
			statusText: "OK",
			json: vi.fn().mockResolvedValue({ success: true }),
			headers: new Headers(),
		};
		mockFetch.mockResolvedValueOnce(mockResponse);

		const template: AirhornTemplate = {
			content: "Hello <%= name %>!",
			templateEngine: "ejs",
		};

		const result = await airhorn.sendWebhook(
			"https://example.com",
			template,
			{ name: "John" },
			{ from: "options@example.com" },
		);

		expect(result.success).toBe(true);
		expect(result.message?.from).toBe("options@example.com");
		expect(result.message?.content).toBe("Hello John!");

		const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(payload.from).toBe("options@example.com");
	});
});

describe("Airhorn provider options forwarding", () => {
	test("should not forward the from or retries options to providers", async () => {
		const receivedOptions: any[] = [];
		const mockProvider = {
			name: "mock",
			capabilities: [AirhornSendType.SMS],
			send: async (_message: any, options?: any) => {
				receivedOptions.push(options);
				return { success: true, response: {}, errors: [] };
			},
		};

		const airhorn = new Airhorn({
			providers: [mockProvider],
			useWebhookProvider: false,
		});

		const template: AirhornTemplate = {
			content: "Test content",
		};

		const result = await airhorn.send(
			"+1234567890",
			template,
			{},
			AirhornSendType.SMS,
			{ from: "+12223334444", throwOnErrors: false, retries: 2 },
		);

		expect(result.success).toBe(true);
		expect(result.message?.from).toBe("+12223334444");
		expect(receivedOptions).toHaveLength(1);
		expect(receivedOptions[0]).toEqual({ throwOnErrors: false });
	});
});

describe("Airhorn send retries", () => {
	const template: AirhornTemplate = {
		content: "Hello",
	};

	function createAirhorn(providers: Array<any>) {
		return new Airhorn({
			providers,
			useWebhookProvider: false,
		});
	}

	function successResult(response: any = { ok: true }) {
		return { success: true, response, errors: [] };
	}

	function failureResult(message: string) {
		return {
			success: false,
			response: null,
			errors: [new Error(message)],
		};
	}

	test("should not retry when retries is omitted", async () => {
		const provider = {
			name: "mock",
			capabilities: [AirhornSendType.SMS],
			send: vi.fn().mockResolvedValue(failureResult("failed")),
		};
		const airhorn = createAirhorn([provider]);

		const result = await airhorn.send(
			"+1234567890",
			template,
			{ name: "John" },
			AirhornSendType.SMS,
		);

		expect(provider.send).toHaveBeenCalledTimes(1);
		expect(result.success).toBe(false);
		expect(result.retries).toBe(0);
	});

	test("should not retry when retries is 0", async () => {
		const provider = {
			name: "mock",
			capabilities: [AirhornSendType.SMS],
			send: vi.fn().mockResolvedValue(failureResult("failed")),
		};
		const airhorn = createAirhorn([provider]);

		const result = await airhorn.send(
			"+1234567890",
			template,
			{},
			AirhornSendType.SMS,
			{ retries: 0 },
		);

		expect(provider.send).toHaveBeenCalledTimes(1);
		expect(result.retries).toBe(0);
	});

	test("should report zero retries when the first attempt succeeds", async () => {
		const provider = {
			name: "mock",
			capabilities: [AirhornSendType.SMS],
			send: vi.fn().mockResolvedValue(successResult()),
		};
		const airhorn = createAirhorn([provider]);

		const result = await airhorn.send(
			"+1234567890",
			template,
			{},
			AirhornSendType.SMS,
			{ retries: 3 },
		);

		expect(provider.send).toHaveBeenCalledTimes(1);
		expect(result.success).toBe(true);
		expect(result.retries).toBe(0);
	});

	test("should retry a failed provider until it succeeds", async () => {
		const provider = {
			name: "mock",
			capabilities: [AirhornSendType.SMS],
			send: vi
				.fn()
				.mockResolvedValueOnce(failureResult("fail 1"))
				.mockResolvedValueOnce(failureResult("fail 2"))
				.mockResolvedValueOnce(successResult({ delivered: true })),
		};
		const airhorn = createAirhorn([provider]);

		const result = await airhorn.send(
			"+1234567890",
			template,
			{},
			AirhornSendType.SMS,
			{ retries: 2 },
		);

		expect(provider.send).toHaveBeenCalledTimes(3);
		expect(result.success).toBe(true);
		expect(result.retries).toBe(2);
		expect(result.errors).toEqual([]);
		expect(result.response.response).toEqual({ delivered: true });
	});

	test("should stop after the configured retries when every attempt fails", async () => {
		const provider = {
			name: "mock",
			capabilities: [AirhornSendType.SMS],
			send: vi
				.fn()
				.mockResolvedValueOnce(failureResult("fail 1"))
				.mockResolvedValueOnce(failureResult("fail 2"))
				.mockResolvedValueOnce(failureResult("fail 3")),
		};
		const airhorn = createAirhorn([provider]);

		const result = await airhorn.send(
			"+1234567890",
			template,
			{},
			AirhornSendType.SMS,
			{ retries: 2 },
		);

		expect(provider.send).toHaveBeenCalledTimes(3);
		expect(result.success).toBe(false);
		expect(result.retries).toBe(2);
		expect(result.response.errors[0].message).toBe("fail 3");
	});

	test("should retry thrown errors and record only the last failure", async () => {
		const provider = {
			name: "mock",
			capabilities: [AirhornSendType.SMS],
			send: vi
				.fn()
				.mockRejectedValueOnce(new Error("first"))
				.mockRejectedValueOnce(new Error("second"))
				.mockRejectedValueOnce(new Error("last")),
		};
		const airhorn = createAirhorn([provider]);

		const result = await airhorn.send(
			"+1234567890",
			template,
			{},
			AirhornSendType.SMS,
			{ retries: 2 },
		);

		expect(provider.send).toHaveBeenCalledTimes(3);
		expect(result.success).toBe(false);
		expect(result.retries).toBe(2);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].error.message).toBe("last");
	});

	test("should retry a thrown error and then succeed", async () => {
		const provider = {
			name: "mock",
			capabilities: [AirhornSendType.Email],
			send: vi
				.fn()
				.mockRejectedValueOnce(new Error("temporary"))
				.mockResolvedValueOnce(successResult()),
		};
		const airhorn = createAirhorn([provider]);

		const result = await airhorn.sendEmail(
			"user@example.com",
			template,
			{},
			{
				retries: 1,
			},
		);

		expect(provider.send).toHaveBeenCalledTimes(2);
		expect(result.success).toBe(true);
		expect(result.retries).toBe(1);
		expect(result.errors).toEqual([]);
	});

	test.each([
		{ retries: 1.9, calls: 2, performed: 1 },
		{ retries: -3, calls: 1, performed: 0 },
		{ retries: Number.NaN, calls: 1, performed: 0 },
		{ retries: Number.POSITIVE_INFINITY, calls: 1, performed: 0 },
	])(
		"should make $calls attempts when retries is $retries",
		async ({ retries, calls, performed }) => {
			const provider = {
				name: "mock",
				capabilities: [AirhornSendType.SMS],
				send: vi.fn().mockResolvedValue(failureResult("failed")),
			};
			const airhorn = createAirhorn([provider]);

			const result = await airhorn.send(
				"+1",
				template,
				{},
				AirhornSendType.SMS,
				{ retries },
			);

			expect(provider.send).toHaveBeenCalledTimes(calls);
			expect(result.retries).toBe(performed);
			expect(result.success).toBe(false);
		},
	);

	test("should exhaust retries on a provider before failing over", async () => {
		const primary = {
			name: "primary",
			capabilities: [AirhornSendType.SMS],
			send: vi
				.fn()
				.mockResolvedValueOnce(failureResult("primary 1"))
				.mockResolvedValueOnce(failureResult("primary 2")),
		};
		const secondary = {
			name: "secondary",
			capabilities: [AirhornSendType.SMS],
			send: vi.fn().mockResolvedValue(successResult({ provider: "secondary" })),
		};
		const airhorn = createAirhorn([primary, secondary]);

		const result = await airhorn.sendFailOver(
			"+1234567890",
			template,
			{},
			AirhornSendType.SMS,
			{ retries: 1 },
		);

		expect(primary.send).toHaveBeenCalledTimes(2);
		expect(secondary.send).toHaveBeenCalledTimes(1);
		expect(result.success).toBe(true);
		expect(result.retries).toBe(1);
		expect(result.providers).toEqual([secondary]);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].error.message).toBe("primary 2");
		expect(result.errors[0].provider).toBe(primary);
	});

	test("should sum retries across providers when sending to all", async () => {
		const first = {
			name: "first",
			capabilities: [AirhornSendType.MobilePush],
			send: vi
				.fn()
				.mockResolvedValueOnce(failureResult("first"))
				.mockResolvedValueOnce(successResult()),
		};
		const second = {
			name: "second",
			capabilities: [AirhornSendType.MobilePush],
			send: vi
				.fn()
				.mockRejectedValueOnce(new Error("second"))
				.mockRejectedValueOnce(new Error("second again"))
				.mockResolvedValueOnce(successResult()),
		};
		const airhorn = createAirhorn([first, second]);

		const result = await airhorn.sendMobilePush(
			"device-token",
			template,
			{},
			{
				retries: 2,
				sendStrategy: AirhornSendStrategy.All,
			},
		);

		expect(first.send).toHaveBeenCalledTimes(2);
		expect(second.send).toHaveBeenCalledTimes(3);
		expect(result.success).toBe(true);
		expect(result.retries).toBe(3);
		expect(result.errors).toEqual([]);
	});

	test("should use a retry function as the limit for one provider", async () => {
		const provider = {
			name: "mock",
			capabilities: [AirhornSendType.SMS],
			send: vi
				.fn()
				.mockResolvedValueOnce(failureResult("fail 1"))
				.mockResolvedValueOnce(failureResult("fail 2"))
				.mockResolvedValueOnce(successResult()),
		};
		const airhorn = createAirhorn([provider]);
		const retries = vi.fn().mockReturnValue(2);

		const result = await airhorn.send(
			"+1234567890",
			template,
			{},
			AirhornSendType.SMS,
			{ retries },
		);

		expect(provider.send).toHaveBeenCalledTimes(3);
		expect(retries).toHaveBeenCalledTimes(1);
		expect(retries).toHaveBeenCalledWith(
			expect.objectContaining({ to: "+1234567890", content: "Hello" }),
			provider,
			airhorn,
		);
		expect(result.success).toBe(true);
		expect(result.retries).toBe(2);
	});

	test("should not call a retry function when the first attempt succeeds", async () => {
		const provider = {
			name: "mock",
			capabilities: [AirhornSendType.SMS],
			send: vi.fn().mockResolvedValue(successResult()),
		};
		const airhorn = createAirhorn([provider]);
		const retries = vi.fn().mockReturnValue(4);

		const result = await airhorn.send(
			"+1234567890",
			template,
			{},
			AirhornSendType.SMS,
			{ retries },
		);

		expect(provider.send).toHaveBeenCalledTimes(1);
		expect(retries).not.toHaveBeenCalled();
		expect(result.success).toBe(true);
		expect(result.retries).toBe(0);
	});

	test("should normalize the number that a retry function returns", async () => {
		const provider = {
			name: "mock",
			capabilities: [AirhornSendType.SMS],
			send: vi.fn().mockResolvedValue(failureResult("failed")),
		};
		const airhorn = createAirhorn([provider]);

		const result = await airhorn.send("+1", template, {}, AirhornSendType.SMS, {
			retries: () => 1.9,
		});

		expect(provider.send).toHaveBeenCalledTimes(2);
		expect(result.retries).toBe(1);
		expect(result.success).toBe(false);
	});

	test("should call the retry function once for each failed provider", async () => {
		const primary = {
			name: "primary",
			capabilities: [AirhornSendType.SMS],
			send: vi.fn().mockResolvedValue(failureResult("primary")),
		};
		const secondary = {
			name: "secondary",
			capabilities: [AirhornSendType.SMS],
			send: vi.fn().mockResolvedValue(failureResult("secondary")),
		};
		const airhorn = createAirhorn([primary, secondary]);
		const retries = vi.fn().mockReturnValue(0);

		const result = await airhorn.sendFailOver(
			"+1234567890",
			template,
			{},
			AirhornSendType.SMS,
			{ retries },
		);

		expect(primary.send).toHaveBeenCalledTimes(1);
		expect(secondary.send).toHaveBeenCalledTimes(1);
		expect(retries).toHaveBeenCalledTimes(2);
		expect(retries).toHaveBeenNthCalledWith(
			1,
			expect.any(Object),
			primary,
			airhorn,
		);
		expect(retries).toHaveBeenNthCalledWith(
			2,
			expect.any(Object),
			secondary,
			airhorn,
		);
		expect(result.success).toBe(false);
		expect(result.retries).toBe(0);
	});
});
