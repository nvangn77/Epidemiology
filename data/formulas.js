/* =========================================================
   data/formulas.js — Formula definitions
   Global: FORMULAS (array)

   ADDING A NEW FORMULA — copy this template:
   {
     id: 'my-formula',          // unique kebab-case string
     category: 'association',   // association | frequency | diagnostic | standardisation | agreement
     label: 'My Formula (MF)',  // display name in dropdown
     expression: 'MF = X / Y', // Unicode math shown as code
     description: 'One-sentence summary of what this measures.',
     inputs: [
       { id: 'x', label: 'Numerator (X)', type: 'float', min: 0 },
       { id: 'y', label: 'Denominator (Y)', type: 'float', min: 0 }
     ],
     compute: function(v) {
       // v: object keyed by input id, all values are Number
       // return: { value, ci95low?, ci95high?, auxiliary?, unit?, note?, error? }
       if (v.y === 0) return { error: 'Denominator is zero.' };
       return { value: v.x / v.y };
     },
     components: [   // optional: small expandable pills
       { id: 'X', label: 'X', expression: 'X = ...', description: '...' }
     ]
   }
   ========================================================= */

/* Helper math namespace — used inside compute functions below */
var F = {
  /* Wald log-transform CI for ratio measures (RR, OR, IRR, HR).
     Reference: Rothman, Greenland & Lash, Modern Epidemiology 3rd ed., ch.14 */
  logCI: function(est, se) {
    if (est <= 0) return null;
    var lo = Math.exp(Math.log(est) - 1.96 * se);
    var hi = Math.exp(Math.log(est) + 1.96 * se);
    return { lo: lo, hi: hi };
  },

  /* Wald CI for difference measures (RD, rate difference) */
  waldCI: function(est, se) {
    return { lo: est - 1.96 * se, hi: est + 1.96 * se };
  },

  /* Wilson score CI for a single proportion.
     Reference: Wilson (1927) JASA; also Newcombe (1998) Stat Med */
  wilsonCI: function(x, n) {
    if (n <= 0) return null;
    var p = x / n;
    var z = 1.96;
    var denom = 1 + z * z / n;
    var center = (p + z * z / (2 * n)) / denom;
    var spread = (z / denom) * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n));
    return { lo: Math.max(0, center - spread), hi: Math.min(1, center + spread) };
  },

  /* Byar's approximation for Poisson (SMR/SIR) CI.
     Reference: Breslow & Day (1987) IARC, Statistical Methods in Cancer Research vol.2 */
  byarCI: function(obs) {
    if (obs < 0) return null;
    var lo, hi;
    if (obs === 0) {
      lo = 0;
    } else {
      lo = obs * Math.pow(1 - 1/(9*obs) - 1.96/Math.sqrt(9*obs), 3);
    }
    hi = (obs + 1) * Math.pow(1 - 1/(9*(obs+1)) + 1.96/Math.sqrt(9*(obs+1)), 3);
    return { lo: lo, hi: hi };
  },

  /* Kappa SE (simplified Fleiss formula).
     Reference: Fleiss, Levin & Paik, Statistical Methods for Rates and Proportions 3rd ed. */
  kappaCI: function(kappa, po, pe, n) {
    if (n <= 0 || pe >= 1) return null;
    var se = Math.sqrt(po * (1 - po) / (n * Math.pow(1 - pe, 2)));
    return F.waldCI(kappa, se);
  },

  /* E-value for unmeasured confounding.
     Reference: VanderWeele & Ding (2017) Ann Intern Med */
  evalue: function(rr) {
    if (rr <= 0) return null;
    if (rr === 1) return 1;
    if (rr < 1) rr = 1 / rr;
    return rr + Math.sqrt(rr * (rr - 1));
  }
};

/* =========================================================
   FORMULAS ARRAY
   ========================================================= */
