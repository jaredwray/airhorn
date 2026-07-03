export type AirhornTemplate = {
	/**
	 * The sender of the message. Optional — can also be provided per send via
	 * `AirhornSendOptions.from`, which takes precedence over this value.
	 */
	from?: string;
	subject?: string;
	content: string;
	requiredFields?: Array<string>;
	templateEngine?: string;
};
