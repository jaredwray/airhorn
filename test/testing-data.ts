import { type CreateAirhornSubscription } from 'store.js';
import { AirhornProviderType } from '../src/provider-type.js';
import { AirhornNotificationStatus } from '../src/notification.js';
import { AirhornTemplate, AirhornTemplateText } from '../src/template.js';

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

export class TestingDataTwo {
	public userOne = new TestingUser('John', 'Doe', 'john@gmail.com', ['https://download1.com', 'https://download2.com']);
	public userTwo = new TestingUser('Mary', 'Anne', 'mary@gmail.com', ['https://download1ma.com', 'https://download2ma.com']);
	public userThree = new TestingUser('Steve', 'Smith', 'steve@gmail.com', ['https://download1ss.com', 'https://download2ss.com', 'https://download3ss.com']);
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

export const createSubscriptionOneTestData: CreateAirhornSubscription = {
	to: 'me1@you1.com',
	templateName: 'template1',
	providerType: AirhornProviderType.SMTP,
};

export const createSubscriptionTwoTestData: CreateAirhornSubscription = {
	to: 'me2@you2.com',
	templateName: 'template2',
	providerType: AirhornProviderType.MOBILE_PUSH,
	externalId: '123',
};

export const airhornTestTemplateText = new AirhornTemplateText();
airhornTestTemplateText.langCode = 'en';
airhornTestTemplateText.properties.set('subject', 'Test Subject');
airhornTestTemplateText.templateFormat = 'handlebars';
airhornTestTemplateText.text = 'Test Text';

export const airhornTestTemplate = new AirhornTemplate('airhorn-test-template');
airhornTestTemplate.text.push(airhornTestTemplateText);
