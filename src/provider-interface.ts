import {ProviderType} from './provider-type';

export interface ProviderInterface {
	name: string;
	type: ProviderType;
	send(): Promise<void>;
}
