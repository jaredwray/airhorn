import * as Logger from "../src/logger";

test("Logger - silence", () => {
    process.env.NODE_ENV = "foo";
    let logger = Logger.create();
    expect(logger.silent).toEqual(undefined);
});