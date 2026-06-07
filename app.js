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
  bias:   { selectedId: null }
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
   INIT
   ========================================================= */
document.addEventListener('DOMContentLoaded', function() {
  initDarkMode();
  document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);

  bindTabNav();

  buildFormulaDropdown();
  buildDesignDropdown();
  buildBiasDropdown();

  /* Restore last active tab */
  var lastTab = null;
  try { lastTab = sessionStorage.getItem('epi-tab'); } catch(e) {}
  if (lastTab && ['formulas', 'designs', 'biases'].indexOf(lastTab) !== -1) {
    showTab(lastTab);
    var sel = document.getElementById('tab-' + lastTab);
    if (sel) document.getElementById(sel.id);
  }
});
