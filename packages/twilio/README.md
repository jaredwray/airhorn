![Airhorn](https://airhorn.org/logo.svg "Airhorn")

---

[![tests](https://github.com/jaredwray/airhorn/actions/workflows/tests.yml/badge.svg)](https://github.com/jaredwray/airhorn/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/jaredwray/airhorn/branch/main/graph/badge.svg?token=4OJEEB67Q5)](https://codecov.io/gh/jaredwray/airhorn)
[![license](https://img.shields.io/github/license/jaredwray/airhorn)](https://github.com/jaredwray/airhorn/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dm/@airhornjs/twilio)](https://npmjs.com/package/@airhornjs/twilio)
[![npm](https://img.shields.io/npm/v/@airhornjs/twilio)](https://npmjs.com/package/@airhornjs/twilio)

# @airhornjs/twilio

Twilio SMS and SendGrid Email provider for the Airhorn notification system.

## Installation

```bash
npm install airhorn @airhornjs/twilio
```

## Features

- SMS sending via Twilio API
- Email sending via SendGrid API
- Automatic error handling and retry support
- Integration with Airhorn's notification system

## Usage

### SMS with Twilio

```typescript
import { Airhorn } from 'airhorn';
import { AirhornTwilio } from '@airhornjs/twilio';

// Create Twilio provider for SMS only
const twilioProvider = new AirhornTwilio({
  accountSid: 'your-account-sid',
  authToken: 'your-auth-token',
});

// Create Airhorn instance with Twilio provider
const airhorn = new Airhorn({
  providers: [twilioProvider],
});

// Send SMS
const message = {
  from: '+1234567890',
  content: 'Hello John!, your order #12345 has been shipped!',
  type: AirhornProviderType.SMS,
};

const result = await airhorn.send(
  '+0987654321', // to
  message,
);
```

### Email with SendGrid

```typescript
import { Airhorn } from 'airhorn';
import { TwilioProvider } from '@airhornjs/twilio';

// Create Twilio provider with SendGrid support
const twilioProvider = new TwilioProvider({
  accountSid: 'your-account-sid',
  authToken: 'your-auth-token',
  sendGridApiKey: 'your-sendgrid-api-key', // Enables email support
});

// Create Airhorn instance
const airhorn = new Airhorn({
  providers: [twilioProvider],
});

// Send Email
const message = {
  from: 'sender@example.com',
  subject: 'Order Confirmation',
  content: '<h1>Hello John</h1><p>Your order #656565 has been confirmed!</p>',
  type: AirhornProviderType.Email,
};

const result = await airhorn.send(
  'recipient@example.com', // to
  message,
);
```

### Both SMS and Email

When configured with both Twilio and SendGrid credentials, the provider supports both SMS and email notifications:

```typescript
const provider = new TwilioProvider({
  // Twilio SMS configuration
  accountSid: 'your-account-sid',
  authToken: 'your-auth-token',
  
  // SendGrid Email configuration
  sendGridApiKey: 'your-sendgrid-api-key',
  
  // Optional Twilio configuration
  region: 'sydney',
  edge: 'sydney',
});

// Provider capabilities will include both 'sms' and 'email'
console.log(provider.capabilities); // ['sms', 'email']
```

## Configuration

### AirhornTwilioOptions

- `accountSid` (required): Your Twilio Account SID
- `authToken` (required): Your Twilio Auth Token
- `sendGridApiKey` (optional): Your SendGrid API key (enables email support)
- `region` (optional): Twilio region
- `edge` (optional): Twilio edge location

## Additional Options

You can pass additional provider-specific options as the second parameter to the send method:

### Twilio SMS Options

```typescript
await airhorn.send(to, message, {
  statusCallback: 'https://example.com/callback',
  maxPrice: '0.50',
  validityPeriod: 14400,
  // ... other Twilio message options
});
```

### SendGrid Email Options

```typescript
await airhorn.send(to, message, {
  replyTo: 'reply@example.com',
  categories: ['transactional', 'order-confirmation'],
  trackingSettings: {
    clickTracking: { enable: true },
    openTracking: { enable: true },
  },
  // ... other SendGrid mail options
});
```

# How to Contribute 

Now that you've set up your workspace, you're ready to contribute changes to the `airhorn` repository you can refer to the [CONTRIBUTING](../../CONTRIBUTING.md) guide. If you have any questions please feel free to ask by creating an issue and label it `question`.

# Licensing and Copyright

This project is [MIT License © Jared Wray](LICENSE)
