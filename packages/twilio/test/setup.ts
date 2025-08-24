import { vi } from "vitest";

// Create mock functions
const mockTwilioCreate = vi.fn();
const mockSgSend = vi.fn();
const mockSgSetApiKey = vi.fn();

// Mock Twilio constructor
const TwilioMock = vi.fn().mockImplementation(() => ({
	messages: {
		create: mockTwilioCreate,
	},
}));

// Mock SendGrid
const sgMail = {
	setApiKey: mockSgSetApiKey,
	send: mockSgSend,
};

// Mock the modules
vi.mock("twilio", () => ({
	default: TwilioMock,
	Twilio: TwilioMock,
}));

vi.mock("@sendgrid/mail", () => ({
	default: sgMail,
	setApiKey: mockSgSetApiKey,
	send: mockSgSend,
}));

// Export for tests to use
export { mockTwilioCreate, mockSgSend, mockSgSetApiKey };