var FORMULAS = [

  /* -------------------------------------------------------
     MEASURES OF ASSOCIATION
     ------------------------------------------------------- */

  {
    id: 'rr',
    category: 'association',
    label: 'Relative Risk (RR)',
    expression: 'RR = R₁ / R₀ = (a/n₁) / (c/n₀)',
    description: 'Ratio of the risk (cumulative incidence) in the exposed group to the risk in the unexposed group.',
    inputs: [
      { id: 'a',  label: 'Events in exposed (a)',     type: 'integer', min: 0 },
      { id: 'n1', label: 'Total exposed (n₁)',          type: 'integer', min: 1 },
      { id: 'c',  label: 'Events in unexposed (c)',   type: 'integer', min: 0 },
      { id: 'n0', label: 'Total unexposed (n₀)',        type: 'integer', min: 1 }
    ],
    compute: function(v) {
      if (v.a > v.n1) return { error: 'Events cannot exceed total exposed (a > n₁).' };
      if (v.c > v.n0) return { error: 'Events cannot exceed total unexposed (c > n₀).' };
      var R1 = v.a / v.n1, R0 = v.c / v.n0;
      if (R0 === 0) return { error: 'Risk in unexposed is 0 — RR undefined.' };
      var rr = R1 / R0;
      var note = null;
      if (v.a === 0 || v.c === 0) {
        note = 'Zero cell detected. CI unreliable with Wald method; consider adding 0.5 to all cells (Haldane–Anscombe correction).';
        return { value: rr, note: note };
      }
      /* SE(log RR) = sqrt(1/a - 1/n1 + 1/c - 1/n0) — Wald log-transform */
      var se = Math.sqrt(1/v.a - 1/v.n1 + 1/v.c - 1/v.n0);
      var ci = F.logCI(rr, se);
      return { value: rr, ci95low: ci.lo, ci95high: ci.hi };
    },
    components: [
      { id: 'R1', label: 'R₁', expression: 'R₁ = a / n₁', description: 'Cumulative incidence (risk) in the exposed group: events / total at risk.' },
      { id: 'R0', label: 'R₀', expression: 'R₀ = c / n₀', description: 'Cumulative incidence (risk) in the unexposed group: events / total at risk.' }
    ]
  },

  {
    id: 'or',
    category: 'association',
    label: 'Odds Ratio (OR)',
    expression: 'OR = (a × d) / (b × c)',
    description: 'Ratio of the odds of exposure in cases to the odds of exposure in controls (case-control), or odds of outcome in exposed vs unexposed (cohort).',
    inputs: [
      { id: 'a', label: 'Cell a (cases exposed / events exposed)',        type: 'integer', min: 0 },
      { id: 'b', label: 'Cell b (cases unexposed / non-events exposed)',  type: 'integer', min: 0 },
      { id: 'c', label: 'Cell c (controls exposed / events unexposed)',   type: 'integer', min: 0 },
      { id: 'd', label: 'Cell d (controls unexposed / non-events unexposed)', type: 'integer', min: 0 }
    ],
    compute: function(v) {
      var denom = v.b * v.c;
      if (denom === 0) return { error: 'Cells b or c are zero — OR undefined. Consider continuity correction (+0.5).' };
      var or = (v.a * v.d) / denom;
      var note = null;
      if (v.a === 0 || v.d === 0) {
        note = 'Zero cell (a or d). CI unreliable; consider adding 0.5 to all cells.';
        return { value: or, note: note };
      }
      /* SE(log OR) = sqrt(1/a + 1/b + 1/c + 1/d) */
      var se = Math.sqrt(1/v.a + 1/v.b + 1/v.c + 1/v.d);
      var ci = F.logCI(or, se);
      return { value: or, ci95low: ci.lo, ci95high: ci.hi };
    },
    components: [
      { id: 'O1', label: 'O₁', expression: 'O₁ = a / b', description: 'Odds of outcome (or exposure) in the exposed (or case) group.' },
      { id: 'O0', label: 'O₀', expression: 'O₀ = c / d', description: 'Odds of outcome (or exposure) in the unexposed (or control) group.' }
    ]
  },

  {
    id: 'rd',
    category: 'association',
    label: 'Risk Difference / Attributable Risk (AR)',
    expression: 'RD = R₁ − R₀ = a/n₁ − c/n₀',
    description: 'Absolute difference in risk between exposed and unexposed. Positive = excess risk in exposed; negative = protective.',
    inputs: [
      { id: 'a',  label: 'Events in exposed (a)',     type: 'integer', min: 0 },
      { id: 'n1', label: 'Total exposed (n₁)',          type: 'integer', min: 1 },
      { id: 'c',  label: 'Events in unexposed (c)',   type: 'integer', min: 0 },
      { id: 'n0', label: 'Total unexposed (n₀)',        type: 'integer', min: 1 }
    ],
    compute: function(v) {
      if (v.a > v.n1) return { error: 'a > n₁.' };
      if (v.c > v.n0) return { error: 'c > n₀.' };
      var R1 = v.a / v.n1, R0 = v.c / v.n0;
      var rd = R1 - R0;
      /* Wald SE: sqrt(R1*(1−R1)/n1 + R0*(1−R0)/n0) */
      var se = Math.sqrt(R1*(1-R1)/v.n1 + R0*(1-R0)/v.n0);
      var ci = F.waldCI(rd, se);
      return { value: rd, ci95low: ci.lo, ci95high: ci.hi };
    },
    components: [
      { id: 'R1', label: 'R₁', expression: 'R₁ = a / n₁', description: 'Risk in the exposed group.' },
      { id: 'R0', label: 'R₀', expression: 'R₀ = c / n₀', description: 'Risk in the unexposed group.' }
    ]
  },

  {
    id: 'nnt',
    category: 'association',
    label: 'NNT / NNH',
    expression: 'NNT = 1 / |RD|',
    description: 'Number needed to treat (NNT, RD < 0) or number needed to harm (NNH, RD > 0): the number of patients requiring the intervention for one additional outcome event.',
    inputs: [
      { id: 'a',  label: 'Events in exposed (a)',     type: 'integer', min: 0 },
      { id: 'n1', label: 'Total exposed (n₁)',          type: 'integer', min: 1 },
      { id: 'c',  label: 'Events in unexposed (c)',   type: 'integer', min: 0 },
      { id: 'n0', label: 'Total unexposed (n₀)',        type: 'integer', min: 1 }
    ],
    compute: function(v) {
      if (v.a > v.n1) return { error: 'a > n₁.' };
      if (v.c > v.n0) return { error: 'c > n₀.' };
      var R1 = v.a / v.n1, R0 = v.c / v.n0;
      var rd = R1 - R0;
      if (rd === 0) return { error: 'Risk difference is 0 — NNT/NNH undefined (infinite).' };
      var nnt = 1 / Math.abs(rd);
      var se = Math.sqrt(R1*(1-R1)/v.n1 + R0*(1-R0)/v.n0);
      /* CI for NNT = 1/CI of RD (bounds swap) */
      var rdLo = rd - 1.96*se, rdHi = rd + 1.96*se;
      var nntLo = (rdHi !== 0) ? 1/Math.abs(rdHi) : Infinity;
      var nntHi = (rdLo !== 0) ? 1/Math.abs(rdLo) : Infinity;
      var label = rd > 0 ? 'NNH' : 'NNT';
      var rdStr = parseFloat(rd.toFixed(4)).toString();
      return { value: nnt, ci95low: Math.min(nntLo, nntHi), ci95high: Math.max(nntLo, nntHi),
               note: label + ' (RD = ' + rdStr + '). ' + (rd > 0 ? 'Positive RD → harm.' : 'Negative RD → benefit.') };
    },
    components: [
      { id: 'AR', label: 'RD', expression: 'RD = R₁ − R₀', description: 'Risk difference. NNT/NNH = 1 / |RD|.' },
      { id: 'R1', label: 'R₁', expression: 'R₁ = a / n₁', description: 'Risk in exposed.' },
      { id: 'R0', label: 'R₀', expression: 'R₀ = c / n₀', description: 'Risk in unexposed.' }
    ]
  },

  {
    id: 'hr',
    category: 'association',
    label: 'Hazard Ratio (HR) from Cox model',
    expression: 'HR = exp(β),  95% CI = exp(β ± 1.96 × SE)',
    description: 'Hazard ratio derived from a Cox proportional hazards model coefficient β and its standard error.',
    inputs: [
      { id: 'beta', label: 'Coefficient β',          type: 'float', placeholder: 'e.g. 0.693' },
      { id: 'se',   label: 'Standard error SE(β)',   type: 'float', min: 0, placeholder: 'e.g. 0.15' }
    ],
    compute: function(v) {
      if (v.se < 0) return { error: 'Standard error must be non-negative.' };
      var hr = Math.exp(v.beta);
      if (v.se === 0) return { value: hr, note: 'SE = 0 — CI is a point estimate.' };
      var lo = Math.exp(v.beta - 1.96 * v.se);
      var hi = Math.exp(v.beta + 1.96 * v.se);
      return { value: hr, ci95low: lo, ci95high: hi };
    },
    components: [
      { id: 'beta', label: 'β', expression: 'β = log(HR)', description: 'Log-hazard ratio from the Cox model output.' },
      { id: 'se',   label: 'SE(β)', expression: 'SE(β) from model', description: 'Standard error of β, from the variance-covariance matrix.' }
    ]
  },

  {
    id: 'irr',
    category: 'association',
    label: 'Incidence Rate Ratio (IRR)',
    expression: 'IRR = IR₁ / IR₀ = (d₁/PT₁) / (d₀/PT₀)',
    description: 'Ratio of incidence rates between exposed and unexposed. Used in person-time cohort analyses.',
    inputs: [
      { id: 'd1',  label: 'Events in exposed (d₁)',          type: 'integer', min: 0 },
      { id: 'pt1', label: 'Person-time exposed (PT₁)',         type: 'float',   min: 0, placeholder: 'e.g. person-years' },
      { id: 'd0',  label: 'Events in unexposed (d₀)',        type: 'integer', min: 0 },
      { id: 'pt0', label: 'Person-time unexposed (PT₀)',       type: 'float',   min: 0, placeholder: 'e.g. person-years' }
    ],
    compute: function(v) {
      if (v.pt1 <= 0 || v.pt0 <= 0) return { error: 'Person-time must be > 0.' };
      var IR1 = v.d1 / v.pt1, IR0 = v.d0 / v.pt0;
      if (IR0 === 0) return { error: 'Incidence rate in unexposed is 0 — IRR undefined.' };
      var irr = IR1 / IR0;
      if (v.d1 === 0 || v.d0 === 0) return { value: irr, note: 'Zero events in one group. CI requires events > 0.' };
      /* SE(log IRR) = sqrt(1/d1 + 1/d0) — Exact Poisson approximation */
      var se = Math.sqrt(1/v.d1 + 1/v.d0);
      var ci = F.logCI(irr, se);
      return { value: irr, ci95low: ci.lo, ci95high: ci.hi };
    },
    components: [
      { id: 'IR1', label: 'IR₁', expression: 'IR₁ = d₁ / PT₁', description: 'Incidence rate in exposed: events per unit person-time.' },
      { id: 'IR0', label: 'IR₀', expression: 'IR₀ = d₀ / PT₀', description: 'Incidence rate in unexposed: events per unit person-time.' }
    ]
  },

  {
    id: 'rate-diff',
    category: 'association',
    label: 'Rate Difference',
    expression: 'RD = IR₁ − IR₀ = d₁/PT₁ − d₀/PT₀',
    description: 'Absolute difference in incidence rates between exposed and unexposed groups.',
    inputs: [
      { id: 'd1',  label: 'Events in exposed (d₁)',    type: 'integer', min: 0 },
      { id: 'pt1', label: 'Person-time exposed (PT₁)',  type: 'float',   min: 0 },
      { id: 'd0',  label: 'Events in unexposed (d₀)',  type: 'integer', min: 0 },
      { id: 'pt0', label: 'Person-time unexposed (PT₀)', type: 'float', min: 0 }
    ],
    compute: function(v) {
      if (v.pt1 <= 0 || v.pt0 <= 0) return { error: 'Person-time must be > 0.' };
      var IR1 = v.d1 / v.pt1, IR0 = v.d0 / v.pt0;
      var rd = IR1 - IR0;
      /* SE(RD) = sqrt(d1/PT1² + d0/PT0²) */
      var se = Math.sqrt(v.d1 / (v.pt1*v.pt1) + v.d0 / (v.pt0*v.pt0));
      var ci = F.waldCI(rd, se);
      return { value: rd, ci95low: ci.lo, ci95high: ci.hi, unit: 'per person-time unit' };
    }
  },

  {
    id: 'paf',
    category: 'association',
    label: 'Population Attributable Fraction (PAF)',
    expression: 'PAF = Pₑ(RR − 1) / [Pₑ(RR − 1) + 1]',
    description: 'Fraction of disease in the total population attributable to the exposure, accounting for how common the exposure is. Uses Miettinen\'s formula.',
    inputs: [
      { id: 'rr', label: 'Relative Risk (RR)',                          type: 'float', min: 0, placeholder: 'e.g. 2.5' },
      { id: 'pe', label: 'Prevalence of exposure in population (Pₑ)',   type: 'float', min: 0, placeholder: '0 – 1' }
    ],
    compute: function(v) {
      if (v.rr < 0) return { error: 'RR must be non-negative.' };
      if (v.pe < 0 || v.pe > 1) return { error: 'Exposure prevalence must be between 0 and 1.' };
      var num = v.pe * (v.rr - 1);
      var denom = num + 1;
      if (denom === 0) return { error: 'Denominator is 0.' };
      return { value: num / denom, note: 'Miettinen (1974) formula. Assumes RR ≈ exposure-disease association.' };
    },
    components: [
      { id: 'Pe', label: 'Pₑ', expression: 'Pₑ = proportion exposed in population', description: 'Prevalence of the exposure in the source population, not just cases.' }
    ]
  },

  {
    id: 'afe',
    category: 'association',
    label: 'Attributable Fraction in Exposed (AFe)',
    expression: 'AFe = (RR − 1) / RR = 1 − 1/RR',
    description: 'Fraction of disease among the exposed that is attributable to the exposure. Also called the aetiologic fraction.',
    inputs: [
      { id: 'rr', label: 'Relative Risk (RR)', type: 'float', min: 0, placeholder: 'e.g. 3.0' }
    ],
    compute: function(v) {
      if (v.rr <= 0) return { error: 'RR must be positive.' };
      if (v.rr < 1) return { error: 'RR < 1 indicates a protective exposure. Use preventable fraction instead.' };
      return { value: (v.rr - 1) / v.rr };
    }
  },

  {
    id: 'pf',
    category: 'association',
    label: 'Preventable Fraction (PF)',
    expression: 'PF = 1 − RR  (for RR < 1)',
    description: 'Fraction of potential cases prevented by a protective exposure. RR must be < 1.',
    inputs: [
      { id: 'rr', label: 'Relative Risk (RR)', type: 'float', min: 0, placeholder: 'e.g. 0.6' }
    ],
    compute: function(v) {
      if (v.rr <= 0) return { error: 'RR must be positive.' };
      if (v.rr >= 1) return { error: 'RR ≥ 1 — exposure is not protective. Use AFe instead.' };
      return { value: 1 - v.rr, note: 'Also called the prevented fraction.' };
    }
  },

  /* -------------------------------------------------------
     MEASURES OF FREQUENCY
     ------------------------------------------------------- */

  {
    id: 'cumincidence',
    category: 'frequency',
    label: 'Cumulative incidence (risk)',
    expression: 'CI = cases / N',
    description: 'Proportion of a population that develops the outcome over a specified time period. Requires closed cohort and complete follow-up.',
    inputs: [
      { id: 'cases', label: 'New cases',             type: 'integer', min: 0 },
      { id: 'n',     label: 'Population at risk (N)', type: 'integer', min: 1 }
    ],
    compute: function(v) {
      if (v.cases > v.n) return { error: 'Cases cannot exceed population at risk.' };
      var ci = v.cases / v.n;
      var wci = F.wilsonCI(v.cases, v.n);
      return { value: ci, ci95low: wci.lo, ci95high: wci.hi, note: 'CI uses Wilson score method.' };
    }
  },

  {
    id: 'incrate',
    category: 'frequency',
    label: 'Incidence rate (person-time)',
    expression: 'IR = events / PT',
    description: 'Rate of new events per unit of person-time. Accommodates variable follow-up and open cohorts.',
    inputs: [
      { id: 'events', label: 'New events (d)',      type: 'integer', min: 0 },
      { id: 'pt',     label: 'Total person-time',   type: 'float',   min: 0, placeholder: 'e.g. person-years' }
    ],
    compute: function(v) {
      if (v.pt <= 0) return { error: 'Person-time must be > 0.' };
      var ir = v.events / v.pt;
      /* Exact Poisson CI: chi-squared method */
      var lo = (v.events > 0) ? 0.5 * jsChi2Inv(0.025, 2*v.events) / v.pt : 0;
      var hi = 0.5 * jsChi2Inv(0.975, 2*(v.events+1)) / v.pt;
      return { value: ir, ci95low: lo, ci95high: hi, unit: 'per person-time unit',
               note: 'CI uses exact Poisson (chi-squared) method.' };
    }
  },

  {
    id: 'prevalence',
    category: 'frequency',
    label: 'Prevalence',
    expression: 'P = cases / N',
    description: 'Proportion of a population with the condition at a given point in time (point prevalence) or over a period (period prevalence).',
    inputs: [
      { id: 'cases', label: 'Prevalent cases',        type: 'integer', min: 0 },
      { id: 'n',     label: 'Total population (N)',    type: 'integer', min: 1 }
    ],
    compute: function(v) {
      if (v.cases > v.n) return { error: 'Cases cannot exceed total population.' };
      var p = v.cases / v.n;
      var wci = F.wilsonCI(v.cases, v.n);
      return { value: p, ci95low: wci.lo, ci95high: wci.hi, note: 'CI uses Wilson score method.' };
    }
  },

  {
    id: 'odds',
    category: 'frequency',
    label: 'Odds (of disease)',
    expression: 'Odds = P / (1 − P) = cases / (N − cases)',
    description: 'Ratio of the probability of the event occurring to the probability of it not occurring.',
    inputs: [
      { id: 'cases', label: 'Cases',        type: 'integer', min: 0 },
      { id: 'n',     label: 'Total (N)',    type: 'integer', min: 1 }
    ],
    compute: function(v) {
      if (v.cases >= v.n) return { error: 'Cases must be less than total N.' };
      var noncases = v.n - v.cases;
      if (noncases === 0) return { error: 'No non-cases — odds undefined.' };
      return { value: v.cases / noncases };
    }
  },

  {
    id: 'ip-ir-convert',
    category: 'frequency',
    label: 'Incidence proportion ↔ rate conversion',
    expression: 'CI = 1 − exp(−IR × t)',
    description: 'Convert between cumulative incidence (proportion) and incidence rate assuming a constant rate and exponential survival.',
    inputs: [
      { id: 'ir', label: 'Incidence rate (IR)',          type: 'float', min: 0, placeholder: 'per person-year' },
      { id: 't',  label: 'Time period (t)',              type: 'float', min: 0, placeholder: 'years' }
    ],
    compute: function(v) {
      if (v.ir < 0) return { error: 'IR must be non-negative.' };
      if (v.t <= 0) return { error: 'Time period must be > 0.' };
      var ci = 1 - Math.exp(-v.ir * v.t);
      /* Reverse: IR from CI and t */
      var irFromCi = (ci < 1) ? -Math.log(1 - ci) / v.t : Infinity;
      return {
        value: ci,
        auxiliary: [
          { label: 'Cumulative incidence', value: ci },
          { label: 'IR (round-trip check)', value: irFromCi, unit: 'per time unit' }
        ],
        note: 'Assumes constant hazard (exponential distribution). Not valid for changing rates over time.'
      };
    }
  },

  /* -------------------------------------------------------
     DIAGNOSTIC ACCURACY
     ------------------------------------------------------- */

  {
    id: 'diag-2x2',
    category: 'diagnostic',
    label: 'Sensitivity, Specificity, PPV, NPV (2×2 table)',
    expression: 'Se = TP/(TP+FN)   Sp = TN/(TN+FP)',
    description: 'Complete diagnostic accuracy metrics from a 2×2 table. PPV and NPV depend on prevalence; enter the true prevalence below for adjusted PPV/NPV.',
    inputs: [
      { id: 'tp', label: 'True positives (TP)',   type: 'integer', min: 0 },
      { id: 'fp', label: 'False positives (FP)',  type: 'integer', min: 0 },
      { id: 'fn', label: 'False negatives (FN)',  type: 'integer', min: 0 },
      { id: 'tn', label: 'True negatives (TN)',   type: 'integer', min: 0 }
    ],
    compute: function(v) {
      var P  = v.tp + v.fn;
      var N  = v.fp + v.tn;
      var n  = P + N;
      if (n === 0) return { error: 'All cells are zero.' };
      if (P === 0) return { error: 'No true positives or false negatives (P = 0). Sensitivity undefined.' };
      if (N === 0) return { error: 'No false positives or true negatives (N = 0). Specificity undefined.' };
      if (v.tp + v.fp === 0) return { error: 'No positive test results — PPV undefined.' };
      if (v.tn + v.fn === 0) return { error: 'No negative test results — NPV undefined.' };

      var se  = v.tp / P;
      var sp  = v.tn / N;
      var ppv = v.tp / (v.tp + v.fp);
      var npv = v.tn / (v.tn + v.fn);
      var lrp = (sp < 1) ? se / (1 - sp) : Infinity;
      var lrn = (sp > 0) ? (1 - se) / sp : Infinity;
      var dor = (v.fn * v.fp > 0) ? (v.tp * v.tn) / (v.fp * v.fn) : Infinity;
      var j   = se + sp - 1;

      var seCI  = F.wilsonCI(v.tp, P);
      var spCI  = F.wilsonCI(v.tn, N);
      var ppvCI = F.wilsonCI(v.tp, v.tp + v.fp);
      var npvCI = F.wilsonCI(v.tn, v.tn + v.fn);

      return {
        auxiliary: [
          { label: 'Sensitivity (Se)', value: se, ci: seCI ? [seCI.lo, seCI.hi] : null },
          { label: 'Specificity (Sp)', value: sp, ci: spCI ? [spCI.lo, spCI.hi] : null },
          { label: 'PPV',              value: ppv, ci: ppvCI ? [ppvCI.lo, ppvCI.hi] : null },
          { label: 'NPV',              value: npv, ci: npvCI ? [npvCI.lo, npvCI.hi] : null },
          { label: 'LR+',              value: lrp },
          { label: 'LR−',              value: lrn },
          { label: "Youden's J",       value: j },
          { label: 'DOR',              value: dor }
        ],
        note: 'PPV and NPV from this table reflect the study prevalence. Use the Bayesian post-test probability calculator to adjust for a different target prevalence.'
      };
    }
  },

  {
    id: 'lr-posttest',
    category: 'diagnostic',
    label: 'Bayesian post-test probability',
    expression: 'Post-odds = Pre-odds × LR   →   Post-prob = Post-odds / (1 + Post-odds)',
    description: 'Converts pre-test probability to post-test probability using a likelihood ratio (Fagan nomogram logic). Use LR+ for a positive test; LR− for a negative test.',
    inputs: [
      { id: 'preprob', label: 'Pre-test probability (0–1)', type: 'float', min: 0, placeholder: '0 – 1, e.g. 0.15' },
      { id: 'lr',      label: 'Likelihood ratio (LR+ or LR−)', type: 'float', min: 0, placeholder: 'e.g. 8.5 or 0.12' }
    ],
    compute: function(v) {
      if (v.preprob < 0 || v.preprob >= 1) return { error: 'Pre-test probability must be in [0, 1).' };
      if (v.lr < 0) return { error: 'Likelihood ratio must be non-negative.' };
      var preOdds  = v.preprob / (1 - v.preprob);
      var postOdds = preOdds * v.lr;
      var postProb = postOdds / (1 + postOdds);
      return { value: postProb,
               auxiliary: [
                 { label: 'Pre-test odds',  value: preOdds },
                 { label: 'Post-test odds', value: postOdds },
                 { label: 'Post-test prob', value: postProb }
               ] };
    }
  },

  /* -------------------------------------------------------
     STANDARDISATION & CONFOUNDING
     ------------------------------------------------------- */

  {
    id: 'smr',
    category: 'standardisation',
    label: 'SMR / SIR',
    expression: 'SMR = O / E',
    description: 'Standardised Mortality (or Incidence) Ratio: observed events divided by expected events (computed from a reference population). CI uses Byar\'s Poisson approximation.',
    inputs: [
      { id: 'obs', label: 'Observed events (O)', type: 'integer', min: 0 },
      { id: 'exp', label: 'Expected events (E)', type: 'float',   min: 0, placeholder: 'from reference rates × person-time' }
    ],
    compute: function(v) {
      if (v.exp <= 0) return { error: 'Expected events must be > 0.' };
      var smr = v.obs / v.exp;
      var byar = F.byarCI(v.obs);
      return {
        value: smr,
        ci95low:  byar.lo / v.exp,
        ci95high: byar.hi / v.exp,
        note: 'CI: Byar approximation (Breslow & Day 1987). For O = 0, lower CI = 0.'
      };
    },
    components: [
      { id: 'OE', label: 'O/E', expression: 'E = Σ(reference rate_i × person-time_i)', description: 'Expected events: sum of stratum-specific reference rates multiplied by person-time in each stratum.' }
    ]
  },

  {
    id: 'dsr',
    category: 'standardisation',
    label: 'Directly standardised rate (DSR)',
    expression: 'DSR = Σ(rᵢ × wᵢ) / Σwᵢ',
    description: 'Age-standardised rate using an external standard population. Enter one row per age stratum: observed rate in study population and standard population weight (size).',
    dynamicRows: true,
    minRows: 2,
    maxRows: 10,
    rowsLabel: 'Age strata',
    rowInputs: [
      { id: 'rate',   label: 'Rate rᵢ',        type: 'float', min: 0, placeholder: 'e.g. 0.003' },
      { id: 'weight', label: 'Standard pop wᵢ', type: 'float', min: 0, placeholder: 'e.g. 50000' }
    ],
    compute: function(v) {
      var rows = v.rows.filter(function(r) { return r.weight > 0; });
      if (rows.length === 0) return { error: 'No valid strata with positive weights.' };
      var sumW = rows.reduce(function(s, r) { return s + r.weight; }, 0);
      var sumRW = rows.reduce(function(s, r) { return s + r.rate * r.weight; }, 0);
      if (sumW === 0) return { error: 'Total standard population weight is 0.' };
      var dsr = sumRW / sumW;
      return { value: dsr, unit: 'per person-time unit',
               note: 'DSR = Σ(rᵢ × wᵢ) / Σwᵢ. Variance-based CI requires event counts; not computed here.' };
    }
  },

  {
    id: 'mh-or',
    category: 'standardisation',
    label: 'Mantel–Haenszel pooled OR (stratified)',
    expression: 'OR_MH = Σ(aᵢdᵢ/nᵢ) / Σ(bᵢcᵢ/nᵢ)',
    description: 'Pooled odds ratio across strata (e.g. age groups), controlling for stratification variable. Enter one 2×2 table per stratum (a=cases exposed, b=cases unexposed, c=controls exposed, d=controls unexposed).',
    dynamicRows: true,
    minRows: 2,
    maxRows: 8,
    rowsLabel: 'Strata (2×2 tables)',
    rowInputs: [
      { id: 'a', label: 'a', type: 'integer', min: 0 },
      { id: 'b', label: 'b', type: 'integer', min: 0 },
      { id: 'c', label: 'c', type: 'integer', min: 0 },
      { id: 'd', label: 'd', type: 'integer', min: 0 }
    ],
    compute: function(v) {
      var valid = v.rows.filter(function(r) {
        var n = r.a + r.b + r.c + r.d;
        return n > 0;
      });
      if (valid.length === 0) return { error: 'No valid strata.' };

      var sumNum = 0, sumDen = 0;
      var sumP = 0, sumQ = 0, sumR = 0, sumS = 0, sumT = 0;

      valid.forEach(function(r) {
        var n = r.a + r.b + r.c + r.d;
        sumNum += r.a * r.d / n;
        sumDen += r.b * r.c / n;
        /* Robins–Breslow–Greenland variance components */
        var w = (r.a * r.d) / n;
        var x = (r.b * r.c) / n;
        var p = (r.a + r.d) / n;
        var q = (r.b + r.c) / n;
        sumP += p * w / 2;
        sumQ += (p * x + q * w) / 2;
        sumR += q * x / 2;
        sumS += w;
        sumT += x;
      });

      if (sumDen === 0) return { error: 'MH denominator is 0 — cannot compute pooled OR.' };
      var mhOR = sumNum / sumDen;

      /* Robins–Breslow–Greenland SE(log OR_MH) */
      var seLogOR = Math.sqrt(sumP / (sumS * sumS) + sumQ / (sumS * sumT) + sumR / (sumT * sumT));
      var ci = F.logCI(mhOR, seLogOR);
      return { value: mhOR, ci95low: ci.lo, ci95high: ci.hi,
               note: 'Robins–Breslow–Greenland (1986) CI. Tests for heterogeneity not shown.' };
    }
  },

  /* -------------------------------------------------------
     AGREEMENT & PRECISION
     ------------------------------------------------------- */

  {
    id: 'kappa',
    category: 'agreement',
    label: "Cohen's kappa",
    expression: 'κ = (po − pe) / (1 − pe)',
    description: 'Measure of inter-rater agreement correcting for chance agreement. Enter a 2×2 agreement table: a = both raters +, d = both raters −, b/c = disagreements.',
    inputs: [
      { id: 'a', label: 'Both positive (a)',       type: 'integer', min: 0 },
      { id: 'b', label: 'Rater1+ Rater2− (b)',    type: 'integer', min: 0 },
      { id: 'c', label: 'Rater1− Rater2+ (c)',    type: 'integer', min: 0 },
      { id: 'd', label: 'Both negative (d)',       type: 'integer', min: 0 }
    ],
    compute: function(v) {
      var n = v.a + v.b + v.c + v.d;
      if (n === 0) return { error: 'All cells are zero.' };
      var po = (v.a + v.d) / n;
      var r1pos = (v.a + v.b) / n;
      var r2pos = (v.a + v.c) / n;
      var r1neg = (v.c + v.d) / n;
      var r2neg = (v.b + v.d) / n;
      var pe = r1pos * r2pos + r1neg * r2neg;
      if (pe >= 1) return { error: 'Expected agreement = 1 (degenerate table). Kappa undefined.' };
      var kappa = (po - pe) / (1 - pe);
      var ci = F.kappaCI(kappa, po, pe, n);
      return { value: kappa, ci95low: ci ? ci.lo : undefined, ci95high: ci ? ci.hi : undefined,
               note: 'Interpretation: <0 worse than chance, 0–0.2 slight, 0.2–0.4 fair, 0.4–0.6 moderate, 0.6–0.8 substantial, >0.8 almost perfect (Landis & Koch 1977).' };
    }
  },

  {
    id: 'prop-ci',
    category: 'agreement',
    label: 'Confidence interval for a proportion',
    expression: 'Wald: p ± 1.96√(p(1−p)/n)   Wilson: adjusted score CI',
    description: 'Two methods for the 95% CI of an observed proportion: Wald (simple, less accurate for extreme p or small n) and Wilson score (recommended).',
    inputs: [
      { id: 'x', label: 'Successes / events (x)',  type: 'integer', min: 0 },
      { id: 'n', label: 'Total observations (n)',   type: 'integer', min: 1 }
    ],
    compute: function(v) {
      if (v.x > v.n) return { error: 'x cannot exceed n.' };
      var p = v.x / v.n;
      var waldSE = Math.sqrt(p * (1-p) / v.n);
      var waldLo = Math.max(0, p - 1.96 * waldSE);
      var waldHi = Math.min(1, p + 1.96 * waldSE);
      var wci = F.wilsonCI(v.x, v.n);
      return {
        value: p,
        auxiliary: [
          { label: 'Proportion (p)', value: p },
          { label: 'Wald CI lower',  value: waldLo },
          { label: 'Wald CI upper',  value: waldHi },
          { label: 'Wilson CI lower', value: wci ? wci.lo : null },
          { label: 'Wilson CI upper', value: wci ? wci.hi : null }
        ],
        note: 'Wilson score CI preferred. Wald CI unreliable when p near 0/1 or n is small.'
      };
    }
  },

  {
    id: 'evalue',
    category: 'agreement',
    label: 'E-value (unmeasured confounding)',
    expression: 'E = RR + √(RR × (RR − 1))  [for RR > 1]',
    description: 'Minimum strength of association that an unmeasured confounder must have with both exposure and outcome to explain away the observed effect. Enter the point estimate and, optionally, the CI bound closest to the null.',
    inputs: [
      { id: 'rr',    label: 'Risk/Rate Ratio (point estimate)', type: 'float', min: 0, placeholder: 'e.g. 2.0' },
      { id: 'rr_ci', label: 'CI bound closest to null (optional)', type: 'float', min: 0, placeholder: 'e.g. 1.3 or 0 to skip' }
    ],
    compute: function(v) {
      if (v.rr <= 0) return { error: 'RR must be positive.' };
      var rr = v.rr;
      var flipped = false;
      if (rr < 1) { rr = 1/rr; flipped = true; }
      var ev = F.evalue(rr);
      var aux = [
        { label: 'E-value (point estimate)', value: ev }
      ];
      var note = flipped ? 'RR < 1; E-value computed for 1/RR = ' + formatNum(rr) + '.' : '';
      if (v.rr_ci && v.rr_ci > 0 && v.rr_ci !== v.rr) {
        var ci_bound = v.rr_ci;
        var ci_flipped = false;
        if (ci_bound < 1) { ci_bound = 1/ci_bound; ci_flipped = true; }
        var ev_ci = (ci_bound <= 1) ? 1 : F.evalue(ci_bound);
        aux.push({ label: 'E-value (CI bound)', value: ev_ci });
      }
      var finalNote = (note ? note + ' ' : '') + 'Reference: VanderWeele & Ding (2017) Ann Intern Med.';
      return { value: ev, auxiliary: aux, note: finalNote };
    }
  }

];

