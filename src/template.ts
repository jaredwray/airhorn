import {Ecto} from 'ecto';
import * as fs from 'fs-extra';
import {Config} from './config';
import {TemplateText} from './template-text';

export class Template {
	config = new Config();
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
			languageCode = this.config.defaultTemplateLanguage;
		}

		let result = this.text.get(this.generateKey(languageCode, serviceType));

		if (result === undefined) {
			result = new TemplateText();
		}

		return result;
	}

	public setText(serviceType: string, languageCode: string, text: string, format: string) {
		this.text.set(this.generateKey(languageCode, serviceType), new TemplateText(text, format, languageCode));
	}

	public loadTemplate(filePath?: string) {
		if (filePath !== undefined) {
			this.filePath = filePath;

			if (fs.pathExistsSync(this.filePath)) {
				const dirs = fs.readdirSync(this.filePath);

				for (const d of dirs) {
					const dFilePath = this.filePath + '/' + d;
					if (fs.statSync(dFilePath).isDirectory()) {
						const dirLangCode = this.getFileName(dFilePath);
						this.loadTemplateDirectory(dFilePath, dirLangCode);
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
		return `${languageCode}-${serviceType}`;
	}

	private loadTemplateDirectory(filePath: string, languageCode: string) {
		const files = fs.readdirSync(filePath);
		for (const fp of files) {
			this.loadTemplateFile(filePath + '/' + fp, languageCode);
		}
	}

	private loadTemplateFile(filePath: string, languageCode?: string) {
		if (languageCode === undefined) {
			languageCode = this.config.defaultTemplateLanguage;
		}

		const fileText = fs.readFileSync(filePath).toString();
		const fileServiceType = this.getFileName(filePath).split('.')[0] ?? '';

		const ecto = new Ecto();
		const format = ecto.getEngineByFilePath(filePath);

		this.setText(fileServiceType, languageCode, fileText, format);
	}
}

