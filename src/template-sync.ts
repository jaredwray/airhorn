import { promises as fs } from 'node:fs';
import { Ecto } from 'ecto';
import { type AirhornStore } from './store.js';
import { AirhornTemplate, AirhornTemplateText, AirhornTemplateTextOptions } from './template.js';
import { AirhornProviderType } from './provider-type.js';

export class AirhornTemplateSync {
	private readonly _src: string;
	private readonly _destination: AirhornStore;
	private _defaultLanguage = 'en';

	constructor(source: string, destination: AirhornStore, defaultLanguage?: string) {
		this._src = source;
		this._destination = destination;
		if (defaultLanguage) {
			this._defaultLanguage = defaultLanguage;
		}
	}

	public get defaultLanguage(): string {
		return this._defaultLanguage;
	}

	public set defaultLanguage(language: string) {
		this._defaultLanguage = language;
	}

	public async sync(): Promise<void> {
		// Does the source directory exist?
		if (!(await this.dirExists(this._src))) {
			throw new Error(`Source directory ${this._src} does not exist`);
		}

		// Get all directories in the source directory
		const directories = await this.getDirectories(this._src);

		// For each directory, create a template
		for (const directory of directories) {
			// eslint-disable-next-line no-await-in-loop
			const template = await this.createTemplate(directory);
			// eslint-disable-next-line no-await-in-loop
			await this._destination.createTemplate(template);
		}
	}

	public async createTemplate(directoryPath: string): Promise<AirhornTemplate> {
		const directoryName = directoryPath.split('/').pop();
		if (!directoryName) {
			throw new Error('Invalid directory path');
		}

		const template = new AirhornTemplate(directoryName);
		const files = await fs.readdir(directoryPath);

		// Check if there are directories, if so then it is multi-language
		const subDirectories = await this.getDirectories(directoryPath);

		// Loop through the sub directories as it is language specific
		console.log(subDirectories);
		if (subDirectories.length > 0) {
			for (const subDirectory of subDirectories) {
				const langCode = subDirectory.split('/').pop() ?? '';
				const subFiles = await fs.readdir(subDirectory);
				for(const file of subFiles) {
					const filePath = `${subDirectory}/${file}`;
					// eslint-disable-next-line no-await-in-loop
					const templateText = await this.createTemplateText(filePath, langCode);
					template.text.push(templateText);
				}
			}
			return template;
		}

		// This is a default language template
		for (const file of files) {
			const filePath = `${directoryPath}/${file}`;
			// eslint-disable-next-line no-await-in-loop
			const templateText = await this.createTemplateText(filePath);
			template.text.push(templateText);
		}

		return template;
	}

	public async createTemplateText(filePath: string, languageCode?: string): Promise<AirhornTemplateText> {
		const templateText = new AirhornTemplateText();
		templateText.langCode = languageCode ?? this._defaultLanguage;
		const source = await fs.readFile(filePath, 'utf8');
		let typeName = filePath.split('/').pop() ?? '';
		typeName = typeName.split('.').shift() ?? '';

		if (typeName === 'sms') {
			templateText.providerType = AirhornProviderType.SMS;
		}

		if (typeName === 'webhook') {
			templateText.providerType = AirhornProviderType.WEBHOOK;
		}

		if (typeName === 'mobile-push') {
			templateText.providerType = AirhornProviderType.MOBILE_PUSH;
		}

		if (typeName === 'smtp') {
			templateText.providerType = AirhornProviderType.SMTP;
		}

		const ecto = new Ecto();
		templateText.text = ecto.removeFrontMatter(source);

		const frontMatter = ecto.getFrontMatter(source);
		for( const [key, value] of Object.entries(frontMatter)) {
			templateText.properties.set(key, value as string);
		}

		return templateText;
	}

	public async dirExists(path: string): Promise<boolean> {
		try {
			const stats = await fs.stat(path);
			return stats.isDirectory();
		} catch {
			return false;
		}
	}

	public async getDirectories(path: string): Promise<string[]> {
		const files = await fs.readdir(path);
		const directories = [];
		for (const file of files) {
			const filePath = `${path}/${file}`;
			// eslint-disable-next-line no-await-in-loop
			if (await this.dirExists(filePath)) {
				directories.push(filePath);
			}
		}

		return directories;
	}
}

