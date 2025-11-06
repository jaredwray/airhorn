import { vi } from "vitest";

// Mock Email Client
export const mockEmailBeginSend = vi.fn();
export const mockEmailClient = vi.fn(function EmailClient() {
	return {
		beginSend: mockEmailBeginSend,
	};
});

vi.mock("@azure/communication-email", () => ({
	EmailClient: mockEmailClient,
}));

// Mock SMS Client
export const mockSmsSend = vi.fn();
export const mockSmsClient = vi.fn(function SmsClient() {
	return {
		send: mockSmsSend,
	};
});

vi.mock("@azure/communication-sms", () => ({
	SmsClient: mockSmsClient,
}));

// Mock Notification Hubs Client
export const mockNotificationSend = vi.fn();
export const mockNotificationHubsClient = vi.fn(
	function NotificationHubsClient() {
		return {
			sendNotification: mockNotificationSend,
		};
	},
);

export const mockCreateAppleNotification = vi.fn(
	function createAppleNotification(options) {
		return {
			...options,
			platform: "apple",
		};
	},
);

export const mockCreateFcmLegacyNotification = vi.fn(
	function createFcmLegacyNotification(options) {
		return {
			...options,
			platform: "fcm",
		};
	},
);

vi.mock("@azure/notification-hubs", () => ({
	NotificationHubsClient: mockNotificationHubsClient,
	createAppleNotification: mockCreateAppleNotification,
	createFcmLegacyNotification: mockCreateFcmLegacyNotification,
}));
