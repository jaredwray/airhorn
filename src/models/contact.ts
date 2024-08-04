
export class Contact {
    public id: string = '';
    public name: string = '';
    public tags: string[] = [];
    public emails: string[] = [];
    public phones: string[] = [];
    public urls: string[] = [];
    public meta: Record<string, string> = {};
    public lastUpdated: Date = new Date();
    public created: Date = new Date();    
    constructor(data: Partial<Contact>) {
        Object.assign(this, data);
    }
}