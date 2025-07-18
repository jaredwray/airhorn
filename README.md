![Airhorn](site/logo.svg "Airhorn")

---

[![tests](https://github.com/jaredwray/airhorn/actions/workflows/tests.yml/badge.svg)](https://github.com/jaredwray/airhorn/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/jaredwray/airhorn/branch/main/graph/badge.svg?token=4OJEEB67Q5)](https://codecov.io/gh/jaredwray/airhorn)
[![license](https://img.shields.io/github/license/jaredwray/airhorn)](https://github.com/jaredwray/airhorn/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dm/airhorn)](https://npmjs.com/package/airhorn)
[![npm](https://img.shields.io/npm/v/airhorn)](https://npmjs.com/package/airhorn)

# Cloud Native Notifications Library

Airhorn makes it easy to send SMS, SMTP, Webhooks, and mobile push notifications easily using templates through your standard cloud providers. We focused on making it cloud native by default (using cloud services).

# Table of Contents
* [Features](#features)
* [Getting Started](#getting-started)
* [Library API](#library-api)
* [Templates](#templates)
* [Template Providers (In Memory, MongoDB, Postgres)](#template-providers-in-memory-mongodb-postgres)
* [File System Templates](#file-system-templates)
* [Examples for using this library](#examples-for-using-this-library)
* [Supported Cloud Service Providers](#supported-cloud-service-providers)
* [ESM and Node Version Support](#esm-and-node-version-support)
* [How to Contribute](#how-to-contribute)
* [Setting up your Development Environment](#setting-up-your-development-environment)
* [Licensing and Copyright](#licensing-and-copyright)

# Features

* GitOps Based Templating System - email, SMS, mobile push, and webhooks all in one place!
* Email Notifications - easily send email across multiple providers and even load balance or active/passive fail over. 
* SMS Notifications - SMS that is easy to use via a robust template system. 
* Mobile Push Notifications - Push to IOS and Android devices.
* Webhook Notifications - Built right into the system as a native feature.
* 100% Code Coverage / Tested with Integration Tests
* Built using [ecto](https://github.org/jaredwray/ecto) for handling multiple templates such as EJS, Handlebars, and more.

# Gettign Started

To get started with Airhorn, you can install the package via npm:

```bash
npm install airhorn
```

Then, you can use the library in your code:

```js
import { createAirhorn, AirhornProviderType } from 'airhorn';

const airhorn = new createAirhorn({
    TEMPLATE_PATH: './your-template-path',
    DEFAULT_TEMPLATE_LANGUAGE: 'en',
    SENDGRID_API_KEY: 'YOUR_SEND_GRID_API_KEY',
});
const data = {
    // your data to render the template goes here
}

airhorn.send('me@you.com', 'no-contact@company.com', 'template-name', AirhornProviderType.SMTP, data, 'en');
```

# Library API

## `send()`

The `send()` function, located in `airhorn.ts`, is used to send notifications. It accepts the following parameters:

* `to` (string): The address to send the message to. Based on the message provider, this address can be either a phone number, an email address, or a web address.
* `from` (string): The address of the sender of the message.
* `templateName` (string): The name of the template to use for the message.
* `providerType` (AirhornProviderType): The type of message to be sent. `AirhornProviderType` is an enum with the values `SMTP`, `SMS`, `WEBHOOK`, and `MOBILE_PUSH`.
* `data` (any): The information to pass to the message. This parameter is typically a data object or a string. The data can include the raw message to be sent, or it can be used to populate a message template.
* `languageCode` (string): The language code of the message template to be sent.

## `sendSMTP()`

The `sendSMTP()` function, located in `airhorn.ts`, is used to send `SMTP` notifications. It accepts the following parameters:

* `to` (string): The address to send the message to. Based on the message provider, this address can be either a phone number, an email address, or a web address.
* `from` (string): The address of the sender of the message.
* `templateName` (string): The name of the template to use for the message.
* `data` (any): The information to pass to the message. This parameter is typically a data object or a string. The data can include the raw message to be sent, or it can be used to populate a message template.
* `languageCode` (string): The language code of the message template to be sent.

## `sendSMS()`

The `sendSMS()` function, located in `airhorn.ts`, is used to send `SMS` notifications. It accepts the following parameters:

* `to` (string): The address to send the message to. Based on the message provider, this address can be either a phone number, an email address, or a web address.
* `from` (string): The address of the sender of the message.
* `templateName` (string): The name of the template to use for the message.
* `data` (any): The information to pass to the message. This parameter is typically a data object or a string. The data can include the raw message to be sent, or it can be used to populate a message template.
* `languageCode` (string): The language code of the message template to be sent.

## `sendWebhook()`

The `sendWebhook()` function, located in `airhorn.ts`, is used to send `Webhook` notifications. It accepts the following parameters:

* `to` (string): The address to send the message to. Based on the message provider, this address can be either a phone number, an email address, or a web address.
* `from` (string): The address of the sender of the message.
* `templateName` (string): The name of the template to use for the message.
* `data` (any): The information to pass to the message. This parameter is typically a data object or a string. The data can include the raw message to be sent, or it can be used to populate a message template.
* `languageCode` (string): The language code of the message template to be sent.

## `sendMobilePush()`

The `sendMobilePush()` function, located in `airhorn.ts`, is used to send `Mobile Push` notifications. It accepts the following parameters:

* `to` (string): The address to send the message to. Based on the message provider, this address can be either a phone number, an email address, or a web address.
* `from` (string): The address of the sender of the message.
* `templateName` (string): The name of the template to use for the message.
* `data` (any): The information to pass to the message. This parameter is typically a data object or a string. The data can include the raw message to be sent, or it can be used to populate a message template.
* `languageCode` (string): The language code of the message template to be sent.

## `options`

The `AirhornOptions` enables you to configure the settings of Airhorn. It accepts the following parameters:

* `TEMPLATE_PATH` (string): The path where the notification system checks for templates. By default, this is set to './templates'
* `DEFAULT_TEMPLATE_LANGUAGE` (string): The default language code the notification system uses for localization, if a language code is not provided. By default, this is set to `en` for English localization.
* `TWILIO_SMS_ACCOUNT_SID` (string): The ID of your Twilio SMS account. By default, this value is undefined.
* `TWILIO_SMS_AUTH_TOKEN` (string): The authentication token for your Twilio SMS account. By default, this value is undefined.
* `TWILIO_SENDGRID_API_KEY` (string): The API key for your Twilio SendGrid account. By default, this value is undefined.
* `AWS_SES_REGION` (string): For AWS, the endpoint region where an email is sent. By default, this value is undefined.
* `AWS_SMS_REGION` (string): For AWS, The endpoint region where an SMS is sent. By default, this value is undefined.
* `AWS_SNS_REGION` (string): For AWS, the endpoint region where a push notification is sent. By default, this value is undefined.
* `FIREBASE_CERT` (string): The certificate for sending push notifications through Google Firebase. By default, this value is undefined.
* `TEMPLATE_PROVIDER` (AirhornTemplateProvider): The template provider to use. By default, this value is `MemoryTemplateProvider`.

These settings can be overridden by passing them in when you create a new instance of `Airhorn`:

```javascript
const airhorn = new createAirhorn({
    TEMPLATE_PATH: './templates',
    DEFAULT_TEMPLATE_LANGUAGE: 'en',
    TWILIO_SMS_ACCOUNT_SID: 'YOUR TWILIO ACCOUNT SID',
    TWILIO_SMS_AUTH_TOKEN: 'YOUR TWILIO AUTH TOKEN',
    TWILIO_SENDGRID_API_KEY: 'YOUR SENDGRID API KEY',
    AWS_SES_REGION: 'YOUR AWS SES REGION',
    AWS_SMS_REGION: 'YOUR AWS SMS REGION',
    AWS_SNS_REGION: 'YOUR AWS SNS REGION',
    FIREBASE_CERT: 'YOUR FIREBASE CERTIFICATE',
    TEMPLATE_PROVIDER: 'YOUR TEMPLATE PROVIDER'
});
```

# Templates

This library supports the use of templates to easily send formatted messages to different providers. Sample templates can be found in `test/templates` within the subdirectories `cool-multi-lingual`, `generic-template-foo`, and `multiple-types-bar`.

## Language Localization

With templates, users can easily send messages in different languages. A sample architecture for language localized templates can be found in the `cool-multi-lingual` directory within `test/templates`. This directory contains folders for English and Spanish language codes, 'en' and 'es' respectively. Each of these directories contains SMS, SMTP, and Webhook templates in the appropriate language. To send notifications in a specific language, users can simply provide the appropriate `languageCode` parameter to the `send()` function.

## Template Overrides

When looking at the sample templates, we can see that some of them support word substitution. For example, the generic SMTP template looks like this:

``` hbs
<p>Hello {{ firstName }} {{ lastName }}</p>
<p>Your email is {{ email }} and this is a generic template</p>
```

To substitute the appropriate text for `firstName`, `lastName`, and `email`, users can provide the appropriate data to the `send()` function. This data is then passed to the template and rendered automatically.

# Template Providers (In Memory, MongoDB, Postgres)

By default Airhorn uses an in-memory provider called `MemoryTemplateProvider`. This is great for testing and quick use cases. Which means that you can load your templates into memory and use then. This is done when you call `createAirhorn()` with the `TEMPLATE_PATH` set.

```javascript
import { createAirhorn } from 'airhorn';
const airhorn = new createAirhorn({ TEMPLATE_PATH: './your-template-path' });
```

If you want to use `MongoDB` or `Postgres` you can use the `MongoTemplateProvider` or `PostgresTemplateProvider`. This is great for production and long running services. 

```javascript
import { createAirhorn, MongoTemplateProvider } from 'airhorn';

const airhorn = new createAirhorn({
    TEMPLATE_PATH: './your-template-path',
    TEMPLATE_PROVIDER: new MongoTemplateProvider('mongodb://localhost:27017', 'airhorn')
});
```

You can also do it by just passing in the uri note that the other options will be set to the defaults. :

```javascript
import { createAirhorn } from 'airhorn';

const airhorn = new createAirhorn({
    TEMPLATE_PATH: './your-template-path',
    TEMPLATE_PROVIDER: 'postgres://localhost:5432/airhorn'
});
```

Once you load a specific provider you will want to sync your templates to the provider. This is done using the `syncTemplatesToAirhorn` function. 

```javascript
import { syncTemplatesToAirhorn, createAirhorn } from 'airhorn';

const airhorn = new createAirhorn({
    TEMPLATE_PATH: './your-template-path',
    TEMPLATE_PROVIDER: 'postgres://localhost:5432/airhorn'
});

await syncTemplatesToAirhorn('./your-template-path', airhorn);
```

# File System Templates

In most cases we want to use the file system to store our templates for all the benefits of gitops and versioning. We have added good support for loading templates from the file system based on the following structure:

```
templates
├── cool-multi-lingual
│   ├── en
│   │   ├── sms.hbs
│   │   ├── smtp.hbs
│   │   └── webhook.hbs
│   └── es
│       ├── sms.hbs
│       ├── smtp.hbs
│       └── webhook.hbs
├── generic-template-foo
│   ├── sms.hbs
|   ├── smtp.hbs
|   └── webhook.hbs
```

In this example you can see that we have the template name `cool-multi-lingual` and then the language code `en` for English. Then we have the type of template `sms`, `smtp`, and `webhook`. This is the structure that we use to load templates from the file system.

If you do not need to support multiple languages you can just have the template name and the type of template like the example of `generic-template-foo`.

# Examples for using this library

This library can be used to easily send a variety of notifications. In this section, we'll cover how to implement some simple use cases.

## Sending a simple email

Using the send function, we can email 'john@doe.org' from 'hello@testing.com' using the generic template 'generic-template-foo'. We'll also use the provider type `AirhornProviderType.SMTP` to indicate that we're sending an email:

```javascript
import { createAirhorn, AirhornProviderType } from 'airhorn';
const airhorn = new createAirhorn({ TEMPLATE_PATH: './your-template-path' });
await airhorn.send('john@doe.org', 'hello@testing.com', 'generic-template-foo', AirhornProviderType.SMTP);
```

## Sending a simple webhook

Here, we'll send a simple webhook to the URL 'https://mockhttp.org/post':

``` javascript
const airhorn = new createAirhorn({ TEMPLATE_PATH: './your-template-path' });
airhorn.send('https://mockhttp.org/post', 'foo', 'bar', AirhornProviderType.WEBHOOK);
```

## Using multiple providers

In this example, we'll send a message using multiple email providers:

1. Add in the AWS SES configuration
2. Add in the Sendgrid configuration
3. Send the message and it will randomly balance between the two providers.

```javascript
const airhorn = new createAirhorn({
        TEMPLATE_PATH: './your-template-path',
        AWS_SES_REGION = 'us-east-1',
        TWILIO_SENDGRID_API_KEY = 'SENDGRID_API_KEY'
	});

await airhorn.send('john@doe.org', 'hello@testing.com', 'generic-template-foo', AirhornProviderType.SMTP);

```

# Supported Cloud Service Providers

This library supports sending notifications via email, SMS, and Mobile Push for the following providers:

* Email: AWS SES and Twilio Sendgrid
* SMS: AWS SMS and Twilio
* Mobile Push: AWS SNS and Google Firebase

In this section, we'll describe how to use each of these notification services.

## Email providers

This library supports sending emails via AWS SES and Twilio Sendgrid.

## AWS SES

After configuring your system to use AWS SES, you can easily use `airhorn` to send emails. In this example, we'll email 'john@doe.org' from 'hello@testing.com' using the email template 'generic-template-foo'. We'll list the provider type as `AirhornProviderType.SMTP` to indicate that we're sending an email:

```javascript
const airhorn = new createAirhorn({
        TEMPLATE_PATH: './your-template-path',
        AWS_SES_REGION = 'us-east-1',
	});
await airhorn.send('john@doe.org', 'hello@testing.com', 'generic-template-foo', AirhornProviderType.SMTP);
```

## Twilio Sendgrid

To send emails via Twilio Sendgrid, first update the `TWILIO_SENDGRID_API_KEY` value via `AirhornOptions`. Then, we can use the same syntax as above to send an email through Twilio Sendgrid:

```javascript
const airhorn = new createAirhorn({
        TEMPLATE_PATH: './your-template-path',
        TWILIO_SENDGRID_API_KEY = 'SENDGRID_API_KEY'
	});
await airhorn.send('john@doe.org', 'hello@testing.com', 'generic-template-foo', AirhornProviderType.SMTP);
```

## SMS providers

This library supports sending SMS using AWS SMS and Twilio.

### AWS SMS

Once your system is configured to use AWS SMS, you can send SMS notifications through AWS SMS. In this example, we'll send the notification to the phone number '5555555555' from the number '5552223333' with the raw text data 'Test message text'. Then, we'll list the provider type as `AirhornProviderType.SMS`.

```javascript
const airhorn = new createAirhorn({
        TEMPLATE_PATH: './your-template-path',
        AWS_SMS_REGION = 'us-east-1',
    });
await airhorn.send('5555555555', '5552223333', 'Test message text', AirhornProviderType.SMS);
```

### Twilio SMS

To send SMS notifications via Twilio SMS, first update the `TWILIO_SMS_ACCOUNT_SID` and the `TWILIO_SMS_AUTH_TOKEN` values via the `AirhornOptions` as shown below. Then, we can send an SMS notification using the same syntax as above:

```javascript
const airhorn = new createAirhorn({
        TEMPLATE_PATH: './your-template-path',
        TWILIO_SMS_ACCOUNT_SID = 'TWILIO_SMS_ACCOUNT_SID',
        TWILIO_SMS_AUTH_TOKEN = 'TWILIO_SMS_AUTH_TOKEN'
    });
await airhorn.send('5555555555', '5552223333', 'Test message text', AirhornProviderType.SMS);
```

## Mobile push providers

This library supports sending Mobile Push notifications using AWS SNS and Google Firebase.

### AWS SNS

To use AWS SNS you will need to create a new SNS application in the AWS console and integrate the AWS SNS SDK into your application. 

1. [Obtain the credentials and device token](https://docs.aws.amazon.com/sns/latest/dg/sns-prerequisites-for-mobile-push-notifications.html) for the mobile platforms that you want to support.
2. Use the credentials to create a platform application object (PlatformApplicationArn) using Amazon SNS. For more information, see [Creating a platform endpoint](https://docs.aws.amazon.com/sns/latest/dg/mobile-platform-endpoint.html). 
3. Use the returned credentials to request a device token for your mobile app and device from the mobile platforms. The token you receive represents your mobile app and device.
4. Use the device token and the PlatformApplicationArn to create a platform endpoint object (EndpointArn) using Amazon SNS. For more information, see [Creating a platform endpoint](https://docs.aws.amazon.com/sns/latest/dg/mobile-platform-endpoint.html).

Then, you can send the push message to the device endpoint using `airhorn`:

```javascript
const airhorn = new createAirhorn({
        TEMPLATE_PATH: './your-template-path',
        AWS_SNS_REGION = 'us-east-1',
    });
await airhorn.send('endpointArn', '', 'generic-template-foo', AirhornProviderType.MOBILE_PUSH);
```

### Firebase for Mobile Push

To use Firebase in your application, you will need to create a new project in the Firebase console and integrate the Firebase SDK according to the [Firebase documentation](https://firebase.google.com/docs/cloud-messaging).

In your Firebase Project Settings, go to the `Service accounts` tab to generate your `private key` as a json file and put the content of the file as `FIREBASE_CERT` environment variable.

Then, you can send the push message to the device endpoint using `airhorn`:

```javascript
const airhorn = new createAirhorn({
        TEMPLATE_PATH: './your-template-path',
        FIREBASE_CERT = 'FIREBASE_CERT'
    });
await airhorn.send('endpointArn', '', 'generic-template-foo', AirhornProviderType.MOBILE_PUSH);
```

# ESM and Node Version Support

This package is ESM only and tested on the current lts version and its previous. Please don't open issues for questions regarding CommonJS / ESM or previous Nodejs versions.

# How to Contribute 

Now that you've set up your workspace, you're ready to contribute changes to the `airhorn` repository you can refer to the [CONTRIBUTING](CONTRIBUTING.md) guide. If you have any questions please feel free to ask by creating an issue and label it `question`.

# Setting up your Development Environment

To set up your development environment, you'll need the following dependencies:
* Node.js (latest)
* Docker
* Firebase Account (this is for the firebase-cert.json file)

Set up your firebase account and generate the firebase-cert.json file. Then, place the file in the root of the project. This is needed even for testing as mocking the firebase-admin is almost impossible. After that you should run the following commands:

```bash
pnpm i && pnpm test:services:start && pnpm test
```

This will start the services needed for testing and run the tests.

To stop the services, you can run:

```bash
pnpm test:services:stop
```

If you are using `nvm` you can run the following:

```bash
nvm use && pnpm i && pnpm test:services:start && pnpm test
```

# Licensing and Copyright

This project is [MIT License © Jared Wray](LICENSE)

