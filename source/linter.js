import jsonToAst from 'json-to-ast';

const ERROR_TEXT_SIZES_SHOULD_BE_EQUAL = "WARNING.TEXT_SIZES_SHOULD_BE_EQUAL";
const ERROR_TEXT_NO_SIZE_VALUE = "WARNING.TEXT_NO_SIZE_VALUE";
const INVALID_BUTTON_SIZE = "WARNING.INVALID_BUTTON_SIZE";
const INVALID_PLACEHOLDER_SIZE = "WARNING.INVALID_PLACEHOLDER_SIZE";

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

class ButtonSizeForWarningRule {

  constructor() {
    this.canStart = true;
    this.inProgress = false;
    this.refSize = null;
    this.buttons = [];//
    this.location = null;
    this.sizes = ['xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl', 'xxxxl'];
  }

  contains (array, element) {
    for (let i = 0; i < array.length - 1; i++) {
      if (array[i] === element) {
        return true;
      }
    }
    return false;
  }

  process(parent, node) {
    if (this.canStart) {
      const key = node.key.value;
      const value = node.value.value;

      if (key === "block" && value === "warning") {
        console.log("[START] Checking button size rule");
        this.canStart = false;
        this.inProgress = true;
        traverse(parent);
        this.inProgress = false;
        console.log("[FINISH] Checking button size rule");
      }
    } else if (this.inProgress && node.value.value === "text") {
      const mods = parent.children.find((e) => { return e.key.value === "mods" });

      if (mods) {
        const size = mods.value.children.find((e) => { return e.key.value === "size" });

        if (size) {
          const currSize = size.value.value;

          if (this.refSize === null) {
            this.refSize = currSize;
          } else {
            pushError(ERROR_TEXT_NO_SIZE_VALUE, "Text block with 'mods' has no 'size' block", parent.loc)
          }
        }
      }
    if (this.inProgress && node.value.value === "button") {
      this.location = parent.loc;
      const mods = parent.children.find((e) => { return e.key.value === "mods" });
      if (mods) {
        const buttonSize = mods.value.children.find((e) => { return e.key.value === "size" });
        if (!contains(this.sizes, buttonSize)) {//
          console.log(`не может быть такого размера: ${buttonSize}`);
        } else {
          const refButtonSize = this.sizes[this.sizes.findIndex((size) => size === buttonSize) + 1];
          if (buttonSize !== this.refSize) {
            console.log(`неверный размер! Должен быть refButtonSize: ${this.refSize}`);
          }
        }//
      }

      console.log(`find button`);
    } else { pushError(INVALID_BUTTON_SIZE, "Button sizes inside 'warning' shoud be 1 more", this.location) }
    }
  }
}

class PlaceholderSizeForWarningRule {

  constructor() {
    this.canStart = true;
    this.inProgress = false;
    this.location = null;
  }

  process(parent, node) {
    if (this.canStart) {
      const key = node.key.value;
      const value = node.value.value;

      if (key === "block" && value === "warning") {
        console.log("[START] Checking placeholder size rule");
        this.canStart = false;
        this.inProgress = true;
        traverse(parent);
        this.inProgress = false;
        console.log("[FINISH] Checking placeholder size rule");
      }
    } else if (this.inProgress && node.value.value === "placeholder") {
      this.location = parent.loc;
      const mods = parent.children.find((e) => { return e.key.value === "mods" });

      if (mods) {
        const size = mods.value.children.find((e) => { return e.key.value === "size" });

        if (!["s", "m", "l"].includes(size.value.value)) {
          pushError(INVALID_PLACEHOLDER_SIZE, "Placeholder sizes inside 'warning' shoud be \"s\", \"m\", or \"l\"", this.location);
        }
      } else {
        pushError(ERROR_PLACEHOLDER_NO_SIZE_VALUE, "Placeholder block with 'mods' has no 'size' block", this.location);
      }
    }
  }
}

class WarningCheck {

  constructor() {
    this.canStart = true;
    this.inProgress = false;
    this.refSize = null;
    this.location = null;
  }

  process(parent, node) {
    if (this.canStart) {
      const key = node.key.value;
      const value = node.value.value;

      if (key === "block" && value === "warning") {
        this.location = parent.loc;
        console.log("[START] Checking text size rule");
        this.canStart = false;
        this.inProgress = true;
        traverse(parent);
        this.inProgress = false;
        console.log("[FINISH] Checking text size rule");
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
  }
}


// const buttonSizeForWarningRule = new ButtonSizeForWarningRule();
// const placeholderSizeForWarningRule = new PlaceholderSizeForWarningRule();
const warningCheck = new WarningCheck();


function traverse(node) {
  const startLine = node.loc.start.line;
  const endLine = node.loc.end.line;

  if (isObjectNode(node)) {
    const children = node.children;
    parent = node;
    children.forEach(node => traverse(node));

  } else if (isPropertyNode(node)) {
    const type = node.value.type;

    if (isLiteralPropertyType(type)) {
      //buttonSizeForWarningRule.process(parent, node);
      //placeholderSizeForWarningRule.process(parent, node);
      warningCheck.process(parent, node);

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
}

function lint(jsonString) {
  const ast = jsonToAst(jsonString);
  traverse(ast);
  console.log('errors: ', errors);
  return errors;
}

export {lint};