import type { AirhornTemplate } from "./template.js";
import { MemoryTemplateProvider } from "./template-providers/memory.js";

export type AirhornTemplateProvider = {
	name: string;
	uri: string;
	createTemplate(template: AirhornTemplate): Promise<AirhornTemplate>;
	updateTemplate(template: AirhornTemplate): Promise<AirhornTemplate>;
	deleteTemplateById(name: string): Promise<void>;
	getTemplates(): Promise<AirhornTemplate[]>;
	getTemplateById(name: string): Promise<AirhornTemplate | undefined>;
};

export class AirhornTemplateService {
	private _provider: AirhornTemplateProvider = new MemoryTemplateProvider();

	constructor(provider?: AirhornTemplateProvider) {
		if (provider) {
			this._provider = provider;
		}
	}

	public get provider(): AirhornTemplateProvider {
		return this._provider;
	}

	public set provider(provider: AirhornTemplateProvider) {
		this._provider = provider;
	}

	public async createTemplate(
		template: AirhornTemplate,
	): Promise<AirhornTemplate> {
		return this._provider.createTemplate(template);
	}

	public async updateTemplate(
		template: AirhornTemplate,
	): Promise<AirhornTemplate> {
		return this._provider.updateTemplate(template);
	}

	public async getTemplates(): Promise<AirhornTemplate[]> {
		return this._provider.getTemplates();
	}

	public async getTemplateById(
		name: string,
	): Promise<AirhornTemplate | undefined> {
		return this._provider.getTemplateById(name);
	}

	public async deleteTemplateById(name: string): Promise<void> {
		return this._provider.deleteTemplateById(name);
	}

	public async get(templateName: string): Promise<AirhornTemplate | undefined> {
		const template = await this._provider.getTemplateById(templateName);

		return template;
	}
}
