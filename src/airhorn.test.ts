import { Airhorn } from "./airhorn";

test("Test Init Error", () => {

    expect(new Airhorn()).toEqual(new Airhorn());
});