![Airhorn](https://airhorn.org/logo.svg "Airhorn")

---

[![tests](https://github.com/jaredwray/airhorn/actions/workflows/tests.yml/badge.svg)](https://github.com/jaredwray/airhorn/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/jaredwray/airhorn/branch/main/graph/badge.svg?token=4OJEEB67Q5)](https://codecov.io/gh/jaredwray/airhorn)
[![license](https://img.shields.io/github/license/jaredwray/airhorn)](https://github.com/jaredwray/airhorn/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dm/@airhorn/aws)](https://npmjs.com/package/@airhorn/aws)
[![npm](https://img.shields.io/npm/v/@airhorn/aws)](https://npmjs.com/package/@airhorn/aws)

# @airhorn/aws

AWS SNS and SES provider for Airhorn.

## Installation

```bash
pnpm add airhorn @airhorn/aws
```

## Features

- SMS sending via Amazon SNS (Simple Notification Service)
- Email sending via Amazon SES (Simple Email Service)
- Automatic error handling and retry support
- Integration with Airhorn's notification system
- Support for AWS credentials from environment variables or explicit configuration

## Usage

### SMS with Amazon SNS

```typescript
import { Airhorn } from 'airhorn';
import { AirhornAws } from '@airhorn/aws';

// Create AWS provider for SMS
const awsProvider = new AirhornAws({
  region: 'us-east-1',
  accessKeyId: 'your-access-key', // Optional, uses AWS SDK credential chain
  secretAccessKey: 'your-secret-key', // Optional, uses AWS SDK credential chain
});

// Create Airhorn instance with AWS provider
const airhorn = new Airhorn({
  providers: [awsProvider],
});

// Send SMS
const message = {
  from: '+1234567890', // Your sender ID or phone number
  content: 'Hello John!, your order #12345 has been shipped!',
  type: AirhornSendType.SMS,
};

const result = await airhorn.send(
  '+0987654321', // to
  message,
);
```

### Email with Amazon SES

```typescript
import { Airhorn } from 'airhorn';
import { AirhornAws } from '@airhorn/aws';

// Create AWS provider with SES support
const awsProvider = new AirhornAws({
  region: 'us-east-1',
  accessKeyId: 'your-access-key', // Optional
  secretAccessKey: 'your-secret-key', // Optional
});

// Create Airhorn instance
const airhorn = new Airhorn({
  providers: [awsProvider],
});

// Send Email
const message = {
  from: 'sender@example.com', // Must be verified in SES
  subject: 'Order Confirmation',
  content: '<h1>Hello John</h1><p>Your order #656565 has been confirmed!</p>',
  type: AirhornSendType.Email,
};

const result = await airhorn.send(
  'recipient@example.com', // to
  message,
);
```

### Both SMS and Email

By default, the provider supports both SMS and email notifications:

```typescript
const provider = new AirhornAws({
  region: 'us-east-1',
  // AWS credentials can be provided explicitly or loaded from environment
  accessKeyId: 'your-access-key',
  secretAccessKey: 'your-secret-key',
  sessionToken: 'your-session-token', // Optional for temporary credentials
});

// Provider capabilities will include both 'sms' and 'email' by default
console.log(provider.capabilities); // ['sms', 'email']
```

### Custom Capabilities

You can specify which services to enable using the `capabilities` option:

```typescript
// SMS only
const smsProvider = new AirhornAws({
  region: 'us-east-1',
  capabilities: [AirhornSendType.SMS],
});

// Email only
const emailProvider = new AirhornAws({
  region: 'us-east-1',
  capabilities: [AirhornSendType.Email],
});

// Both (explicit)
const bothProvider = new AirhornAws({
  region: 'us-east-1',
  capabilities: [AirhornSendType.SMS, AirhornSendType.Email],
});
```

### Push Notifications to Mobile Devices (iOS/Android)

Amazon SNS can send push notifications to mobile devices through platform application endpoints. Here's how to send notifications to Apple (APNs) and Android (FCM/GCM) devices:

```typescript
import { Airhorn } from 'airhorn';
import { AirhornAws } from '@airhorn/aws';

const awsProvider = new AirhornAws({
  region: 'us-east-1',
  capabilities: [AirhornSendType.SMS], // SNS handles mobile push
});

const airhorn = new Airhorn({
  providers: [awsProvider],
});

// Send to iOS device via APNs
const iosMessage = {
  from: 'YourApp', // Sender ID
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
  type: AirhornSendType.SMS, // SNS handles push notifications
};

// Send to Apple device endpoint ARN
await airhorn.send(
  'arn:aws:sns:us-east-1:123456789012:endpoint/APNS/YourApp/abc123', // iOS endpoint ARN
  iosMessage,
  {
    MessageStructure: 'json', // Required for platform-specific payloads
    MessageAttributes: {
      'AWS.SNS.MOBILE.APNS.PUSH_TYPE': {
        DataType: 'String',
        StringValue: 'alert', // or 'background'
      },
    },
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

// Send to Android device endpoint ARN
await airhorn.send(
  'arn:aws:sns:us-east-1:123456789012:endpoint/GCM/YourApp/xyz789', // Android endpoint ARN
  androidMessage,
  {
    MessageStructure: 'json',
    MessageAttributes: {
      'AWS.SNS.MOBILE.GCM.TTL': {
        DataType: 'String',
        StringValue: '86400', // Time to live in seconds
      },
    },
  },
);

// Send to a topic (broadcasts to all subscribed devices)
await airhorn.send(
  'arn:aws:sns:us-east-1:123456789012:YourAppTopic',
  {
    from: 'YourApp',
    content: JSON.stringify({
      default: 'New announcement available',
      APNS: JSON.stringify({
        aps: {
          alert: 'New announcement available',
          sound: 'default',
        },
      }),
      GCM: JSON.stringify({
        notification: {
          title: 'Announcement',
          body: 'New announcement available',
        },
      }),
    }),
    type: AirhornSendType.MobilePush,
  },
  {
    MessageStructure: 'json',
  },
);
```

**Note**: Before sending push notifications, you need to:
1. Create platform applications in SNS for APNs/FCM
2. Register device tokens and create platform endpoints
3. Optionally create SNS topics for broadcasting
4. Configure proper IAM permissions for SNS platform endpoints

## Configuration

### AirhornAwsOptions

- `region` (required): AWS region (e.g., 'us-east-1', 'eu-west-1')
- `accessKeyId` (optional): AWS access key ID (uses AWS SDK credential chain if not provided)
- `secretAccessKey` (optional): AWS secret access key (uses AWS SDK credential chain if not provided)
- `sessionToken` (optional): AWS session token for temporary credentials
- `capabilities` (optional): Array of `AirhornSendType` values to specify which services to enable (defaults to both SMS and Email)

## Additional Options

You can pass additional provider-specific options as the second parameter to the send method:

### Amazon SNS Options

```typescript
await airhorn.send(to, message, {
  smsType: 'Promotional', // or 'Transactional' (default)
  maxPrice: '0.50', // Maximum price in USD
  // ... other SNS PublishCommand options
});
```

### Amazon SES Options

```typescript
await airhorn.send(to, message, {
  ccAddresses: ['cc@example.com'],
  bccAddresses: ['bcc@example.com'],
  replyToAddresses: ['reply@example.com'],
  returnPath: 'bounces@example.com',
  configurationSetName: 'my-configuration-set',
  tags: [
    { Name: 'campaign', Value: 'summer-sale' },
    { Name: 'customer', Value: 'vip' }
  ],
  // ... other SES SendEmailCommand options
});
```

## Prerequisites

### AWS Credentials

The AWS SDK will automatically look for credentials in the following order:

1. Credentials passed explicitly in `AirhornAwsOptions`
2. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
3. Shared credentials file (`~/.aws/credentials`)
4. IAM role (when running on EC2, ECS, Lambda, etc.)

### Amazon SNS Setup

1. Ensure your AWS account has SNS permissions
2. Configure SMS settings in SNS console if needed
3. Note that SMS capabilities and pricing vary by region

### Amazon SES Setup

1. Verify your sender email address or domain in SES
2. Request production access (SES starts in sandbox mode)
3. Configure any necessary SES settings (configuration sets, etc.)

## IAM Permissions

Minimum required IAM permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail"
      ],
      "Resource": "*"
    }
  ]
}
```

# How to Contribute 

Now that you've set up your workspace, you're ready to contribute changes to the `airhorn` repository you can refer to the [CONTRIBUTING](../../CONTRIBUTING.md) guide. If you have any questions please feel free to ask by creating an issue and label it `question`.

# Licensing and Copyright

This project is [MIT License © Jared Wray](LICENSE)