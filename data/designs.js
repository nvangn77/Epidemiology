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
      '<title>RCT swimmer plot</title>' +
      '<desc>Swimmer plot with randomisation diamond, treatment and control arms each showing 5 participant timelines with events and censoring.</desc>' +

      /* Title */
      SVG.txt(200, 11, 'RCT — Participant timelines by arm', {size:9, weight:'500'}) +

      /* Population → randomisation */
      SVG.box(8, 72, 52, 34, 'Population', 'currentColor') +
      SVG.arrow(60, 89, 80, 89) +
      /* Randomisation diamond */
      '<polygon points="96,78 116,89 96,100 76,89" fill="var(--svg-period)" opacity="0.18" stroke="var(--svg-period)" stroke-width="1.5"/>' +
      SVG.txt(96, 89, 'R', {size:9, fill:'var(--svg-period)', weight:'700'}) +

      /* Branch lines */
      '<line x1="116" y1="89" x2="130" y2="55" stroke="currentColor" stroke-width="1.2" opacity="0.7"/>' +
      '<line x1="116" y1="89" x2="130" y2="123" stroke="currentColor" stroke-width="1.2" opacity="0.7"/>' +

      /* ---- Treatment arm label ---- */
      SVG.txt(133, 24, 'Treatment arm', {size:8, fill:'var(--svg-exposed)', anchor:'start', weight:'500'}) +

      /* Treatment swimmers y=30,39,48,57,66 — 5 people, 1 event */
      /* P1: bar 133→290 (2.6y), censored */
      '<rect x="133" y="27" width="157" height="7" rx="2" fill="var(--svg-exposed)" opacity="0.35" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<line x1="290" y1="24" x2="290" y2="37" stroke="currentColor" stroke-width="1.5"/><line x1="287" y1="24" x2="293" y2="24" stroke="currentColor" stroke-width="1.5"/>' +
      /* P2: bar 133→340 (3.5y), censored */
      '<rect x="133" y="36" width="207" height="7" rx="2" fill="var(--svg-exposed)" opacity="0.35" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<line x1="340" y1="33" x2="340" y2="46" stroke="currentColor" stroke-width="1.5"/><line x1="337" y1="33" x2="343" y2="33" stroke="currentColor" stroke-width="1.5"/>' +
      /* P3: bar 133→220 (1.5y), EVENT */
      '<rect x="133" y="45" width="87" height="7" rx="2" fill="var(--svg-exposed)" opacity="0.35" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<circle cx="220" cy="49" r="4" fill="var(--svg-event)" opacity="0.9"/>' +
      /* P4: bar 133→370 (4.0y), censored */
      '<rect x="133" y="54" width="237" height="7" rx="2" fill="var(--svg-exposed)" opacity="0.35" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<line x1="370" y1="51" x2="370" y2="64" stroke="currentColor" stroke-width="1.5"/><line x1="367" y1="51" x2="373" y2="51" stroke="currentColor" stroke-width="1.5"/>' +
      /* P5: bar 133→310 (3.0y), censored */
      '<rect x="133" y="63" width="177" height="7" rx="2" fill="var(--svg-exposed)" opacity="0.35" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<line x1="310" y1="60" x2="310" y2="73" stroke="currentColor" stroke-width="1.5"/><line x1="307" y1="60" x2="313" y2="60" stroke="currentColor" stroke-width="1.5"/>' +

      /* ---- Control arm label ---- */
      SVG.txt(133, 96, 'Control arm', {size:8, fill:'var(--svg-control)', anchor:'start', weight:'500'}) +

      /* Control swimmers — 3 events out of 5 */
      /* C1: bar 133→175 (0.7y), EVENT */
      '<rect x="133" y="99" width="42" height="7" rx="2" fill="var(--svg-control)" opacity="0.35" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<circle cx="175" cy="103" r="4" fill="var(--svg-event)" opacity="0.9"/>' +
      /* C2: bar 133→280 (2.5y), EVENT */
      '<rect x="133" y="108" width="147" height="7" rx="2" fill="var(--svg-control)" opacity="0.35" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<circle cx="280" cy="112" r="4" fill="var(--svg-event)" opacity="0.9"/>' +
      /* C3: bar 133→360 (3.8y), censored */
      '<rect x="133" y="117" width="227" height="7" rx="2" fill="var(--svg-control)" opacity="0.35" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<line x1="360" y1="114" x2="360" y2="127" stroke="currentColor" stroke-width="1.5"/><line x1="357" y1="114" x2="363" y2="114" stroke="currentColor" stroke-width="1.5"/>' +
      /* C4: bar 133→240 (1.8y), EVENT */
      '<rect x="133" y="126" width="107" height="7" rx="2" fill="var(--svg-control)" opacity="0.35" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<circle cx="240" cy="130" r="4" fill="var(--svg-event)" opacity="0.9"/>' +
      /* C5: bar 133→320 (3.1y), censored */
      '<rect x="133" y="135" width="187" height="7" rx="2" fill="var(--svg-control)" opacity="0.35" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<line x1="320" y1="132" x2="320" y2="145" stroke="currentColor" stroke-width="1.5"/><line x1="317" y1="132" x2="323" y2="132" stroke="currentColor" stroke-width="1.5"/>' +

      /* Randomisation dashed line */
      '<line x1="133" y1="16" x2="133" y2="148" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.4"/>' +
      SVG.txt(133, 14, 'Randomisation', {size:7, anchor:'middle'}) +

      /* Time axis */
      SVG.timeAxis(133, 385, 150) +
      SVG.txt(133, 160, '0', {size:7}) +
      SVG.txt(193, 160, '1y', {size:7}) +
      SVG.txt(253, 160, '2y', {size:7}) +
      SVG.txt(313, 160, '3y', {size:7}) +
      SVG.txt(373, 160, '4y', {size:7}) +

      /* Outcome summary labels */
      SVG.txt(252, 79, '1/5 events', {size:8, fill:'var(--svg-exposed)', anchor:'middle'}) +
      SVG.txt(252, 150, '3/5 events', {size:8, fill:'var(--svg-control)', anchor:'middle'}) +

      /* Legend */
      '<rect x="8" y="170" width="10" height="5" rx="1" fill="var(--svg-exposed)" opacity="0.5"/>' +
      SVG.txt(21, 175, 'Treatment', {size:8, anchor:'start'}) +
      '<rect x="80" y="170" width="10" height="5" rx="1" fill="var(--svg-control)" opacity="0.5"/>' +
      SVG.txt(93, 175, 'Control', {size:8, anchor:'start'}) +
      '<circle cx="146" cy="172" r="4" fill="var(--svg-event)" opacity="0.9"/>' +
      SVG.txt(153, 175, 'Event', {size:8, anchor:'start'}) +
      '<line x1="200" y1="168" x2="200" y2="178" stroke="currentColor" stroke-width="1.5"/><line x1="197" y1="168" x2="203" y2="168" stroke="currentColor" stroke-width="1.5"/>' +
      SVG.txt(208, 175, 'Censored', {size:8, anchor:'start'}),
      185
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
      '<title>Cohort study swimmer plot</title>' +
      '<desc>Swimmer plot showing 3 exposed and 3 unexposed participants followed from cohort entry, with events and censoring on a time axis.</desc>' +

      SVG.txt(200, 10, 'Cohort study — individual follow-up timelines', {size:9, weight:'500'}) +

      /* Group labels */
      SVG.txt(60, 30, 'Exposed', {size:9, fill:'var(--svg-exposed)', anchor:'end', weight:'500'}) +
      SVG.txt(60, 112, 'Unexposed', {size:9, fill:'var(--svg-control)', anchor:'end', weight:'500'}) +

      /* Cohort entry dashed line */
      '<line x1="65" y1="15" x2="65" y2="148" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.4"/>' +
      SVG.txt(65, 12, 'Entry', {size:7}) +

      /* ---- Exposed participants ---- */
      /* E1: y=38, bar 65→305 (4.0y), event */
      '<rect x="65" y="34" width="240" height="8" rx="2" fill="var(--svg-exposed)" opacity="0.4" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<circle cx="305" cy="38" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +
      /* E2: y=56, bar 65→215 (2.5y), censored */
      '<rect x="65" y="52" width="150" height="8" rx="2" fill="var(--svg-exposed)" opacity="0.4" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<line x1="215" y1="49" x2="215" y2="63" stroke="currentColor" stroke-width="1.8"/><line x1="211" y1="49" x2="219" y2="49" stroke="currentColor" stroke-width="1.8"/>' +
      /* E3: y=74, bar 65→353 (4.8y), event */
      '<rect x="65" y="70" width="288" height="8" rx="2" fill="var(--svg-exposed)" opacity="0.4" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<circle cx="353" cy="74" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +

      /* Separator line */
      '<line x1="55" y1="90" x2="390" y2="90" stroke="currentColor" stroke-width="0.5" stroke-dasharray="4,4" opacity="0.4"/>' +

      /* ---- Unexposed participants ---- */
      /* U1: y=100, bar 65→365 (5.0y), censored */
      '<rect x="65" y="96" width="300" height="8" rx="2" fill="var(--svg-control)" opacity="0.4" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<line x1="365" y1="93" x2="365" y2="107" stroke="currentColor" stroke-width="1.8"/><line x1="361" y1="93" x2="369" y2="93" stroke="currentColor" stroke-width="1.8"/>' +
      /* U2: y=118, bar 65→173 (1.8y), censored */
      '<rect x="65" y="114" width="108" height="8" rx="2" fill="var(--svg-control)" opacity="0.4" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<line x1="173" y1="111" x2="173" y2="125" stroke="currentColor" stroke-width="1.8"/><line x1="169" y1="111" x2="177" y2="111" stroke="currentColor" stroke-width="1.8"/>' +
      /* U3: y=136, bar 65→323 (4.3y), event */
      '<rect x="65" y="132" width="258" height="8" rx="2" fill="var(--svg-control)" opacity="0.4" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<circle cx="323" cy="136" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +

      /* Time axis at y=153 */
      SVG.timeAxis(65, 390, 153) +
      SVG.txt(65, 163, '0', {size:8}) +
      SVG.txt(125, 163, '1y', {size:8}) +
      SVG.txt(185, 163, '2y', {size:8}) +
      SVG.txt(245, 163, '3y', {size:8}) +
      SVG.txt(305, 163, '4y', {size:8}) +
      SVG.txt(365, 163, '5y', {size:8}) +

      /* Legend */
      '<circle cx="10" cy="173" r="4" fill="var(--svg-event)" opacity="0.9"/>' +
      SVG.txt(17, 176, 'Event', {size:8, anchor:'start'}) +
      '<line x1="60" y1="170" x2="60" y2="178" stroke="currentColor" stroke-width="1.5"/><line x1="57" y1="170" x2="63" y2="170" stroke="currentColor" stroke-width="1.5"/>' +
      SVG.txt(66, 176, 'Censored', {size:8, anchor:'start'}) +
      '<rect x="120" y="170" width="14" height="6" rx="1" fill="var(--svg-exposed)" opacity="0.5"/>' +
      SVG.txt(137, 176, 'Exposed', {size:8, anchor:'start'}) +
      '<rect x="185" y="170" width="14" height="6" rx="1" fill="var(--svg-control)" opacity="0.5"/>' +
      SVG.txt(202, 176, 'Unexposed', {size:8, anchor:'start'}),
      180
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
  },


  /* -------------------------------------------------------
     PRAGMATIC CLINICAL TRIAL
     ------------------------------------------------------- */
  {
    id: 'pct',
    label: 'Pragmatic Clinical Trial (PCT)',
    category: 'experimental',
    temporalDirection: 'Prospective',
    primaryMeasure: 'Risk Ratio, Hazard Ratio (effectiveness in real-world conditions)',
    svg: SVG.wrap(
      '<title>Pragmatic Clinical Trial schematic</title>' +
      '<desc>Broad eligibility funnel feeding into randomisation, with real-world clinical setting depicted. Minimal exclusions contrast with explanatory RCT.</desc>' +

      SVG.txt(200, 14, 'Broad eligibility — "real-world" patients', {size:9, weight:'500'}) +

      /* Wide population funnel */
      '<polygon points="30,22 370,22 310,55 90,55" fill="currentColor" opacity="0.07" stroke="currentColor" stroke-width="1"/>' +
      SVG.txt(200, 41, 'Routine clinical population (few exclusions)', {size:9}) +

      SVG.arrow(200, 55, 200, 72) +
      SVG.box(140, 72, 120, 26, 'Randomisation', 'currentColor') +

      '<line x1="140" y1="85" x2="95" y2="105" stroke="currentColor" stroke-width="1.5"/>' +
      '<line x1="260" y1="85" x2="305" y2="105" stroke="currentColor" stroke-width="1.5"/>' +

      SVG.box(40, 105, 110, 26, 'Intervention A', 'var(--svg-exposed)') +
      SVG.box(250, 105, 110, 26, 'Intervention B', 'var(--svg-control)') +

      SVG.arrow(95, 131, 95, 150, 'var(--svg-exposed)', 'url(#arr-exp)') +
      SVG.arrow(305, 131, 305, 150, 'var(--svg-control)', 'url(#arr-ctrl)') +

      SVG.box(40, 150, 110, 22, 'Routine outcome', 'var(--svg-event)') +
      SVG.box(250, 150, 110, 22, 'Routine outcome', 'var(--svg-event)') +

      '<rect x="10" y="175" width="380" height="14" rx="4" fill="var(--svg-exposed)" opacity="0.06"/>' +
      SVG.txt(200, 185, 'Flexible protocols · routine care delivery · high external validity', {size:8}),
      192
    ),
    strengths: [
      'High external validity — results apply to everyday clinical populations.',
      'Flexible interventions mirror how treatments are used in practice.',
      'Typically larger and longer than explanatory RCTs.',
      'Generates effectiveness (not just efficacy) evidence for policy decisions.'
    ],
    limitations: [
      'Less internal validity than explanatory RCT due to protocol flexibility.',
      'Non-adherence and contamination are harder to control.',
      'Larger samples needed to detect effects diluted by heterogeneous populations.',
      'Harder to understand mechanism of action.'
    ],
    biases: ['Non-adherence dilution', 'Contamination', 'Attrition bias', 'Performance bias'],
    danishPharmacoepiNotes: 'PCT results are highly relevant to Danish healthcare given the universal-access setting. Danish register linkage (CPR + LPR) can provide pragmatic outcome ascertainment without separate data collection, enabling registry-embedded pragmatic trials.',
    commonAnalyses: ['Intention-to-treat analysis', 'Per-protocol analysis with IPTW', 'Cox proportional hazards', 'Multilevel models (cluster adjustment)']
  },

  /* -------------------------------------------------------
     CLUSTER-RANDOMISED TRIAL
     ------------------------------------------------------- */
  {
    id: 'crt',
    label: 'Cluster-Randomised Trial (CRT)',
    category: 'experimental',
    temporalDirection: 'Prospective',
    primaryMeasure: 'Risk Ratio, Rate Ratio (adjusted for clustering)',
    svg: SVG.wrap(
      '<title>Cluster-Randomised Trial schematic</title>' +
      '<desc>Clusters (hospitals, GP practices) randomised to intervention or control; individuals within clusters share the same assignment.</desc>' +

      SVG.txt(200, 13, 'Clusters randomised (not individuals)', {size:9, weight:'500'}) +

      /* Intervention clusters */
      SVG.txt(100, 28, 'Intervention clusters', {size:9, fill:'var(--svg-exposed)', weight:'500'}) +
      '<rect x="20"  y="35" width="70" height="50" rx="8" fill="var(--svg-exposed)" opacity="0.15" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      '<circle cx="35" cy="50" r="4" fill="var(--svg-exposed)" opacity="0.6"/>' +
      '<circle cx="55" cy="55" r="4" fill="var(--svg-exposed)" opacity="0.6"/>' +
      '<circle cx="45" cy="70" r="4" fill="var(--svg-exposed)" opacity="0.6"/>' +
      SVG.txt(55, 95, 'GP/hospital', {size:8, fill:'var(--svg-exposed)'}) +

      '<rect x="110" y="35" width="70" height="50" rx="8" fill="var(--svg-exposed)" opacity="0.15" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      '<circle cx="125" cy="50" r="4" fill="var(--svg-exposed)" opacity="0.6"/>' +
      '<circle cx="145" cy="60" r="4" fill="var(--svg-exposed)" opacity="0.6"/>' +
      '<circle cx="135" cy="75" r="4" fill="var(--svg-exposed)" opacity="0.6"/>' +

      /* Control clusters */
      SVG.txt(295, 28, 'Control clusters', {size:9, fill:'var(--svg-control)', weight:'500'}) +
      '<rect x="215" y="35" width="70" height="50" rx="8" fill="var(--svg-control)" opacity="0.15" stroke="var(--svg-control)" stroke-width="1.5"/>' +
      '<circle cx="230" cy="50" r="4" fill="var(--svg-control)" opacity="0.6"/>' +
      '<circle cx="250" cy="62" r="4" fill="var(--svg-control)" opacity="0.6"/>' +
      '<circle cx="240" cy="75" r="4" fill="var(--svg-control)" opacity="0.6"/>' +

      '<rect x="305" y="35" width="70" height="50" rx="8" fill="var(--svg-control)" opacity="0.15" stroke="var(--svg-control)" stroke-width="1.5"/>' +
      '<circle cx="320" cy="48" r="4" fill="var(--svg-control)" opacity="0.6"/>' +
      '<circle cx="340" cy="58" r="4" fill="var(--svg-control)" opacity="0.6"/>' +
      '<circle cx="330" cy="72" r="4" fill="var(--svg-control)" opacity="0.6"/>' +

      SVG.arrow(100, 95, 100, 115, 'var(--svg-exposed)', 'url(#arr-exp)') +
      SVG.arrow(305, 95, 305, 115, 'var(--svg-control)', 'url(#arr-ctrl)') +

      SVG.box(40, 115, 120, 24, 'Outcome (aggregated)', 'var(--svg-event)') +
      SVG.box(245, 115, 120, 24, 'Outcome (aggregated)', 'var(--svg-event)') +

      '<rect x="10" y="148" width="380" height="24" rx="4" fill="currentColor" opacity="0.04"/>' +
      SVG.txt(200, 158, 'ICC (intra-cluster correlation) inflates variance → design effect', {size:8}) +
      SVG.txt(200, 170, 'Required n = simple RCT n × design effect = 1 + (m−1)×ICC', {size:8}),
      182
    ),
    strengths: [
      'Appropriate when the intervention must be applied at the group level (e.g., educational intervention for clinicians).',
      'Prevents contamination between arms when clusters are geographically separate.',
      'Can evaluate system-level or policy interventions.'
    ],
    limitations: [
      'Requires more participants than individual RCT due to intra-cluster correlation (design effect).',
      'Fewer randomisation units (clusters) — risk of imbalance even with randomisation.',
      'Analysis must account for clustering (mixed models or GEE); ignoring it inflates type I error.',
      'Randomisation of clusters, not individuals, may introduce cluster-level confounding.'
    ],
    biases: ['Cluster imbalance', 'Contamination within clusters', 'ICC misestimation', 'Recruitment bias post-randomisation'],
    danishPharmacoepiNotes: 'Used in Danish quality improvement and guideline implementation trials where GP practices or hospital departments are the unit of randomisation. Danish registers enable passive outcome follow-up without participant burden.',
    commonAnalyses: ['Mixed-effects models (LMM/GLMM)', 'GEE with cluster-robust SE', 'Hierarchical models']
  },

  /* -------------------------------------------------------
     N-OF-1 TRIAL
     ------------------------------------------------------- */
  {
    id: 'n-of-1',
    label: 'N-of-1 Trial',
    category: 'experimental',
    temporalDirection: 'Prospective (crossover within one individual)',
    primaryMeasure: 'Individual treatment effect (within-person difference)',
    svg: SVG.wrap(
      '<title>N-of-1 trial schematic</title>' +
      '<desc>Single patient timeline with alternating treatment A and treatment B periods separated by washout windows. Outcome measured in each period.</desc>' +

      SVG.txt(200, 12, 'Single patient — multiple crossover periods', {size:9, weight:'500'}) +

      SVG.arrow(20, 90, 385, 90) +
      SVG.txt(200, 105, 'Time →', {size:9}) +

      /* Period 1: A */
      '<rect x="25" y="35" width="70" height="44" rx="6" fill="var(--svg-exposed)" opacity="0.2" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      SVG.txt(60, 60, 'A', {size:16, fill:'var(--svg-exposed)', weight:'700'}) +

      /* Washout 1 */
      '<rect x="95" y="45" width="30" height="24" rx="4" fill="currentColor" opacity="0.06" stroke="currentColor" stroke-width="1" stroke-dasharray="3,2"/>' +
      SVG.txt(110, 60, 'W', {size:9}) +

      /* Period 2: B */
      '<rect x="125" y="35" width="70" height="44" rx="6" fill="var(--svg-control)" opacity="0.2" stroke="var(--svg-control)" stroke-width="1.5"/>' +
      SVG.txt(160, 60, 'B', {size:16, fill:'var(--svg-control)', weight:'700'}) +

      /* Washout 2 */
      '<rect x="195" y="45" width="30" height="24" rx="4" fill="currentColor" opacity="0.06" stroke="currentColor" stroke-width="1" stroke-dasharray="3,2"/>' +
      SVG.txt(210, 60, 'W', {size:9}) +

      /* Period 3: A */
      '<rect x="225" y="35" width="70" height="44" rx="6" fill="var(--svg-exposed)" opacity="0.2" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      SVG.txt(260, 60, 'A', {size:16, fill:'var(--svg-exposed)', weight:'700'}) +

      /* Washout 3 */
      '<rect x="295" y="45" width="30" height="24" rx="4" fill="currentColor" opacity="0.06" stroke="currentColor" stroke-width="1" stroke-dasharray="3,2"/>' +
      SVG.txt(310, 60, 'W', {size:9}) +

      /* Period 4: B */
      '<rect x="325" y="35" width="60" height="44" rx="6" fill="var(--svg-control)" opacity="0.2" stroke="var(--svg-control)" stroke-width="1.5"/>' +
      SVG.txt(355, 60, 'B', {size:16, fill:'var(--svg-control)', weight:'700'}) +

      /* Outcome markers */
      '<circle cx="60"  cy="82" r="4" fill="var(--svg-event)" opacity="0.8"/>' +
      '<circle cx="160" cy="82" r="4" fill="var(--svg-event)" opacity="0.8"/>' +
      '<circle cx="260" cy="82" r="4" fill="var(--svg-event)" opacity="0.8"/>' +
      '<circle cx="355" cy="82" r="4" fill="var(--svg-event)" opacity="0.8"/>' +

      '<rect x="10" y="112" width="380" height="14" rx="4" fill="var(--svg-exposed)" opacity="0.06"/>' +
      SVG.txt(200, 122, 'Carryover assumption: washout eliminates prior treatment effect', {size:8}),
      135
    ),
    strengths: [
      'Directly estimates the treatment effect for the individual patient — personalised medicine.',
      'Eliminates between-person confounding entirely.',
      'Optimal when treatments have rapid onset and offset (washout feasible).',
      'Can be aggregated across patients to give a population estimate.'
    ],
    limitations: [
      'Not applicable to treatments with permanent or long-lasting effects.',
      'Requires stable underlying condition (no natural disease course changes).',
      'Carryover effects may persist despite washout — violates key assumption.',
      'Operationally complex; patient burden is high.'
    ],
    biases: ['Carryover bias', 'Period effects (learning, fatigue)', 'Disease progression confounding'],
    danishPharmacoepiNotes: 'Rarely used in Danish register-based epidemiology; more relevant to clinical settings. However, Danish register data can supply aggregated N-of-1 data for secondary analysis of treatment response heterogeneity.',
    commonAnalyses: ['Paired t-test / Wilcoxon signed-rank', 'Bayesian hierarchical aggregation', 'Mixed-effects crossover models']
  },

  /* -------------------------------------------------------
     ADAPTIVE DESIGN TRIAL
     ------------------------------------------------------- */
  {
    id: 'adaptive',
    label: 'Adaptive Design Trial',
    category: 'experimental',
    temporalDirection: 'Prospective (sequential decision rules)',
    primaryMeasure: 'Risk Ratio, Hazard Ratio (with adaptive stopping/allocation)',
    svg: SVG.wrap(
      '<title>Adaptive Design Trial schematic</title>' +
      '<desc>Trial with interim analyses and decision nodes allowing early stopping, arm dropping, sample size re-estimation, or response-adaptive allocation based on accumulating data.</desc>' +

      SVG.txt(200, 12, 'Interim analysis → pre-specified adaptation rule', {size:9, weight:'500'}) +

      SVG.box(155, 20, 90, 24, 'Start / Arms A+B', 'currentColor') +

      SVG.arrow(200, 44, 200, 62) +

      /* Interim 1 */
      '<polygon points="200,62 240,82 200,102 160,82" fill="var(--svg-period)" opacity="0.15" stroke="var(--svg-period)" stroke-width="1.5"/>' +
      SVG.txt(200, 82, 'Interim 1', {size:9, fill:'var(--svg-period)', weight:'500'}) +

      /* Three branches from interim */
      '<line x1="160" y1="82" x2="60"  y2="110" stroke="currentColor" stroke-width="1.2"/>' +
      '<line x1="200" y1="102" x2="200" y2="110" stroke="currentColor" stroke-width="1.2"/>' +
      '<line x1="240" y1="82" x2="340" y2="110" stroke="currentColor" stroke-width="1.2"/>' +

      SVG.box(20,  110, 80, 22, 'Stop (futility)', 'var(--svg-event)') +
      SVG.box(155, 110, 90, 22, 'Continue / adapt', 'var(--svg-exposed)') +
      SVG.box(300, 110, 80, 22, 'Stop (efficacy)', 'var(--svg-control)') +

      SVG.arrow(200, 132, 200, 148) +

      /* Interim 2 */
      '<polygon points="200,148 235,165 200,182 165,165" fill="var(--svg-period)" opacity="0.12" stroke="var(--svg-period)" stroke-width="1.5"/>' +
      SVG.txt(200, 165, 'Interim 2', {size:9, fill:'var(--svg-period)'}) +

      SVG.arrow(200, 182, 200, 198) +
      SVG.box(155, 198, 90, 22, 'Final analysis', 'currentColor') +

      SVG.txt(370, 82, '← early', {size:8, anchor:'end'}) +
      SVG.txt(370, 90, 'stop', {size:8, anchor:'end'}),
      228
    ),
    strengths: [
      'More ethical — can stop early for efficacy or futility, limiting exposure to inferior treatment.',
      'More efficient — can reduce required sample size when effects are large.',
      'Response-adaptive allocation directs more participants to better-performing arm.',
      'Sample size re-estimation corrects for uncertain preliminary effect size assumptions.'
    ],
    limitations: [
      'Pre-specification of adaptation rules is essential; post-hoc adaptations inflate type I error.',
      'Operational complexity — requires independent data monitoring committee.',
      'Can introduce selection bias if adaptations are not blinded.',
      'Multiple testing inflation requires careful alpha spending (e.g., O\'Brien-Fleming).'
    ],
    biases: ['Alpha inflation (multiple looks)', 'Selection bias from unblinded adaptations', 'Nuisance parameter estimation error'],
    danishPharmacoepiNotes: 'Adaptive designs are primarily used in interventional trials; less common in Danish register-based research. However, Danish register linkage can provide real-time safety monitoring data to inform data monitoring committee decisions in embedded pragmatic adaptive trials.',
    commonAnalyses: ['Alpha-spending (O\'Brien-Fleming, Pocock)', 'Bayesian adaptive allocation', 'Response-adaptive randomisation', 'Seamless phase II/III designs']
  },

  /* -------------------------------------------------------
     PREVALENT NEW-USER (PNU) DESIGN
     ------------------------------------------------------- */
  {
    id: 'pnu',
    label: 'Prevalent New-User (PNU) Design',
    category: 'observational',
    temporalDirection: 'Prospective (from new-user index date)',
    primaryMeasure: 'Hazard Ratio, Risk Ratio',
    svg: SVG.wrap(
      '<title>Prevalent New-User design schematic</title>' +
      '<desc>Prevalent users of comparator drug serve as the comparison group; new users of the drug of interest are matched or compared to them using a landmark time approach to handle left-truncation.</desc>' +

      SVG.txt(200, 12, 'New users of drug A vs prevalent users of drug B', {size:9, weight:'500'}) +

      SVG.arrow(20, 130, 385, 130) +
      SVG.txt(200, 145, 'Calendar time →', {size:9}) +

      /* Drug A new users — start at index */
      '<line x1="160" y1="20" x2="160" y2="125" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.4"/>' +
      SVG.txt(160, 14, 'Index date', {size:9}) +

      '<rect x="160" y="28" width="185" height="22" rx="4" fill="var(--svg-exposed)" opacity="0.18" stroke="var(--svg-exposed)" stroke-width="1"/>' +
      SVG.txt(130, 42, 'New users A', {size:9, fill:'var(--svg-exposed)', anchor:'end', weight:'500'}) +
      SVG.arrow(345, 39, 370, 39, 'var(--svg-exposed)', 'url(#arr-exp)') +
      SVG.box(355, 28, 35, 22, 'Outcome', 'var(--svg-event)') +

      /* Drug B prevalent users — started before index */
      '<rect x="60"  y="65" width="285" height="22" rx="4" fill="var(--svg-control)" opacity="0.18" stroke="var(--svg-control)" stroke-width="1"/>' +
      SVG.txt(130, 79, 'Prevalent users B', {size:9, fill:'var(--svg-control)', anchor:'end', weight:'500'}) +
      SVG.txt(70, 58, '(started earlier)', {size:8, fill:'var(--svg-control)'}) +
      SVG.arrow(345, 76, 370, 76, 'var(--svg-control)', 'url(#arr-ctrl)') +
      SVG.box(355, 65, 35, 22, 'Outcome', 'var(--svg-event)') +

      '<rect x="10" y="150" width="380" height="22" rx="4" fill="currentColor" opacity="0.04"/>' +
      SVG.txt(200, 160, 'Landmark time at index date equalises immortal time for prevalent users', {size:8}) +
      SVG.txt(200, 170, 'Prevalent user bias reduced but not eliminated vs. active comparator new-user', {size:8}),
      180
    ),
    strengths: [
      'Preserves larger sample size by including prevalent comparator users.',
      'Useful when an active comparator new-user design would be underpowered.',
      'Landmark approach at index date of new users reduces (but does not eliminate) immortal time bias.',
      'Practical when both drug groups cannot both be new users simultaneously.'
    ],
    limitations: [
      'Prevalent comparator users are a selected, surviving group — depletion of susceptibles.',
      'Residual immortal time bias if landmark is not correctly implemented.',
      'Prevalent users may differ systematically from new users in unmeasured ways.',
      'Requires careful definition of the landmark time point.'
    ],
    biases: ['Prevalent user bias (comparator arm)', 'Depletion of susceptibles', 'Immortal time bias (if landmark misspecified)', 'Confounding by indication'],
    danishPharmacoepiNotes: 'Used in Danish register studies when the drug of interest is newer than comparator, making it impossible to identify new users of both drugs simultaneously. The LPDB provides dispensing history needed to define new-user status (washout period, e.g. 1–2 years prescription-free).',
    commonAnalyses: ['Cox proportional hazards with landmark', 'Propensity score methods', 'IPTW']
  },

  /* -------------------------------------------------------
     CASE-TIME-CONTROL
     ------------------------------------------------------- */
  {
    id: 'case-time-control',
    label: 'Case-Time-Control Design',
    category: 'observational',
    temporalDirection: 'Bidirectional (within-person + control group)',
    primaryMeasure: 'Odds Ratio (adjusted for secular trends)',
    svg: SVG.wrap(
      '<title>Case-time-control design schematic</title>' +
      '<desc>Case-crossover extended with a control group to adjust for secular trends in exposure. Both cases and controls contribute hazard and reference periods.</desc>' +

      SVG.txt(200, 12, 'Case-crossover + control group for trend adjustment', {size:9, weight:'500'}) +

      SVG.arrow(20, 145, 385, 145) +
      SVG.txt(200, 158, 'Time →', {size:9}) +

      /* Cases row */
      SVG.txt(18, 50, 'Cases', {size:9, fill:'var(--svg-event)', anchor:'start', weight:'500'}) +
      '<rect x="30"  y="58" width="100" height="26" rx="5" fill="var(--svg-control)" opacity="0.15" stroke="var(--svg-control)" stroke-width="1.5" stroke-dasharray="5,3"/>' +
      SVG.txt(80, 74, 'Ref period', {size:8, fill:'var(--svg-control)'}) +
      '<rect x="200" y="58" width="100" height="26" rx="5" fill="var(--svg-exposed)" opacity="0.18" stroke="var(--svg-exposed)" stroke-width="1.8"/>' +
      SVG.txt(250, 74, 'Hazard period', {size:8, fill:'var(--svg-exposed)', weight:'500'}) +
      '<circle cx="330" cy="71" r="7" fill="var(--svg-event)" opacity="0.8"/>' +
      SVG.txt(342, 74, 'Event', {size:8, fill:'var(--svg-event)'}) +

      /* Controls row */
      SVG.txt(18, 108, 'Controls', {size:9, fill:'var(--svg-control)', anchor:'start', weight:'500'}) +
      '<rect x="30"  y="115" width="100" height="26" rx="5" fill="var(--svg-control)" opacity="0.12" stroke="var(--svg-control)" stroke-width="1.5" stroke-dasharray="5,3"/>' +
      SVG.txt(80, 131, 'Ref period', {size:8, fill:'var(--svg-control)'}) +
      '<rect x="200" y="115" width="100" height="26" rx="5" fill="var(--svg-exposed)" opacity="0.12" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      SVG.txt(250, 131, 'Matched period', {size:8, fill:'var(--svg-exposed)'}) +

      /* Arrows showing cross-period comparison */
      SVG.arrow(80, 94, 80, 115) +
      SVG.arrow(250, 94, 250, 115) +

      '<rect x="10" y="162" width="380" height="14" rx="3" fill="currentColor" opacity="0.04"/>' +
      SVG.txt(200, 172, 'OR_case-time-control = OR_cases / OR_controls   (trend adjustment)', {size:8}),
      183
    ),
    strengths: [
      'Controls for secular trends in exposure prevalence that case-crossover cannot handle.',
      'Retains self-controlled design benefits (fixed confounders cancelled).',
      'More robust than case-crossover when exposure probability is time-varying.',
      'Uses only case and control person-time — no full cohort required.'
    ],
    limitations: [
      'Requires an appropriate control group matched on time window.',
      'Controls must share similar exposure trends as cases (exchangeability assumption).',
      'More complex analysis than standard case-crossover.',
      'Rare exposures reduce precision.'
    ],
    biases: ['Control selection bias', 'Time trend non-exchangeability', 'Exposure misclassification'],
    danishPharmacoepiNotes: 'Applied in Danish register pharmacoepidemiology when drug prescribing rates change over time (e.g., a drug gaining new indications or changing market share), making simple case-crossover analyses susceptible to secular trend bias. Reference: Suissa (1995).',
    commonAnalyses: ['Conditional logistic regression', 'Ratio of case-crossover to control-crossover ORs']
  },

  /* -------------------------------------------------------
     CASE-POPULATION DESIGN
     ------------------------------------------------------- */
  {
    id: 'case-population',
    label: 'Case-Population Design',
    category: 'observational',
    temporalDirection: 'Retrospective',
    primaryMeasure: 'Standardised Morbidity Ratio, Risk Ratio vs population baseline',
    svg: SVG.wrap(
      '<title>Case-population design schematic</title>' +
      '<desc>Cases with the outcome are compared to the background population exposure rate rather than to a sampled control group.</desc>' +

      /* Cases box */
      SVG.box(30, 30, 130, 60, 'Cases (D+)', 'var(--svg-event)') +
      SVG.txt(95, 58, 'n = observed', {size:8, fill:'var(--svg-event)'}) +
      SVG.txt(95, 70, 'exposed cases', {size:8, fill:'var(--svg-event)'}) +

      SVG.arrow(160, 60, 205, 60) +

      /* Ratio box */
      '<rect x="205" y="38" width="110" height="44" rx="6" fill="currentColor" opacity="0.06" stroke="currentColor" stroke-width="1.5"/>' +
      SVG.txt(260, 53, 'Observed', {size:9, weight:'500'}) +
      SVG.txt(260, 66, '────────', {size:9}) +
      SVG.txt(260, 79, 'Expected', {size:9}) +

      SVG.arrow(315, 60, 355, 60) +
      SVG.box(355, 38, 35, 44, 'SMR', 'var(--svg-exposed)') +

      /* Population rate */
      '<rect x="30" y="120" width="130" height="40" rx="6" fill="var(--svg-control)" opacity="0.12" stroke="var(--svg-control)" stroke-width="1.5" stroke-dasharray="5,3"/>' +
      SVG.txt(95, 136, 'Background population', {size:9, fill:'var(--svg-control)', weight:'500'}) +
      SVG.txt(95, 149, 'exposure / disease rate', {size:8, fill:'var(--svg-control)'}) +
      '<line x1="95" y1="120" x2="95" y2="90" stroke="var(--svg-control)" stroke-width="1.5" marker-end="url(#arr-ctrl)"/>' +
      SVG.txt(120, 108, '← Expected = rate × person-time', {size:8, fill:'var(--svg-control)'}) +

      '<rect x="10" y="165" width="380" height="14" rx="4" fill="currentColor" opacity="0.04"/>' +
      SVG.txt(200, 175, 'No explicit control sample drawn — whole population serves as reference', {size:8}),
      185
    ),
    strengths: [
      'No control group sampling needed — uses population rates as reference.',
      'Efficient and cheap for rare diseases with known population rates.',
      'Avoids control selection bias.',
      'Useful for occupational or environmental cohorts with known exposure.'
    ],
    limitations: [
      'Population rates must be available and applicable to the study population.',
      'Assumes cases arise from the reference population (healthy worker effect concern).',
      'Cannot adjust for individual-level confounders not captured in population rates.',
      'SMR is a relative measure that depends on the reference population chosen.'
    ],
    biases: ['Healthy worker effect', 'Reference population mismatch', 'Confounding by age/sex distribution'],
    danishPharmacoepiNotes: 'Used in Danish occupational and environmental epidemiology using Danish Cancer Registry or LPR as both case source and population rate denominator. Danish registers provide age-sex-year stratified population rates for standardisation.',
    commonAnalyses: ['Standardised morbidity/mortality ratio (SMR)', 'Indirect standardisation', 'Poisson regression with offset']
  },

  /* -------------------------------------------------------
     SELF-CONTROLLED RISK INTERVAL (SCRI)
     ------------------------------------------------------- */
  {
    id: 'scri',
    label: 'Self-Controlled Risk Interval (SCRI)',
    category: 'self-controlled',
    temporalDirection: 'Bidirectional (within-person)',
    primaryMeasure: 'Incidence Rate Ratio (risk interval vs. control interval)',
    svg: SVG.wrap(
      '<title>Self-Controlled Risk Interval schematic</title>' +
      '<desc>Individual timeline showing a defined risk interval immediately after an exposure event and a separate control interval. Only persons who experienced the event contribute.</desc>' +

      SVG.txt(200, 12, 'Only cases contribute — no unexposed person-time used', {size:9, weight:'500'}) +

      SVG.arrow(20, 100, 385, 100) +
      SVG.txt(200, 115, 'Time →', {size:9}) +

      /* Exposure event */
      '<line x1="100" y1="28" x2="100" y2="95" stroke="var(--svg-exposed)" stroke-width="2"/>' +
      '<circle cx="100" cy="50" r="5" fill="var(--svg-exposed)"/>' +
      SVG.txt(100, 22, 'Exposure', {size:9, fill:'var(--svg-exposed)', weight:'500'}) +

      /* Pre-exposure control interval */
      '<rect x="25" y="55" width="75" height="32" rx="5" fill="var(--svg-control)" opacity="0.18" stroke="var(--svg-control)" stroke-width="1.5" stroke-dasharray="5,3"/>' +
      SVG.txt(62, 74, 'Control interval', {size:8, fill:'var(--svg-control)'}) +

      /* Risk interval */
      '<rect x="100" y="55" width="120" height="32" rx="5" fill="var(--svg-exposed)" opacity="0.2" stroke="var(--svg-exposed)" stroke-width="2"/>' +
      SVG.txt(160, 68, 'Risk interval', {size:9, fill:'var(--svg-exposed)', weight:'500'}) +
      SVG.txt(160, 80, '(e.g., 0–28 days)', {size:8, fill:'var(--svg-exposed)'}) +

      /* Outcome in risk period */
      '<circle cx="195" cy="55" r="6" fill="var(--svg-event)" opacity="0.9"/>' +
      SVG.txt(210, 52, 'Outcome', {size:8, fill:'var(--svg-event)'}) +

      /* Washout/exclusion */
      '<rect x="220" y="60" width="50" height="22" rx="4" fill="currentColor" opacity="0.05" stroke="currentColor" stroke-width="1" stroke-dasharray="3,2"/>' +
      SVG.txt(245, 74, 'Washout', {size:8}) +

      /* Outer period (excluded) */
      '<rect x="270" y="60" width="100" height="22" rx="4" fill="currentColor" opacity="0.03" stroke="currentColor" stroke-width="0.5"/>' +
      SVG.txt(320, 74, 'Excluded', {size:8}) +

      '<rect x="10" y="125" width="380" height="24" rx="4" fill="currentColor" opacity="0.04"/>' +
      SVG.txt(200, 136, 'SCRI vs SCCS: SCRI uses defined control window only (not all non-risk time)', {size:8}) +
      SVG.txt(200, 148, 'Advantage: avoids assumption that event does not affect re-exposure', {size:8}),
      162
    ),
    strengths: [
      'Like SCCS, eliminates time-fixed confounders by within-person comparison.',
      'Avoids the SCCS assumption that event occurrence does not affect subsequent exposure.',
      'Pre-defined narrow control window reduces exposure time-trend confounding.',
      'Well-suited for vaccine safety studies with short risk windows.'
    ],
    limitations: [
      'Requires careful specification of both risk and control intervals.',
      'Control interval must precede the risk interval (pre-exposure) to avoid protopathic bias.',
      'Time-varying confounders between control and risk intervals remain.',
      'Less statistical power than SCCS because less person-time is used.'
    ],
    biases: ['Interval misspecification bias', 'Time-varying confounding within window', 'Protopathic bias (if control interval post-exposure)'],
    danishPharmacoepiNotes: 'Increasingly used in Danish vaccine safety surveillance and drug safety studies. The Vaccination Register and LPDB provide precise exposure timestamps. Reference: Weldeselassie et al. (2011). Also used in EMA/FDA pharmacovigilance frameworks.',
    commonAnalyses: ['Conditional Poisson regression', 'Exact Poisson test for single events']
  },

  /* -------------------------------------------------------
     REGRESSION DISCONTINUITY DESIGN
     ------------------------------------------------------- */
  {
    id: 'rdd',
    label: 'Regression Discontinuity Design (RDD)',
    category: 'quasi-experimental',
    temporalDirection: 'Cross-sectional / longitudinal around threshold',
    primaryMeasure: 'Local Average Treatment Effect (LATE) at the threshold',
    svg: SVG.wrap(
      '<title>Regression Discontinuity Design schematic</title>' +
      '<desc>Running variable on the x-axis with a threshold. Outcome on y-axis shows a smooth relationship below and above the threshold, with a discontinuous jump at the cutoff representing the treatment effect.</desc>' +

      /* Axes */
      '<line x1="45" y1="20" x2="45" y2="140" stroke="currentColor" stroke-width="1.5"/>' +
      '<line x1="45" y1="140" x2="380" y2="140" stroke="currentColor" stroke-width="1.5" marker-end="url(#arr)"/>' +
      SVG.txt(210, 155, 'Running variable (score / age / biomarker)', {size:9}) +
      '<text x="28" y="80" text-anchor="middle" font-size="9" fill="currentColor" transform="rotate(-90,28,80)">Outcome</text>' +

      /* Threshold line */
      '<line x1="210" y1="18" x2="210" y2="142" stroke="var(--svg-event)" stroke-width="2" stroke-dasharray="5,3"/>' +
      SVG.txt(210, 12, 'Cutoff / threshold', {size:9, fill:'var(--svg-event)', weight:'500'}) +

      /* Below threshold: control (no treatment) */
      '<polyline points="55,125 90,118 120,112 150,108 180,104 210,100" stroke="var(--svg-control)" stroke-width="2.5" fill="none"/>' +
      SVG.txt(80, 136, 'Untreated (score < c)', {size:8, fill:'var(--svg-control)'}) +

      /* Above threshold: treated */
      '<polyline points="210,78 240,74 270,71 300,68 330,65 360,62" stroke="var(--svg-exposed)" stroke-width="2.5" fill="none"/>' +
      SVG.txt(290, 57, 'Treated (score ≥ c)', {size:8, fill:'var(--svg-exposed)'}) +

      /* Jump annotation */
      '<line x1="215" y1="78" x2="215" y2="100" stroke="currentColor" stroke-width="1" opacity="0.7"/>' +
      '<line x1="212" y1="78"  x2="218" y2="78"  stroke="currentColor" stroke-width="1"/>' +
      '<line x1="212" y1="100" x2="218" y2="100" stroke="currentColor" stroke-width="1"/>' +
      SVG.txt(240, 90, '← LATE at cutoff', {size:8, weight:'500', anchor:'start'}) +

      /* Bandwidth shading */
      '<rect x="170" y="20" width="80" height="120" fill="var(--svg-event)" opacity="0.05" stroke="none"/>' +
      SVG.txt(210, 132, '← bandwidth →',{size:7, fill:'var(--svg-event)'}),
      168
    ),
    strengths: [
      'Identifies causal effect near the threshold without randomisation.',
      'Assignment mechanism (rule-based threshold) is often credible and verifiable.',
      'Intuitive design — discontinuity at cutoff is visually compelling evidence.',
      'Robust to unmeasured confounding for individuals near the threshold.'
    ],
    limitations: [
      'Effect only estimated locally at the threshold — limited external validity.',
      'Requires sufficient density of observations near the threshold.',
      'Manipulation of the running variable (gaming) violates the design assumption.',
      'Functional form of the regression must be correctly specified on both sides.'
    ],
    biases: ['Running variable manipulation (gaming)', 'Bandwidth selection bias', 'Functional form misspecification', 'Spillover across threshold'],
    danishPharmacoepiNotes: 'Applied in Danish studies using clinical decision thresholds (e.g., HbA1c ≥ 48 mmol/mol for diabetes diagnosis, lipid treatment cutoffs, age-based screening eligibility). Register data enable large samples near the threshold. Reference: Bor et al. (2014).',
    commonAnalyses: ['Local linear regression with bandwidth selection', 'Polynomial regression (both sides)', 'rdrobust (R/Stata package)', 'Density test (McCrary)']
  },

  /* -------------------------------------------------------
     MENDELIAN RANDOMISATION
     ------------------------------------------------------- */
  {
    id: 'mr',
    label: 'Mendelian Randomisation (MR)',
    category: 'quasi-experimental',
    temporalDirection: 'Cross-sectional (genetic data) with longitudinal outcome',
    primaryMeasure: 'Causal Odds Ratio / Risk Ratio (IV estimate via genetic variant)',
    svg: SVG.wrap(
      '<title>Mendelian Randomisation DAG</title>' +
      '<desc>DAG showing genetic instrument G affecting exposure X, X affecting outcome Y, and unmeasured confounders U affecting both X and Y. Exclusion restriction requires no direct G to Y path.</desc>' +

      /* Nodes */
      SVG.node(70,  80, 26, 'G', 'var(--svg-period)') +
      SVG.node(200, 80, 26, 'X', 'var(--svg-exposed)') +
      SVG.node(330, 80, 26, 'Y', 'var(--svg-event)') +
      SVG.node(200, 22, 20, 'U', 'currentColor') +

      /* G → X */
      SVG.arrow(96, 80, 170, 80, 'var(--svg-period)', 'url(#arr)') +
      /* X → Y */
      SVG.arrow(226, 80, 300, 80, 'var(--svg-exposed)', 'url(#arr-exp)') +
      /* U → X and U → Y (dashed) */
      '<line x1="188" y1="40" x2="120" y2="66" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4,3" opacity="0.6" marker-end="url(#arr)"/>' +
      '<line x1="212" y1="40" x2="280" y2="66" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4,3" opacity="0.6" marker-end="url(#arr)"/>' +

      /* No direct G→Y (crossed out) */
      '<line x1="90" y1="68" x2="318" y2="68" stroke="var(--svg-event)" stroke-width="1" stroke-dasharray="3,3" opacity="0.3"/>' +
      SVG.txt(200, 62, '✗ no direct G→Y (exclusion restriction)', {size:8, fill:'var(--svg-event)'}) +

      /* Labels */
      SVG.txt(70,  116, 'Genetic', {size:9, fill:'var(--svg-period)', weight:'500'}) +
      SVG.txt(70,  127, 'instrument', {size:9, fill:'var(--svg-period)'}) +
      SVG.txt(70,  138, '(SNP / PRS)', {size:8, fill:'var(--svg-period)'}) +
      SVG.txt(200, 116, 'Modifiable', {size:9, fill:'var(--svg-exposed)', weight:'500'}) +
      SVG.txt(200, 127, 'exposure', {size:9, fill:'var(--svg-exposed)'}) +
      SVG.txt(330, 116, 'Outcome', {size:9, fill:'var(--svg-event)', weight:'500'}) +
      SVG.txt(200, 10,  'Unmeasured confounders', {size:8}) +

      /* Assumptions */
      '<rect x="10" y="144" width="380" height="22" rx="4" fill="var(--svg-period)" opacity="0.07"/>' +
      SVG.txt(200, 153, '(1) G strongly predicts X   (2) G ⊥ U   (3) G→Y only via X', {size:8}) +
      SVG.txt(200, 163, 'Causal estimate: β_IV = β_{GY} / β_{GX}  (Wald ratio)', {size:8}),
      175
    ),
    strengths: [
      'Uses genetic variants as instruments — largely independent of lifestyle confounders.',
      'Can identify causal effects of modifiable exposures without a randomised trial.',
      'Genetic randomisation occurs at conception — precedes almost all environmental confounders.',
      'GWAS-level summary statistics enable two-sample MR without individual data.'
    ],
    limitations: [
      'Exclusion restriction (no pleiotropy) is untestable and often violated.',
      'Weak instruments (low F-statistic) produce biased estimates.',
      'Population stratification can confound genetic associations.',
      'Estimates LATE for compliers — may not generalise.',
      'Linkage disequilibrium complicates multi-SNP instruments.'
    ],
    biases: ['Horizontal pleiotropy', 'Population stratification', 'Weak instrument bias', 'LD contamination', 'Winner\'s curse'],
    danishPharmacoepiNotes: 'Denmark participates in large-scale biobank consortia (e.g., iPSYCH, DBDS). Linkage of biobank genetic data to Danish health registers enables one-sample MR with rich covariate and outcome data. The Danish Blood Donor Study (DBDS) provides genome-wide data on ~110,000 donors linked to registers.',
    commonAnalyses: ['Wald ratio (single SNP)', 'IVW (inverse-variance weighted)', 'MR-Egger', 'Weighted median MR', 'Two-sample MR (TwoSampleMR R package)']
  },

  /* -------------------------------------------------------
     SYNTHETIC CONTROL METHOD
     ------------------------------------------------------- */
  {
    id: 'synthetic-control',
    label: 'Synthetic Control Method',
    category: 'quasi-experimental',
    temporalDirection: 'Longitudinal (pre-post intervention)',
    primaryMeasure: 'Absolute treatment effect (observed vs. synthetic counterfactual)',
    svg: SVG.wrap(
      '<title>Synthetic Control Method schematic</title>' +
      '<desc>Treated unit time series compared to a weighted combination of donor pool units (synthetic control). Post-intervention gap between observed and synthetic control is the treatment effect.</desc>' +

      /* Axes */
      '<line x1="45" y1="18" x2="45" y2="138" stroke="currentColor" stroke-width="1.5"/>' +
      '<line x1="45" y1="138" x2="375" y2="138" stroke="currentColor" stroke-width="1.5" marker-end="url(#arr)"/>' +
      SVG.txt(210, 153, 'Time →', {size:9}) +
      '<text x="28" y="78" text-anchor="middle" font-size="9" fill="currentColor" transform="rotate(-90,28,78)">Outcome</text>' +

      /* Intervention line */
      '<line x1="200" y1="16" x2="200" y2="140" stroke="var(--svg-event)" stroke-width="1.8" stroke-dasharray="5,3"/>' +
      SVG.txt(200, 11, 'Intervention', {size:9, fill:'var(--svg-event)', weight:'500'}) +

      /* Donor pool traces (faint) */
      '<polyline points="55,95 90,90 130,85 170,88 200,82 240,78 280,72 340,68" stroke="currentColor" stroke-width="1" fill="none" opacity="0.2"/>' +
      '<polyline points="55,105 90,100 130,98 170,95 200,92 240,95 280,100 340,105" stroke="currentColor" stroke-width="1" fill="none" opacity="0.2"/>' +
      '<polyline points="55,75 90,70 130,72 170,70 200,68 240,60 280,55 340,50" stroke="currentColor" stroke-width="1" fill="none" opacity="0.2"/>' +
      SVG.txt(65, 62, 'Donor pool', {size:8, fill:'currentColor'}) +

      /* Synthetic control (pre-fit, post-counterfactual) */
      '<polyline points="55,88 90,84 130,82 170,80 200,78 240,76 280,74 340,72" stroke="var(--svg-control)" stroke-width="2" fill="none" stroke-dasharray="7,4"/>' +
      SVG.txt(355, 72, 'Synthetic', {size:8, fill:'var(--svg-control)', anchor:'start'}) +
      SVG.txt(355, 82, 'control', {size:8, fill:'var(--svg-control)', anchor:'start'}) +

      /* Treated unit */
      '<polyline points="55,88 90,84 130,82 170,80 200,78 240,58 280,48 340,42" stroke="var(--svg-exposed)" stroke-width="2.5" fill="none"/>' +
      SVG.txt(355, 42, 'Treated', {size:8, fill:'var(--svg-exposed)', anchor:'start', weight:'500'}) +

      /* Gap brace */
      '<line x1="340" y1="42" x2="340" y2="72" stroke="currentColor" stroke-width="1" opacity="0.7"/>' +
      SVG.txt(342, 57, '←effect', {size:8, anchor:'start', weight:'500'}) +

      /* Pre-period fit annotation */
      '<rect x="48" y="115" width="148" height="12" rx="3" fill="var(--svg-control)" opacity="0.1"/>' +
      SVG.txt(122, 124, 'Pre: fit weights to match treated', {size:7.5, fill:'var(--svg-control)'}),
      165
    ),
    strengths: [
      'Data-driven construction of counterfactual — no arbitrary control group choice.',
      'Pre-intervention fit is transparent and verifiable.',
      'Useful when only one (or few) treated units are available.',
      'Placebo tests (fake interventions) provide falsification evidence.'
    ],
    limitations: [
      'Requires a good donor pool and long pre-intervention period for fitting.',
      'Does not work well with many treated units.',
      'No standard inference framework — relies on permutation/placebo tests.',
      'Extrapolation outside pre-period covariate range is unreliable.'
    ],
    biases: ['Donor pool selection bias', 'Interpolation bias (weights sum constraint)', 'Contemporaneous confounders post-intervention'],
    danishPharmacoepiNotes: 'Applied in Danish and Nordic policy research where one region or country receives an intervention and others serve as donors (e.g., evaluating Danish-specific drug policy changes, comparing Denmark to Nordic neighbours using aggregated register data). Reference: Abadie et al. (2010).',
    commonAnalyses: ['Synthetic control (Abadie–Diamond–Hainmueller)', 'Augmented synthetic control (Ben-Michael)', 'Permutation inference / placebo tests']
  },

  /* -------------------------------------------------------
     DISPROPORTIONALITY ANALYSIS
     ------------------------------------------------------- */
  {
    id: 'disproportionality',
    label: 'Disproportionality Analysis (ROR, PRR, MGPS)',
    category: 'pharmacovigilance',
    temporalDirection: 'Cross-sectional (cumulative spontaneous reports)',
    primaryMeasure: 'Reporting Odds Ratio (ROR), Proportional Reporting Ratio (PRR), EBGM (MGPS)',
    svg: SVG.wrap(
      '<title>Disproportionality Analysis schematic</title>' +
      '<desc>2x2 table of spontaneous adverse event reports comparing co-reports of drug A and event E against all other drug-event combinations. ROR and PRR derived from this table.</desc>' +

      SVG.txt(200, 12, 'Spontaneous report database (e.g., EudraVigilance, FAERS)', {size:9, weight:'500'}) +

      /* 2x2 table */
      SVG.txt(200, 32, 'Event of interest (E+)', {size:9, fill:'var(--svg-event)', weight:'500'}) +
      SVG.txt(310, 32, 'Other events (E−)', {size:9}) +

      SVG.txt(50, 65, 'Drug A', {size:9, fill:'var(--svg-exposed)', weight:'500', anchor:'end'}) +
      '<rect x="55"  y="47" width="110" height="34" rx="4" fill="var(--svg-exposed)" opacity="0.15" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      SVG.txt(110, 67, 'a', {size:18, weight:'700', fill:'var(--svg-exposed)'}) +

      '<rect x="175" y="47" width="110" height="34" rx="4" fill="currentColor" opacity="0.05" stroke="currentColor" stroke-width="1"/>' +
      SVG.txt(230, 67, 'b', {size:18, weight:'700'}) +

      SVG.txt(50, 112, 'Other drugs', {size:9, anchor:'end'}) +
      '<rect x="55"  y="91" width="110" height="34" rx="4" fill="currentColor" opacity="0.05" stroke="currentColor" stroke-width="1"/>' +
      SVG.txt(110, 111, 'c', {size:18, weight:'700'}) +

      '<rect x="175" y="91" width="110" height="34" rx="4" fill="currentColor" opacity="0.04" stroke="currentColor" stroke-width="0.5"/>' +
      SVG.txt(230, 111, 'd', {size:18, weight:'700'}) +

      /* Formulas */
      '<rect x="10" y="135" width="380" height="40" rx="5" fill="currentColor" opacity="0.04" stroke="currentColor" stroke-width="0.5"/>' +
      SVG.txt(200, 148, 'ROR = (a/c) / (b/d) = ad/bc          PRR = (a/(a+c)) / (b/(b+d))', {size:8.5}) +
      SVG.txt(200, 162, 'EBGM (MGPS): Bayesian shrinkage of observed/expected report ratio', {size:8}),
      182
    ),
    strengths: [
      'Rapid, large-scale signal detection from spontaneous report databases.',
      'Can detect rare adverse events not observable in pre-market trials.',
      'Enables hypothesis generation across thousands of drug-event pairs.',
      'MGPS/EBGM provides Bayesian shrinkage reducing false positives from small counts.'
    ],
    limitations: [
      'Notoriously subject to under-reporting and selective reporting biases.',
      'Cannot estimate incidence rates or absolute risk — only proportions of reports.',
      'Confounded by indication, co-medication, and notoriety bias (Weber effect).',
      'ROR and PRR are measures of signal, not causation.',
      'Masking (competition bias): drugs that suppress reporting of other drugs.'
    ],
    biases: ['Under-reporting bias', 'Notoriety bias (Weber effect)', 'Confounding by indication', 'Competition/masking bias', 'Stimulated reporting'],
    danishPharmacoepiNotes: 'Denmark reports to EudraVigilance (EMA) and participates in the WHO Uppsala Monitoring Centre VigiBase. Danish spontaneous reports are supplemented by register-based signal verification — a strength unavailable in most countries. DKMA (Danish Medicines Agency) coordinates pharmacovigilance activities.',
    commonAnalyses: ['Reporting Odds Ratio (ROR) with 95% CI', 'Proportional Reporting Ratio (PRR)', 'EBGM / MGPS (Multi-item Gamma Poisson Shrinker)', 'Information Component (IC, WHO-UMC)']
  },

  /* -------------------------------------------------------
     NETWORK META-ANALYSIS
     ------------------------------------------------------- */
  {
    id: 'nma',
    label: 'Network Meta-analysis (NMA)',
    category: 'evidence-synthesis',
    temporalDirection: 'Retrospective (synthesis of existing evidence)',
    primaryMeasure: 'Network OR/RR/HR with uncertainty intervals; treatment rankings (P-score, SUCRA)',
    svg: SVG.wrap(
      '<title>Network Meta-analysis schematic</title>' +
      '<desc>Evidence network graph with treatment nodes and edges representing direct comparisons from trials. Indirect comparisons are inferred via common comparator paths (e.g., A vs B via C).</desc>' +

      SVG.txt(200, 12, 'Evidence network: nodes = treatments, edges = direct comparisons', {size:9, weight:'500'}) +

      /* Treatment nodes */
      SVG.node(200, 70, 28, 'A', 'var(--svg-exposed)') +
      SVG.node(100, 140, 28, 'B', 'var(--svg-control)') +
      SVG.node(300, 140, 28, 'C', 'var(--svg-period)') +
      SVG.node(200, 145, 22, 'Pbo', 'currentColor') +

      /* Direct edges with trial counts */
      /* A-B direct */
      '<line x1="176" y1="88" x2="124" y2="122" stroke="var(--svg-exposed)" stroke-width="3" opacity="0.5"/>' +
      SVG.txt(140, 100, '3 RCTs', {size:8, fill:'var(--svg-exposed)'}) +

      /* A-C direct */
      '<line x1="224" y1="88" x2="276" y2="122" stroke="var(--svg-period)" stroke-width="3" opacity="0.5"/>' +
      SVG.txt(268, 100, '2 RCTs', {size:8, fill:'var(--svg-period)'}) +

      /* A-Pbo */
      '<line x1="200" y1="98" x2="200" y2="123" stroke="currentColor" stroke-width="2" opacity="0.4"/>' +
      SVG.txt(215, 113, '5', {size:8}) +

      /* B-Pbo */
      '<line x1="122" y1="145" x2="178" y2="145" stroke="currentColor" stroke-width="2" opacity="0.4"/>' +
      SVG.txt(150, 140, '4', {size:8}) +

      /* C-Pbo */
      '<line x1="278" y1="145" x2="222" y2="145" stroke="currentColor" stroke-width="2" opacity="0.4"/>' +
      SVG.txt(258, 140, '2', {size:8}) +

      /* B-C indirect arrow */
      '<path d="M 128,145 Q 200,178 272,145" fill="none" stroke="var(--svg-event)" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.7" marker-end="url(#arr-ev)"/>' +
      SVG.txt(200, 178, 'B vs C: indirect via A or Pbo', {size:8, fill:'var(--svg-event)'}) +

      '<rect x="10" y="185" width="380" height="10" rx="3" fill="currentColor" opacity="0.04"/>' +
      SVG.txt(200, 193, 'Consistency assumption: direct ≈ indirect evidence', {size:7.5}),
      200
    ),
    strengths: [
      'Enables simultaneous comparison of all treatments, including those never directly compared in trials.',
      'Provides treatment rankings (P-score, SUCRA) to support clinical decision-making.',
      'Increases precision by borrowing strength from indirect evidence paths.',
      'Can include both direct (head-to-head) and indirect comparisons coherently.'
    ],
    limitations: [
      'Consistency assumption (transitivity) is untestable with indirect evidence only.',
      'Publication bias affects the network and can distort rankings.',
      'Heterogeneity in patient populations across trials may violate transitivity.',
      'Complex statistical models; results sensitive to prior specification in Bayesian NMA.'
    ],
    biases: ['Publication bias', 'Heterogeneity / transitivity violation', 'Small-study effects', 'Outcome reporting bias'],
    danishPharmacoepiNotes: 'NMA is primarily used to synthesise RCT evidence; Danish register studies are typically the input for individual non-randomised nodes in hybrid NMA (combining RCT and observational data). Danish pharmacoepidemiology studies have contributed to NMAs on antidepressants, antidiabetics, and anticoagulants.',
    commonAnalyses: ['Frequentist NMA (netmeta R package)', 'Bayesian NMA (gemtc / BUGS)', 'P-score / SUCRA rankings', 'Node-splitting inconsistency test', 'Comparison-adjusted funnel plot']
  }

];
