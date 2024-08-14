import { type ProviderType } from '../provider-type.js';

export type AirhornContact = {
	id?: string;
	firstName?: string;
	lastName?: string;
	languageCode?: string;
	notifications?: AirhornNotification[];
	doNotContact: boolean;
	created: Date;
	modified: Date;
	isDeleted: boolean;
};

export type AirhornNotification = {
	templateName: string;
	providerType: ProviderType;
	phone?: string;
	email?: string;
	url?: string;
	enabled: boolean;
};

export type AirhornStoreProvider = {
	id: string;
	name: string;
	getContactByEmail(email: string): Promise<AirhornContact | undefined>;
	getContactByPhone(phone: string): Promise<AirhornContact | undefined>;
	getContactByUrl(url: string): Promise<AirhornContact | undefined>;
	getContactById(id: string): Promise<AirhornContact | undefined>;
	getContacts(): Promise<AirhornContact[]>;
	setContact(contact: AirhornContact): Promise<AirhornContact>;
	setContacts(contacts: AirhornContact[]): Promise<AirhornContact[]>;
	deleteContact(id: string): Promise<boolean>;
	deleteContacts(ids: string[]): Promise<boolean[]>;
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

	public async getContactByEmail(email: string): Promise<AirhornContact | undefined> {
		return this._provider.getContactByEmail(email);
	}

	public async getContactByPhone(phone: string): Promise<AirhornContact | undefined> {
		return this._provider.getContactByPhone(phone);
	}

	public async getContactByUrl(url: string): Promise<AirhornContact | undefined> {
		return this._provider.getContactByUrl(url);
	}

	public async getContactById(id: string): Promise<AirhornContact | undefined> {
		return this._provider.getContactById(id);
	}

	public async getContacts(): Promise<AirhornContact[]> {
		return this._provider.getContacts();
	}

	public async mergeContacts(primary: AirhornContact, secondary: AirhornContact): Promise<AirhornContact> {
		const mergedContact: AirhornContact = {
			id: primary.id,
			firstName: primary.firstName,
			lastName: primary.lastName,
			languageCode: primary.languageCode,
			notifications: primary.notifications ?? [],
			doNotContact: primary.doNotContact,
			created: primary.created,
			modified: new Date(),
			isDeleted: false,
		};

		if (secondary.notifications) {
			for (const notification of secondary.notifications) {
				const existingNotification = mergedContact.notifications?.find(
					n => n.templateName === notification.templateName && n.providerType === notification.providerType,
				);
				if (!existingNotification) {
					mergedContact.notifications?.push(notification);
				}
			}
		}

		await this.setContact(mergedContact);
		if (secondary.id) {
			await this.deleteContact(secondary.id);
		}

		return mergedContact;
	}

	public async setContact(contact: AirhornContact): Promise<AirhornContact> {
		return this._provider.setContact(contact);
	}

	public async setContactEmail(id: string, email: string): Promise<AirhornContact | undefined> {
		const contact = await this.getContactById(id);
		if (contact?.notifications) {
			for (const notification of contact.notifications) {
				notification.email &&= email;
			}

			return this.setContact(contact);
		}

		return undefined;
	}

	public async setContacts(contacts: AirhornContact[]): Promise<AirhornContact[]> {
		return this._provider.setContacts(contacts);
	}

	public async deleteContact(id: string): Promise<boolean> {
		return this._provider.deleteContact(id);
	}

	public async deleteContacts(ids: string[]): Promise<boolean[]> {
		return this._provider.deleteContacts(ids);
	}

	public async deleteContactByEmail(email: string): Promise<boolean> {
		const contact = await this.getContactByEmail(email);
		if (contact?.id) {
			return this.deleteContact(contact.id);
		}

		return false;
	}

	public async deleteContactByPhone(phone: string): Promise<boolean> {
		const contact = await this.getContactByPhone(phone);
		if (contact?.id) {
			return this.deleteContact(contact.id);
		}

		return false;
	}
}
