import fs from "node:fs";
import { Cacheable, type CacheableOptions } from "cacheable";
import { Ecto } from "ecto";
import { Hookified } from "hookified";
import { Writr } from "writr";
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
	// biome-ignore lint/suspicious/noExplicitAny: expected
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
	retryStrategy?: AirhornRetryStrategy;
	timeout?: number;
	sendStrategy?: AirhornSendStrategy;
	throwOnErrors?: boolean;
};

export type AirhornRetryStrategy = number | AirhornRetryFunction;

export class Airhorn extends Hookified {
	private _cache: Cacheable = new Cacheable();
	private _retryStrategy: AirhornRetryStrategy = 0;
	private _timeout: number = 100;
	private _sendStrategy: AirhornSendStrategy = AirhornSendStrategy.RoundRobin;
	private _throwOnErrors: boolean = false;
	private _statistics: AirhornStatistics = new AirhornStatistics();
	private _providers: Array<AirhornProvider> = [];
	private _roundRobinIndex: number = 0;

	constructor(options?: AirhornOptions) {
		// biome-ignore format: long format
		super({ throwHookErrors: options?.throwOnErrors });

		if (options?.cache !== undefined) {
			this.setCache(options.cache);
		}

		if (options?.statistics !== undefined) {
			this._statistics.enabled = options.statistics;
		}

		// Add default webhook provider unless explicitly disabled
		if (options?.useWebhookProvider !== false) {
			this._providers.push(new AirhornWebhookProvider());
		}

		if (options?.providers !== undefined) {
			this.addProviders(options.providers);
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

	/**
	 * Get the cache instance.
	 * @returns {Cacheable} The cache instance.
	 */
	public get cache(): Cacheable {
		return this._cache;
	}

	/**
	 * Set the cache instance.
	 * @param {Cacheable} cache - The cache instance.
	 */
	public set cache(cache: Cacheable) {
		this._cache = cache;
	}

	/**
	 * Get the Retry Strategy.
	 * @returns {AirhornRetryStrategy} The retry strategy.
	 */
	public get retryStrategy(): AirhornRetryStrategy {
		return this._retryStrategy;
	}

	/**
	 * Set the Retry Strategy.
	 * @param {AirhornRetryStrategy} retryStrategy - The retry strategy.
	 */
	public set retryStrategy(retryStrategy: AirhornRetryStrategy) {
		this._retryStrategy = retryStrategy;
	}

	/**
	 * Get the default timeout. This can be overridden individually on send calls with options.
	 * @returns {number} The timeout.
	 */
	public get timeout(): number {
		return this._timeout;
	}

	/**
	 * Set the default timeout. This can be overridden individually on send calls with options.
	 * @param {number} timeout - The timeout.
	 */
	public set timeout(timeout: number) {
		this._timeout = timeout;
	}

	/**
	 * Get the default send strategy. This can be overridden individually on send calls with options.
	 * @returns {AirhornSendStrategy} The send strategy.
	 */
	public get sendStrategy(): AirhornSendStrategy {
		return this._sendStrategy;
	}

	/**
	 * Set the default send strategy. This can be overridden individually on send calls with options.
	 * @param {AirhornSendStrategy} sendStrategy - The send strategy.
	 */
	public set sendStrategy(sendStrategy: AirhornSendStrategy) {
		this._sendStrategy = sendStrategy;
	}

	/**
	 * Get the throw on errors flag. By default this is set to false
	 * @returns {boolean} The throw on errors flag.
	 */
	public get throwOnErrors(): boolean {
		return this._throwOnErrors;
	}

	/**
	 * Set the throw on errors flag. By default this is set to false
	 * @param {boolean} throwOnErrors - The throw on errors flag.
	 */
	public set throwOnErrors(throwOnErrors: boolean) {
		this._throwOnErrors = throwOnErrors;
	}

	/**
	 * Get the statistics. By default it is disabled.
	 * To enable it set `statistics.enabled` to true or via options.
	 * @returns {AirhornStatistics} The statistics.
	 */
	public get statistics(): AirhornStatistics {
		return this._statistics;
	}

	/**
	 * Get the providers.
	 * @returns {Array<AirhornProvider>} The providers.
	 */
	public get providers(): Array<AirhornProvider> {
		return this._providers;
	}

	/**
	 * Set the providers.
	 * @param {Array<AirhornProvider>} providers - The providers.
	 */
	public set providers(providers: Array<AirhornProvider>) {
		this._providers = providers;
	}

	public async send(
		to: string,
		template: AirhornTemplate,
		// biome-ignore lint/suspicious/noExplicitAny: object
		data: Record<string, any>,
		type: AirhornProviderType,
		options?: AirhornSendOptions,
	): Promise<AirhornSendResult> {
		const startTime = Date.now();
		const result: AirhornSendResult = {
			success: false,
			response: null,
			providers: [],
			retries: 0,
			executionTime: 0,
			errors: [],
		};

		try {
			// Get providers that support this type
			const providers = this.getProvidersByType(type);

			if (providers.length === 0) {
				throw new Error(`No providers available for type: ${type}`);
			}

			// Generate the message from template
			const message = await this.generateMessage(to, template, data, type);

			result.message = message;

			// Determine send strategy
			const sendStrategy = options?.sendStrategy || this._sendStrategy;

			// Send based on strategy
			if (sendStrategy === AirhornSendStrategy.All) {
				// Send to all providers
				const sendPromises = providers.map(async (provider) => {
					try {
						const providerResult = await provider.send(message, options);
						if (providerResult.success) {
							result.success = true;
						}
						return { provider, result: providerResult };
					} catch (error) {
						const err =
							error instanceof Error ? error : new Error(String(error));
						result.errors.push(err);
						return { provider, error: err };
					}
				});

				const results = await Promise.all(sendPromises);
				result.providers = providers;
				result.response = results;
			} else if (sendStrategy === AirhornSendStrategy.RoundRobin) {
				// Round-robin through providers
				if (providers.length > 0) {
					const providerIndex = this._roundRobinIndex % providers.length;
					const provider = providers[providerIndex];
					if (provider) {
						this._roundRobinIndex =
							(this._roundRobinIndex + 1) % providers.length;

						try {
							const providerResult = await provider.send(message, options);
							result.success = providerResult.success;
							result.response = providerResult;
							result.providers = [provider];
						} catch (error) {
							const err =
								error instanceof Error ? error : new Error(String(error));
							result.errors.push(err);
						}
					}
				}
			} else {
				// FailOver strategy (default)
				for (const provider of providers) {
					try {
						const providerResult = await provider.send(message, options);
						if (providerResult.success) {
							result.success = true;
							result.response = providerResult;
							result.providers = [provider];
							break;
						} else {
							// Provider failed but didn't throw - collect its errors
							if (providerResult.errors && providerResult.errors.length > 0) {
								result.errors.push(...providerResult.errors);
							}
						}
					} catch (error) {
						const err =
							error instanceof Error ? error : new Error(String(error));
						result.errors.push(err);
						// Continue to next provider
					}
				}
			}

			// Emit events
			if (result.success) {
				this.emit(AirhornEvent.NotificationSent, result);
			} else {
				this.emit(AirhornEvent.NotificationFailed, result);
			}

			// Update statistics
			if (this._statistics.enabled) {
				if (result.success) {
					this._statistics.incrementSuccess();
				} else {
					this._statistics.incrementFailure();
				}
			}
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			result.errors.push(err);
			this.handleError(err);
		}

		result.executionTime = Date.now() - startTime;
		return result;
	}

	public async sendSMS(
		to: string,
		template: AirhornTemplate,
		// biome-ignore lint/suspicious/noExplicitAny: object
		data: Record<string, any>,
		options?: AirhornSendOptions,
	): Promise<AirhornSendResult> {
		return this.send(to, template, data, AirhornProviderType.SMS, options);
	}

	public async sendEmail(
		to: string,
		template: AirhornTemplate,
		// biome-ignore lint/suspicious/noExplicitAny: object
		data: Record<string, any>,
		options?: AirhornSendOptions,
	): Promise<AirhornSendResult> {
		return this.send(to, template, data, AirhornProviderType.Email, options);
	}

	public async sendWebhook(
		to: string,
		template: AirhornTemplate,
		// biome-ignore lint/suspicious/noExplicitAny: object
		data: Record<string, any>,
		options?: AirhornSendOptions,
	): Promise<AirhornSendResult> {
		return this.send(to, template, data, AirhornProviderType.Webhook, options);
	}

	public async sendMobilePush(
		to: string,
		template: AirhornTemplate,
		// biome-ignore lint/suspicious/noExplicitAny: object
		data: Record<string, any>,
		options?: AirhornSendOptions,
	): Promise<AirhornSendResult> {
		return this.send(
			to,
			template,
			data,
			AirhornProviderType.MobilePush,
			options,
		);
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

	/**
	 * Set the cache. This is a helper to set the cache
	 * @param {boolean | Cacheable | CacheableOptions} cache - The cache to set.
	 */
	public setCache(cache: boolean | Cacheable | CacheableOptions) {
		if (cache === true) {
			this._cache = new Cacheable();
		} else if (cache instanceof Cacheable) {
			this._cache = cache;
		} else if (typeof cache === "object") {
			this._cache = new Cacheable(cache);
		}
	}

	/**
	 * Add providers to the Airhorn instance.
	 * @param {Array<AirhornProvider>} providers - The providers to add.
	 */
	public addProviders(providers: Array<AirhornProvider>) {
		for (const provider of providers) {
			this.addProvider(provider);
		}
	}

	/**
	 * Add a provider to the Airhorn instance.
	 * @param {AirhornProvider} provider - The provider to add.
	 */
	public addProvider(provider: AirhornProvider) {
		if (!this._providers.includes(provider)) {
			this._providers.push(provider);
		}
	}

	/**
	 * Generate a message from a template and data.
	 * @param template - The template to use.
	 * @param data - The data to populate the template.
	 * @returns The generated message.
	 */
	public async generateMessage(
		to: string,
		template: AirhornTemplate,
		// biome-ignore lint/suspicious/noExplicitAny: object
		data: Record<string, any>,
		providerType: AirhornProviderType,
	): Promise<AirhornProviderMessage> {
		const ecto = new Ecto();

		const message: AirhornProviderMessage = {
			to,
			from: template.from,
			subject: template.subject,
			type: providerType,
			content: await ecto.render(
				template.content,
				data,
				template.templateEngine,
			),
			template: template,
		};

		return message;
	}

	/**
	 * Load a template from a file. This is in markdown format with specific header values
	 * @param {string} path - The path to the template file.
	 * @returns {Promise<AirhornTemplate>} The loaded template.
	 */
	public async loadTemplate(path: string): Promise<AirhornTemplate> {
		let template: AirhornTemplate = {
			from: "",
			content: "",
		};

		try {
			if (!fs.existsSync(path)) {
				throw new Error(`Template file not found: ${path}`);
			}
			const templateContent = await fs.promises.readFile(path, "utf-8");
			const writr = new Writr(templateContent);

			// Handle requiredFields as either array or comma-separated string
			let requiredFields = writr.frontMatter.requiredFields;
			if (requiredFields) {
				if (typeof requiredFields === "string") {
					requiredFields = requiredFields
						.split(",")
						.map((field: string) => field.trim());
				} else if (!Array.isArray(requiredFields)) {
					requiredFields = [requiredFields];
				}
			}

			template = {
				from: writr.frontMatter.from || "",
				subject: writr.frontMatter.subject,
				content: writr.body,
				requiredFields: requiredFields,
				templateEngine: writr.frontMatter.templateEngine,
			};
		} catch (error) {
			this.handleError(error as Error);
		}

		return template;
	}

	/**
	 * Handle Errors
	 * @param {Error} error
	 */
	private handleError(error: Error): void {
		this.emit(AirhornEvent.Error, error);
		if (this._throwOnErrors) {
			throw error;
		}
	}
}
