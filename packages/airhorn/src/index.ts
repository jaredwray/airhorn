import { Cacheable, type CacheableOptions } from "cacheable";
import { Ecto, EctoOptions } from "ecto";
import { Hookified } from "hookified";
import {
	type AirhornProvider,
	type AirhornProviderMessage,
	AirhornProviderType,
} from "./provider.js";
import { AirhornStatistics } from "./statistics.js";
import type { AirhornTemplate } from "./template.js";
import { AirhornWebhookProvider } from "./webhook.js";

export enum AirhornSendStrategy {
	All = "All",
	FailOver = "FailOver",
	RoundRobin = "RoundRobin",
}

export type AirhornSendResult = {
	providers: Array<AirhornProvider>;
	message?: AirhornProviderMessage;
	success: boolean;
	response: any;
	retries: number;
	errors: Array<Error>;
	executionTime: number;
};

export enum AirhornEvent {
	Info = "info",
	Warning = "warning",
	Error = "error",
	NotificationSent = "notification.sent",
	NotificationFailed = "notification.failed",
}

export type AirhornRetryFunction = (
	message: AirhornProviderMessage,
	failedProvider: AirhornProvider,
	instance: Airhorn,
) => number;

export type AirhornSendOptions = {
	retryStrategy?: AirhornRetryStrategy;
	timeout?: number;
	sendStrategy?: AirhornSendStrategy;
	throwOnErrors?: boolean;
};

export type AirhornOptions = {
	cache?: boolean | Cacheable | CacheableOptions;
	statistics?: boolean;
	providers?: Array<AirhornProvider>;
	useWebhookProvider?: boolean;
} & AirhornSendOptions;

export type AirhornRetryStrategy = number | AirhornRetryFunction;

export class Airhorn extends Hookified {
	private _cache: Cacheable = new Cacheable();
	private _retryStrategy: AirhornRetryStrategy; // add function for this with backoff
	private _timeout: number = 100;
	private _sendStrategy: AirhornSendStrategy = AirhornSendStrategy.RoundRobin;
	private _throwOnErrors: boolean = false;
	private _statistics: AirhornStatistics = new AirhornStatistics();
	private _providers: Array<AirhornProvider> = [];

	constructor(options?: AirhornOptions) {
		super({
			throwHookErrors: options?.throwOnErrors,
			throwOnEmitError: options?.throwOnErrors,
		});

		if (options?.cache !== undefined) {
			this.setCache(options.cache);
		}

		if (options?.statistics !== undefined) {
			this._statistics.enabled = options.statistics;
		}

		if (options?.providers !== undefined) {
			this.addProviders(options.providers);
		}

		if (
			options?.useWebhookProvider !== undefined &&
			options.useWebhookProvider === true
		) {
			// add the provider
			this._providers.push(new AirhornWebhookProvider());
		}

		if (options?.retryStrategy !== undefined) {
			this._retryStrategy = options.retryStrategy;
		}

		if (options?.timeout !== undefined) {
			this._timeout = options.timeout;
		}

		if (options?.sendStrategy !== undefined) {
			this._sendStrategy = options.sendStrategy;
		}

		if (options?.throwOnErrors !== undefined) {
			this._throwOnErrors = options.throwOnErrors;
		}
	}

	public get cache(): Cacheable {
		return this._cache;
	}

	public set cache(cache: Cacheable) {
		this._cache = cache;
	}

	public get retryStrategy(): AirhornRetryStrategy {
		return this._retryStrategy;
	}

	public set retryStrategy(retryStrategy: AirhornRetryStrategy) {
		this._retryStrategy = retryStrategy;
	}

	public get timeout(): number {
		return this._timeout;
	}

	public set timeout(timeout: number) {
		this._timeout = timeout;
	}

	public get sendStrategy(): AirhornSendStrategy {
		return this._sendStrategy;
	}

	public get throwOnErrors(): boolean {
		return this._throwOnErrors;
	}

	public set throwOnErrors(throwOnErrors: boolean) {
		this._throwOnErrors = throwOnErrors;
	}

	public get statistics(): AirhornStatistics {
		return this._statistics;
	}

	public get providers(): Array<AirhornProvider> {
		return this._providers;
	}

	public set providers(providers: Array<AirhornProvider>) {
		this._providers = providers;
	}

	// biome-ignore format: disable for this function
	public async send(template: AirhornTemplate, data: Record<string, string>, type: AirhornProviderType, options: AirhornSendOptions): Promise<AirhornSendResult> {
		const result: AirhornSendResult = {
			success: false,
			response: null,
			providers: [],
			retries: 0,
			executionTime: 0,
			errors: [],
		};

		return result;
	}

	// biome-ignore format: disable for this function
	public async sendSMS(template: AirhornTemplate, data: Record<string, string>, options: AirhornSendOptions): Promise<AirhornSendResult> {
		return this.send(template, data, AirhornProviderType.SMS, options);
	}

	// biome-ignore format: disable for this function
	public async sendEmail(template: AirhornTemplate, data: Record<string, string>, options: AirhornSendOptions): Promise<AirhornSendResult> {
		return this.send(template, data, AirhornProviderType.Email, options);
	}

	// biome-ignore format: disable for this function
	public async sendWebhook(template: AirhornTemplate, data: Record<string, string>, options: AirhornSendOptions): Promise<AirhornSendResult> {
		return this.send(template, data, AirhornProviderType.Webhook, options);
	}

	// biome-ignore format: disable for this function
	public async sendMobilePush(template: AirhornTemplate, data: Record<string, string>, options: AirhornSendOptions): Promise<AirhornSendResult> {
		return this.send(template, data, AirhornProviderType.MobilePush, options);
	}

	public getProvidersByType(type: AirhornProviderType): Array<AirhornProvider> {
		const providers: Array<AirhornProvider> = [];

		// iterate over all providers and add the ones that match the type
		for (const provider of this._providers) {
			if (provider.capabilities.includes(type)) {
				providers.push(provider);
			}
		}

		return providers;
	}

	public setCache(cache: boolean | Cacheable | CacheableOptions) {
		if (cache === true) {
			this._cache = new Cacheable();
		} else if (cache instanceof Cacheable) {
			this._cache = cache;
		} else if (typeof cache === "object") {
			this._cache = new Cacheable(cache);
		}
	}

	public addProviders(providers: Array<AirhornProvider>) {
		for (const provider of providers) {
			if (!this._providers.includes(provider)) {
				this._providers.push(provider);
			}
		}
	}

	//public async loadTemplate(path: string): Promise<AirhornTemplate> {}
}
