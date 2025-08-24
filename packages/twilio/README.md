# @airhorn/twilio

Twilio SMS and SendGrid Email provider for the Airhorn notification system.

## Installation

```bash
pnpm add @airhorn/twilio
```

## Features

- SMS sending via Twilio API
- Email sending via SendGrid API
- Automatic error handling and retry support
- Integration with Airhorn's template system
- Support for additional provider-specific options

## Usage

### SMS with Twilio

```typescript
import { Airhorn } from 'airhorn';
import { TwilioProvider } from '@airhorn/twilio';

// Create Twilio provider for SMS only
const twilioProvider = new TwilioProvider({
  accountSid: 'your-account-sid',
  authToken: 'your-auth-token',
});

// Create Airhorn instance with Twilio provider
const airhorn = new Airhorn({
  providers: [twilioProvider],
});

// Send SMS
const smsTemplate = {
  from: '+1234567890',
  content: 'Hello {{name}}, your order #{{orderId}} has been shipped!',
};

const result = await airhorn.sendSMS(
  '+0987654321', // to
  smsTemplate,
  { name: 'John', orderId: '12345' }, // template data
);
```

### Email with SendGrid

```typescript
import { Airhorn } from 'airhorn';
import { TwilioProvider } from '@airhorn/twilio';

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
const emailTemplate = {
  from: 'sender@example.com',
  subject: 'Order Confirmation',
  content: '<h1>Hello {{name}}</h1><p>Your order #{{orderId}} has been confirmed!</p>',
};

const result = await airhorn.sendEmail(
  'recipient@example.com', // to
  emailTemplate,
  { name: 'Jane', orderId: '67890' }, // template data
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
await airhorn.sendSMS(to, template, data, {
  statusCallback: 'https://example.com/callback',
  maxPrice: '0.50',
  validityPeriod: 14400,
  // ... other Twilio message options
});
```

### SendGrid Email Options

```typescript
await airhorn.sendEmail(to, template, data, {
  replyTo: 'reply@example.com',
  categories: ['transactional', 'order-confirmation'],
  trackingSettings: {
    clickTracking: { enable: true },
    openTracking: { enable: true },
  },
  // ... other SendGrid mail options
});
```

## Testing

```bash
pnpm test
```

## License

MIT