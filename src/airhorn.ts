import { Config } from "./config";
import { Template } from "./template";
import * as Logger from "./logger";

const logger = Logger.create();

export class Airhorn {

    config = new Config();
    templates = new Array<Template>();

    constructor() {
        logger.error("This is an init project. DO NOT USE. Please follow along at https://github.com/jaredwray/airhorn");
    }
}