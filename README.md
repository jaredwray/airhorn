![Airhorn](site/logo.svg "Airhorn")

---

[![tests](https://github.com/jaredwray/airhorn/actions/workflows/tests.yml/badge.svg)](https://github.com/jaredwray/airhorn/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/jaredwray/airhorn/branch/main/graph/badge.svg?token=4OJEEB67Q5)](https://codecov.io/gh/jaredwray/airhorn)
[![license](https://img.shields.io/github/license/jaredwray/airhorn)](https://github.com/jaredwray/airhorn/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dm/airhorn)](https://npmjs.com/package/airhorn)
[![npm](https://img.shields.io/npm/v/airhorn)](https://npmjs.com/package/airhorn)

# Cloud Native Notifications Library

Airhorn makes it easy to send SMS, SMTP, Webhooks, and mobile push notifications easily using templates through your standard cloud providers. We focused on making it cloud native by default (using cloud services).

# Features

* GitOps Based Templating System - email, SMS, mobile push, and webhooks all in one place!
* Email Notifications - easily send email across multiple providers and even load balance or active/passive fail over. 
* SMS Notifications - SMS that is easy to use via a robust template system. 
* Mobile Push Notifications - Push to IOS and Android devices.
* Webhook Notifications - Built right into the system as a native feature.
* 100% Code Coverage / Tested with Integration Tests
* Built using [ecto](https://github.org/jaredwray/ecto) for handling multiple templates such as EJS, Handlebars, and more.

# Getting Started

To get started with Airhorn, you can install the package via npm:

```bash
npm install airhorn
```

# Add Providers

We currently support multiple providers and you can easily add more by following the `AirhornProvider` interface. Here are the supported providers:

We currently support `twilio`, `aws`, and `azure` with thier offerings. Here is a chart showing what functionality is in each:

| Provider | SMS | Email | Push | Webhook |
|----------|-----|-------|------|---------|
| (built in `airhorn`) | ❌  | ❌    | ❌   | ✅      |
| `@airhorn/twilio`   | ✅  | ✅    | ❌   | ❌      |
| `@airhorn/aws`      | ✅  | ✅    | ✅   | ❌      |
| `@airhorn/azure`      | ✅  | ✅    | ✅   | ❌      |

Note: We used to support firebase because of mobile push but it made more sense to focus on `aws` and `azure` because it is more comprehensive.

# How to Contribute 

Now that you've set up your workspace, you're ready to contribute changes to the `airhorn` repository you can refer to the [CONTRIBUTING](CONTRIBUTING.md) guide. If you have any questions please feel free to ask by creating an issue and label it `question`.

# Publishing Airhorn

To publish `Airhorn` to npm you first want to set the overall version in the `package.json` file. You can do this by updating the `version` field. Once you have done that then call:

```bash
pnpm version:sync
```

This will set all the versions in the monorepo to the same version as we deploy based on that. 

# Licensing and Copyright

This project is [MIT License © Jared Wray](LICENSE)

