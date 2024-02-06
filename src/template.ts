/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Ecto } from 'ecto';
import fs from 'fs-extra';
import matter from 'gray-matter';
import { Options } from './options.js';
import { TemplateText } from './template-text.js';

export class Template {
	options = new Options();
	filePath?: string;
	private readonly text = new Map<string, TemplateText>();

	constructor(filePath?: string) {
		this.loadTemplate(filePath);
	}

	public get name(): string {
		return this.getFileName(this.filePath);
	}

	public getText(serviceType: string, languageCode?: string): TemplateText {
		if (languageCode === undefined) {
			languageCode = this.options.DEFAULT_TEMPLATE_LANGUAGE;
		}

		let result = this.text.get(this.generateKey(languageCode, serviceType));

		if (result === undefined) {
			result = new TemplateText();
		}

		return result;
	}

	public getProperty(serviceType: string, propertyName: string, languageCode?: string): string {
		const text = this.getText(serviceType, languageCode);
		const result = text.properties.get(propertyName);
		if (result) {
			return result.toString();
		}

		return '';
	}

	/* eslint max-params: [2, 5] */
	public setText(serviceType: string, languageCode: string, text: string, format: string, properties?: any) {
		this.text.set(this.generateKey(languageCode, serviceType), new TemplateText(text, format, languageCode, properties));
	}

	public loadTemplate(filePath?: string) {
		if (filePath !== undefined) {
			this.filePath = filePath;

			if (fs.pathExistsSync(this.filePath)) {
				const directories = fs.readdirSync(this.filePath);

				for (const d of directories) {
					const dFilePath = `${this.filePath}/${d}`;
					if (fs.statSync(dFilePath).isDirectory()) {
						const directoryLangCode = this.getFileName(dFilePath);
						this.loadTemplateDirectory(dFilePath, directoryLangCode);
					} else {
						this.loadTemplateFile(dFilePath);
					}
				}
			}
		}
	}

	public async render(serviceType: string, data?: any, languageCode?: string): Promise<string> {
		let result = '';
		const ecto = new Ecto();

		if (this.filePath !== undefined) {
			const templateText = this.getText(serviceType, languageCode);

			result = await ecto.render(templateText.text, data, templateText.format);
		}

		return result;
	}

	public getFileName(filePath?: string): string {
		let result = '';

		if (filePath !== undefined) {
			const name = filePath.split('/').pop();
			if (name !== undefined) {
				result = name.toLowerCase().trim();
			}
		}

		return result;
	}

	public generateKey(languageCode: string, serviceType: string): string {
		languageCode = languageCode.toLowerCase().trim();
		serviceType = serviceType.toLowerCase().trim();
		return `${languageCode}-${serviceType}`;
	}

	public loadTemplateDirectory(filePath: string, languageCode: string) {
		const files = fs.readdirSync(filePath);
		for (const fp of files) {
			this.loadTemplateFile(filePath + '/' + fp, languageCode);
		}
	}

	public loadTemplateFile(filePath: string, languageCode?: string) {
		if (languageCode === undefined) {
			languageCode = this.options.DEFAULT_TEMPLATE_LANGUAGE;
		}

		const fileText = fs.readFileSync(filePath).toString();
		const fileData = matter(fileText);
		const fileServiceType = this.getFileName(filePath).split('.')[0];

		const ecto = new Ecto();
		const format = ecto.getEngineByFilePath(filePath);

		this.setText(fileServiceType, languageCode, fileData.content, format, fileData.data);
	}
}

