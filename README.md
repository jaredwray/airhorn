![Airhorn Logo](docs/images/logo-horizontal.png "Airhorn Logo")

-----

![airhorn-build](https://github.com/jaredwray/airhorn/workflows/airhorn-build/badge.svg)
![airhorn-release](https://github.com/jaredwray/airhorn/workflows/airhorn-release/badge.svg)
[![codecov](https://codecov.io/gh/jaredwray/airhorn/branch/main/graph/badge.svg?token=4OJEEB67Q5)](https://codecov.io/gh/jaredwray/airhorn)

## Cloud Native Notifications Library

Airhorn was born out of a need to enable a more robust notifications system for many of the applications that were built and maintained by the team. We focused on making it cloud native by default (using cloud services) and also scalable with queue management and retry rate so that you can scale to hundreds if not thousands of instances. 

## Features

* GitOps Based Templating System - your email, sms, mobile, and webhooks all in one place!
* Email Notifications - easily send email across multple providers and even load balance or active/passive fail over. 
* SMS Notifications - SMS that is easy to use via a robust template system. 
* Mobile Push Notifications - Push to IOS and 
* Webhook Notifications
* Profile Management - Sending Preferences, Send History
* Pluggable Cloud Based Architecture - use the services you know
* Scalable and Enterprise Grade - Ability to scale to thousands of requests per second and retry based system. 
* 100% Code Coverage / Tested
* Examples of how to Deploy (Github Actions, CircleCI, TravisCI)

## Library API

### Airhorn.Client -- Robust Node Client with REST and Queue Support

### Airhorn.Server -- Robust Rest API 

### Airhorn.Worker -- Scalable Worker Service

## Cloud Services
* Queue: Google Cloud Tasks and Amazon SQS
* Email: Twilio Sendgrid and AWS SES
* SMS: Twilio and AWS SNS
* Mobile Push: Google Firebase and AWS SNS
* Database: MongoDB and PostgreSQL

## Architecture