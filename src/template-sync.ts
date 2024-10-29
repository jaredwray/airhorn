import { promises as fs } from 'node:fs';
import { type AirhornStore } from './store.js';
import { AirhornTemplate, type AirhornTemplateText } from './template.js';

export class AirhornTemplateSync {
	private readonly _src: string;
	private readonly _destination: AirhornStore;
	private readonly _defaultLanguage = 'en';

	constructor(source: string, destination: AirhornStore, defaultLanguage?: string) {
		this._src = source;
		this._destination = destination;
		if (defaultLanguage) {
			this._defaultLanguage = defaultLanguage;
		}
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
			const template = await this.createTemplate(directory);
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
		if (subDirectories.length > 0) {} else {
			// This is a default language template
			for (const file of files) {}
		}

		return template;
	}

	public async createTemplateText(filePath: string): Promise<AirhornTemplateText> {
		const filePath = `${directoryPath}/${file}`;
		const fileData = await fs.readFile(filePath, 'utf8');
		const fileName = file.split('.').shift();
		const fileExtension = file.split('.').pop();
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
			if (await this.dirExists(filePath)) {
				directories.push(filePath);
			}
		}

		return directories;
	}
}

