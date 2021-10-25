![Airhorn Logo](docs/images/logo-horizontal.png "Airhorn Logo")

-----

[![build](https://github.com/jaredwray/airhorn/actions/workflows/build.yaml/badge.svg)](https://github.com/jaredwray/airhorn/actions/workflows/build.yaml)
[![release](https://github.com/jaredwray/airhorn/actions/workflows/release.yaml/badge.svg)](https://github.com/jaredwray/airhorn/actions/workflows/release.yaml)
[![codecov](https://codecov.io/gh/jaredwray/airhorn/branch/main/graph/badge.svg?token=4OJEEB67Q5)](https://codecov.io/gh/jaredwray/airhorn)
[![license](https://img.shields.io/github/license/jaredwray/airhorn)](https://github.com/jaredwray/airhorn/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dm/airhorn)](https://npmjs.com/package/airhorn)

## Cloud Native Notifications Library

Airhorn was born to enable a more robust notification system. We focused on making it cloud native by default (using cloud services) and also scalable with queue management and retry rate so that you can scale to hundreds if not thousands of instances. 

## Features

* GitOps Based Templating System - email, sms, mobile push, and webhooks all in one place!
* Email Notifications - easily send email across multple providers and even load balance or active/passive fail over. 
* SMS Notifications - SMS that is easy to use via a robust template system. 
* Mobile Push Notifications - Push to IOS and Android devices.
* Webhook Notifications - Built right into the system as a native feature with retry support.
* 100% Code Coverage / Tested with Integration Tests
* Built using ecto for handling multiple templates

# Settings / Opts

templatePath
defaultTemplateLanguage

## Library API

- Templates
- Channels

### Airhorn

* send()
* Providers
* Templates

## Cloud Services
* Email: Twilio Sendgrid and AWS SES
* SMS: Twilio and AWS SNS
* Mobile Push: Google Firebase and AWS SNS