import {ProviderType} from './provider-type';

export interface ProviderInterface {
	name: string;
	type: ProviderType;
	send(to: string, from: string, message: string, subject?: string): Promise<boolean>;
}
