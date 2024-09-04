import fs from 'node:fs';
import {Template} from './template.js';
import {log} from './logger.js';

export class TemplateService {
	options = {
		TEMPLATE_PATH: './templates',
	};

	templates = new Array<Template>();

	constructor(options?: any) {
		this.options = { ...this.options, ...options };
		this.loadTemplates();
	}

	public loadTemplates() {
		this.templates = new Array<Template>();
		if (fs.existsSync(this.options.TEMPLATE_PATH)) {
			const templateDirectories = fs.readdirSync(this.options.TEMPLATE_PATH);

			for (const templateDirectoryPath of templateDirectories) {
				const templatePath = `${String(this.options.TEMPLATE_PATH)}/${String(templateDirectoryPath)}`;
				const template = new Template(templatePath);

				this.templates.push(template);
			}
		} else {
			log.error(`The template path does not exist: ${String(this.options.TEMPLATE_PATH)}`);
		}
	}

	public getTemplate(templateName: string): Template | undefined {
		for (const template of this.templates) {
			if (template.name === templateName) {
				return template;
			}
		}

		return undefined;
	}
}
