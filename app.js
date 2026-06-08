/* =========================================================
   app.js — Epi Reference application
   Depends on globals: FORMULAS, DESIGNS, BIASES (loaded before this file)
   ========================================================= */

'use strict';

/* =========================================================
   STATE
   ========================================================= */
var state = {
  activeTab: 'formulas',
  darkMode: null,
  formula: {
    selectedId: null,
    inputValues: {},
    openPills: {},
    dynamicRows: []
  },
  design: { selectedId: null },
  bias:   { selectedId: null },
  builder: {
    modelId: null,
    vars: {
      outcome: '',
      exposure: '',
      confounders: '',
      confLinks: '',
      effMods: '',
      mediators: '',
      colliders: '',
    },
    accordionOpen: {}
  }
};

/* =========================================================
   UTILITIES
   ========================================================= */
function formatNum(x, decimals) {
  if (x === null || x === undefined) return '—';
  if (typeof x !== 'number' || isNaN(x)) return '—';
  if (!isFinite(x)) return x > 0 ? '+∞' : '−∞';
  var d = (decimals !== undefined) ? decimals : 3;
  var abs = Math.abs(x);
  if (abs === 0) return '0';
  if (abs < 0.001 || abs >= 100000) return x.toPrecision(3);
  return parseFloat(x.toFixed(d)).toString();
}

function formatCI(lo, hi) {
  return '(95% CI: ' + formatNum(lo) + '–' + formatNum(hi) + ')';
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function el(tag, attrs, children) {
  var e = document.createElement(tag);
  if (attrs) Object.keys(attrs).forEach(function(k) {
    if (k === 'class') e.className = attrs[k];
    else if (k === 'innerHTML') e.innerHTML = attrs[k];
    else e.setAttribute(k, attrs[k]);
  });
  if (children) children.forEach(function(c) { if (c) e.appendChild(c); });
  return e;
}

/* =========================================================
   DARK MODE
   ========================================================= */
function initDarkMode() {
  var stored = null;
  try { stored = sessionStorage.getItem('epi-dark'); } catch(e) {}
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  state.darkMode = stored === 'true' ? true : stored === 'false' ? false : prefersDark;
  applyDarkMode();
}

function applyDarkMode() {
  if (state.darkMode) {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }
  var btn = document.getElementById('dark-mode-toggle');
  var icon = document.getElementById('dark-mode-icon');
  if (btn && icon) {
    icon.textContent = state.darkMode ? '○' : '◑';
    btn.setAttribute('aria-label', state.darkMode ? 'Switch to light mode' : 'Switch to dark mode');
  }
}

function toggleDarkMode() {
  state.darkMode = !state.darkMode;
  applyDarkMode();
  try { sessionStorage.setItem('epi-dark', String(state.darkMode)); } catch(e) {}
}

/* =========================================================
   TAB ROUTER
   ========================================================= */
function showTab(tabId) {
  state.activeTab = tabId;
  var tabs = document.querySelectorAll('[role="tab"]');
  var panels = document.querySelectorAll('[role="tabpanel"]');
  tabs.forEach(function(t) {
    var selected = t.id === 'tab-' + tabId;
    t.setAttribute('aria-selected', selected ? 'true' : 'false');
    t.tabIndex = selected ? 0 : -1;
  });
  panels.forEach(function(p) {
    var active = p.id === 'panel-' + tabId;
    if (active) p.removeAttribute('hidden');
    else p.setAttribute('hidden', '');
  });
  try { sessionStorage.setItem('epi-tab', tabId); } catch(e) {}
}

function bindTabNav() {
  var tabs = document.querySelectorAll('[role="tab"]');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var id = tab.id.replace('tab-', '');
      showTab(id);
    });
    tab.addEventListener('keydown', function(e) {
      var all = Array.from(document.querySelectorAll('[role="tab"]'));
      var idx = all.indexOf(tab);
      if (e.key === 'ArrowRight') { e.preventDefault(); all[(idx+1) % all.length].click(); all[(idx+1) % all.length].focus(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); all[(idx-1+all.length) % all.length].click(); all[(idx-1+all.length) % all.length].focus(); }
      if (e.key === 'Home') { e.preventDefault(); all[0].click(); all[0].focus(); }
      if (e.key === 'End')  { e.preventDefault(); all[all.length-1].click(); all[all.length-1].focus(); }
    });
  });
}

/* =========================================================
   COMPUTE ENGINE
   ========================================================= */
function runFormula(def, inputValues, dynamicRows) {
  var v = {};
  var incomplete = false;

  if (def.dynamicRows) {
    var rows = (dynamicRows || []).map(function(row) {
      var r = {};
      def.rowInputs.forEach(function(inp) {
        var raw = row[inp.id];
        var n = Number(raw);
        if (raw === '' || raw === undefined || raw === null || isNaN(n)) { incomplete = true; }
        else { r[inp.id] = n; }
      });
      return r;
    });
    if (incomplete || rows.length < (def.minRows || 1)) return null;
    try { return def.compute({ rows: rows }); }
    catch(e) { return { error: 'Computation error: ' + e.message }; }
  }

  def.inputs.forEach(function(inp) {
    var raw = inputValues[inp.id];
    if (raw === '' || raw === undefined || raw === null) { incomplete = true; return; }
    var n = Number(raw);
    if (isNaN(n)) { incomplete = true; return; }
    v[inp.id] = n;
  });

  if (incomplete) return null;

  try { return def.compute(v); }
  catch(e) { return { error: 'Computation error: ' + e.message }; }
}

/* =========================================================
   FORMULA MODULE
   ========================================================= */
function buildFormulaDropdown() {
  var sel = document.getElementById('formula-select');
  var categories = {};
  var categoryOrder = ['association', 'frequency', 'diagnostic', 'standardisation', 'agreement'];
  var categoryLabels = {
    association:    'Measures of association',
    frequency:      'Measures of frequency',
    diagnostic:     'Diagnostic accuracy',
    standardisation:'Standardisation & confounding',
    agreement:      'Agreement & precision'
  };

  FORMULAS.forEach(function(f) {
    if (!categories[f.category]) categories[f.category] = [];
    categories[f.category].push(f);
  });

  var firstId = null;
  categoryOrder.forEach(function(cat) {
    if (!categories[cat]) return;
    var grp = document.createElement('optgroup');
    grp.label = categoryLabels[cat] || cat;
    categories[cat].forEach(function(f) {
      var opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.label;
      grp.appendChild(opt);
      if (!firstId) firstId = f.id;
    });
    sel.appendChild(grp);
  });

  sel.addEventListener('change', function() { selectFormula(sel.value); });
  if (firstId) selectFormula(firstId);
}

function selectFormula(id) {
  state.formula.selectedId = id;
  state.formula.inputValues = {};
  state.formula.openPills = {};
  var def = FORMULAS.filter(function(f) { return f.id === id; })[0];
  if (!def) return;

  if (def.dynamicRows) {
    state.formula.dynamicRows = [];
    for (var i = 0; i < (def.minRows || 2); i++) {
      state.formula.dynamicRows.push(makeBlankRow(def));
    }
  } else {
    state.formula.dynamicRows = [];
  }

  renderFormulaCard(def);
}

function makeBlankRow(def) {
  var row = {};
  def.rowInputs.forEach(function(inp) { row[inp.id] = ''; });
  return row;
}

function renderFormulaCard(def) {
  var card = document.getElementById('formula-card');
  card.innerHTML = '';

  var wrap = document.createElement('div');
  wrap.className = 'formula-card';

  /* Meta */
  var meta = document.createElement('div');
  meta.className = 'formula-meta';
  meta.innerHTML =
    '<div class="formula-category">' + escHtml(def.category) + '</div>' +
    '<div class="formula-expr-block">' + escHtml(def.expression) + '</div>' +
    '<p class="formula-desc">' + escHtml(def.description) + '</p>';
  wrap.appendChild(meta);

  /* Context: when to use, associated designs & analyses */
  if (def.useWhen || def.associatedDesigns || def.associatedAnalyses) {
    var ctx = document.createElement('div');
    ctx.className = 'formula-context';
    var ctxHtml = '';
    if (def.useWhen) {
      ctxHtml += '<p class="formula-use-when">' + escHtml(def.useWhen) + '</p>';
    }
    if (def.associatedDesigns && def.associatedDesigns.length > 0) {
      ctxHtml += '<div class="formula-assoc"><span class="formula-assoc-label">Study designs:</span><span class="formula-assoc-badges">';
      def.associatedDesigns.forEach(function(d) {
        ctxHtml += '<span class="badge badge-design">' + escHtml(d) + '</span>';
      });
      ctxHtml += '</span></div>';
    }
    if (def.associatedAnalyses && def.associatedAnalyses.length > 0) {
      ctxHtml += '<div class="formula-assoc"><span class="formula-assoc-label">Statistical methods:</span><span class="formula-assoc-text">' + escHtml(def.associatedAnalyses.join(', ')) + '</span></div>';
    }
    ctx.innerHTML = ctxHtml;
    wrap.appendChild(ctx);
  }

  /* Component pills */
  if (def.components && def.components.length > 0) {
    var pillsWrap = document.createElement('div');
    pillsWrap.innerHTML = '<div class="pills-row"><span class="pills-label">Components:</span></div>';
    var pillsRow = pillsWrap.querySelector('.pills-row');

    def.components.forEach(function(comp) {
      var panelId = 'pill-panel-' + def.id + '-' + comp.id;
      var btn = document.createElement('button');
      btn.className = 'pill-btn';
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', panelId);
      btn.innerHTML = escHtml(comp.label) + '<span class="pill-caret" aria-hidden="true">▾</span>';
      btn.addEventListener('click', function() { togglePill(def.id, comp.id, panelId, btn); });
      pillsRow.appendChild(btn);

      var panel = document.createElement('div');
      panel.className = 'pill-panel';
      panel.id = panelId;
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-label', comp.label + ' definition');
      panel.innerHTML =
        '<div class="pill-panel-expr">' + escHtml(comp.expression) + '</div>' +
        '<p class="pill-panel-desc">' + escHtml(comp.description) + '</p>';
      pillsRow.appendChild(panel);
    });

    wrap.appendChild(pillsRow);
  }

  /* Inputs */
  if (def.dynamicRows) {
    wrap.appendChild(buildDynamicRows(def));
  } else {
    var inputsSec = document.createElement('div');
    inputsSec.className = 'inputs-section';
    var grid = document.createElement('div');
    grid.className = 'inputs-grid';

    def.inputs.forEach(function(inp) {
      var group = document.createElement('div');
      group.className = 'input-group';
      var labelEl = document.createElement('label');
      labelEl.className = 'input-label';
      labelEl.setAttribute('for', 'inp-' + inp.id);
      labelEl.textContent = inp.label;
      var inputEl = document.createElement('input');
      inputEl.className = 'input-field';
      inputEl.id = 'inp-' + inp.id;
      inputEl.type = 'number';
      inputEl.step = inp.type === 'integer' ? '1' : 'any';
      if (inp.min !== undefined) inputEl.min = inp.min;
      if (inp.placeholder) inputEl.placeholder = inp.placeholder;
      inputEl.value = state.formula.inputValues[inp.id] || '';
      inputEl.setAttribute('autocomplete', 'off');
      inputEl.addEventListener('input', function() {
        state.formula.inputValues[inp.id] = inputEl.value;
        updateResult(def);
      });
      group.appendChild(labelEl);
      group.appendChild(inputEl);
      grid.appendChild(group);
    });

    inputsSec.appendChild(grid);
    wrap.appendChild(inputsSec);
  }

  /* Result region */
  var resultRegion = document.createElement('div');
  resultRegion.className = 'result-region empty';
  resultRegion.id = 'result-region-' + def.id;
  resultRegion.setAttribute('aria-live', 'polite');
  resultRegion.setAttribute('aria-atomic', 'true');
  resultRegion.textContent = 'Enter values above to compute.';
  wrap.appendChild(resultRegion);

  card.appendChild(wrap);
}

