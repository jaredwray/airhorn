// The consumer check (scripts/consumer-check.ts) runs this file with plain
// Node.js. The file uses the published package and the real Azure packages.
// It makes no network request.
import { AirhornAzure } from "@airhornjs/azure";

const provider = new AirhornAzure({
	connectionString:
		"endpoint=https://consumer-check.communication.azure.com/;accesskey=Y29uc3VtZXI=",
	notificationHubConnectionString:
		"Endpoint=sb://consumer-check.servicebus.windows.net/;SharedAccessKeyName=consumer;SharedAccessKey=Y29uc3VtZXI=",
	notificationHubName: "consumer-check",
});

if (provider.name !== "azure") {
	throw new Error(`The provider name is not correct: ${provider.name}`);
}
