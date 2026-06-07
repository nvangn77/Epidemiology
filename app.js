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
      effMods: '',
      mediators: '',
      colliders: '',
      customEdges: []
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

/* ── Graph helpers ── */

function getAllNodes(x, o, cs, meds, cols, ms) {
  var seen = {}, nodes = [];
  function add(n) { if (n && !seen[n]) { seen[n] = true; nodes.push(n); } }
  add(x); add(o);
  cs.forEach(add); meds.forEach(add); cols.forEach(add); ms.forEach(add);
  return nodes;
}

function getDefaultEdges(x, o, cs, meds, cols) {
  var edges = [];
  cs.forEach(function(c) {
    edges.push({from: c, to: x});
    edges.push({from: c, to: o});
  });
  if (meds.length) {
    edges.push({from: x, to: meds[0]});
    for (var i = 0; i < meds.length - 1; i++) edges.push({from: meds[i], to: meds[i+1]});
    edges.push({from: meds[meds.length - 1], to: o});
    edges.push({from: x, to: o});
  } else {
    edges.push({from: x, to: o});
  }
  cols.forEach(function(c) {
    edges.push({from: x, to: c});
    edges.push({from: o, to: c});
  });
  return edges;
}

function hasCycle(nodes, edges) {
  var adj = {};
  nodes.forEach(function(n) { adj[n] = []; });
  edges.forEach(function(e) {
    if (!adj[e.from]) adj[e.from] = [];
    adj[e.from].push(e.to);
  });
  var color = {};  /* 0=white 1=gray(stack) 2=black(done) */
  nodes.forEach(function(n) { color[n] = 0; });

  function dfs(u) {
    color[u] = 1;
    var nbrs = adj[u] || [];
    for (var i = 0; i < nbrs.length; i++) {
      var v = nbrs[i];
      if (color[v] === undefined) continue;
      if (color[v] === 1) return true;
      if (color[v] === 0 && dfs(v)) return true;
    }
    color[u] = 2;
    return false;
  }
  for (var i = 0; i < nodes.length; i++) {
    if (color[nodes[i]] === 0 && dfs(nodes[i])) return true;
  }
  return false;
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

/* ── Custom edge SVG (blue; arcs for same-row, straight otherwise) ── */
function svgCustomEdge(fp, tp, confounderY) {
  var dx = tp.x - fp.x, dy = tp.y - fp.y;
  var len = Math.sqrt(dx*dx + dy*dy);
  if (len < 8) return '';
  var nx = dx/len, ny = dy/len, r = 28;
  if (Math.abs(dy) < 20) {
    /* same row → arc above (confounders) or below (others) */
    var mx = (fp.x + tp.x) / 2;
    var arc = fp.y <= confounderY + 5 ? -30 : 30;
    var x1 = fp.x + (dx > 0 ? r : -r), x2 = tp.x + (dx > 0 ? -r : r);
    return '<path d="M '+x1+','+fp.y+' Q '+mx+','+(fp.y+arc)+' '+x2+','+tp.y+'"' +
      ' fill="none" stroke="var(--accent)" stroke-width="1.5" opacity="0.7"' +
      ' marker-end="url(#dagacu)"/>';
  }
  return dagArrow(fp.x+nx*r, fp.y+ny*r, tp.x-nx*r, tp.y-ny*r,
    'dagacu', 'var(--accent)', '1.5', '0.7', '');
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

  /* ── Additional relationships (custom edges) ── */
  var edgeDivider2 = document.createElement('div');
  edgeDivider2.className = 'builder-divider';
  inputs.appendChild(edgeDivider2);

  var edgeLbl = document.createElement('div');
  edgeLbl.className = 'builder-label';
  edgeLbl.textContent = 'Additional relationships';
  inputs.appendChild(edgeLbl);
  var edgeSub = document.createElement('div');
  edgeSub.className = 'builder-sublabel';
  edgeSub.textContent = 'Draw edges between named nodes; cycles blocked';
  inputs.appendChild(edgeSub);

  var edgeRow = document.createElement('div');
  edgeRow.className = 'edge-selector-row';

  var fromSel = document.createElement('select');
  fromSel.id = 'bld-edge-from';
  fromSel.className = 'edge-select';
  fromSel.innerHTML = '<option value="">From</option>';

  var arrowSpan = document.createElement('span');
  arrowSpan.className = 'edge-arrow-label';
  arrowSpan.textContent = '→';
  arrowSpan.setAttribute('aria-hidden', 'true');

  var toSel = document.createElement('select');
  toSel.id = 'bld-edge-to';
  toSel.className = 'edge-select';
  toSel.innerHTML = '<option value="">To</option>';

  var edgeAddBtn = document.createElement('button');
  edgeAddBtn.type = 'button';
  edgeAddBtn.className = 'edge-add-btn';
  edgeAddBtn.textContent = 'Add';

  edgeRow.appendChild(fromSel);
  edgeRow.appendChild(arrowSpan);
  edgeRow.appendChild(toSel);
  edgeRow.appendChild(edgeAddBtn);
  inputs.appendChild(edgeRow);

  var edgeError = document.createElement('div');
  edgeError.id = 'bld-edge-error';
  edgeError.className = 'edge-error';
  edgeError.setAttribute('hidden', '');
  inputs.appendChild(edgeError);

  var edgeListEl = document.createElement('div');
  edgeListEl.id = 'bld-edge-list';
  edgeListEl.className = 'edge-list';
  inputs.appendChild(edgeListEl);

  /* Live cycle/dupe validation */
  function liveValidateEdge() {
    var from = fromSel.value, to = toSel.value;
    var errEl = document.getElementById('bld-edge-error');
    if (!from || !to || from === to) { errEl.setAttribute('hidden', ''); return; }
    var dup = state.builder.vars.customEdges.some(function(e) { return e.from===from && e.to===to; });
    if (dup) { errEl.textContent = 'Relationship already exists.'; errEl.removeAttribute('hidden'); return; }
    var rv = currentBuilderVars();
    var allN = getAllNodes(rv.x, rv.o, rv.cs, rv.meds, rv.cols, rv.ms);
    var testEdges = getDefaultEdges(rv.x, rv.o, rv.cs, rv.meds, rv.cols)
      .concat(state.builder.vars.customEdges).concat([{from:from, to:to}]);
    if (hasCycle(allN, testEdges)) {
      errEl.textContent = '⛔ Would create a cycle — must remain acyclic.';
      errEl.removeAttribute('hidden');
    } else {
      errEl.setAttribute('hidden', '');
    }
  }
  fromSel.addEventListener('change', liveValidateEdge);
  toSel.addEventListener('change', liveValidateEdge);

  edgeAddBtn.addEventListener('click', function() {
    var from = fromSel.value, to = toSel.value;
    var errEl = document.getElementById('bld-edge-error');
    if (!from || !to) return;
    if (from === to) { errEl.textContent = 'Self-loops are not allowed.'; errEl.removeAttribute('hidden'); return; }
    var dup = state.builder.vars.customEdges.some(function(e) { return e.from===from && e.to===to; });
    if (dup) { errEl.textContent = 'Relationship already exists.'; errEl.removeAttribute('hidden'); return; }
    var rv = currentBuilderVars();
    var allN = getAllNodes(rv.x, rv.o, rv.cs, rv.meds, rv.cols, rv.ms);
    var testEdges = getDefaultEdges(rv.x, rv.o, rv.cs, rv.meds, rv.cols)
      .concat(state.builder.vars.customEdges).concat([{from:from, to:to}]);
    if (hasCycle(allN, testEdges)) {
      errEl.textContent = '⛔ Creates a cycle — DAG must remain acyclic.';
      errEl.removeAttribute('hidden'); return;
    }
    errEl.setAttribute('hidden', '');
    state.builder.vars.customEdges.push({from: from, to: to});
    fromSel.value = ''; toSel.value = '';
    updateBuilderOutput(def);
  });

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
  return {
    o:    state.builder.vars.outcome.trim()    || 'Y',
    x:    state.builder.vars.exposure.trim()   || 'X',
    cs:   parseVarList(state.builder.vars.confounders).slice(0, 8),
    ms:   parseVarList(state.builder.vars.effMods).slice(0, 3),
    meds: parseVarList(state.builder.vars.mediators).slice(0, 3),
    cols: parseVarList(state.builder.vars.colliders).slice(0, 3)
  };
}

function updateEdgeSelector(allNodes) {
  var fromSel = document.getElementById('bld-edge-from');
  var toSel   = document.getElementById('bld-edge-to');
  if (!fromSel || !toSel) return;

  /* Prune dangling custom edges */
  var nodeSet = {};
  allNodes.forEach(function(n) { nodeSet[n] = true; });
  state.builder.vars.customEdges = state.builder.vars.customEdges.filter(function(e) {
    return nodeSet[e.from] && nodeSet[e.to];
  });

  /* Rebuild options preserving current selection */
  var prevFrom = fromSel.value, prevTo = toSel.value;
  var makeOpts = function(sel, placeholder) {
    sel.innerHTML = '<option value="">' + placeholder + '</option>';
    allNodes.forEach(function(n) {
      var opt = document.createElement('option');
      opt.value = n; opt.textContent = n;
      sel.appendChild(opt);
    });
  };
  makeOpts(fromSel, 'From');
  makeOpts(toSel, 'To');

  if (nodeSet[prevFrom]) fromSel.value = prevFrom;
  if (nodeSet[prevTo])   toSel.value   = prevTo;

  renderEdgeList();
}

function renderEdgeList() {
  var listEl = document.getElementById('bld-edge-list');
  if (!listEl) return;
  var edges = state.builder.vars.customEdges;
  if (!edges.length) {
    listEl.innerHTML = '<div class="edge-list-empty">No additional relationships added.</div>';
    return;
  }
  listEl.innerHTML = edges.map(function(e, i) {
    return '<div class="edge-item">' +
      '<span class="edge-item-label">' + escHtml(e.from) + ' → ' + escHtml(e.to) + '</span>' +
      '<button type="button" class="edge-remove-btn" data-idx="' + i + '" aria-label="Remove ' +
        escHtml(e.from) + ' to ' + escHtml(e.to) + '">✕</button>' +
      '</div>';
  }).join('');

  listEl.querySelectorAll('.edge-remove-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var idx = parseInt(btn.getAttribute('data-idx'), 10);
      state.builder.vars.customEdges.splice(idx, 1);
      /* Re-run output using stored def via selectBuilderModel trick */
      var modelId = state.builder.modelId;
      var def = null;
      for (var mi = 0; mi < MODELS.length; mi++) { if (MODELS[mi].id === modelId) { def = MODELS[mi]; break; } }
      if (def) updateBuilderOutput(def);
    });
  });
}