function togglePill(formulaId, compId, panelId, btn) {
  var key = formulaId + ':' + compId;
  var isOpen = !!state.formula.openPills[key];
  state.formula.openPills[key] = !isOpen;
  var panel = document.getElementById(panelId);
  if (panel) panel.classList.toggle('open', !isOpen);
  btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
}

function buildDynamicRows(def) {
  var sec = document.createElement('div');
  sec.className = 'dynamic-rows-section';

  var header = document.createElement('div');
  header.className = 'rows-header';
  var title = document.createElement('span');
  title.className = 'rows-title';
  title.textContent = def.rowsLabel || 'Strata';
  header.appendChild(title);
  sec.appendChild(header);

  var wrap = document.createElement('div');
  wrap.className = 'dynamic-table-wrap';
  sec.appendChild(wrap);

  var addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'add-row-btn';
  addBtn.textContent = '+ Add stratum';
  addBtn.addEventListener('click', function() {
    if (state.formula.dynamicRows.length < (def.maxRows || 8)) {
      state.formula.dynamicRows.push(makeBlankRow(def));
      rebuildDynamicTable(def, wrap);
      updateResult(def);
    }
  });
  sec.appendChild(addBtn);

  rebuildDynamicTable(def, wrap);
  return sec;
}

function rebuildDynamicTable(def, wrap) {
  wrap.innerHTML = '';
  var table = document.createElement('table');
  table.className = 'dynamic-table';

  var thead = document.createElement('thead');
  var headerRow = document.createElement('tr');
  def.rowInputs.forEach(function(inp) {
    var th = document.createElement('th');
    th.textContent = inp.label;
    headerRow.appendChild(th);
  });
  var thDel = document.createElement('th'); thDel.textContent = '';
  headerRow.appendChild(thDel);
  thead.appendChild(headerRow);
  table.appendChild(thead);

  var tbody = document.createElement('tbody');
  state.formula.dynamicRows.forEach(function(row, i) {
    var tr = document.createElement('tr');
    def.rowInputs.forEach(function(inp) {
      var td = document.createElement('td');
      var input = document.createElement('input');
      input.type = 'number';
      input.step = inp.type === 'integer' ? '1' : 'any';
      if (inp.min !== undefined) input.min = inp.min;
      input.className = 'input-field';
      input.value = row[inp.id] !== undefined ? row[inp.id] : '';
      var capturedI = i, capturedInpId = inp.id;
      input.addEventListener('input', function() {
        state.formula.dynamicRows[capturedI][capturedInpId] = input.value;
        updateResult(def);
      });
      td.appendChild(input);
      tr.appendChild(td);
    });
    var tdDel = document.createElement('td');
    if (state.formula.dynamicRows.length > (def.minRows || 1)) {
      var delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'row-remove-btn';
      delBtn.textContent = '×';
      delBtn.setAttribute('aria-label', 'Remove stratum ' + (i+1));
      var capturedI2 = i;
      delBtn.addEventListener('click', function() {
        state.formula.dynamicRows.splice(capturedI2, 1);
        rebuildDynamicTable(def, wrap);
        updateResult(def);
      });
      tdDel.appendChild(delBtn);
    }
    tr.appendChild(tdDel);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
}

function updateResult(def) {
  var resultId = 'result-region-' + def.id;
  var region = document.getElementById(resultId);
  if (!region) return;

  var result = runFormula(def, state.formula.inputValues, state.formula.dynamicRows);

  if (result === null) {
    region.className = 'result-region empty';
    region.innerHTML = 'Enter values above to compute.';
    return;
  }

  if (result.error) {
    region.className = 'result-region error';
    region.innerHTML = '⚠ ' + escHtml(result.error);
    return;
  }

  if (result.warn) {
    region.className = 'result-region warn';
    region.innerHTML = '⚠ ' + escHtml(result.warn);
    return;
  }

  region.className = 'result-region ok';

  var html = '';

  if (result.auxiliary && !result.value && result.value !== 0) {
    html += '<div class="result-aux">';
    result.auxiliary.forEach(function(item) {
      html += '<div class="result-aux-item">' +
        '<div class="result-aux-label">' + escHtml(item.label) + '</div>' +
        '<div class="result-aux-value">' + escHtml(formatNum(item.value)) +
        (item.unit ? ' <span style="font-size:0.75em;opacity:0.7">' + escHtml(item.unit) + '</span>' : '') +
        '</div>' +
        (item.ci ? '<div style="font-size:0.75rem;opacity:0.7">' + formatCI(item.ci[0], item.ci[1]) + '</div>' : '') +
        '</div>';
    });
    html += '</div>';
  } else {
    html += '<div class="result-main">' +
      '<span class="result-value">' + escHtml(formatNum(result.value)) + '</span>';
    if (result.unit) html += '<span class="result-ci" style="font-size:0.9rem;opacity:0.8">' + escHtml(result.unit) + '</span>';
    if (result.ci95low !== undefined && result.ci95high !== undefined) {
      html += '<span class="result-ci">' + formatCI(result.ci95low, result.ci95high) + '</span>';
    }
    html += '</div>';

    if (result.auxiliary) {
      html += '<div class="result-aux">';
      result.auxiliary.forEach(function(item) {
        html += '<div class="result-aux-item">' +
          '<div class="result-aux-label">' + escHtml(item.label) + '</div>' +
          '<div class="result-aux-value">' + escHtml(formatNum(item.value)) +
          (item.unit ? ' <span style="font-size:0.75em;opacity:0.7">' + escHtml(item.unit) + '</span>' : '') +
          '</div>' +
          (item.ci ? '<div style="font-size:0.75rem;opacity:0.7">' + formatCI(item.ci[0], item.ci[1]) + '</div>' : '') +
          '</div>';
      });
      html += '</div>';
    }
  }

  if (result.note) {
    html += '<div class="result-note">' + escHtml(result.note) + '</div>';
  }

  region.innerHTML = html;
}

/* =========================================================
   STUDY DESIGN MODULE
   ========================================================= */
function buildDesignDropdown() {
  var sel = document.getElementById('design-select');
  var categories = {};
  var categoryOrder = ['experimental', 'observational', 'self-controlled', 'quasi-experimental', 'pharmacovigilance', 'evidence-synthesis'];
  var categoryLabels = {
    experimental:         'Experimental',
    observational:        'Observational',
    'self-controlled':    'Self-controlled',
    'quasi-experimental': 'Quasi-experimental',
    pharmacovigilance:    'Pharmacovigilance / Signal Detection',
    'evidence-synthesis': 'Evidence Synthesis'
  };

  DESIGNS.forEach(function(d) {
    if (!categories[d.category]) categories[d.category] = [];
    categories[d.category].push(d);
  });

  var firstId = null;
  categoryOrder.forEach(function(cat) {
    if (!categories[cat]) return;
    var grp = document.createElement('optgroup');
    grp.label = categoryLabels[cat] || cat;
    categories[cat].forEach(function(d) {
      var opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = d.label;
      grp.appendChild(opt);
      if (!firstId) firstId = d.id;
    });
    sel.appendChild(grp);
  });

  sel.addEventListener('change', function() { selectDesign(sel.value); });
  if (firstId) selectDesign(firstId);
}

function selectDesign(id) {
  state.design.selectedId = id;
  var def = DESIGNS.filter(function(d) { return d.id === id; })[0];
  if (!def) return;
  renderDesignCard(def);
}

function renderDesignCard(def) {
  var card = document.getElementById('design-card');

  var html = '<div class="design-card">';

  /* SVG diagram */
  html += '<div class="design-svg-wrap">' + def.svg + '</div>';

  html += '<div class="design-body">';

  /* Meta grid */
  html += '<div class="design-meta-grid">';
  html += '<div class="design-meta-item"><div class="design-meta-key">Temporal direction</div><div class="design-meta-val">' + escHtml(def.temporalDirection) + '</div></div>';
  html += '<div class="design-meta-item"><div class="design-meta-key">Primary measure</div><div class="design-meta-val">' + escHtml(def.primaryMeasure) + '</div></div>';
  if (def.commonAnalyses) {
    html += '<div class="design-meta-item" style="grid-column:1/-1"><div class="design-meta-key">Common analyses</div><div class="design-meta-val">' + escHtml(def.commonAnalyses.join(', ')) + '</div></div>';
  }
  html += '</div>';

  /* Strengths */
  html += '<div class="design-section"><div class="section-heading">Strengths</div><ul>';
  def.strengths.forEach(function(s) { html += '<li>' + escHtml(s) + '</li>'; });
  html += '</ul></div>';

  /* Limitations */
  html += '<div class="design-section"><div class="section-heading">Limitations</div><ul>';
  def.limitations.forEach(function(s) { html += '<li>' + escHtml(s) + '</li>'; });
  html += '</ul></div>';

  /* Common biases */
  html += '<div class="design-section"><div class="section-heading">Common biases</div><div class="badge-list">';
  def.biases.forEach(function(b) { html += '<span class="badge">' + escHtml(b) + '</span>'; });
  html += '</div></div>';

  /* Danish pharmacoepi notes */
  html += '<div class="callout"><div class="callout-label">Register / pharmacoepi context</div>' + escHtml(def.danishPharmacoepiNotes) + '</div>';

  html += '</div></div>';

  card.innerHTML = html;
}

/* =========================================================
   BIAS MODULE
   ========================================================= */
function buildBiasDropdown() {
  var sel = document.getElementById('bias-select');
  var categories = { Selection: [], Information: [], Confounding: [] };

  BIASES.forEach(function(b) {
    if (categories[b.category]) categories[b.category].push(b);
    else categories.Selection.push(b);
  });

  var firstId = null;
  ['Selection', 'Information', 'Confounding'].forEach(function(cat) {
    var grp = document.createElement('optgroup');
    grp.label = cat + ' bias';
    categories[cat].forEach(function(b) {
      var opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = b.label;
      grp.appendChild(opt);
      if (!firstId) firstId = b.id;
    });
    sel.appendChild(grp);
  });

  sel.addEventListener('change', function() { selectBias(sel.value); });
  if (firstId) selectBias(firstId);
}

function selectBias(id) {
  state.bias.selectedId = id;
  var def = BIASES.filter(function(b) { return b.id === id; })[0];
  if (!def) return;
  renderBiasCard(def);
  /* update select to match (for cross-links) */
  var sel = document.getElementById('bias-select');
  if (sel) sel.value = id;
}

function renderBiasCard(def) {
  var card = document.getElementById('bias-card');

  var dirClass = def.directionOfBias === 'Toward null' ? 'toward'
               : def.directionOfBias === 'Away from null' ? 'away'
               : 'unpredictable';

  var html = '<div class="bias-card">';

  /* Header */
  html += '<div class="bias-header">';
  html += '<span class="bias-category-badge ' + escHtml(def.category) + '">' + escHtml(def.category) + ' bias</span>';
  html += '<span class="direction-badge ' + dirClass + '">' + escHtml(def.directionOfBias) + '</span>';
  html += '</div>';

  /* Definition */
  html += '<div class="bias-section"><div class="section-heading">Definition</div>';
  html += '<p class="bias-definition">' + escHtml(def.definition) + '</p>';
  html += '</div>';

  /* Direction explanation */
  html += '<div class="bias-section"><div class="section-heading">Direction of bias</div>';
  html += '<p class="bias-direction-explain">' + escHtml(def.directionExplanation) + '</p>';
  html += '</div>';

  /* Typical design context */
  html += '<div class="bias-section"><div class="section-heading">Typical design context</div>';
  html += '<div class="badge-list">';
  def.typicalDesignContext.forEach(function(d) { html += '<span class="badge">' + escHtml(d) + '</span>'; });
  html += '</div></div>';

  /* Example scenario */
  if (def.exampleScenario) {
    html += '<div class="bias-section"><div class="section-heading">Example scenario</div>';
    html += '<p style="font-size:0.875rem;color:var(--text-muted)">' + escHtml(def.exampleScenario) + '</p></div>';
  }

  /* Mitigation */
  html += '<div class="bias-section"><div class="section-heading">Mitigation strategies</div><ol>';
  def.mitigationStrategies.forEach(function(m) { html += '<li>' + escHtml(m) + '</li>'; });
  html += '</ol></div>';

  /* Related biases */
  if (def.relatedBiases && def.relatedBiases.length > 0) {
    html += '<div class="bias-section"><div class="section-heading">Related biases</div><div class="badge-list" id="related-biases-' + def.id + '"></div></div>';
  }

  html += '</div>';
  card.innerHTML = html;

  /* Wire cross-links after setting innerHTML */
  if (def.relatedBiases && def.relatedBiases.length > 0) {
    var container = document.getElementById('related-biases-' + def.id);
    if (container) {
      def.relatedBiases.forEach(function(relId) {
        var rel = BIASES.filter(function(b) { return b.id === relId; })[0];
        if (!rel) return;
        var btn = document.createElement('button');
        btn.className = 'related-link';
        btn.textContent = rel.label;
        btn.addEventListener('click', function() { selectBias(relId); });
        container.appendChild(btn);
      });
    }
  }
}

/* =========================================================
   MODEL BUILDER MODULE
   ========================================================= */
function parseVarList(str) {
  if (!str || !str.trim()) return [];
  return str.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; });
}

