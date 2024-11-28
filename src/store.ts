import { type AirhornTemplate } from './template.js';

export type AirhornStoreProvider = {
	name: string;
	uri: string;
	createTemplate(template: AirhornTemplate): Promise<AirhornTemplate>;
	updateTemplate(template: AirhornTemplate): Promise<AirhornTemplate>;
	deleteTemplateById(name: string): Promise<void>;
	getTemplates(): Promise<AirhornTemplate[]>;
	getTemplateById(name: string): Promise<AirhornTemplate | undefined>;
};

export class AirhornStore {
	private _provider: AirhornStoreProvider;
	constructor(provider: AirhornStoreProvider) {
		this._provider = provider;
	}

	public get provider(): AirhornStoreProvider | undefined {
		return this._provider;
	}

	public set provider(provider: AirhornStoreProvider) {
		this._provider = provider;
	}

	public async createTemplate(template: AirhornTemplate): Promise<AirhornTemplate> {
		return this._provider.createTemplate(template);
	}

	public async updateTemplate(template: AirhornTemplate): Promise<AirhornTemplate> {
		return this._provider.updateTemplate(template);
	}

	public async getTemplates(): Promise<AirhornTemplate[]> {
		return this._provider.getTemplates();
	}

	public async getTemplateById(name: string): Promise<AirhornTemplate | undefined> {
		return this._provider.getTemplateById(name);
	}

	public async deleteTemplateById(name: string): Promise<void> {
		return this._provider.deleteTemplateById(name);
	}
}

