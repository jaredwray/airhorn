import { vi } from "vitest";

// Create mock functions
const mockTwilioCreate = vi.fn();
const mockSgSend = vi.fn();
const mockSgSetApiKey = vi.fn();

// Mock Twilio constructor
const TwilioMock = vi.fn(function Twilio() {
	return {
		messages: {
			create: mockTwilioCreate,
		},
	};
});

// Mock SendGrid
const sgMail = {
	setApiKey: mockSgSetApiKey,
	send: mockSgSend,
};

// Mock the modules. Node gives twilio (CommonJS) to ESM as a default export
// only, so the mock has no named Twilio export.
vi.mock("twilio", () => ({
	default: { Twilio: TwilioMock },
}));

// Node gives @sendgrid/mail (CommonJS) to ESM as a default export only.
vi.mock("@sendgrid/mail", () => ({
	default: sgMail,
}));

// Export for tests to use
export { mockSgSend, mockSgSetApiKey, mockTwilioCreate };
