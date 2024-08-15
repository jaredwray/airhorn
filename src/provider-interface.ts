import type {AirhornProviderType} from './provider-type.js';

export type ProviderInterface = {
	name: string;
	type: AirhornProviderType;
	send(to: string, from: string, message: string, subject?: string): Promise<boolean>;
};
