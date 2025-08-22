import { describe, test, expect, vi, beforeEach } from "vitest";
import { Airhorn } from "../src/index.js";
import type { AirhornTemplate } from "../src/template.js";

describe("AirhornSendOptions is optional", () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		global.fetch = mockFetch;
	});

	test("can call send without options parameter", async () => {
		const airhorn = new Airhorn();
		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test content",
		};

		// Mock successful response
		mockFetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			statusText: "OK",
			json: vi.fn().mockResolvedValue({ success: true }),
			headers: new Headers(),
		});

		// Call without options - should work
		const result = await airhorn.sendWebhook(
			"https://example.com/webhook",
			template,
			{}
		);

		expect(result).toBeDefined();
		expect(mockFetch).toHaveBeenCalled();
	});

	test("can call sendEmail without options parameter", async () => {
		const airhorn = new Airhorn();
		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test email content",
		};

		// Since there's no email provider by default, it will fail but that's ok
		// We're just testing that the function can be called without options
		const result = await airhorn.sendEmail(
			"recipient@example.com",
			template,
			{ name: "John" }
		);

		expect(result).toBeDefined();
		expect(result.success).toBe(false);
		expect(result.errors[0].message).toContain("No providers available");
	});

	test("can call sendSMS without options parameter", async () => {
		const airhorn = new Airhorn();
		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test SMS content",
		};

		const result = await airhorn.sendSMS(
			"+1234567890",
			template,
			{ name: "John" }
		);

		expect(result).toBeDefined();
		expect(result.success).toBe(false);
		expect(result.errors[0].message).toContain("No providers available");
	});

	test("can call sendMobilePush without options parameter", async () => {
		const airhorn = new Airhorn();
		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test push notification",
		};

		const result = await airhorn.sendMobilePush(
			"device-token",
			template,
			{ message: "Hello" }
		);

		expect(result).toBeDefined();
		expect(result.success).toBe(false);
		expect(result.errors[0].message).toContain("No providers available");
	});

	test("can still call send methods with options parameter", async () => {
		const airhorn = new Airhorn();
		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test content",
		};

		// Mock successful response
		mockFetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			statusText: "OK",
			json: vi.fn().mockResolvedValue({ success: true }),
			headers: new Headers(),
		});

		// Call WITH options - should also work
		const result = await airhorn.sendWebhook(
			"https://example.com/webhook",
			template,
			{},
			{ throwOnErrors: false, timeout: 5000 }
		);

		expect(result).toBeDefined();
		expect(mockFetch).toHaveBeenCalled();
	});
});