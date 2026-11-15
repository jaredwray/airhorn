// The consumer check (scripts/consumer-check.ts) runs this file with plain
// Node.js. The file uses the published package and the real Twilio and
// SendGrid packages. It makes no network request.
import { AirhornTwilio } from "@airhornjs/twilio";

const provider = new AirhornTwilio({
	accountSid: `AC${"0".repeat(32)}`,
	authToken: "consumer-check-token",
	sendGridApiKey: "SG.consumer-check-key",
});

if (provider.name !== "twilio") {
	throw new Error(`The provider name is not correct: ${provider.name}`);
}
