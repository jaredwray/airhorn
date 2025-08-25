import { describe, test, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import { Airhorn, AirhornSendStrategy, AirhornSendType } from "../src/index.js";
import { AirhornTemplate } from "../src/template.js";
import { AirhornWebhookProvider } from "../src/webhook.js";
import { Cacheable } from "cacheable";

describe("Airhorn", () => {
	test("should be defined", () => {
		expect(Airhorn).toBeDefined();
	});

	test('should be able to set the cache to true via options', () => {
		const airhorn = new Airhorn({ cache: true });
		expect(airhorn.cache).toBeDefined();
	});

	test('should be able to enable statistics from options', () => {
		const airhorn = new Airhorn({ statistics: true });
		expect(airhorn.statistics.enabled).toBe(true);
	});

	test('should be able to set the providers via options', () => {
		const airhorn = new Airhorn({ providers: [new AirhornWebhookProvider()] });
		// Should have 2 providers: default webhook provider + the one we added
		expect(airhorn.providers).toHaveLength(2);
		expect(airhorn.providers[0]).toBeInstanceOf(AirhornWebhookProvider);
		expect(airhorn.providers[1]).toBeInstanceOf(AirhornWebhookProvider);
		airhorn.providers = [new AirhornWebhookProvider()];
		expect(airhorn.providers).toHaveLength(1);
	});

	test('should be able to disable webhook provider from options', () => {
		const airhorn = new Airhorn({ useWebhookProvider: false });
		expect(airhorn.providers).toHaveLength(0);
	});

	test('should be able to set the sendStrategy from options', () => {
		const airhorn = new Airhorn({ sendStrategy: AirhornSendStrategy.RoundRobin });
		expect(airhorn.sendStrategy).toBe(AirhornSendStrategy.RoundRobin);
		airhorn.sendStrategy = AirhornSendStrategy.All;
		expect(airhorn.sendStrategy).toBe(AirhornSendStrategy.All);
	});

	test('should be able to set the throwOnErrors from options', () => {
		const airhorn = new Airhorn({ throwOnErrors: true });
		expect(airhorn.throwOnErrors).toBe(true);
		airhorn.throwOnErrors = false;
		expect(airhorn.throwOnErrors).toBe(false);
	});

	test('should be able to set the cache property', () => {
		const airhorn = new Airhorn();
		airhorn.cache = new Cacheable();
		expect(airhorn.cache).toBeDefined();
	});

	test('should be able to load a template file', async () => {
		const airhorn = new Airhorn();
		const template = await airhorn.loadTemplate('./test/fixtures/full-template.md');
		expect(template).toBeDefined();
		expect(template.content).toContain('<%= new Date().getFullYear() %> Your Company. All rights reserved.');
		expect(template.subject).toBe('Welcome to Our Service');
		expect(template.from).toBe('me@you.com');
		expect(template.requiredFields).toEqual(['firstName', 'lastName', 'loginUrl']);
		expect(template.templateEngine).toBe('ejs');
	});

	test('should be able to load a template file with missing fields', async () => {
		const airhorn = new Airhorn();
		const template = await airhorn.loadTemplate('./test/fixtures/simple-template.md');
		expect(template).toBeDefined();
		expect(template.content).toContain('<%= new Date().getFullYear() %> Your Company. All rights reserved.');
		expect(template.subject).toBe('Welcome to Our Service');
		expect(template.from).toBe('me@you.com');
		expect(template.requiredFields).toEqual(['firstName']);
		expect(template.templateEngine).toBeUndefined();
	});

	test('should error when template file is missing', async () => {
		const airhorn = new Airhorn({ throwOnErrors: true });
		await expect(airhorn.loadTemplate('./test/fixtures/missing-template.md')).rejects.toThrowError(
			'Template file not found: ./test/fixtures/missing-template.md',
		);
	});
});

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
		expect(result.errors[0].error.message).toContain("No providers available");
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
		expect(result.errors[0].error.message).toContain("No providers available");
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
		expect(result.errors[0].error.message).toContain("No providers available");
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
			{ throwOnErrors: false }
		);

		expect(result).toBeDefined();
		expect(mockFetch).toHaveBeenCalled();
	});

	// Coverage tests for error handling in different strategies
	test("should handle error in RoundRobin strategy when provider throws", async () => {
		const airhorn = new Airhorn();
		// Set RoundRobin strategy
		airhorn.sendStrategy = AirhornSendStrategy.RoundRobin;
		
		// Create a custom provider that throws an error
		const errorProvider = {
			name: "ErrorProvider",
			capabilities: [AirhornSendType.Webhook],
			send: vi.fn().mockRejectedValue(new Error("Provider error"))
		};
		
		airhorn.providers = [errorProvider];

		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test content",
		};

		const result = await airhorn.sendWebhook(
			"https://example.com",
			template,
			{}
		);

		// Should fail but capture the error
		expect(result.success).toBe(false);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].error.message).toBe("Provider error");
		expect(errorProvider.send).toHaveBeenCalled();
	});

	test("should handle non-Error objects thrown in RoundRobin strategy", async () => {
		const airhorn = new Airhorn();
		// Set RoundRobin strategy
		airhorn.sendStrategy = AirhornSendStrategy.RoundRobin;
		
		// Create a custom provider that throws a non-Error object
		const errorProvider = {
			name: "ErrorProvider",
			capabilities: [AirhornSendType.Webhook],
			send: vi.fn().mockRejectedValue("String error")
		};
		
		airhorn.providers = [errorProvider];

		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test content",
		};

		const result = await airhorn.sendWebhook(
			"https://example.com",
			template,
			{}
		);

		// Should fail but capture the error as Error object
		expect(result.success).toBe(false);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].error).toBeInstanceOf(Error);
		expect(result.errors[0].error.message).toBe("String error");
	});

	test("should handle error in FailOver strategy when provider throws", async () => {
		const airhorn = new Airhorn();
		// FailOver is the default strategy
		airhorn.sendStrategy = AirhornSendStrategy.FailOver;
		
		// Create providers where first throws, second succeeds
		const errorProvider = {
			name: "ErrorProvider",
			capabilities: [AirhornSendType.Webhook],
			send: vi.fn().mockRejectedValue(new Error("First provider error"))
		};
		
		const successProvider = {
			name: "SuccessProvider",
			capabilities: [AirhornSendType.Webhook],
			send: vi.fn().mockResolvedValue({
				success: true,
				response: { data: "success" },
				errors: []
			})
		};
		
		airhorn.providers = [errorProvider, successProvider];

		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test content",
		};

		const result = await airhorn.sendWebhook(
			"https://example.com",
			template,
			{}
		);

		// Should succeed with second provider but have error from first
		expect(result.success).toBe(true);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].error.message).toBe("First provider error");
		expect(errorProvider.send).toHaveBeenCalled();
		expect(successProvider.send).toHaveBeenCalled();
	});

	test("should handle non-Error objects thrown in FailOver strategy", async () => {
		const airhorn = new Airhorn();
		// FailOver is the default strategy
		airhorn.sendStrategy = AirhornSendStrategy.FailOver;
		
		// Create providers where both throw non-Error objects
		const errorProvider1 = {
			name: "ErrorProvider1",
			capabilities: [AirhornSendType.Webhook],
			send: vi.fn().mockRejectedValue("String error 1")
		};
		
		const errorProvider2 = {
			name: "ErrorProvider2",
			capabilities: [AirhornSendType.Webhook],
			send: vi.fn().mockRejectedValue({ message: "Object error" })
		};
		
		airhorn.providers = [errorProvider1, errorProvider2];

		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test content",
		};

		const result = await airhorn.sendWebhook(
			"https://example.com",
			template,
			{}
		);

		// Should fail with errors from both providers
		expect(result.success).toBe(false);
		expect(result.errors).toHaveLength(2);
		expect(result.errors[0].error).toBeInstanceOf(Error);
		expect(result.errors[0].error.message).toBe("String error 1");
		expect(result.errors[1].error).toBeInstanceOf(Error);
		expect(result.errors[1].error.message).toBe("[object Object]");
	});

	test("should handle error in All strategy when provider throws", async () => {
		const airhorn = new Airhorn();
		// Set All strategy
		airhorn.sendStrategy = AirhornSendStrategy.All;
		
		// Create multiple providers, one throws an error
		const successProvider = {
			name: "SuccessProvider",
			capabilities: [AirhornSendType.Webhook],
			send: vi.fn().mockResolvedValue({
				success: true,
				response: { data: "success" },
				errors: []
			})
		};
		
		const errorProvider = {
			name: "ErrorProvider",
			capabilities: [AirhornSendType.Webhook],
			send: vi.fn().mockRejectedValue(new Error("Provider error in All strategy"))
		};
		
		airhorn.providers = [successProvider, errorProvider];

		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test content",
		};

		const result = await airhorn.sendWebhook(
			"https://example.com",
			template,
			{}
		);

		// Should succeed overall (because one provider succeeded) but have error from the failing provider
		expect(result.success).toBe(true);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].error.message).toBe("Provider error in All strategy");
		expect(successProvider.send).toHaveBeenCalled();
		expect(errorProvider.send).toHaveBeenCalled();
	});

	test("should handle non-Error objects thrown in All strategy", async () => {
		const airhorn = new Airhorn();
		// Set All strategy
		airhorn.sendStrategy = AirhornSendStrategy.All;
		
		// Create multiple providers, one throws a non-Error object
		const successProvider = {
			name: "SuccessProvider",
			capabilities: [AirhornSendType.Webhook],
			send: vi.fn().mockResolvedValue({
				success: true,
				response: { data: "success" },
				errors: []
			})
		};
		
		const errorProvider = {
			name: "ErrorProvider",
			capabilities: [AirhornSendType.Webhook],
			send: vi.fn().mockRejectedValue("String error in All")
		};
		
		airhorn.providers = [successProvider, errorProvider];

		const template: AirhornTemplate = {
			from: "test@example.com",
			content: "Test content",
		};

		const result = await airhorn.sendWebhook(
			"https://example.com",
			template,
			{}
		);

		// Should succeed overall but have error from the failing provider
		expect(result.success).toBe(true);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].error).toBeInstanceOf(Error);
		expect(result.errors[0].error.message).toBe("String error in All");
		expect(successProvider.send).toHaveBeenCalled();
		expect(errorProvider.send).toHaveBeenCalled();
	});

	test("should handle requiredFields as non-string, non-array value", async () => {
		// Create a template file with requiredFields as a number
		const templatePath = "/tmp/test-template.md";
		const templateContent = `---
from: sender@example.com
subject: Test Subject
requiredFields: 123
---
Test content with <%= name %>`;

		// Mock fs.promises.readFile
		vi.spyOn(fs.promises, "readFile").mockResolvedValue(templateContent);
		vi.spyOn(fs, "existsSync").mockReturnValue(true);

		const airhorn = new Airhorn();
		const template = await airhorn.loadTemplate(templatePath);

		expect(template.requiredFields).toEqual([123]);
		expect(template.from).toBe("sender@example.com");
		expect(template.subject).toBe("Test Subject");
		expect(template.content).toBe("Test content with <%= name %>");
	});

	test("should handle requiredFields as object", async () => {
		// Create a template file with requiredFields as an object
		const templatePath = "/tmp/test-template-obj.md";
		const templateContent = `---
from: sender@example.com
subject: Test Subject
requiredFields:
  field1: value1
  field2: value2
---
Test content`;

		// Mock fs.promises.readFile
		vi.spyOn(fs.promises, "readFile").mockResolvedValue(templateContent);
		vi.spyOn(fs, "existsSync").mockReturnValue(true);

		const airhorn = new Airhorn();
		const template = await airhorn.loadTemplate(templatePath);

		// When requiredFields is an object (not string or array), it should be wrapped in array
		expect(template.requiredFields).toEqual([{ field1: "value1", field2: "value2" }]);
	});
});
