const base = require("./pa11y.default.js");

const knownWarnings = [
  {
    // "This content looks like it is simulating an ordered list using plain text." (the page's text starts with the
    // section bar's numbers, like "01 02", and line breaks in the content split it, like a list)
    rules: ["WCAG2AA.Principle1.Guideline1_3.1_3_1.H48.2"],
    selectors: ["div.min-h-screen"],
  },
];

module.exports = {
  ...base,
  defaults: {
    ...base.createDefaults(knownWarnings),
    viewport: {
      width: 320,
      height: 480,
      deviceScaleFactor: 2,
      isMobile: true,
    },
  },
};