function parseConfounders(str) {
  return parseVarList(str).slice(0, 8);
}

function hasCycle(directedEdges, nodes) {
  var adj = {}, visited = {}, inStack = {};
  nodes.forEach(function(n) { adj[n] = []; });
  directedEdges.forEach(function(e) { if (adj[e.from]) adj[e.from].push(e.to); });
  function dfs(n) {
    if (inStack[n]) return true;
    if (visited[n]) return false;
    visited[n] = inStack[n] = true;
    var nbrs = adj[n] || [];
    for (var i = 0; i < nbrs.length; i++) { if (dfs(nbrs[i])) return true; }
    inStack[n] = false;
    return false;
  }
  for (var i = 0; i < nodes.length; i++) { if (dfs(nodes[i])) return true; }
  return false;
}

function parseConfounderLinks(str, knownNodes) {
  var edges = [], errors = [];
  if (!str || !str.trim()) return {edges: edges, errors: errors};
  var known = {};
  knownNodes.forEach(function(n) { known[n] = true; });

  str.split(',').forEach(function(token) {
    token = token.trim();
    if (!token) return;
    var type, from, to;
    if (token.indexOf(' > ') !== -1) {
      type = 'directed';
      var parts = token.split(' > ');
      from = parts[0].trim(); to = parts[1].trim();
    } else if (token.indexOf(' ~ ') !== -1) {
      type = 'bidirected';
      var parts2 = token.split(' ~ ');
      from = parts2[0].trim(); to = parts2[1].trim();
    } else {
      errors.push('Cannot parse "' + token + '" — use "A > B" or "A ~ B"');
      return;
    }
    if (!from || !to) { errors.push('Empty node name in "' + token + '"'); return; }
    if (from === to)  { errors.push('Self-loop: ' + from + ' cannot point to itself'); return; }
    if (!known[from]) { errors.push('Unknown node "' + from + '" — add it to Confounders first'); return; }
    if (!known[to])   { errors.push('Unknown node "' + to   + '" — add it to Confounders first'); return; }
    edges.push({type: type, from: from, to: to});
  });

  /* Cycle check on directed edges only */
  var directed = edges.filter(function(e) { return e.type === 'directed'; });
  if (directed.length && hasCycle(directed, knownNodes)) {
    errors.push('Directed cycle detected — edges must be acyclic (DAG rule)');
    edges = edges.filter(function(e) { return e.type !== 'directed'; });
  }

  return {edges: edges, errors: errors};
}

function topoSortConfounders(nodes, directedEdges) {
  var inDeg = {}, adj = {};
  nodes.forEach(function(n) { inDeg[n] = 0; adj[n] = []; });
  directedEdges.forEach(function(e) {
    if (adj[e.from] !== undefined && inDeg[e.to] !== undefined) {
      adj[e.from].push(e.to);
      inDeg[e.to]++;
    }
  });
  var queue = nodes.filter(function(n) { return inDeg[n] === 0; });
  var result = [];
  while (queue.length) {
    var n = queue.shift();
    result.push(n);
    adj[n].forEach(function(m) { if (--inDeg[m] === 0) queue.push(m); });
  }
  nodes.forEach(function(n) { if (result.indexOf(n) === -1) result.push(n); });
  return result;
}

/* ── DAG SVG primitives ── */
function dagArrow(x1, y1, x2, y2, marker, stroke, sw, op, dash) {
  return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'"' +
    ' stroke="'+stroke+'" stroke-width="'+sw+'" opacity="'+op+'"' +
    (dash ? ' stroke-dasharray="'+dash+'"' : '') +
    ' marker-end="url(#'+marker+')"/>';
}

function dagRect(x, y, w, h, r, fill, stroke, sw, fop) {
  return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'"' +
    ' fill="'+fill+'" fill-opacity="'+(fop||1)+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
}

function dagTxt(x, y, txt, fill, fs, fw) {
  return '<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="'+(fs||9)+'"' +
    ' fill="'+fill+'"'+(fw?' font-weight="'+fw+'"':'')+
    ' font-family="system-ui,sans-serif">'+escHtml(txt)+'</text>';
}

function dagLbl(x, y, txt, fill, op) {
  return '<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="8"' +
    ' fill="'+fill+'" opacity="'+op+'" font-family="system-ui,sans-serif">'+escHtml(txt)+'</text>';
}


function buildBuilderDropdown() {
  var sel = document.getElementById('builder-model-select');
  var categories = {};
  var categoryOrder = ['continuous', 'binary', 'time-to-event', 'count', 'causal', 'self-controlled'];
  var categoryLabels = {
    'continuous':     'Continuous outcomes',
    'binary':         'Binary outcomes',
    'time-to-event':  'Time-to-event',
    'count':          'Count / rate outcomes',
    'causal':         'Causal inference',
    'self-controlled':'Self-controlled designs'
  };

  MODELS.forEach(function(m) {
    if (!categories[m.category]) categories[m.category] = [];
    categories[m.category].push(m);
  });

  var firstId = null;
  categoryOrder.forEach(function(cat) {
    if (!categories[cat]) return;
    var grp = document.createElement('optgroup');
    grp.label = categoryLabels[cat] || cat;
    categories[cat].forEach(function(m) {
      var opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.label;
      grp.appendChild(opt);
      if (!firstId) firstId = m.id;
    });
    sel.appendChild(grp);
  });

  sel.addEventListener('change', function() { selectBuilderModel(sel.value); });
  if (firstId) selectBuilderModel(firstId);
}

function selectBuilderModel(id) {
  state.builder.modelId = id;
  state.builder.accordionOpen = {};
  var def = MODELS.filter(function(m) { return m.id === id; })[0];
  if (!def) return;
  renderBuilderCard(def);
}

