import { Config } from "../src/config";

test("Config - init", () => {
    expect(new Config()).toEqual(new Config());
});

test("Config - default settings", () => {
    let config = new Config();

    expect(config.templatePath).toEqual("./templates");
    expect(config.defaultTemplateLanguage).toEqual("en");
});

test("Config - settings on constructor", () => {
    let obj = {
        templatePath: "./foo",
        defaultTemplateLanguage: "es"
    };

    let config = new Config(obj);

    expect(config.templatePath).toEqual(obj.templatePath);
});

test("Config - parse with object", () => {
    let obj = {
        templatePath: "./foo",
        defaultTemplateLanguage: "es"
    };

    let config = new Config();
    config.parse(obj);

    expect(config.templatePath).toEqual(obj.templatePath);
});

test("Config - defaultTemplateLanguage Should Not Be Default en", () => {
    let obj = {
        templatePath: "./foo"
    };

    let config = new Config();
    config.parse(obj);

    expect(config.defaultTemplateLanguage).toEqual("en");
});

test("Config - settings on constructor", () => {
    let obj = {
        defaultTemplateLanguage: "es"
    };

    let config = new Config();
    config.parse(obj);

    expect(config.defaultTemplateLanguage).toEqual(obj.defaultTemplateLanguage);
});