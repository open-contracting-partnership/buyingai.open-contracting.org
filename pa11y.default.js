const strategy = process.env.PA11Y_STRATEGY;
const includeWarnings = "PA11Y_INCLUDE_WARNINGS" in process.env;
const suppressKnownWarnings = "PA11Y_SUPPRESS_KNOWN_WARNINGS" in process.env;

const knownErrors = [];

const knownWarnings = [
  {
    // "Check that this element has an inherited background colour…" (colours are set by classes, and axe's
    // color-contrast rule checks the actual contrast)
    // https://www.w3.org/WAI/WCAG21/Techniques/failures/F24
    rules: ["WCAG2AA.Principle1.Guideline1_4.1_4_3_F24.F24.FGColour"],
    selectors: ["img[data-nimg]", "article td[style]"],
  },
  {
    // "This element has "position: fixed"." (the header, section bar, sidebar, menu and download button)
    // https://www.w3.org/WAI/WCAG21/Understanding/reflow.html
    rules: ["WCAG2AA.Principle1.Guideline1_4.1_4_10.C32,C31,C33,C38,SCR34,G206"],
    selectors: ["header .fixed", "nav[aria-label='Sections']", "aside", "a[download]"],
  },
  {
    // "Heading markup should be used if this content is intended as a heading." (bold paragraphs in content copied
    // from Google Docs)
    rules: ["WCAG2AA.Principle1.Guideline1_3.1_3_1.H42"],
    selectors: ["article p:has(> strong:first-child)"],
  },
  {
    // "If this element contains a navigation section, it is recommended that it be marked up as a list." (paragraphs
    // with several links; navigation is marked up as lists)
    rules: ["WCAG2AA.Principle1.Guideline1_3.1_3_1.H48"],
    selectors: ["footer p", "article p:has(a ~ a)"],
  },
  {
    // "If this table is a data table, consider using a caption element…" (a heading or paragraph introduces each table)
    rules: ["WCAG2AA.Principle1.Guideline1_3.1_3_1.H39.3.NoCaption"],
    selectors: ["article table"],
  },
  {
    // "Img element is marked so that it is ignored by Assistive Technology." (decorative icons in callouts and case
    // studies)
    rules: ["WCAG2AA.Principle1.Guideline1_1.1_1_1.H67.2"],
    selectors: ["article img[alt='']"],
  },
  {
    // "ARIA attributes must conform to valid values" (Radix sets aria-controls to the popover, which it renders only
    // when open)
    rules: ["aria-valid-attr-value"],
    selectors: ["header button[aria-haspopup='dialog']"],
  },
  {
    // "The heading structure is not logically nested." (headings in content, like a callout before the first h2, or
    // a bold sentence as an h4)
    rules: ["WCAG2AA.Principle1.Guideline1_3.1_3_1_A.G141", "heading-order"],
    selectors: ["article h3", "article h4"],
  },
  {
    // "Elements must meet minimum color contrast ratio thresholds." (needs review) "This element's text is placed on a
    // background image." "This element's text or background contains transparency." (dark text on the home page's
    // translucent white card, a scrolling table of contents with a tinted active chapter, and the menu's gradient
    // title on dark grey)
    rules: [
      "color-contrast",
      "WCAG2AA.Principle1.Guideline1_4.1_4_3.G145.BgImage",
      "WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.BgImage",
      "WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Alpha",
    ],
    selectors: ["#introduction", "nav[aria-label='Table of contents'] span", "header p.bg-clip-text"],
  },
  {
    // A known issue, not a false positive: the home page's lime-to-turquoise title has a contrast of 1.3-2.4:1 on
    // the light background. Changing it is a branding decision.
    rules: ["color-contrast", "WCAG2AA.Principle1.Guideline1_4.1_4_3.G145.BgImage"],
    selectors: ["h1.bg-clip-text"],
  },
];

function createDefaults(extraKnownWarnings = []) {
  const suppressions = [
    ...knownErrors,
    ...(includeWarnings && suppressKnownWarnings ? [...knownWarnings, ...extraKnownWarnings] : []),
  ];

  const withoutSelectors = suppressions.filter((suppression) => !suppression.selectors.length);
  const withSelectors = suppressions.filter((suppression) => suppression.selectors.length);

  const hideElements =
    strategy === "hideElements" ? withSelectors.flatMap((suppression) => suppression.selectors) : [];
  const ignore = [
    ...withoutSelectors.flatMap((suppression) => suppression.rules),
    ...(strategy === "ignore" ? withSelectors.flatMap((suppression) => suppression.rules) : []),
  ];

  return {
    runners: ["htmlcs", "axe"],
    levelCapWhenNeedsReview: "warning",
    includeWarnings: includeWarnings,
    ...(hideElements.length ? { hideElements: hideElements.join(", ") } : {}),
    ...(ignore.length ? { ignore: ignore } : {}),
    timeout: 60000,
  };
}

// The static export, served by: pnpm exec tsx scripts/serve.ts
const base = "http://127.0.0.1:8000";

module.exports = {
  createDefaults,
  defaults: createDefaults(),
  concurrency: 4,
  // Pages that the sitemap excludes.
  urls: [
    // A print page, from which a chapter's PDF is generated.
    `${base}/chapter/09-ways-to-buy-ai/print`,
    `${base}/404`,
  ],
};
