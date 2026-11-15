// The consumer check (scripts/consumer-check.ts) runs this file with plain
// Node.js. The file uses the published package and the real Pingram package.
// It makes no network request.
import { AirhornPingram } from "@airhornjs/pingram";

const provider = new AirhornPingram({ apiKey: "pingram_sk_consumer_check" });

if (provider.name !== "pingram") {
	throw new Error(`The provider name is not correct: ${provider.name}`);
}
