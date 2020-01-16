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
    this.buttonPlaceholderArray = [];
    this.placeholderLocation = null;
    this.buttonLocation = null;
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

  checkButtonSize() {
    const sizes = ["xxxs", "xxs", "xs", "s", "m", "l", "xl", "xxl", "xxxl", "xxxxl", "xxxxxl"];
    const buttons = this.buttonPlaceholderArray.filter((e) => { return e.title === "button" });

    buttons.forEach((button) => {
      const size = button.mods.value.children.find((e) => { return e.key.value === "size" });
      const buttonSize = size.value.value;

      if (!containsSizes(sizes, buttonSize)) {
        console.error(`Button can't be this size.`);
        // Возможно тут тоже стоит сделать pushError
        //pushError(INVALID_BUTTON_SIZE, "Button sizes inside 'warning' shoud be 1 more.", this.buttonLocation);//
      } else {
        const refButtonSize = sizes[sizes.findIndex((size) => size === this.refSize) + 1];

        if (this.refSize !== null && buttonSize !== refButtonSize) {
          console.log(`неверный размер! Должен быть refButtonSize: ${refButtonSize}`); //
          pushError(INVALID_BUTTON_SIZE, "Button sizes inside 'warning' shoud be 1 more.", this.buttonLocation);
        }
      }
    });
  }

  checkButtonPosition() {
    for (let i = 1; i < this.buttonPlaceholderArray.length; i++) {
      const prevTitle = this.buttonPlaceholderArray[i - 1].title;
      const prevLocation = this.buttonPlaceholderArray[i - 1].location;
      const prevDepth = this.buttonPlaceholderArray[i - 1].depth;

      const currTitle = this.buttonPlaceholderArray[i].title;
      const currLocation = this.buttonPlaceholderArray[i].location;
      const currDepth = this.buttonPlaceholderArray[i].depth;

      if (prevDepth >= currDepth) {
        if (prevTitle === "button" && currTitle === "placeholder") {
          if ((prevLocation.end.line < currLocation.start.line) || (prevLocation.end.line === currLocation.start.line && prevLocation.end.column < currLocation.start.column)) {
            pushError(INVALID_BUTTON_POSITION, "Button can't be in front of the placeholder.", prevLocation);
          }
        }
      }
    }
  }

  checkPlaceholderSize() {
    const placeholders = this.buttonPlaceholderArray.filter((e) => { return e.title === "placeholder" });

    placeholders.forEach((placeholder) => {
      const size = placeholder.mods.value.children.find((e) => { return e.key.value === "size" });

      if (!["s", "m", "l"].includes(size.value.value)) {
        pushError(INVALID_PLACEHOLDER_SIZE, "Placeholder sizes inside 'warning' shoud be \"s\", \"m\", or \"l\"", this.placeholderLocation);
      }
    });
  }

  process(parent, node, depth) {
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
        console.log("this.buttonPlaceholderArray from process: ", this.buttonPlaceholderArray);
        console.log("[FINISH] Checking warning");
      }
    } else if (this.inProgress && value === "text") {
      this.checkTextSizes(parent);
    }

    if (this.inProgress && value === "placeholder") {
      this.placeholderLocation = parent.loc;
      this.buttonPlaceholderArray.push({
        mods: parent.children.find((e) => { return e.key.value === "mods" }),
        title: node.value.value,
        location: this.placeholderLocation,
        depth: depth
      });
    }

    if (this.inProgress && value === "button") {
      this.buttonLocation = parent.loc;
      this.buttonPlaceholderArray.push({
        mods: parent.children.find((e) => { return e.key.value === "mods" }),
        title: node.value.value,
        location: this.buttonLocation,
        depth: depth
      });
      //this.checkButtonPosition(parent);
    }
  }

  onComplete() {
    console.log(`warning ONCOMLEATE`);
    this.checkButtonSize();
    this.checkButtonPosition();
    this.checkPlaceholderSize();
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

      if (prevDepth >= currDepth) {//
        if (prevTitle === "h2" && currTitle === "h1") {
          // (h2End.line < h1Start.line) || (h2End.line === h1Start.line && h2End.column < h1Start.column)
          //if ((prevLocation.end.line < currLocation.start.line) || (prevLocation.end.line === currLocation.start.line && prevLocation.end.column < currLocation.start.column)) {
            pushError(INVALID_H2_POSITION, "H2 should be after H1.", prevLocation);
          //}
        } else if (prevTitle === "h3" && currTitle === "h2") {
          //(h3End.line < h2Start.line) || (h3End.line === h2Start.line && h3End.column < h2Start.column)
          //if ((prevLocation.end.line < currLocation.start.line) || (prevLocation.end.line === currLocation.start.line && prevLocation.end.column < currLocation.start.column)) {
            pushError(INVALID_H3_POSITION, "H3 should be after H2.", prevLocation);
          //}
        } else if (prevTitle === "h3" && currTitle === "h1") {
          pushError(INVALID_H3_POSITION, "H3 should be after H2.", prevLocation);
        }
      }//
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
      warningCheck.process(parent, node, depth);
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
  warningCheck.onComplete();
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

const valid = `{
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

const invalid = `{
          "block": "warning",
          "content": [
            {
              "elem": "content",
              "content": [
                { "block": "placeholder", "mods": { "size": "s" } },
                { "block": "button", "mods": { "size": "m" } },
                { "block": "placeholder", "mods": { "size": "xll" } },
                { "block": "button", "mods": { "size": "m" } }
              ]
            }
          ]
        }`;

const notWarning = `{
          "block": "test",
          "content": [
            {
              "elem": "content",
              "content": [
                { "block": "placeholder" },
                { "block": "button", "mods": { "size": "m" } },
                { "block": "placeholder", "mods": { "size": "sd" } },
                { "block": "button", "mods": { "size": "m" } }
              ]
            }
          ]
        }`;

//lint(invalid); //