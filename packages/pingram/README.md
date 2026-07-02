![Airhorn](https://airhorn.org/logo.svg "Airhorn")

---

[![tests](https://github.com/jaredwray/airhorn/actions/workflows/tests.yml/badge.svg)](https://github.com/jaredwray/airhorn/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/jaredwray/airhorn/branch/main/graph/badge.svg?token=4OJEEB67Q5)](https://codecov.io/gh/jaredwray/airhorn)
[![license](https://img.shields.io/github/license/jaredwray/airhorn)](https://github.com/jaredwray/airhorn/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dm/@airhornjs/pingram)](https://npmjs.com/package/@airhornjs/pingram)
[![npm](https://img.shields.io/npm/v/@airhornjs/pingram)](https://npmjs.com/package/@airhornjs/pingram)

# @airhornjs/pingram

[Pingram](https://www.pingram.io) (formerly NotificationAPI) provider for Airhorn.

## Installation

```bash
npm install airhorn @airhornjs/pingram
```

## Features

- SMS sending via the Pingram API
- Email sending via the Pingram API
- Mobile push notifications via the Pingram API
- One API key for all channels — no per-channel infrastructure to configure
- Multi-region support (`us`, `eu`, `ca`)
- Automatic error handling and integration with Airhorn's notification system

## Usage

### SMS with Pingram

```typescript
import { Airhorn, AirhornSendType } from 'airhorn';
import { AirhornPingram } from '@airhornjs/pingram';

// Create Pingram provider
const pingramProvider = new AirhornPingram({
  apiKey: 'pingram_sk_your_api_key',
});

// Create Airhorn instance with Pingram provider
const airhorn = new Airhorn({
  providers: [pingramProvider],
});

const data = {
  orderId: '12345',
  customerName: 'John',
};

// Send SMS
const template = {
  from: '+1234567890', // Optional: your Pingram sender number (defaults to your provisioned number)
  content: 'Hello <%= customerName %>!, your order #<%= orderId %> has been shipped!',
};

const result = await airhorn.send(
  '+16175551212', // to (E.164 format)
  template,
  data,
  AirhornSendType.SMS
);
```

### Email with Pingram

```typescript
import { Airhorn, AirhornSendType } from 'airhorn';
import { AirhornPingram } from '@airhornjs/pingram';

const pingramProvider = new AirhornPingram({
  apiKey: 'pingram_sk_your_api_key',
});

const airhorn = new Airhorn({
  providers: [pingramProvider],
});

const data = {
  orderId: '656565',
  customerName: 'John',
};

// Send Email
const template = {
  from: 'notifications@yourdomain.com', // Optional: must be a verified sender in Pingram
  subject: 'Order Confirmation: <%= orderId %>',
  content: 'Hi <%= customerName %>, your order #<%= orderId %> has been confirmed!',
};

const result = await airhorn.send(
  'recipient@example.com', // to
  template,
  data,
  AirhornSendType.Email
);
```

### Mobile Push Notifications with Pingram

Pingram delivers mobile push notifications to the device tokens registered for a user, so the `to` value is the Pingram user identifier. Device tokens are registered through the Pingram client SDKs in your mobile apps.

```typescript
import { Airhorn, AirhornSendType } from 'airhorn';
import { AirhornPingram } from '@airhornjs/pingram';

const pingramProvider = new AirhornPingram({
  apiKey: 'pingram_sk_your_api_key',
});

const airhorn = new Airhorn({
  providers: [pingramProvider],
});

const data = {
  orderId: '12345',
  customerName: 'John',
};

const template = {
  from: 'YourApp',
  subject: 'New Order', // Used as the push notification title
  content: 'Hi <%= customerName %>, you have a new order #<%= orderId %>',
};

await airhorn.send(
  'user-123', // Pingram user id with registered push tokens
  template,
  data,
  AirhornSendType.MobilePush
);
```

### Custom Capabilities

You can specify which services to enable using the `capabilities` option:

```typescript
// SMS only
const smsProvider = new AirhornPingram({
  apiKey: 'pingram_sk_your_api_key',
  capabilities: [AirhornSendType.SMS],
});

// Email only
const emailProvider = new AirhornPingram({
  apiKey: 'pingram_sk_your_api_key',
  capabilities: [AirhornSendType.Email],
});

// All capabilities (explicit)
const allProvider = new AirhornPingram({
  apiKey: 'pingram_sk_your_api_key',
  capabilities: [AirhornSendType.SMS, AirhornSendType.Email, AirhornSendType.MobilePush],
});
```

## Configuration

### AirhornPingramOptions

- `apiKey` (required): Your Pingram API key (starts with `pingram_sk_`)
- `region` (optional): Pingram API region — `us` (default), `eu`, or `ca`
- `baseUrl` (optional): Custom base URL for the Pingram API (overrides `region`)
- `notificationType` (optional): The Pingram notification type identifier used for sends (defaults to `airhorn`). Pingram creates the notification type automatically if it does not exist
- `capabilities` (optional): Array of `AirhornSendType` values to specify which services to enable (defaults to SMS, Email, and MobilePush)

## Additional Options

Any additional send options are merged into the Pingram send request, so you can use Pingram features like merge tag parameters, scheduling, and template overrides:

```typescript
await airhorn.send(to, template, data, AirhornSendType.Email, {
  parameters: { firstName: 'John' }, // Pingram template merge tags
  schedule: '2026-12-25T00:00:00Z',  // Schedule delivery
  templateId: 'my_template',         // Use a specific Pingram template
});
```

## Prerequisites

1. Create a [Pingram](https://www.pingram.io) account
2. Get your API key from the Pingram dashboard
3. For SMS: use the included number or provision your own through Pingram
4. For Email: verify your sending domain (or use Pingram's shared domain)
5. For Mobile Push: register device tokens for your users via the Pingram client SDKs

## Testing

```bash
pnpm test
```

# How to Contribute 

Now that you've set up your workspace, you're ready to contribute changes to the `airhorn` repository you can refer to the [CONTRIBUTING](CONTRIBUTING.md) guide. If you have any questions please feel free to ask by creating an issue and label it `question`.

# Licensing and Copyright

This project is [MIT License © Jared Wray](LICENSE)
