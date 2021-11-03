interface ProviderInterface {
	name: string;
	types: ProviderType[];
	send(): Promise<void>;
}
