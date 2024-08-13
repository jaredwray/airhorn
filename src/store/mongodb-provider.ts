import {
	MongoClient, type Db, type Collection, ObjectId,
} from 'mongodb';
import { type AirhornContact, type AirhornStoreProvider } from './airhorn-store.js';

export class MongodbProvider implements AirhornStoreProvider {
	public collectionName = 'contacts';
	private readonly db: Db;
	private readonly collection: Collection;

	constructor(private readonly uri: string) {
		const client = new MongoClient(this.uri);
		this.db = client.db();
		this.collection = this.db.collection(this.collectionName);
	}

	get id(): string {
		return 'mongodb-provider';
	}

	get name(): string {
		return 'MongoDB Provider';
	}

	async getContactByEmail(email: string): Promise<AirhornContact | undefined> {
		const document = await this.collection.findOne({ 'notifications.email': email, isDeleted: false });
		if (!document) {
			return undefined; // Or `undefined`
		}

		const contact = this.mapDocumentToContact(document);

		return contact;
	}

	async getContactByPhone(phone: string): Promise<AirhornContact | undefined> {
		const document = await this.collection.findOne({ 'notifications.phone': phone, isDeleted: false });
		if (!document) {
			return undefined; // Or `undefined`
		}

		const contact = this.mapDocumentToContact(document);

		return contact;
	}

	async getContactByUrl(url: string): Promise<AirhornContact | undefined> {
		const document = await this.collection.findOne({ 'notifications.url': url, isDeleted: false });
		if (!document) {
			return undefined; // Or `undefined`
		}

		const contact = this.mapDocumentToContact(document);

		return contact;
	}

	async getContactById(id: string): Promise<AirhornContact | undefined> {
		const objectId = new ObjectId(id);
		const document = await this.collection.findOne({ _id: objectId, isDeleted: false });
		if (!document) {
			return undefined; // Or `undefined`
		}

		const contact = this.mapDocumentToContact(document);

		return contact;
	}

	async getContacts(): Promise<AirhornContact[]> {
		const contacts = new Array<AirhornContact>();
		const document = await this.collection.find({ isDeleted: false }).toArray();
		for (const document_ of document) {
			contacts.push(this.mapDocumentToContact(document_));
		}

		return contacts;
	}

	async setContact(contact: AirhornContact): Promise<AirhornContact> {
		const now = new Date();
		contact.modified = now;

		if (contact.id) {
			const objectId = new ObjectId(contact.id);
			await this.collection.updateOne({ _id: objectId }, { $set: contact });
			return { ...contact, id: objectId.toString() };
		}

		contact.created = now;
		contact.isDeleted = false;
		const result = await this.collection.insertOne(contact);
		return { ...contact, id: result.insertedId.toString() };
	}

	async setContacts(contacts: AirhornContact[]): Promise<AirhornContact[]> {
		const now = new Date();
		const operations = contacts.map(contact => {
			contact.modified = now;
			if (contact.id) {
				const objectId = new ObjectId(contact.id);
				return {
					updateOne: {
						filter: { _id: objectId },
						update: { $set: contact },
					},
				};
			}

			contact.created = now;
			contact.isDeleted = false;
			return { insertOne: { document: contact } };
		});
		await this.collection.bulkWrite(operations);
		return this.getContacts(); // Returning all contacts after operations
	}

	async deleteContact(id: string): Promise<boolean> {
		const objectId = new ObjectId(id);
		const result = await this.collection.updateOne({ _id: objectId }, { $set: { isDeleted: true, modified: new Date() } });
		return result.modifiedCount === 1;
	}

	async deleteContacts(ids: string[]): Promise<boolean[]> {
		const objectIds = ids.map(id => new ObjectId(id));
		const result = await this.collection.updateMany({ _id: { $in: objectIds } }, { $set: { isDeleted: true, modified: new Date() } });
		return ids.map(id => result.modifiedCount > 0);
	}

	private mapDocumentToContact(document: any): AirhornContact {
		return {
			id: document._id.toString(),
			firstName: document.firstName,
			lastName: document.lastName,
			languageCode: document.languageCode,
			notifications: document.notifications,
			doNotContact: document.doNotContact,
			created: document.created,
			modified: document.modified,
			isDeleted: document.isDeleted,
		};
	}
}