function renderBuilderCard(def) {
  var area = document.getElementById('builder-area');
  area.innerHTML = '';

  var layout = document.createElement('div');
  layout.className = 'builder-layout';

  /* ---- LEFT: inputs ---- */
  var inputs = document.createElement('div');
  inputs.className = 'builder-inputs';

  function makeField(labelText, subLabel, inputId, placeholder) {
    var field = document.createElement('div');
    field.className = 'builder-field';
    var lbl = document.createElement('label');
    lbl.className = 'builder-label';
    lbl.setAttribute('for', inputId);
    lbl.textContent = labelText;
    field.appendChild(lbl);
    if (subLabel) {
      var sub = document.createElement('div');
      sub.className = 'builder-sublabel';
      sub.textContent = subLabel;
      field.appendChild(sub);
    }
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.className = 'builder-input';
    inp.id = inputId;
    inp.placeholder = placeholder || '';
    inp.setAttribute('autocomplete', 'off');
    inp.setAttribute('autocorrect', 'off');
    inp.setAttribute('spellcheck', 'false');
    return { field: field, inp: inp };
  }

  var outcomeF = makeField('Outcome variable', 'The dependent variable (Y)', 'bld-outcome', 'e.g. death, hospitalisation');
  outcomeF.inp.value = state.builder.vars.outcome;
  outcomeF.inp.addEventListener('input', function() {
    state.builder.vars.outcome = outcomeF.inp.value;
    updateBuilderOutput(def);
  });
  outcomeF.field.appendChild(outcomeF.inp);
  inputs.appendChild(outcomeF.field);

  var exposureF = makeField('Exposure / treatment', 'The primary predictor (X)', 'bld-exposure', 'e.g. statin, metformin');
  exposureF.inp.value = state.builder.vars.exposure;
  exposureF.inp.addEventListener('input', function() {
    state.builder.vars.exposure = exposureF.inp.value;
    updateBuilderOutput(def);
  });
  exposureF.field.appendChild(exposureF.inp);
  inputs.appendChild(exposureF.field);

  var divider = document.createElement('div');
  divider.className = 'builder-divider';
  inputs.appendChild(divider);

  var confF = makeField('Confounders', 'Variable names only — comma-separated', 'bld-conf', 'e.g. age, sex, SES, diabetes');
  confF.inp.value = state.builder.vars.confounders;
  confF.inp.addEventListener('input', function() {
    state.builder.vars.confounders = confF.inp.value;
    updateBuilderOutput(def);
  });
  confF.field.appendChild(confF.inp);
  inputs.appendChild(confF.field);

  var confLinksF = makeField('Confounder relationships', 'A > B = direct cause  ·  A ~ B = shared unmeasured cause', 'bld-conf-links', 'e.g. age > SES, smoking ~ obesity');
  confLinksF.inp.value = state.builder.vars.confLinks;
  confLinksF.inp.addEventListener('input', function() {
    state.builder.vars.confLinks = confLinksF.inp.value;
    updateBuilderOutput(def);
  });
  confLinksF.field.appendChild(confLinksF.inp);
  var confLinksErr = document.createElement('div');
  confLinksErr.className = 'edge-error';
  confLinksErr.id = 'bld-conf-links-err';
  confLinksErr.style.display = 'none';
  confLinksF.field.appendChild(confLinksErr);
  inputs.appendChild(confLinksF.field);

  var emF = makeField('Effect modifier(s)', 'Adds interaction term(s) — comma-separated', 'bld-em', 'sex, age_group');
  emF.inp.value = state.builder.vars.effMods;
  emF.inp.addEventListener('input', function() {
    state.builder.vars.effMods = emF.inp.value;
    updateBuilderOutput(def);
  });
  emF.field.appendChild(emF.inp);
  inputs.appendChild(emF.field);

  var divider2 = document.createElement('div');
  divider2.className = 'builder-divider';
  inputs.appendChild(divider2);

  var medF = makeField('Mediator(s)', 'On the causal pathway E→M→O — comma-separated', 'bld-med', 'e.g. LDL, inflammation');
  medF.inp.value = state.builder.vars.mediators;
  medF.inp.addEventListener('input', function() {
    state.builder.vars.mediators = medF.inp.value;
    updateBuilderOutput(def);
  });
  medF.field.appendChild(medF.inp);
  inputs.appendChild(medF.field);

  var colF = makeField('Collider(s)', 'Caused by both E and O — comma-separated', 'bld-col', 'e.g. hospitalisation');
  colF.inp.value = state.builder.vars.colliders;
  colF.inp.addEventListener('input', function() {
    state.builder.vars.colliders = colF.inp.value;
    updateBuilderOutput(def);
  });
  colF.field.appendChild(colF.inp);
  inputs.appendChild(colF.field);

  layout.appendChild(inputs);

  /* ---- RIGHT: output ---- */
  var output = document.createElement('div');
  output.className = 'builder-output';

  /* Meta chips */
  var metaStrip = document.createElement('div');
  metaStrip.className = 'builder-meta-strip';
  metaStrip.innerHTML =
    '<span class="builder-meta-chip"><strong>Outcome</strong> ' + escHtml(def.outcomeType) + '</span>' +
    '<span class="builder-meta-chip"><strong>Effect</strong> ' + escHtml(def.effectMeasure) + '</span>' +
    '<span class="builder-meta-chip"><strong>Link</strong> ' + escHtml(def.link) + '</span>';
  output.appendChild(metaStrip);

  /* Description */
  var desc = document.createElement('div');
  desc.className = 'builder-desc';
  desc.textContent = def.useWhen;
  output.appendChild(desc);

  /* Formula */
  var formulaSec = document.createElement('div');
  formulaSec.innerHTML = '<div class="builder-section-label">Model equation</div>';
  var formulaBlock = document.createElement('div');
  formulaBlock.className = 'builder-formula-block';
  formulaBlock.id = 'bld-formula-block';
  formulaSec.appendChild(formulaBlock);
  var effectNote = document.createElement('div');
  effectNote.className = 'builder-effect-note';
  effectNote.id = 'bld-effect-note';
  formulaSec.appendChild(effectNote);
  output.appendChild(formulaSec);

  /* Visuals: DAG + output illustration */
  var visuals = document.createElement('div');
  visuals.className = 'builder-visuals';

  var dagPanel = document.createElement('div');
  dagPanel.className = 'builder-vis-panel';
  dagPanel.innerHTML = '<div class="builder-section-label">Directed Acyclic Graph</div>';
  var dagSvgWrap = document.createElement('div');
  dagSvgWrap.id = 'bld-dag-wrap';
  dagPanel.appendChild(dagSvgWrap);
  var dagAdvice = document.createElement('div');
  dagAdvice.id = 'bld-dag-advice';
  dagPanel.appendChild(dagAdvice);
  visuals.appendChild(dagPanel);

  var illPanel = document.createElement('div');
  illPanel.className = 'builder-vis-panel';
  illPanel.innerHTML = '<div class="builder-section-label">Typical output</div>' + def.outputSvg;
  visuals.appendChild(illPanel);

  output.appendChild(visuals);

  /* Accordion: Assumptions */
  output.appendChild(makeAccordion('assumptions-' + def.id, 'Assumptions', function(body) {
    var ul = document.createElement('ul');
    ul.className = 'builder-assumptions-list';
    def.assumptions.forEach(function(a) {
      var li = document.createElement('li');
      li.textContent = a;
      ul.appendChild(li);
    });
    body.appendChild(ul);
  }));

  /* Accordion: R code */
  output.appendChild(makeAccordion('rcode-' + def.id, 'R code template', function(body) {
    var pre = document.createElement('pre');
    pre.className = 'builder-rcode-block';
    pre.id = 'bld-rcode-block';
    body.appendChild(pre);
  }));

  /* Danish context */
  var danish = document.createElement('div');
  danish.className = 'builder-danish-callout';
  danish.innerHTML = '<div class="builder-danish-label">Register / Danish pharmacoepi context</div>' + escHtml(def.danishContext);
  output.appendChild(danish);

  layout.appendChild(output);
  area.appendChild(layout);

  /* Populate dynamic fields */
  updateBuilderOutput(def);
}

function makeAccordion(id, title, populateFn) {
  var wrap = document.createElement('div');
  wrap.className = 'builder-accordion';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'builder-accordion-btn';
  btn.setAttribute('aria-expanded', state.builder.accordionOpen[id] ? 'true' : 'false');
  btn.setAttribute('aria-controls', 'acc-body-' + id);
  btn.innerHTML = escHtml(title) + '<span class="builder-accordion-caret" aria-hidden="true">▾</span>';

  var body = document.createElement('div');
  body.className = 'builder-accordion-body' + (state.builder.accordionOpen[id] ? ' open' : '');
  body.id = 'acc-body-' + id;
  populateFn(body);

  btn.addEventListener('click', function() {
    var isOpen = state.builder.accordionOpen[id];
    state.builder.accordionOpen[id] = !isOpen;
    btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    body.classList.toggle('open', !isOpen);
  });

  wrap.appendChild(btn);
  wrap.appendChild(body);
  return wrap;
}

function currentBuilderVars() {
  var cs = parseConfounders(state.builder.vars.confounders);
  var linksParsed = parseConfounderLinks(state.builder.vars.confLinks, cs);
  return {
    o:          state.builder.vars.outcome.trim() || 'Y',
    x:          state.builder.vars.exposure.trim() || 'X',
    cs:         cs,
    confLinks:  linksParsed.edges,
    confErrors: linksParsed.errors,
    ms:         parseVarList(state.builder.vars.effMods).slice(0, 3),
    meds:       parseVarList(state.builder.vars.mediators).slice(0, 3),
    cols:       parseVarList(state.builder.vars.colliders).slice(0, 3)
  };
}


function updateBuilderOutput(def) {
  var rv = currentBuilderVars();
  var o = rv.o, x = rv.x, cs = rv.cs, ms = rv.ms, meds = rv.meds, cols = rv.cols;

  /* Confounder relationship errors */
  var errEl = document.getElementById('bld-conf-links-err');
  if (errEl) {
    errEl.textContent = rv.confErrors.join(' · ');
    errEl.style.display = rv.confErrors.length ? '' : 'none';
  }

  /* Formula */
  var formulaEl = document.getElementById('bld-formula-block');
  if (formulaEl) formulaEl.textContent = def.buildFormula(o, x, cs, ms);

  /* Effect note */
  var noteEl = document.getElementById('bld-effect-note');
  if (noteEl) noteEl.textContent = def.effectNote(x, o);

  /* DAG + advice */
  var dagWrap = document.getElementById('bld-dag-wrap');
  if (dagWrap) dagWrap.innerHTML = buildDAGSvg(x, o, cs, ms, meds, cols, rv.confLinks);
  var dagAdviceEl = document.getElementById('bld-dag-advice');
  if (dagAdviceEl) dagAdviceEl.innerHTML = buildAdjustmentAdvice(x, o, meds, cols);

  /* R code */
  var rcodeEl = document.getElementById('bld-rcode-block');
  if (rcodeEl) rcodeEl.textContent = def.rCode(o, x, cs, ms);
}

