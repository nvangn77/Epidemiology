/* =========================================================
   data/designs.js — Study design definitions
   Global: DESIGNS (array)

   ADDING A NEW DESIGN — copy this template:
   {
     id: 'my-design',                         // unique kebab-case
     label: 'My Design',                      // display name in dropdown
     category: 'observational',               // experimental | observational | self-controlled | quasi-experimental
     temporalDirection: 'Prospective',         // Prospective | Retrospective | Cross-sectional | Bidirectional
     primaryMeasure: 'Risk Ratio, Hazard Ratio',
     svg: '...',                              // inline SVG string (see existing entries for style)
     strengths:  ['...'],
     limitations: ['...'],
     biases: ['Immortal time bias', '...'],   // rendered as badge tags
     danishPharmacoepiNotes: '...',
     commonAnalyses: ['Cox regression', '...'] // optional
   }
   ========================================================= */

/* Shared SVG building blocks */
var SVG = {
  /* Arrowhead marker (end) */
  arrMarker: '<defs><marker id="arr" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto"><polygon points="0,0 8,3.5 0,7" fill="currentColor" opacity="0.8"/></marker>' +
             '<marker id="arr-exp" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto"><polygon points="0,0 8,3.5 0,7" fill="var(--svg-exposed)"/></marker>' +
             '<marker id="arr-ctrl" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto"><polygon points="0,0 8,3.5 0,7" fill="var(--svg-control)"/></marker>' +
             '<marker id="arr-ev" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto"><polygon points="0,0 8,3.5 0,7" fill="var(--svg-event)"/></marker>' +
             '<marker id="arr-back" markerWidth="8" markerHeight="7" refX="1" refY="3.5" orient="auto"><polygon points="8,0 0,3.5 8,7" fill="currentColor" opacity="0.7"/></marker></defs>',

  wrap: function(content, h) {
    h = h || 180;
    return '<svg role="img" viewBox="0 0 400 ' + h + '" xmlns="http://www.w3.org/2000/svg" ' +
           'style="font-family:inherit;overflow:visible" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
           SVG.arrMarker + content + '</svg>';
  },

  /* Styled text */
  txt: function(x, y, text, opts) {
    opts = opts || {};
    var anchor = opts.anchor || 'middle';
    var size   = opts.size || 11;
    var weight = opts.weight || 'normal';
    var fill   = opts.fill || 'currentColor';
    var dy     = opts.dy || '0';
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + anchor + '" ' +
           'font-size="' + size + '" font-weight="' + weight + '" fill="' + fill + '" dy="' + dy + '">' +
           text + '</text>';
  },

  /* Horizontal timeline arrow */
  timeAxis: function(x1, x2, y) {
    return '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" ' +
           'stroke="currentColor" stroke-width="1" opacity="0.3" stroke-dasharray="4,3" marker-end="url(#arr)"/>';
  },

  /* Box with text */
  box: function(x, y, w, h, label, color, textColor) {
    color = color || 'currentColor';
    textColor = textColor || 'currentColor';
    var rx = 6;
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + rx + '" ' +
           'fill="' + color + '" opacity="0.15" stroke="' + color + '" stroke-width="1.5"/>' +
           '<text x="' + (x + w/2) + '" y="' + (y + h/2) + '" text-anchor="middle" ' +
           'dominant-baseline="central" font-size="10" fill="' + textColor + '">' + label + '</text>';
  },

  /* Horizontal arrow */
  arrow: function(x1, y1, x2, y2, color, marker) {
    color = color || 'currentColor';
    marker = marker || 'url(#arr)';
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" ' +
           'stroke="' + color + '" stroke-width="1.5" marker-end="' + marker + '"/>';
  },

  /* Circle node for DAG */
  node: function(cx, cy, r, label, color) {
    color = color || 'currentColor';
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" ' +
           'fill="' + color + '" opacity="0.12" stroke="' + color + '" stroke-width="1.5"/>' +
           '<text x="' + cx + '" y="' + cy + '" text-anchor="middle" dominant-baseline="central" ' +
           'font-size="13" font-weight="500" fill="' + color + '">' + label + '</text>';
  }
};

