// biome-ignore-all lint/suspicious/noExplicitAny: test file
import { beforeEach, describe, expect, test, vi } from "vitest";
import {
	Airhorn,
	AirhornHook,
	AirhornSendStrategy,
	AirhornSendType,
} from "../src/index.js";
import type { AirhornProviderMessage } from "../src/provider.js";
import type { AirhornTemplate } from "../src/template.js";
import { AirhornWebhookProvider } from "../src/webhook.js";

describe("Airhorn Hooks", () => {
	let airhorn: Airhorn;
	const mockFetch = vi.fn();

	beforeEach(() => {
		airhorn = new Airhorn();
		vi.clearAllMocks();
		global.fetch = mockFetch;
	});

	describe("BeforeSend Hook", () => {
		test("should call BeforeSend hook with message and options", async () => {
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

			// Add BeforeSend hook
			const beforeSendSpy = vi.fn();
			airhorn.addHook(AirhornHook.BeforeSend, beforeSendSpy);

			// Send webhook
			await airhorn.send(
				webhookUrl,
				template,
				{ name: "World" },
				AirhornSendType.Webhook,
			);

			// Verify hook was called
			expect(beforeSendSpy).toHaveBeenCalledTimes(1);
			expect(beforeSendSpy).toHaveBeenCalledWith({
				message: expect.objectContaining({
					to: webhookUrl,
					from: "test@example.com",
					subject: "Test Subject",
					content: "Hello World!",
					type: AirhornSendType.Webhook,
				}),
				options: undefined,
			});
		});

		test("should allow BeforeSend hook to modify message content", async () => {
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

			// Add BeforeSend hook that modifies message
			airhorn.addHook(
				AirhornHook.BeforeSend,
				({ message }: { message: AirhornProviderMessage }) => {
					message.content = `[MODIFIED] ${message.content}`;
				},
			);

			// Send webhook
			await airhorn.send(
				webhookUrl,
				template,
				{ name: "World" },
				AirhornSendType.Webhook,
			);

			// Verify the modified content was sent
			expect(mockFetch).toHaveBeenCalledWith(
				webhookUrl,
				expect.objectContaining({
					body: expect.stringContaining("[MODIFIED] Hello World!"),
				}),
			);
		});

		test("should allow BeforeSend hook to modify message recipient", async () => {
			const originalUrl = "https://api.example.com/webhook";
			const newUrl = "https://api.example.com/new-webhook";

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

			// Add BeforeSend hook that modifies recipient
			airhorn.addHook(
				AirhornHook.BeforeSend,
				({ message }: { message: AirhornProviderMessage }) => {
					message.to = newUrl;
				},
			);

			// Send webhook
			await airhorn.send(
				originalUrl,
				template,
				{ name: "World" },
				AirhornSendType.Webhook,
			);

			// Verify the new URL was used
			expect(mockFetch).toHaveBeenCalledWith(newUrl, expect.any(Object));
		});

		test("should call multiple BeforeSend hooks in registration order", async () => {
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
				content: "Original",
			};

			const hook1 = vi.fn(
				({ message }: { message: AirhornProviderMessage }) => {
					message.content = `${message.content}-Hook1`;
				},
			);
			const hook2 = vi.fn(
				({ message }: { message: AirhornProviderMessage }) => {
					message.content = `${message.content}-Hook2`;
				},
			);
			const hook3 = vi.fn(
				({ message }: { message: AirhornProviderMessage }) => {
					message.content = `${message.content}-Hook3`;
				},
			);

			airhorn.addHook(AirhornHook.BeforeSend, hook1);
			airhorn.addHook(AirhornHook.BeforeSend, hook2);
			airhorn.addHook(AirhornHook.BeforeSend, hook3);

			// Send webhook
			await airhorn.send(webhookUrl, template, {}, AirhornSendType.Webhook);

			// Verify hooks were called in order
			expect(hook1).toHaveBeenCalledTimes(1);
			expect(hook2).toHaveBeenCalledTimes(1);
			expect(hook3).toHaveBeenCalledTimes(1);

			// Verify final content has all modifications in order
			expect(mockFetch).toHaveBeenCalledWith(
				webhookUrl,
				expect.objectContaining({
					body: expect.stringContaining("Original-Hook1-Hook2-Hook3"),
				}),
			);
		});

		test("should pass options to BeforeSend hook when provided", async () => {
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

			// Add BeforeSend hook
			const beforeSendSpy = vi.fn();
			airhorn.addHook(AirhornHook.BeforeSend, beforeSendSpy);

			const options = {
				sendStrategy: AirhornSendStrategy.FailOver,
				retries: 3,
			};

			// Send webhook with options
			await airhorn.send(
				webhookUrl,
				template,
				{ name: "World" },
				AirhornSendType.Webhook,
				options,
			);

			// Verify hook received options
			expect(beforeSendSpy).toHaveBeenCalledWith({
				message: expect.any(Object),
				options: expect.objectContaining({
					sendStrategy: AirhornSendStrategy.FailOver,
					retries: 3,
				}),
			});
		});
	});

	describe("AfterSend Hook", () => {
		test("should call AfterSend hook with result", async () => {
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

			// Add AfterSend hook
			const afterSendSpy = vi.fn();
			airhorn.addHook(AirhornHook.AfterSend, afterSendSpy);

			// Send webhook
			await airhorn.send(
				webhookUrl,
				template,
				{ name: "World" },
				AirhornSendType.Webhook,
			);

			// Verify hook was called
			expect(afterSendSpy).toHaveBeenCalledTimes(1);
			expect(afterSendSpy).toHaveBeenCalledWith({
				result: expect.objectContaining({
					success: true,
					providers: expect.any(Array),
					message: expect.any(Object),
					response: expect.any(Object),
					errors: expect.any(Array),
					retries: expect.any(Number),
				}),
			});
		});

		test("should allow AfterSend hook to modify result", async () => {
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

			// Add AfterSend hook that adds metadata
			airhorn.addHook(AirhornHook.AfterSend, ({ result }: any) => {
				result.metadata = { processed: true, timestamp: Date.now() };
			});

			// Send webhook
			const result = await airhorn.send(
				webhookUrl,
				template,
				{ name: "World" },
				AirhornSendType.Webhook,
			);

			// Verify result was modified
			expect(result).toHaveProperty("metadata");
			expect(result.metadata).toHaveProperty("processed", true);
			expect(result.metadata).toHaveProperty("timestamp");
		});

		test("should call multiple AfterSend hooks in registration order", async () => {
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
				content: "Hello",
			};

			const hook1 = vi.fn();
			const hook2 = vi.fn();
			const hook3 = vi.fn();

			airhorn.addHook(AirhornHook.AfterSend, hook1);
			airhorn.addHook(AirhornHook.AfterSend, hook2);
			airhorn.addHook(AirhornHook.AfterSend, hook3);

			// Send webhook
			await airhorn.send(webhookUrl, template, {}, AirhornSendType.Webhook);

			// Verify hooks were called in order
			expect(hook1).toHaveBeenCalledTimes(1);
			expect(hook2).toHaveBeenCalledTimes(1);
			expect(hook3).toHaveBeenCalledTimes(1);
		});

		test("should call AfterSend hook even on failure", async () => {
			const webhookUrl = "https://api.example.com/webhook";

			// Mock failed webhook response
			const mockResponse = {
				ok: false,
				status: 500,
				statusText: "Internal Server Error",
				json: vi.fn().mockResolvedValue({ error: "Server error" }),
				headers: new Headers({ "content-type": "application/json" }),
			};
			mockFetch.mockResolvedValueOnce(mockResponse);

			// Create template
			const template: AirhornTemplate = {
				from: "test@example.com",
				subject: "Test Subject",
				content: "Hello",
			};

			// Add AfterSend hook
			const afterSendSpy = vi.fn();
			airhorn.addHook(AirhornHook.AfterSend, afterSendSpy);

			// Send webhook (should fail)
			await airhorn.send(webhookUrl, template, {}, AirhornSendType.Webhook);

			// Verify hook was called even on failure
			expect(afterSendSpy).toHaveBeenCalledTimes(1);
			expect(afterSendSpy).toHaveBeenCalledWith({
				result: expect.objectContaining({
					success: false,
					errors: expect.any(Array),
				}),
			});
		});
	});

	describe("Both Hooks Together", () => {
		test("should call both BeforeSend and AfterSend hooks", async () => {
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
				content: "Hello",
			};

			const beforeSendSpy = vi.fn();
			const afterSendSpy = vi.fn();

			airhorn.addHook(AirhornHook.BeforeSend, beforeSendSpy);
			airhorn.addHook(AirhornHook.AfterSend, afterSendSpy);

			// Send webhook
			await airhorn.send(webhookUrl, template, {}, AirhornSendType.Webhook);

			// Verify both hooks were called
			expect(beforeSendSpy).toHaveBeenCalledTimes(1);
			expect(afterSendSpy).toHaveBeenCalledTimes(1);
		});

		test("should allow BeforeSend to modify message that AfterSend can see", async () => {
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
				content: "Original",
			};

			const modifiedContent = "Modified by BeforeSend";

			airhorn.addHook(
				AirhornHook.BeforeSend,
				({ message }: { message: AirhornProviderMessage }) => {
					message.content = modifiedContent;
				},
			);

			const afterSendSpy = vi.fn();
			airhorn.addHook(AirhornHook.AfterSend, afterSendSpy);

			// Send webhook
			await airhorn.send(webhookUrl, template, {}, AirhornSendType.Webhook);

			// Verify AfterSend sees the modified content
			expect(afterSendSpy).toHaveBeenCalledWith({
				result: expect.objectContaining({
					message: expect.objectContaining({
						content: modifiedContent,
					}),
				}),
			});
		});
	});

	describe("Hook Error Handling", () => {
		test("should handle errors in BeforeSend hook when throwOnErrors is false", async () => {
			const airhornNoThrow = new Airhorn({ throwOnErrors: false });

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
				content: "Hello",
			};

			// Add BeforeSend hook that throws
			airhornNoThrow.addHook(AirhornHook.BeforeSend, () => {
				throw new Error("Hook error");
			});

			// Should not throw
			await expect(
				airhornNoThrow.send(webhookUrl, template, {}, AirhornSendType.Webhook),
			).resolves.toBeDefined();
		});

		test("should throw errors in BeforeSend hook when throwOnErrors is true", async () => {
			const airhornThrow = new Airhorn({ throwOnErrors: true });

			const webhookUrl = "https://api.example.com/webhook";

			// Create template
			const template: AirhornTemplate = {
				from: "test@example.com",
				subject: "Test Subject",
				content: "Hello",
			};

			// Add BeforeSend hook that throws
			airhornThrow.addHook(AirhornHook.BeforeSend, () => {
				throw new Error("Hook error");
			});

			// Should throw
			await expect(
				airhornThrow.send(webhookUrl, template, {}, AirhornSendType.Webhook),
			).rejects.toThrow("Hook error");
		});
	});

	describe("Hooks with Different Send Strategies", () => {
		test("should call hooks with FailOver strategy", async () => {
			const webhookUrl1 = "https://api1.example.com/webhook";

			// Add two webhook providers
			const provider1 = new AirhornWebhookProvider();
			const provider2 = new AirhornWebhookProvider();
			airhorn.addProvider(provider1);
			airhorn.addProvider(provider2);

			// Mock first provider to fail, second to succeed
			mockFetch
				.mockResolvedValueOnce({
					ok: false,
					status: 500,
					statusText: "Error",
					json: vi.fn().mockResolvedValue({}),
					headers: new Headers(),
				})
				.mockResolvedValueOnce({
					ok: true,
					status: 200,
					statusText: "OK",
					json: vi.fn().mockResolvedValue({ success: true }),
					headers: new Headers({ "content-type": "application/json" }),
				});

			const template: AirhornTemplate = {
				from: "test@example.com",
				content: "Test",
			};

			const beforeSendSpy = vi.fn();
			const afterSendSpy = vi.fn();

			airhorn.addHook(AirhornHook.BeforeSend, beforeSendSpy);
			airhorn.addHook(AirhornHook.AfterSend, afterSendSpy);

			await airhorn.send(webhookUrl1, template, {}, AirhornSendType.Webhook, {
				sendStrategy: AirhornSendStrategy.FailOver,
			});

			// Hooks should be called once per send() call, not per provider attempt
			expect(beforeSendSpy).toHaveBeenCalledTimes(1);
			expect(afterSendSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe("Hooks with Convenience Methods", () => {
		test("should call hooks when using sendWebhook", async () => {
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

			const beforeSendSpy = vi.fn();
			const afterSendSpy = vi.fn();

			airhorn.addHook(AirhornHook.BeforeSend, beforeSendSpy);
			airhorn.addHook(AirhornHook.AfterSend, afterSendSpy);

			// Use convenience method
			await airhorn.sendWebhook(webhookUrl, "test@example.com", "Hello");

			// Verify hooks were called
			expect(beforeSendSpy).toHaveBeenCalledTimes(1);
			expect(afterSendSpy).toHaveBeenCalledTimes(1);
		});
	});
});
