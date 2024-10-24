import {Ecto} from 'ecto';
import { AirhornProviderType } from './provider-type.js';

export type AirhornTemplateTextOptions = {
	langCode?: string;
	text?: string;
	providerType?: AirhornProviderType;
	properties?: Map<string, string>;
};

export class AirhornTemplateText {
	private _langCode = '';
	private _text = '';
	private _providerType: AirhornProviderType = AirhornProviderType.SMTP;
	private _properties: Map<string, string> = new Map<string, string>();

	constructor(options?: AirhornTemplateTextOptions) {
		if (options?.langCode) {
			this._langCode = options.langCode;
		}

		if (options?.text) {
			this._text = options.text;
		}

		if (options?.providerType) {
			this._providerType = options.providerType;
		}

		if (options?.properties) {
			this._properties = options.properties;
		}
	}

	public get langCode(): string {
		return this._langCode;
	}

	public set langCode(value: string) {
		this._langCode = value;
	}

	public get text(): string {
		return this._text;
	}

	public set text(value: string) {
		this._text = value;
	}

	public get providerType(): AirhornProviderType {
		return this._providerType;
	}

	public set providerType(value: AirhornProviderType) {
		this._providerType = value;
	}

	public get properties(): Map<string, string> {
		return this._properties;
	}

	public set properties(value: Map<string, string>) {
		this._properties = value;
	}
}

export class AirhornTemplate {
	private _name: string;
	private _text = new Array<AirhornTemplateText>();
	private readonly _ecto = new Ecto();

	constructor(name: string) {
		this._name = name;
	}

	public get name(): string {
		return this._name;
	}

	public set name(value: string) {
		this._name = value;
	}

	public get text(): AirhornTemplateText[] {
		return this._text;
	}

	public set text(value: AirhornTemplateText[]) {
		this._text = value;
	}

	public getProperty(providerType: AirhornProviderType, propertyName: string): string {
		let result = '';
		const text = this._text.find(text => text.providerType === providerType);

		if (text) {
			result = text.properties.get(propertyName) ?? '';
		}

		return result;
	}

	public getText(providerType: AirhornProviderType, languageCode?: string): string {
		let result = '';
		const text = this._text.find(text => text.providerType === providerType && text.langCode === languageCode);

		if (text) {
			result = text.text;
		}

		return result;
	}

	public render(providerType: AirhornProviderType, data?: Record<string, unknown>, languageCode?: string): string {
		let result = '';
		const text = this.getText(providerType, languageCode);

		if (text) {
			result = this._ecto.renderSync(text, data);
		}

		return result;
	}
}
