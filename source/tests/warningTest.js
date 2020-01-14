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

const validPlaceholderSize = `{
    "block": "warning",
    "content": [
        { "block": "placeholder", "mods": { "size": "s" } },
        { "block": "button", "mods": { "size": "m" } }
    ]
}`;

const invalidPlaceholderSize = `{
    "block": "warning",
    "content": [
        { "block": "placeholder", "mods": { "size": "xs" } },
        { "block": "button", "mods": { "size": "m" } }
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
      const errors = globalThis.lint(invalidTextSizesString);

      console.log("########################################");//
      console.log('errors: ', errors);//
      console.log(errors[0].location.start);//
      console.log(errors[0].location.end);//
      console.log("########################################");//

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.have.property("code", "WARNING.TEXT_SIZES_SHOULD_BE_EQUAL");
      expect(errors[0]).to.have.property("error", "Text sizes inside \'warning\' block are not equal");
      expect(errors[0]).to.nested.include({"location.start.column": 1});
      expect(errors[0]).to.nested.include({"location.start.line": 1});
      expect(errors[0]).to.nested.include({"location.end.column": 2});
      expect(errors[0]).to.nested.include({"location.end.line": 22});
    });
  });

  describe("       Checking placeholder size  ", () => {
    it("TEST_1. Placeholder sizes inside warning shoud be \'s\', \'m\' or \'l\'", () => {
      globalThis.reset();
      expect(globalThis.lint(validPlaceholderSize)).to.have.lengthOf(0);
    });

    it("TEST_1. Placeholder sizes inside warning shoud be \'s\', \'m\' or \'l\'", () => {
      globalThis.reset();
      const errors = globalThis.lint(invalidPlaceholderSize);

      console.log("########################################");
      console.log('ERRORS!!!!!!!!!!!!!!!!!!!!!!!!!!!: ', errors);//
      console.log(errors[0].location.start);
      console.log(errors[0].location.end);
      console.log("########################################");

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.have.property("code", "WARNING.INVALID_PLACEHOLDER_SIZE");
      expect(errors[0]).to.have.property("error", "Placeholder sizes inside 'warning' shoud be \"s\", \"m\", or \"l\"");
      expect(errors[0]).to.nested.include({"location.start.column": 9});
      expect(errors[0]).to.nested.include({"location.start.line": 4});
      expect(errors[0]).to.nested.include({"location.end.column": 61});
      expect(errors[0]).to.nested.include({"location.end.line": 4});
    });
  });
});