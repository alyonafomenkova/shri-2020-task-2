//import jsonToAst from 'json-to-ast';
const jsonToAst = require("json-to-ast");

const ERROR_TEXT_SIZES_SHOULD_BE_EQUAL = "WARNING.TEXT_SIZES_SHOULD_BE_EQUAL";
const ERROR_TEXT_NO_SIZE_VALUE = "WARNING.TEXT_NO_SIZE_VALUE";
const INVALID_BUTTON_SIZE = "WARNING.INVALID_BUTTON_SIZE";
const INVALID_PLACEHOLDER_SIZE = "WARNING.INVALID_PLACEHOLDER_SIZE";
const INVALID_BUTTON_POSITION = "WARNING.INVALID_BUTTON_POSITION";
const SEVERAL_H1 = "TEXT.SEVERAL_H1";
const INVALID_H2_POSITION = "TEXT.INVALID_H2_POSITION";
const INVALID_H3_POSITION = "TEXT.INVALID_H3_POSITION";

const isObjectNode = (node) => node.type === "Object";
const isPropertyNode = (node) => node.type === "Property";
const isArrayNode = (node) => node.type === "Array";

const isLiteralPropertyType = (type) => type === "Literal";
const isArrayPropertyType = (type) => type === "Array";
const isObjectPropertyType = (type) => type === "Object";

const errors = [];

function pushError(code, message, location) {
  const item = {
    code: code,
    error: message,
    location: {
      start: { column: location.start.column, line: location.start.line },
      end: { column: location.end.column, line: location.end.line }
    }
  };
  errors.push(item);
}
// вынести в другой модуль
function contains(array, element) { // TODO: переименовать метод
  for (let i = 0; i < array.length - 1; i++) {
    if (array[i] === element) {
      return true;
    }
  }
  return false;
}
//

class WarningCheck {

  constructor() {
    this.canStart = true;
    this.inProgress = false;
    this.refSize = null;
    this.location = null;
    this.buttonEnabled = false;
    this.sizes = ["xxxs", "xxs", "xs", "s", "m", "l", "xl", "xxl", "xxxl", "xxxxl", "xxxxxl"];
  }

  process(parent, node) {
    if (this.canStart) {
      const key = node.key.value;
      const value = node.value.value;

      if (key === "block" && value === "warning") {
        this.location = parent.loc;
        console.log("[START] Checking warning");
        this.canStart = false;
        this.inProgress = true;
        traverse(parent);
        this.inProgress = false;
        console.log("[FINISH] Checking warning");
      }
    } else if (this.inProgress && node.value.value === "text") {
      const mods = parent.children.find((e) => { return e.key.value === "mods" });

      if (mods) {
        const size = mods.value.children.find((e) => { return e.key.value === "size" });

        if (size) {
          const currSize = size.value.value;

          if (this.refSize === null) {
            this.refSize = currSize;
          } else if (currSize !== null && this.refSize !== currSize) {
            pushError(ERROR_TEXT_SIZES_SHOULD_BE_EQUAL, "Text sizes inside 'warning' block are not equal", this.location);
          }
        } else {
          pushError(ERROR_TEXT_NO_SIZE_VALUE, "Text block with 'mods' has no 'size' block", this.location);
        }
      }
    }
    // button size rule
    // if (this.inProgress && node.value.value === "button") {
    //   this.location = parent.loc;
    //   const mods = parent.children.find((e) => { return e.key.value === "mods" });
    //   //
    //   if (!this.buttonEnabled) {
    //     pushError(INVALID_BUTTON_POSITION, "Button can't be in front of the placeholder.", this.location);/////
    //   } else {//start else
    //     const button = mods.value.children.find((e) => { return e.key.value === "size" });
    //     const buttonSize = button.value.value;
    //     if (!contains(this.sizes, buttonSize)) {
    //       pushError(INVALID_BUTTON_SIZE, `Button cannot be this size.`, this.location);
    //     } else {
    //       const refButtonSize = this.sizes[this.sizes.findIndex((size) => size === this.refSize) + 1];
    //       if (buttonSize !== refButtonSize) {
    //         console.log(`неверный размер! Должен быть refButtonSize: ${this.refSize}`);
    //         pushError(INVALID_BUTTON_SIZE, "Button sizes inside 'warning' shoud be 1 more.", this.location);
    //       }
    //       }// end else
    //   }//end else
    // }
    // // placeholder rule
    // if (this.inProgress && node.value.value === "placeholder") {
    //   this.location = parent.loc;
    //   this.buttonEnabled = true;
    //   const mods = parent.children.find((e) => { return e.key.value === "mods" });
    //   if (mods) {
    //     const size = mods.value.children.find((e) => { return e.key.value === "size" });
    //     if (!["s", "m", "l"].includes(size.value.value)) {
    //       pushError(INVALID_PLACEHOLDER_SIZE, "Placeholder sizes inside 'warning' shoud be \"s\", \"m\", or \"l\"", this.location);
    //     }
    //   } else {
    //     pushError(ERROR_PLACEHOLDER_NO_SIZE_VALUE, "Placeholder block with 'mods' has no 'size' block", this.location);
    //   }
    // }
  }
}

