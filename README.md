![Airhorn](site/logo.svg "Airhorn")

[![tests](https://github.com/jaredwray/airhorn/actions/workflows/tests.yml/badge.svg)](https://github.com/jaredwray/airhorn/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/jaredwray/airhorn/branch/main/graph/badge.svg?token=4OJEEB67Q5)](https://codecov.io/gh/jaredwray/airhorn)
[![license](https://img.shields.io/github/license/jaredwray/airhorn)](https://github.com/jaredwray/airhorn/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dm/airhorn)](https://npmjs.com/package/airhorn)
[![npm](https://img.shields.io/npm/v/airhorn)](https://npmjs.com/package/airhorn)

# Cloud Native Notifications Library

Airhorn makes it easy to send SMS, SMTP, Webhooks, and mobile push notifications easily using templates through your standard cloud providers. We focused on making it cloud native by default (using cloud services).

# Features

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

To get started with Airhorn, you can install the package via npm:

```bash
npm install airhorn @airhornjs/twilio
```

```typescript
import { Airhorn, AirhornProviderType } from "airhorn";
import { AirhornTwilio } from "@airhornjs/twilio";

const providers = [
	new AirhornTwilio({
		accountSid: "your_account_sid",
		authToken: "your_auth_token"
	}),
];

const airhorn = new Airhorn({
	providers
});

// this will give you twilio and webhook (built in) support. Now lets create a template and send it!
const template = {
	from: "+12223334444",
	content: "Hey <%= name %> this is a test message from Airhorn",
	templateEngine: "ejs",
}

const data = { name: "John" };

await airhorn.send("+1234567890", template, data, AirhornProviderType.SMS);
```

Check out the documentation and providers to learn more!

# Providers

We currently support multiple providers and you can easily add more by following the `AirhornProvider` interface. Here are the supported providers:

We currently support `twilio`, `aws`, and `azure` with thier offerings. Here is a chart showing what functionality is in each:

| Provider | SMS | Email | Push | Webhook |
|----------|-----|-------|------|---------|
| (built in `airhorn`) | ❌  | ❌    | ❌   | ✅      |
| `@airhornjs/twilio`   | ✅  | ✅    | ❌   | ❌      |
| `@airhornjs/aws`      | ✅  | ✅    | ✅   | ❌      |
| `@airhornjs/azure`      | ✅  | ✅    | ✅   | ❌      |

Note: We used to support firebase because of mobile push but it made more sense to focus on `aws` and `azure` because it is more comprehensive.

# How to Contribute 

Now that you've set up your workspace, you're ready to contribute changes to the `airhorn` repository you can refer to the [CONTRIBUTING](CONTRIBUTING.md) guide. If you have any questions please feel free to ask by creating an issue and label it `question`.

This will set all the versions in the monorepo to the same version as we deploy based on that. 

# Licensing and Copyright

This project is [MIT License © Jared Wray](LICENSE)

