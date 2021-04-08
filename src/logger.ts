import * as winston from "winston";

export function create() {
    let log = winston.createLogger({ transports: [ new winston.transports.Console() ]});
    if(process.env.NODE_ENV === "test") {
        log.silent = true;
    }
    return log;
}