class TitlesCheck {

  constructor() {
    this.titles = [];
    this.lastTextBlock = null;
  }

  process(parent, node, depth) {
    const key = node.key.value;
    const value = node.value.value;

    if (key === "block" && value === "text") {
      this.lastTextBlock = parent;
    }

    if (key === "type" && (value === "h1" || value === "h2" || value === "h3")) {
      if (this.lastTextBlock == null) {
        console.error("Last text block is null");
      } else {
        const loc = this.lastTextBlock.loc;
        // console.log(`${value.toUpperCase()} inside TEXT BLOCK: ${loc.start.line}...${loc.end.line}`);

        this.titles.push({
          title: value,
          location: loc,
          depth: depth
        });
      }
    }
  }

  onComplete() {
    const arrayH1 = this.titles.filter(element => element.title === "h1");

    if (arrayH1.length === 0) {
      console.error("No H1");
    } else {
      for (let i = 1; i < arrayH1.length; i++) {
        pushError(SEVERAL_H1, "Can't be several h1.", arrayH1[i].location);
      }
    }

    for (let i = 1; i < this.titles.length; i++) {
      const prevTitle = this.titles[i - 1].title;
      const prevLocation = this.titles[i - 1].location;
      const prevDepth = this.titles[i - 1].depth;

      const currTitle = this.titles[i].title;
      const currLocation = this.titles[i].location;
      const currDepth = this.titles[i].depth;

      if (prevDepth >= currDepth) {
        if (prevTitle === "h2" && currTitle === "h1") {
          pushError(INVALID_H2_POSITION, "H2 should be after H1", prevLocation);
        } else if (prevTitle === "h3" && currTitle === "h2") {
          pushError(INVALID_H3_POSITION, "H3 should be after H2", prevLocation);
        } else if (prevTitle === "h3" && currTitle === "h1") {
          pushError(INVALID_H3_POSITION, "H3 should be after H1", prevLocation);
        }
      }
    }
  }
}

let warningCheck = new WarningCheck();
let titlesCheck = new TitlesCheck();
let depth = 0;

function reset() {
  console.log("Reset global variables");
  warningCheck = new WarningCheck();
  titlesCheck = new TitlesCheck();
  depth = 0;
}

function traverse(node) {
  //console.log(`-> ${depth}`);
  depth++;
  const startLine = node.loc.start.line;
  const endLine = node.loc.end.line;

  if (isObjectNode(node)) {
    const children = node.children;
    parent = node;
    children.forEach(node => traverse(node));

  } else if (isPropertyNode(node)) {
    const type = node.value.type;

    if (isLiteralPropertyType(type)) {
      warningCheck.process(parent, node);
      titlesCheck.process(parent, node, depth);

    } else if (isArrayPropertyType(type)) {
      const children = node.value.children;
      children.forEach(node => traverse(node));

    } else if (isObjectPropertyType(type)) {
      traverse(node.value);

    } else {
      throw new Error(`Unknown property type: ${type} on lines ${startLine}..${endLine}`);
    }

  } else if (isArrayNode(node)) {
    const children = node.children;
    children.forEach(node => traverse(node));

  } else {
    throw new Error(`Unknown node type: ${node.type} on lines ${startLine}..${endLine}`);
  }
  depth--;
  //console.log(`<- ${depth}`);
}

//export function lint(jsonString) {
function lint(jsonString) {
  const ast = jsonToAst(jsonString);
  traverse(ast);
  titlesCheck.onComplete();
  console.log("errors: ", errors);
  return errors;
};

globalThis.lint = lint;
globalThis.reset = reset;
//
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
//
//lint(validTextSizesString);//