var DESIGNS = [

  /* -------------------------------------------------------
     RCT
     ------------------------------------------------------- */
  {
    id: 'rct',
    label: 'Randomised Controlled Trial (RCT)',
    category: 'experimental',
    temporalDirection: 'Prospective',
    primaryMeasure: 'Risk Ratio, Risk Difference, Hazard Ratio',
    svg: SVG.wrap(
      /* Title/desc */
      '<title>RCT schematic</title>' +
      '<desc>Timeline showing a population randomised into treatment and control arms, each followed to outcome assessment.</desc>' +

      /* Time axis label */
      SVG.txt(200, 168, 'Time →', {size:9, fill:'currentColor'}) +

      /* Population box */
      SVG.box(10, 70, 80, 36, 'Population', 'currentColor') +

      /* Arrow to randomisation */
      SVG.arrow(91, 88, 145, 88) +

      /* Randomisation box */
      SVG.box(146, 70, 76, 36, 'Randomisation', 'currentColor') +

      /* Branch lines from randomisation */
      '<line x1="222" y1="88" x2="252" y2="55" stroke="currentColor" stroke-width="1.5"/>' +
      '<line x1="222" y1="88" x2="252" y2="121" stroke="currentColor" stroke-width="1.5"/>' +

      /* Treatment arm */
      SVG.box(252, 36, 76, 36, 'Treatment', 'var(--svg-exposed)') +
      SVG.arrow(328, 54, 352, 54, 'var(--svg-exposed)', 'url(#arr-exp)') +
      SVG.box(352, 36, 40, 36, 'Outcome', 'var(--svg-event)') +

      /* Control arm */
      SVG.box(252, 103, 76, 36, 'Control', 'var(--svg-control)') +
      SVG.arrow(328, 121, 352, 121, 'var(--svg-control)', 'url(#arr-ctrl)') +
      SVG.box(352, 103, 40, 36, 'Outcome', 'var(--svg-event)') +

      /* Legend */
      '<rect x="10" y="140" width="12" height="8" rx="2" fill="var(--svg-exposed)" opacity="0.5"/>' +
      SVG.txt(26, 148, 'Treatment', {size:9, anchor:'start'}) +
      '<rect x="80" y="140" width="12" height="8" rx="2" fill="var(--svg-control)" opacity="0.5"/>' +
      SVG.txt(96, 148, 'Control', {size:9, anchor:'start'}) +
      '<rect x="140" y="140" width="12" height="8" rx="2" fill="var(--svg-event)" opacity="0.5"/>' +
      SVG.txt(156, 148, 'Outcome', {size:9, anchor:'start'}),
      175
    ),
    strengths: [
      'Randomisation eliminates measured and unmeasured confounding in expectation.',
      'Clear temporal sequence — exposure precedes outcome.',
      'Provides the strongest causal evidence under standard assumptions (SUTVA, no interference).'
    ],
    limitations: [
      'Expensive, time-consuming, and sometimes infeasible or unethical.',
      'Highly selected populations limit external validity (generalisability).',
      'Short follow-up may miss long-term effects or rare outcomes.',
      'Non-adherence dilutes the intention-to-treat estimate.'
    ],
    biases: ['Loss to follow-up', 'Performance bias', 'Attrition bias', 'Non-adherence dilution'],
    danishPharmacoepiNotes: 'Rarely the primary design in Danish register-based studies, but register data can enrich trial follow-up (RECORD guidelines), provide external reference rates, or support trial emulation via the Danish health registers.',
    commonAnalyses: ['Log-rank test', 'Cox proportional hazards', 'Kaplan–Meier', 'Intention-to-treat analysis']
  },

  /* -------------------------------------------------------
     COHORT
     ------------------------------------------------------- */
  {
    id: 'cohort',
    label: 'Cohort study (prospective / retrospective)',
    category: 'observational',
    temporalDirection: 'Prospective or retrospective',
    primaryMeasure: 'Relative Risk, Hazard Ratio, Incidence Rate Ratio',
    svg: SVG.wrap(
      '<title>Cohort study schematic</title>' +
      '<desc>Two groups — exposed and unexposed — followed forward in time from a common entry point to outcome assessment.</desc>' +

      /* Time axis */
      SVG.arrow(30, 165, 390, 165) +
      SVG.txt(210, 178, 'Time →', {size:9}) +

      /* Cohort entry marker */
      '<line x1="60" y1="30" x2="60" y2="160" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.4"/>' +
      SVG.txt(60, 22, 'Cohort entry', {size:9}) +

      /* Exposed arm */
      SVG.txt(30, 68, 'Exposed', {size:10, fill:'var(--svg-exposed)', anchor:'start', weight:'500'}) +
      '<rect x="60" y="58" width="200" height="20" rx="4" fill="var(--svg-exposed)" opacity="0.18" stroke="var(--svg-exposed)" stroke-width="1"/>' +
      SVG.arrow(260, 68, 330, 68, 'var(--svg-exposed)', 'url(#arr-exp)') +
      SVG.box(330, 50, 55, 36, 'Outcome', 'var(--svg-event)') +

      /* Unexposed arm */
      SVG.txt(30, 118, 'Unexposed', {size:10, fill:'var(--svg-control)', anchor:'start', weight:'500'}) +
      '<rect x="60" y="108" width="200" height="20" rx="4" fill="var(--svg-control)" opacity="0.18" stroke="var(--svg-control)" stroke-width="1"/>' +
      SVG.arrow(260, 118, 330, 118, 'var(--svg-control)', 'url(#arr-ctrl)') +
      SVG.box(330, 100, 55, 36, 'Outcome', 'var(--svg-event)') +

      /* Outcome assessment marker */
      '<line x1="330" y1="30" x2="330" y2="160" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.4"/>' +
      SVG.txt(355, 22, 'Follow-up end', {size:9}) +

      /* Note for retrospective */
      SVG.txt(200, 148, '(Retrospective: data collected after outcomes occurred)', {size:8, fill:'currentColor'}) +

      /* Legend */
      '<rect x="60" y="30" width="12" height="8" rx="2" fill="var(--svg-exposed)" opacity="0.5"/>' +
      SVG.txt(76, 38, 'Exposed', {size:9, anchor:'start'}) +
      '<rect x="130" y="30" width="12" height="8" rx="2" fill="var(--svg-control)" opacity="0.5"/>' +
      SVG.txt(146, 38, 'Unexposed', {size:9, anchor:'start'}),
      185
    ),
    strengths: [
      'Can study multiple outcomes from a single exposure assessment.',
      'Incidence rates directly estimable (with person-time data).',
      'Clear temporality when prospective.',
      'Large Danish registers enable very large cohorts with complete follow-up.'
    ],
    limitations: [
      'Inefficient for rare outcomes — requires large samples and/or long follow-up.',
      'Residual confounding from unmeasured variables.',
      'Retrospective cohorts depend on completeness and accuracy of recorded data.',
      'Loss to follow-up can introduce selection bias.'
    ],
    biases: ['Confounding by indication', 'Loss to follow-up', 'Prevalent user bias', 'Immortal time bias'],
    danishPharmacoepiNotes: 'The dominant design in Danish pharmacoepidemiology. The Civil Registration System (CPR) provides the sampling frame; LPR/DNPR supplies outcomes; the Prescription Register (LPDB/EPJ) supplies drug exposures. Complete follow-up via CPR emigration/death records is a major strength.',
    commonAnalyses: ['Cox proportional hazards', 'Poisson regression', 'Kaplan–Meier', 'IPTW / MSM']
  },

  /* -------------------------------------------------------
     CASE-CONTROL
     ------------------------------------------------------- */
  {
    id: 'case-control',
    label: 'Case-control study',
    category: 'observational',
    temporalDirection: 'Retrospective',
    primaryMeasure: 'Odds Ratio (approximates RR for rare disease)',
    svg: SVG.wrap(
      '<title>Case-control study schematic</title>' +
      '<desc>Cases with disease and controls without disease are identified, then exposure history is traced backwards in time.</desc>' +

      /* Time arrow (right to left — retrospective) */
      SVG.arrow(360, 165, 40, 165) +
      SVG.txt(200, 178, '← Direction of inquiry (retrospective)', {size:9}) +

      /* Cases */
      SVG.box(295, 32, 80, 36, 'Cases (D+)', 'var(--svg-event)') +
      /* Arrow back from cases */
      '<line x1="295" y1="50" x2="200" y2="50" stroke="currentColor" stroke-width="1.5" marker-start="url(#arr-back)"/>' +
      SVG.box(115, 32, 85, 36, 'Exposed (E+)', 'var(--svg-exposed)') +
      '<line x1="295" y1="50" x2="200" y2="80" stroke="currentColor" stroke-width="1" opacity="0.5"/>' +
      SVG.box(115, 62, 85, 36, 'Unexposed (E−)', 'var(--svg-control)') +

      /* Controls */
      SVG.box(295, 103, 80, 36, 'Controls (D−)', 'var(--svg-control)') +
      '<line x1="295" y1="121" x2="200" y2="118" stroke="currentColor" stroke-width="1.5" marker-start="url(#arr-back)"/>' +
      SVG.box(115, 103, 85, 36, 'Exposed (E+)', 'var(--svg-exposed)') +
      '<line x1="295" y1="121" x2="200" y2="148" stroke="currentColor" stroke-width="1" opacity="0.5"/>' +
      SVG.box(115, 133, 85, 36, 'Unexposed (E−)', 'var(--svg-control)') +

      /* Disease axis */
      SVG.txt(335, 22, 'Disease status', {size:9, weight:'500'}) +
      SVG.txt(155, 22, 'Exposure status', {size:9, weight:'500'}) +

      /* Key note */
      SVG.txt(200, 148, 'Exposure status ascertained retrospectively', {size:8, fill:'currentColor'}),
      185
    ),
    strengths: [
      'Efficient for rare diseases — select cases after they occur.',
      'Faster and cheaper than prospective cohort studies.',
      'Can study multiple exposures for the same outcome.',
      'Nested case-control designs within register cohorts are particularly efficient.'
    ],
    limitations: [
      'Yields odds ratio, not directly RR (rare disease assumption needed for equivalence).',
      'Prone to recall bias when exposure is self-reported.',
      'Selection of appropriate controls is a critical and difficult design choice.',
      'Cannot directly estimate incidence rates.'
    ],
    biases: ['Recall bias', 'Selection bias (controls)', 'Berkson bias', 'Exposure misclassification'],
    danishPharmacoepiNotes: 'Register-based case-control avoids recall bias: exposure (prescriptions) is recorded prospectively. The entire Danish population serves as a potential control source. Density sampling (matching on index date) from the population register is standard.',
    commonAnalyses: ['Conditional logistic regression', 'Unconditional logistic regression']
  },

  /* -------------------------------------------------------
     NESTED CASE-CONTROL
     ------------------------------------------------------- */
  {
    id: 'nested-cc',
    label: 'Nested case-control study',
    category: 'observational',
    temporalDirection: 'Retrospective (nested in prospective cohort)',
    primaryMeasure: 'Odds Ratio (estimates RR via density sampling)',
    svg: SVG.wrap(
      '<title>Nested case-control schematic</title>' +
      '<desc>A case-control study nested within a defined cohort. At each case event time, controls are sampled from the risk set (those still under follow-up).</desc>' +

      /* Cohort baseline */
      SVG.txt(30, 20, 'Source cohort', {size:9, weight:'500', anchor:'start'}) +
      '<rect x="30" y="28" width="340" height="14" rx="4" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="1"/>' +

      /* Time axis */
      SVG.arrow(30, 155, 380, 155) +
      SVG.txt(205, 168, 'Time →', {size:9}) +

      /* Case event 1 */
      '<line x1="130" y1="28" x2="130" y2="145" stroke="var(--svg-event)" stroke-width="1.5" stroke-dasharray="4,2"/>' +
      '<circle cx="130" cy="35" r="5" fill="var(--svg-event)" opacity="0.8"/>' +
      SVG.txt(130, 110, 'Case', {size:9, fill:'var(--svg-event)'}) +
      /* Controls sampled at t1 */
      '<circle cx="100" cy="35" r="4" fill="var(--svg-control)" opacity="0.6"/>' +
      '<circle cx="160" cy="35" r="4" fill="var(--svg-control)" opacity="0.6"/>' +
      '<circle cx="200" cy="35" r="4" fill="var(--svg-control)" opacity="0.6"/>' +
      '<line x1="130" y1="100" x2="100" y2="40" stroke="var(--svg-control)" stroke-width="1" stroke-dasharray="3,2" opacity="0.7"/>' +
      '<line x1="130" y1="100" x2="160" y2="40" stroke="var(--svg-control)" stroke-width="1" stroke-dasharray="3,2" opacity="0.7"/>' +
      '<line x1="130" y1="100" x2="200" y2="40" stroke="var(--svg-control)" stroke-width="1" stroke-dasharray="3,2" opacity="0.7"/>' +
      SVG.txt(150, 120, 'Controls sampled from', {size:8, fill:'var(--svg-control)'}) +
      SVG.txt(150, 132, 'risk set at case time', {size:8, fill:'var(--svg-control)'}) +

      /* Case event 2 */
      '<line x1="270" y1="28" x2="270" y2="145" stroke="var(--svg-event)" stroke-width="1.5" stroke-dasharray="4,2"/>' +
      '<circle cx="270" cy="35" r="5" fill="var(--svg-event)" opacity="0.8"/>' +
      '<circle cx="240" cy="35" r="4" fill="var(--svg-control)" opacity="0.6"/>' +
      '<circle cx="320" cy="35" r="4" fill="var(--svg-control)" opacity="0.6"/>' +

      /* Legend */
      '<circle cx="30" cy="145" r="5" fill="var(--svg-event)" opacity="0.8"/>' +
      SVG.txt(40, 148, 'Case', {size:9, anchor:'start'}) +
      '<circle cx="80" cy="145" r="4" fill="var(--svg-control)" opacity="0.7"/>' +
      SVG.txt(90, 148, 'Control (risk set)', {size:9, anchor:'start'}),
      175
    ),
    strengths: [
      'Much more efficient than full cohort analysis for rare outcomes.',
      'Avoids collecting exposure data for the whole cohort.',
      'Density sampling of controls yields OR that directly estimates the rate ratio.',
      'Can match on time in study to control for time trends.'
    ],
    limitations: [
      'Complex sampling and analysis; requires conditional logistic regression.',
      'Control selection must carefully reflect the risk set at each case time.',
      'Less efficient than case-cohort when there are multiple outcomes of interest.'
    ],
    biases: ['Confounding by indication', 'Exposure misclassification', 'Risk set definition errors'],
    danishPharmacoepiNotes: 'Very common in Danish register studies. Cases are identified from LPR/DNPR; controls are matched on index date (density sampling) from the CPR population register. Matching on age, sex, and calendar time is standard.',
    commonAnalyses: ['Conditional logistic regression', 'Cox (equivalent under density sampling)']
  },

  /* -------------------------------------------------------
     CASE-COHORT
     ------------------------------------------------------- */
  {
    id: 'case-cohort',
    label: 'Case-cohort study',
    category: 'observational',
    temporalDirection: 'Retrospective (nested in prospective cohort)',
    primaryMeasure: 'Hazard Ratio, Risk Ratio',
    svg: SVG.wrap(
      '<title>Case-cohort schematic</title>' +
      '<desc>A random subcohort is sampled from the full cohort at baseline. All cases from the full cohort plus the subcohort form the analytic dataset.</desc>' +

      /* Full cohort */
      '<rect x="30" y="25" width="340" height="100" rx="8" fill="currentColor" opacity="0.05" stroke="currentColor" stroke-width="1"/>' +
      SVG.txt(200, 40, 'Full cohort', {size:10, weight:'500'}) +

      /* Subcohort (shaded) */
      '<rect x="50" y="50" width="140" height="65" rx="6" fill="var(--svg-control)" opacity="0.18" stroke="var(--svg-control)" stroke-width="1.5" stroke-dasharray="5,3"/>' +
      SVG.txt(120, 65, 'Subcohort', {size:9, fill:'var(--svg-control)', weight:'500'}) +
      SVG.txt(120, 78, '(random sample)', {size:8, fill:'var(--svg-control)'}) +

      /* Cases from full cohort */
      '<circle cx="250" cy="75" r="6" fill="var(--svg-event)" opacity="0.8"/>' +
      '<circle cx="290" cy="85" r="6" fill="var(--svg-event)" opacity="0.8"/>' +
      '<circle cx="320" cy="65" r="6" fill="var(--svg-event)" opacity="0.8"/>' +
      SVG.txt(290, 110, 'Cases from full cohort', {size:8, fill:'var(--svg-event)'}) +

      /* Arrows to analysis */
      '<line x1="120" y1="115" x2="190" y2="148" stroke="var(--svg-control)" stroke-width="1.5" marker-end="url(#arr-ctrl)"/>' +
      '<line x1="290" y1="115" x2="220" y2="148" stroke="var(--svg-event)" stroke-width="1.5" marker-end="url(#arr-ev)"/>' +
      SVG.box(155, 148, 90, 22, 'Analysis', 'currentColor') +

      /* Legend */
      '<rect x="30" y="145" width="10" height="8" rx="2" fill="var(--svg-control)" opacity="0.5"/>' +
      SVG.txt(45, 152, 'Subcohort', {size:9, anchor:'start'}) +
      '<circle cx="110" cy="149" r="5" fill="var(--svg-event)" opacity="0.8"/>' +
      SVG.txt(120, 152, 'Cases', {size:9, anchor:'start'}),
      175
    ),
    strengths: [
      'Subcohort is a fixed sample — efficient for studying multiple outcomes.',
      'Exposure can be measured once in the subcohort at baseline.',
      'All cases from the full cohort are included, increasing statistical power.'
    ],
    limitations: [
      'More complex analysis than nested case-control (weighted Cox; Prentice 1986).',
      'Cases inside the subcohort have dual roles — requires careful handling.',
      'Less commonly implemented in standard software; requires specialised methods.'
    ],
    biases: ['Confounding by indication', 'Subcohort sampling variability', 'Exposure misclassification'],
    danishPharmacoepiNotes: 'Less common than nested case-control in Danish register studies but used when multiple endpoints are studied simultaneously. The subcohort can be sampled from the CPR register.',
    commonAnalyses: ['Prentice-weighted Cox regression', 'Lin–Ying estimator']
  },

  /* -------------------------------------------------------
     CROSS-SECTIONAL
     ------------------------------------------------------- */
  {
    id: 'cross-sectional',
    label: 'Cross-sectional study',
    category: 'observational',
    temporalDirection: 'Cross-sectional (single time point)',
    primaryMeasure: 'Prevalence Odds Ratio, Prevalence Ratio',
    svg: SVG.wrap(
      '<title>Cross-sectional study schematic</title>' +
      '<desc>A population is measured at one point in time; both exposure and outcome are ascertained simultaneously, yielding a 2x2 prevalence table.</desc>' +

      /* Population box */
      SVG.box(10, 55, 85, 50, 'Population', 'currentColor') +

      /* Snapshot arrow */
      SVG.arrow(95, 80, 145, 80) +
      SVG.txt(120, 70, 'Snapshot', {size:9}) +
      '<line x1="145" y1="20" x2="145" y2="145" stroke="var(--svg-exposed)" stroke-width="2" opacity="0.5"/>' +
      SVG.txt(145, 14, '⌛ Single time point', {size:9, fill:'var(--svg-exposed)'}) +

      /* 2x2 grid */
      SVG.txt(245, 38, 'Exposure', {size:9, weight:'500'}) +
      SVG.txt(175, 55, 'E+', {size:9, fill:'var(--svg-exposed)', weight:'500'}) +
      SVG.txt(255, 55, 'E−', {size:9, fill:'var(--svg-control)', weight:'500'}) +
      SVG.txt(332, 55, 'Total', {size:9}) +

      SVG.txt(148, 78, 'D+', {size:9, fill:'var(--svg-event)', weight:'500', anchor:'end'}) +
      SVG.txt(148, 108, 'D−', {size:9, weight:'500', anchor:'end'}) +
      SVG.txt(148, 130, 'Total', {size:9, anchor:'end'}) +

      '<rect x="155" y="62" width="65" height="26" rx="3" fill="var(--svg-exposed)" opacity="0.1" stroke="var(--svg-exposed)" stroke-width="1"/>' +
      SVG.txt(187, 78, 'a', {size:11}) +
      '<rect x="220" y="62" width="65" height="26" rx="3" fill="var(--svg-control)" opacity="0.1" stroke="var(--svg-control)" stroke-width="1"/>' +
      SVG.txt(252, 78, 'b', {size:11}) +
      SVG.txt(320, 78, 'a+b', {size:10}) +

      '<rect x="155" y="88" width="65" height="26" rx="3" fill="currentColor" opacity="0.04" stroke="currentColor" stroke-width="0.5"/>' +
      SVG.txt(187, 104, 'c', {size:11}) +
      '<rect x="220" y="88" width="65" height="26" rx="3" fill="currentColor" opacity="0.04" stroke="currentColor" stroke-width="0.5"/>' +
      SVG.txt(252, 104, 'd', {size:11}) +
      SVG.txt(320, 104, 'c+d', {size:10}) +

      SVG.txt(187, 126, 'a+c', {size:10}) +
      SVG.txt(252, 126, 'b+d', {size:10}) +
      SVG.txt(320, 126, 'N', {size:11, weight:'500'}) +

      SVG.txt(245, 145, 'Prevalence ratio = (a/(a+c)) / (b/(b+d))', {size:8}),
      160
    ),
    strengths: [
      'Fast, cheap, and logistically simple.',
      'Useful for estimating disease prevalence and generating hypotheses.',
      'No follow-up required; can be done with existing records.'
    ],
    limitations: [
      'Cannot establish temporal precedence of exposure before outcome.',
      'Prevalent user / survivor bias: only living, unrecovered cases are captured.',
      'Inappropriate for rare or short-duration diseases (underestimated).'
    ],
    biases: ['Prevalent user bias', 'Survival bias', 'Berkson bias', 'Non-response bias'],
    danishPharmacoepiNotes: 'Used in Danish register research for prevalence estimation (e.g., point prevalence of drug use on a given date). Easy to construct from CPR + LPDB; however, causal inference is very limited.',
    commonAnalyses: ['Logistic regression (OR)', 'Poisson regression (PR)', 'Prevalence estimates']
  },

  /* -------------------------------------------------------
     ECOLOGICAL
     ------------------------------------------------------- */
  {
    id: 'ecological',
    label: 'Ecological study',
    category: 'observational',
    temporalDirection: 'Cross-sectional or time-series',
    primaryMeasure: 'Ecological correlation (group-level)',
    svg: SVG.wrap(
      '<title>Ecological study schematic</title>' +
      '<desc>Aggregate-level data points (groups or regions) with exposure rates on the x-axis and outcome rates on the y-axis, showing a group-level correlation.</desc>' +

      /* Axes */
      '<line x1="50" y1="20" x2="50" y2="135" stroke="currentColor" stroke-width="1.5"/>' +
      '<line x1="50" y1="135" x2="360" y2="135" stroke="currentColor" stroke-width="1.5" marker-end="url(#arr)"/>' +
      SVG.txt(200, 155, 'Group-level exposure rate (e.g., by region)', {size:9}) +
      '<text x="30" y="80" text-anchor="middle" font-size="9" fill="currentColor" transform="rotate(-90,30,80)">Group-level outcome rate</text>' +

      /* Data points */
      '<circle cx="90" cy="120" r="5" fill="var(--svg-exposed)" opacity="0.7"/>' +
      '<circle cx="120" cy="105" r="5" fill="var(--svg-exposed)" opacity="0.7"/>' +
      '<circle cx="155" cy="95" r="5" fill="var(--svg-exposed)" opacity="0.7"/>' +
      '<circle cx="200" cy="80" r="5" fill="var(--svg-exposed)" opacity="0.7"/>' +
      '<circle cx="240" cy="65" r="5" fill="var(--svg-exposed)" opacity="0.7"/>' +
      '<circle cx="280" cy="50" r="5" fill="var(--svg-exposed)" opacity="0.7"/>' +
      '<circle cx="320" cy="40" r="5" fill="var(--svg-exposed)" opacity="0.7"/>' +

      /* Regression line */
      '<line x1="70" y1="128" x2="340" y2="32" stroke="var(--svg-event)" stroke-width="1.5" opacity="0.8" stroke-dasharray="6,3"/>' +
      SVG.txt(345, 30, 'r', {size:11, fill:'var(--svg-event)', weight:'500'}) +

      /* Each point = a group */
      SVG.txt(90, 115, '🏙', {size:9}) +
      SVG.txt(200, 75, '🏙', {size:9}) +

      /* Ecological fallacy warning */
      '<rect x="50" y="8" width="300" height="16" rx="4" fill="var(--svg-event)" opacity="0.08" stroke="var(--svg-event)" stroke-width="1"/>' +
      SVG.txt(200, 20, '⚠ Ecological fallacy: group-level association ≠ individual-level association', {size:8, fill:'var(--svg-event)'}),
      165
    ),
    strengths: [
      'Very cheap — uses aggregated, publicly available data.',
      'Useful for generating hypotheses and studying contextual exposures.',
      'Can study rare exposures not measurable at the individual level.'
    ],
    limitations: [
      'Cannot infer individual-level associations (ecological fallacy).',
      'Confounded by unmeasured group-level variables.',
      'Aggregation masks within-group heterogeneity.',
      'Correlational — cannot establish causality.'
    ],
    biases: ['Ecological fallacy (Simpson\'s paradox)', 'Aggregation bias', 'Confounding by group characteristics'],
    danishPharmacoepiNotes: 'Occasionally used with Danish regional or municipal register data. The ecological fallacy is a fundamental limitation; individual-level linkage (Danish registers) is usually possible and preferred.',
    commonAnalyses: ['Ecological correlation', 'Multilevel modelling', 'Spatial regression']
  },

  /* -------------------------------------------------------
     SCCS
     ------------------------------------------------------- */
  {
    id: 'sccs',
    label: 'Self-Controlled Case Series (SCCS)',
    category: 'self-controlled',
    temporalDirection: 'Bidirectional (within-person)',
    primaryMeasure: 'Incidence Rate Ratio (risk period vs. control period)',
    svg: SVG.wrap(
      '<title>SCCS schematic</title>' +
      '<desc>A single individual\'s follow-up timeline showing an observation window subdivided into risk period (after exposure event) and control periods, with an outcome event occurring in the risk period.</desc>' +

      /* Observation window */
      '<rect x="30" y="55" width="340" height="30" rx="6" fill="currentColor" opacity="0.06" stroke="currentColor" stroke-width="1"/>' +
      SVG.txt(200, 43, 'Observation window (one individual)', {size:9, weight:'500'}) +

      /* Time axis */
      SVG.arrow(20, 110, 380, 110) +
      SVG.txt(200, 125, 'Time →', {size:9}) +

      /* Control period 1 */
      '<rect x="30" y="55" width="100" height="30" rx="6" fill="var(--svg-control)" opacity="0.15" stroke="var(--svg-control)" stroke-width="1"/>' +
      SVG.txt(80, 75, 'Control period', {size:9, fill:'var(--svg-control)'}) +

      /* Exposure event */
      '<line x1="130" y1="45" x2="130" y2="95" stroke="var(--svg-exposed)" stroke-width="2"/>' +
      '<circle cx="130" cy="70" r="4" fill="var(--svg-exposed)"/>' +
      SVG.txt(130, 36, 'Exposure', {size:9, fill:'var(--svg-exposed)'}) +

      /* Risk period */
      '<rect x="130" y="55" width="140" height="30" rx="0" fill="var(--svg-exposed)" opacity="0.15" stroke="var(--svg-exposed)" stroke-width="1"/>' +
      SVG.txt(200, 75, 'Risk period', {size:9, fill:'var(--svg-exposed)', weight:'500'}) +

      /* Outcome event in risk period */
      '<line x1="230" y1="45" x2="230" y2="95" stroke="var(--svg-event)" stroke-width="2"/>' +
      '<circle cx="230" cy="70" r="5" fill="var(--svg-event)"/>' +
      SVG.txt(230, 36, 'Outcome', {size:9, fill:'var(--svg-event)'}) +

      /* Control period 2 */
      '<rect x="270" y="55" width="100" height="30" rx="6" fill="var(--svg-control)" opacity="0.15" stroke="var(--svg-control)" stroke-width="1"/>' +
      SVG.txt(320, 75, 'Control period', {size:9, fill:'var(--svg-control)'}) +

      /* IRR annotation */
      SVG.txt(200, 145, 'IRR = (events in risk period / risk person-time) ÷ (events in control period / control person-time)', {size:8}),
      160
    ),
    strengths: [
      'Each individual serves as their own control — eliminates time-fixed confounding.',
      'Does not require matching or an external control group.',
      'Very efficient for rare exposures and outcomes in large register data.',
      'Naturally controls for age, sex, genetic factors, and stable comorbidities.'
    ],
    limitations: [
      'Requires the outcome to be acute and the event to recur (or use once-per-individual variants).',
      'Sensitive to the exposure risk period specification.',
      'Time-varying confounding (e.g., disease severity change) is not removed.',
      'Does not accommodate between-person comparisons or rare exposures without sufficient events.',
      'Assumption: event occurrence does not affect subsequent exposure probability.'
    ],
    biases: ['Time-varying confounding', 'Event-dependent exposure', 'Risk period misspecification'],
    danishPharmacoepiNotes: 'Increasingly popular in Danish register pharmacoepidemiological studies (e.g., vaccine safety, drug-induced events). The Prescription Register provides exact dispensing dates as exposure timestamps. Standard implementation via Farrington (1995) and Whitaker et al. (2006).',
    commonAnalyses: ['Conditional Poisson regression', 'SCCS R package (Whitaker)']
  },

  /* -------------------------------------------------------
     CASE-CROSSOVER
     ------------------------------------------------------- */
  {
    id: 'case-crossover',
    label: 'Case-crossover design',
    category: 'self-controlled',
    temporalDirection: 'Bidirectional (within-person)',
    primaryMeasure: 'Odds Ratio (estimates IRR)',
    svg: SVG.wrap(
      '<title>Case-crossover design schematic</title>' +
      '<desc>A single case\'s timeline showing the hazard period immediately before an event and one or more reference periods earlier in follow-up used as controls.</desc>' +

      /* Time axis */
      SVG.arrow(20, 130, 385, 130) +
      SVG.txt(205, 145, 'Time →', {size:9}) +

      /* Reference period 1 */
      '<rect x="30" y="55" width="100" height="60" rx="6" fill="var(--svg-control)" opacity="0.15" stroke="var(--svg-control)" stroke-width="1.5" stroke-dasharray="5,3"/>' +
      SVG.txt(80, 82, 'Reference', {size:9, fill:'var(--svg-control)', weight:'500'}) +
      SVG.txt(80, 95, 'period', {size:9, fill:'var(--svg-control)'}) +

      /* Reference period 2 */
      '<rect x="145" y="55" width="100" height="60" rx="6" fill="var(--svg-control)" opacity="0.15" stroke="var(--svg-control)" stroke-width="1.5" stroke-dasharray="5,3"/>' +
      SVG.txt(195, 82, 'Reference', {size:9, fill:'var(--svg-control)', weight:'500'}) +
      SVG.txt(195, 95, 'period', {size:9, fill:'var(--svg-control)'}) +

      /* Hazard period */
      '<rect x="260" y="55" width="100" height="60" rx="6" fill="var(--svg-exposed)" opacity="0.18" stroke="var(--svg-exposed)" stroke-width="2"/>' +
      SVG.txt(310, 78, 'Hazard', {size:9, fill:'var(--svg-exposed)', weight:'500'}) +
      SVG.txt(310, 91, 'period', {size:9, fill:'var(--svg-exposed)'}) +

      /* Outcome event */
      '<line x1="360" y1="45" x2="360" y2="125" stroke="var(--svg-event)" stroke-width="2.5"/>' +
      '<circle cx="360" cy="85" r="6" fill="var(--svg-event)"/>' +
      SVG.txt(360, 36, 'Event', {size:10, fill:'var(--svg-event)', weight:'500'}) +

      /* Same person label */
      SVG.txt(200, 22, 'Single case (same individual throughout)', {size:9, weight:'500'}) +
      '<line x1="30" y1="30" x2="355" y2="30" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.4"/>' +

      /* Comparison annotation */
      SVG.txt(200, 156, 'Compare exposure in hazard vs. reference periods (matched on person)', {size:8}),
      170
    ),
    strengths: [
      'Controls for all time-fixed individual characteristics (unmeasured confounders).',
      'No external control group required — uses each case as their own control.',
      'Efficient for studying transient exposures and acute outcomes.',
      'Conceptually similar to SCCS but case-focused.'
    ],
    limitations: [
      'Only applicable to transient (intermittent) exposures and acute outcomes.',
      'Cannot study chronic exposures or long-latency outcomes.',
      'Time-varying confounders still confound.',
      'Selection of reference periods requires care (must be exchangeable with hazard period).'
    ],
    biases: ['Time-varying confounding', 'Temporal trends in exposure', 'Reference period selection bias'],
    danishPharmacoepiNotes: 'Used in Danish register research for studies where the exposure (e.g., a dispensed drug) is intermittent. The Prescription Register provides exact dispensing dates. Bidirectional case-crossover (Navidi & Weinberg) is commonly implemented.',
    commonAnalyses: ['Conditional logistic regression', 'Stratified analysis by case']
  },

  /* -------------------------------------------------------
     PSSA
     ------------------------------------------------------- */
  {
    id: 'pssa',
    label: 'Prescription Sequence Symmetry Analysis (PSSA)',
    category: 'self-controlled',
    temporalDirection: 'Bidirectional (sequence-based)',
    primaryMeasure: 'Sequence Ratio (crude and adjusted)',
    svg: SVG.wrap(
      '<title>PSSA schematic</title>' +
      '<desc>Prescription sequence symmetry analysis comparing how often Drug A is dispensed before Drug B versus Drug B before Drug A, where Drug B may be prescribed to treat a side effect of Drug A.</desc>' +

      /* Drug A first */
      '<rect x="30" y="35" width="80" height="28" rx="6" fill="var(--svg-exposed)" opacity="0.2" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      SVG.txt(70, 52, 'Drug A', {size:10, fill:'var(--svg-exposed)', weight:'500'}) +
      SVG.arrow(110, 49, 175, 49, 'var(--svg-exposed)', 'url(#arr-exp)') +
      '<rect x="175" y="35" width="80" height="28" rx="6" fill="var(--svg-control)" opacity="0.2" stroke="var(--svg-control)" stroke-width="1.5"/>' +
      SVG.txt(215, 52, 'Drug B', {size:10, fill:'var(--svg-control)', weight:'500'}) +
      SVG.txt(280, 52, '→ n(A→B)', {size:9, anchor:'start', fill:'var(--svg-exposed)'}) +

      /* Drug B first */
      '<rect x="30" y="90" width="80" height="28" rx="6" fill="var(--svg-control)" opacity="0.2" stroke="var(--svg-control)" stroke-width="1.5"/>' +
      SVG.txt(70, 107, 'Drug B', {size:10, fill:'var(--svg-control)', weight:'500'}) +
      SVG.arrow(110, 104, 175, 104, 'var(--svg-control)', 'url(#arr-ctrl)') +
      '<rect x="175" y="90" width="80" height="28" rx="6" fill="var(--svg-exposed)" opacity="0.2" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      SVG.txt(215, 107, 'Drug A', {size:10, fill:'var(--svg-exposed)', weight:'500'}) +
      SVG.txt(280, 107, '→ n(B→A)', {size:9, anchor:'start', fill:'var(--svg-control)'}) +

      /* Separator */
      '<line x1="20" y1="75" x2="380" y2="75" stroke="currentColor" stroke-width="0.5" stroke-dasharray="4,4" opacity="0.4"/>' +

      /* Formula */
      '<rect x="20" y="132" width="360" height="30" rx="6" fill="currentColor" opacity="0.05" stroke="currentColor" stroke-width="0.5"/>' +
      SVG.txt(200, 142, 'Crude SR = n(A→B) / n(B→A)', {size:10, weight:'500'}) +
      SVG.txt(200, 155, 'SR > 1 suggests Drug B initiated to treat side-effect of Drug A', {size:8}),
      168
    ),
    strengths: [
      'Uses only initiators of both drugs — avoids prevalent user bias.',
      'Does not require an external control group.',
      'Adjusts for secular trends in prescribing (adjusted SR).',
      'Very efficient with large prescription databases like Danish LPDB.'
    ],
    limitations: [
      'Only detects drug-drug-indication relationships (side-effect → new drug).',
      'Cannot detect all types of adverse drug reactions.',
      'Adjusted SR requires knowledge of temporal prescribing trends.',
      'Assumption: if there is no causal relationship, sequences are symmetric.'
    ],
    biases: ['Confounding by temporal prescribing trends', 'Protopathic bias', 'Depletion of susceptibles'],
    danishPharmacoepiNotes: 'Developed specifically for pharmacoepidemiology with prescription register data. Danish LPDB (complete national prescription records) is ideal for PSSA. Used extensively in Danish studies of drug safety signals. Reference: Hallas (1996); Pratt et al. (2012).',
    commonAnalyses: ['Crude and adjusted sequence ratios', 'Binomial test']
  },

  /* -------------------------------------------------------
     ACNU
     ------------------------------------------------------- */
  {
    id: 'acnu',
    label: 'Active Comparator New-User (ACNU) design',
    category: 'observational',
    temporalDirection: 'Prospective (from first dispensing)',
    primaryMeasure: 'Hazard Ratio, Risk Ratio',
    svg: SVG.wrap(
      '<title>Active Comparator New-User design schematic</title>' +
      '<desc>Two parallel cohorts of new users: one group starting the drug of interest and another starting an active comparator drug, both followed from first dispensing.</desc>' +

      /* Eligibility phase */
      '<rect x="10" y="60" width="70" height="50" rx="6" fill="currentColor" opacity="0.06" stroke="currentColor" stroke-width="1"/>' +
      SVG.txt(45, 88, 'Eligible', {size:9, weight:'500'}) +
      SVG.txt(45, 100, 'new users', {size:8}) +

      /* Allocation arrow */
      '<line x1="80" y1="85" x2="115" y2="60" stroke="currentColor" stroke-width="1.5"/>' +
      '<line x1="80" y1="85" x2="115" y2="112" stroke="currentColor" stroke-width="1.5"/>' +

      /* Drug of interest arm */
      '<rect x="115" y="40" width="100" height="30" rx="6" fill="var(--svg-exposed)" opacity="0.2" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      SVG.txt(165, 58, 'Drug of interest', {size:9, fill:'var(--svg-exposed)', weight:'500'}) +
      '<rect x="115" y="40" width="12" height="30" rx="6" fill="var(--svg-exposed)" opacity="0.7"/>' +
      SVG.txt(122, 58, '▸', {size:8, fill:'var(--bg)'}) +
      SVG.arrow(215, 55, 290, 55, 'var(--svg-exposed)', 'url(#arr-exp)') +
      SVG.box(290, 38, 55, 34, 'Outcome', 'var(--svg-event)') +

      /* Active comparator arm */
      '<rect x="115" y="95" width="100" height="30" rx="6" fill="var(--svg-control)" opacity="0.2" stroke="var(--svg-control)" stroke-width="1.5"/>' +
      SVG.txt(165, 113, 'Active comparator', {size:9, fill:'var(--svg-control)', weight:'500'}) +
      '<rect x="115" y="95" width="12" height="30" rx="6" fill="var(--svg-control)" opacity="0.7"/>' +
      SVG.txt(122, 113, '▸', {size:8, fill:'var(--bg)'}) +
      SVG.arrow(215, 110, 290, 110, 'var(--svg-control)', 'url(#arr-ctrl)') +
      SVG.box(290, 93, 55, 34, 'Outcome', 'var(--svg-event)') +

      /* New-user entry labels */
      SVG.txt(165, 35, '1st dispensing = time zero', {size:8, fill:'var(--text-muted)'}) +
      SVG.txt(165, 147, '1st dispensing = time zero', {size:8, fill:'var(--text-muted)'}) +

      /* Key note */
      '<rect x="10" y="148" width="380" height="16" rx="4" fill="var(--svg-exposed)" opacity="0.06"/>' +
      SVG.txt(200, 159, 'Active comparator controls for confounding by indication; new-user avoids prevalent user bias', {size:8}),
      170
    ),
    strengths: [
      'Active comparator controls for confounding by indication and unmeasured severity.',
      'New-user design avoids immortal time bias and prevalent user bias.',
      'Both arms start at first dispensing — direct causal comparison.',
      'Closely emulates a randomised design (closest to an RCT among observational approaches).'
    ],
    limitations: [
      'Requires sufficient new users of both drugs — may limit sample size.',
      'Active comparator must be genuinely comparable (same indication).',
      'Cannot study drugs without a reasonable active comparator.',
      'Residual confounding by unmeasured severity differences between groups.'
    ],
    biases: ['Residual confounding by indication', 'Channelling bias', 'Depletion of susceptibles in comparator arm'],
    danishPharmacoepiNotes: 'The recommended design for pharmacoepidemiology studies of drug effects in Denmark. New-user cohorts are defined from the LPDB (first dispensing ever, or after a washout period). ATC-coded drugs facilitate active comparator selection. Reference: Johnson et al. (2013); Lund et al. (2015).',
    commonAnalyses: ['Cox proportional hazards', 'Propensity score matching / IPTW', 'High-dimensional propensity score (hdPS)']
  },

  /* -------------------------------------------------------
     TARGET TRIAL EMULATION
     ------------------------------------------------------- */
  {
    id: 'target-trial',
    label: 'Target trial emulation',
    category: 'observational',
    temporalDirection: 'Prospective (from eligibility)',
    primaryMeasure: 'Hazard Ratio, Risk Ratio (per-protocol or ITT estimand)',
    svg: SVG.wrap(
      '<title>Target trial emulation schematic</title>' +
      '<desc>Two-panel diagram: left shows the protocol of a hypothetical target trial; right shows how each component is emulated using observational data.</desc>' +

      /* Left panel: Target trial */
      '<rect x="10" y="15" width="175" height="145" rx="8" fill="currentColor" opacity="0.04" stroke="currentColor" stroke-width="1"/>' +
      SVG.txt(97, 28, 'Target trial', {size:10, weight:'500'}) +

      SVG.box(20, 36, 155, 20, 'Eligibility criteria', 'var(--svg-exposed)') +
      SVG.box(20, 62, 155, 20, 'Treatment strategies', 'var(--svg-exposed)') +
      SVG.box(20, 88, 155, 20, 'Assignment mechanism', 'var(--svg-exposed)') +
      SVG.box(20, 114, 155, 20, 'Outcome definition', 'var(--svg-exposed)') +
      SVG.box(20, 140, 155, 12, 'Follow-up / analysis', 'var(--svg-exposed)') +

      /* Connecting arrows */
      SVG.arrow(185, 46, 215, 46) +
      SVG.arrow(185, 72, 215, 72) +
      SVG.arrow(185, 98, 215, 98) +
      SVG.arrow(185, 124, 215, 124) +
      SVG.arrow(185, 146, 215, 146) +

      /* Right panel: Observational emulation */
      '<rect x="215" y="15" width="175" height="145" rx="8" fill="var(--svg-control)" opacity="0.06" stroke="var(--svg-control)" stroke-width="1"/>' +
      SVG.txt(302, 28, 'Observational emulation', {size:9, weight:'500'}) +

      SVG.box(225, 36, 155, 20, 'Register inclusion/exclusion', 'var(--svg-control)') +
      SVG.box(225, 62, 155, 20, 'Drug initiator groups', 'var(--svg-control)') +
      SVG.box(225, 88, 155, 20, 'Clone-censor-weight / g-comp', 'var(--svg-control)') +
      SVG.box(225, 114, 155, 20, 'Register outcome algorithm', 'var(--svg-control)') +
      SVG.box(225, 140, 155, 12, 'Per-protocol estimand / ITT', 'var(--svg-control)'),
      165
    ),
    strengths: [
      'Explicit mapping of trial protocol to observational analysis reduces design ambiguity.',
      'Clearly defines the causal estimand (per-protocol or ITT equivalent).',
      'Avoids ad-hoc analytical choices by pre-specifying the target trial.',
      'Can emulate trials infeasible to run (rare outcomes, long follow-up, large populations).'
    ],
    limitations: [
      'Relies on correct specification of the target trial protocol.',
      'Unmeasured confounding remains a fundamental limitation.',
      'Technical complexity: requires g-computation, IPTW, or cloning methods for per-protocol.',
      'Multiple sequential trials (Hernán/Robins approach) requires careful implementation.'
    ],
    biases: ['Confounding by indication', 'Informative censoring (non-adherence)', 'Residual confounding'],
    danishPharmacoepiNotes: 'Explicitly recommended for Danish register studies of drug effectiveness. Reference: Hernán & Robins (2016); Dickerman et al. (2019). The comprehensive nature of Danish registers (prescriptions, hospital records, comorbidities) makes emulation more feasible than in countries with incomplete data.',
    commonAnalyses: ['Inverse probability weighting', 'g-computation', 'Cloning / censoring / weighting', 'Pooled logistic regression']
  },

  /* -------------------------------------------------------
     INSTRUMENTAL VARIABLE
     ------------------------------------------------------- */
  {
    id: 'iv',
    label: 'Instrumental variable (IV) design',
    category: 'quasi-experimental',
    temporalDirection: 'Causal inference framework (typically prospective)',
    primaryMeasure: 'Local Average Treatment Effect (LATE) / Complier Average Causal Effect (CACE)',
    svg: SVG.wrap(
      '<title>Instrumental variable DAG</title>' +
      '<desc>Directed acyclic graph showing an instrument Z affecting exposure X, X affecting outcome Y, and unmeasured confounders U affecting both X and Y. The exclusion restriction is shown by the absence of a direct Z-to-Y path.</desc>' +

      /* Nodes */
      SVG.node(70,  90, 28, 'Z', 'var(--svg-period)') +
      SVG.node(200, 90, 28, 'X', 'var(--svg-exposed)') +
      SVG.node(330, 90, 28, 'Y', 'var(--svg-event)') +
      SVG.node(200, 25, 22, 'U', 'currentColor') +

      /* Arrows */
      SVG.arrow(98, 90, 168, 90, 'var(--svg-period)', 'url(#arr)') +
      SVG.arrow(228, 90, 298, 90, 'var(--svg-exposed)', 'url(#arr-exp)') +

      /* U to X and Y (confounding) */
      '<line x1="185" y1="45" x2="115" y2="75" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.6" marker-end="url(#arr)"/>' +
      '<line x1="215" y1="45" x2="285" y2="75" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.6" marker-end="url(#arr)"/>' +

      /* Labels */
      SVG.txt(70,  130, 'Instrument', {size:9, fill:'var(--svg-period)', weight:'500'}) +
      SVG.txt(70,  142, '(e.g., prescriber\npref.)', {size:8, fill:'var(--svg-period)'}) +
      SVG.txt(200, 130, 'Exposure', {size:9, fill:'var(--svg-exposed)', weight:'500'}) +
      SVG.txt(330, 130, 'Outcome', {size:9, fill:'var(--svg-event)', weight:'500'}) +
      SVG.txt(200, 14,  'Unmeasured', {size:9}) +
      SVG.txt(200, 7,   'confounders (U)', {size:8}) +

      /* IV assumptions list */
      '<rect x="10" y="148" width="380" height="22" rx="4" fill="var(--svg-period)" opacity="0.07"/>' +
      SVG.txt(200, 157, 'IV assumptions: (1) Z→X (relevance)  (2) Z⊥U (independence)  (3) Z→Y only via X (exclusion restriction)', {size:7.5}),
      175
    ),
    strengths: [
      'Can identify causal effects in the presence of unmeasured confounding — rare in observational designs.',
      'Valid if three IV assumptions hold (relevance, independence, exclusion restriction).',
      'Danish prescriber preference or regional variation provide plausible instruments.'
    ],
    limitations: [
      'Exclusion restriction is untestable and often implausible.',
      'Weak instruments produce biased estimates (F-statistic < 10 is a common threshold).',
      'Estimates LATE, not ATE — effect applies only to compliers, limiting generalisability.',
      'Two-stage least squares (2SLS) and related methods require careful implementation.'
    ],
    biases: ['Weak instrument bias', 'Violation of exclusion restriction', 'Monotonicity assumption failure'],
    danishPharmacoepiNotes: 'Prescriber preference (propensity to prescribe drug A vs B) is the most common IV in Danish pharmacoepidemiology. Regional variation in prescription rates has also been used. Reference: Brookhart et al. (2006). The CPR register links patients to their GP and prescriber.',
    commonAnalyses: ['Two-stage least squares (2SLS)', 'Two-stage residual inclusion (2SRI)', 'Mendelian randomisation (genetic IV)']
  },

  /* -------------------------------------------------------
     DIFFERENCE-IN-DIFFERENCES / ITS
     ------------------------------------------------------- */
  {
    id: 'did-its',
    label: 'Difference-in-differences / Interrupted time series',
    category: 'quasi-experimental',
    temporalDirection: 'Prospective (pre-post intervention)',
    primaryMeasure: 'Difference-in-differences estimate; Level and slope changes (ITS)',
    svg: SVG.wrap(
      '<title>Difference-in-differences and interrupted time series schematic</title>' +
      '<desc>Two time series: a treated group (solid line) and control group (dashed line) before and after an intervention time point. The DiD estimate is the difference in outcome changes between groups.</desc>' +

      /* Axes */
      '<line x1="45" y1="20" x2="45" y2="145" stroke="currentColor" stroke-width="1.5"/>' +
      '<line x1="45" y1="145" x2="385" y2="145" stroke="currentColor" stroke-width="1.5" marker-end="url(#arr)"/>' +
      SVG.txt(215, 158, 'Time →', {size:9}) +
      '<text x="28" y="85" text-anchor="middle" font-size="9" fill="currentColor" transform="rotate(-90,28,85)">Outcome rate</text>' +

      /* Intervention line */
      '<line x1="200" y1="18" x2="200" y2="148" stroke="var(--svg-event)" stroke-width="1.5" stroke-dasharray="5,3"/>' +
      SVG.txt(200, 12, 'Intervention', {size:9, fill:'var(--svg-event)', weight:'500'}) +

      /* Treated group: pre-slope downward (improving), post-intervention drops more */
      '<polyline points="55,110 200,90 200,60 370,45" stroke="var(--svg-exposed)" stroke-width="2" fill="none"/>' +
      SVG.txt(372, 45, 'Treated', {size:9, fill:'var(--svg-exposed)', anchor:'start', weight:'500'}) +

      /* Control group: pre similar slope, post continues same slope */
      '<polyline points="55,115 200,95 200,95 370,80" stroke="var(--svg-control)" stroke-width="2" fill="none" stroke-dasharray="7,4"/>' +
      SVG.txt(372, 80, 'Control', {size:9, fill:'var(--svg-control)', anchor:'start', weight:'500'}) +

      /* Counterfactual for treated */
      '<polyline points="200,90 370,75" stroke="var(--svg-exposed)" stroke-width="1.5" fill="none" stroke-dasharray="3,3" opacity="0.5"/>' +
      SVG.txt(300, 58, 'Counterfactual', {size:8, fill:'var(--svg-exposed)'}) +

      /* DiD brace */
      '<line x1="370" y1="45" x2="370" y2="75" stroke="currentColor" stroke-width="1" opacity="0.6"/>' +
      SVG.txt(390, 60, 'DiD', {size:9, weight:'500', anchor:'start'}) +

      /* ITS note */
      SVG.txt(215, 130, 'ITS (single group): level shift + slope change after intervention', {size:8, fill:'currentColor'}) +
      SVG.txt(215, 142, 'DiD: parallel trends assumption required', {size:8, fill:'currentColor'}),
      170
    ),
    strengths: [
      'Controls for time-stable confounders (DiD) and unmeasured time trends (ITS).',
      'Useful for policy interventions where randomisation is not possible.',
      'Interrupted time series can detect both level and slope changes.',
      'DiD parallel trends assumption is testable in pre-intervention period.'
    ],
    limitations: [
      'DiD requires parallel trends assumption — violation leads to biased estimates.',
      'Cannot control for time-varying confounders that differ between groups.',
      'ITS requires adequate pre-intervention data and no concurrent changes.',
      'Spillover effects (SUTVA violations) can bias DiD estimates.'
    ],
    biases: ['Parallel trends violation', 'Contemporaneous events', 'Regression to the mean', 'Contamination'],
    danishPharmacoepiNotes: 'Applied in Danish register studies to evaluate drug policies, reimbursement changes, and clinical guideline updates. Register data provide long pre/post time series at the population level. Reference: Kontopantelis et al. (2015); Dimick & Ryan (2014).',
    commonAnalyses: ['Segmented regression (ITS)', 'Fixed-effects DiD', 'Synthetic control', 'Event study (staggered DiD)']
  }

];
