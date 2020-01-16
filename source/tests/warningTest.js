const { expect } = require("chai");
const lint = require("../linter.js");
const reset = require("../linter.js");

describe("<<<<<     CHECKING WARNING     >>>>>", () => {
  describe("       Checking text sizes  ", () => {
    it("Text sizes_1. All texts have equal size.", () => {
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
      globalThis.reset();
      expect(globalThis.lint(validTextSizesString)).to.have.lengthOf(0);
    });

    it("Text sizes_2. All texts have equal size, but not in warning block", () => {
      const validTextSizesString = `{
        "block": "test",
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
      globalThis.reset();
      expect(globalThis.lint(validTextSizesString)).to.have.lengthOf(0);
    });

    it("Text sizes_3. All texts have different sizes at one level of nesting.", () => {
      globalThis.reset();
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
      const errors = globalThis.lint(invalidTextSizesString);

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({
        code: "WARNING.TEXT_SIZES_SHOULD_BE_EQUAL",
        error: "Text sizes inside \'warning\' block are not equal",
        location: {start: {column: 1, line: 1}, end: {column: 8, line: 22}}
      });
    });

    it("Text sizes_4. All texts have different sizes at different level of nesting.", () => {
      globalThis.reset();
      const invalidTextSizesString = `{
        "block": "warning",
        "content": [
          {
            "elem": "content",
            "content": [
              { "block": "text", "mods": { "size": "m" } },
              { "block": "test", "content": { "block": "text", "mods": { "size": "l" } }}
            ]
          }
        ]
      }`;
      const errors = globalThis.lint(invalidTextSizesString);

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({
        code: "WARNING.TEXT_SIZES_SHOULD_BE_EQUAL",
        error: "Text sizes inside \'warning\' block are not equal",
        location: {start: {column: 1, line: 1}, end: {column: 8, line: 12}}
      });
    });
  });

  describe("    Checking button sizes  ", () => {
    it("TEST_5. Button has valid size (button after text).", () => {
      const validButtonSize = `{
        "block": "warning",
        "content": [
          {
            "elem": "content",
            "content": [
              { "block": "text", "mods": { "size": "l" } },
              { "block": "button", "mods": { "size": "xl" } }
            ]
          }
        ]
      }`;
      globalThis.reset();
      expect(globalThis.lint(validButtonSize)).to.have.lengthOf(0);
    });

    it("TEST_6. Button has valid size (button before text).", () => {
      const validButtonSize = `{
        "block": "warning",
        "content": [
          {
            "elem": "content",
            "content": [
              { "block": "button", "mods": { "size": "xl" } },
              { "block": "text", "mods": { "size": "l" } }
            ]
          }
        ]
      }`;
      globalThis.reset();
      expect(globalThis.lint(validButtonSize)).to.have.lengthOf(0);
    });

    it("TEST_7. Text size is undefined.", () => {
      const noTextSize = `{
        "block": "warning",
        "content": [
          {
            "elem": "content",
            "content": [
              { "block": "button", "mods": { "size": "xl" } }
            ]
          }
        ]
      }`;
      globalThis.reset();
      expect(globalThis.lint(noTextSize)).to.have.lengthOf(0);
    });

    it("TEST_8. Button has invalid size (button after text).", () => {
      globalThis.reset();
      const invalidButtonSize = `{
        "block": "warning",
        "content": [
          {
            "elem": "content",
            "content": [
              { "block": "text", "mods": { "size": "xl" } },
              { "block": "button", "mods": { "size": "l" } }
            ]
          }
        ]
      }`;
      const errors = globalThis.lint(invalidButtonSize);

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({
        code: "WARNING.INVALID_BUTTON_SIZE",
        error: "Button sizes inside 'warning' shoud be 1 more.",
        location: {start: {column: 15, line: 8}, end: {column: 61, line: 8}}
      });
    });

    it("TEST_9. Button has invalid size (button before text).", () => {
      globalThis.reset();
      const invalidButtonSize = `{
        "block": "warning",
        "content": [
          {
            "elem": "content",
            "content": [
              { "block": "button", "mods": { "size": "l" } },
              { "block": "text", "mods": { "size": "xl" } }
            ]
          }
        ]
      }`;
      const errors = globalThis.lint(invalidButtonSize);

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({
        code: "WARNING.INVALID_BUTTON_SIZE",
        error: "Button sizes inside 'warning' shoud be 1 more.",
        location: {start: {column: 15, line: 7}, end: {column: 61, line: 7}}
      });
    });

    it("TEST_10. Button has invalid BORDER size (button before text).", () => {
      globalThis.reset();
      const invalidButtonSize = `{
        "block": "warning",
        "content": [
          {
            "elem": "content",
            "content": [
              { "block": "button", "mods": { "size": "xxxxxxl" } },
              { "block": "text", "mods": { "size": "xxxxxl" } }
            ]
          }
        ]
      }`;
      const errors = globalThis.lint(invalidButtonSize);

      expect(errors).to.have.lengthOf(0);
    });

    it("TEST_11. Button has invalid BORDER size (button after text).", () => {
      globalThis.reset();
      const invalidButtonSize = `{
        "block": "warning",
        "content": [
          {
            "elem": "content",
            "content": [
              { "block": "text", "mods": { "size": "xxxs" } },
              { "block": "button", "mods": { "size": "xxxs" } }
            ]
          }
        ]
      }`;
      const errors = globalThis.lint(invalidButtonSize);

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({
        code: "WARNING.INVALID_BUTTON_SIZE",
        error: "Button sizes inside 'warning' shoud be 1 more.",
        location: {start: {column: 15, line: 8}, end: {column: 64, line: 8}}
      });
    });

    it("TEST_12. Button has invalid size (equal text size) (button after text).", () => {
      globalThis.reset();
      const invalidButtonSize = `{
        "block": "warning",
        "content": [
          {
            "elem": "content",
            "content": [
              { "block": "text", "mods": { "size": "xxxs" } },
              { "block": "button", "mods": { "size": "xxxs" } }
            ]
          }
        ]
      }`;
      const errors = globalThis.lint(invalidButtonSize);

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({
        code: "WARNING.INVALID_BUTTON_SIZE",
        error: "Button sizes inside 'warning' shoud be 1 more.",
        location: {start: {column: 15, line: 8}, end: {column: 64, line: 8}}
      });
    });

    it("TEST_13. Button has valid size outside warning.", () => {
      globalThis.reset();
      const validButtonSize = `{
        "block": "test",
        "content": [
          { "block": "text", "mods": { "size": "l" } },
          { "block": "button", "mods": { "size": "xl" } }
        ]
      }`;
      const errors = globalThis.lint(validButtonSize);

      expect(errors).to.have.lengthOf(0);
    });
  });

  // describe("    Checking button position  ", () => {
  //     it("Button positions_1. Button has valid position (after placeholder).", () => {
  //       const validButtonPosition = `{
  //         "block": "warning",
  //         "content": [
  //           {
  //             "elem": "content",
  //             "content": [
  //               { "block": "placeholder", "mods": { "size": "s" } },
  //               { "block": "button", "mods": { "size": "m" } }
  //             ]
  //           }
  //         ]
  //       }`;
  //       globalThis.reset();
  //       expect(globalThis.lint(validButtonPosition)).to.have.lengthOf(0);
  //     });
  //
  //     it("Button positions_2. Button has invalid position (before placeholder).", () => {
  //       globalThis.reset();
  //       const invalidButtonPosition = `{
  //         "block": "warning",
  //         "content": [
  //           {
  //             "elem": "content",
  //             "content": [
  //               { "block": "button", "mods": { "size": "m" } },
  //               { "block": "placeholder", "mods": { "size": "s" } }
  //             ]
  //           }
  //         ]
  //       }`;
  //
  //       const errors = globalThis.lint(invalidButtonPosition);
  //       expect(errors).to.have.lengthOf(1);
  //
  //       expect(errors[0]).to.deep.equal({
  //         code: "WARNING.INVALID_BUTTON_POSITION",
  //         error: "Button can't be in front of the placeholder.",
  //         location: {start: {column: 17, line: 7}, end: {column: 63, line: 7}}
  //       });
  //     });
  //
  //     it("Button positions_3. Button has invalid position (between 2 placeholders).", () => {
  //       globalThis.reset();
  //       const invalidButtonPosition = `{
  //         "block": "warning",
  //         "content": [
  //           {
  //             "elem": "content",
  //             "content": [
  //               { "block": "placeholder", "mods": { "size": "s" } },
  //               { "block": "button", "mods": { "size": "m" } },
  //               { "block": "placeholder", "mods": { "size": "s" } }
  //             ]
  //           }
  //         ]
  //       }`;
  //
  //       const errors = globalThis.lint(invalidButtonPosition);
  //
  //       expect(errors).to.have.lengthOf(1);
  //       expect(errors[0]).to.deep.equal({
  //         code: "WARNING.INVALID_BUTTON_POSITION",
  //         error: "Button can't be in front of the placeholder.",
  //         location: {start: {column: 17, line: 8}, end: {column: 63, line: 8}}
  //       });
  //     });
  //
  //     it("Button positions_4. Button has invalid position (before and nested placeholder).", () => {
  //       globalThis.reset();
  //       const invalidButtonPosition = `{
  //         "block": "warning",
  //         "content": [
  //           {
  //             "elem": "content",
  //             "content": [
  //               { "block": "section", "content": [
  //                 { "block": "button", "mods": { "size": "m" } }
  //               ]},
  //               { "block": "placeholder", "mods": { "size": "s" } }
  //             ]
  //           }
  //         ]
  //       }`;
  //
  //       const errors = globalThis.lint(invalidButtonPosition);
  //
  //       expect(errors).to.have.lengthOf(1);
  //       expect(errors[0]).to.deep.equal({
  //         code: "WARNING.INVALID_BUTTON_POSITION",
  //         error: "Button can't be in front of the placeholder.",
  //         location: {start: {column: 19, line: 8}, end: {column: 65, line: 8}}
  //       });
  //     });
  //   });

  describe("    Checking placeholder sizes  ", () => {
    it("Placeholder sizes_1. Placeholder has valid size: s.", () => {
      const validPlaceholderSize = `{
         "block": "warning",
         "content": [
           { "block": "text", "mods": { "size": "l" } },
           { "block": "placeholder", "mods": { "size": "s" } },
           { "block": "button", "mods": { "size": "xl" } }
         ]
      }`;
      globalThis.reset();
      expect(globalThis.lint(validPlaceholderSize)).to.have.lengthOf(0);
    });

    it("Placeholder sizes_2. Placeholder has valid size: m.", () => {
      const validPlaceholderSize = `{
         "block": "warning",
         "content": [
           { "block": "text", "mods": { "size": "l" } },
           { "block": "placeholder", "mods": { "size": "m" } },
           { "block": "button", "mods": { "size": "xl" } }
         ]
      }`;
      globalThis.reset();
      expect(globalThis.lint(validPlaceholderSize)).to.have.lengthOf(0);
    });

    it("Placeholder sizes_3. Placeholder has valid size: l.", () => {
      const validPlaceholderSize = `{
         "block": "warning",
         "content": [
           { "block": "text", "mods": { "size": "l" } },
           { "block": "placeholder", "mods": { "size": "l" } },
           { "block": "button", "mods": { "size": "xl" } }
         ]
      }`;
      globalThis.reset();
      expect(globalThis.lint(validPlaceholderSize)).to.have.lengthOf(0);
    });

    it("Placeholder sizes_4. Placeholder has invalid size: xxs, but not in warning block.", () => {
      const validPlaceholderSize = `{
         "block": "test",
         "content": [
           { "block": "text", "mods": { "size": "l" } },
           { "block": "placeholder", "mods": { "size": "xxs" } },
           { "block": "button", "mods": { "size": "xl" } }
         ]
      }`;
      globalThis.reset();
      expect(globalThis.lint(validPlaceholderSize)).to.have.lengthOf(0);
    });

    it("Placeholder sizes_5. Placeholder has invalid size: xs.", () => {
      globalThis.reset();
      const invalidPlaceholderSize = `{
         "block": "warning",
         "content": [
           { "block": "text", "mods": { "size": "l" } },
           { "block": "placeholder", "mods": { "size": "xs" } },
           { "block": "button", "mods": { "size": "xl" } }
         ]
      }`;
      const errors = globalThis.lint(invalidPlaceholderSize);

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({
        code: "WARNING.INVALID_PLACEHOLDER_SIZE",
        error: "Placeholder sizes inside 'warning' shoud be \"s\", \"m\", or \"l\"",
        location: {start: {column: 12, line: 5}, end: {column: 64, line: 5}}
      });
    });
  });
});