function buildDAGSvg(x, o, cs, ms, meds, cols, confLinks) {
  meds = meds || [];
  cols = cols || [];
  confLinks = confLinks || [];

  /* Apply topological sort so causally earlier confounders sit left */
  var directedOnly = confLinks.filter(function(e) { return e.type === 'directed'; });
  var dCs   = topoSortConfounders(cs.slice(0, 5), directedOnly);
  var dMs   = ms.slice(0, 2);
  var dMeds = meds.slice(0, 3);
  var dCols = cols.slice(0, 3);

  var hasCs   = dCs.length   > 0;
  var hasMs   = dMs.length   > 0;
  var hasMeds = dMeds.length > 0;
  var hasCols = dCols.length > 0;

  /* Layout constants */
  var W = 440;
  var expX = 78, outX = 362;
  /* Extra top padding when confounders exist so same-row arcs don't clip */
  var confY = hasCs ? 44 : 30;
  var mainY = hasCs ? confY + 98 : 110;
  var colY  = mainY + 92;
  var emY   = hasCols ? colY + 52 : mainY + 92;

  var H = mainY + 70;
  if (hasCols) H = Math.max(H, colY + 28);
  if (hasMs)   H = Math.max(H, emY + 25);
  H = Math.max(H, mainY + 55);

  var midX = (expX + outX) / 2;

  /* Per-node radius look-up (half the dominant dimension of the rect) */
  var nodeR = {};  /* set after pos is built */

  /* ── Build position map for all named nodes ── */
  var pos = {};
  pos[x] = {x: expX, y: mainY};
  pos[o] = {x: outX, y: mainY};

  if (hasCs) {
    var cCount = dCs.length;
    var cGap   = Math.min(78, (W - 80) / Math.max(cCount, 1));
    var cLeft  = (W - cGap * (cCount - 1)) / 2;
    dCs.forEach(function(c, i) { pos[c] = {x: cLeft + i * cGap, y: confY}; });
  }
  if (hasMeds) {
    var mGapPath = (outX - expX) / (dMeds.length + 1);
    dMeds.forEach(function(m, i) { pos[m] = {x: expX + mGapPath * (i + 1), y: mainY}; });
  }
  if (hasCols) {
    var ccCount = dCols.length;
    var ccGap   = Math.min(88, 200 / Math.max(ccCount, 1));
    var ccLeft  = midX - ccGap * (ccCount - 1) / 2;
    dCols.forEach(function(c, i) { pos[c] = {x: ccLeft + i * ccGap, y: colY}; });
  }
  if (hasMs) {
    var emCount = dMs.length;
    var emLeft  = midX - 84 * (emCount - 1) / 2;
    dMs.forEach(function(m, i) { pos[m] = {x: emLeft + i * 84, y: emY}; });
  }

  /* Node half-sizes for clean arrow start/end points */
  nodeR[x] = 40;  /* exposure: 80px wide → half = 40 */
  nodeR[o] = 40;  /* outcome:  80px wide → half = 40 */
  dCs.forEach(function(c) { nodeR[c] = 25; });    /* confounder:   50px wide */
  dMeds.forEach(function(m) { nodeR[m] = 26; });  /* mediator:     52px wide */
  dCols.forEach(function(c) { nodeR[c] = 26; });  /* collider:     52px wide */
  dMs.forEach(function(m) { nodeR[m] = 25; });    /* eff.modifier: 50px wide */

  /* Filter confounder links — both endpoints must be in pos */
  var validLinks = confLinks.filter(function(e) { return pos[e.from] && pos[e.to]; });

  /* ── SVG: arrows buffer (aB) drawn first, nodes buffer (nB) on top ── */
  var aB = '', nB = '';

  var svgOpen = '<svg role="img" viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto">' +
    '<title>Directed acyclic graph</title>' +
    '<desc>DAG: ' + escHtml(x) + ' → ' + escHtml(o) +
    (hasCs   ? '; confounders'    : '') +
    (hasMeds ? '; mediators'      : '') +
    (hasCols ? '; colliders'      : '') +
    (hasMs   ? '; effect modifiers': '') + '</desc>' +
    '<defs>' +
    '<marker id="daga"  markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">' +
    '<polygon points="0 0,7 2.5,0 5" fill="currentColor" opacity="0.65"/></marker>' +
    '<marker id="dagam" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">' +
    '<polygon points="0 0,7 2.5,0 5" fill="var(--svg-period)" opacity="0.85"/></marker>' +
    '<marker id="dagac" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">' +
    '<polygon points="0 0,7 2.5,0 5" fill="var(--svg-event)" opacity="0.75"/></marker>' +
    '<marker id="daga-rev" markerWidth="7" markerHeight="5" refX="1" refY="2.5" orient="auto-start-reverse">' +
    '<polygon points="7 0,0 2.5,7 5" fill="var(--svg-period)" opacity="0.85"/></marker>' +
    '</defs>';

  /* ── CONFOUNDERS arrows ── */
  if (hasCs) {
    dCs.forEach(function(c) {
      var cp = pos[c];
      aB += '<line x1="'+cp.x+'" y1="'+(cp.y+14)+'" x2="'+(expX+14)+'" y2="'+(mainY-16)+'"' +
        ' stroke="currentColor" stroke-width="1.4" opacity="0.45" stroke-dasharray="4,3" marker-end="url(#daga)"/>';
      aB += '<line x1="'+cp.x+'" y1="'+(cp.y+14)+'" x2="'+(outX-14)+'" y2="'+(mainY-16)+'"' +
        ' stroke="currentColor" stroke-width="1.4" opacity="0.45" stroke-dasharray="4,3" marker-end="url(#daga)"/>';
    });
  }

  /* ── MEDIATORS arrows ── */
  if (hasMeds) {
    var medXs = dMeds.map(function(m) { return pos[m].x; });
    aB += '<line x1="'+(expX+40)+'" y1="'+mainY+'" x2="'+(medXs[0]-27)+'" y2="'+mainY+'"' +
      ' stroke="currentColor" stroke-width="1.8" opacity="0.8" marker-end="url(#daga)"/>';
    for (var k = 0; k < medXs.length - 1; k++) {
      aB += '<line x1="'+(medXs[k]+27)+'" y1="'+mainY+'" x2="'+(medXs[k+1]-27)+'" y2="'+mainY+'"' +
        ' stroke="currentColor" stroke-width="1.8" opacity="0.8" marker-end="url(#daga)"/>';
    }
    aB += '<line x1="'+(medXs[medXs.length-1]+27)+'" y1="'+mainY+'" x2="'+(outX-40)+'" y2="'+mainY+'"' +
      ' stroke="currentColor" stroke-width="1.8" opacity="0.8" marker-end="url(#daga)"/>';
    var arcPeakY = mainY + 52;
    aB += '<path d="M '+(expX+20)+','+(mainY+14)+' Q '+midX+','+arcPeakY+' '+(outX-20)+','+(mainY+14)+'"' +
      ' fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5,3" opacity="0.5" marker-end="url(#daga)"/>';
    aB += dagLbl(midX, arcPeakY+13, 'direct effect', 'currentColor', '0.38');
    aB += dagLbl(midX, mainY-7, 'indirect pathway', 'var(--svg-control)', '0.5');
  } else {
    aB += '<line x1="'+(expX+40)+'" y1="'+mainY+'" x2="'+(outX-40)+'" y2="'+mainY+'"' +
      ' stroke="currentColor" stroke-width="2" opacity="0.75" marker-end="url(#daga)"/>';
  }

  /* ── COLLIDERS arrows ── */
  if (hasCols) {
    dCols.forEach(function(col) {
      var cp = pos[col];
      aB += '<line x1="'+(expX+22)+'" y1="'+(mainY+18)+'" x2="'+(cp.x-16)+'" y2="'+(colY-14)+'"' +
        ' stroke="var(--svg-event)" stroke-width="1.4" opacity="0.6" marker-end="url(#dagac)"/>';
      aB += '<line x1="'+(outX-22)+'" y1="'+(mainY+18)+'" x2="'+(cp.x+16)+'" y2="'+(colY-14)+'"' +
        ' stroke="var(--svg-event)" stroke-width="1.4" opacity="0.6" marker-end="url(#dagac)"/>';
    });
  }

  /* ── EFFECT MODIFIER arrows ── */
  if (hasMs) {
    dMs.forEach(function(m) {
      var mp = pos[m];
      aB += '<line x1="'+mp.x+'" y1="'+(emY-14)+'" x2="'+midX+'" y2="'+(mainY+14)+'"' +
        ' stroke="var(--svg-period)" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.85" marker-end="url(#dagam)"/>';
    });
  }

  /* ── INTER-CONFOUNDER EDGES (directed = solid arc; bidirected = dashed purple double-headed) ── */
  validLinks.forEach(function(e) {
    var fp = pos[e.from], tp = pos[e.to];
    var dx = tp.x - fp.x;
    if (Math.abs(dx) < 4) return;
    var rF = nodeR[e.from] || 26, rT = nodeR[e.to] || 26;
    var x1 = fp.x + (dx > 0 ?  rF : -rF);
    var x2 = tp.x + (dx > 0 ? -rT :  rT);
    var mx = (fp.x + tp.x) / 2;
    var arcCtrlY = confY - 28;   /* control point well above node row */
    if (e.type === 'directed') {
      aB += '<path d="M '+x1+','+fp.y+' Q '+mx+','+arcCtrlY+' '+x2+','+tp.y+'"' +
        ' fill="none" stroke="currentColor" stroke-width="1.6" opacity="0.75"' +
        ' marker-end="url(#daga)"/>';
    } else {
      aB += '<path d="M '+x1+','+fp.y+' Q '+mx+','+arcCtrlY+' '+x2+','+tp.y+'"' +
        ' fill="none" stroke="var(--svg-period)" stroke-width="1.5" opacity="0.8"' +
        ' stroke-dasharray="4,3"' +
        ' marker-start="url(#daga-rev)" marker-end="url(#dagam)"/>';
    }
  });

  /* ── NODES: confounders ── */
  if (hasCs) {
    nB += dagLbl(W/2, confY - 15, 'Confounders', 'currentColor', '0.42');
    dCs.forEach(function(c) {
      var cp = pos[c];
      var cLbl = c.length > 9 ? c.slice(0, 8) + '…' : c;
      nB += dagRect(cp.x-25, cp.y-13, 50, 24, 5, 'var(--bg)', 'currentColor', 1.4, 0.8);
      nB += dagTxt(cp.x, cp.y+4, cLbl, 'currentColor', 9, null);
    });
  }

  /* ── NODES: mediators ── */
  if (hasMeds) {
    nB += dagLbl(midX, mainY-19, 'Mediator(s)', 'var(--svg-control)', '0.55');
    dMeds.forEach(function(med) {
      var mp = pos[med];
      var mLbl = med.length > 9 ? med.slice(0, 8) + '…' : med;
      nB += dagRect(mp.x-26, mainY-14, 52, 28, 5, 'var(--bg)', 'var(--svg-control)', 1.5, 1);
      nB += dagTxt(mp.x, mainY+4, mLbl, 'currentColor', 9, null);
    });
  }

  /* ── NODES: colliders ── */
  if (hasCols) {
    nB += dagLbl(midX, colY+21, 'Collider(s) — do not condition', 'var(--svg-event)', '0.55');
    dCols.forEach(function(col) {
      var cp = pos[col];
      var cLbl = col.length > 9 ? col.slice(0, 8) + '…' : col;
      nB += dagRect(cp.x-26, colY-14, 52, 26, 5, 'var(--bg)', 'var(--svg-event)', 1.5, 0.85);
      nB += dagTxt(cp.x, colY+4, cLbl, 'var(--svg-event)', 9, null);
    });
  }

  /* ── NODES: effect modifiers ── */
  if (hasMs) {
    nB += dagLbl(midX, emY+21, 'Effect modifier(s) → interaction', 'var(--svg-period)', '0.6');
    dMs.forEach(function(m) {
      var mp = pos[m];
      var mLbl = m.length > 9 ? m.slice(0, 8) + '…' : m;
      nB += dagRect(mp.x-25, emY-14, 50, 26, 5, 'var(--bg)', 'var(--svg-period)', 1.5, 1);
      nB += dagTxt(mp.x, emY+4, mLbl, 'var(--svg-period)', 9, null);
    });
  }

  /* ── NODES: exposure & outcome (always on top) ── */
  var xLbl = x.length > 11 ? x.slice(0, 10) + '…' : x;
  nB += dagRect(expX-40, mainY-18, 80, 36, 7, 'var(--svg-exposed)', 'var(--svg-exposed)', 2, 0.14);
  nB += dagTxt(expX, mainY+5, xLbl, 'var(--svg-exposed)', 10, '600');
  nB += dagLbl(expX, mainY+26, 'Exposure', 'var(--svg-exposed)', '0.65');

  var oLbl = o.length > 11 ? o.slice(0, 10) + '…' : o;
  nB += dagRect(outX-40, mainY-18, 80, 36, 7, 'var(--svg-event)', 'var(--svg-event)', 2, 0.14);
  nB += dagTxt(outX, mainY+5, oLbl, 'var(--svg-event)', 10, '600');
  nB += dagLbl(outX, mainY+26, 'Outcome', 'var(--svg-event)', '0.65');

  return svgOpen + aB + nB + '</svg>';
}

