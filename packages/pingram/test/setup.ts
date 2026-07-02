import { vi } from "vitest";

// Mock Pingram Client
export const mockPingramSend = vi.fn();
export const mockPingramClient = vi.fn(function Pingram() {
	return {
		send: mockPingramSend,
	};
});

vi.mock("pingram", () => ({
	Pingram: mockPingramClient,
	ChannelsEnum: {
		EMAIL: "EMAIL",
		INAPP_WEB: "INAPP_WEB",
		SMS: "SMS",
		CALL: "CALL",
		PUSH: "PUSH",
		WEB_PUSH: "WEB_PUSH",
		SLACK: "SLACK",
	},
}));
