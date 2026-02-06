import fs from "node:fs";
import { Cacheable, type CacheableOptions } from "cacheable";
import { Ecto } from "ecto";
import { Hookified } from "hookified";
import { Writr } from "writr";
import type {
	AirhornProvider,
	AirhornProviderMessage,
	AirhornProviderSendResult,
} from "./provider.js";
import { AirhornStatistics } from "./statistics.js";
import type { AirhornTemplate } from "./template.js";
import { AirhornWebhookProvider } from "./webhook.js";

export enum AirhornSendStrategy {
	All = "All",
	FailOver = "FailOver",
	RoundRobin = "RoundRobin",
}

export enum AirhornSendType {
	SMS = "sms",
	Email = "email",
	MobilePush = "mobilepush",
	Webhook = "webhook",
}

export type AirhornSendResult = {
	/**
	 * The providers that were used to send the message.
	 */
	providers: Array<AirhornProvider>;
	/**
	 * The message that was sent.
	 */
	message?: AirhornProviderMessage;
	/**
	 * Whether the message was sent successfully.
	 */
	success: boolean;
	/**
	 * The response from the provider.
	 */
	// biome-ignore lint/suspicious/noExplicitAny: expected
	response: any;
	/**
	 * The number of times the message was retried.
	 */
	retries: number;
	/**
	 * The errors that occurred while sending the message.
	 */
	errors: Array<AirhornSendResultError>;
	/**
	 * The time taken to execute the send operation.
	 */
	executionTime: number;
};

export type AirhornSendResultError = {
	/**
	 * The provider that failed to send the message.
	 */
	provider?: AirhornProvider;
	/**
	 * The error that occurred while sending the message.
	 */
	error: Error;
};

export enum AirhornEvent {
	Info = "info",
	Warning = "warning",
	Error = "error",
	SendSuccess = "send.success",
	SendFailure = "send.failure",
}

export enum AirhornHook {
	BeforeSend = "before:Send",
	AfterSend = "after:Send",
}

export type AirhornRetryFunction = (
	message: AirhornProviderMessage,
	failedProvider: AirhornProvider,
	instance: Airhorn,
) => number;

export type AirhornSendOptions = {
	/**
	 * The send strategy to use when sending messages. This will override the instance send strategy.
	 * @default AirhornSendStrategy.RoundRobin
	 */
	sendStrategy?: AirhornSendStrategy;
	/**
	 * Whether to throw an error if sending fails. By default we use emitting for errors. This will override the instance throwOnErrors setting.
	 * @default false
	 */
	throwOnErrors?: boolean;
};

export type AirhornOptions = {
	/**
	 * Whether to enable caching on template generation via Ecto
	 * @default true
	 */
	cache?: boolean | CacheableOptions;
	/**
	 * Whether to collect statistics.
	 * @default false
	 */
	statistics?: boolean;
	/**
	 * The providers to add to the Airhorn instance. AirhornWebhook is added by default unless `useWebhookProvider` is set to false.
	 */
	providers?: Array<AirhornProvider>;
	/**
	 * Whether to use the built-in webhook provider.
	 * @default true
	 */
	useWebhookProvider?: boolean;
	/**
	 * The send strategy to use when sending messages.
	 * @default AirhornSendStrategy.RoundRobin
	 */
	sendStrategy?: AirhornSendStrategy;
	/**
	 * Whether to throw an error if sending fails. By default we use emitting for errors
	 * @default false
	 */
	throwOnErrors?: boolean;
};

/**
 * The retry strategy to use when sending messages. If set to a number that is greater than 0,
 * it will be used as the maximum number of retries. If set to a function, it will be called with the
 * message, failed provider, and Airhorn instance to determine the number of retries.
 */
export type AirhornRetryStrategy = number | AirhornRetryFunction;

export class Airhorn extends Hookified {
	private _sendStrategy: AirhornSendStrategy = AirhornSendStrategy.RoundRobin;
	private _throwOnErrors: boolean = false;
	private _statistics: AirhornStatistics = new AirhornStatistics();
	private _providers: Array<AirhornProvider> = [];
	private _roundRobinIndex: number = 0;
	private _ecto = new Ecto({ cache: true });

