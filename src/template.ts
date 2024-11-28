import {Ecto} from 'ecto';
import { AirhornProviderType } from './provider-type.js';

export type AirhornTemplateTextOptions = {
	langCode?: string;
	text?: string;
	textFormat?: string;
	providerType?: AirhornProviderType;
	properties?: Map<string, string>;
};

export class AirhornTemplateText {
	public langCode = 'en';
	public text = '';
	public templateFormat = 'ejs'; // Default to ejs
	public providerType: AirhornProviderType = AirhornProviderType.SMTP;
	public properties: Map<string, string> = new Map<string, string>();

	constructor(options?: AirhornTemplateTextOptions) {
		if (options?.langCode) {
			this.langCode = options.langCode;
		}

		if (options?.text) {
			this.text = options.text;
		}

		if (options?.providerType) {
			this.providerType = options.providerType;
		}

		if (options?.properties) {
			this.properties = options.properties;
		}
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

	public getText(providerType: AirhornProviderType, languageCode?: string): AirhornTemplateText | undefined {
		let result;
		languageCode ??= 'en';
		const text = this._text.find(text => text.providerType === providerType && text.langCode === languageCode);

		if (text) {
			result = text;
		}

		return result;
	}

	public render(providerType: AirhornProviderType, data?: any, languageCode?: string): string {
		let result = '';
		const text = this.getText(providerType, languageCode);
		if (text) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			result = this._ecto.renderSync(text.text, data, text.templateFormat);
		}

		return result;
	}
}
