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
    it("Button sizes_1. Button has valid size (button after text).", () => {
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

    it("Button sizes_2. Button has valid size (button before text).", () => {
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

    it("Button sizes_3. Text size is undefined.", () => {
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

    it("Button sizes_4. Button has invalid size (button after text).", () => {
      globalThis.reset();
      const invalidButtonSize = `{
        "block": "warning",
        "content": [
          {
            "elem": "content",
            "content": [
              { "block": "text", "mods": { "size": "l" } },
              { "block": "button", "mods": { "size": "s" } }
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

    it("Button sizes_5. Button has invalid size (button before text).", () => {
      globalThis.reset();
      const invalidButtonSize = `{
        "block": "warning",
        "content": [
          {
            "elem": "content",
            "content": [
              { "block": "button", "mods": { "size": "s" } },
              { "block": "text", "mods": { "size": "l" } }
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

    it("Button sizes_6. Button has invalid BORDER size (button before text).", () => {
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

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({
        code: "WARNING.INVALID_BUTTON_SIZE",
        error: "Button sizes inside 'warning' shoud be 1 more.",
        location: {start: {column: 15, line: 7}, end: {column: 67, line: 7}}
      });
    });

    it("Button sizes_7. Button has invalid BORDER size (button after text).", () => {
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

    it("Button sizes_8. Button has invalid size (equal text size) (button after text).", () => {
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

    it("Button sizes_9. Button has valid size outside warning.", () => {
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

  describe("    Checking button position  ", () => {
      it("Button positions_1. Button has valid position (after placeholder).", () => {
        const validButtonPosition = `{
          "block": "warning",
          "content": [
            {
              "elem": "content",
              "content": [
                { "block": "placeholder", "mods": { "size": "s" } },
                { "block": "button", "mods": { "size": "m" } }
              ]
            }
          ]
        }`;
        globalThis.reset();
        expect(globalThis.lint(validButtonPosition)).to.have.lengthOf(0);
      });

      it("Button positions_2. Button has invalid position (before placeholder).", () => {
        globalThis.reset();
        const invalidButtonPosition = `{
          "block": "warning",
          "content": [
            {
              "elem": "content",
              "content": [
                { "block": "button", "mods": { "size": "m" } },
                { "block": "placeholder", "mods": { "size": "s" } }
              ]
            }
          ]
        }`;

        const errors = globalThis.lint(invalidButtonPosition);
        expect(errors).to.have.lengthOf(1);

        expect(errors[0]).to.deep.equal({
          code: "WARNING.INVALID_BUTTON_POSITION",
          error: "Button can't be in front of the placeholder.",
          location: {start: {column: 17, line: 7}, end: {column: 63, line: 7}}
        });
      });

      it("Button positions_3. Button has invalid position (between 2 placeholders).", () => {
        globalThis.reset();
        const invalidButtonPosition = `{
          "block": "warning",
          "content": [
            {
              "elem": "content",
              "content": [
                { "block": "placeholder", "mods": { "size": "s" } },
                { "block": "button", "mods": { "size": "m" } },
                { "block": "placeholder", "mods": { "size": "s" } }
              ]
            }
          ]
        }`;

        const errors = globalThis.lint(invalidButtonPosition);

        expect(errors).to.have.lengthOf(1);
        expect(errors[0]).to.deep.equal({
          code: "WARNING.INVALID_BUTTON_POSITION",
          error: "Button can't be in front of the placeholder.",
          location: {start: {column: 17, line: 8}, end: {column: 63, line: 8}}
        });
      });

      it("Button positions_4. Button has invalid position (before and nested placeholder).", () => {
        globalThis.reset();
        const invalidButtonPosition = `{
          "block": "warning",
          "content": [
            {
              "elem": "content",
              "content": [
                { "block": "section", "content": [
                  { "block": "button", "mods": { "size": "m" } }
                ]},
                { "block": "placeholder", "mods": { "size": "s" } }
              ]
            }
          ]
        }`;

        const errors = globalThis.lint(invalidButtonPosition);

        expect(errors).to.have.lengthOf(1);
        expect(errors[0]).to.deep.equal({
          code: "WARNING.INVALID_BUTTON_POSITION",
          error: "Button can't be in front of the placeholder.",
          location: {start: {column: 19, line: 8}, end: {column: 65, line: 8}}
        });
      });
    });

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

describe("<<<<<     CHECKING TITLES     >>>>>", () => {
  describe("       Checking number of H1  ", () => {
    it("H1_1. 1 H1.", () => {
      const validH1 = `{
        "block": "page",
        "content": [
          { "block": "text", "mods": { "type": "h1" } }
        ]
      }`;
      globalThis.reset();
      expect(globalThis.lint(validH1)).to.have.lengthOf(0);
    });

    it("H1_2. Several H1.", () => {
      globalThis.reset();
      const invalidH1 = `{
        "block": "page",
        "content": [
          { "block": "text", "mods": { "type": "h1" } },
          { "block": "text", "mods": { "type": "h1" } }
        ]
      }`;
      const errors = globalThis.lint(invalidH1);

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({
        code: "TEXT.SEVERAL_H1",
        error: "Can't be several h1.",
        location: {start: {column: 11, line: 5}, end: {column: 56, line: 5}}
      });
    });

    it("H1_3. No H1.", () => {
      const validH1 = `{
        "block": "page",
        "content": [
          { "block": "text", "mods": { "type": "xxx" } }
        ]
      }`;
      globalThis.reset();
      expect(globalThis.lint(validH1)).to.have.lengthOf(0);
    });

  });

  describe("       Checking position of H2  ", () => {
    it("H2_1. Valid position: H2 after H1.", () => {
      const validH2 = `{
        "block": "page",
        "content": [
          { "block": "text", "mods": { "type": "h1" } },
          { "block": "text", "mods": { "type": "h2" } }
        ]
      }`;
      globalThis.reset();
      expect(globalThis.lint(validH2)).to.have.lengthOf(0);
    });

    it("H2_2. Invalid position: H2 before H1.", () => {
      globalThis.reset();
      const invalidH2 = `{
        "block": "page",
        "content": [
          { "block": "text", "mods": { "type": "h2" } },
          { "block": "text", "mods": { "type": "h1" } }
        ]
      }`;
      const errors = globalThis.lint(invalidH2);

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({
        code: "TEXT.INVALID_H2_POSITION",
        error: "H2 should be after H1.",
        location: {start: {column: 11, line: 4}, end: {column: 56, line: 4}}
      });
    });

    it("H2_3. Invalid position: H2 before H1 and nested.", () => {
      globalThis.reset();
      const invalidH2 = `{
        "block": "page",
        "content": [
          { "block": "section", "content": [
            { "block": "text", "mods": { "type": "h2" } }
          ]},
          { "block": "text", "mods": { "type": "h1" } }
        ]
      }`;
      const errors = globalThis.lint(invalidH2);

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({
        code: "TEXT.INVALID_H2_POSITION",
        error: "H2 should be after H1.",
        location: {start: {column: 13, line: 5}, end: {column: 58, line: 5}}
      });
    });

    it("H2_4. Invalid position: H2 between H1.", () => {
      globalThis.reset();
      const invalidH2 = `{
        "block": "page",
        "content": [
          { "block": "text", "mods": { "type": "h1" } },
          { "block": "text", "mods": { "type": "h2" } },
          { "block": "text", "mods": { "type": "h1" } }
        ]
      }`;
      const errors = globalThis.lint(invalidH2);

      expect(errors).to.have.lengthOf(2);
      expect(errors[0]).to.deep.equal({
        code: "TEXT.SEVERAL_H1",
        error: "Can't be several h1.",
        location: {start: {column: 11, line: 6}, end: {column: 56, line: 6}}
      });
      expect(errors[1]).to.deep.equal({
        code: "TEXT.INVALID_H2_POSITION",
        error: "H2 should be after H1.",
        location: {start: {column: 11, line: 5}, end: {column: 56, line: 5}}
      });
    });
  });

  describe("       Checking position of H3  ", () => {
    it("H3_1. Valid position: H3 after H2.", () => {
      const validH3 = `{
        "block": "page",
        "content": [
          { "block": "text", "mods": { "type": "h1" } },
          { "block": "text", "mods": { "type": "h2" } },
          { "block": "text", "mods": { "type": "h3" } }
        ]
      }`;
      globalThis.reset();
      expect(globalThis.lint(validH3)).to.have.lengthOf(0);
    });

    it("H3_2. Invalid position: H3 before H2.", () => {
      globalThis.reset();
      const invalidH3 = `{
        "block": "page",
        "content": [
          { "block": "text", "mods": { "type": "h1" } },
          { "block": "text", "mods": { "type": "h3" } },
          { "block": "text", "mods": { "type": "h2" } }
        ]
      }`;
      const errors = globalThis.lint(invalidH3);

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({
        code: "TEXT.INVALID_H3_POSITION",
        error: "H3 should be after H2.",
        location: {start: {column: 11, line: 5}, end: {column: 56, line: 5}}
      });
    });

    it("H3_3. Invalid position: H3 before H2 and nested.", () => {
      globalThis.reset();
      const invalidH3 = `{
        "block": "page",
        "content": [
          { "block": "section", "content": [
            { "block": "text", "mods": { "type": "h1" } },
            { "block": "text", "mods": { "type": "h3" } }
          ]},
          { "block": "text", "mods": { "type": "h2" } }
        ]
      }`;
      const errors = globalThis.lint(invalidH3);

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({
        code: "TEXT.INVALID_H3_POSITION",
        error: "H3 should be after H2.",
        location: {start: {column: 13, line: 6}, end: {column: 58, line: 6}}
      });
    });

    it("H3_4. Invalid position: H3 between H2.", () => {
      globalThis.reset();
      const invalidH3 = `{
        "block": "page",
        "content": [
          { "block": "text", "mods": { "type": "h1" } },
          { "block": "text", "mods": { "type": "h2" } },
          { "block": "text", "mods": { "type": "h3" } },
          { "block": "text", "mods": { "type": "h2" } }
        ]
      }`;
      const errors = globalThis.lint(invalidH3);

      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.deep.equal({
        code: "TEXT.INVALID_H3_POSITION",
        error: "H3 should be after H2.",
        location: {start: {column: 11, line: 6}, end: {column: 56, line: 6}}
      });
    });

    it("H3_5. Invalid position: H3 before H2, H2 before H1.", () => {
      globalThis.reset();
      const invalidH3 = `{
        "block": "page",
        "content": [
          { "block": "text", "mods": { "type": "h3" } },
          { "block": "text", "mods": { "type": "h2" } },
          { "block": "text", "mods": { "type": "h1" } }
        ]
      }`;
      const errors = globalThis.lint(invalidH3);

      expect(errors).to.have.lengthOf(2);
      expect(errors[0]).to.deep.equal({
        code: "TEXT.INVALID_H3_POSITION",
        error: "H3 should be after H2.",
        location: {start: {column: 11, line: 4}, end: {column: 56, line: 4}}
      });
      expect(errors[1]).to.deep.equal({
        code: "TEXT.INVALID_H2_POSITION",
        error: "H2 should be after H1.",
        location: {start: {column: 11, line: 5}, end: {column: 56, line: 5}}
      });
    });
  });
});