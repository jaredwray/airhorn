![Airhorn](https://airhorn.org/logo.svg "Airhorn")

---

[![tests](https://github.com/jaredwray/airhorn/actions/workflows/tests.yml/badge.svg)](https://github.com/jaredwray/airhorn/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/jaredwray/airhorn/branch/main/graph/badge.svg?token=4OJEEB67Q5)](https://codecov.io/gh/jaredwray/airhorn)
[![license](https://img.shields.io/github/license/jaredwray/airhorn)](https://github.com/jaredwray/airhorn/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dm/@airhorn/azure)](https://npmjs.com/package/@airhorn/azure)
[![npm](https://img.shields.io/npm/v/@airhorn/azure)](https://npmjs.com/package/@airhorn/azure)

# @airhorn/azure

Azure Communication Services and Notification Hubs provider for Airhorn.

## Installation

```bash
pnpm add airhorn @airhorn/azure
```

## Features

- SMS sending via Azure Communication Services
- Email sending via Azure Communication Services
- Mobile push notifications to iOS and Android devices via Azure Notification Hubs
- Automatic error handling and retry support
- Integration with Airhorn's notification system
- Support for multiple connection strings

## Usage

### SMS with Azure Communication Services

```typescript
import { Airhorn } from 'airhorn';
import { AirhornAzure } from '@airhorn/azure';

// Create Azure provider for SMS
const azureProvider = new AirhornAzure({
  connectionString: 'endpoint=https://your-service.communication.azure.com/;accesskey=your-key',
});

// Create Airhorn instance with Azure provider
const airhorn = new Airhorn({
  providers: [azureProvider],
});

// Send SMS
const message = {
  from: '+1234567890', // Your sender phone number (must be provisioned in Azure)
  content: 'Hello John!, your order #12345 has been shipped!',
  type: AirhornSendType.SMS,
};

const result = await airhorn.send(
  '+0987654321', // to
  message,
);
```

### Email with Azure Communication Services

```typescript
import { Airhorn } from 'airhorn';
import { AirhornAzure } from '@airhorn/azure';

// Create Azure provider with email support
const azureProvider = new AirhornAzure({
  connectionString: 'endpoint=https://your-service.communication.azure.com/;accesskey=your-key',
});

// Create Airhorn instance
const airhorn = new Airhorn({
  providers: [azureProvider],
});

// Send Email
const message = {
  from: 'DoNotReply@yourdomain.com', // Must be verified domain in Azure
  subject: 'Order Confirmation',
  content: 'Your order #656565 has been confirmed!',
  type: AirhornSendType.Email,
};

const result = await airhorn.send(
  'recipient@example.com', // to
  message,
  {
    html: '<h1>Hello John</h1><p>Your order #656565 has been confirmed!</p>',
    cc: ['manager@example.com'],
    bcc: ['archive@example.com'],
  },
);
```

### Mobile Push Notifications with Azure Notification Hubs

```typescript
import { Airhorn } from 'airhorn';
import { AirhornAzure } from '@airhorn/azure';

const azureProvider = new AirhornAzure({
  notificationHubConnectionString: 'Endpoint=sb://your-namespace.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=your-key',
  notificationHubName: 'your-hub-name',
});

const airhorn = new Airhorn({
  providers: [azureProvider],
});

// Send to iOS device via APNs
const iosMessage = {
  from: 'YourApp',
  content: JSON.stringify({
    aps: {
      alert: {
        title: 'New Order',
        body: 'You have a new order #12345',
      },
      badge: 1,
      sound: 'default',
    },
    // Custom data
    orderId: '12345',
  }),
  type: AirhornSendType.MobilePush,
};

// Send using tag expression
await airhorn.send(
  'user:john-doe', // Tag expression
  iosMessage,
  {
    platform: 'apple',
    tags: 'user:john-doe && ios',
  },
);

// Send to Android device via FCM
const androidMessage = {
  from: 'YourApp',
  content: JSON.stringify({
    notification: {
      title: 'New Order',
      body: 'You have a new order #12345',
      icon: 'ic_notification',
      color: '#ff0000',
    },
    data: {
      orderId: '12345',
      type: 'new_order',
    },
  }),
  type: AirhornSendType.MobilePush,
};

// Send to Android devices
await airhorn.send(
  'user:jane-doe', // Tag expression
  androidMessage,
  {
    platform: 'android',
    tags: 'user:jane-doe && android',
  },
);

// Broadcast to all users with specific tags
await airhorn.send(
  'broadcast-tag',
  {
    from: 'YourApp',
    content: JSON.stringify({
      notification: {
        title: 'Announcement',
        body: 'New features available!',
      },
    }),
    type: AirhornSendType.MobilePush,
  },
  {
    tags: 'registered && (ios || android)',
  },
);
```

### Custom Capabilities

You can specify which services to enable using the `capabilities` option:

```typescript
// SMS only
const smsProvider = new AirhornAzure({
  connectionString: 'your-connection-string',
  capabilities: [AirhornSendType.SMS],
});

// Email only
const emailProvider = new AirhornAzure({
  connectionString: 'your-connection-string',
  capabilities: [AirhornSendType.Email],
});

// Mobile Push only
const pushProvider = new AirhornAzure({
  notificationHubConnectionString: 'your-hub-connection-string',
  notificationHubName: 'your-hub-name',
  capabilities: [AirhornSendType.MobilePush],
});

// All capabilities (explicit)
const allProvider = new AirhornAzure({
  connectionString: 'your-communication-services-connection-string',
  notificationHubConnectionString: 'your-hub-connection-string',
  notificationHubName: 'your-hub-name',
  capabilities: [AirhornSendType.SMS, AirhornSendType.Email, AirhornSendType.MobilePush],
});
```

## Configuration

### AirhornAzureOptions

- `connectionString` (optional): Azure Communication Services connection string (used for both SMS and Email if specific strings not provided)
- `emailConnectionString` (optional): Specific connection string for Email service
- `smsConnectionString` (optional): Specific connection string for SMS service
- `notificationHubConnectionString` (optional): Azure Notification Hub connection string
- `notificationHubName` (optional): Azure Notification Hub name
- `capabilities` (optional): Array of `AirhornSendType` values to specify which services to enable (defaults to SMS, MobilePush, and Email)

## Additional Options

### SMS Options

```typescript
await airhorn.send(to, message, {
  // Additional SMS options from Azure Communication Services
  deliveryReportTimeoutInSeconds: 300,
  tag: 'custom-tag',
});
```

### Email Options

```typescript
await airhorn.send(to, message, {
  cc: ['cc@example.com'],
  bcc: ['bcc@example.com'],
  replyTo: 'reply@example.com',
  html: '<html><body>HTML content</body></html>',
  attachments: [
    {
      name: 'attachment.pdf',
      contentType: 'application/pdf',
      contentInBase64: 'base64-encoded-content',
    },
  ],
  headers: {
    'X-Custom-Header': 'value',
  },
});
```

### Mobile Push Options

```typescript
await airhorn.send(to, message, {
  platform: 'apple' | 'android', // Specify target platform
  tags: 'tag1 && (tag2 || tag3)', // Tag expression for targeting
  apnsHeaders: {
    'apns-priority': '10',
    'apns-expiration': '0',
  },
});
```

## Prerequisites

### Azure Communication Services

1. Create an Azure Communication Services resource in Azure Portal
2. Get your connection string from the resource
3. For SMS: Provision a phone number through the Azure Portal
4. For Email: Verify your sending domain

### Azure Notification Hubs

1. Create a Notification Hub namespace and hub in Azure Portal
2. Configure platform credentials (APNs for iOS, FCM for Android)
3. Get your connection string and hub name
4. Implement device registration in your mobile apps

## Azure RBAC Permissions

Minimum required permissions for the service principal or managed identity:

### For Communication Services:
- `Azure Communication Services Contributor` role
- Or specific permissions:
  - `Microsoft.Communication/CommunicationServices/read`
  - `Microsoft.Communication/CommunicationServices/write`

### For Notification Hubs:
- `Azure Notification Hubs Contributor` role
- Or specific permissions:
  - `Microsoft.NotificationHubs/Namespaces/NotificationHubs/read`
  - `Microsoft.NotificationHubs/Namespaces/NotificationHubs/write`

## Testing

```bash
pnpm test
```

# How to Contribute 

Now that you've set up your workspace, you're ready to contribute changes to the `airhorn` repository you can refer to the [CONTRIBUTING](../../CONTRIBUTING.md) guide. If you have any questions please feel free to ask by creating an issue and label it `question`.

# Licensing and Copyright

This project is [MIT License © Jared Wray](LICENSE)