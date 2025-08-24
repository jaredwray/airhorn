import { vi } from "vitest";

// Mock Email Client
export const mockEmailBeginSend = vi.fn();
export const mockEmailClient = vi.fn(() => ({
	beginSend: mockEmailBeginSend,
}));

vi.mock("@azure/communication-email", () => ({
	EmailClient: mockEmailClient,
}));

// Mock SMS Client
export const mockSmsSend = vi.fn();
export const mockSmsClient = vi.fn(() => ({
	send: mockSmsSend,
}));

vi.mock("@azure/communication-sms", () => ({
	SmsClient: mockSmsClient,
}));

// Mock Notification Hubs Client
export const mockNotificationSend = vi.fn();
export const mockNotificationHubsClient = vi.fn(() => ({
	sendNotification: mockNotificationSend,
}));

vi.mock("@azure/notification-hubs", () => ({
	NotificationHubsClient: mockNotificationHubsClient,
	createAppleNotification: vi.fn((options) => ({
		...options,
		platform: "apple",
	})),
	createFcmLegacyNotification: vi.fn((options) => ({
		...options,
		platform: "fcm",
	})),
}));