function updateBuilderOutput(def) {
  var rv   = currentBuilderVars();
  var o    = rv.o, x = rv.x, cs = rv.cs, ms = rv.ms, meds = rv.meds, cols = rv.cols;
  var allNodes = getAllNodes(x, o, cs, meds, cols, ms);

  updateEdgeSelector(allNodes);

  /* Formula */
  var formulaEl = document.getElementById('bld-formula-block');
  if (formulaEl) formulaEl.textContent = def.buildFormula(o, x, cs, ms);

  /* Effect note */
  var noteEl = document.getElementById('bld-effect-note');
  if (noteEl) noteEl.textContent = def.effectNote(x, o);

  /* DAG + advice */
  var dagWrap = document.getElementById('bld-dag-wrap');
  if (dagWrap) dagWrap.innerHTML = buildDAGSvg(x, o, cs, ms, meds, cols, state.builder.vars.customEdges);
  var dagAdviceEl = document.getElementById('bld-dag-advice');
  if (dagAdviceEl) dagAdviceEl.innerHTML = buildAdjustmentAdvice(x, o, meds, cols);

  /* R code */
  var rcodeEl = document.getElementById('bld-rcode-block');
  if (rcodeEl) rcodeEl.textContent = def.rCode(o, x, cs, ms);
}

