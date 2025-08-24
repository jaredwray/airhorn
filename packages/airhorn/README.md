![Airhorn](../../site/logo.svg "Airhorn")

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

Once installed, this gives you the main send functionality and built in webhook support. You can use it in your project like so:

```typescript
import { Airhorn, AirhornProviderType } from "airhorn";

const airhorn = new Airhorn();

const template = {
	from: "https://mywebhookdomain.com",
	content: "Hey <%= name %> this is a test message from Airhorn",
	templateEngine: "ejs",
}

const data = { name: "John" };

await airhorn.send("https://mockhttp.org/post", template, data, AirhornProviderType.WEBHOOK);
```

Now lets configure the Airhorn instance with your preferred providers such as `Twilio` for SMS and `SendGrid` for Email.

```bash
npm install airhorn @airhorn/twilio
```

```typescript
import { Airhorn, AirhornProviderType } from "airhorn";
import { AirhornTwilio } from "@airhorn/twilio";

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

To learn about the available providers and their capabilities, check the [Providers](#core-supported-providers) section.

# Airhorn Options

Airhorn provides a variety of options to customize its behavior. You can configure these options when creating an instance of the `Airhorn` class:

```typescript
import { Airhorn, AirhornSendStrategy } from "airhorn";

const airhorn = new Airhorn({
	sendStrategy: AirhornSendStrategy.RoundRobin
});
```

Here is the `AirhornOptions` type:

```typescript
export type AirhornOptions = {
	/**
	 * Whether to enable caching.
	 * @default true
	 */
	cache?: boolean | Cacheable | CacheableOptions;
	/**
	 * Whether to collect statistics.
	 * @default false
	 */
	statistics?: boolean;
	/**
	 * The providers to add to the Airhorn instance. AirhornWebhook is added by default unless `useWebhookProvider` is set to false.
	 */
	providers?: Array<AirhornProvider>;
	/**
	 * Whether to use the built-in webhook provider.
	 * @default true
	 */
	useWebhookProvider?: boolean;
	/**
	 * The retry strategy to use when sending messages.
	 * @default 0
	 */
	retryStrategy?: AirhornRetryStrategy;
	/**
	 * The timeout to use when sending messages.
	 * @default 100
	 */
	timeout?: number;
	/**
	 * The send strategy to use when sending messages.
	 * @default AirhornSendStrategy.RoundRobin
	 */
	sendStrategy?: AirhornSendStrategy;
	/**
	 * Whether to throw an error if sending fails. By default we use emitting for errors
	 * @default false
	 */
	throwOnErrors?: boolean;
};
```

# Using Send Helper Methods

Airhorn provides helper methods for common tasks. For example, you can use the `sendSMS` method to send SMS messages easily:

```typescript
import { Airhorn } from "airhorn";
import { AirhornTwilio } from "@airhorn/twilio";

const providers = [
	new AirhornTwilio({
		accountSid: "your_account_sid",
		authToken: "your_auth_token"
	}),
];

const airhorn = new Airhorn({
	providers
});

const template = {
	from: "+12223334444",
	content: "Hey <%= name %> this is a test message from Airhorn",
	templateEngine: "ejs",
}

const data = { name: "John" };

await airhorn.sendSMS("+1234567890", template, data);
```

Here are the following helper methods available:

- `sendSMS`: Sends an SMS message.
- `sendEmail`: Sends an email message.
- `sendMobilePush`: Sends a mobile push notification.
- `sendWebhook`: Sends a webhook notification.

# Airhorn Send Response

The `send` method returns an `AirhornSendResult` object that contains information about the send operation. Here is the structure of the `AirhornSendResult` type:

```typescript
export type AirhornSendResult = {
	/**
	 * The providers that were used to send the message.
	 */
	providers: Array<AirhornProvider>;
	/**
	 * The message that was sent.
	 */
	message?: AirhornProviderMessage;
	/**
	 * Whether the message was sent successfully.
	 */
	success: boolean;
	/**
	 * The response from the provider.
	 */
	// biome-ignore lint/suspicious/noExplicitAny: expected
	response: any;
	/**
	 * The number of times the message was retried.
	 */
	retries: number;
	/**
	 * The errors that occurred while sending the message.
	 */
	errors: Array<Error>;
	/**
	 * The time taken to execute the send operation.
	 */
	executionTime: number;
};
```

# Airhorn API

Here are all the properties and methods available and a brief description of each:

- `.cache`: Gets the cache instance which is based on `cacheable`.
- `.retryStrategy`: Gets the retry strategy.
- `.timeout`: Gets the timeout for sending messages.
- `.sendStrategy`: Gets the send strategy.
- `.throwOnErrors`: Gets the throw on errors flag.
- `.statistics`: Access the statistics instance. go to [Statistics](#statistics) to learn more.
- `.providers`: Gets the list of configured providers.
- `send()`: Sends a message using the configured providers.
- `sendSMS()`: Sends an SMS message.
- `sendEmail()`: Sends an email message.
- `sendMobilePush()`: Sends a mobile push notification.
- `sendWebhook()`: Sends a webhook notification.
- `loadTemplate()`: Helper method that loads a template from the file system. Go to [Load Template Helper](#load-template-helper) to learn more.
- `getProvidersByType()`: Gets the list of providers by type. _(Used Internally)_
- `setCache()`: Sets the cache instance. _(Used Internally)_
- `addProviders()`: Adds new providers to the Airhorn instance. _(Used Internally)_
- `generateMessage()`: Generates a message from a template and data. _(Used Internally)_

# Using Webhooks

Webhooks is built into Airhorn as a default provider and can be used to send notifications to external services. To use the built in webhooks just create an instance of the `Airhorn` class and call the `send` or `sendWebhook` method.

An example using the `send` method (recommended):

```typescript
import { Airhorn, AirhornProviderType } from "airhorn";

