import {
	MongoClient, type Db, type Collection, ObjectId, type Document,
} from 'mongodb';
import {AirhornTemplate} from '../template.js';
import {type AirhornTemplateProvider} from '../template-service.js';

export type MongoStoreProviderOptions = {
	uri?: string;
	subscriptionsCollectionName?: string;
	notificationsCollectionName?: string;
	templatesCollectionName?: string;
};

export class MongoTemplateProvider implements AirhornTemplateProvider {
	public templatesCollectionName = 'airhornTemplates';
	public uri = 'mongodb://localhost:27017';
	public readonly db: Db;
	public readonly templatesCollection: Collection;

	constructor(options?: MongoStoreProviderOptions) {
		if (options) {
			this.loadOptions(options);
		}

		const client = new MongoClient(this.uri);
		this.db = client.db();
		this.templatesCollection = this.db.collection(this.templatesCollectionName);
	}

	get name(): string {
		return 'MongoStoreProvider';
	}

	async createTemplate(template: AirhornTemplate): Promise<AirhornTemplate> {
		const templateDocument: Document = {
			name: template.name,
			text: template.text,
			createdAt: new Date(),
			modifiedAt: new Date(),
		};

		const result = await this.templatesCollection.insertOne(templateDocument);
		const document = await this.templatesCollection.findOne({_id: result.insertedId});
		/* c8 ignore next 3 */
		if (!document) {
			throw new Error('Failed to create template');
		}

		return this.mapDocumentToTemplate(document);
	}

	async updateTemplate(template: AirhornTemplate): Promise<AirhornTemplate> {
		const result = await this.templatesCollection.updateOne({name: template.name}, {
			$set: {
				name: template.name,
				text: template.text,
				modifiedAt: new Date(),
			},
		});
		const updatedTemplate = await this.templatesCollection.findOne({name: template.name});
		/* c8 ignore next 3 */
		if (!updatedTemplate) {
			throw new Error('Failed to update template');
		}

		return this.mapDocumentToTemplate(updatedTemplate);
	}

	async deleteTemplateById(name: string): Promise<void> {
		await this.templatesCollection.deleteOne({name});
	}

	async getTemplates(): Promise<AirhornTemplate[]> {
		const documents = await this.templatesCollection.find({}).toArray();
		return this.mapDocumentsToTemplates(documents);
	}

	async getTemplateById(name: string): Promise<AirhornTemplate | undefined> {
		const document = await this.templatesCollection.findOne({name});
		if (!document) {
			return undefined;
		}

		return this.mapDocumentToTemplate(document);
	}

	loadOptions(options: MongoStoreProviderOptions) {
		if (options.uri) {
			this.uri = options.uri;
		}
	}

	mapDocumentToTemplate(document: Document): AirhornTemplate {
		const template = new AirhornTemplate(document.name as string);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		template.text = document.text;

		return template;
	}

	mapDocumentsToTemplates(documents: Document[]): AirhornTemplate[] {
		const templates = new Array<AirhornTemplate>();
		for (const document of documents) {
			templates.push(this.mapDocumentToTemplate(document));
		}

		return templates;
	}
}
