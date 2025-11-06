import { vi } from "vitest";

// Mock SNS Client
export const mockSnsPublish = vi.fn();
export const mockSnsClient = vi.fn(function SNSClient() {
	return {
		send: mockSnsPublish,
	};
});

export const MockPublishCommand = vi.fn(function PublishCommand(params) {
	return params;
});

vi.mock("@aws-sdk/client-sns", () => ({
	SNSClient: mockSnsClient,
	PublishCommand: MockPublishCommand,
}));

// Mock SES Client
export const mockSesSend = vi.fn();
export const mockSesClient = vi.fn(function SESClient() {
	return {
		send: mockSesSend,
	};
});

export const MockSendEmailCommand = vi.fn(function SendEmailCommand(params) {
	return params;
});

vi.mock("@aws-sdk/client-ses", () => ({
	SESClient: mockSesClient,
	SendEmailCommand: MockSendEmailCommand,
}));
