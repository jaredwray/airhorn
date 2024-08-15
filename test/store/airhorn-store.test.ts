/* eslint-disable unicorn/no-array-for-each */
import {test, expect, describe} from 'vitest';
import { ObjectId } from 'mongodb';
import { AirhornStore, AirhornProviderType, type AirhornContact } from '../../src/airhorn.js';
import { MongoStoreProvider } from '../../src/store/mongo-store-provider.js';

const mongodbUri = 'mongodb://localhost:27017/airhorn';
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
describe('AirhornStore', async () => {
	test('Init with MongoDB', async () => {
		const store = new AirhornStore(new MongoStoreProvider(mongodbUri));
		expect(store.provider).toBeDefined();
	});

	test('Ability to get and set Provider', async () => {
		const provider = new MongoStoreProvider(mongodbUri);
		const store = new AirhornStore(provider);
		expect(store.provider).toEqual(provider);
		store.provider = new MongoStoreProvider(mongodbUri.replace('localhost', '127.0.0.1'));
		expect(store.provider).not.toEqual(provider);
	});

	test('Create a Contact', async () => {
		const store = new AirhornStore(new MongoStoreProvider(mongodbUri));
		const contact = { ...mockContact };
		const result = await store.setContact(contact);
		expect(result).toBeDefined();
		expect(result.id).toBeDefined();
		if (result.id) {
			await store.deleteContact(result.id);
		}
	});

	test('Update / Set a Contact', async () => {
		const store = new AirhornStore(new MongoStoreProvider(mongodbUri));
		const contact = { ...mockContact };
		const result = await store.setContact(contact);
		expect(result).toBeDefined();
		expect(result.id).toBeDefined();

		result.firstName = 'Jane';
		const updated = await store.setContact(result);

		expect(updated).toBeDefined();
		expect(updated.firstName).toBe('Jane');
		if (updated.id) {
			await store.deleteContact(updated.id);
		}
	});

	test('Update Notifications on Contact', async () => {
		const store = new AirhornStore(new MongoStoreProvider(mongodbUri));
		const contact = { ...mockContact };
		const result = await store.setContact(contact);
		expect(result).toBeDefined();
		expect(result.id).toBeDefined();

		const notification = {
			templateName: 'test',
			providerType: AirhornProviderType.SMTP,
			enabled: true,
		};
		result.notifications = [notification];
		const updated = await store.setContact(result);

		expect(updated).toBeDefined();
		expect(updated.notifications).toBeDefined();
		if (updated.notifications) {
			expect(updated.notifications.length).toBe(1);
			expect(updated.notifications[0].templateName).toBe('test');
		}

		if (updated.id) {
			await store.deleteContact(updated.id);
		}
	});

	test('Create and Delete a Contact', async () => {
		const store = new AirhornStore(new MongoStoreProvider(mongodbUri));
		const contact = { ...mockContact };
		const result = await store.setContact(contact);
		expect(result).toBeDefined();
		expect(result.id).toBeDefined();
		if (result.id) {
			const deleted = await store.deleteContact(result.id);
			expect(deleted).toBe(true);
		}
	});

	test('Get Contact by Email', async () => {
		const store = new AirhornStore(new MongoStoreProvider(mongodbUri));
		const contactOne = { ...mockContact, firstName: 'foo'};
		contactOne.notifications = [
			{
				templateName: 'test', providerType: AirhornProviderType.SMTP, enabled: true, email: 'foo@foo.com',
			},
			{
				templateName: 'test', providerType: AirhornProviderType.SMTP, enabled: true, email: 'baz@baz.com',
			},
		];
		const contactTwo = { ...mockContact, firstName: 'bar' };
		contactTwo.notifications = [
			{
				templateName: 'test', providerType: AirhornProviderType.SMTP, enabled: true, email: 'bar@bar.com',
			},
			{
				templateName: 'test', providerType: AirhornProviderType.SMTP, enabled: true, email: 'bar1@bar1.com',
			},
		];
		await store.setContact(contactOne);
		await store.setContact(contactTwo);
		const resultOne = await store.getContactByEmail('baz@baz.com');
		if (resultOne?.notifications) {
			expect(resultOne?.notifications[0].email).toBe('foo@foo.com');
		} else {
			test.fails('No notifications found');
		}

		if (resultOne?.id) {
			await store.deleteContact(resultOne.id);
		}

		const resultTwo = await store.getContactByEmail('bar@bar.com');
		if (resultTwo?.id) {
			await store.deleteContact(resultTwo.id);
		}
	});
	test('Get Contact by Phone', async () => {
		const store = new AirhornStore(new MongoStoreProvider(mongodbUri));
		const contactOne = { ...mockContact, firstName: 'foo'};
		contactOne.notifications = [
			{
				templateName: 'test', providerType: AirhornProviderType.SMS, enabled: true, phone: '1234567890',
			},
			{
				templateName: 'test', providerType: AirhornProviderType.SMS, enabled: true, phone: '0987654321',
			},
		];
		const resulSettOne = await store.setContact(contactOne);

		const resultOne = await store.getContactByPhone('1234567890');
		if (resultOne?.notifications) {
			expect(resultOne?.notifications[0].phone).toBe('1234567890');
		} else {
			test.fails('No notifications found');
		}

		if (resulSettOne?.id) {
			await store.deleteContact(resulSettOne.id);
		}
	});
	test('Get Contact by URL', async () => {
		const store = new AirhornStore(new MongoStoreProvider(mongodbUri));
		const contactOne = { ...mockContact, firstName: 'foo'};
		contactOne.notifications = [
			{
				templateName: 'test', providerType: AirhornProviderType.WEBHOOK, enabled: true, url: 'http://foo.com',
			},
			{
				templateName: 'test', providerType: AirhornProviderType.WEBHOOK, enabled: true, url: 'http://baz.com',
			},
		];
		const resulSettOne = await store.setContact(contactOne);
		const resultOne = await store.getContactByUrl('http://baz.com');
		if (resultOne?.notifications) {
			expect(resultOne?.notifications[0].url).toBe('http://foo.com');
		} else {
			test.fails('No notifications found');
		}

		if (resulSettOne?.id) {
			await store.deleteContact(resulSettOne.id);
		}
	});
	test('Get Contact by ID', async () => {
		const store = new AirhornStore(new MongoStoreProvider(mongodbUri));
		const contact = { ...mockContact };
		const result = await store.setContact(contact);
		expect(result).toBeDefined();
		expect(result.id).toBeDefined();
		if (result?.id) {
			const resultOne = await store.getContactById(result.id);
			expect(resultOne).toBeDefined();
			expect(resultOne?.id).toBe(result.id);
			if (resultOne?.id) {
				await store.deleteContact(resultOne.id);
			}
		} else {
			test.fails('No ID found');
		}
	});
	test('Get Contacts', async () => {
		const store = new AirhornStore(new MongoStoreProvider(mongodbUri));
		const clearResults = await store.getContacts();
		clearResults.forEach(async contact => {
			if (contact.id) {
				await store.deleteContact(contact.id);
			}
		});
		const contactOne = { ...mockContact, firstName: 'foo'};
		const contactTwo = { ...mockContact, firstName: 'bar1' };
		await store.setContact(contactOne);
		await store.setContact(contactTwo);
		const result = await store.getContacts();
		expect(result).toBeDefined();
		expect(result.length).toBe(2);
		if (result[0].id) {
			await store.deleteContact(result[0].id);
		}

		if (result[1].id) {
			await store.deleteContact(result[1].id);
		}

		const finalResults = await store.getContacts();
		expect(finalResults.length).toBe(0);
	});
	test('Merge Contacts', async () => {
		const store = new AirhornStore(new MongoStoreProvider(mongodbUri));
		const contactOne = { ...mockContact, firstName: 'foo'};
		contactOne.notifications = [
			{
				templateName: 'test', providerType: AirhornProviderType.SMS, enabled: true, phone: '1234567890',
			},
			{
				templateName: 'test', providerType: AirhornProviderType.SMS, enabled: true, phone: '0987654321',
			},
		];
		const contactTwo = { ...mockContact, firstName: 'bar1' };
		contactTwo.notifications = [
			{
				templateName: 'test', providerType: AirhornProviderType.SMTP, enabled: true, phone: 'bar@bar.com',
			},
			{
				templateName: 'test', providerType: AirhornProviderType.WEBHOOK, enabled: true, phone: 'https://baz.com',
			},
		];

		await store.setContact(contactOne);
		await store.setContact(contactTwo);

		const result = await store.getContacts();

		if (result.length === 2) {
			const mergedResult = await store.mergeContacts(result[0], result[1]);
			expect(mergedResult).toBeDefined();
			expect(mergedResult.notifications).toBeDefined();
			expect(mergedResult.notifications?.length).toBe(4);
		} else {
			test.fails('Contact Merge failed');
		}

		const cleanContacts = await store.getContacts();
		cleanContacts.forEach(async contact => {
			if (contact.id) {
				await store.deleteContact(contact.id);
			}
		});
	});

	test('Set contact Email', async () => {
		const store = new AirhornStore(new MongoStoreProvider(mongodbUri));
		const contact = { ...mockContact };
		contact.notifications = [
			{
				templateName: 'test', providerType: AirhornProviderType.SMTP, enabled: true, email: 'foo@foo.com',
			},
		];
		const resultSetContact = await store.setContact(contact);
		if (resultSetContact.id) {
			const result = await store.setContactEmail(resultSetContact.id, 'bar@bar.com');
			if (result?.notifications) {
				expect(result?.notifications[0].email).toBe('bar@bar.com');
			} else {
				test.fails('No notifications');
			}
		} else {
			test.fails('No Contact ID found');
		}

		if (resultSetContact.id) {
			await store.deleteContact(resultSetContact.id);
		}
	});

	test('Set Contact Email When Doesnt Exist', async () => {
		const store = new AirhornStore(new MongoStoreProvider(mongodbUri));
		const id = ObjectId.createFromTime(Date.now()).toHexString();
		const result = await store.setContactEmail(id, 'me@you.com');
		expect(result).toBeUndefined();
	});

	test('Set Multiple Contacts', async () => {
		const store = new AirhornStore(new MongoStoreProvider(mongodbUri));
		const contactOne = { ...mockContact, firstName: 'foo'};
		const contactTwo = { ...mockContact, firstName: 'bar1' };
		const contactThree = { ...mockContact, firstName: 'baz' };
		const contactFour = { ...mockContact, firstName: 'qux' };
		const contactFive = { ...mockContact, firstName: 'quux' };
		const contactSix = { ...mockContact, firstName: 'corge' };
		const contactSeven = { ...mockContact, firstName: 'grault' };
		const contactEight = { ...mockContact, firstName: 'garply' };
		const contactNine = { ...mockContact, firstName: 'waldo' };
		const contactTen = { ...mockContact, firstName: 'fred' };
		const contacts = [
			contactOne,
			contactTwo,
			contactThree,
			contactFour,
			contactFive,
			contactSix,
			contactSeven,
			contactEight,
			contactNine,
			contactTen,
		];
		const results = await store.setContacts(contacts);
		expect(results).toBeDefined();
		expect(results.length).toBe(10);
		const contactList = new Array<string>();
		for (const contact of results) {
			if (contact.id) {
				contactList.push(contact.id);
			}
		}

		const resultDelete = await store.deleteContacts(contactList);

		expect(resultDelete).toBeDefined();
		expect(resultDelete.length).toBe(10);
	});

	test('Delete Contact By Email', async () => {
		const store = new AirhornStore(new MongoStoreProvider(mongodbUri));
		const contact = { ...mockContact };
		contact.notifications = [{
			templateName: 'test', providerType: AirhornProviderType.SMTP, enabled: true, email: 'foo@foo.com',
		}];
		await store.setContact(contact);
		const result = await store.deleteContactByEmail('foo@foo.com');
		expect(result).toBe(true);
		const resultFalse = await store.deleteContactByEmail('foo1@foo.com');
		expect(resultFalse).toBe(false);
	});

	test('Delete Contact By Phone', async () => {
		const store = new AirhornStore(new MongoStoreProvider(mongodbUri));
		const contact = { ...mockContact };
		contact.notifications = [{
			templateName: 'test', providerType: AirhornProviderType.SMS, enabled: true, phone: '1234567890',
		}];
		await store.setContact(contact);
		const result = await store.deleteContactByPhone('1234567890');
		expect(result).toBe(true);
		const resultFalse = await store.deleteContactByPhone('0987654321');
		expect(resultFalse).toBe(false);
	});
});

