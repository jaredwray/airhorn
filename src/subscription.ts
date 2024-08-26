import { type AirhornProviderType } from './provider-type.js';

export type AirhornSubscription = {
	id: string;
	to: string;
	templateName: string;
	providerType: AirhornProviderType;
	externalId?: string;
	createdAt: Date;
	modifiedAt: Date;
};
