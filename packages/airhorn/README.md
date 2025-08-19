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
- Built in support for retries and error handling on sends.
- Advanced caching on template compilation and execution.
- Load a template from a file for easy GitOps based workflows.
- Many supported providers such as Twilio, SendGrid, AWS, and Google Cloud.
- Robust (6+ template formats) templating via [ecto](https://github.com/jaredwray/ecto)
- Easily build your own provider with minimal effort via `ServiceProvider` type.
- Statistics tracking for message delivery across providers.
- Maintained on a regular basis with updates and improvements.

# How to Contribute 

Now that you've set up your workspace, you're ready to contribute changes to the `airhorn` repository you can refer to the [CONTRIBUTING](CONTRIBUTING.md) guide. If you have any questions please feel free to ask by creating an issue and label it `question`.

# Licensing and Copyright

This project is [MIT License © Jared Wray](LICENSE)