function buildAdjustmentAdvice(x, o, meds, cols) {
  if (!meds.length && !cols.length) return '';
  var html = '<div class="dag-advice">';

  if (meds.length) {
    var medList = meds.map(function(m) {
      return '<code class="dag-code">' + escHtml(m) + '</code>';
    }).join(', ');
    html += '<div class="dag-advice-item dag-advice-med">' +
      '<span class="dag-advice-icon" aria-hidden="true">⚠</span>' +
      '<div><strong>Do not adjust for mediator(s): ' + medList + '</strong> — ' +
      'Including a mediator blocks the indirect pathway (E→M→O) and produces a controlled direct effect estimate, not the total effect. ' +
      'To decompose total into direct + indirect effects, use mediation analysis ' +
      '(e.g., R <code class="dag-code">mediation</code> package or the counterfactual g-computation approach).' +
      '</div></div>';
  }

  if (cols.length) {
    var colList = cols.map(function(c) {
      return '<code class="dag-code">' + escHtml(c) + '</code>';
    }).join(', ');
    html += '<div class="dag-advice-item dag-advice-col">' +
      '<span class="dag-advice-icon" aria-hidden="true">⛔</span>' +
      '<div><strong>Do not condition on collider(s): ' + colList + '</strong> — ' +
      'Conditioning on a collider (variable caused by both ' + escHtml(x) + ' and ' + escHtml(o) +
      ') opens a non-causal path and induces collider stratification bias. ' +
      'Colliders must not appear in the adjustment set, in selection criteria, or as stratification variables.' +
      '</div></div>';
  }

  html += '</div>';
  return html;
}

/* =========================================================
   REGISTRY NAVIGATOR — STATE
   ========================================================= */
state.registry = {
  country: 'DK',
  category: 'all',
  selectedId: null,
  checker: {
    stepIndex: 0,
    answers: {},
    done: false,
  },
};

/* =========================================================
   REGISTRY NAVIGATOR — COUNTRY STRIP
   ========================================================= */
function buildCountryStrip() {
  var strip = document.getElementById('reg-country-strip');
  if (!strip) return;
  strip.innerHTML = '';
  NORDIC_COUNTRIES.forEach(function(c) {
    var btn = document.createElement('button');
    btn.className = 'reg-country-btn' + (c.code === state.registry.country ? ' active' : '') +
                    (c.status === 'stub' ? ' stub' : '');
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-pressed', c.code === state.registry.country ? 'true' : 'false');
    btn.innerHTML =
      '<span class="reg-country-code">' + escHtml(c.code) + '</span>' +
      '<span class="reg-country-name">' + escHtml(c.name) + '</span>' +
      (c.status === 'stub' ? '<span class="reg-country-badge">expansion</span>' : '');
    btn.addEventListener('click', function() { selectCountry(c.code); });
    strip.appendChild(btn);
  });
}

function selectCountry(code) {
  state.registry.country = code;
  state.registry.selectedId = null;
  buildCountryStrip();
  populateRegFilterAndSelect();
  renderCountryCard(code);
}

/* =========================================================
   REGISTRY NAVIGATOR — FILTER BAR
   ========================================================= */
var REG_CATEGORIES = [
  { value: 'all',         label: 'All' },
  { value: 'medications', label: 'Medications' },
  { value: 'diagnoses',   label: 'Diagnoses' },
  { value: 'vital-status',label: 'Vital status' },
  { value: 'socioeconomic',label: 'Socioeconomic' },
  { value: 'cancer',      label: 'Cancer' },
  { value: 'clinical',    label: 'Clinical quality' },
  { value: 'laboratory',  label: 'Laboratory' },
  { value: 'psychiatric', label: 'Psychiatric' },
];

function buildFilterBar() {
  var bar = document.getElementById('reg-filter-bar');
  if (!bar) return;
  bar.innerHTML = '';
  REG_CATEGORIES.forEach(function(cat) {
    var chip = document.createElement('button');
    chip.className = 'reg-filter-chip' + (cat.value === state.registry.category ? ' active' : '');
    chip.setAttribute('type', 'button');
    chip.textContent = cat.label;
    chip.addEventListener('click', function() {
      state.registry.category = cat.value;
      buildFilterBar();
      populateRegFilterAndSelect();
    });
    bar.appendChild(chip);
  });
}

/* =========================================================
   REGISTRY NAVIGATOR — DROPDOWN
   ========================================================= */
function populateRegFilterAndSelect() {
  var sel = document.getElementById('reg-select');
  if (!sel) return;
  sel.innerHTML = '';
  var country = state.registry.country;
  var cat = state.registry.category;
  var filtered = REGISTRIES.filter(function(r) {
    return r.country === country && (cat === 'all' || r.category === cat);
  });

  if (filtered.length === 0) {
    var opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '— No registers in this category for ' + country + ' —';
    sel.appendChild(opt);
    document.getElementById('reg-card').innerHTML = '';
    return;
  }

  filtered.forEach(function(r, i) {
    var opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = r.abbreviation + ' — ' + r.shortName;
    sel.appendChild(opt);
    if (i === 0 && !state.registry.selectedId) state.registry.selectedId = r.id;
  });

  if (state.registry.selectedId) {
    var found = filtered.filter(function(r) { return r.id === state.registry.selectedId; });
    if (found.length) {
      sel.value = found[0].id;
    } else {
      state.registry.selectedId = filtered[0].id;
      sel.value = filtered[0].id;
    }
  }

  renderRegistryCard(state.registry.selectedId);

  sel.onchange = function() {
    state.registry.selectedId = sel.value;
    renderRegistryCard(sel.value);
  };
}

/* =========================================================
   REGISTRY NAVIGATOR — COUNTRY STUB CARD
   ========================================================= */
function renderCountryCard(code) {
  var c = NORDIC_COUNTRIES.filter(function(x) { return x.code === code; })[0];
  if (!c) return;
  if (c.status !== 'stub') {
    populateRegFilterAndSelect();
    return;
  }

  var card = document.getElementById('reg-card');
  var regs = REGISTRIES.filter(function(r) { return r.country === code; });
  var html = '<div class="reg-detail">';
  html += '<div class="reg-detail-header">';
  html += '<div class="reg-detail-title">' + escHtml(c.name) + ' — Nordic Expansion</div>';
  html += '<div class="reg-detail-subtitle">' + escHtml(c.nativeName) + ' · Population ' + escHtml(c.population) + '</div>';
  html += '</div>';

  html += '<div class="callout">';
  html += '<div class="reg-section-label">Linkage identifier</div>';
  html += '<strong>' + escHtml(c.linkageKey) + '</strong> — ' + escHtml(c.linkageKeyFull);
  html += '</div>';

  html += '<div class="callout" style="margin-top:0.6rem">';
  html += '<div class="reg-section-label">Data protection &amp; access</div>';
  html += escHtml(c.dataProtection);
  html += '</div>';

  if (regs.length) {
    html += '<div class="reg-section-label" style="margin-top:1rem">Profiled registers (' + regs.length + ')</div>';
    html += '<div class="reg-stub-list">';
    regs.forEach(function(r) {
      html += '<div class="reg-stub-item">';
      html += '<span class="reg-cat-badge reg-cat-' + escHtml(r.category) + '">' + escHtml(r.category) + '</span>';
      html += '<strong>' + escHtml(r.abbreviation) + '</strong> — ' + escHtml(r.shortName);
      html += '<div class="reg-stub-coverage">' + escHtml(r.coverage) + '</div>';
      if (r.crossNordicCompatibility && r.crossNordicCompatibility.length) {
        r.crossNordicCompatibility.forEach(function(n) {
          if (n.country === 'DK') {
            html += '<div class="reg-nordic-note"><span class="reg-nordic-flag">DK</span>' + escHtml(n.note) + '</div>';
          }
        });
      }
      html += '</div>';
    });
    html += '</div>';
  }

  html += '</div>';
  card.innerHTML = html;
}

/* =========================================================
   REGISTRY NAVIGATOR — REGISTRY DETAIL CARD
   ========================================================= */
