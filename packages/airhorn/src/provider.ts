import type { AirhornTemplate } from "./template.js";

export enum AirhornProviderType {
	SMS = "sms",
	Email = "email",
	MobilePush = "mobilepush",
	Webhook = "webhook",
}

export type AirhornProviderMessage = {
	type: AirhornProviderType;
} & AirhornTemplate;

export type AirhornProviderSendResult = {
	success: boolean;
	// biome-ignore lint/suspicious/noExplicitAny: response can be any shape
	response: any;
	errors: Array<Error>;
};

export interface AirhornProvider {
	name: string;
	capabilities: Array<AirhornProviderType>;
	send: (
		to: string,
		message: AirhornProviderMessage,
		options?: any,
	) => Promise<AirhornProviderSendResult>;
}
