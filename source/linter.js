const jsonToAst = require("json-to-ast");

const ERROR_TEXT_SIZES_SHOULD_BE_EQUAL = "WARNING.TEXT_SIZES_SHOULD_BE_EQUAL";
const INVALID_BUTTON_SIZE = "WARNING.INVALID_BUTTON_SIZE";
const INVALID_PLACEHOLDER_SIZE = "WARNING.INVALID_PLACEHOLDER_SIZE";
const INVALID_BUTTON_POSITION = "WARNING.INVALID_BUTTON_POSITION";
const SEVERAL_H1 = "TEXT.SEVERAL_H1";
const INVALID_H2_POSITION = "TEXT.INVALID_H2_POSITION";
const INVALID_H3_POSITION = "TEXT.INVALID_H3_POSITION";
const TOO_MUCH_MARKETING_BLOCKS = "GRID.TOO_MUCH_MARKETING_BLOCKS";

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
        console.error("Text block with 'mods' has no 'size' block");
      }
    }
  }

  checkButtonSize() {
    const sizes = ["xxxs", "xxs", "xs", "s", "m", "l", "xl", "xxl", "xxxl", "xxxxl", "xxxxxl"];
    const buttons = this.buttonPlaceholderArray.filter((e) => { return e.title === "button" });

    buttons.forEach((button) => {
      const size = button.mods.value.children.find((e) => { return e.key.value === "size" });
      const buttonSize = size.value.value;
      const refButtonSize = sizes[sizes.findIndex((size) => size === this.refSize) + 1];

      if (!containsSizes(sizes, buttonSize) || (this.refSize !== null && buttonSize !== refButtonSize)) {
        console.log(`неверный размер! Должен быть refButtonSize: ${refButtonSize}`); //
        pushError(INVALID_BUTTON_SIZE, "Button sizes inside 'warning' shoud be 1 more.", this.buttonLocation);
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

      //if (prevDepth >= currDepth) {
        if (prevTitle === "button" && currTitle === "placeholder") {
          if ((prevLocation.end.line < currLocation.start.line) || (prevLocation.end.line === currLocation.start.line && prevLocation.end.column < currLocation.start.column)) {
            pushError(INVALID_BUTTON_POSITION, "Button can't be in front of the placeholder.", prevLocation);
          }
        }
      //}
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
  }

  process(parent, node, depth) {
    const key = node.key.value;
    const value = node.value.value;

    const textBlock = parent.children.find((e) => { return e.key.value === "block" && e.value.value === "text" });
    if (!textBlock) return;
    const mods = parent.children.find((e) => { return e.key.value === "mods"});
    if (!mods) return;
    const type = mods.value.children.find((e) => { return e.key.value === "type" });
    if (!type) return;
    const title = type.value.value;

    if (title === "h1" || title === "h2" || title === "h3") {
      this.titles.push({
        title: title,
        location: parent.loc
      });
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
      const prevLoc = this.titles[i - 1].location;

      const currTitle = this.titles[i].title;
      const currLoc = this.titles[i].location;

      if (prevLoc.end.column <= currLoc.end.column) {
        if (prevTitle === "h2" && currTitle === "h1") {
          pushError(INVALID_H2_POSITION, "H2 should be after H1.", prevLoc);

        } else if (prevTitle === "h3" && currTitle === "h2") {
          pushError(INVALID_H3_POSITION, "H3 should be after H2.", prevLoc);

        } else if (prevTitle === "h3" && currTitle === "h1") {
          pushError(INVALID_H3_POSITION, "H3 should be after H1.", prevLoc);
        }
      }
    }
  }
}

class GridCheck {

  constructor() {
    this.canStart = true;
    this.inProgress = false;
    this.location = null;
    this.totalColumns = null;
    this.marketingBlock = [];
    this.marketingBlockName = ["commercial", "offer"];
    this.notMarketingBlock = [];
    this.notMarketingBlockName = ["payment", "warning", "product", "history", "cover", "collect", "articles", "subscribtion", "event"];
  }

  process(parent, node) {
    const key = node.key.value;
    const value = node.value.value;

    if (this.canStart) {
      if (key === "block" && value === "grid") {
        console.log("[START] Checking grid");

        const mods = parent.children.find((e) => { return e.key.value === "mods" });
        this.location = parent.loc;
        this.canStart = false;
        this.inProgress = true;
        traverse(parent);
        this.inProgress = false;

        if (mods) {
          this.totalColumns = mods.value.children.find((e) => { return e.key.value === "m-columns" }).value.value;
          //const content = parent.children.find((e) => { return e.key.value === "content" });
        }


        console.log("[FINISH] Checking grid");
      }
    }
    if (this.marketingBlockName.includes(value)) {
      console.log("value is marketing: ", value);
      const content = parent.children.find((e) => { return e.key.value === "content" });
      const elemMods = parent.children.find((e) => { return e.key.value === "elemMods" });
      const col = elemMods.value.children.find((e) => { return e.key.value === "m-col" }).value.value;
      console.log("marketing col: ", col);
    }

    if (this.notMarketingBlockName.includes(value)) {
      console.log("value is other: ", value);
      const content = parent.children.find((e) => { return e.key.value === "content" });
      const elemMods = parent.children.find((e) => { return e.key.value === "elemMods" });
      const col = elemMods.value.children.find((e) => { return e.key.value === "m-col" }).value.value;
      console.log("other col: ", col);
      this.notMarketingBlock.push({
        name: value,
      });
    }
  }

  onComplete() {
    console.log(`grid ONCOMLEATE`);
  }
}

let warningCheck = new WarningCheck();
let titlesCheck = new TitlesCheck();
let gridCheck = new GridCheck();
let depth = 0;

function traverse(node) {
  // console.log(`-> ${depth}`);
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
      // gridCheck.process(parent, node);

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
  // console.log(`<- ${depth}`);
}

function lint(jsonString) {
  if (typeof jsonString !== 'string') return;

  try {
    const ast = jsonToAst(jsonString);
    traverse(ast);
    titlesCheck.onComplete();
    warningCheck.onComplete();
  } catch {
    throw new Error('Problem with ast.');
  }

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

// globalThis.reset = reset;

globalThis.lint = lint;

module.exports = globalThis.lint;