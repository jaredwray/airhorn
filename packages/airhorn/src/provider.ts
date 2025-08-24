import type { AirhornSendType } from "./index.js";

export type AirhornProviderMessage = {
	to: string;
	from: string;
	subject?: string;
	content: string;
	type: AirhornSendType;
};

export type AirhornProviderSendResult = {
	success: boolean;
	// biome-ignore lint/suspicious/noExplicitAny: response can be any shape
	response: any;
	errors: Array<Error>;
};

export interface AirhornProvider {
	name: string;
	capabilities: Array<AirhornSendType>;
	send: (
		message: AirhornProviderMessage,
		// biome-ignore lint/suspicious/noExplicitAny: any options
		options?: any,
	) => Promise<AirhornProviderSendResult>;
}
