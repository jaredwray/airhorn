import { vi } from "vitest";

// Mock SNS Client
export const mockSnsPublish = vi.fn();
export const mockSnsClient = vi.fn(() => ({
	send: mockSnsPublish,
}));

vi.mock("@aws-sdk/client-sns", () => ({
	SNSClient: mockSnsClient,
	PublishCommand: vi.fn((params) => params),
}));

// Mock SES Client
export const mockSesSend = vi.fn();
export const mockSesClient = vi.fn(() => ({
	send: mockSesSend,
}));

vi.mock("@aws-sdk/client-ses", () => ({
	SESClient: mockSesClient,
	SendEmailCommand: vi.fn((params) => params),
}));
