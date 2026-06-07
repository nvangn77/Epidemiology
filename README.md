# Epi Reference

A self-contained, static single-page web application for epidemiology and pharmacoepidemiology researchers. Works fully offline and is deployable to GitHub Pages with no build step.

**Live app:** https://nvangn77.github.io/epi-reference/ *(after GitHub Pages is enabled)*

---

## Features

### Formula calculator
Interactive calculators for ~26 epidemiological measures with live computation. Includes 95% confidence intervals where standard methods exist. Component pills expand inline definitions of sub-formulas.

**Covers:** Relative risk, Odds ratio, Risk difference, NNT/NNH, Hazard ratio (from Cox β), Incidence rate ratio, Rate difference, PAF, AFe, Preventable fraction, Cumulative incidence, Incidence rate, Prevalence, Odds, IP↔IR conversion, Sensitivity/Specificity/PPV/NPV, LR+/LR−/DOR/Youden's J, Bayesian post-test probability, SMR/SIR, Directly standardised rate, Mantel–Haenszel pooled OR, Cohen's kappa, Proportion CI (Wald + Wilson), E-value.

### Study design reference
SVG schematic diagrams and reference cards for 14 study designs with strengths, limitations, common biases, and Danish register context.

**Covers:** RCT, Cohort, Case-control, Nested case-control, Case-cohort, Cross-sectional, Ecological, SCCS, Case-crossover, PSSA, ACNU, Target trial emulation, Instrumental variable, DiD/ITS.

### Bias reference
Categorised reference cards for 22 biases (selection, information, confounding) with definitions, direction of bias, typical design context, and mitigation strategies.

---

## Running locally

```bash
# Just open the file — no server needed
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

The app uses plain `<script>` globals (not ES modules) so it works via `file://` protocol in Chrome, Firefox, and Safari without a local server.

---

## File structure

```
index.html          — HTML shell, tab navigation, script load order
styles.css          — All CSS custom properties (light + dark mode), layout
app.js              — State, tab routing, compute engine, all rendering
data/
  formulas.js       — FORMULAS global array with compute functions
  designs.js        — DESIGNS global array with SVG diagrams
  biases.js         — BIASES global array
README.md
LICENSE
```

---

## Adding content

Each data file contains a template comment block at the top. The fields are described there. No changes to `app.js` are needed for adding new entries.

### Adding a formula

Open `data/formulas.js` and append an object to the `FORMULAS` array:

```js
{
  id: 'my-formula',          // unique kebab-case — must not clash with existing IDs
  category: 'association',   // association | frequency | diagnostic | standardisation | agreement
  label: 'My Formula (MF)',  // shown in the dropdown
  expression: 'MF = X / Y', // Unicode math, displayed in a code block
  description: 'One sentence: what does this measure?',
  inputs: [
    { id: 'x', label: 'Numerator (X)',   type: 'float', min: 0 },
    { id: 'y', label: 'Denominator (Y)', type: 'float', min: 0 }
  ],
  compute: function(v) {
    // v: object keyed by input id, values are Number (pre-parsed)
    // Called only when all inputs are non-empty valid numbers
    if (v.y === 0) return { error: 'Denominator is zero.' };
    var result = v.x / v.y;
    return {
      value: result,
      // Optional: 95% CI
      ci95low:  result - 1.96 * someStandardError,
      ci95high: result + 1.96 * someStandardError,
      // Optional: multiple values (e.g., for diagnostic table)
      auxiliary: [
        { label: 'Component A', value: someValue }
      ],
      // Optional: unit label, extra note
      unit: 'per 1000',
      note: 'CI method: Wald (Rothman & Greenland 3rd ed.).',
      // Optional: error message instead of result
      // error: 'Message shown in red.'
    };
  },
  // Optional: component pills
  components: [
    {
      id: 'X',
      label: 'X',
      expression: 'X = numerator',
      description: 'What X represents in this formula.'
    }
  ]
}
```

For **dynamic-row formulas** (multiple strata, like Mantel–Haenszel), see the `mh-or` and `dsr` entries in `data/formulas.js` for the additional fields (`dynamicRows`, `rowInputs`, `minRows`, `maxRows`, `rowsLabel`).