function renderRegistryCard(id) {
  var reg = REGISTRIES.filter(function(r) { return r.id === id; })[0];
  var card = document.getElementById('reg-card');
  if (!reg || !card) return;

  if (reg.stub) {
    renderCountryCard(reg.country);
    return;
  }

  var html = '<div class="reg-detail">';

  /* Header */
  html += '<div class="reg-detail-header">';
  html += '<div class="reg-detail-title">' + escHtml(reg.fullName) + '</div>';
  html += '<div class="reg-detail-meta-row">';
  html += '<span class="reg-cat-badge reg-cat-' + escHtml(reg.category) + '">' + escHtml(reg.category) + '</span>';
  html += '<span class="reg-abbr-pill">' + escHtml(reg.abbreviation) + '</span>';
  if (reg.drugSetting) {
    var settingLabel = reg.drugSetting === 'out-of-hospital' ? 'Community pharmacy' : 'In-hospital';
    html += '<span class="reg-setting-pill reg-setting-' + escHtml(reg.drugSetting.replace('-', '')) + '">' + settingLabel + '</span>';
  }
  html += '</div>';
  html += '</div>';

  /* Meta grid */
  html += '<div class="reg-meta-grid">';
  html += regMetaItem('Data holder', reg.dataHolder);
  html += regMetaItem('Established', String(reg.established));
  html += regMetaItem('Available from', reg.availableFrom);
  html += regMetaItem('Update frequency', reg.updateFrequency);
  html += regMetaItem('Linkage key', reg.linkageKey);
  if (reg.nationwideStabilization) {
    html += regMetaItem('Nationwide stabilisation', reg.nationwideStabilization);
  }
  if (reg.icdVersion) {
    html += regMetaItem('Coding version', reg.icdVersion);
  }
  html += '</div>';

  /* Coverage */
  html += regSection('Population &amp; coverage', escHtml(reg.coverage));

  /* LPR version note */
  if (reg.lprVersionNote) {
    html += '<div class="warn-box" style="margin-bottom:0.75rem">';
    html += '<strong>LPR version note:</strong> ' + escHtml(reg.lprVersionNote);
    html += '</div>';
  }

  /* Primary variables */
  if (reg.primaryVariables && reg.primaryVariables.length) {
    html += '<div class="reg-section-label">Primary variables</div>';
    html += '<ul class="reg-var-list">';
    reg.primaryVariables.forEach(function(v) {
      html += '<li>' + escHtml(v) + '</li>';
    });
    html += '</ul>';
  }

  /* Strengths */
  if (reg.strengths && reg.strengths.length) {
    html += regBulletSection('Strengths', reg.strengths, 'reg-strength-list');
  }

  /* Limitations */
  if (reg.limitations && reg.limitations.length) {
    html += regBulletSection('Limitations', reg.limitations, 'reg-limit-list');
  }

  /* Validation metrics */
  if (reg.validationMetrics && reg.validationMetrics.length) {
    html += '<div class="reg-section-label">Validation metrics</div>';
    html += '<table class="reg-val-table"><thead><tr>';
    html += '<th>Phenotype</th><th>Metric</th><th>Value</th><th>Reference</th>';
    html += '</tr></thead><tbody>';
    reg.validationMetrics.forEach(function(vm) {
      html += '<tr>';
      html += '<td>' + escHtml(vm.phenotype) + '</td>';
      html += '<td><span class="reg-metric-pill">' + escHtml(vm.metric) + '</span></td>';
      html += '<td class="reg-metric-value">' + escHtml(vm.value) + '</td>';
      html += '<td class="reg-ref">' + escHtml(vm.reference) + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
  }

  /* Nordic compatibility */
  if (reg.crossNordicCompatibility && reg.crossNordicCompatibility.length) {
    html += '<div class="reg-section-label">Cross-Nordic compatibility</div>';
    html += '<div class="reg-nordic-grid">';
    reg.crossNordicCompatibility.forEach(function(n) {
      html += '<div class="reg-nordic-item">';
      html += '<span class="reg-nordic-flag">' + escHtml(n.country) + '</span>';
      html += '<span class="reg-nordic-text">' + escHtml(n.note) + '</span>';
      html += '</div>';
    });
    html += '</div>';
  }

  /* Data access note */
  if (reg.dataAccessNote) {
    html += '<div class="callout" style="margin-top:0.75rem">';
    html += '<div class="reg-section-label">Data access</div>';
    html += escHtml(reg.dataAccessNote);
    html += '</div>';
  }

  html += '</div>';
  card.innerHTML = html;
}

function regMetaItem(label, value) {
  return '<div class="reg-meta-item"><div class="reg-meta-label">' + escHtml(label) +
         '</div><div class="reg-meta-value">' + escHtml(value) + '</div></div>';
}

function regSection(label, htmlContent) {
  return '<div class="reg-section-label">' + label + '</div>' +
         '<p class="reg-section-text">' + htmlContent + '</p>';
}

function regBulletSection(label, items, cls) {
  var html = '<div class="reg-section-label">' + escHtml(label) + '</div>';
  html += '<ul class="' + cls + '">';
  items.forEach(function(item) {
    html += '<li>' + escHtml(item) + '</li>';
  });
  html += '</ul>';
  return html;
}

/* =========================================================
   REGISTRY NAVIGATOR — FEASIBILITY CHECKER
   ========================================================= */
function initFeasibilityChecker() {
  renderCheckerStep();
}

function renderCheckerStep() {
  var body = document.getElementById('reg-checker-body');
  if (!body) return;
  var ch = state.registry.checker;

  if (ch.done) {
    renderCheckerResult();
    return;
  }

  var step = FEASIBILITY_TREE.steps[ch.stepIndex];
  if (!step) { ch.done = true; renderCheckerResult(); return; }

  var totalSteps = FEASIBILITY_TREE.steps.length;
  var html = '<div class="reg-checker">';

  /* Progress */
  html += '<div class="reg-checker-progress">';
  html += '<div class="reg-checker-step-label">Step ' + (ch.stepIndex + 1) + ' of ' + totalSteps + ' — ' + escHtml(step.label) + '</div>';
  html += '<div class="reg-checker-progress-bar"><div class="reg-checker-progress-fill" style="width:' +
          Math.round(((ch.stepIndex) / totalSteps) * 100) + '%"></div></div>';
  html += '</div>';

  html += '<div class="reg-checker-question">' + escHtml(step.question) + '</div>';
  if (step.hint) {
    html += '<div class="reg-checker-hint">' + escHtml(step.hint) + '</div>';
  }

  /* Options */
  var currentAnswers = ch.answers[step.id] || [];
  if (!Array.isArray(currentAnswers)) currentAnswers = [currentAnswers];

  html += '<div class="reg-checker-options" id="checker-options-' + escHtml(step.id) + '">';
  step.options.forEach(function(opt) {
    var isSelected = currentAnswers.indexOf(opt.value) !== -1;
    html += '<button type="button" class="reg-checker-opt' + (isSelected ? ' selected' : '') + '"' +
            ' data-step="' + escHtml(step.id) + '"' +
            ' data-value="' + escHtml(opt.value) + '"' +
            ' data-multi="' + (step.multiSelect ? 'true' : 'false') + '">';
    html += '<span class="reg-checker-opt-label">' + escHtml(opt.label) + '</span>';
    html += '<span class="reg-checker-opt-desc">' + escHtml(opt.description) + '</span>';
    html += '</button>';
  });
  html += '</div>';

  /* Nav buttons */
  html += '<div class="reg-checker-nav">';
  if (ch.stepIndex > 0) {
    html += '<button type="button" class="reg-checker-back-btn" id="checker-back">Back</button>';
  }
  var hasAnswer = ch.answers[step.id] && (Array.isArray(ch.answers[step.id]) ? ch.answers[step.id].length > 0 : true);
  html += '<button type="button" class="reg-checker-next-btn" id="checker-next"' + (hasAnswer ? '' : ' disabled') + '>';
  html += ch.stepIndex < totalSteps - 1 ? 'Next' : 'See recommendations';
  html += '</button>';
  html += '</div>';
  html += '</div>';

  body.innerHTML = html;

  /* Bind option clicks */
  body.querySelectorAll('.reg-checker-opt').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var stepId = btn.getAttribute('data-step');
      var value = btn.getAttribute('data-value');
      var multi = btn.getAttribute('data-multi') === 'true';
      if (multi) {
        var arr = ch.answers[stepId] || [];
        if (!Array.isArray(arr)) arr = [arr];
        var idx = arr.indexOf(value);
        if (idx === -1) arr.push(value); else arr.splice(idx, 1);
        ch.answers[stepId] = arr;
      } else {
        ch.answers[stepId] = [value];
      }
      renderCheckerStep();
    });
  });

  var nextBtn = body.querySelector('#checker-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      if (ch.stepIndex < totalSteps - 1) {
        ch.stepIndex++;
        renderCheckerStep();
      } else {
        ch.done = true;
        renderCheckerResult();
      }
    });
  }

  var backBtn = body.querySelector('#checker-back');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      if (ch.stepIndex > 0) { ch.stepIndex--; renderCheckerStep(); }
    });
  }
}

