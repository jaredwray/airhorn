
export class Config {

    templatePath: string = "./templates";
    defaultTemplateLanguage: string = "en";

    constructor(opts?:any) {
        if(opts) {
            this.parse(opts);
        }
    }

    parse(opts:any) {
        if(opts.templatePath) {
            this.templatePath = opts.templatePath.toString();
        }

        if(opts.defaultTemplateLanguage) {
            this.defaultTemplateLanguage = opts.defaultTemplateLanguage.toString();
        }
    }
}