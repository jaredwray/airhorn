![Airhorn](site/logo.svg "Airhorn")

---

[![tests](https://github.com/jaredwray/airhorn/actions/workflows/tests.yml/badge.svg)](https://github.com/jaredwray/airhorn/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/jaredwray/airhorn/branch/main/graph/badge.svg?token=4OJEEB67Q5)](https://codecov.io/gh/jaredwray/airhorn)
[![license](https://img.shields.io/github/license/jaredwray/airhorn)](https://github.com/jaredwray/airhorn/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dm/airhorn)](https://npmjs.com/package/airhorn)
[![npm](https://img.shields.io/npm/v/airhorn)](https://npmjs.com/package/airhorn)

# Cloud Native Notifications

`Airhorn` simplifies the process of notifications by using templates to send messages across various providers with a common easy to use interface. 

- Supports multiple notification types: SMS, Email, Mobile Push, Webhooks
- A unified API for all notification types using the `send()` method.
- Hooks and Emitting built in by default for extendability and observability.
- Send Strategy (Round Robin, Fail Over, All) Choose the best delivery method for each notification.
- Built in Webhook support for sending notifications to external services.
- Built in support for retries and error handling on sends.
- Advanced caching on template compilation and execution.
- Load a template from a file for easy GitOps based workflows.
- Many supported providers such as Twilio (with Sendgrid), AWS, and Google Cloud.
- Robust (6+ template formats) templating via [ecto](https://github.com/jaredwray/ecto)
- Easily build your own provider with minimal effort via `AirhornProvider` interface.
- Statistics tracking for send successes, failures, and execution times (instance only).
- ESM and Typescript based supporting Nodejs 20+
- Maintained on a regular basis with updates and improvements.

# Getting Started

To get started with Airhorn, you can install it via npm:

```bash
npm install airhorn
```

Once installed, this gives you the main send functionality and webhook support. You can use it in your project like so:

```typescript
import { Airhorn } from "airhorn";

const airhorn = new Airhorn();

airhorn.sendWebhook("https://mockhttp.org/post", {
	from: "test@example.com",
	subject: "Test Subject",
	content: "{ message: \"Hello <%= name %>!\" }",
	templateEngine: "ejs",
}, {
	name: "John"
});
```

Now lets configure the Airhorn instance with your preferred providers such as `Twilio` for SMS and `SendGrid` for Email.

```bash
npm install airhorn @airhorn/twilio
```

```typescript
import { Airhorn } from "airhorn";
import { AirhornTwilio } from "@airhorn/twilio";

const airhorn = new Airhorn();
const providers = [
	new AirhornTwilio({
		accountSid: "your_account_sid",
		authToken: "your_auth_token"
	}),
];

airhorn.sendSMS(to: `+1234567890`, {
	from: "+12223334444",
	subject: "Test Subject",
	content: "Hey <%= name %> this is a test message from Airhorn",
	templateEngine: "ejs",
}, {
	name: "John"
});
```

# Migrating from v4 to v5


# Using Webhooks


# Send Strategies

Airhorn supports multiple send strategies to control how notifications are delivered. You can choose from the following strategies:

- **Round Robin**: Distributes notifications evenly across all available providers.
- **Fail Over**: Tries each provider in order until one succeeds.
- **All**: Sends the notification to all providers simultaneously.

You can configure the send strategy when creating the Airhorn instance:

```typescript
import { Airhorn } from "airhorn";

const airhorn = new Airhorn({
	sendStrategy: "round-robin"
});
```

# Core Supported Providers

We currently support `twilio`, `aws`, and `gcp` (google cloud) with thier offerings. Here is a chart showing what functionality is in each:

| Provider | SMS | Email | Push | Webhook |
|----------|-----|-------|------|---------|
| (built in `airhorn`) | ❌  | ❌    | ❌   | ✅      |
| `@airhorn/twilio`   | ✅  | ✅    | ❌   | ❌      |
| `@airhorn/aws`      | ✅  | ✅    | ✅   | ❌      |
| `@airhorn/gcp`      | ✅  | ✅    | ✅   | ❌      |

# Third Party Providers

If you have build a provider library let us know! We are more than happy to list it here!

# Creating a Provider

# How to Contribute 

Now that you've set up your workspace, you're ready to contribute changes to the `airhorn` repository you can refer to the [CONTRIBUTING](CONTRIBUTING.md) guide. If you have any questions please feel free to ask by creating an issue and label it `question`.

# Licensing and Copyright

This project is [MIT License © Jared Wray](LICENSE)

