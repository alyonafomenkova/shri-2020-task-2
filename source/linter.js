import jsonToAst from 'json-to-ast';

const isObjectNode = (node) => node.type === "Object";
const isPropertyNode = (node) => node.type === "Property";
const isArrayNode = (node) => node.type === "Array";

const isLiteralPropertyType = (type) => type === "Literal";
const isArrayPropertyType = (type) => type === "Array";
const isObjectPropertyType = (type) => type === "Object";

let depth = 0;

function depthSpaces() {
  let spaces = "";
  for (let i = 0; i < depth; i++) {
    spaces += "  ";
  }
  return spaces;
}

function traverse(node) {
  const startLine = node.loc.start.line;
  const endLine = node.loc.end.line;
  depth++;

  if (isObjectNode(node)) {
    const children = node.children;
    console.log("%sObject with %d children", depthSpaces(), children.length);
    children.forEach(node => traverse(node));

  } else if (isPropertyNode(node)) {
    const name = node.key.value;
    const type = node.value.type;
    console.log("%sProperty: '%s' with value type '%s'", depthSpaces(), name, type);

    if (isLiteralPropertyType(type)) {
      console.log("%sDo nothing with Literal", depthSpaces());

      /////
      if (name === "block" && node.value.value === "warning") {
        console.log("WARNING FOUND!!!!!!!!!!! at %d", startLine);
      }
      /////

    } else if (isArrayPropertyType(type)) {
      const children = node.value.children;
      console.log("%sHandling Array with %d chilren", depthSpaces(), children.length);
      children.forEach(node => traverse(node));

    } else if (isObjectPropertyType(type)) {
      console.log("%sHandling Object", depthSpaces());
      traverse(node.value);

    } else {
      throw new Error(`Unknown property type: ${type} on lines ${startLine}..${endLine}`);
    }

  } else if (isArrayNode(node)) {
    const children = node.children;
    console.log("%sArray with %d children", depthSpaces(), children.length);
    children.forEach(node => traverse(node));

  } else {
    throw new Error(`Unknown node type: ${node.type} on lines ${startLine}..${endLine}`);
  }

  depth--;
}

function lint(jsonString) {
  const ast = jsonToAst(jsonString);
  traverse(ast);
  const arr = [];
  return arr;
}

export {lint};