/* =========================================================
   Exact Poisson CI helper (chi-squared quantile)
   Used by incidence rate calculator.
   Approximation via Wilson-Hilferty cube-root transformation.
   Reference: Abramowitz & Stegun 26.4.17
   ========================================================= */
function jsChi2Inv(p, df) {
  if (df <= 0) return 0;
  /* Normal approximation to chi-squared quantile */
  var z = jsNormInv(p);
  var x = 1 - 2/(9*df) + z * Math.sqrt(2/(9*df));
  return df * Math.pow(x, 3);
}

function jsNormInv(p) {
  /* Rational approximation (Abramowitz & Stegun 26.2.17) */
  var a = [2.515517, 0.802853, 0.010328];
  var b = [1.432788, 0.189269, 0.001308];
  var t, num, den, x;
  if (p < 0.5) {
    t = Math.sqrt(-2 * Math.log(p));
    num = a[0] + t*(a[1] + t*a[2]);
    den = 1 + t*(b[0] + t*(b[1] + t*b[2]));
    x = -(t - num/den);
  } else {
    t = Math.sqrt(-2 * Math.log(1-p));
    num = a[0] + t*(a[1] + t*a[2]);
    den = 1 + t*(b[0] + t*(b[1] + t*b[2]));
    x = t - num/den;
  }
  return x;
}

/* formatNum is defined in app.js but also needed in compute context —
   provide a local fallback if called before app.js loads (shouldn't happen
   in practice since scripts load synchronously) */
if (typeof formatNum === 'undefined') {
  var formatNum = function(x) { return x !== null && !isNaN(x) ? parseFloat(x.toFixed(3)).toString() : '—'; };
}
