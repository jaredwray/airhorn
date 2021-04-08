![Airhorn Logo](docs/images/logo-horizontal.png "Airhorn Logo")

-----

![airhorn-build](https://github.com/jaredwray/airhorn/workflows/airhorn-build/badge.svg)
![airhorn-release](https://github.com/jaredwray/airhorn/workflows/airhorn-release/badge.svg)
[![codecov](https://codecov.io/gh/jaredwray/airhorn/branch/main/graph/badge.svg?token=4OJEEB67Q5)](https://codecov.io/gh/jaredwray/airhorn)
[![license](https://img.shields.io/github/license/jaredwray/airhorn)](https://github.com/jaredwray/airhorn/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dm/airhorn)](https://npmjs.com/package/airhorn)

## Cloud Native Notifications Library

Airhorn was born out of a need to enable a more robust notifications system for many of the applications that were built and maintained by the team. We focused on making it cloud native by default (using cloud services) and also scalable with queue management and retry rate so that you can scale to hundreds if not thousands of instances. 

## Features

* GitOps Based Templating System - your email, sms, mobile, and webhooks all in one place!
* Email Notifications - easily send email across multple providers and even load balance or active/passive fail over. 
* SMS Notifications - SMS that is easy to use via a robust template system. 
* Mobile Push Notifications - Push to IOS and 
* Webhook Notifications - Built right into the system as a native feature with retry support. 
* View Send History / Logs via API / Client for multiple numbers, emails, and urls.
* Pluggable Cloud Based Architecture - use the services you know
* Scalable and Enterprise Grade - Ability to scale to thousands of requests per second and retry based system. 
* 100% Code Coverage / Tested
* Deploy straight from the latest supported docker instance if you want to just use the REST API.
* Examples of how to Deploy (Github Actions, CircleCI, TravisCI)
* Built using ecto for hanling multiple templates

# Settings


## Library API

### Airhorn

* send()
* sendNow()
* Providers
* getHistory({url:[], email:[], sms:[], mobile:[]})

### Airhorn.Worker

* processTask()
* processEmailTask()
* processSMSTask()
* processMobilePushTask()
* processWebhookTask()
* SMS (IProvider)
* Email (IProvider)
* MobilePush (IProvider)
* languageDefault (set to `en` by default)

### Airhorn.Server - REST API and Worker

* `<version>`/tasks
* `<version>`/tasks/process
* `<version>`/providers
* `<version>`/history
* `<version>`/send
* `<version>`/send/now

## Cloud Services
* Queue: Google Cloud Tasks and Amazon SQS
* Email: Twilio Sendgrid and AWS SES
* SMS: Twilio and AWS SNS
* Mobile Push: Google Firebase and AWS SNS
* Database: MongoDB and PostgreSQL

## Architecture
