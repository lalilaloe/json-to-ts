const assert = require("assert");

describe("Javascript integration", function () {
  it("should work with default require statement", function () {
    const JsonToTS = require("../../build/src/index");

    const expected = `
interface RootObject {
  cats: Cat[];
  favoriteNumber: number;
  favoriteWord: string;
}
interface Cat {
  name: string;
}`;

    const json = {
      cats: [{ name: "Kittin" }, { name: "Mittin" }],
      favoriteNumber: 42,
      favoriteWord: "Hello",
    };

    const interfaces = JsonToTS(json).reduce((type1, type2) => {
      return `${type1}\n${type2}`;
    });

    assert.strictEqual(interfaces.trim(), expected.trim());

    // Classes
    const classes = JsonToTS(json, { useInterface: false }).reduce((type1, type2) => {
      return `${type1}\n${type2}`;
    });
    assert.strictEqual(classes.trim(), expected.replace(/interface/g, "class").trim());
  });
});