	constructor(options?: AirhornOptions) {
		// biome-ignore format: long format
		super({ throwHookErrors: options?.throwOnErrors });

		if (options?.cache !== undefined) {
			if (options?.cache === false) {
				this._ecto = new Ecto({ cache: false });
			} else {
				this._ecto.cache = new Cacheable(options?.cache as CacheableOptions);
			}
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
	public get cache(): Cacheable | undefined {
		return this._ecto.cache;
	}

	/**
	 * Set the cache instance.
	 * @param {Cacheable} cache - The cache instance.
	 */
	public set cache(cache: Cacheable) {
		this._ecto.cache = cache;
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

	/**
	 * Send a notification
	 * @param to
	 * @param template
	 * @param data
	 * @param {AirhornProviderType} type - The type of notification to send SMS, Email, Webhook, MobilePush
	 * @param {AirhornSendOptions} options - The send options.
	 * @returns {Promise<AirhornSendResult>} - The result of the send operation.
	 */
	public async send(
		to: string,
		template: AirhornTemplate,
		// biome-ignore lint/suspicious/noExplicitAny: object
		data: Record<string, any>,
		type: AirhornSendType,
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

			// Call BeforeSend hook - allows modification of message and options
			await this.hook(AirhornHook.BeforeSend, { message, options });

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
						result.errors.push({ provider, error: err });
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
							result.errors.push({ provider, error: err });
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
								result.errors.push(
									...providerResult.errors.map((error) => ({
										provider,
										error,
									})),
								);
							}
						}
					} catch (error) {
						const err =
							error instanceof Error ? error : new Error(String(error));
						result.errors.push({ provider, error: err });
						// Continue to next provider
					}
				}
			}

			// Emit events
			if (result.success) {
				this.emit(AirhornEvent.SendSuccess, result);
			} else {
				this.emit(AirhornEvent.SendFailure, result);
			}

			// Call AfterSend hook - allows post-processing of result
			await this.hook(AirhornHook.AfterSend, { result });
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			result.errors.push({ error: err });
			this.handleError(err);
		}

		result.executionTime = Date.now() - startTime;

		// Submit execution time to statistics
		if (result.message) {
			this._statistics.submit({
				to: result.message.to,
				from: result.message.from,
				providerType: result.message.type,
				startTime: new Date(startTime),
				duration: result.executionTime,
				success: result.success,
			});
		}

		return result;
	}

	public async sendSMS(
		to: string,
		template: AirhornTemplate,
		// biome-ignore lint/suspicious/noExplicitAny: object
		data: Record<string, any>,
		options?: AirhornSendOptions,
	): Promise<AirhornSendResult> {
		return this.send(to, template, data, AirhornSendType.SMS, options);
	}

	public async sendEmail(
		to: string,
		template: AirhornTemplate,
		// biome-ignore lint/suspicious/noExplicitAny: object
		data: Record<string, any>,
		options?: AirhornSendOptions,
	): Promise<AirhornSendResult> {
		return this.send(to, template, data, AirhornSendType.Email, options);
	}

	public async sendWebhook(
		to: string,
		template: AirhornTemplate,
		// biome-ignore lint/suspicious/noExplicitAny: object
		data: Record<string, any>,
		options?: AirhornSendOptions,
	): Promise<AirhornSendResult> {
		return this.send(to, template, data, AirhornSendType.Webhook, options);
	}

	public async sendMobilePush(
		to: string,
		template: AirhornTemplate,
		// biome-ignore lint/suspicious/noExplicitAny: object
		data: Record<string, any>,
		options?: AirhornSendOptions,
	): Promise<AirhornSendResult> {
		return this.send(to, template, data, AirhornSendType.MobilePush, options);
	}

	/**
	 * Send a notification to all providers simultaneously.
	 * @param to
	 * @param template
	 * @param data
	 * @param {AirhornSendType} type - The type of notification to send SMS, Email, Webhook, MobilePush
	 * @param {AirhornSendOptions} options - The send options.
	 * @returns {Promise<AirhornSendResult>} - The result of the send operation.
	 */
	public async sendAll(
		to: string,
		template: AirhornTemplate,
		// biome-ignore lint/suspicious/noExplicitAny: object
		data: Record<string, any>,
		type: AirhornSendType,
		options?: AirhornSendOptions,
	): Promise<AirhornSendResult> {
		return this.send(to, template, data, type, {
			...options,
			sendStrategy: AirhornSendStrategy.All,
		});
	}

	/**
	 * Send a notification using fail-over strategy (tries providers in order until one succeeds).
	 * @param to
	 * @param template
	 * @param data
	 * @param {AirhornSendType} type - The type of notification to send SMS, Email, Webhook, MobilePush
	 * @param {AirhornSendOptions} options - The send options.
	 * @returns {Promise<AirhornSendResult>} - The result of the send operation.
	 */
	public async sendFailOver(
		to: string,
		template: AirhornTemplate,
		// biome-ignore lint/suspicious/noExplicitAny: object
		data: Record<string, any>,
		type: AirhornSendType,
		options?: AirhornSendOptions,
	): Promise<AirhornSendResult> {
		return this.send(to, template, data, type, {
			...options,
			sendStrategy: AirhornSendStrategy.FailOver,
		});
	}

	/**
	 * Send a notification using round-robin strategy (cycles through providers).
	 * @param to
	 * @param template
	 * @param data
	 * @param {AirhornSendType} type - The type of notification to send SMS, Email, Webhook, MobilePush
	 * @param {AirhornSendOptions} options - The send options.
	 * @returns {Promise<AirhornSendResult>} - The result of the send operation.
	 */
	public async sendRoundRobin(
		to: string,
		template: AirhornTemplate,
		// biome-ignore lint/suspicious/noExplicitAny: object
		data: Record<string, any>,
		type: AirhornSendType,
		options?: AirhornSendOptions,
	): Promise<AirhornSendResult> {
		return this.send(to, template, data, type, {
			...options,
			sendStrategy: AirhornSendStrategy.RoundRobin,
		});
	}

	public getProvidersByType(type: AirhornSendType): Array<AirhornProvider> {
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
		providerType: AirhornSendType,
	): Promise<AirhornProviderMessage> {
		const message: AirhornProviderMessage = {
			to,
			from: template.from,
			subject: await this._ecto.render(
				template.subject || "",
				data,
				template.templateEngine,
			),
			type: providerType,
			content: await this._ecto.render(
				template.content,
				data,
				template.templateEngine,
			),
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

export type {
	AirhornProvider,
	AirhornProviderMessage,
	AirhornProviderSendResult,
};