const template = {
	from: "+12223334444",
	to: "+1234567890",
	content: "Hey <%= name %> this is a test message from Airhorn",
	templateEngine: "ejs",
}

const data = { name: "John" };

await airhorn.send("https://mockhttp.org/post", template, data, AirhornProviderType.WEBHOOK);
```

To send using the helper function `sendWebhook`: 

```typescript
import { Airhorn } from "airhorn";

const airhorn = new Airhorn();

const template = {
	from: "+12223334444",
	to: "+1234567890",
	content: "Hey <%= name %> this is a test message from Airhorn",
	templateEngine: "ejs",
}

const data = { name: "John" };

await airhorn.sendWebhook("https://mockhttp.org/post", template, data);
```

# Send Strategies

Airhorn supports multiple send strategies to control how notifications are delivered. You can choose from the following strategies:

- **Round Robin**: Distributes notifications evenly across all available providers.
- **Fail Over**: Tries each provider in order until one succeeds.
- **All**: Sends the notification to all providers simultaneously.

You can configure the send strategy when creating the Airhorn instance:

```typescript
import { Airhorn, AirhornSendStrategy } from "airhorn";

const airhorn = new Airhorn({
	sendStrategy: AirhornSendStrategy.RoundRobin
});
```

# Statistics

Airhorn provides built-in statistics to help you monitor the performance of your notifications. You can access the statistics instance through the `.statistics` property:

```typescript
import { Airhorn } from "airhorn";

const airhorn = new Airhorn({ statistics: true });

// Now you can use the stats object to get information about sent notifications
console.log(`Total Sends: ${airhorn.statistics.totalSends}`);
console.log(`Total Successful Sends: ${airhorn.statistics.totalSendSuccesses}`);
console.log(`Total Failed Sends: ${airhorn.statistics.totalSendFailures}`);

// execution time statistics
console.log(`Total Execution Time: ${airhorn.statistics.totalExecutionTime} ms`);
console.log(`Average Execution Time: ${airhorn.statistics.averageExecutionTime} ms`);
console.log(`Minimum Execution Time: ${airhorn.statistics.minimumExecutionTime} ms`);
console.log(`Maximum Execution Time: ${airhorn.statistics.maxExecutionTime} ms`);

// execution time data Array<SendStatistic>
console.log(`All Execution Times: ${airhorn.statistics.executionTimes}`);
console.log(`Slowest Execution Times: ${airhorn.statistics.slowestExecutionTimes}`);
console.log(`Fastest Execution Times: ${airhorn.statistics.fastestExecutionTimes}`);
```

By default, Airhorn statistics are disabled. You can enable them by setting the `statistics` option to `true` when creating the Airhorn instance. If you want to enable it after the Airhorn instance is created do the following:

```typescript
import { Airhorn } from "airhorn";

const airhorn = new Airhorn();

airhorn.statistics.enable();
```

To reset the statistics, you can call the `reset` method:

```typescript
import { Airhorn } from "airhorn";

const airhorn = new Airhorn();

airhorn.statistics.reset();
```

# Load Template Helper

In previous versions of `Airhon` we used the file system to load all the templates into a store that was used by the instance. Now, we offer an easy method to just load it from a markdown file if you want from anywhere on the file system. 

Here is an example of how to use the `loadTemplate` helper method:

```typescript
import { Airhorn } from "airhorn";

const airhorn = new Airhorn();

const template = await airhorn.loadTemplate("path/to/template.md");

// now you can send with that template
await airhorn.send("https://mockhttp.org/post", template, data, AirhornProviderType.WEBHOOK);
```

An example of the `markdown` format is located at `./packages/airhorn/test/fixtures`.

# Core Supported Providers

We currently support `twilio`, `aws`, and `gcp` (google cloud) with thier offerings. Here is a chart showing what functionality is in each:

| Provider | SMS | Email | Push | Webhook |
|----------|-----|-------|------|---------|
| (built in `airhorn`) | ❌  | ❌    | ❌   | ✅      |
| `@airhorn/twilio`   | ✅  | ✅    | ❌   | ❌      |
| `@airhorn/aws`      | ✅  | ✅    | ✅   | ❌      |
| `@airhorn/gcp`      | ✅  | ✅    | ✅   | ❌      |

# Third Party Providers

If you have built a provider library let us know! We are more than happy to list it here!

# Creating a Provider

To create a provider you can extend the `AirhornProvider` interface and implement the required methods for your specific provider.

```typescript
import { AirhornProvider } from "airhorn";

class MyCustomProvider implements AirhornProvider {
  // Implement required methods
}
```

Once implemented, you can use your custom provider just like any other provider in Airhorn.

```typescript
import { Airhorn, AirhornProvider } from "airhorn";

class MyCustomProvider implements AirhornProvider {
  // Implement required methods
}
const airhorn = new Airhorn({
  providers: [new MyCustomProvider()]
});
```

Use one of the built in providers as a reference such as `@airhorn/twilio`.

# How to Contribute 

Now that you've set up your workspace, you're ready to contribute changes to the `airhorn` repository you can refer to the [CONTRIBUTING](../../CONTRIBUTING.md) guide. If you have any questions please feel free to ask by creating an issue and label it `question`.

# Licensing and Copyright

This project is [MIT License © Jared Wray](LICENSE)

