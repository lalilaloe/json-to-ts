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
      "moderators[Cat]": [], // Before creating Cat model
      cats: [{ name: "Kittin" }],
      "specialCats[Cat]": [], // After creating Cat model
    };

    const expectedTypes = [
      `interface RootObject {
                moderators: Cat[];   
                cats: Cat[];
                specialCats: Cat[];   
            }`,
      `interface Cat {
                name: string;
            }`,
    ].map(removeWhiteSpace);

    const interfaces = JsonToTS(json);
    interfaces.forEach(i => {
      const noWhiteSpaceInterface = removeWhiteSpace(i);
      assert(expectedTypes.includes(noWhiteSpaceInterface));
    });

    assert.strictEqual(interfaces.length, 2);

    // Classes
    const classes = JsonToTS(json, { useInterface: false });

    classes.forEach(i => {
      const noWhiteSpaceInterface = removeWhiteSpace(i);
      assert(expectedTypes.map(type => type.replace(/interface/g, 'class')).includes(noWhiteSpaceInterface));
    });

    assert.strictEqual(classes.length, 2);
  });
  it("should reference to existing types if empty array/object exists", function () {
    // This is an extra test where the input also contains an empty array or 
    const json = {
      emptyList: [],
      emptyObject: {},
      cats: [{ name: "Kittin" }],
      "specialCats[Cat]": [],
      "masterCat[Cat]": {},
    };

    const expectedTypes = [
      `interface RootObject {
                emptyList: any[];   
                emptyObject: EmptyObject;   
                cats: Cat[];
                specialCats: Cat[];  
                masterCat: Cat; 
            }`,
      `interface EmptyObject {
            }`,
      `interface Cat {
                name: string;
            }`,
    ].map(removeWhiteSpace);

    const interfaces = JsonToTS(json);
    interfaces.forEach(i => {
      const noWhiteSpaceInterface = removeWhiteSpace(i);
      assert(expectedTypes.includes(noWhiteSpaceInterface));
    });

    assert.strictEqual(interfaces.length, 3);

    // Classes
    const classes = JsonToTS(json, { useInterface: false });

    classes.forEach(i => {
      const noWhiteSpaceInterface = removeWhiteSpace(i);
      assert(expectedTypes.map(type => type.replace(/interface/g, 'class')).includes(noWhiteSpaceInterface));
    });

    assert.strictEqual(classes.length, 3);
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
