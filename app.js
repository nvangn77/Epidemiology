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
      effMods: ''
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
  var categoryOrder = ['experimental', 'observational', 'self-controlled', 'quasi-experimental'];
  var categoryLabels = {
    experimental:     'Experimental',
    observational:    'Observational',
    'self-controlled':'Self-controlled',
    'quasi-experimental': 'Quasi-experimental'
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

  var confF = makeField('Confounders', 'Comma-separated list', 'bld-conf', 'age, sex, diabetes, CCI');
  confF.inp.value = state.builder.vars.confounders;
  confF.inp.addEventListener('input', function() {
    state.builder.vars.confounders = confF.inp.value;
    updateBuilderOutput(def);
  });
  confF.field.appendChild(confF.inp);
  inputs.appendChild(confF.field);

  var emF = makeField('Effect modifier(s)', 'Comma-separated; adds interaction term(s)', 'bld-em', 'sex, age_group');
  emF.inp.value = state.builder.vars.effMods;
  emF.inp.addEventListener('input', function() {
    state.builder.vars.effMods = emF.inp.value;
    updateBuilderOutput(def);
  });
  emF.field.appendChild(emF.inp);
  inputs.appendChild(emF.field);

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

function updateBuilderOutput(def) {
  var o = state.builder.vars.outcome.trim() || 'Y';
  var x = state.builder.vars.exposure.trim() || 'X';
  var cs = parseVarList(state.builder.vars.confounders).slice(0, 8);
  var ms = parseVarList(state.builder.vars.effMods).slice(0, 3);

  /* Formula */
  var formulaEl = document.getElementById('bld-formula-block');
  if (formulaEl) formulaEl.textContent = def.buildFormula(o, x, cs, ms);

  /* Effect note */
  var noteEl = document.getElementById('bld-effect-note');
  if (noteEl) noteEl.textContent = def.effectNote(x, o);

  /* DAG */
  var dagWrap = document.getElementById('bld-dag-wrap');
  if (dagWrap) dagWrap.innerHTML = buildDAGSvg(x, o, cs, ms);

  /* R code */
  var rcodeEl = document.getElementById('bld-rcode-block');
  if (rcodeEl) rcodeEl.textContent = def.rCode(o, x, cs, ms);
}

function buildDAGSvg(x, o, cs, ms) {
  var W = 400, H = 210;
  var expX = 88, expY = 110;
  var outX = 312, outY = 110;

  /* Limit nodes for readability */
  var displayCs = cs.slice(0, 5);
  var displayMs = ms.slice(0, 2);

  var hasCs = displayCs.length > 0;
  var hasMs = displayMs.length > 0;

  var svg = '<svg role="img" viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto">' +
    '<title>Directed acyclic graph</title>' +
    '<desc>DAG showing relationships between ' + escHtml(x) + ', ' + escHtml(o) +
    (hasCs ? ', confounders' : '') + (hasMs ? ', and effect modifiers' : '') + '</desc>' +
    '<defs>' +
    '<marker id="dag-a" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">' +
    '<polygon points="0 0, 7 2.5, 0 5" fill="currentColor" opacity="0.65"/></marker>' +
    '<marker id="dag-am" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">' +
    '<polygon points="0 0, 7 2.5, 0 5" fill="var(--svg-period)" opacity="0.8"/></marker>' +
    '</defs>';

  /* Exposure → Outcome main arrow */
  svg += '<line x1="' + (expX+38) + '" y1="' + expY + '" x2="' + (outX-38) + '" y2="' + outY +
    '" stroke="currentColor" stroke-width="2" opacity="0.75" marker-end="url(#dag-a)"/>';

  /* Confounders */
  if (hasCs) {
    var cCount = displayCs.length;
    var cGap = Math.min(72, (W - 60) / (cCount + 1));
    var cTotalW = cGap * (cCount - 1);
    var cLeft = (W - cTotalW) / 2;

    displayCs.forEach(function(c, i) {
      var cx = cLeft + i * cGap;
      var cy = 32;
      var cLbl = c.length > 9 ? c.slice(0, 8) + '…' : c;

      /* C → Exposure */
      svg += '<line x1="' + cx + '" y1="' + (cy + 14) + '" x2="' + (expX + 12) + '" y2="' + (expY - 14) +
        '" stroke="currentColor" stroke-width="1.4" opacity="0.5" stroke-dasharray="4,3" marker-end="url(#dag-a)"/>';
      /* C → Outcome */
      svg += '<line x1="' + cx + '" y1="' + (cy + 14) + '" x2="' + (outX - 12) + '" y2="' + (outY - 14) +
        '" stroke="currentColor" stroke-width="1.4" opacity="0.5" stroke-dasharray="4,3" marker-end="url(#dag-a)"/>';

      /* C node */
      svg += '<rect x="' + (cx - 24) + '" y="' + (cy - 13) + '" width="48" height="24" rx="5"' +
        ' fill="var(--bg)" stroke="currentColor" stroke-width="1.4" opacity="0.8"/>';
      svg += '<text x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle" font-size="9"' +
        ' fill="currentColor" font-family="system-ui,sans-serif">' + escHtml(cLbl) + '</text>';
    });

    svg += '<text x="' + W/2 + '" y="11" text-anchor="middle" font-size="8" fill="currentColor"' +
      ' opacity="0.5" font-family="system-ui,sans-serif">Confounders</text>';
  }

  /* Effect modifiers */
  if (hasMs) {
    var midX = (expX + outX) / 2;
    var midY = expY;
    var mCount = displayMs.length;
    var mGap = 80;
    var mLeft = midX - mGap * (mCount - 1) / 2;

    displayMs.forEach(function(m, i) {
      var mx = mLeft + i * mGap;
      var my = 185;
      var mLbl = m.length > 9 ? m.slice(0, 8) + '…' : m;

      /* M → midpoint of E→O arrow */
      svg += '<line x1="' + mx + '" y1="' + (my - 14) + '" x2="' + midX + '" y2="' + (midY + 10) +
        '" stroke="var(--svg-period)" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#dag-am)"/>';

      svg += '<rect x="' + (mx - 24) + '" y="' + (my - 13) + '" width="48" height="24" rx="5"' +
        ' fill="var(--bg)" stroke="var(--svg-period)" stroke-width="1.4"/>';
      svg += '<text x="' + mx + '" y="' + (my + 4) + '" text-anchor="middle" font-size="9"' +
        ' fill="var(--svg-period)" font-family="system-ui,sans-serif">' + escHtml(mLbl) + '</text>';
    });

    svg += '<text x="' + W/2 + '" y="' + (H - 2) + '" text-anchor="middle" font-size="8"' +
      ' fill="var(--svg-period)" opacity="0.7" font-family="system-ui,sans-serif">Effect modifier(s) → interaction</text>';
  }

  /* Exposure node */
  var xLbl = x.length > 11 ? x.slice(0, 10) + '…' : x;
  svg += '<rect x="' + (expX - 38) + '" y="' + (expY - 17) + '" width="76" height="34" rx="7"' +
    ' fill="var(--svg-exposed)" opacity="0.15" stroke="var(--svg-exposed)" stroke-width="2"/>';
  svg += '<text x="' + expX + '" y="' + (expY + 5) + '" text-anchor="middle" font-size="10"' +
    ' fill="var(--svg-exposed)" font-weight="600" font-family="system-ui,sans-serif">' + escHtml(xLbl) + '</text>';
  svg += '<text x="' + expX + '" y="' + (expY + 24) + '" text-anchor="middle" font-size="8"' +
    ' fill="var(--svg-exposed)" opacity="0.7" font-family="system-ui,sans-serif">Exposure</text>';

  /* Outcome node */
  var oLbl = o.length > 11 ? o.slice(0, 10) + '…' : o;
  svg += '<rect x="' + (outX - 38) + '" y="' + (outY - 17) + '" width="76" height="34" rx="7"' +
    ' fill="var(--svg-event)" opacity="0.15" stroke="var(--svg-event)" stroke-width="2"/>';
  svg += '<text x="' + outX + '" y="' + (outY + 5) + '" text-anchor="middle" font-size="10"' +
    ' fill="var(--svg-event)" font-weight="600" font-family="system-ui,sans-serif">' + escHtml(oLbl) + '</text>';
  svg += '<text x="' + outX + '" y="' + (outY + 24) + '" text-anchor="middle" font-size="8"' +
    ' fill="var(--svg-event)" opacity="0.7" font-family="system-ui,sans-serif">Outcome</text>';

  svg += '</svg>';
  return svg;
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

  /* Restore last active tab */
  var lastTab = null;
  try { lastTab = sessionStorage.getItem('epi-tab'); } catch(e) {}
  if (lastTab && ['formulas', 'designs', 'biases', 'builder'].indexOf(lastTab) !== -1) {
    showTab(lastTab);
    var sel = document.getElementById('tab-' + lastTab);
    if (sel) document.getElementById(sel.id);
  }
});
