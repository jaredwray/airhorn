import { AirhornProviderType } from '../src/provider-type.js';
import { AirhornNotificationStatus } from '../src/notification.js';

export class TestingData {
	public users = new Array<TestingUser>();

	constructor() {
		this.users = [
			new TestingUser('John', 'Doe', 'john@gmail.com', ['https://download1.com', 'https://download2.com']),
			new TestingUser('Mary', 'Anne', 'mary@gmail.com', ['https://download1ma.com', 'https://download2ma.com']),
			new TestingUser('Steve', 'Smith', 'steve@gmail.com', ['https://download1ss.com', 'https://download2ss.com', 'https://download3ss.com']),
		];
	}
}

export class TestingUser {
	firstName: string;
	lastName: string;
	email: string;
	downloads: string[];
	constructor(firstName: string, lastName: string, email: string, downloads: string[]) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.downloads = downloads;
	}
}

export const createNotificationOneTestData = {
	to: 'joe1@bar.com',
	from: '',
	subscriptionId: '123',
	providerType: AirhornProviderType.SMTP,
	status: AirhornNotificationStatus.SENT,
	templateName: 'foo.template',
	providerName: 'foo.provider',
};
export const createNotificationTwoTestData = {
	to: 'joe1@bar.com',
	from: '',
	subscriptionId: '123',
	providerType: AirhornProviderType.SMTP,
	status: AirhornNotificationStatus.SENT,
	templateName: 'foo.template',
	providerName: 'foo.provider',
};
