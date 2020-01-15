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

let errors = [];

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

function containsSizes(array, element) {
  for (let i = 0; i < array.length - 1; i++) {
    if (array[i] === element) {
      return true;
    }
  }
  return false;
}

class WarningCheck {

  constructor() {
    this.canStart = true;
    this.inProgress = false;
    this.refSize = null;
    this.location = null;
    this.lastPlaceholderBlock = null;//
    this.buttonEnabled = false;//
  }

  checkTextSizes(parent) {
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

  checkButtonSize(parent) {
    this.location = parent.loc;
    console.log(`button внутри warning найден тут: `, this.location); //
    const sizes = ["xxxs", "xxs", "xs", "s", "m", "l", "xl", "xxl", "xxxl", "xxxxl", "xxxxxl"];
    const mods = parent.children.find((e) => { return e.key.value === "mods" });
    const button = mods.value.children.find((e) => { return e.key.value === "size" });
    const buttonSize = button.value.value;

    if (!containsSizes(sizes, buttonSize)) {
      console.error(`Button can't be this size.`);
    } else {
      const refButtonSize = sizes[sizes.findIndex((size) => size === this.refSize) + 1];

      if (this.refSize !== null && buttonSize !== refButtonSize) {
        console.log(`неверный размер! Должен быть refButtonSize: ${refButtonSize}`); //
        pushError(INVALID_BUTTON_SIZE, "Button sizes inside 'warning' shoud be 1 more.", this.location);
      }
    }
  }

  process(parent, node) {
    const key = node.key.value;
    const value = node.value.value;

    if (this.canStart) {
      if (key === "block" && value === "warning") {
        this.location = parent.loc;
        console.log("[START] Checking warning");
        this.canStart = false;
        this.inProgress = true;
        traverse(parent);
        this.inProgress = false;
        console.log("[FINISH] Checking warning");
      }
    } else if (this.inProgress && value === "text") {
      this.checkTextSizes(parent);
    } else if (!this.inProgress && value === "button") {
      this.checkButtonSize(parent);
    }

    // // // new button size rule
    // if (!this.inProgress && node.value.value === "button") {
    //   this.buttonLocation = parent.loc;
    //   console.log(`button внутри warning найден тут: `, this.buttonLocation);
    //   console.log(` this.refSize: `,  this.refSize);
    //   this.location = parent.loc;
    //   const mods = parent.children.find((e) => { return e.key.value === "mods" });
    //   // Check position
    //   if ((this.buttonLocation.end.line < this.lastPlaceholderBlock.start.line) || (this.buttonLocation.end.line === this.lastPlaceholderBlock.start.line && this.buttonLocation.end.column < this.lastPlaceholderBlock.start.column)) {
    //     pushError(INVALID_BUTTON_POSITION, "Button can't be in front of the placeholder.", this.buttonLocation)
    //   }
    // //   //
    // //   if (!this.buttonEnabled) {
    // //     pushError(INVALID_BUTTON_POSITION, "Button can't be in front of the placeholder.", this.location);/////
    // //   } else {//start else
    //     const button = mods.value.children.find((e) => { return e.key.value === "size" });
    //     const buttonSize = button.value.value;
    //
    //     if (!containsSizes(this.sizes, buttonSize)) {
    //       console.error(`Button can't be this size.`);
    //     } else {
    //       const refButtonSize = this.sizes[this.sizes.findIndex((size) => size === this.refSize) + 1];
    //       if (this.refSize !== null && buttonSize !== refButtonSize) {
    //         console.log(`неверный размер! Должен быть refButtonSize: ${refButtonSize}`);
    //         pushError(INVALID_BUTTON_SIZE, "Button sizes inside 'warning' shoud be 1 more.", this.location);
    //       }
    //       }// end else
    //     //}//end else
    // }
    //
    //
    //
    //
    // // //placeholder rule
    // if (this.inProgress && node.value.value === "placeholder") {
    //   this.lastPlaceholderBlock = parent.loc; //
    //   //this.location = parent.loc;
    //   console.log('placeholder внутри warning найден тут: ', this.lastPlaceholderBlock);
    //   this.buttonEnabled = true;
    //   //
    //   if (this.lastPlaceholderBlock == null) {
    //     console.error("Last placeholder block is null");
    //   } else {
    //     const loc = this.lastPlaceholderBlock.loc;
    //     //console.log(`${node.value.value.toUpperCase()} inside PLACEHOLDER BLOCK: ${loc.start.line}...${loc.end.line}`);
    //     const mods = parent.children.find((e) => { return e.key.value === "mods" });
    //     if (mods) {
    //       const size = mods.value.children.find((e) => { return e.key.value === "size" });
    //       if (!["s", "m", "l"].includes(size.value.value)) {
    //         pushError(INVALID_PLACEHOLDER_SIZE, "Placeholder sizes inside 'warning' shoud be \"s\", \"m\", or \"l\"", loc);
    //       }
    //     } else {
    //       pushError(ERROR_PLACEHOLDER_NO_SIZE_VALUE, "Placeholder block with 'mods' has no 'size' block", loc);
    //     }
    //   }
    //   //
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
        console.log(`${value.toUpperCase()} inside TEXT BLOCK: ${loc.start.line}...${loc.end.line}`);

        const contains = this.titles.find((e) => { return e.location === loc }) != null;

        if (!contains) {
          this.titles.push({
            title: value,
            location: loc,
            depth: depth
          });
        }
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

function lint(jsonString) {
  const ast = jsonToAst(jsonString);
  traverse(ast);
  titlesCheck.onComplete();
  console.log("errors: ", errors);
  return errors;
};

function reset() {
  // For runnig local tests.
  console.log("Reset global variables");
  warningCheck = new WarningCheck();
  titlesCheck = new TitlesCheck();
  errors = [];
  depth = 0;
}


globalThis.lint = lint;
//globalThis.reset = reset; //

const a = `{
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

//lint(a); //
