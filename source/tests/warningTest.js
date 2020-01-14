const { expect } = require("chai");
const lint = require("../linter.js");
const reset = require("../linter.js");

const validTextSizesString = `{
    "block": "warning",
    "content": [
        {
            "block": "placeholder",
            "mods": { "size": "m" }
        },
        {
            "elem": "content",
            "content": [
                {
                    "block": "text",
                    "mods": { "size": "m" }
                },
                {
                    "block": "text",
                    "mods": { "size": "m" }
                }
            ]
        }
    ]
}`;

const invalidTextSizesString = `{
    "block": "warning",
    "content": [
        {
            "block": "placeholder",
            "mods": { "size": "m" }
        },
        {
            "elem": "content",
            "content": [
                {
                    "block": "text",
                    "mods": { "size": "m" }
                },
                {
                    "block": "text",
                    "mods": { "size": "l" }
                }
            ]
        }
    ]
}`;

describe("<<<<<     CHECKING WARNING     >>>>>", () => {
  describe("       Checking text sizes  ", () => {

    it("TEST_1. All texts shoud be equal size.", () => {
      globalThis.reset();
      expect(globalThis.lint(validTextSizesString)).to.have.lengthOf(0);
    });

    it("TEST_2. All texts shoud be equal size.", () => {
      globalThis.reset();
      expect(globalThis.lint(invalidTextSizesString)).to.have.lengthOf(1);
      expect(globalThis.lint(invalidTextSizesString)[0]).to.have.property("code", "WARNING.TEXT_SIZES_SHOULD_BE_EQUAL");
      expect(globalThis.lint(invalidTextSizesString)[0]).to.have.property("error", "Text sizes inside \'warning\' block are not equal");
      expect(globalThis.lint(invalidTextSizesString)[0]).to.nested.include({"location.start.column": 1});
      expect(globalThis.lint(invalidTextSizesString)[0]).to.nested.include({"location.start.line": 1});
      expect(globalThis.lint(invalidTextSizesString)[0]).to.nested.include({"location.end.column": 2});
      expect(globalThis.lint(invalidTextSizesString)[0]).to.nested.include({"location.end.line": 22});
    });
  });
});