function buildDAGSvg(x, o, cs, ms, meds, cols, customEdges) {
  meds = meds || [];
  cols = cols || [];
  customEdges = customEdges || [];

  var dCs   = cs.slice(0, 5);
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
  var mainY = hasCs ? 128 : 110;
  var confY = 30;
  var colY  = mainY + 92;
  var emY   = hasCols ? colY + 52 : mainY + 92;

  var H = mainY + 70;
  if (hasCols) H = Math.max(H, colY + 28);
  if (hasMs)   H = Math.max(H, emY + 25);
  H = Math.max(H, mainY + 55);

  var midX = (expX + outX) / 2;

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

  /* Filter custom edges — both endpoints must be in pos */
  var validCustom = customEdges.filter(function(e) { return pos[e.from] && pos[e.to]; });

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
    '<marker id="dagacu" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">' +
    '<polygon points="0 0,7 2.5,0 5" fill="var(--accent)" opacity="0.75"/></marker>' +
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

  /* ── CUSTOM EDGES (accent color, rendered in arrows layer) ── */
  validCustom.forEach(function(e) {
    aB += svgCustomEdge(pos[e.from], pos[e.to], confY);
  });

  /* ── NODES: confounders ── */
  if (hasCs) {
    nB += dagLbl(W/2, 11, 'Confounders', 'currentColor', '0.42');
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
