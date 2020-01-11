import jsonToAst from 'json-to-ast';

const ERROR_TEXT_SIZES_SHOULD_BE_EQUAL = "WARNING.TEXT_SIZES_SHOULD_BE_EQUAL";
const ERROR_TEXT_NO_SIZE_VALUE = "WARNING.TEXT_NO_SIZE_VALUE";

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
  console.log(errors);
}

class TextSizeForWarningRule {

  constructor() {
    this.canStart = true;
    this.inProgress = false;
    this.refSize = null;
  }

  process(parent, node) {
    if (this.canStart) {
      const key = node.key.value;
      const value = node.value.value;

      if (key === "block" && value === "warning") {
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
            pushError(ERROR_TEXT_SIZES_SHOULD_BE_EQUAL, "Text sizes inside 'warning' block are not equal", parent.loc)
          }
        } else {
          pushError(ERROR_TEXT_NO_SIZE_VALUE, "Text block with 'mods' has no 'size' block", parent.loc)
        }
      }
    }
  }
}

const textSizeForWarningRule = new TextSizeForWarningRule();

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
      textSizeForWarningRule.process(parent, node);

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
  return errors;
}

export {lint};