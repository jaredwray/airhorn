// biome-ignore-all lint/suspicious/noExplicitAny: test file
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TwilioProvider } from "../src/index.js";

vi.mock("twilio", () => {
	const mockCreate = vi.fn();
	return {
		Twilio: vi.fn().mockImplementation(() => ({
			messages: {
				create: mockCreate,
			},
		})),
		mockCreate,
	};
});

describe("TwilioProvider", () => {
	let provider: TwilioProvider;
	const mockOptions = {
		accountSid: "AC1234567890",
		authToken: "test-auth-token",
		fromPhoneNumber: "+1234567890",
	};

	beforeEach(() => {
		vi.clearAllMocks();
		provider = new TwilioProvider(mockOptions);
	});

	describe("constructor", () => {
		it("should create instance with valid options", () => {
			expect(provider).toBeDefined();
			expect(provider.name).toBe("twilio");
			expect(provider.capabilities).toEqual(["sms"]);
		});

		it("should throw error when accountSid is missing", () => {
			expect(() => {
				new TwilioProvider({
					accountSid: "",
					authToken: "token",
				});
			}).toThrowError("TwilioProvider requires accountSid and authToken");
		});

		it("should throw error when authToken is missing", () => {
			expect(() => {
				new TwilioProvider({
					accountSid: "AC123",
					authToken: "",
				});
			}).toThrowError("TwilioProvider requires accountSid and authToken");
		});

		it("should accept optional region and edge", () => {
			const providerWithRegion = new TwilioProvider({
				...mockOptions,
				region: "sydney",
				edge: "sydney",
			});
			expect(providerWithRegion).toBeDefined();
		});
	});

	describe("send", () => {
		const mockMessage = {
			to: "+0987654321",
			from: "+1234567890",
			content: "Test SMS message",
			type: "sms" as any,
			template: {} as any,
		};

		it("should send SMS successfully", async () => {
			const { mockCreate } = (await import("twilio")) as any;
			mockCreate.mockResolvedValueOnce({
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
			expect(mockCreate).toHaveBeenCalledWith({
				body: mockMessage.content,
				from: mockMessage.from,
				to: mockMessage.to,
			});
		});

		it("should use default from number when not in message", async () => {
			const { mockCreate } = (await import("twilio")) as any;
			mockCreate.mockResolvedValueOnce({
				sid: "SM456",
				status: "sent",
				to: mockMessage.to,
				from: mockOptions.fromPhoneNumber,
				body: mockMessage.content,
			});

			const messageWithoutFrom = { ...mockMessage, from: "" };
			const result = await provider.send(messageWithoutFrom);

			expect(result.success).toBe(true);
			expect(mockCreate).toHaveBeenCalledWith({
				body: mockMessage.content,
				from: mockOptions.fromPhoneNumber,
				to: mockMessage.to,
			});
		});

		it("should handle send errors", async () => {
			const { mockCreate } = (await import("twilio")) as any;
			const errorMessage = "Invalid phone number";
			mockCreate.mockRejectedValueOnce(new Error(errorMessage));

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe(errorMessage);
			expect(result.response).toHaveProperty("error", errorMessage);
		});

		it("should reject non-SMS message types", async () => {
			const emailMessage = {
				...mockMessage,
				type: "email" as any,
			};

			const result = await provider.send(emailMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain(
				"TwilioProvider only supports SMS",
			);
		});

		it("should require from phone number", async () => {
			const providerWithoutFrom = new TwilioProvider({
				accountSid: "AC123",
				authToken: "token",
			});

			const messageWithoutFrom = { ...mockMessage, from: "" };
			const result = await providerWithoutFrom.send(messageWithoutFrom);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toContain(
				"From phone number is required",
			);
		});

		it("should pass additional options to Twilio", async () => {
			const { mockCreate } = (await import("twilio")) as any;
			mockCreate.mockResolvedValueOnce({
				sid: "SM789",
				status: "sent",
			});

			const additionalOptions = {
				statusCallback: "https://example.com/callback",
				maxPrice: "0.50",
			};

			await provider.send(mockMessage, additionalOptions);

			expect(mockCreate).toHaveBeenCalledWith({
				body: mockMessage.content,
				from: mockMessage.from,
				to: mockMessage.to,
				...additionalOptions,
			});
		});

		it("should handle non-Error exceptions", async () => {
			const { mockCreate } = (await import("twilio")) as any;
			mockCreate.mockRejectedValueOnce("String error");

			const result = await provider.send(mockMessage);

			expect(result.success).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].message).toBe("String error");
		});
	});
});
