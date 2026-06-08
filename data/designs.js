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
      '<title>RCT swimmer plot with randomisation and arm comparison</title>' +
      '<desc>Population feeds into randomisation diamond, branching into treatment and control swimmer lanes, each showing 5 participant timelines. Treatment arm: 1 event/5. Control arm: 3 events/5.</desc>' +

      SVG.txt(200, 10, 'RCT — Randomisation and participant timelines', {size:9, weight:'500'}) +

      /* Population box */
      SVG.box(4, 70, 50, 28, 'Population', 'currentColor') +
      SVG.arrow(54, 84, 70, 84) +

      /* Randomisation diamond */
      '<polygon points="84,72 104,84 84,96 64,84" fill="var(--svg-period)" opacity="0.2" stroke="var(--svg-period)" stroke-width="1.5"/>' +
      SVG.txt(84, 84, 'R', {size:10, fill:'var(--svg-period)', weight:'700'}) +

      /* Branch lines to arms */
      '<line x1="104" y1="84" x2="122" y2="50" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>' +
      '<line x1="104" y1="84" x2="122" y2="118" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>' +

      /* Randomisation vertical dashed line */
      '<line x1="122" y1="16" x2="122" y2="152" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.35"/>' +
      SVG.txt(122, 12, 'Randomise', {size:7, anchor:'middle'}) +

      /* ===== TREATMENT ARM ===== */
      SVG.txt(125, 22, 'Treatment arm', {size:8, fill:'var(--svg-exposed)', anchor:'start', weight:'600'}) +
      /* T1: 122→280, censored */
      '<rect x="122" y="27" width="158" height="7" rx="2" fill="var(--svg-exposed)" opacity="0.35" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<line x1="280" y1="24" x2="280" y2="37" stroke="currentColor" stroke-width="1.5"/><line x1="277" y1="24" x2="283" y2="24" stroke="currentColor" stroke-width="1.5"/>' +
      /* T2: 122→370, censored */
      '<rect x="122" y="36" width="248" height="7" rx="2" fill="var(--svg-exposed)" opacity="0.35" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<line x1="370" y1="33" x2="370" y2="46" stroke="currentColor" stroke-width="1.5"/><line x1="367" y1="33" x2="373" y2="33" stroke="currentColor" stroke-width="1.5"/>' +
      /* T3: 122→210 EVENT */
      '<rect x="122" y="45" width="88" height="7" rx="2" fill="var(--svg-exposed)" opacity="0.35" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<circle cx="210" cy="49" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +
      /* T4: 122→330, censored */
      '<rect x="122" y="54" width="208" height="7" rx="2" fill="var(--svg-exposed)" opacity="0.35" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<line x1="330" y1="51" x2="330" y2="64" stroke="currentColor" stroke-width="1.5"/><line x1="327" y1="51" x2="333" y2="51" stroke="currentColor" stroke-width="1.5"/>' +
      /* T5: 122→310, censored */
      '<rect x="122" y="63" width="188" height="7" rx="2" fill="var(--svg-exposed)" opacity="0.35" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<line x1="310" y1="60" x2="310" y2="73" stroke="currentColor" stroke-width="1.5"/><line x1="307" y1="60" x2="313" y2="60" stroke="currentColor" stroke-width="1.5"/>' +
      SVG.txt(246, 78, '1/5 events', {size:8, fill:'var(--svg-exposed)'}) +

      /* ===== CONTROL ARM ===== */
      SVG.txt(125, 92, 'Control arm', {size:8, fill:'var(--svg-control)', anchor:'start', weight:'600'}) +
      /* C1: 122→170, EVENT */
      '<rect x="122" y="97" width="48" height="7" rx="2" fill="var(--svg-control)" opacity="0.35" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<circle cx="170" cy="101" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +
      /* C2: 122→285, EVENT */
      '<rect x="122" y="106" width="163" height="7" rx="2" fill="var(--svg-control)" opacity="0.35" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<circle cx="285" cy="110" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +
      /* C3: 122→360, censored */
      '<rect x="122" y="115" width="238" height="7" rx="2" fill="var(--svg-control)" opacity="0.35" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<line x1="360" y1="112" x2="360" y2="125" stroke="currentColor" stroke-width="1.5"/><line x1="357" y1="112" x2="363" y2="112" stroke="currentColor" stroke-width="1.5"/>' +
      /* C4: 122→248, EVENT */
      '<rect x="122" y="124" width="126" height="7" rx="2" fill="var(--svg-control)" opacity="0.35" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<circle cx="248" cy="128" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +
      /* C5: 122→320, censored */
      '<rect x="122" y="133" width="198" height="7" rx="2" fill="var(--svg-control)" opacity="0.35" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<line x1="320" y1="130" x2="320" y2="143" stroke="currentColor" stroke-width="1.5"/><line x1="317" y1="130" x2="323" y2="130" stroke="currentColor" stroke-width="1.5"/>' +
      SVG.txt(246, 148, '3/5 events', {size:8, fill:'var(--svg-control)'}) +

      /* Compare event rates arrow */
      SVG.arrow(246, 82, 246, 143, 'currentColor', 'url(#arr)') +
      SVG.txt(260, 113, 'Compare', {size:7, anchor:'start'}) +
      SVG.txt(260, 122, 'event rates', {size:7, anchor:'start'}) +

      /* Time axis */
      SVG.timeAxis(122, 388, 153) +
      SVG.txt(122, 163, '0', {size:7}) +
      SVG.txt(182, 163, '1y', {size:7}) +
      SVG.txt(242, 163, '2y', {size:7}) +
      SVG.txt(302, 163, '3y', {size:7}) +
      SVG.txt(362, 163, '4y', {size:7}) +

      /* Legend */
      '<rect x="4" y="170" width="10" height="5" rx="1" fill="var(--svg-exposed)" opacity="0.5"/>' +
      SVG.txt(17, 175, 'Treatment', {size:7.5, anchor:'start'}) +
      '<rect x="75" y="170" width="10" height="5" rx="1" fill="var(--svg-control)" opacity="0.5"/>' +
      SVG.txt(88, 175, 'Control', {size:7.5, anchor:'start'}) +
      '<circle cx="135" cy="172" r="4" fill="var(--svg-event)" opacity="0.9"/>' +
      SVG.txt(142, 175, 'Event', {size:7.5, anchor:'start'}) +
      '<line x1="185" y1="169" x2="185" y2="177" stroke="currentColor" stroke-width="1.5"/><line x1="182" y1="169" x2="188" y2="169" stroke="currentColor" stroke-width="1.5"/>' +
      SVG.txt(192, 175, 'Censored', {size:7.5, anchor:'start'}),
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
      '<title>Case-control study — individual timelines with lookback windows</title>' +
      '<desc>Cases and controls shown as individual timelines. Index date (disease ascertainment) is a dashed vertical line. Exposure in the lookback window is highlighted in exposed color; cases have red event circles.</desc>' +

      SVG.txt(200, 10, 'Case-control — individual timelines with lookback', {size:9, weight:'500'}) +

      /* Direction of inquiry arrow */
      SVG.arrow(345, 22, 30, 22, 'currentColor', 'url(#arr)') +
      SVG.txt(185, 19, 'Direction of inquiry ←', {size:8}) +

      /* Index date dashed vertical line */
      '<line x1="345" y1="26" x2="345" y2="158" stroke="var(--svg-event)" stroke-width="1.2" stroke-dasharray="4,3" opacity="0.7"/>' +
      SVG.txt(345, 164, 'Index date', {size:7.5, fill:'var(--svg-event)'}) +

      /* ===== CASES ===== */
      SVG.txt(18, 38, 'Cases', {size:8, fill:'var(--svg-event)', anchor:'start', weight:'600'}) +
      SVG.txt(18, 48, '(D+)', {size:7.5, fill:'var(--svg-event)', anchor:'start'}) +

      /* C1: full grey bar x=30→345, exposed from 210→345 */
      '<rect x="30" y="41" width="315" height="8" rx="2" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="0.5"/>' +
      '<rect x="210" y="41" width="135" height="8" rx="2" fill="var(--svg-exposed)" opacity="0.45" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<circle cx="345" cy="45" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +
      /* C2: exposed from 280→345 */
      '<rect x="30" y="56" width="315" height="8" rx="2" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="0.5"/>' +
      '<rect x="280" y="56" width="65" height="8" rx="2" fill="var(--svg-exposed)" opacity="0.45" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<circle cx="345" cy="60" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +
      /* C3: not exposed in lookback */
      '<rect x="30" y="71" width="315" height="8" rx="2" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="0.5"/>' +
      '<circle cx="345" cy="75" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +

      /* Separator */
      '<line x1="25" y1="87" x2="390" y2="87" stroke="currentColor" stroke-width="0.5" stroke-dasharray="4,4" opacity="0.35"/>' +

      /* ===== CONTROLS ===== */
      SVG.txt(18, 99, 'Controls', {size:8, fill:'var(--svg-control)', anchor:'start', weight:'600'}) +
      SVG.txt(18, 109, '(D−)', {size:7.5, fill:'var(--svg-control)', anchor:'start'}) +

      /* Ctrl1: not exposed */
      '<rect x="30" y="92" width="315" height="8" rx="2" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="0.5"/>' +
      /* Ctrl2: exposed from 240→310 */
      '<rect x="30" y="107" width="315" height="8" rx="2" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="0.5"/>' +
      '<rect x="240" y="107" width="70" height="8" rx="2" fill="var(--svg-exposed)" opacity="0.35" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      /* Ctrl3: not exposed */
      '<rect x="30" y="122" width="315" height="8" rx="2" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="0.5"/>' +

      /* Lookback brace annotation */
      '<line x1="30" y1="138" x2="345" y2="138" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>' +
      '<line x1="30" y1="135" x2="30" y2="141" stroke="currentColor" stroke-width="1" opacity="0.5"/>' +
      '<line x1="345" y1="135" x2="345" y2="141" stroke="currentColor" stroke-width="1" opacity="0.5"/>' +
      SVG.txt(187, 148, 'Lookback window — was exposure present?', {size:7.5}) +

      /* Legend */
      '<rect x="5" y="157" width="10" height="5" rx="1" fill="var(--svg-exposed)" opacity="0.5"/>' +
      SVG.txt(18, 163, 'Exposed in lookback', {size:7.5, anchor:'start'}) +
      '<circle cx="135" cy="160" r="4" fill="var(--svg-event)" opacity="0.9"/>' +
      SVG.txt(142, 163, 'Case (D+)', {size:7.5, anchor:'start'}) +
      '<rect x="205" y="157" width="10" height="5" rx="1" fill="currentColor" opacity="0.15"/>' +
      SVG.txt(218, 163, 'Unexposed / Control timeline', {size:7.5, anchor:'start'}),
      175
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
      '<title>Nested case-control — individual timelines with risk-set sampling</title>' +
      '<desc>7 individual timelines from a source cohort. Two cases occur at t1 and t2; controls are sampled from the risk set at each case time, shown as hollow blue diamonds. P6 is not at risk at t1 (already censored).</desc>' +

      SVG.txt(200, 10, 'Nested case-control — risk-set sampling', {size:9, weight:'500'}) +

      /* Entry dashed line */
      '<line x1="50" y1="16" x2="50" y2="140" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.3"/>' +
      SVG.txt(50, 12, 'Entry', {size:7}) +

      /* t1 dashed line at x=200 */
      '<line x1="200" y1="16" x2="200" y2="140" stroke="var(--svg-event)" stroke-width="1.2" stroke-dasharray="4,3" opacity="0.6"/>' +
      SVG.txt(200, 12, 't₁', {size:8, fill:'var(--svg-event)'}) +

      /* t2 dashed line at x=290 */
      '<line x1="290" y1="16" x2="290" y2="140" stroke="var(--svg-event)" stroke-width="1.2" stroke-dasharray="4,3" opacity="0.6"/>' +
      SVG.txt(290, 12, 't₂', {size:8, fill:'var(--svg-event)'}) +

      /* P1: exposed, event (case) at t1=x200 */
      '<rect x="50" y="22" width="150" height="7" rx="2" fill="var(--svg-exposed)" opacity="0.4" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<circle cx="200" cy="26" r="5" fill="var(--svg-event)" opacity="0.9"/>' +
      SVG.txt(46, 28, 'P1', {size:7, anchor:'end'}) +

      /* P2: plain bar 50→290, censored */
      '<rect x="50" y="38" width="240" height="7" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="0.8"/>' +
      '<line x1="290" y1="35" x2="290" y2="48" stroke="currentColor" stroke-width="1.5"/><line x1="287" y1="35" x2="293" y2="35" stroke="currentColor" stroke-width="1.5"/>' +
      SVG.txt(46, 44, 'P2', {size:7, anchor:'end'}) +

      /* P3: plain bar 50→350, censored; hollow blue diamond at t1 (control sampled) */
      '<rect x="50" y="54" width="300" height="7" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="0.8"/>' +
      '<line x1="350" y1="51" x2="350" y2="64" stroke="currentColor" stroke-width="1.5"/><line x1="347" y1="51" x2="353" y2="51" stroke="currentColor" stroke-width="1.5"/>' +
      '<polygon points="200,53 205,58 200,63 195,58" fill="none" stroke="var(--svg-control)" stroke-width="1.5" opacity="0.85"/>' +
      SVG.txt(46, 60, 'P3', {size:7, anchor:'end'}) +

      /* P4: plain bar 50→248, event at 248; hollow diamond at t1 */
      '<rect x="50" y="70" width="198" height="7" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="0.8"/>' +
      '<circle cx="248" cy="74" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +
      '<polygon points="200,69 205,74 200,79 195,74" fill="none" stroke="var(--svg-control)" stroke-width="1.5" opacity="0.85"/>' +
      SVG.txt(46, 76, 'P4', {size:7, anchor:'end'}) +

      /* P5: plain bar 50→320, censored; hollow diamond at t1 */
      '<rect x="50" y="86" width="270" height="7" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="0.8"/>' +
      '<line x1="320" y1="83" x2="320" y2="96" stroke="currentColor" stroke-width="1.5"/><line x1="317" y1="83" x2="323" y2="83" stroke="currentColor" stroke-width="1.5"/>' +
      '<polygon points="200,85 205,90 200,95 195,90" fill="none" stroke="var(--svg-control)" stroke-width="1.5" opacity="0.85"/>' +
      SVG.txt(46, 92, 'P5', {size:7, anchor:'end'}) +

      /* P6: faded bar 50→140, censored — not at risk at t1 */
      '<rect x="50" y="102" width="90" height="7" rx="2" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="0.5" stroke-dasharray="3,2"/>' +
      '<line x1="140" y1="99" x2="140" y2="112" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><line x1="137" y1="99" x2="143" y2="99" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>' +
      SVG.txt(46, 108, 'P6', {size:7, anchor:'end'}) +
      SVG.txt(150, 107, '← not at risk at t₁', {size:7, anchor:'start'}) +

      /* P7: exposed, event (case 2) at t2=290 */
      '<rect x="50" y="118" width="240" height="7" rx="2" fill="var(--svg-exposed)" opacity="0.4" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<circle cx="290" cy="122" r="5" fill="var(--svg-event)" opacity="0.9"/>' +
      SVG.txt(46, 124, 'P7', {size:7, anchor:'end'}) +

      /* Controls sampled at t1 annotation */
      SVG.txt(200, 136, 'Controls from risk set at t₁: P2,P3,P4,P5', {size:7.5, fill:'var(--svg-control)'}) +

      /* Time axis */
      SVG.timeAxis(50, 390, 142) +
      SVG.txt(50, 152, '0', {size:7}) +
      SVG.txt(110, 152, '1y', {size:7}) +
      SVG.txt(170, 152, '2y', {size:7}) +
      SVG.txt(230, 152, '3y', {size:7}) +
      SVG.txt(290, 152, '4y', {size:7}) +
      SVG.txt(350, 152, '5y', {size:7}) +

      /* Legend */
      '<circle cx="5" cy="160" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +
      SVG.txt(13, 163, 'Case event', {size:7.5, anchor:'start'}) +
      '<polygon points="80,158 85,163 80,168 75,163" fill="none" stroke="var(--svg-control)" stroke-width="1.5"/>' +
      SVG.txt(89, 163, 'Control (risk set)', {size:7.5, anchor:'start'}) +
      '<line x1="198" y1="158" x2="198" y2="167" stroke="currentColor" stroke-width="1.5"/><line x1="195" y1="158" x2="201" y2="158" stroke="currentColor" stroke-width="1.5"/>' +
      SVG.txt(205, 163, 'Censored', {size:7.5, anchor:'start'}),
      168
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
      '<title>Case-cohort study — swimmer plot with subcohort and full-cohort cases</title>' +
      '<desc>8 individual timelines. Top 4 rows are subcohort members (blue bars, randomly sampled at baseline). Red event circles appear on whoever experienced events throughout the full cohort. Two converging arrows point to Weighted analysis box.</desc>' +

      SVG.txt(200, 10, 'Case-cohort — subcohort + full-cohort cases', {size:9, weight:'500'}) +

      /* Baseline dashed line */
      '<line x1="55" y1="16" x2="55" y2="148" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.3"/>' +
      SVG.txt(55, 12, 'Baseline', {size:7}) +

      /* === SUBCOHORT bracket === */
      '<line x1="8" y1="20" x2="8" y2="88" stroke="var(--svg-control)" stroke-width="2" opacity="0.5"/>' +
      '<line x1="8" y1="20" x2="13" y2="20" stroke="var(--svg-control)" stroke-width="1.5" opacity="0.5"/>' +
      '<line x1="8" y1="88" x2="13" y2="88" stroke="var(--svg-control)" stroke-width="1.5" opacity="0.5"/>' +
      SVG.txt(3, 54, 'Sub-', {size:7, fill:'var(--svg-control)', anchor:'middle'}) +

      /* S1: subcohort, censored */
      '<rect x="55" y="20" width="255" height="7" rx="2" fill="var(--svg-control)" opacity="0.3" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<line x1="310" y1="17" x2="310" y2="30" stroke="currentColor" stroke-width="1.5"/><line x1="307" y1="17" x2="313" y2="17" stroke="currentColor" stroke-width="1.5"/>' +
      /* S2: subcohort, EVENT */
      '<rect x="55" y="32" width="190" height="7" rx="2" fill="var(--svg-control)" opacity="0.3" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<circle cx="245" cy="36" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +
      /* S3: subcohort, censored */
      '<rect x="55" y="44" width="305" height="7" rx="2" fill="var(--svg-control)" opacity="0.3" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<line x1="360" y1="41" x2="360" y2="54" stroke="currentColor" stroke-width="1.5"/><line x1="357" y1="41" x2="363" y2="41" stroke="currentColor" stroke-width="1.5"/>' +
      /* S4: subcohort, EVENT */
      '<rect x="55" y="56" width="145" height="7" rx="2" fill="var(--svg-control)" opacity="0.3" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<circle cx="200" cy="60" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +

      /* Separator */
      '<line x1="50" y1="72" x2="392" y2="72" stroke="currentColor" stroke-width="0.5" stroke-dasharray="3,3" opacity="0.3"/>' +

      /* === NON-SUBCOHORT (full cohort only) === */
      SVG.txt(3, 108, 'Full', {size:7, anchor:'middle'}) +
      /* F5: non-subcohort, EVENT (case) */
      '<rect x="55" y="76" width="220" height="7" rx="2" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="0.5"/>' +
      '<circle cx="275" cy="80" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +
      /* F6: non-subcohort, censored */
      '<rect x="55" y="88" width="280" height="7" rx="2" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="0.5"/>' +
      '<line x1="335" y1="85" x2="335" y2="98" stroke="currentColor" stroke-width="1.5"/><line x1="332" y1="85" x2="338" y2="85" stroke="currentColor" stroke-width="1.5"/>' +
      /* F7: non-subcohort, EVENT (case) */
      '<rect x="55" y="100" width="155" height="7" rx="2" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="0.5"/>' +
      '<circle cx="210" cy="104" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +
      /* F8: non-subcohort, censored */
      '<rect x="55" y="112" width="330" height="7" rx="2" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="0.5"/>' +
      '<line x1="385" y1="109" x2="385" y2="122" stroke="currentColor" stroke-width="1.5"/><line x1="382" y1="109" x2="388" y2="109" stroke="currentColor" stroke-width="1.5"/>' +

      /* Annotations */
      SVG.txt(200, 126, 'Subcohort (random sample)', {size:7.5, fill:'var(--svg-control)', anchor:'middle'}) +
      SVG.txt(200, 134, '+ Cases from full cohort (all included)', {size:7.5, fill:'var(--svg-event)', anchor:'middle'}) +

      /* Arrows to weighted analysis */
      SVG.arrow(145, 135, 185, 149, 'var(--svg-control)', 'url(#arr-ctrl)') +
      SVG.arrow(255, 135, 218, 149, 'var(--svg-event)', 'url(#arr-ev)') +
      SVG.box(155, 150, 90, 20, 'Weighted analysis', 'currentColor') +

      /* Legend */
      '<rect x="5" y="162" width="9" height="5" rx="1" fill="var(--svg-control)" opacity="0.4"/>' +
      SVG.txt(17, 167, 'Subcohort', {size:7.5, anchor:'start'}) +
      '<circle cx="75" cy="164" r="4" fill="var(--svg-event)" opacity="0.9"/>' +
      SVG.txt(83, 167, 'Case event', {size:7.5, anchor:'start'}) +
      '<line x1="147" y1="161" x2="147" y2="169" stroke="currentColor" stroke-width="1.5"/><line x1="144" y1="161" x2="150" y2="161" stroke="currentColor" stroke-width="1.5"/>' +
      SVG.txt(154, 167, 'Censored', {size:7.5, anchor:'start'}),
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
      '<title>SCCS — three individual timelines showing control and risk periods</title>' +
      '<desc>3 persons each with their own timeline row. Each row shows control period (blue), exposure tick, risk period (orange/exposed), optional outcome, then control period again. Each person is their own control.</desc>' +

      SVG.txt(200, 10, 'SCCS — each person is their own control', {size:9, weight:'500'}) +

      /* ===== PERSON 1 ===== */
      SVG.txt(26, 46, 'P1', {size:7.5, anchor:'end'}) +
      /* control before */
      '<rect x="30" y="37" width="100" height="14" rx="3" fill="var(--svg-control)" opacity="0.2" stroke="var(--svg-control)" stroke-width="1"/>' +
      SVG.txt(80, 46, 'Control', {size:7.5, fill:'var(--svg-control)'}) +
      /* exposure tick at x=130 */
      '<line x1="130" y1="30" x2="130" y2="58" stroke="var(--svg-exposed)" stroke-width="2"/>' +
      '<circle cx="130" cy="37" r="3.5" fill="var(--svg-exposed)" opacity="0.9"/>' +
      SVG.txt(130, 27, '↓ Exp', {size:7, fill:'var(--svg-exposed)'}) +
      /* risk period */
      '<rect x="130" y="37" width="90" height="14" rx="0" fill="var(--svg-exposed)" opacity="0.2" stroke="var(--svg-exposed)" stroke-width="1"/>' +
      SVG.txt(175, 46, 'Risk', {size:7.5, fill:'var(--svg-exposed)', weight:'500'}) +
      /* outcome at x=180 */
      '<circle cx="180" cy="44" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +
      /* control after */
      '<rect x="220" y="37" width="150" height="14" rx="3" fill="var(--svg-control)" opacity="0.2" stroke="var(--svg-control)" stroke-width="1"/>' +
      SVG.txt(295, 46, 'Control', {size:7.5, fill:'var(--svg-control)'}) +

      /* ===== PERSON 2 ===== */
      SVG.txt(26, 104, 'P2', {size:7.5, anchor:'end'}) +
      '<rect x="30" y="95" width="160" height="14" rx="3" fill="var(--svg-control)" opacity="0.2" stroke="var(--svg-control)" stroke-width="1"/>' +
      SVG.txt(110, 104, 'Control', {size:7.5, fill:'var(--svg-control)'}) +
      '<line x1="190" y1="88" x2="190" y2="116" stroke="var(--svg-exposed)" stroke-width="2"/>' +
      '<circle cx="190" cy="95" r="3.5" fill="var(--svg-exposed)" opacity="0.9"/>' +
      SVG.txt(190, 85, '↓ Exp', {size:7, fill:'var(--svg-exposed)'}) +
      '<rect x="190" y="95" width="80" height="14" rx="0" fill="var(--svg-exposed)" opacity="0.2" stroke="var(--svg-exposed)" stroke-width="1"/>' +
      SVG.txt(230, 104, 'Risk', {size:7.5, fill:'var(--svg-exposed)', weight:'500'}) +
      '<circle cx="240" cy="102" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +
      '<rect x="270" y="95" width="100" height="14" rx="3" fill="var(--svg-control)" opacity="0.2" stroke="var(--svg-control)" stroke-width="1"/>' +
      SVG.txt(320, 104, 'Control', {size:7.5, fill:'var(--svg-control)'}) +

      /* ===== PERSON 3 ===== */
      SVG.txt(26, 162, 'P3', {size:7.5, anchor:'end'}) +
      '<rect x="30" y="153" width="70" height="14" rx="3" fill="var(--svg-control)" opacity="0.2" stroke="var(--svg-control)" stroke-width="1"/>' +
      SVG.txt(65, 162, 'Ctrl', {size:7.5, fill:'var(--svg-control)'}) +
      '<line x1="100" y1="146" x2="100" y2="174" stroke="var(--svg-exposed)" stroke-width="2"/>' +
      '<circle cx="100" cy="153" r="3.5" fill="var(--svg-exposed)" opacity="0.9"/>' +
      SVG.txt(100, 143, '↓ Exp', {size:7, fill:'var(--svg-exposed)'}) +
      '<rect x="100" y="153" width="80" height="14" rx="0" fill="var(--svg-exposed)" opacity="0.2" stroke="var(--svg-exposed)" stroke-width="1"/>' +
      SVG.txt(140, 162, 'Risk', {size:7.5, fill:'var(--svg-exposed)', weight:'500'}) +
      SVG.txt(145, 172, 'no event', {size:6.5, fill:'currentColor'}) +
      '<rect x="180" y="153" width="190" height="14" rx="3" fill="var(--svg-control)" opacity="0.2" stroke="var(--svg-control)" stroke-width="1"/>' +
      SVG.txt(275, 162, 'Control', {size:7.5, fill:'var(--svg-control)'}) +

      /* IRR formula */
      SVG.txt(200, 183, 'IRR = events in risk period/risk time  ÷  events in control period/control time', {size:7.5}),
      195
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
      '<title>Case-crossover design — single person timeline with reference and hazard periods</title>' +
      '<desc>Single case timeline with 3 time blocks: two reference periods and one hazard period. Drug dispensing ticks shown above. Event circle at end of hazard period. Question at bottom.</desc>' +

      SVG.txt(200, 10, 'Case-crossover — single patient timeline', {size:9, weight:'500'}) +
      SVG.txt(200, 21, 'Same individual throughout — fixed confounders cancel', {size:8}) +

      /* ===== BLOCK 1: Reference period 1 ===== */
      '<rect x="20" y="32" width="120" height="65" rx="6" fill="var(--svg-control)" opacity="0.12" stroke="var(--svg-control)" stroke-width="1.5" stroke-dasharray="5,3"/>' +
      SVG.txt(80, 52, 'Reference', {size:8.5, fill:'var(--svg-control)', weight:'600'}) +
      SVG.txt(80, 63, 'period 1', {size:8, fill:'var(--svg-control)'}) +
      /* No drug in this period — grey bar */
      '<rect x="28" y="72" width="104" height="8" rx="3" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="0.5"/>' +
      SVG.txt(80, 88, 'No drug exposure', {size:7.5}) +

      /* ===== BLOCK 2: Reference period 2 ===== */
      '<rect x="155" y="32" width="120" height="65" rx="6" fill="var(--svg-control)" opacity="0.12" stroke="var(--svg-control)" stroke-width="1.5" stroke-dasharray="5,3"/>' +
      SVG.txt(215, 52, 'Reference', {size:8.5, fill:'var(--svg-control)', weight:'600'}) +
      SVG.txt(215, 63, 'period 2', {size:8, fill:'var(--svg-control)'}) +
      /* Brief drug exposure as orange bar */
      '<rect x="175" y="72" width="35" height="8" rx="3" fill="var(--svg-exposed)" opacity="0.45" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      SVG.txt(215, 88, 'Brief exposure', {size:7.5}) +
      /* Dispensed tick above */
      '<line x1="192" y1="29" x2="192" y2="36" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      SVG.txt(192, 27, '↑ Rx', {size:7, fill:'var(--svg-exposed)'}) +

      /* ===== BLOCK 3: Hazard period ===== */
      '<rect x="290" y="32" width="85" height="65" rx="6" fill="var(--svg-exposed)" opacity="0.2" stroke="var(--svg-exposed)" stroke-width="2"/>' +
      SVG.txt(332, 52, 'Hazard', {size:8.5, fill:'var(--svg-exposed)', weight:'600'}) +
      SVG.txt(332, 63, 'period', {size:8, fill:'var(--svg-exposed)'}) +
      /* Drug exposure filling hazard period */
      '<rect x="295" y="72" width="72" height="8" rx="3" fill="var(--svg-exposed)" opacity="0.55" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      SVG.txt(332, 88, 'Drug exposed', {size:7.5, fill:'var(--svg-exposed)'}) +
      /* Dispensed tick above */
      '<line x1="295" y1="29" x2="295" y2="36" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      SVG.txt(295, 27, '↑ Rx', {size:7, fill:'var(--svg-exposed)'}) +
      /* Event circle at end of hazard period */
      '<circle cx="362" cy="65" r="6" fill="var(--svg-event)" opacity="0.9"/>' +
      SVG.txt(362, 104, 'Event', {size:8, fill:'var(--svg-event)', weight:'500'}) +

      /* Timeline axis */
      SVG.arrow(18, 108, 385, 108) +
      SVG.txt(200, 119, 'Time →', {size:8}) +

      /* Person bracket */
      '<line x1="20" y1="28" x2="375" y2="28" stroke="currentColor" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.35"/>' +

      /* Comparison question */
      '<rect x="10" y="125" width="380" height="22" rx="4" fill="currentColor" opacity="0.04"/>' +
      SVG.txt(200, 133, 'Compare: was person MORE exposed in hazard period than reference?', {size:8}) +
      SVG.txt(200, 143, 'Self-matched → fixed confounders eliminated', {size:7.5}),
      175
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
      '<title>PSSA — 5 patient timelines showing prescription sequences</title>' +
      '<desc>5 patient rows each showing Drug A (orange circle) and Drug B (blue circle) prescription events with arrow between. Count summary: n(A→B)=4, n(B→A)=1, SR=4.0.</desc>' +

      SVG.txt(200, 10, 'PSSA — prescription sequence symmetry', {size:9, weight:'500'}) +

      SVG.txt(55, 21, 'Drug A', {size:8, fill:'var(--svg-exposed)', weight:'600'}) +
      SVG.txt(185, 21, 'Drug B', {size:8, fill:'var(--svg-control)', weight:'600'}) +
      SVG.txt(310, 21, 'Sequence', {size:8, weight:'600'}) +

      /* Patient 1: A→B */
      SVG.txt(12, 38, 'Pt 1', {size:7.5, anchor:'end'}) +
      '<line x1="14" y1="30" x2="380" y2="30" stroke="currentColor" stroke-width="0.4" opacity="0.2"/>' +
      '<circle cx="60" cy="34" r="6" fill="var(--svg-exposed)" opacity="0.8"/>' +
      SVG.arrow(68, 34, 152, 34, 'currentColor', 'url(#arr)') +
      '<circle cx="160" cy="34" r="6" fill="var(--svg-control)" opacity="0.8"/>' +
      SVG.txt(310, 38, 'A→B ✓', {size:8, fill:'var(--svg-exposed)'}) +

      /* Patient 2: A→B */
      SVG.txt(12, 56, 'Pt 2', {size:7.5, anchor:'end'}) +
      '<line x1="14" y1="48" x2="380" y2="48" stroke="currentColor" stroke-width="0.4" opacity="0.2"/>' +
      '<circle cx="80" cy="52" r="6" fill="var(--svg-exposed)" opacity="0.8"/>' +
      SVG.arrow(88, 52, 192, 52, 'currentColor', 'url(#arr)') +
      '<circle cx="200" cy="52" r="6" fill="var(--svg-control)" opacity="0.8"/>' +
      SVG.txt(310, 56, 'A→B ✓', {size:8, fill:'var(--svg-exposed)'}) +

      /* Patient 3: A→B */
      SVG.txt(12, 74, 'Pt 3', {size:7.5, anchor:'end'}) +
      '<line x1="14" y1="66" x2="380" y2="66" stroke="currentColor" stroke-width="0.4" opacity="0.2"/>' +
      '<circle cx="100" cy="70" r="6" fill="var(--svg-exposed)" opacity="0.8"/>' +
      SVG.arrow(108, 70, 172, 70, 'currentColor', 'url(#arr)') +
      '<circle cx="180" cy="70" r="6" fill="var(--svg-control)" opacity="0.8"/>' +
      SVG.txt(310, 74, 'A→B ✓', {size:8, fill:'var(--svg-exposed)'}) +

      /* Patient 4: B→A */
      SVG.txt(12, 92, 'Pt 4', {size:7.5, anchor:'end'}) +
      '<line x1="14" y1="84" x2="380" y2="84" stroke="currentColor" stroke-width="0.4" opacity="0.2"/>' +
      '<circle cx="70" cy="88" r="6" fill="var(--svg-control)" opacity="0.8"/>' +
      SVG.arrow(78, 88, 182, 88, 'currentColor', 'url(#arr)') +
      '<circle cx="190" cy="88" r="6" fill="var(--svg-exposed)" opacity="0.8"/>' +
      SVG.txt(310, 92, 'B→A ✗', {size:8, fill:'var(--svg-control)'}) +

      /* Patient 5: A→B */
      SVG.txt(12, 110, 'Pt 5', {size:7.5, anchor:'end'}) +
      '<line x1="14" y1="102" x2="380" y2="102" stroke="currentColor" stroke-width="0.4" opacity="0.2"/>' +
      '<circle cx="90" cy="106" r="6" fill="var(--svg-exposed)" opacity="0.8"/>' +
      SVG.arrow(98, 106, 212, 106, 'currentColor', 'url(#arr)') +
      '<circle cx="220" cy="106" r="6" fill="var(--svg-control)" opacity="0.8"/>' +
      SVG.txt(310, 110, 'A→B ✓', {size:8, fill:'var(--svg-exposed)'}) +

      /* Count summary box */
      '<rect x="10" y="120" width="260" height="36" rx="5" fill="currentColor" opacity="0.04" stroke="currentColor" stroke-width="0.5"/>' +
      SVG.txt(140, 132, 'n(A→B) = 4    n(B→A) = 1', {size:8.5, weight:'500'}) +
      SVG.txt(140, 146, 'Crude SR = 4/1 = 4.0   (SR > 1: A→B disproportionate)', {size:7.5}) +

      /* SR box */
      '<rect x="285" y="120" width="105" height="36" rx="5" fill="var(--svg-exposed)" opacity="0.15" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      SVG.txt(337, 132, 'SR = 4.0', {size:12, fill:'var(--svg-exposed)', weight:'700'}) +
      SVG.txt(337, 148, 'Signal detected', {size:7.5, fill:'var(--svg-exposed)'}) +

      /* Legend */
      '<circle cx="10" cy="165" r="5" fill="var(--svg-exposed)" opacity="0.8"/>' +
      SVG.txt(18, 168, 'Drug A', {size:7.5, anchor:'start', fill:'var(--svg-exposed)'}) +
      '<circle cx="60" cy="165" r="5" fill="var(--svg-control)" opacity="0.8"/>' +
      SVG.txt(68, 168, 'Drug B', {size:7.5, anchor:'start', fill:'var(--svg-control)'}) +
      SVG.txt(135, 168, 'SR = n(A→B) / n(B→A);  SR>1 if A causes B', {size:7.5}),
      185
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
      '<title>ACNU design — swimlane timelines from first dispensing</title>' +
      '<desc>Washout period shown left of index date (grayed). Index date (first dispensing) as dashed vertical line. Drug of interest group (3 exposed bars) and active comparator group (3 control bars) followed post-index with events.</desc>' +

      SVG.txt(200, 10, 'Active Comparator New-User (ACNU) design', {size:9, weight:'500'}) +

      /* Washout period shaded region */
      '<rect x="10" y="18" width="90" height="140" rx="4" fill="currentColor" opacity="0.04" stroke="currentColor" stroke-width="0.5" stroke-dasharray="4,3"/>' +
      SVG.txt(55, 32, 'Washout', {size:8, weight:'500'}) +
      SVG.txt(55, 43, 'period', {size:7.5}) +
      SVG.txt(55, 54, '(prevalent', {size:7}) +
      SVG.txt(55, 63, 'users', {size:7}) +
      SVG.txt(55, 72, 'excluded)', {size:7}) +

      /* Index date dashed vertical line */
      '<line x1="100" y1="15" x2="100" y2="158" stroke="var(--svg-period)" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.7"/>' +
      SVG.txt(100, 12, 'Time zero', {size:7.5, fill:'var(--svg-period)'}) +
      SVG.txt(100, 163, '1st dispense', {size:7, fill:'var(--svg-period)'}) +

      /* ===== Drug of interest arm ===== */
      SVG.txt(98, 28, 'Drug of interest', {size:8, fill:'var(--svg-exposed)', anchor:'end', weight:'600'}) +

      /* D1: bar 100→295 (3.2y), event */
      '<rect x="100" y="32" width="195" height="8" rx="2" fill="var(--svg-exposed)" opacity="0.35" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<circle cx="295" cy="36" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +
      /* D2: bar 100→360 (4.3y), censored */
      '<rect x="100" y="44" width="260" height="8" rx="2" fill="var(--svg-exposed)" opacity="0.35" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<line x1="360" y1="41" x2="360" y2="55" stroke="currentColor" stroke-width="1.5"/><line x1="357" y1="41" x2="363" y2="41" stroke="currentColor" stroke-width="1.5"/>' +
      /* D3: bar 100→230 (2.2y), censored */
      '<rect x="100" y="56" width="130" height="8" rx="2" fill="var(--svg-exposed)" opacity="0.35" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<line x1="230" y1="53" x2="230" y2="67" stroke="currentColor" stroke-width="1.5"/><line x1="227" y1="53" x2="233" y2="53" stroke="currentColor" stroke-width="1.5"/>' +

      /* Separator */
      '<line x1="95" y1="75" x2="395" y2="75" stroke="currentColor" stroke-width="0.5" stroke-dasharray="3,3" opacity="0.3"/>' +

      /* ===== Active comparator arm ===== */
      SVG.txt(98, 90, 'Active comparator', {size:8, fill:'var(--svg-control)', anchor:'end', weight:'600'}) +

      /* C1: bar 100→185 (1.4y), event */
      '<rect x="100" y="80" width="85" height="8" rx="2" fill="var(--svg-control)" opacity="0.35" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<circle cx="185" cy="84" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +
      /* C2: bar 100→340 (4.0y), censored */
      '<rect x="100" y="92" width="240" height="8" rx="2" fill="var(--svg-control)" opacity="0.35" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<line x1="340" y1="89" x2="340" y2="103" stroke="currentColor" stroke-width="1.5"/><line x1="337" y1="89" x2="343" y2="89" stroke="currentColor" stroke-width="1.5"/>' +
      /* C3: bar 100→260 (2.4y), censored */
      '<rect x="100" y="104" width="160" height="8" rx="2" fill="var(--svg-control)" opacity="0.35" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<line x1="260" y1="101" x2="260" y2="115" stroke="currentColor" stroke-width="1.5"/><line x1="257" y1="101" x2="263" y2="101" stroke="currentColor" stroke-width="1.5"/>' +

      /* Time axis */
      SVG.timeAxis(100, 392, 122) +
      SVG.txt(100, 132, '0', {size:7}) +
      SVG.txt(160, 132, '1y', {size:7}) +
      SVG.txt(220, 132, '2y', {size:7}) +
      SVG.txt(280, 132, '3y', {size:7}) +
      SVG.txt(340, 132, '4y', {size:7}) +

      /* Key note */
      '<rect x="10" y="140" width="380" height="22" rx="4" fill="var(--svg-exposed)" opacity="0.05"/>' +
      SVG.txt(200, 150, 'New-user design: no prior use before index date (washout confirmed)', {size:7.5}) +
      SVG.txt(200, 160, 'Active comparator: same indication → confounding by indication reduced', {size:7.5}),
      175
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
      '<title>Target trial emulation — protocol mapping with specific content</title>' +
      '<desc>Two panels side by side. Left: Hypothetical Trial Protocol with eligibility, treatment, assignment, outcome, and follow-up. Right: Register Emulation with corresponding specific methods. Arrows connect each row.</desc>' +

      SVG.txt(200, 10, 'Target Trial Emulation — protocol mapping', {size:9, weight:'500'}) +

      /* Left panel */
      '<rect x="8" y="17" width="178" height="148" rx="6" fill="currentColor" opacity="0.04" stroke="currentColor" stroke-width="1"/>' +
      SVG.txt(97, 28, 'Hypothetical Trial Protocol', {size:8, weight:'600'}) +

      SVG.box(14, 33, 166, 22, 'Eligibility: new users, age ≥40, no prior CVD', 'var(--svg-exposed)') +
      SVG.box(14, 60, 166, 22, 'Treatment: Drug A vs Drug B', 'var(--svg-exposed)') +
      SVG.box(14, 87, 166, 22, 'Assignment: Random allocation', 'var(--svg-exposed)') +
      SVG.box(14, 114, 166, 22, 'Outcome: Fatal/non-fatal MI', 'var(--svg-exposed)') +
      SVG.box(14, 141, 166, 18, 'Follow-up: 36 months, ITT', 'var(--svg-exposed)') +

      /* Connecting arrows */
      SVG.arrow(180, 44, 214, 44) +
      SVG.arrow(180, 71, 214, 71) +
      SVG.arrow(180, 98, 214, 98) +
      SVG.arrow(180, 125, 214, 125) +
      SVG.arrow(180, 150, 214, 150) +

      /* Right panel */
      '<rect x="214" y="17" width="178" height="148" rx="6" fill="var(--svg-control)" opacity="0.06" stroke="var(--svg-control)" stroke-width="1"/>' +
      SVG.txt(303, 28, 'Register Emulation', {size:8, weight:'600'}) +

      SVG.box(220, 33, 166, 22, 'LPDB + CPR + IHD algorithm', 'var(--svg-control)') +
      SVG.box(220, 60, 166, 22, 'First ATC dispense (new-user design)', 'var(--svg-control)') +
      SVG.box(220, 87, 166, 22, 'IPTW / PS matching', 'var(--svg-control)') +
      SVG.box(220, 114, 166, 22, 'LPR code I21 (AMI)', 'var(--svg-control)') +
      SVG.box(220, 141, 166, 18, 'Clone-censor-weight', 'var(--svg-control)'),
      175
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
      '<title>IV DAG with concrete labels and exclusion restriction cross-path</title>' +
      '<desc>DAG with Z = prescriber preference, X = Drug A exposure, Y = outcome. U = unmeasured confounders. Crossed arrow shows exclusion restriction (no direct Z to Y). Assumptions listed at bottom.</desc>' +

      /* Nodes with concrete labels */
      SVG.node(70,  78, 28, 'Z', 'var(--svg-period)') +
      SVG.node(200, 78, 28, 'X', 'var(--svg-exposed)') +
      SVG.node(330, 78, 28, 'Y', 'var(--svg-event)') +
      SVG.node(200, 20, 20, 'U', 'currentColor') +

      /* Arrows */
      SVG.arrow(98, 78, 168, 78, 'var(--svg-period)', 'url(#arr)') +
      SVG.arrow(228, 78, 298, 78, 'var(--svg-exposed)', 'url(#arr-exp)') +

      /* U to X and Y (confounding) */
      '<line x1="185" y1="38" x2="118" y2="63" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.6" marker-end="url(#arr)"/>' +
      '<line x1="215" y1="38" x2="282" y2="63" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.6" marker-end="url(#arr)"/>' +

      /* Crossed Z→Y path (exclusion restriction) */
      '<line x1="92" y1="62" x2="315" y2="62" stroke="var(--svg-event)" stroke-width="1" stroke-dasharray="4,3" opacity="0.35"/>' +
      /* Cross mark */
      '<line x1="195" y1="56" x2="205" y2="68" stroke="var(--svg-event)" stroke-width="2" opacity="0.8"/>' +
      '<line x1="205" y1="56" x2="195" y2="68" stroke="var(--svg-event)" stroke-width="2" opacity="0.8"/>' +
      SVG.txt(200, 53, 'no direct Z→Y', {size:7.5, fill:'var(--svg-event)'}) +

      /* Concrete labels below nodes */
      SVG.txt(70,  115, 'Prescriber pref.', {size:7.5, fill:'var(--svg-period)', weight:'500'}) +
      SVG.txt(70,  125, '(% prescribing', {size:7, fill:'var(--svg-period)'}) +
      SVG.txt(70,  134, 'Drug A)', {size:7, fill:'var(--svg-period)'}) +
      SVG.txt(200, 115, 'Drug A exposure', {size:7.5, fill:'var(--svg-exposed)', weight:'500'}) +
      SVG.txt(330, 115, 'Outcome', {size:7.5, fill:'var(--svg-event)', weight:'500'}) +
      SVG.txt(330, 125, '(event)', {size:7, fill:'var(--svg-event)'}) +
      SVG.txt(200, 9,  'Unmeasured confounders', {size:7.5}) +
      SVG.txt(200, 18, '(disease severity)', {size:7}) +

      /* IV assumptions footer */
      '<rect x="8" y="142" width="384" height="28" rx="4" fill="var(--svg-period)" opacity="0.07"/>' +
      SVG.txt(200, 151, 'IV assumptions:', {size:8, weight:'600'}) +
      SVG.txt(200, 161, '(1) Z→X relevance  (2) Z⊥U independence  (3) Z→Y only via X (exclusion restriction)', {size:7.5}),
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
      '<title>DiD/ITS — improved time series with grid, CI shading, and DiD annotation</title>' +
      '<desc>Two time series with grid lines. Pre-period parallel trends. Post-period divergence with CI shading around treated trend. DiD brace shows -0.8 per 100 annotation. ITS slope label shown.</desc>' +

      /* Axes */
      '<line x1="48" y1="18" x2="48" y2="143" stroke="currentColor" stroke-width="1.5"/>' +
      '<line x1="48" y1="143" x2="388" y2="143" stroke="currentColor" stroke-width="1.5" marker-end="url(#arr)"/>' +
      SVG.txt(218, 157, 'Time →', {size:9}) +
      '<text x="30" y="82" text-anchor="middle" font-size="9" fill="currentColor" transform="rotate(-90,30,82)">Outcome rate</text>' +

      /* Horizontal grid lines */
      '<line x1="48" y1="40" x2="385" y2="40" stroke="currentColor" stroke-width="0.5" opacity="0.15"/>' +
      '<line x1="48" y1="65" x2="385" y2="65" stroke="currentColor" stroke-width="0.5" opacity="0.15"/>' +
      '<line x1="48" y1="90" x2="385" y2="90" stroke="currentColor" stroke-width="0.5" opacity="0.15"/>' +
      '<line x1="48" y1="115" x2="385" y2="115" stroke="currentColor" stroke-width="0.5" opacity="0.15"/>' +

      /* Intervention line */
      '<line x1="210" y1="16" x2="210" y2="145" stroke="var(--svg-event)" stroke-width="1.5" stroke-dasharray="5,3"/>' +
      SVG.txt(210, 11, 'Intervention', {size:8.5, fill:'var(--svg-event)', weight:'500'}) +

      /* Treated group pre (clear downward slope) */
      '<polyline points="58,112 210,90" stroke="var(--svg-exposed)" stroke-width="2.2" fill="none"/>' +
      /* Treated group post (steeper descent) */
      '<polyline points="210,90 210,58 375,40" stroke="var(--svg-exposed)" stroke-width="2.2" fill="none"/>' +
      SVG.txt(377, 40, 'Treated', {size:8.5, fill:'var(--svg-exposed)', anchor:'start', weight:'600'}) +

      /* CI shading around treated post-trend */
      '<polygon points="210,50 375,30 375,50 210,66" fill="var(--svg-exposed)" opacity="0.1" stroke="none"/>' +

      /* Control group: pre parallel slope, post similar slope */
      '<polyline points="58,118 210,96 210,96 375,80" stroke="var(--svg-control)" stroke-width="2" fill="none" stroke-dasharray="7,4"/>' +
      SVG.txt(377, 80, 'Control', {size:8.5, fill:'var(--svg-control)', anchor:'start', weight:'600'}) +

      /* Counterfactual for treated */
      '<polyline points="210,90 375,74" stroke="var(--svg-exposed)" stroke-width="1.2" fill="none" stroke-dasharray="3,3" opacity="0.5"/>' +
      SVG.txt(290, 62, 'Counterfactual', {size:7.5, fill:'var(--svg-exposed)'}) +

      /* DiD brace */
      '<line x1="375" y1="40" x2="375" y2="74" stroke="currentColor" stroke-width="1.2" opacity="0.7"/>' +
      '<line x1="372" y1="40" x2="378" y2="40" stroke="currentColor" stroke-width="1" opacity="0.7"/>' +
      '<line x1="372" y1="74" x2="378" y2="74" stroke="currentColor" stroke-width="1" opacity="0.7"/>' +
      SVG.txt(378, 57, 'DiD =', {size:8, anchor:'start', weight:'600'}) +
      SVG.txt(378, 67, '−0.8/100', {size:8, anchor:'start', fill:'var(--svg-event)', weight:'600'}) +

      /* ITS slope change label */
      SVG.txt(240, 80, '↑ slope change (ITS)', {size:7.5, anchor:'start'}) +

      /* Notes */
      SVG.txt(218, 128, 'ITS: level shift + slope change at intervention', {size:7.5}) +
      SVG.txt(218, 138, 'DiD: parallel trends assumption required pre-intervention', {size:7.5}),
      175
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
      '<title>PCT vs Explanatory RCT — eligibility funnel comparison</title>' +
      '<desc>Side-by-side comparison: PCT funnel (wide, almost everyone eligible) vs Explanatory RCT funnel (narrow, strict criteria). PCT shows diverse patients, flexible treatment, routine outcomes.</desc>' +

      SVG.txt(200, 10, 'PCT vs Explanatory RCT — eligibility comparison', {size:9, weight:'500'}) +

      /* ===== LEFT: PCT ===== */
      SVG.txt(95, 22, 'Pragmatic CT', {size:9, fill:'var(--svg-exposed)', weight:'600'}) +

      /* Wide funnel */
      '<polygon points="15,28 175,28 145,60 45,60" fill="var(--svg-exposed)" opacity="0.1" stroke="var(--svg-exposed)" stroke-width="1"/>' +
      SVG.txt(95, 46, 'Broad population', {size:8}) +
      SVG.txt(95, 55, 'Few exclusions', {size:7.5}) +
      SVG.arrow(95, 60, 95, 76) +

      SVG.box(45, 76, 100, 18, 'Randomise', 'currentColor') +
      '<line x1="45" y1="85" x2="30" y2="100" stroke="currentColor" stroke-width="1.2"/>' +
      '<line x1="145" y1="85" x2="160" y2="100" stroke="currentColor" stroke-width="1.2"/>' +
      SVG.box(15, 100, 65, 16, 'Arm A', 'var(--svg-exposed)') +
      SVG.box(110, 100, 65, 16, 'Arm B', 'var(--svg-control)') +
      SVG.arrow(47, 116, 47, 130, 'var(--svg-exposed)', 'url(#arr-exp)') +
      SVG.arrow(142, 116, 142, 130, 'var(--svg-control)', 'url(#arr-ctrl)') +
      SVG.box(15, 130, 65, 16, 'Routine outcome', 'var(--svg-event)') +
      SVG.box(110, 130, 65, 16, 'Routine outcome', 'var(--svg-event)') +

      /* PCT features */
      SVG.txt(95, 155, 'Flexible dose · routine care', {size:7.5}) +
      SVG.txt(95, 165, 'High external validity', {size:7.5, fill:'var(--svg-exposed)'}) +

      /* Divider */
      '<line x1="200" y1="18" x2="200" y2="178" stroke="currentColor" stroke-width="0.8" opacity="0.3"/>' +

      /* ===== RIGHT: Explanatory RCT ===== */
      SVG.txt(302, 22, 'Explanatory RCT', {size:9, fill:'var(--svg-control)', weight:'600'}) +

      /* Narrow funnel */
      '<polygon points="225,28 385,28 310,60 300,60" fill="var(--svg-control)" opacity="0.1" stroke="var(--svg-control)" stroke-width="1"/>' +
      SVG.txt(305, 46, 'Strict criteria', {size:8}) +
      SVG.txt(305, 55, 'Many exclusions', {size:7.5}) +
      SVG.arrow(305, 60, 305, 76) +

      SVG.box(255, 76, 100, 18, 'Randomise', 'currentColor') +
      '<line x1="255" y1="85" x2="240" y2="100" stroke="currentColor" stroke-width="1.2"/>' +
      '<line x1="355" y1="85" x2="370" y2="100" stroke="currentColor" stroke-width="1.2"/>' +
      SVG.box(225, 100, 65, 16, 'Arm A', 'var(--svg-exposed)') +
      SVG.box(320, 100, 65, 16, 'Arm B', 'var(--svg-control)') +
      SVG.arrow(257, 116, 257, 130, 'var(--svg-exposed)', 'url(#arr-exp)') +
      SVG.arrow(352, 116, 352, 130, 'var(--svg-control)', 'url(#arr-ctrl)') +
      SVG.box(225, 130, 65, 16, 'Protocol outcome', 'var(--svg-event)') +
      SVG.box(320, 130, 65, 16, 'Protocol outcome', 'var(--svg-event)') +

      /* Expl RCT features */
      SVG.txt(305, 155, 'Fixed dose · strict protocol', {size:7.5}) +
      SVG.txt(305, 165, 'High internal validity', {size:7.5, fill:'var(--svg-control)'}),
      185
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
      '<title>CRT — before/after randomisation showing GP practice clusters</title>' +
      '<desc>Left panel: before randomisation, patients mixed. Right panel: after randomisation, patients grouped into GP practice clusters, intervention clusters highlighted. Randomisation arrow points to whole cluster.</desc>' +

      SVG.txt(200, 10, 'CRT — cluster-level randomisation (GP practices)', {size:9, weight:'500'}) +

      /* ===== LEFT: Before randomisation ===== */
      SVG.txt(95, 22, 'Before randomisation', {size:8, weight:'600'}) +
      '<rect x="12" y="27" width="170" height="100" rx="6" fill="currentColor" opacity="0.04" stroke="currentColor" stroke-width="1"/>' +
      /* Mixed patients (scattered dots, no cluster color) */
      '<circle cx="30" cy="45" r="5" fill="currentColor" opacity="0.3"/>' +
      '<circle cx="55" cy="38" r="5" fill="currentColor" opacity="0.3"/>' +
      '<circle cx="78" cy="52" r="5" fill="currentColor" opacity="0.3"/>' +
      '<circle cx="100" cy="40" r="5" fill="currentColor" opacity="0.3"/>' +
      '<circle cx="125" cy="48" r="5" fill="currentColor" opacity="0.3"/>' +
      '<circle cx="150" cy="36" r="5" fill="currentColor" opacity="0.3"/>' +
      '<circle cx="40" cy="68" r="5" fill="currentColor" opacity="0.3"/>' +
      '<circle cx="65" cy="75" r="5" fill="currentColor" opacity="0.3"/>' +
      '<circle cx="90" cy="62" r="5" fill="currentColor" opacity="0.3"/>' +
      '<circle cx="115" cy="72" r="5" fill="currentColor" opacity="0.3"/>' +
      '<circle cx="140" cy="60" r="5" fill="currentColor" opacity="0.3"/>' +
      '<circle cx="165" cy="78" r="5" fill="currentColor" opacity="0.3"/>' +
      '<circle cx="50" cy="95" r="5" fill="currentColor" opacity="0.3"/>' +
      '<circle cx="80" cy="100" r="5" fill="currentColor" opacity="0.3"/>' +
      '<circle cx="110" cy="90" r="5" fill="currentColor" opacity="0.3"/>' +
      '<circle cx="140" cy="100" r="5" fill="currentColor" opacity="0.3"/>' +
      SVG.txt(97, 120, 'Patients (mixed)', {size:7.5}) +

      /* Randomisation arrow */
      SVG.arrow(182, 77, 218, 77) +
      SVG.txt(200, 70, 'Cluster', {size:7.5}) +
      SVG.txt(200, 79, 'randomise', {size:7.5}) +

      /* ===== RIGHT: After randomisation ===== */
      SVG.txt(305, 22, 'After randomisation', {size:8, weight:'600'}) +

      /* Intervention GP cluster 1 */
      '<rect x="222" y="28" width="68" height="48" rx="8" fill="var(--svg-exposed)" opacity="0.18" stroke="var(--svg-exposed)" stroke-width="2"/>' +
      '<circle cx="237" cy="42" r="5" fill="var(--svg-exposed)" opacity="0.7"/>' +
      '<circle cx="255" cy="50" r="5" fill="var(--svg-exposed)" opacity="0.7"/>' +
      '<circle cx="242" cy="62" r="5" fill="var(--svg-exposed)" opacity="0.7"/>' +
      '<circle cx="263" cy="38" r="5" fill="var(--svg-exposed)" opacity="0.7"/>' +
      SVG.txt(256, 84, 'GP A', {size:7.5, fill:'var(--svg-exposed)'}) +
      /* Intervention arrow to whole cluster */
      SVG.arrow(256, 86, 256, 97, 'var(--svg-exposed)', 'url(#arr-exp)') +

      /* Control GP cluster 2 */
      '<rect x="302" y="28" width="68" height="48" rx="8" fill="var(--svg-control)" opacity="0.18" stroke="var(--svg-control)" stroke-width="2"/>' +
      '<circle cx="317" cy="40" r="5" fill="var(--svg-control)" opacity="0.7"/>' +
      '<circle cx="338" cy="48" r="5" fill="var(--svg-control)" opacity="0.7"/>' +
      '<circle cx="322" cy="60" r="5" fill="var(--svg-control)" opacity="0.7"/>' +
      '<circle cx="348" cy="38" r="5" fill="var(--svg-control)" opacity="0.7"/>' +
      SVG.txt(338, 84, 'GP B', {size:7.5, fill:'var(--svg-control)'}) +

      /* Intervention cluster 3 */
      '<rect x="222" y="99" width="68" height="36" rx="8" fill="var(--svg-exposed)" opacity="0.15" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      '<circle cx="237" cy="110" r="5" fill="var(--svg-exposed)" opacity="0.6"/>' +
      '<circle cx="258" cy="117" r="5" fill="var(--svg-exposed)" opacity="0.6"/>' +
      '<circle cx="276" cy="108" r="5" fill="var(--svg-exposed)" opacity="0.6"/>' +

      /* Control cluster 4 */
      '<rect x="302" y="99" width="68" height="36" rx="8" fill="var(--svg-control)" opacity="0.15" stroke="var(--svg-control)" stroke-width="1.5"/>' +
      '<circle cx="317" cy="110" r="5" fill="var(--svg-control)" opacity="0.6"/>' +
      '<circle cx="340" cy="118" r="5" fill="var(--svg-control)" opacity="0.6"/>' +
      '<circle cx="360" cy="108" r="5" fill="var(--svg-control)" opacity="0.6"/>' +

      SVG.txt(256, 143, 'Intervention', {size:7.5, fill:'var(--svg-exposed)'}) +
      SVG.txt(338, 143, 'Control', {size:7.5, fill:'var(--svg-control)'}) +

      /* ICC note */
      '<rect x="8" y="152" width="384" height="28" rx="4" fill="currentColor" opacity="0.04"/>' +
      SVG.txt(200, 162, 'Randomisation of clusters → all patients in a cluster get same arm', {size:7.5}) +
      SVG.txt(200, 172, 'ICC inflates variance: Design Effect = 1 + (m−1)×ICC', {size:7.5}),
      185
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
      '<title>N-of-1 trial — outcome graph above timeline with A/B/A/B periods</title>' +
      '<desc>Top half: mini outcome score graph fluctuating with treatment (higher in A periods). Bottom half: A/B/A/B timeline with washout windows. Shows why crossover detects signal in single patient.</desc>' +

      SVG.txt(200, 10, 'N-of-1 trial — single patient crossover', {size:9, weight:'500'}) +

      /* ===== MINI OUTCOME GRAPH ===== */
      SVG.txt(10, 24, 'Outcome score', {size:7.5, anchor:'start'}) +
      '<line x1="22" y1="26" x2="22" y2="75" stroke="currentColor" stroke-width="1" opacity="0.5"/>' +
      '<line x1="22" y1="75" x2="385" y2="75" stroke="currentColor" stroke-width="1" opacity="0.5"/>' +

      /* Outcome curve: high in A (exposed=60px from bottom=15), low in B (=40px from bottom=35) */
      /* period A1: x=22→95, peak ~60 (y=15 from 75=15) */
      '<polyline points="22,15 58,12 95,18" stroke="var(--svg-exposed)" stroke-width="1.8" fill="none" opacity="0.8"/>' +
      /* washout dip */
      '<polyline points="95,18 110,28" stroke="currentColor" stroke-width="1" fill="none" opacity="0.4"/>' +
      /* period B1: x=125→200, low ~35-40 */
      '<polyline points="110,28 125,38 162,40 200,36" stroke="var(--svg-control)" stroke-width="1.8" fill="none" opacity="0.8"/>' +
      /* washout */
      '<polyline points="200,36 215,26" stroke="currentColor" stroke-width="1" fill="none" opacity="0.4"/>' +
      /* period A2: x=225→300, high again */
      '<polyline points="215,26 225,14 262,10 300,16" stroke="var(--svg-exposed)" stroke-width="1.8" fill="none" opacity="0.8"/>' +
      /* washout */
      '<polyline points="300,16 315,28" stroke="currentColor" stroke-width="1" fill="none" opacity="0.4"/>' +
      /* period B2: x=325→385, low */
      '<polyline points="315,28 325,38 355,42 385,38" stroke="var(--svg-control)" stroke-width="1.8" fill="none" opacity="0.8"/>' +

      /* Y axis label */
      SVG.txt(20, 18, 'High', {size:7, anchor:'end'}) +
      SVG.txt(20, 70, 'Low', {size:7, anchor:'end'}) +

      /* ===== PERIOD TIMELINE ===== */
      /* Period A1 */
      '<rect x="22" y="84" width="73" height="40" rx="5" fill="var(--svg-exposed)" opacity="0.2" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      SVG.txt(58, 107, 'A', {size:16, fill:'var(--svg-exposed)', weight:'700'}) +
      /* Washout 1 */
      '<rect x="95" y="92" width="30" height="24" rx="4" fill="currentColor" opacity="0.06" stroke="currentColor" stroke-width="0.8" stroke-dasharray="3,2"/>' +
      SVG.txt(110, 107, 'W', {size:8}) +
      /* Period B1 */
      '<rect x="125" y="84" width="75" height="40" rx="5" fill="var(--svg-control)" opacity="0.2" stroke="var(--svg-control)" stroke-width="1.5"/>' +
      SVG.txt(162, 107, 'B', {size:16, fill:'var(--svg-control)', weight:'700'}) +
      /* Washout 2 */
      '<rect x="200" y="92" width="25" height="24" rx="4" fill="currentColor" opacity="0.06" stroke="currentColor" stroke-width="0.8" stroke-dasharray="3,2"/>' +
      SVG.txt(212, 107, 'W', {size:8}) +
      /* Period A2 */
      '<rect x="225" y="84" width="75" height="40" rx="5" fill="var(--svg-exposed)" opacity="0.2" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      SVG.txt(262, 107, 'A', {size:16, fill:'var(--svg-exposed)', weight:'700'}) +
      /* Washout 3 */
      '<rect x="300" y="92" width="25" height="24" rx="4" fill="currentColor" opacity="0.06" stroke="currentColor" stroke-width="0.8" stroke-dasharray="3,2"/>' +
      SVG.txt(312, 107, 'W', {size:8}) +
      /* Period B2 */
      '<rect x="325" y="84" width="60" height="40" rx="5" fill="var(--svg-control)" opacity="0.2" stroke="var(--svg-control)" stroke-width="1.5"/>' +
      SVG.txt(355, 107, 'B', {size:16, fill:'var(--svg-control)', weight:'700'}) +

      /* Time axis */
      SVG.arrow(22, 130, 388, 130) +
      SVG.txt(200, 141, 'Time →', {size:8}) +

      /* Outcome graph connector dashes */
      '<line x1="22" y1="75" x2="22" y2="84" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>' +
      '<line x1="385" y1="75" x2="385" y2="84" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>' +

      /* Key insight */
      '<rect x="8" y="148" width="384" height="22" rx="4" fill="var(--svg-exposed)" opacity="0.06"/>' +
      SVG.txt(200, 157, 'Outcome tracks treatment periods → detects effect within single patient', {size:7.5}) +
      SVG.txt(200, 167, 'Carryover assumption: washout eliminates prior treatment effect', {size:7.5}),
      175
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
      '<title>Adaptive design — sample accumulation bar + interim decision branches + alpha spending</title>' +
      '<desc>Growing sample bar on left. Interim 1 diamond with 3 branches: early stop efficacy (CI excludes null), continue (CI crosses null), stop futility (CI at null). Alpha spending O-F boundary at bottom.</desc>' +

      SVG.txt(200, 10, 'Adaptive Design — interim analyses and alpha spending', {size:9, weight:'500'}) +

      /* ===== Sample accumulation bar ===== */
      SVG.txt(30, 22, 'n', {size:8, anchor:'middle'}) +
      '<rect x="14" y="26" width="32" height="110" rx="3" fill="currentColor" opacity="0.07" stroke="currentColor" stroke-width="0.8"/>' +
      SVG.txt(30, 34, 'Target', {size:6.5}) +
      /* Growing bar */
      '<rect x="14" y="86" width="32" height="50" rx="2" fill="var(--svg-exposed)" opacity="0.4" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      SVG.txt(30, 110, 'n/2', {size:6.5, fill:'var(--svg-exposed)'}) +
      /* Interim mark */
      '<line x1="10" y1="86" x2="50" y2="86" stroke="var(--svg-period)" stroke-width="1.2" stroke-dasharray="3,2"/>' +
      SVG.txt(30, 82, 'Int.1', {size:6}) +

      /* Start box */
      SVG.box(148, 18, 104, 22, 'Start / Arms A + B', 'currentColor') +
      SVG.arrow(200, 40, 200, 56) +

      /* Interim 1 diamond */
      '<polygon points="200,56 240,74 200,92 160,74" fill="var(--svg-period)" opacity="0.15" stroke="var(--svg-period)" stroke-width="1.5"/>' +
      SVG.txt(200, 74, 'Interim 1', {size:8.5, fill:'var(--svg-period)', weight:'600'}) +

      /* Branch: Stop efficacy (right) */
      '<line x1="240" y1="74" x2="325" y2="95" stroke="var(--svg-exposed)" stroke-width="1.3"/>' +
      SVG.box(295, 95, 90, 20, 'Stop: efficacy', 'var(--svg-exposed)') +
      /* CI not crossing null */
      '<rect x="300" y="120" width="80" height="10" rx="2" fill="currentColor" opacity="0.05" stroke="currentColor" stroke-width="0.5"/>' +
      '<line x1="340" y1="120" x2="340" y2="130" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>' +
      '<rect x="315" y="122" width="30" height="6" rx="1" fill="var(--svg-exposed)" opacity="0.6"/>' +
      SVG.txt(340, 138, 'CI excludes null', {size:7, fill:'var(--svg-exposed)'}) +

      /* Branch: Continue (centre) */
      '<line x1="200" y1="92" x2="200" y2="106" stroke="currentColor" stroke-width="1.3"/>' +
      SVG.box(150, 106, 100, 20, 'Continue / adapt', 'currentColor') +
      SVG.arrow(200, 126, 200, 140) +

      /* Interim 2 diamond */
      '<polygon points="200,140 232,155 200,170 168,155" fill="var(--svg-period)" opacity="0.12" stroke="var(--svg-period)" stroke-width="1.3"/>' +
      SVG.txt(200, 155, 'Interim 2', {size:8, fill:'var(--svg-period)'}) +
      SVG.arrow(200, 170, 200, 183) +
      SVG.box(155, 183, 90, 18, 'Final analysis', 'currentColor') +

      /* Branch: Stop futility (left) */
      '<line x1="160" y1="74" x2="75" y2="95" stroke="var(--svg-control)" stroke-width="1.3"/>' +
      SVG.box(15, 95, 90, 20, 'Stop: futility', 'var(--svg-control)') +
      /* CI at null */
      '<rect x="20" y="120" width="80" height="10" rx="2" fill="currentColor" opacity="0.05" stroke="currentColor" stroke-width="0.5"/>' +
      '<line x1="60" y1="120" x2="60" y2="130" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>' +
      '<rect x="40" y="122" width="40" height="6" rx="1" fill="var(--svg-control)" opacity="0.4"/>' +
      SVG.txt(60, 138, 'CI crosses null', {size:7, fill:'var(--svg-control)'}) +

      /* Alpha spending label */
      SVG.txt(200, 196, 'Alpha spending: O\'Brien-Fleming boundary (conservative early, liberal late)', {size:7.5}),
      210
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
      '<title>PNU design — new users vs prevalent users swimmer lanes</title>' +
      '<desc>Left of index date: greyed pre-period bars for prevalent users. Index date as dashed vertical line. Drug A new users start at x=0. Drug B prevalent users were already on drug before x=0. Prevalent user bias annotation.</desc>' +

      SVG.txt(200, 10, 'Prevalent New-User (PNU) design', {size:9, weight:'500'}) +

      /* Landmark / index date line */
      '<line x1="135" y1="16" x2="135" y2="152" stroke="var(--svg-period)" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.7"/>' +
      SVG.txt(135, 12, 'Index date (time zero)', {size:7.5, fill:'var(--svg-period)'}) +

      /* ===== Drug A: New users (3 people, y-centers 32,46,60) ===== */
      SVG.txt(132, 28, 'Drug A new users', {size:8, fill:'var(--svg-exposed)', anchor:'end', weight:'600'}) +

      /* A1: bar from 135, censored */
      '<rect x="135" y="28" width="215" height="8" rx="2" fill="var(--svg-exposed)" opacity="0.35" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<line x1="350" y1="25" x2="350" y2="39" stroke="currentColor" stroke-width="1.5"/><line x1="347" y1="25" x2="353" y2="25" stroke="currentColor" stroke-width="1.5"/>' +
      /* A2: bar from 135, event */
      '<rect x="135" y="40" width="145" height="8" rx="2" fill="var(--svg-exposed)" opacity="0.35" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<circle cx="280" cy="44" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +
      /* A3: bar from 135, censored */
      '<rect x="135" y="52" width="245" height="8" rx="2" fill="var(--svg-exposed)" opacity="0.35" stroke="var(--svg-exposed)" stroke-width="0.8"/>' +
      '<line x1="380" y1="49" x2="380" y2="63" stroke="currentColor" stroke-width="1.5"/><line x1="377" y1="49" x2="383" y2="49" stroke="currentColor" stroke-width="1.5"/>' +

      /* Separator */
      '<line x1="20" y1="70" x2="392" y2="70" stroke="currentColor" stroke-width="0.5" stroke-dasharray="3,3" opacity="0.3"/>' +

      /* ===== Drug B: Prevalent users (3 people) ===== */
      SVG.txt(132, 80, 'Drug B prevalent users', {size:8, fill:'var(--svg-control)', anchor:'end', weight:'600'}) +

      /* B1: greyed pre-period + post index bar, censored */
      '<rect x="30" y="76" width="105" height="8" rx="2" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="0.5" stroke-dasharray="3,2"/>' +
      '<rect x="135" y="76" width="220" height="8" rx="2" fill="var(--svg-control)" opacity="0.35" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<line x1="355" y1="73" x2="355" y2="87" stroke="currentColor" stroke-width="1.5"/><line x1="352" y1="73" x2="358" y2="73" stroke="currentColor" stroke-width="1.5"/>' +
      /* B2: greyed pre-period + post, event */
      '<rect x="60" y="88" width="75" height="8" rx="2" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="0.5" stroke-dasharray="3,2"/>' +
      '<rect x="135" y="88" width="170" height="8" rx="2" fill="var(--svg-control)" opacity="0.35" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<circle cx="305" cy="92" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +
      /* B3: greyed pre-period (long) + post, censored */
      '<rect x="20" y="100" width="115" height="8" rx="2" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="0.5" stroke-dasharray="3,2"/>' +
      '<rect x="135" y="100" width="240" height="8" rx="2" fill="var(--svg-control)" opacity="0.35" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      '<line x1="375" y1="97" x2="375" y2="111" stroke="currentColor" stroke-width="1.5"/><line x1="372" y1="97" x2="378" y2="97" stroke="currentColor" stroke-width="1.5"/>' +

      /* Prevalent user bias annotation */
      SVG.txt(75, 118, 'Surviving prevalent users', {size:7.5, fill:'var(--svg-control)', anchor:'middle'}) +
      SVG.txt(75, 128, '← Prevalent user bias', {size:7.5, fill:'var(--svg-event)', anchor:'middle'}) +
      '<line x1="75" y1="130" x2="75" y2="100" stroke="var(--svg-event)" stroke-width="1" stroke-dasharray="3,2" opacity="0.6" marker-end="url(#arr-ev)"/>' +

      /* Time axis */
      SVG.timeAxis(20, 392, 140) +
      SVG.txt(135, 150, 'Time zero', {size:7}) +

      /* Note */
      '<rect x="8" y="155" width="384" height="16" rx="3" fill="currentColor" opacity="0.04"/>' +
      SVG.txt(200, 164, 'Landmark at index date: analysis starts t=0 for both groups; prevalent user bias persists', {size:7.5}),
      175
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
      '<title>Case-time-control — cases and matched controls showing reference and hazard periods</title>' +
      '<desc>Top 3 rows are cases, each with a reference period and hazard period. Bottom 3 rows are controls matched at same calendar time. Vertical line shows matched time point. Formula at bottom.</desc>' +

      SVG.txt(200, 10, 'Case-time-control — self-matched + control group', {size:9, weight:'500'}) +

      /* Time axis */
      SVG.arrow(18, 158, 385, 158) +
      SVG.txt(200, 168, 'Time →', {size:9}) +

      /* Matched time line */
      '<line x1="260" y1="17" x2="260" y2="160" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.35"/>' +
      SVG.txt(260, 14, 'Matched time', {size:7}) +

      /* ===== CASES ===== */
      SVG.txt(15, 25, 'Cases', {size:8, fill:'var(--svg-event)', anchor:'start', weight:'600'}) +

      /* Case 1 */
      '<rect x="22" y="28" width="88" height="10" rx="3" fill="var(--svg-control)" opacity="0.15" stroke="var(--svg-control)" stroke-width="1" stroke-dasharray="4,3"/>' +
      '<rect x="175" y="28" width="85" height="10" rx="3" fill="var(--svg-exposed)" opacity="0.2" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      '<circle cx="262" cy="33" r="5" fill="var(--svg-event)" opacity="0.85"/>' +
      SVG.txt(68, 37, 'Ref', {size:7, fill:'var(--svg-control)'}) +
      SVG.txt(217, 37, 'Hazard', {size:7, fill:'var(--svg-exposed)', weight:'500'}) +

      /* Case 2 */
      '<rect x="30" y="44" width="80" height="10" rx="3" fill="var(--svg-control)" opacity="0.15" stroke="var(--svg-control)" stroke-width="1" stroke-dasharray="4,3"/>' +
      '<rect x="185" y="44" width="75" height="10" rx="3" fill="var(--svg-exposed)" opacity="0.2" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      '<circle cx="262" cy="49" r="5" fill="var(--svg-event)" opacity="0.85"/>' +
      SVG.txt(70, 53, 'Ref', {size:7, fill:'var(--svg-control)'}) +
      SVG.txt(222, 53, 'Hazard', {size:7, fill:'var(--svg-exposed)', weight:'500'}) +

      /* Case 3 */
      '<rect x="18" y="60" width="92" height="10" rx="3" fill="var(--svg-control)" opacity="0.15" stroke="var(--svg-control)" stroke-width="1" stroke-dasharray="4,3"/>' +
      '<rect x="172" y="60" width="88" height="10" rx="3" fill="var(--svg-exposed)" opacity="0.2" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      '<circle cx="262" cy="65" r="5" fill="var(--svg-event)" opacity="0.85"/>' +
      SVG.txt(64, 69, 'Ref', {size:7, fill:'var(--svg-control)'}) +
      SVG.txt(216, 69, 'Hazard', {size:7, fill:'var(--svg-exposed)', weight:'500'}) +

      /* Separator */
      '<line x1="15" y1="78" x2="390" y2="78" stroke="currentColor" stroke-width="0.5" stroke-dasharray="3,3" opacity="0.3"/>' +

      /* ===== CONTROLS ===== */
      SVG.txt(15, 88, 'Controls', {size:8, fill:'var(--svg-control)', anchor:'start', weight:'600'}) +

      /* Control 1 */
      '<rect x="22" y="92" width="88" height="10" rx="3" fill="var(--svg-control)" opacity="0.12" stroke="var(--svg-control)" stroke-width="1" stroke-dasharray="4,3"/>' +
      '<rect x="175" y="92" width="85" height="10" rx="3" fill="var(--svg-exposed)" opacity="0.12" stroke="var(--svg-exposed)" stroke-width="1"/>' +
      SVG.txt(68, 101, 'Ref', {size:7, fill:'var(--svg-control)'}) +
      SVG.txt(217, 101, 'Matched window', {size:7}) +

      /* Control 2 */
      '<rect x="30" y="108" width="80" height="10" rx="3" fill="var(--svg-control)" opacity="0.12" stroke="var(--svg-control)" stroke-width="1" stroke-dasharray="4,3"/>' +
      '<rect x="185" y="108" width="75" height="10" rx="3" fill="var(--svg-exposed)" opacity="0.12" stroke="var(--svg-exposed)" stroke-width="1"/>' +
      SVG.txt(70, 117, 'Ref', {size:7, fill:'var(--svg-control)'}) +

      /* Control 3 */
      '<rect x="18" y="124" width="92" height="10" rx="3" fill="var(--svg-control)" opacity="0.12" stroke="var(--svg-control)" stroke-width="1" stroke-dasharray="4,3"/>' +
      '<rect x="172" y="124" width="88" height="10" rx="3" fill="var(--svg-exposed)" opacity="0.12" stroke="var(--svg-exposed)" stroke-width="1"/>' +
      SVG.txt(64, 133, 'Ref', {size:7, fill:'var(--svg-control)'}) +

      /* Formula */
      '<rect x="8" y="140" width="384" height="14" rx="3" fill="currentColor" opacity="0.04"/>' +
      SVG.txt(200, 150, 'OR_ctc = OR_cases (hazard/ref) ÷ OR_controls (matched window/ref)  — adjusts for secular trends', {size:7.5}),
      185
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
      '<title>Case-population design — observed vs expected cases with SMR</title>' +
      '<desc>Population shown as large rectangle. Red dots are cases. Expected cases calculated from background rate × person-time. Observed vs Expected comparison yields SMR. No explicit control sampling.</desc>' +

      SVG.txt(200, 10, 'Case-population design — observed vs expected', {size:9, weight:'500'}) +

      /* Background population rectangle */
      '<rect x="15" y="18" width="230" height="120" rx="8" fill="var(--svg-control)" opacity="0.08" stroke="var(--svg-control)" stroke-width="1.5" stroke-dasharray="5,3"/>' +
      SVG.txt(130, 32, 'Background population', {size:8.5, fill:'var(--svg-control)', weight:'600'}) +

      /* Population dots (grey) */
      '<circle cx="35" cy="50" r="4" fill="currentColor" opacity="0.2"/>' +
      '<circle cx="58" cy="45" r="4" fill="currentColor" opacity="0.2"/>' +
      '<circle cx="80" cy="55" r="4" fill="currentColor" opacity="0.2"/>' +
      '<circle cx="105" cy="42" r="4" fill="currentColor" opacity="0.2"/>' +
      '<circle cx="128" cy="52" r="4" fill="currentColor" opacity="0.2"/>' +
      '<circle cx="152" cy="46" r="4" fill="currentColor" opacity="0.2"/>' +
      '<circle cx="175" cy="56" r="4" fill="currentColor" opacity="0.2"/>' +
      '<circle cx="200" cy="44" r="4" fill="currentColor" opacity="0.2"/>' +
      '<circle cx="45" cy="72" r="4" fill="currentColor" opacity="0.2"/>' +
      '<circle cx="70" cy="80" r="4" fill="currentColor" opacity="0.2"/>' +
      '<circle cx="92" cy="68" r="4" fill="currentColor" opacity="0.2"/>' +
      '<circle cx="118" cy="76" r="4" fill="currentColor" opacity="0.2"/>' +
      '<circle cx="143" cy="66" r="4" fill="currentColor" opacity="0.2"/>' +
      '<circle cx="168" cy="74" r="4" fill="currentColor" opacity="0.2"/>' +
      '<circle cx="192" cy="62" r="4" fill="currentColor" opacity="0.2"/>' +
      '<circle cx="215" cy="72" r="4" fill="currentColor" opacity="0.2"/>' +

      /* Cases (red dots) */
      '<circle cx="80" cy="55" r="5.5" fill="var(--svg-event)" opacity="0.85"/>' +
      '<circle cx="128" cy="52" r="5.5" fill="var(--svg-event)" opacity="0.85"/>' +
      '<circle cx="45" cy="72" r="5.5" fill="var(--svg-event)" opacity="0.85"/>' +
      '<circle cx="192" cy="62" r="5.5" fill="var(--svg-event)" opacity="0.85"/>' +
      SVG.txt(130, 100, 'Cases (D+) — red dots', {size:7.5, fill:'var(--svg-event)'}) +
      SVG.txt(130, 112, 'Observed = 4', {size:8, fill:'var(--svg-event)', weight:'600'}) +

      /* Expected = rate × person-time */
      SVG.txt(130, 124, 'Expected = rate × person-time', {size:7.5, fill:'var(--svg-control)'}) +
      SVG.txt(130, 133, 'from background pop = 1.8', {size:7.5, fill:'var(--svg-control)'}) +

      /* Arrow to SMR calculation */
      SVG.arrow(248, 78, 268, 78) +

      /* SMR box */
      '<rect x="268" y="38" width="122" height="80" rx="6" fill="currentColor" opacity="0.05" stroke="currentColor" stroke-width="1.5"/>' +
      SVG.txt(329, 55, 'Observed', {size:8.5, weight:'500'}) +
      SVG.txt(329, 66, '─────────', {size:8}) +
      SVG.txt(329, 77, 'Expected', {size:8.5}) +
      SVG.txt(329, 90, 'SMR = 4/1.8', {size:9, weight:'700', fill:'var(--svg-exposed)'}) +
      SVG.txt(329, 102, '= 2.22', {size:11, weight:'700', fill:'var(--svg-exposed)'}) +
      SVG.txt(329, 113, '(p < 0.05)', {size:7.5}) +

      /* Note */
      '<rect x="8" y="145" width="384" height="24" rx="4" fill="currentColor" opacity="0.04"/>' +
      SVG.txt(200, 155, 'No control group sampling — whole population serves as reference', {size:7.5}) +
      SVG.txt(200, 165, 'Indirect standardisation: expected cases = age-sex-year specific rates × person-time', {size:7}),
      175
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
      '<title>SCRI — 3 individual timelines with pre-exposure control window and post-exposure risk window</title>' +
      '<desc>3 persons, each with [Pre-exposure control window | Exposure | Risk window | Washout | Excluded]. SCRI uses only pre-exposure as control, unlike SCCS which uses all non-risk time.</desc>' +

      SVG.txt(200, 10, 'SCRI — self-controlled risk interval', {size:9, weight:'500'}) +

      /* Column headers */
      SVG.txt(55, 22, 'Pre-exp control', {size:7.5, fill:'var(--svg-control)'}) +
      SVG.txt(148, 22, 'Exp', {size:7.5, fill:'var(--svg-exposed)'}) +
      SVG.txt(210, 22, 'Risk window', {size:7.5, fill:'var(--svg-exposed)'}) +
      SVG.txt(300, 22, 'Washout', {size:7.5}) +
      SVG.txt(360, 22, 'Excl.', {size:7.5}) +

      /* ===== PERSON 1 ===== */
      SVG.txt(12, 43, 'P1', {size:7.5, anchor:'end'}) +
      '<rect x="14" y="31" width="120" height="14" rx="3" fill="var(--svg-control)" opacity="0.2" stroke="var(--svg-control)" stroke-width="1.2" stroke-dasharray="4,3"/>' +
      '<line x1="134" y1="26" x2="134" y2="52" stroke="var(--svg-exposed)" stroke-width="2"/>' +
      '<circle cx="134" cy="32" r="3.5" fill="var(--svg-exposed)" opacity="0.9"/>' +
      '<rect x="134" y="31" width="100" height="14" rx="3" fill="var(--svg-exposed)" opacity="0.2" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      '<circle cx="185" cy="38" r="5" fill="var(--svg-event)" opacity="0.9"/>' +
      '<rect x="234" y="34" width="50" height="8" rx="2" fill="currentColor" opacity="0.07" stroke="currentColor" stroke-width="0.5" stroke-dasharray="3,2"/>' +
      '<rect x="284" y="34" width="100" height="8" rx="2" fill="currentColor" opacity="0.04"/>' +
      SVG.txt(334, 42, 'Excl.', {size:7}) +

      /* ===== PERSON 2 ===== */
      SVG.txt(12, 73, 'P2', {size:7.5, anchor:'end'}) +
      '<rect x="14" y="61" width="90" height="14" rx="3" fill="var(--svg-control)" opacity="0.2" stroke="var(--svg-control)" stroke-width="1.2" stroke-dasharray="4,3"/>' +
      '<line x1="104" y1="56" x2="104" y2="82" stroke="var(--svg-exposed)" stroke-width="2"/>' +
      '<circle cx="104" cy="62" r="3.5" fill="var(--svg-exposed)" opacity="0.9"/>' +
      '<rect x="104" y="61" width="110" height="14" rx="3" fill="var(--svg-exposed)" opacity="0.2" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      '<circle cx="162" cy="68" r="5" fill="var(--svg-event)" opacity="0.9"/>' +
      '<rect x="214" y="64" width="50" height="8" rx="2" fill="currentColor" opacity="0.07" stroke="currentColor" stroke-width="0.5" stroke-dasharray="3,2"/>' +
      '<rect x="264" y="64" width="120" height="8" rx="2" fill="currentColor" opacity="0.04"/>' +
      SVG.txt(324, 72, 'Excl.', {size:7}) +

      /* ===== PERSON 3 ===== */
      SVG.txt(12, 103, 'P3', {size:7.5, anchor:'end'}) +
      '<rect x="14" y="91" width="140" height="14" rx="3" fill="var(--svg-control)" opacity="0.2" stroke="var(--svg-control)" stroke-width="1.2" stroke-dasharray="4,3"/>' +
      '<line x1="154" y1="86" x2="154" y2="112" stroke="var(--svg-exposed)" stroke-width="2"/>' +
      '<circle cx="154" cy="92" r="3.5" fill="var(--svg-exposed)" opacity="0.9"/>' +
      '<rect x="154" y="91" width="95" height="14" rx="3" fill="var(--svg-exposed)" opacity="0.2" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      SVG.txt(202, 102, 'no event', {size:7}) +
      '<rect x="249" y="94" width="45" height="8" rx="2" fill="currentColor" opacity="0.07" stroke="currentColor" stroke-width="0.5" stroke-dasharray="3,2"/>' +
      '<rect x="294" y="94" width="90" height="8" rx="2" fill="currentColor" opacity="0.04"/>' +
      SVG.txt(339, 102, 'Excl.', {size:7}) +

      /* Key difference annotation */
      '<rect x="8" y="118" width="384" height="30" rx="4" fill="var(--svg-control)" opacity="0.06" stroke="var(--svg-control)" stroke-width="0.8"/>' +
      SVG.txt(200, 128, 'Control window = pre-exposure only (unlike SCCS which uses ALL non-risk time)', {size:7.5, fill:'var(--svg-control)', weight:'500'}) +
      SVG.txt(200, 140, 'Advantage: avoids assumption that event does not affect subsequent exposure', {size:7.5}) +

      /* Legend */
      '<rect x="8" y="155" width="10" height="6" rx="1" fill="var(--svg-control)" opacity="0.4"/>' +
      SVG.txt(21, 161, 'Control window', {size:7.5, anchor:'start', fill:'var(--svg-control)'}) +
      '<rect x="100" y="155" width="10" height="6" rx="1" fill="var(--svg-exposed)" opacity="0.4"/>' +
      SVG.txt(113, 161, 'Risk window', {size:7.5, anchor:'start', fill:'var(--svg-exposed)'}) +
      '<circle cx="195" cy="158" r="4.5" fill="var(--svg-event)" opacity="0.9"/>' +
      SVG.txt(203, 161, 'Outcome event', {size:7.5, anchor:'start'}),
      185
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
      '<title>RDD — scatter plot with threshold, CI bands, bandwidth shading, and LATE annotation</title>' +
      '<desc>Scatter plot of HbA1c score vs outcome rate. Threshold at x=210. More data points with scatter. Clear bandwidth shading. CI bands around regression lines. Two data points near threshold explicitly marked.</desc>' +

      /* Axes */
      '<line x1="45" y1="18" x2="45" y2="143" stroke="currentColor" stroke-width="1.5"/>' +
      '<line x1="45" y1="143" x2="382" y2="143" stroke="currentColor" stroke-width="1.5" marker-end="url(#arr)"/>' +
      SVG.txt(210, 158, 'Score (e.g., HbA1c mmol/mol)', {size:8.5}) +
      '<text x="28" y="82" text-anchor="middle" font-size="8.5" fill="currentColor" transform="rotate(-90,28,82)">Outcome rate</text>' +

      /* Bandwidth shading — more prominent */
      '<rect x="178" y="18" width="64" height="125" fill="var(--svg-event)" opacity="0.07" stroke="none"/>' +
      SVG.txt(210, 135, '← bandwidth →', {size:7, fill:'var(--svg-event)'}) +

      /* Threshold line */
      '<line x1="210" y1="16" x2="210" y2="145" stroke="var(--svg-event)" stroke-width="1.8" stroke-dasharray="5,3"/>' +
      SVG.txt(210, 11, 'Threshold c', {size:8.5, fill:'var(--svg-event)', weight:'600'}) +

      /* CI bands below threshold */
      '<polygon points="55,132 210,105 210,112 55,140" fill="var(--svg-control)" opacity="0.1" stroke="none"/>' +
      /* CI bands above threshold */
      '<polygon points="210,72 365,54 365,65 210,85" fill="var(--svg-exposed)" opacity="0.1" stroke="none"/>' +

      /* Regression line below threshold */
      '<polyline points="55,128 210,108" stroke="var(--svg-control)" stroke-width="2.2" fill="none"/>' +
      SVG.txt(80, 140, 'Untreated (score &lt; c)', {size:7.5, fill:'var(--svg-control)'}) +

      /* Regression line above threshold */
      '<polyline points="210,78 365,60" stroke="var(--svg-exposed)" stroke-width="2.2" fill="none"/>' +
      SVG.txt(285, 55, 'Treated (score ≥ c)', {size:7.5, fill:'var(--svg-exposed)'}) +

      /* Scattered data points — below threshold */
      '<circle cx="65" cy="126" r="3" fill="var(--svg-control)" opacity="0.6"/>' +
      '<circle cx="85" cy="122" r="3" fill="var(--svg-control)" opacity="0.6"/>' +
      '<circle cx="105" cy="118" r="3" fill="var(--svg-control)" opacity="0.6"/>' +
      '<circle cx="125" cy="115" r="3" fill="var(--svg-control)" opacity="0.6"/>' +
      '<circle cx="150" cy="112" r="3" fill="var(--svg-control)" opacity="0.6"/>' +
      '<circle cx="170" cy="109" r="3.5" fill="var(--svg-control)" opacity="0.8"/>' +
      '<circle cx="192" cy="107" r="3.5" fill="var(--svg-control)" opacity="0.8"/>' +

      /* Scattered data points — above threshold */
      '<circle cx="228" cy="77" r="3.5" fill="var(--svg-exposed)" opacity="0.8"/>' +
      '<circle cx="248" cy="74" r="3.5" fill="var(--svg-exposed)" opacity="0.8"/>' +
      '<circle cx="270" cy="71" r="3" fill="var(--svg-exposed)" opacity="0.6"/>' +
      '<circle cx="295" cy="69" r="3" fill="var(--svg-exposed)" opacity="0.6"/>' +
      '<circle cx="322" cy="66" r="3" fill="var(--svg-exposed)" opacity="0.6"/>' +
      '<circle cx="348" cy="63" r="3" fill="var(--svg-exposed)" opacity="0.6"/>' +

      /* Jump annotation */
      '<line x1="215" y1="78" x2="215" y2="108" stroke="currentColor" stroke-width="1.2" opacity="0.7"/>' +
      '<line x1="212" y1="78" x2="218" y2="78" stroke="currentColor" stroke-width="1.2"/>' +
      '<line x1="212" y1="108" x2="218" y2="108" stroke="currentColor" stroke-width="1.2"/>' +
      SVG.txt(238, 93, 'LATE at cutoff', {size:8, weight:'600', anchor:'start'}) +

      /* Y-axis labels */
      SVG.txt(44, 25, '1.0', {size:7, anchor:'end'}) +
      SVG.txt(44, 143, '0', {size:7, anchor:'end'}),
      175
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
      '<title>MR DAG with concrete example labels and SNP-exposure association bar</title>' +
      '<desc>DAG with Z = SNP rs12345 (LDL cholesterol), X = LDL cholesterol, Y = coronary heart disease. Pleiotropy cross-path shown crossed out. Mini bar showing strong SNP-exposure association (F=50) at bottom.</desc>' +

      /* Nodes with concrete labels */
      SVG.node(70, 72, 26, 'G', 'var(--svg-period)') +
      SVG.node(200, 72, 26, 'X', 'var(--svg-exposed)') +
      SVG.node(330, 72, 26, 'Y', 'var(--svg-event)') +
      SVG.node(200, 18, 18, 'U', 'currentColor') +

      /* G → X */
      SVG.arrow(96, 72, 170, 72, 'var(--svg-period)', 'url(#arr)') +
      /* X → Y */
      SVG.arrow(226, 72, 300, 72, 'var(--svg-exposed)', 'url(#arr-exp)') +
      /* U → X and U → Y (dashed) */
      '<line x1="188" y1="34" x2="120" y2="58" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4,3" opacity="0.6" marker-end="url(#arr)"/>' +
      '<line x1="212" y1="34" x2="280" y2="58" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4,3" opacity="0.6" marker-end="url(#arr)"/>' +

      /* Pleiotropy path crossed out */
      '<line x1="90" y1="60" x2="315" y2="60" stroke="var(--svg-event)" stroke-width="1" stroke-dasharray="3,3" opacity="0.3"/>' +
      '<line x1="195" y1="54" x2="205" y2="64" stroke="var(--svg-event)" stroke-width="1.8" opacity="0.7"/>' +
      '<line x1="205" y1="54" x2="195" y2="64" stroke="var(--svg-event)" stroke-width="1.8" opacity="0.7"/>' +
      SVG.txt(200, 52, 'no direct G→Y (exclusion restriction)', {size:7.5, fill:'var(--svg-event)'}) +

      /* Concrete node labels */
      SVG.txt(70, 108, 'SNP rs12345', {size:7.5, fill:'var(--svg-period)', weight:'600'}) +
      SVG.txt(70, 118, '(LDL genetics)', {size:7, fill:'var(--svg-period)'}) +
      SVG.txt(200, 108, 'LDL cholesterol', {size:7.5, fill:'var(--svg-exposed)', weight:'600'}) +
      SVG.txt(200, 118, '(mmol/L)', {size:7, fill:'var(--svg-exposed)'}) +
      SVG.txt(330, 108, 'Coronary', {size:7.5, fill:'var(--svg-event)', weight:'600'}) +
      SVG.txt(330, 118, 'heart disease', {size:7, fill:'var(--svg-event)'}) +
      SVG.txt(200, 8, 'Unmeasured confounders', {size:7}) +

      /* Mini SNP-exposure association bar */
      '<rect x="10" y="127" width="380" height="38" rx="4" fill="var(--svg-period)" opacity="0.06" stroke="var(--svg-period)" stroke-width="0.5"/>' +
      SVG.txt(100, 138, 'SNP-exposure association (F-statistic):', {size:7.5}) +
      /* Bar chart showing strong F=50 */
      '<rect x="10" y="143" width="380" height="1" fill="none"/>' +
      SVG.txt(40, 155, 'F=50', {size:8, fill:'var(--svg-period)', weight:'700', anchor:'start'}) +
      '<rect x="70" y="145" width="200" height="12" rx="2" fill="var(--svg-period)" opacity="0.4" stroke="var(--svg-period)" stroke-width="0.8"/>' +
      SVG.txt(278, 155, '(strong instrument)', {size:7.5, fill:'var(--svg-period)', anchor:'start'}) +

      /* Assumptions */
      '<rect x="8" y="168" width="384" height="14" rx="3" fill="var(--svg-period)" opacity="0.07"/>' +
      SVG.txt(200, 177, '(1) G→X relevance   (2) G⊥U independence   (3) G→Y only via X   β_IV = β_GY / β_GX', {size:7.5}),
      185
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
      '<title>Synthetic control — treated unit, synthetic control (bold dashed), and 5 donor pool lines</title>' +
      '<desc>5 faint donor pool lines. Synthetic control as bold dashed line matching treated unit in pre-period. Post-period gap with CI shading. Donor labels shown. Pre-period fit annotation.</desc>' +

      /* Axes */
      '<line x1="45" y1="18" x2="45" y2="138" stroke="currentColor" stroke-width="1.5"/>' +
      '<line x1="45" y1="138" x2="375" y2="138" stroke="currentColor" stroke-width="1.5" marker-end="url(#arr)"/>' +
      SVG.txt(210, 152, 'Time →', {size:9}) +
      '<text x="28" y="78" text-anchor="middle" font-size="9" fill="currentColor" transform="rotate(-90,28,78)">Outcome</text>' +

      /* Intervention line */
      '<line x1="205" y1="16" x2="205" y2="140" stroke="var(--svg-event)" stroke-width="1.8" stroke-dasharray="5,3"/>' +
      SVG.txt(205, 11, 'Intervention', {size:8.5, fill:'var(--svg-event)', weight:'600'}) +

      /* 5 Donor pool traces (faint) */
      '<polyline points="55,100 90,96 130,94 170,98 205,92 240,90 280,86 340,82" stroke="currentColor" stroke-width="0.9" fill="none" opacity="0.25"/>' +
      SVG.txt(344, 82, 'DK', {size:7, anchor:'start', opacity:'0.5'}) +
      '<polyline points="55,112 90,108 130,105 170,108 205,102 240,106 280,112 340,118" stroke="currentColor" stroke-width="0.9" fill="none" opacity="0.25"/>' +
      SVG.txt(344, 118, 'SE', {size:7, anchor:'start', opacity:'0.5'}) +
      '<polyline points="55,78 90,74 130,76 170,72 205,70 240,64 280,58 340,53" stroke="currentColor" stroke-width="0.9" fill="none" opacity="0.25"/>' +
      SVG.txt(344, 53, 'NO', {size:7, anchor:'start', opacity:'0.5'}) +
      '<polyline points="55,90 90,86 130,88 170,82 205,80 240,78 280,74 340,70" stroke="currentColor" stroke-width="0.9" fill="none" opacity="0.25"/>' +
      SVG.txt(344, 70, 'FI', {size:7, anchor:'start', opacity:'0.5'}) +
      '<polyline points="55,120 90,115 130,112 170,115 205,110 240,116 280,122 340,128" stroke="currentColor" stroke-width="0.9" fill="none" opacity="0.25"/>' +
      SVG.txt(344, 128, 'NL', {size:7, anchor:'start', opacity:'0.5'}) +
      SVG.txt(72, 65, 'Donor pool', {size:7.5, anchor:'start'}) +

      /* Synthetic control — bold dashed, matches treated in pre-period */
      '<polyline points="55,84 90,80 130,82 170,78 205,78 240,76 280,74 340,72" stroke="var(--svg-control)" stroke-width="2.2" fill="none" stroke-dasharray="8,4"/>' +
      SVG.txt(344, 72, 'Synthetic', {size:7.5, fill:'var(--svg-control)', anchor:'start', weight:'600'}) +

      /* Treated unit (solid, drops post-intervention) */
      '<polyline points="55,84 90,80 130,82 170,78 205,78 240,55 280,44 340,38" stroke="var(--svg-exposed)" stroke-width="2.5" fill="none"/>' +
      SVG.txt(344, 38, 'Treated', {size:7.5, fill:'var(--svg-exposed)', anchor:'start', weight:'700'}) +

      /* CI shading around treated post-period */
      '<polygon points="205,70 340,30 340,46 205,86" fill="var(--svg-exposed)" opacity="0.08" stroke="none"/>' +

      /* Gap brace */
      '<line x1="340" y1="38" x2="340" y2="72" stroke="currentColor" stroke-width="1.2" opacity="0.7"/>' +
      '<line x1="337" y1="38" x2="343" y2="38" stroke="currentColor" stroke-width="1"/>' +
      '<line x1="337" y1="72" x2="343" y2="72" stroke="currentColor" stroke-width="1"/>' +
      SVG.txt(341, 55, 'Effect', {size:8, anchor:'start', weight:'600'}) +

      /* Pre-period fit annotation */
      '<rect x="48" y="118" width="153" height="12" rx="3" fill="var(--svg-control)" opacity="0.1"/>' +
      SVG.txt(124, 127, 'Pre-period: weights fitted to match treated', {size:7, fill:'var(--svg-control)'}),
      175
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
      '<title>Disproportionality Analysis — highlighted 2x2 table with forest-plot ROR</title>' +
      '<desc>2x2 table with cell a (Drug A + Event E) highlighted in orange to show disproportionality. Mini forest-plot bar chart on right showing ROR=4.2 (95%CI 2.8-6.3). Signal detected annotation.</desc>' +

      SVG.txt(200, 10, 'Disproportionality Analysis (EudraVigilance/FAERS)', {size:9, weight:'500'}) +

      /* Column headers */
      SVG.txt(130, 26, 'Event E+', {size:8.5, fill:'var(--svg-event)', weight:'600'}) +
      SVG.txt(235, 26, 'Other events', {size:8.5}) +

      /* Row headers */
      SVG.txt(50, 55, 'Drug A', {size:8.5, fill:'var(--svg-exposed)', weight:'600', anchor:'end'}) +
      SVG.txt(50, 105, 'Other drugs', {size:8.5, anchor:'end'}) +

      /* Cell a — highlighted (Drug A + Event E) */
      '<rect x="55" y="32" width="110" height="44" rx="5" fill="var(--svg-exposed)" opacity="0.3" stroke="var(--svg-exposed)" stroke-width="2"/>' +
      SVG.txt(110, 57, 'a = 420', {size:10, weight:'700', fill:'var(--svg-exposed)'}) +
      SVG.txt(110, 70, '(high!)', {size:7.5, fill:'var(--svg-exposed)'}) +

      /* Cell b */
      '<rect x="175" y="32" width="100" height="44" rx="5" fill="currentColor" opacity="0.05" stroke="currentColor" stroke-width="1"/>' +
      SVG.txt(225, 57, 'b = 8400', {size:9, weight:'500'}) +

      /* Cell c */
      '<rect x="55" y="84" width="110" height="40" rx="5" fill="currentColor" opacity="0.05" stroke="currentColor" stroke-width="1"/>' +
      SVG.txt(110, 107, 'c = 1200', {size:9, weight:'500'}) +

      /* Cell d */
      '<rect x="175" y="84" width="100" height="40" rx="5" fill="currentColor" opacity="0.04" stroke="currentColor" stroke-width="0.5"/>' +
      SVG.txt(225, 107, 'd = 96000', {size:8.5}) +

      /* Right panel: Forest plot–style ROR */
      '<rect x="284" y="28" width="108" height="100" rx="5" fill="currentColor" opacity="0.04" stroke="currentColor" stroke-width="0.8"/>' +
      SVG.txt(338, 40, 'ROR', {size:8.5, weight:'700'}) +
      /* Null line */
      '<line x1="310" y1="48" x2="310" y2="118" stroke="currentColor" stroke-width="0.8" opacity="0.3"/>' +
      SVG.txt(310, 124, '1', {size:7}) +
      /* ROR CI bar */
      '<line x1="300" y1="78" x2="386" y2="78" stroke="var(--svg-exposed)" stroke-width="1.5" opacity="0.8"/>' +
      '<circle cx="356" cy="78" r="5" fill="var(--svg-exposed)" opacity="0.9"/>' +
      '<line x1="300" y1="74" x2="300" y2="82" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      '<line x1="386" y1="74" x2="386" y2="82" stroke="var(--svg-exposed)" stroke-width="1.5"/>' +
      SVG.txt(295, 93, '2.8', {size:7, anchor:'middle'}) +
      SVG.txt(356, 93, '4.2', {size:7, anchor:'middle', fill:'var(--svg-exposed)', weight:'600'}) +
      SVG.txt(386, 93, '6.3', {size:7, anchor:'middle'}) +

      /* Signal annotation */
      '<rect x="284" y="106" width="108" height="18" rx="3" fill="var(--svg-exposed)" opacity="0.12"/>' +
      SVG.txt(338, 117, 'Signal detected!', {size:7.5, fill:'var(--svg-exposed)', weight:'600'}) +

      /* Formulas */
      '<rect x="8" y="132" width="384" height="26" rx="4" fill="currentColor" opacity="0.04"/>' +
      SVG.txt(200, 141, 'ROR = ad/bc = 4.2 (95%CI 2.8–6.3)     PRR = (a/(a+c)) / (b/(b+d))', {size:8}) +
      SVG.txt(200, 153, 'EBGM (MGPS): Bayesian shrinkage — reduces false positives for rare drug-event pairs', {size:7.5}),
      185
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
      '<title>NMA — evidence network with drug names, proportional edges, P-score ranking table</title>' +
      '<desc>Network with Metformin, GLP-1, SGLT2, Insulin, and Placebo nodes. Edge widths proportional to number of RCTs. Head-to-head edges in exposed color, indirect-only in dashed. P-score ranking table on right.</desc>' +

      SVG.txt(200, 10, 'Network Meta-analysis — evidence network', {size:9, weight:'500'}) +

      /* Treatment nodes — 5 drugs */
      SVG.node(140, 65, 28, 'M', 'var(--svg-exposed)') +
      SVG.txt(140, 102, 'Metformin', {size:7.5, fill:'var(--svg-exposed)', weight:'600'}) +
      SVG.node(260, 65, 26, 'G', 'var(--svg-control)') +
      SVG.txt(260, 100, 'GLP-1', {size:7.5, fill:'var(--svg-control)', weight:'600'}) +
      SVG.node(80, 150, 24, 'S', 'var(--svg-period)') +
      SVG.txt(80, 182, 'SGLT2', {size:7.5, fill:'var(--svg-period)', weight:'600'}) +
      SVG.node(200, 155, 22, 'I', 'var(--svg-event)') +
      SVG.txt(200, 185, 'Insulin', {size:7.5, fill:'var(--svg-event)'}) +
      SVG.node(310, 150, 22, 'Pbo', 'currentColor') +
      SVG.txt(310, 182, 'Placebo', {size:7.5}) +

      /* Direct edges — width proportional to RCT count */
      /* M-G: 5 RCTs, thick */
      '<line x1="168" y1="65" x2="232" y2="65" stroke="var(--svg-exposed)" stroke-width="4" opacity="0.5"/>' +
      SVG.txt(200, 56, '5 RCTs', {size:7.5, fill:'var(--svg-exposed)'}) +

      /* M-S: 3 RCTs */
      '<line x1="118" y1="80" x2="96" y2="136" stroke="var(--svg-exposed)" stroke-width="2.5" opacity="0.45"/>' +
      SVG.txt(97, 108, '3', {size:7.5}) +

      /* M-I: 4 RCTs */
      '<line x1="148" y1="88" x2="188" y2="142" stroke="var(--svg-exposed)" stroke-width="3" opacity="0.45"/>' +
      SVG.txt(158, 118, '4', {size:7.5}) +

      /* G-Pbo: 2 RCTs */
      '<line x1="278" y1="82" x2="302" y2="138" stroke="var(--svg-control)" stroke-width="2" opacity="0.4"/>' +
      SVG.txt(298, 112, '2', {size:7.5}) +

      /* S-I: 2 RCTs */
      '<line x1="100" y1="152" x2="178" y2="155" stroke="var(--svg-period)" stroke-width="2" opacity="0.4"/>' +
      SVG.txt(138, 148, '2', {size:7.5}) +

      /* Pbo-I: indirect dashed */
      '<line x1="288" y1="152" x2="222" y2="157" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4,3" opacity="0.4"/>' +

      /* Indirect arrow */
      '<path d="M 100,162 Q 190,192 290,162" fill="none" stroke="var(--svg-event)" stroke-width="1.2" stroke-dasharray="4,3" opacity="0.6" marker-end="url(#arr-ev)"/>' +
      SVG.txt(195, 193, 'S vs Pbo: indirect', {size:7, fill:'var(--svg-event)'}) +

      /* P-score ranking table */
      '<rect x="335" y="20" width="60" height="100" rx="4" fill="currentColor" opacity="0.04" stroke="currentColor" stroke-width="0.8"/>' +
      SVG.txt(365, 32, 'P-score', {size:7.5, weight:'700'}) +
      '<line x1="335" y1="36" x2="395" y2="36" stroke="currentColor" stroke-width="0.5" opacity="0.4"/>' +
      SVG.txt(365, 48, 'SGLT2: 0.82', {size:7, fill:'var(--svg-period)'}) +
      SVG.txt(365, 60, 'GLP-1: 0.75', {size:7, fill:'var(--svg-control)'}) +
      SVG.txt(365, 72, 'Metf: 0.61', {size:7, fill:'var(--svg-exposed)'}) +
      SVG.txt(365, 84, 'Insul: 0.38', {size:7, fill:'var(--svg-event)'}) +
      SVG.txt(365, 96, 'Pbo: 0.04', {size:7}) +

      /* Consistency note */
      '<rect x="8" y="188" width="384" height="10" rx="3" fill="currentColor" opacity="0.04"/>' +
      SVG.txt(200, 196, 'Consistency: direct ≈ indirect  |  Edge width ∝ number of RCTs', {size:7.5}),
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