function computeRecommendations() {
  var a = state.registry.checker.answers;
  var exposure = (a.q_exposure || [])[0] || '';
  var period   = (a.q_period   || [])[0] || '';
  var outcomes = a.q_outcome     || [];
  var confs    = a.q_confounders || [];
  var scope    = (a.q_scope    || [])[0] || '';

  var recs = [];
  var warnings = [];

  function addRec(id, role, note) {
    if (!recs.some(function(r) { return r.id === id; })) {
      recs.push({ id: id, role: role, note: note || null });
    }
  }

  /* ── Exposure routing ─────────────────────────────── */
  if (exposure === 'drug_outpatient' || exposure === 'drug_both') {
    addRec('dk-lsr', 'Primary exposure register',
      'All community pharmacy dispensings since 1994. Define drug exposure using ATC code window. Dispensed = no primary non-adherence bias.');
  }
  if (exposure === 'drug_inhospital' || exposure === 'drug_both') {
    addRec('dk-dhmr', 'Primary exposure register (in-hospital)',
      'IV/SC biologics, chemotherapy, parenteral agents since 2018.');
    if (period === 'pre2019' || period === 'spans' || period === 'any') {
      warnings.push('DHMR (Sygehusmedicinregisteret) was established in 2018 and reached nationwide stability ~2022. Studies requiring in-hospital drug data before 2022 face region-dependent left-truncation. Consider a sensitivity analysis restricted to post-2022 to assess the impact of incomplete early DHMR data.');
    }
  }

  /* ── Period routing ───────────────────────────────── */
  if (period === 'spans') {
    addRec('dk-lpr', 'Outcome / covariate (LPR2 + LPR3 required)',
      'Request both LPR2 (episode-based, up to 2018) and LPR3 (relational, 2019+). Bridge-variable logic required. Re-validate ICD-10 phenotype algorithms in LPR3 table structure.');
    warnings.push('LPR structural shift: LPR2 (up to 2018) is episode-based; LPR3 (2019+) uses a relational model with contacts, diagnoses, and procedures in separate tables requiring explicit joins. Phenotype algorithms using LPR2 field names must be redesigned for LPR3. This is the most common source of data extraction errors in post-2019 studies.');
  } else if (exposure === 'non_drug' || outcomes.indexOf('hospital_dx') !== -1 || confs.indexOf('comorbidity') !== -1) {
    if (!recs.some(function(r) { return r.id === 'dk-lpr'; })) {
      addRec('dk-lpr', 'Outcome / covariate register',
        period === 'pre2019' ? 'LPR2 only.' : period === 'post2019' ? 'LPR3 only — relational schema.' : null);
    }
  }

  /* ── Outcome routing ──────────────────────────────── */
  if (outcomes.indexOf('hospital_dx') !== -1) {
    addRec('dk-lpr', 'Primary outcome register', 'ICD-10 diagnostic and procedure codes.');
  }
  if (outcomes.indexOf('death_all') !== -1 || outcomes.indexOf('death_cause') !== -1) {
    addRec('dk-cpr', 'Censoring (vital status)',
      'Date of death or emigration as event/censoring date in survival analysis.');
    if (outcomes.indexOf('death_cause') !== -1) {
      addRec('dk-dar', 'Primary outcome (cause-specific mortality)',
        'ICD-10 underlying cause of death. Note ~12–18 month processing lag — explicitly account for incomplete most-recent year.');
    }
  }
  if (outcomes.indexOf('cancer') !== -1) {
    addRec('dk-dcr', 'Primary outcome (incident cancer)',
      'ICD-O-3 topography + morphology. Can also serve as competing event or prevalent-cancer exclusion criterion.');
  }
  if (outcomes.indexOf('lab') !== -1) {
    addRec('dk-labka', 'Outcome / covariate (laboratory)',
      'Specify regions. North Denmark Region (Nordjylland) has complete coverage from 1998; other regions limited.');
    warnings.push('LABKA regional heterogeneity: a nationally complete laboratory register does not exist. Restricting to North Denmark Region maximises temporal depth (from 1998) but limits generalisability. Consider a sensitivity analysis by region and explicitly declare regional coverage scope in the methods.');
  }
  if (outcomes.indexOf('psychiatric') !== -1) {
    addRec('dk-pcrr', 'Outcome / covariate (psychiatric)',
      'ICD-10 F-codes from 1969 (inpatient) and 1995 (outpatient). Hospital psychiatric contacts only.');
  }
  if (outcomes.indexOf('drug_event') !== -1) {
    if (exposure !== 'drug_outpatient' && exposure !== 'drug_both') {
      addRec('dk-lsr', 'Outcome register (drug event)', 'ATC-coded community pharmacy dispensings.');
    }
  }

  /* ── Confounder routing ───────────────────────────── */
  if (confs.indexOf('comorbidity') !== -1) {
    addRec('dk-lpr', 'Confounder register (comorbidity)',
      'ICD-10 codes for Charlson Comorbidity Index or Elixhauser Index construction.');
  }
  if (confs.indexOf('ses') !== -1) {
    addRec('dk-dst', 'Confounder register (socioeconomic status)',
      'Separate application to Danmarks Statistik. IEU (income), UDDA (education), IDA (employment).');
    warnings.push('Socioeconomic data (Danmarks Statistik) requires a separate data application to DST Forskerservice — independent from Sundhedsdatastyrelsen. Cross-environment linkage adds ~3–6 months to the data access timeline and requires a formal joint-project agreement where the CPR-based linkage is managed within the DST secure environment.');
  }
  if (confs.indexOf('lab_cov') !== -1) {
    addRec('dk-labka', 'Confounder register (baseline laboratory values)',
      'Declare regional coverage; use most recent measurement before index date.');
  }
  if (confs.indexOf('clinical_score') !== -1) {
    addRec('dk-rkkp', 'Confounder register (disease severity)',
      'Identify the relevant RKKP registry: DANBIO (RA), DLD (diabetes), DAP (stroke), DHRD (cardiac surgery). Separate application per registry secretariat.');
    warnings.push('RKKP clinical quality registries require a separate application to each registry secretariat — not via Sundhedsdatastyrelsen Forskerservice. Each registry has its own data access committee. Budget 3–6 months for review, separate from the SDS/DST timelines.');
  }

  /* ── Always include CPR ───────────────────────────── */
  addRec('dk-cpr', 'Cohort definition and censoring',
    'Vital status, migration dates, and demographic data required for any cohort entry and censoring algorithm.');

  /* ── Scope routing ────────────────────────────────── */
  if (scope === 'nordic_pool') {
    warnings.push('CRITICAL — Data sovereignty: raw individual-level data cannot leave Danish secure computing environments under the Danish Data Protection Act (Databeskyttelsesloven) and GDPR. Pooling individual-level data from Denmark with other Nordic countries is not permissible under standard research agreements. Cross-Nordic analyses must use one of: (a) meta-analytic pooling of country-level summary statistics, (b) identical pre-specified analysis scripts run independently in each country\'s secure environment with only estimates shared, or (c) a federated analysis platform approved under a specific data-sharing agreement among all participating data controllers.');
  }
  if (scope === 'nordic_meta') {
    warnings.push('Cross-Nordic meta-analysis: each country team analyses data in their own secure environment using identical pre-specified scripts. Only summary statistics (log-HRs, SEs, event counts) are shared. Ensure the common analysis plan pre-specifies identical inclusion/exclusion criteria, exposure windows, confounder sets, and outcome definitions across all five countries. Note structural differences: DHMR has no Nordic equivalent; NorPD starts 2004, Kela covers reimbursed drugs only; LPR3 has no Nordic structural equivalent.');
  }

  return { registries: recs, warnings: warnings };
}

function renderCheckerResult() {
  var body = document.getElementById('reg-checker-body');
  if (!body) return;
  var result = computeRecommendations();

  var html = '<div class="reg-checker">';
  html += '<div class="reg-checker-result-header">Recommended data sources</div>';

  if (result.registries.length) {
    html += '<div class="reg-checker-rec-list">';
    result.registries.forEach(function(rec) {
      var reg = REGISTRIES.filter(function(r) { return r.id === rec.id; })[0];
      if (!reg) return;
      html += '<div class="reg-checker-rec-item">';
      html += '<div class="reg-checker-rec-top">';
      html += '<span class="reg-abbr-pill">' + escHtml(reg.abbreviation) + '</span>';
      html += '<span class="reg-checker-rec-name">' + escHtml(reg.shortName) + '</span>';
      html += '<span class="reg-cat-badge reg-cat-' + escHtml(reg.category) + '">' + escHtml(reg.category) + '</span>';
      html += '<button type="button" class="reg-checker-view-btn" data-id="' + escHtml(reg.id) + '">View profile</button>';
      html += '</div>';
      html += '<div class="reg-checker-rec-role"><em>Role:</em> ' + escHtml(rec.role) + '</div>';
      if (rec.note) {
        html += '<div class="reg-checker-rec-note">' + escHtml(rec.note) + '</div>';
      }
      html += '</div>';
    });
    html += '</div>';
  }

  if (result.warnings.length) {
    html += '<div class="reg-checker-warnings">';
    html += '<div class="reg-section-label" style="margin-bottom:0.5rem">Caveats &amp; planning notes</div>';
    result.warnings.forEach(function(w) {
      html += '<div class="warn-box reg-checker-warn-item">' + escHtml(w) + '</div>';
    });
    html += '</div>';
  }

  html += '<button type="button" class="reg-checker-reset-btn" id="checker-reset">Start over</button>';
  html += '</div>';

  body.innerHTML = html;

  body.querySelectorAll('.reg-checker-view-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = btn.getAttribute('data-id');
      /* Switch to catalog sub-tab and show the registry */
      switchRegSubTab('catalog');
      state.registry.country = 'DK';
      state.registry.category = 'all';
      state.registry.selectedId = id;
      buildCountryStrip();
      buildFilterBar();
      populateRegFilterAndSelect();
      var sel = document.getElementById('reg-select');
      if (sel) sel.value = id;
    });
  });

  var resetBtn = body.querySelector('#checker-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      state.registry.checker = { stepIndex: 0, answers: {}, done: false };
      renderCheckerStep();
    });
  }
}

/* =========================================================
   REGISTRY NAVIGATOR — SUB-TAB SWITCHING
   ========================================================= */
function switchRegSubTab(which) {
  var catalogBtn   = document.getElementById('reg-tab-catalog');
  var checkerBtn   = document.getElementById('reg-tab-checker');
  var catalogPanel = document.getElementById('reg-panel-catalog');
  var checkerPanel = document.getElementById('reg-panel-checker');
  if (!catalogBtn) return;

  if (which === 'catalog') {
    catalogBtn.setAttribute('aria-selected', 'true');
    checkerBtn.setAttribute('aria-selected', 'false');
    catalogBtn.tabIndex = 0;
    checkerBtn.tabIndex = -1;
    catalogPanel.removeAttribute('hidden');
    checkerPanel.setAttribute('hidden', '');
  } else {
    checkerBtn.setAttribute('aria-selected', 'true');
    catalogBtn.setAttribute('aria-selected', 'false');
    checkerBtn.tabIndex = 0;
    catalogBtn.tabIndex = -1;
    checkerPanel.removeAttribute('hidden');
    catalogPanel.setAttribute('hidden', '');
  }
}

function bindRegSubNav() {
  var catalogBtn = document.getElementById('reg-tab-catalog');
  var checkerBtn = document.getElementById('reg-tab-checker');
  if (!catalogBtn || !checkerBtn) return;
  catalogBtn.addEventListener('click', function() { switchRegSubTab('catalog'); });
  checkerBtn.addEventListener('click', function() { switchRegSubTab('checker'); });
  catalogBtn.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); checkerBtn.click(); checkerBtn.focus(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); catalogBtn.focus(); }
  });
  checkerBtn.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); catalogBtn.click(); catalogBtn.focus(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); checkerBtn.focus(); }
  });
}

/* =========================================================
   REGISTRY NAVIGATOR — INIT
   ========================================================= */
function initRegistryNavigator() {
  buildCountryStrip();
  buildFilterBar();
  populateRegFilterAndSelect();
  bindRegSubNav();
  initFeasibilityChecker();
}

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener('DOMContentLoaded', function() {
  initDarkMode();
  document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);

  bindTabNav();

  buildFormulaDropdown();
  buildDesignDropdown();
  buildBiasDropdown();
  buildBuilderDropdown();
  initRegistryNavigator();

  /* Restore last active tab */
  var lastTab = null;
  try { lastTab = sessionStorage.getItem('epi-tab'); } catch(e) {}
  if (lastTab && ['formulas', 'designs', 'biases', 'builder', 'registries'].indexOf(lastTab) !== -1) {
    showTab(lastTab);
    var sel = document.getElementById('tab-' + lastTab);
    if (sel) document.getElementById(sel.id);
  }
});
