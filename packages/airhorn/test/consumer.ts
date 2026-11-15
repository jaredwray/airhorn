// The consumer check (scripts/consumer-check.ts) runs this file with plain
// Node.js. The file uses the published package and its real dependencies.
import {
	Airhorn,
	type AirhornProvider,
	type AirhornProviderMessage,
	AirhornSendType,
} from "airhorn";

const messages: AirhornProviderMessage[] = [];
const provider: AirhornProvider = {
	name: "consumer",
	capabilities: [AirhornSendType.SMS],
	send: async (message) => {
		messages.push(message);
		return { success: true, response: {}, errors: [] };
	},
};

const airhorn = new Airhorn({
	useWebhookProvider: false,
	providers: [provider],
});
const result = await airhorn.send(
	"+15555550100",
	{ from: "+15555550101", content: "Hello <%= name %>" },
	{ name: "consumer" },
	AirhornSendType.SMS,
);

if (!result.success || messages[0]?.content !== "Hello consumer") {
	throw new Error(
		`Airhorn did not send the template: ${JSON.stringify(result)}`,
	);
}
