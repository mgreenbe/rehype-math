let unified = require("unified");
let parse = require("rehype-parse");
let vfile = require("vfile");
let math = require("../rehype-math.js");
let is = require("unist-util-is");

let htmls = [
  `<!DOCTYPE html>
<html>
<body>

<p>This is a paragraph.</p>
<p>This is another paragraph.</p>

</body>
</html>
`,
  `<h2>HTML Links</h2>
<p>HTML links are defined with the a tag:</p>

<a href="https://www.w3schools.com">This is a link</a>
`,
  `<p>In HTML, spaces and new lines are ignored:</p>

<p>

  My Bonnie lies over the ocean.

  My Bonnie lies over the sea.

  My Bonnie lies over the ocean.
  
  Oh, bring back my Bonnie to me.

</p>
`,
];

test("does nothing when there's no math", () => {
  let parser = unified().use(parse, { fragment: true });
  let transformer = unified().use(math);
  for (let html of htmls) {
    let hast = parser.parse(html);
    transformedHast = transformer.runSync(hast);
    expect(transformedHast).toEqual(hast);
  }
});

test("just inline math", () => {
  let html = "$x^2+y^2=z^2$";
  let parser = unified().use(parse, { fragment: true });
  let transformer = unified().use(math);
  let hast = parser.parse(html);
  transformedHast = transformer.runSync(hast);
  // console.log(JSON.stringify(transformedHast, null, 2));

  expect(transformedHast.children.length).toBe(1);
  expect(transformedHast.children[0]).toMatchObject({
    type: "element",
    tagName: "span",
    properties: { className: ["math-inline"] },
  });
  expect(transformedHast.children[0].children.length).toBe(1);
  expect(transformedHast.children[0].children[0]).toMatchObject({
    type: "text",
    value: "x^2+y^2=z^2",
  });
});

test("just display math", () => {
  let html = "$$x^2+y^2=z^2$$";
  let parser = unified().use(parse, { fragment: true });
  let transformer = unified().use(math);
  let hast = parser.parse(html);
  transformedHast = transformer.runSync(hast);
  // console.log(JSON.stringify(transformedHast.children[0], null, 2));

  expect(transformedHast.children.length).toBe(1);
  expect(transformedHast.children[0]).toMatchObject({
    type: "element",
    tagName: "div",
    properties: { className: ["math-display"] },
  });
  expect(transformedHast.children[0].children.length).toBe(1);
  expect(transformedHast.children[0].children[0]).toMatchObject({
    type: "text",
    value: "x^2+y^2=z^2",
  });
});

test("two inline math in same container", () => {
  let html = "$x^2+y^2=z^2$ and $\\int_a^b F'(x)\\,dx = F(b) - F(a)$";
  let parser = unified().use(parse, { fragment: true });
  let transformer = unified().use(math);
  let hast = parser.parse(html);
  transformedHast = transformer.runSync(hast);

  expect(transformedHast.children.length).toBe(3);
  expect(transformedHast.children[0]).toMatchObject({
    type: "element",
    tagName: "span",
    properties: { className: ["math-inline"] },
    children: [{ type: "text", value: "x^2+y^2=z^2" }],
  });
  expect(transformedHast.children[1]).toMatchObject({
    type: "text",
    value: " and ",
  });
  expect(transformedHast.children[2]).toMatchObject({
    type: "element",
    tagName: "span",
    properties: { className: ["math-inline"] },
    children: [{ type: "text", value: "\\int_a^b F'(x)\\,dx = F(b) - F(a)" }],
  });
});

test("two display math in same container", () => {
  let html = "$$x^2+y^2=z^2$$ and $$\\int_a^b F'(x)\\,dx = F(b) - F(a)$$";
  let parser = unified().use(parse, { fragment: true });
  let transformer = unified().use(math);
  let hast = parser.parse(html);
  transformedHast = transformer.runSync(hast);

  expect(transformedHast.children.length).toBe(3);
  expect(transformedHast.children[0]).toMatchObject({
    type: "element",
    tagName: "div",
    properties: { className: ["math-display"] },
    children: [{ type: "text", value: "x^2+y^2=z^2" }],
  });
  expect(transformedHast.children[1]).toMatchObject({
    type: "text",
    value: " and ",
  });
  expect(transformedHast.children[2]).toMatchObject({
    type: "element",
    tagName: "div",
    properties: { className: ["math-display"] },
    children: [{ type: "text", value: "\\int_a^b F'(x)\\,dx = F(b) - F(a)" }],
  });
});

test("one inline, one display math in same container", () => {
  let html = "$x^2+y^2=z^2$ and $$\\int_a^b F'(x)\\,dx = F(b) - F(a)$$";
  let parser = unified().use(parse, { fragment: true });
  let transformer = unified().use(math);
  let hast = parser.parse(html);
  transformedHast = transformer.runSync(hast);

  expect(transformedHast.children.length).toBe(3);
  expect(transformedHast.children[0]).toMatchObject({
    type: "element",
    tagName: "span",
    properties: { className: ["math-inline"] },
    children: [{ type: "text", value: "x^2+y^2=z^2" }],
  });
  expect(transformedHast.children[1]).toMatchObject({
    type: "text",
    value: " and ",
  });
  expect(transformedHast.children[2]).toMatchObject({
    type: "element",
    tagName: "div",
    properties: { className: ["math-display"] },
    children: [{ type: "text", value: "\\int_a^b F'(x)\\,dx = F(b) - F(a)" }],
  });
});

test("one display, one inline math in same container with text before and after", () => {
  let html = "yo $x^2+y^2=z^2$ and $$\\int_a^b F'(x)\\,dx = F(b) - F(a)$$ dude";
  let parser = unified().use(parse, { fragment: true });
  let transformer = unified().use(math);
  let hast = parser.parse(html);
  transformedHast = transformer.runSync(hast);

  expect(transformedHast.children.length).toBe(5);
  expect(transformedHast.children[0]).toMatchObject({
    type: "text",
    value: "yo ",
  });
  expect(transformedHast.children[1]).toMatchObject({
    type: "element",
    tagName: "span",
    properties: { className: ["math-inline"] },
    children: [{ type: "text", value: "x^2+y^2=z^2" }],
  });
  expect(transformedHast.children[2]).toMatchObject({
    type: "text",
    value: " and ",
  });
  expect(transformedHast.children[3]).toMatchObject({
    type: "element",
    tagName: "div",
    properties: { className: ["math-display"] },
    children: [{ type: "text", value: "\\int_a^b F'(x)\\,dx = F(b) - F(a)" }],
  });
  expect(transformedHast.children[4]).toMatchObject({
    type: "text",
    value: " dude",
  });
});

test("escaped dollar sign", () => {
  let parser = unified().use(parse, { fragment: true });
  let transformer = unified().use(math);
  let hast = parser.parse("\\$");
  transformedHast = transformer.runSync(hast);
  expect(transformedHast).toMatchObject({
    type: "root",
    children: [{ type: "text", value: "$" }],
  });
});

test("escaped dollar signs inside inline math", () => {
  let parser = unified().use(parse, { fragment: true });
  let transformer = unified().use(math);
  let hast = parser.parse("$\\$1.00, \\$2.00$");
  transformedHast = transformer.runSync(hast);
  expect(transformedHast).toMatchObject({
    type: "root",
    children: [
      {
        type: "element",
        tagName: "span",
        children: [{ type: "text", value: "$1.00, $2.00" }],
        properties: { className: ["math-inline"] },
      },
    ],
  });
});
