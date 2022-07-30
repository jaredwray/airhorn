import {ProviderType} from './provider-type.js';

export interface ProviderInterface {
	name: string;
	type: ProviderType;
	send(to: string, from: string, message: string, subject?: string): Promise<boolean>;
}
