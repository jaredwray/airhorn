import { type AirhornProviderType } from './provider-type.js';

export enum AirhornNotificationStatus {
	QUEUED = 'QUEUED',
	SENT = 'SENT',
	DELIVERED = 'DELIVERED',
	FAILED = 'FAILED',
	CANCELLED = 'CANCELLED',
}

export type AirhornNotification = {
	id: string;
	to: string;
	subscriptionId: string;
	externalId?: string;
	providerType: AirhornProviderType;
	status: AirhornNotificationStatus;
	templateName: string;
	templateData?: any;
	providerName: string;
	providerResponse: string[];
	createdAt: Date;
	modifiedAt: Date;
};