The `F` namespace at the top of `data/formulas.js` provides shared math helpers:
- `F.logCI(est, se)` — log-transform CI for ratio measures
- `F.waldCI(est, se)` — Wald CI for difference measures
- `F.wilsonCI(x, n)` — Wilson score CI for a proportion
- `F.byarCI(obs)` — Byar's Poisson CI (for SMR/SIR observed count)
- `F.evalue(rr)` — E-value (VanderWeele & Ding 2017)

### Adding a study design

Open `data/designs.js` and append to the `DESIGNS` array:

```js
{
  id: 'my-design',
  label: 'My Design Name',
  category: 'observational',       // experimental | observational | self-controlled | quasi-experimental
  temporalDirection: 'Prospective',
  primaryMeasure: 'Hazard Ratio',
  svg: '...',                      // inline SVG string — see existing entries; use SVG.wrap() helper
  strengths: ['Strength 1.', 'Strength 2.'],
  limitations: ['Limitation 1.'],
  biases: ['Bias name (shown as badge)'],
  danishPharmacoepiNotes: 'Context for Danish register-based research.',
  commonAnalyses: ['Cox regression']  // optional
}
```

The `SVG` helper object at the top of `data/designs.js` provides reusable SVG building blocks (`SVG.wrap`, `SVG.box`, `SVG.arrow`, `SVG.node`, `SVG.txt`, `SVG.timeAxis`). SVG diagrams should use `currentColor` and `var(--svg-exposed)` / `var(--svg-control)` / `var(--svg-event)` so they adapt to dark mode.

### Adding a bias

Open `data/biases.js` and append to the `BIASES` array:

```js
{
  id: 'my-bias',
  label: 'My bias name',
  category: 'Selection',              // Selection | Information | Confounding
  definition: 'Full definition.',
  directionOfBias: 'Toward null',     // Toward null | Away from null | Unpredictable
  directionExplanation: 'Explanation of why the bias goes in that direction.',
  typicalDesignContext: ['Cohort', 'Case-control'],
  mitigationStrategies: ['Strategy 1.', 'Strategy 2.'],
  exampleScenario: 'Optional concrete scenario.',   // optional
  relatedBiases: ['immortal-time']                  // optional; must match existing IDs
}
```

---

## CI methods used

| Measure | CI method | Source |
|---|---|---|
| RR, OR, IRR, HR | Wald log-transform | Rothman/Greenland/Lash, *Modern Epidemiology* 3rd ed., ch.14 |
| Risk difference, Rate difference | Wald | Rothman/Greenland/Lash |
| Single proportion | Wilson score | Wilson (1927); Newcombe (1998) *Stat Med* |
| SMR/SIR | Byar's Poisson approximation | Breslow & Day (1987) IARC vol.2 |
| Kappa | Simplified Fleiss SE | Fleiss, Levin & Paik, *Statistical Methods for Rates and Proportions* 3rd ed. |
| Incidence rate | Exact Poisson (chi-squared) | Exact method via Wilson–Hilferty approximation |
| E-value | VanderWeele & Ding (2017) | *Ann Intern Med* 2017;166:520–530 |
| MH OR | Robins–Breslow–Greenland | *American Journal of Epidemiology* 1986 |

---

## GitHub Pages deployment

1. Push this repository to GitHub (public or private with Pages enabled).
2. Go to **Settings → Pages**.
3. Source: **Deploy from a branch** → branch `main` → folder `/ (root)`.
4. Save. The site will be published at `https://<username>.github.io/<repo-name>/`.

The app uses no external dependencies, CDN links, or APIs — it will work from any static host.

---

## Acknowledgements

Formula definitions follow Rothman, Greenland & Lash, *Modern Epidemiology* (3rd ed.) and Szklo & Nieto, *Epidemiology: Beyond the Basics* unless otherwise noted in code comments. Intended for pharmacoepidemiology researchers working with Danish health registers (CPR, LPR/DNPR, LPDB/EPJ).
