import * as assert from "assert";
import JsonToTS from "../src/index";
import { removeWhiteSpace } from "./util/index";

describe("Explicit reference", function () {
  it("should reference to existing type before creation", function () {
    const json = {
      "masterCat[Cat]": {},
      cats: [{ name: "Kittin" }, { name: "Sparkles" }],
    };

    const expectedTypes = [
      `interface RootObject {
          masterCat: Cat;
          cats: Cat[];
        }`,
      `interface Cat {
          name: string;
        }`,
    ].map(removeWhiteSpace);

    const interfaces = JsonToTS(json);
    interfaces.forEach((i) => {
      const noWhiteSpaceInterface = removeWhiteSpace(i);
      assert(expectedTypes.includes(noWhiteSpaceInterface));
    });

    assert.strictEqual(interfaces.length, 2);

    // Classes
    const classes = JsonToTS(json, { useInterface: false });

    classes.forEach((i) => {
      const noWhiteSpaceInterface = removeWhiteSpace(i);
      assert(expectedTypes.map((type) => type.replace(/interface/g, "class")).includes(noWhiteSpaceInterface));
    });

    assert.strictEqual(classes.length, 2);
  });
  it("should reference to existing type in nested object", function () {
    const json = {
      cats: [{ name: "Kittin" }],
      customCat: {
        type: "Master",
        "cat[Cat]": {},
      },
    };

    const expectedTypes = [
      `interface RootObject {
                cats: Cat[];
                customCat: CustomCat;                
            }`,
      `interface Cat {
                name: string;
            }`,
      `interface CustomCat {
                type: string;
                cat: Cat;
            }`,
    ].map(removeWhiteSpace);

    const interfaces = JsonToTS(json);
    interfaces.forEach((i) => {
      const noWhiteSpaceInterface = removeWhiteSpace(i);
      assert(expectedTypes.includes(noWhiteSpaceInterface));
    });

    assert.strictEqual(interfaces.length, 3);

    // Classes
    const classes = JsonToTS(json, { useInterface: false });

    classes.forEach((i) => {
      const noWhiteSpaceInterface = removeWhiteSpace(i);
      assert(expectedTypes.map((type) => type.replace(/interface/g, "class")).includes(noWhiteSpaceInterface));
    });

    assert.strictEqual(classes.length, 3);
  });
  it("should reference to existing type when object is in nested array", function () {
    const json = {
      cats: [{ name: "Kittin" }],
      specialCats: [
        {
          type: "SuperSpecial",
          "cat[Cat]": {},
        },
      ],
    };

    const expectedTypes = [
      `interface RootObject {
                cats: Cat[];
                specialCats: SpecialCat[];                
            }`,
      `interface Cat {
                name: string;
            }`,
      `interface SpecialCat {
                type: string;
                cat: Cat;
            }`,
    ].map(removeWhiteSpace);

    const interfaces = JsonToTS(json);
    interfaces.forEach((i) => {
      const noWhiteSpaceInterface = removeWhiteSpace(i);
      assert(expectedTypes.includes(noWhiteSpaceInterface));
    });

    assert.strictEqual(interfaces.length, 3);

    // Classes
    const classes = JsonToTS(json, { useInterface: false });

    classes.forEach((i) => {
      const noWhiteSpaceInterface = removeWhiteSpace(i);
      assert(expectedTypes.map((type) => type.replace(/interface/g, "class")).includes(noWhiteSpaceInterface));
    });

    assert.strictEqual(classes.length, 3);
  });
  it("should reference to existing types existing type used as array", function () {
    const json = {
      cats: [{ name: "Kittin" }],
      "moderators[Cat]": [],
    };

    const expectedTypes = [
      `interface RootObject {
                cats: Cat[];             
                moderators: Cat[];                
            }`,
      `interface Cat {
                name: string;
            }`,
    ].map(removeWhiteSpace);

    // const interfaces = JsonToTS(json); // TODO: class reference as array
    // console.log(interfaces.reduce(pretty))
    // interfaces.forEach(i => {
    //     const noWhiteSpaceInterface = removeWhiteSpace(i);
    //     assert(expectedTypes.includes(noWhiteSpaceInterface));
    // });

    // assert.strictEqual(interfaces.length, 3);

    // // Classes
    // const classes = JsonToTS(json, { useInterface: false });

    // classes.forEach(i => {
    //     const noWhiteSpaceInterface = removeWhiteSpace(i);
    //     assert(expectedTypes.map(type => type.replace(/interface/g, 'class')).includes(noWhiteSpaceInterface));
    // });

    // assert.strictEqual(classes.length, 3);
  });
  it("should reference to existing types even when content is same", function () {
    const json = {
      cats: [{ name: "Kittin" }],
      "masterCat[SpecialCat]": {
        type: "SuperSpecial",
        "cat[Cat]": {},
      },
      moderatorCat: {
        type: "Moderator",
        "cat[Cat]": {},
      },
    };

    const expectedTypes = [
      `interface RootObject {
                cats: Cat[];
                masterCat: SpecialCat;                
                moderatorCat: SpecialCat;                
            }`,
      `interface Cat {
                name: string;
            }`,
      `interface SpecialCat {
                type: string;
                cat: Cat;
            }`,
    ].map(removeWhiteSpace);

    const interfaces = JsonToTS(json);

    interfaces.forEach((i) => {
      const noWhiteSpaceInterface = removeWhiteSpace(i);
      assert(expectedTypes.includes(noWhiteSpaceInterface));
    });

    assert.strictEqual(interfaces.length, 3);

    // Classes
    const classes = JsonToTS(json, { useInterface: false });

    classes.forEach((i) => {
      const noWhiteSpaceInterface = removeWhiteSpace(i);
      assert(expectedTypes.map((type) => type.replace(/interface/g, "class")).includes(noWhiteSpaceInterface));
    });

    assert.strictEqual(classes.length, 3);
  });
});
