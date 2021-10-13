import { Airhorn } from "../src/airhorn";
import { Template } from "../src/template";

test("Test Init Error", () => {

    expect(new Airhorn()).toEqual(new Airhorn());
});

test("get template", async () => {

    let airhorn = new Airhorn();
    let template = await airhorn.getTemplate('foo');

    expect(template).toEqual(new Template());
});