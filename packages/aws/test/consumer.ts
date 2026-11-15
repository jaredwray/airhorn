// The consumer check (scripts/consumer-check.ts) runs this file with plain
// Node.js. The file uses the published package and the real AWS packages.
// It makes no network request.
import { AirhornAws } from "@airhornjs/aws";

const provider = new AirhornAws({
	region: "us-east-1",
	accessKeyId: "consumer-check-key",
	secretAccessKey: "consumer-check-secret",
});

if (provider.name !== "aws") {
	throw new Error(`The provider name is not correct: ${provider.name}`);
}
