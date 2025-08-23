# @airhorn/twilio

Twilio SMS provider for the Airhorn notification system.

## Installation

```bash
pnpm add @airhorn/twilio
```

## Usage

```typescript
import { Airhorn } from '@airhorn/airhorn';
import { TwilioProvider } from '@airhorn/twilio';

// Create Twilio provider
const twilioProvider = new TwilioProvider({
  accountSid: 'your-account-sid',
  authToken: 'your-auth-token',
  fromPhoneNumber: '+1234567890', // Optional default from number
});

// Create Airhorn instance with Twilio provider
const airhorn = new Airhorn({
  providers: [twilioProvider],
});

// Send SMS
const template = {
  from: '+1234567890',
  content: 'Hello {{name}}, your order #{{orderId}} has been shipped!',
};

const result = await airhorn.sendSMS(
  '+0987654321', // to
  template,
  { name: 'John', orderId: '12345' }, // template data
);
```

## Configuration

### TwilioProviderOptions

- `accountSid` (required): Your Twilio Account SID
- `authToken` (required): Your Twilio Auth Token
- `fromPhoneNumber` (optional): Default from phone number for SMS messages
- `region` (optional): Twilio region
- `edge` (optional): Twilio edge location

## Features

- SMS sending via Twilio API
- Automatic error handling and retry support
- Integration with Airhorn's template system
- Support for Twilio's additional message options

## Testing

```bash
pnpm test
```

## License

MIT