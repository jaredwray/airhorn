/* eslint-disable no-await-in-loop */
import {test, expect, describe} from 'vitest';
import { type AirhornContact } from '../../src/airhorn.js';
import { MongoStoreProvider } from '../../src/store/mongo-store-provider.js';

const mongoUri = 'mongodb://localhost:27017';
const mockContact: AirhornContact = {
	firstName: 'John',
	lastName: 'Doe',
	languageCode: 'en',
	notifications: [],
	doNotContact: false,
	created: new Date(),
	modified: new Date(),
	isDeleted: false,
};

describe('MongoStoreProvider', () => {
	test('Initializes with a URI', () => {
		const provider = new MongoStoreProvider(mongoUri);
		expect(provider).toBeDefined();
	});

	test('Get the provider Name and ID', () => {
		const provider = new MongoStoreProvider(mongoUri);
		expect(provider.id).toBe('mongodb-provider');
		expect(provider.name).toBe('MongoDB Provider');
	});

	test('Get Contact By Url when not found', async () => {
		const provider = new MongoStoreProvider(mongoUri);
		const contact = await provider.getContactByUrl('https://example.com');
		expect(contact).toBeUndefined();
	});

	test('Set Contacts with Updates', async () => {
		const provider = new MongoStoreProvider(mongoUri);
		const contacts = await provider.getContacts();
		for (const contact of contacts) {
			if (contact.id) {
				await provider.deleteContact(contact.id);
			}
		}

		const contactOne = await provider.setContact({ ...mockContact, firstName: 'Jane' });
		const contactTwo = await provider.setContact({ ...mockContact, firstName: 'John' });
		const contactThree = { ...mockContact, firstName: 'Trevor' };
		const contactList = [
			contactOne,
			contactTwo,
			contactThree,
		];
		const updatedContacts = await provider.setContacts(contactList);
		expect(updatedContacts).toHaveLength(3);
	});
});
