import { describe, test, expect } from "vitest";
import { Airhorn, AirhornSendStrategy } from "../src/index.js";
import { AirhornWebhookProvider } from "../src/webhook.js";
import { Cacheable } from "cacheable";

describe("Airhorn", () => {
	test("should be defined", () => {
		expect(Airhorn).toBeDefined();
	});

	test('should be able to set the cache to true via options', () => {
		const airhorn = new Airhorn({ cache: true });
		expect(airhorn.cache).toBeDefined();
	});

	test('should be able to enable statistics from options', () => {
		const airhorn = new Airhorn({ statistics: true });
		expect(airhorn.statistics.enabled).toBe(true);
	});

	test('should be able to set the providers via options', () => {
		const airhorn = new Airhorn({ providers: [new AirhornWebhookProvider()] });
		expect(airhorn.providers).toHaveLength(1);
		expect(airhorn.providers[0]).toBeInstanceOf(AirhornWebhookProvider);
		airhorn.providers = [new AirhornWebhookProvider()];
		expect(airhorn.providers).toHaveLength(1);
	});

	test('should be able to disable webhook provider from options', () => {
		const airhorn = new Airhorn({ useWebhookProvider: false });
		expect(airhorn.providers).toHaveLength(0);
	});

	test('should be able to set the retryStrategy from options', () => {
		const airhorn = new Airhorn({ retryStrategy: 5 });
		expect(airhorn.retryStrategy).toBe(5);
	});

	test('should be able to set the timeout from options', () => {
		const airhorn = new Airhorn({ timeout: 200 });
		expect(airhorn.timeout).toBe(200);
		airhorn.timeout = 300;
		expect(airhorn.timeout).toBe(300);
	});

	test('should be able to set the sendStrategy from options', () => {
		const airhorn = new Airhorn({ sendStrategy: AirhornSendStrategy.RoundRobin });
		expect(airhorn.sendStrategy).toBe(AirhornSendStrategy.RoundRobin);
		airhorn.sendStrategy = AirhornSendStrategy.All;
		expect(airhorn.sendStrategy).toBe(AirhornSendStrategy.All);
	});

	test('should be able to set the throwOnErrors from options', () => {
		const airhorn = new Airhorn({ throwOnErrors: true });
		expect(airhorn.throwOnErrors).toBe(true);
		airhorn.throwOnErrors = false;
		expect(airhorn.throwOnErrors).toBe(false);
	});

	test('should be able to set the cache property', () => {
		const airhorn = new Airhorn();
		airhorn.cache = new Cacheable();
		expect(airhorn.cache).toBeDefined();
	});

	test('should be able to set the retryStrategy property', () => {
		const airhorn = new Airhorn();
		airhorn.retryStrategy = 5;
		expect(airhorn.retryStrategy).toBe(5);
	});

	test('should be able to set cache with Cacheable', () => {
		const airhorn = new Airhorn();
		airhorn.setCache(new Cacheable({ ttl: 5000 }));
		expect(airhorn.cache.ttl).toBe(5000);
	});

	test('should be able to set cache via CacheableOptions', () => {
		const airhorn = new Airhorn();
		airhorn.setCache({ ttl: 60 });
		expect(airhorn.cache.ttl).toBe(60);
	});

});
