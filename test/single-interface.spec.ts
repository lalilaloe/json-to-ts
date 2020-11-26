import * as assert from "assert";
import JsonToTS from "../src/index";
import { removeWhiteSpace } from "./util/index";

describe("Single interface", function () {
  it("should work with empty objects", function () {
    const json = {};

    const expected = `
      interface RootObject {
      }
    `;
    const interfaces = JsonToTS(json).pop();
    const [a, b] = [expected, interfaces].map(removeWhiteSpace);
    assert.strictEqual(a, b);

    // Classes
    const classes = JsonToTS(json, { useInterface: false }).pop();
    const [c, d] = [expected.replace(/interface/g, 'class'), classes].map(removeWhiteSpace);
    assert.strictEqual(c, d);
  });

  it("should not quote underscore key names", function () {
    const json = {
      _marius: "marius"
    };

    const expected = `
      interface RootObject {
        _marius: string;
      }
    `;
    const interfaces = JsonToTS(json).pop();
    const [a, b] = [expected, interfaces].map(removeWhiteSpace);
    assert.strictEqual(a, b);

    // Classes
    const classes = JsonToTS(json, { useInterface: false }).pop();
    const [c, d] = [expected.replace(/interface/g, 'class'), classes].map(removeWhiteSpace);
    assert.strictEqual(c, d);
  });

  it("should convert Date to Date type", function () {
    const json = {
      _marius: new Date()
    };

    const expected = `
      interface RootObject {
        _marius: Date;
      }
    `;
    const interfaces = JsonToTS(json).pop();
    const [a, b] = [expected, interfaces].map(removeWhiteSpace);
    assert.strictEqual(a, b);

    // Classes
    const classes = JsonToTS(json, { useInterface: false }).pop();
    const [c, d] = [expected.replace(/interface/g, 'class'), classes].map(removeWhiteSpace);
    assert.strictEqual(c, d);
  });

  it("should work with multiple key words", function () {
    const json = {
      "hello world": 42
    };

    const expected = `
interface RootObject {
  'hello world': number;
}`;
    const interfaces = JsonToTS(json).pop();
    assert.strictEqual(expected.trim(), interfaces.trim());

    // Classes
    const classes = JsonToTS(json, { useInterface: false }).pop();
    assert.strictEqual(expected.replace(/interface/g, 'class').trim(), classes.trim());
  });

  it("should work with multiple key words and optional fields", function () {
    const json = {
      "hello world": null
    };

    const expected = `
interface RootObject {
  'hello world'?: any;
}`;
    const interfaces = JsonToTS(json).pop();
    assert.strictEqual(expected.trim(), interfaces.trim());

    // Classes
    const classes = JsonToTS(json, { useInterface: false }).pop();
    assert.strictEqual(expected.replace(/interface/g, 'class').trim(), classes.trim());
  });

  it("should work with primitive types", function () {
    const json = {
      str: "this is string",
      num: 42,
      bool: true
    };

    const expected = `
      interface RootObject {
        str: string;
        num: number;
        bool: boolean;
      }
    `;
    const interfaceStr = JsonToTS(json).pop();
    const [expect, actual] = [expected, interfaceStr].map(removeWhiteSpace);
    assert.strictEqual(expect, actual);

    // Classes
    const classes = JsonToTS(json, { useInterface: false }).pop();
    const [c, d] = [expected.replace(/interface/g, 'class'), classes].map(removeWhiteSpace);
    assert.strictEqual(c, d);
  });

  it("should keep field order", function () {
    const json = {
      c: "this is string",
      a: 42,
      b: true
    };

    const expected = `
      interface RootObject {
        c: string;
        a: number;
        b: boolean;
      }
    `;
    const interfaceStr = JsonToTS(json).pop();
    const [expect, actual] = [expected, interfaceStr].map(removeWhiteSpace);
    assert.strictEqual(expect, actual);

    // Classes
    const classes = JsonToTS(json, { useInterface: false }).pop();
    const [c, d] = [expected.replace(/interface/g, 'class'), classes].map(removeWhiteSpace);
    assert.strictEqual(c, d);
  });

  it("should add optional field modifier on null values", function () {
    const json = {
      field: null
    };

    const expected = `
      interface RootObject {
        field?: any;
      }
    `;
    const interfaces = JsonToTS(json).pop();
    const [a, b] = [expected, interfaces].map(removeWhiteSpace);
    assert.strictEqual(a, b);

    // Classes
    const classes = JsonToTS(json, { useInterface: false }).pop();
    const [c, d] = [expected.replace(/interface/g, 'class'), classes].map(removeWhiteSpace);
    assert.strictEqual(c, d);
  });

  it('should name root object interface "RootObject"', function () {
    const json = {};

    const expected = `
      interface RootObject {
      }
    `;
    const interfaces = JsonToTS(json).pop();
    const [a, b] = [expected, interfaces].map(removeWhiteSpace);
    assert.strictEqual(a, b);

    // Classes
    const classes = JsonToTS(json, { useInterface: false }).pop();
    const [c, d] = [expected.replace(/interface/g, 'class'), classes].map(removeWhiteSpace);
    assert.strictEqual(c, d);
  });

  it("should empty array should be any[]", function () {
    const json = {
      arr: []
    };

    const expected = `
      interface RootObject {
        arr: any[];
      }
    `;
    const interfaces = JsonToTS(json).pop();
    const [a, b] = [expected, interfaces].map(removeWhiteSpace);
    assert.strictEqual(a, b);

    // Classes
    const classes = JsonToTS(json, { useInterface: false }).pop();
    const [c, d] = [expected.replace(/interface/g, 'class'), classes].map(removeWhiteSpace);
    assert.strictEqual(c, d);
  });
});
