import {ProviderService} from '../src/provider-service';

test('Provider Service Init', () => {
	const providerService = new ProviderService();

	expect(providerService).toEqual(new ProviderService());
});

