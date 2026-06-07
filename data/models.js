/* =========================================================
   data/models.js — MODELS global
   Each model has: id, label, category, outcomeType, effectMeasure,
   link, description, useWhen, assumptions[], buildFormula(o,x,cs,ms),
   effectNote(x,o), rCode(o,x,cs,ms), danishContext, outputSvg
   ========================================================= */

var MODELS = [
  {
    id: 'linear',
    label: 'Linear regression (OLS)',
    category: 'continuous',
    outcomeType: 'Continuous',
    effectMeasure: 'Mean difference (β₁)',
    link: 'Identity — E[Y] = Xβ',
    description: 'Estimates the expected absolute difference in a continuous outcome per unit change in exposure, adjusted for covariates.',
    useWhen: 'Outcome is continuous and approximately normally distributed (or N is large). Gives absolute differences in means — interpretable and easy to communicate. Suitable when you want a risk difference analog for continuous outcomes. Avoid for count outcomes or when the outcome is bounded (use Poisson or log-binomial instead).',
    assumptions: [
      'Linearity: E[Y|X, C] is a linear function of all predictors',
      'Independence: observations are independent of each other',
      'Homoscedasticity: residual variance is constant across fitted values (check residual vs. fitted plot)',
      'Normality of residuals — needed for inference in small samples; not required for large N (CLT applies)',
      'No perfect multicollinearity among predictors'
    ],
    buildFormula: function(o, x, cs, ms) {
      var terms = ['β₀', 'β₁·' + x];
      cs.forEach(function(c, i) { terms.push('β' + subscript(i+2) + '·' + c); });
      var ni = cs.length + 2;
      ms.forEach(function(m, i) {
        terms.push('β' + subscript(ni + i*2) + '·' + m);
        terms.push('β' + subscript(ni + i*2 + 1) + '·(' + x + '×' + m + ')');
      });
      return 'E[' + o + '] = ' + terms.join(' + ');
    },
    effectNote: function(x) {
      return 'β₁ = mean difference in outcome per unit increase in ' + (x||'exposure') + ', holding all covariates constant. Report with 95% CI and p-value.';
    },
    rCode: function(o, x, cs, ms) {
      var rhs = [x].concat(cs);
      var csSet = {}; cs.forEach(function(c) { csSet[c] = true; });
      ms.forEach(function(m) { rhs.push(x + ':' + m); if (!csSet[m]) rhs.push(m); });
      return [
        'model <- lm(' + (o||'outcome') + ' ~ ' + rhs.join(' + ') + ', data = df)',
        'summary(model)',
        'confint(model)                     # Wald 95% CI',
        '',
        '# Robust (HC3) standard errors — recommended when N is large or',
        '# homoscedasticity assumption may be violated:',
        'library(sandwich); library(lmtest)',
        'coeftest(model, vcov = vcovHC(model, type = "HC3"))',
        'coefci(model,   vcov = vcovHC(model, type = "HC3"))',
        '',
        '# For clustered data (repeated observations per subject):',
        'coeftest(model, vcov = vcovCL(model, cluster = ~id))'
      ].join('\n');
    },
    danishContext: 'Suitable for continuous outcomes from Danish registers (length of hospital stay, drug dose, HbA1c, eGFR). For panel data (repeated measures per patient), use mixed-effects models or GEE with robust SEs. Always inspect residual plots and check for influential observations.',
    outputSvg: '<svg role="img" viewBox="0 0 400 200" style="width:100%;height:auto"><title>Linear regression: scatter plot with fitted line and confidence band</title><desc>Scatter plot showing data points with a fitted regression line and 95% confidence band</desc><line x1="55" y1="165" x2="380" y2="165" stroke="currentColor" stroke-width="1.5"/><line x1="55" y1="15" x2="55" y2="165" stroke="currentColor" stroke-width="1.5"/><polygon points="70,152 375,68 375,56 70,140" fill="var(--svg-exposed)" opacity="0.12"/><line x1="70" y1="146" x2="375" y2="62" stroke="var(--svg-exposed)" stroke-width="2.5"/><circle cx="80" cy="155" r="3.5" fill="currentColor" opacity="0.55"/><circle cx="105" cy="142" r="3.5" fill="currentColor" opacity="0.55"/><circle cx="135" cy="135" r="3.5" fill="currentColor" opacity="0.55"/><circle cx="165" cy="125" r="3.5" fill="currentColor" opacity="0.55"/><circle cx="195" cy="120" r="3.5" fill="currentColor" opacity="0.55"/><circle cx="225" cy="108" r="3.5" fill="currentColor" opacity="0.55"/><circle cx="260" cy="102" r="3.5" fill="currentColor" opacity="0.55"/><circle cx="295" cy="92" r="3.5" fill="currentColor" opacity="0.55"/><circle cx="325" cy="84" r="3.5" fill="currentColor" opacity="0.55"/><circle cx="360" cy="76" r="3.5" fill="currentColor" opacity="0.55"/><text x="218" y="185" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.7" font-family="system-ui,sans-serif">Exposure (X)</text><text x="18" y="90" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.7" font-family="system-ui,sans-serif" transform="rotate(-90 18 90)">Outcome (Y)</text><text x="340" y="55" font-size="10" fill="var(--svg-exposed)" font-family="system-ui,sans-serif">slope = β₁</text><text x="340" y="67" font-size="9" fill="var(--svg-exposed)" opacity="0.6" font-family="system-ui,sans-serif">95% CI band</text></svg>'
  },

  {
    id: 'logistic',
    label: 'Logistic regression',
    category: 'binary',
    outcomeType: 'Binary (0/1)',
    effectMeasure: 'Odds Ratio — OR = exp(β₁)',
    link: 'Logit — log(p / (1−p)) = Xβ',
    description: 'Models the log-odds of a binary outcome as a linear combination of predictors. The exponentiated coefficient gives the odds ratio.',
    useWhen: 'Binary outcome (event/no-event). The workhorse for case-control studies (ORs are the natural estimand). In cohort studies, OR approximates RR only when the outcome is rare (<10%). For common outcomes in cohorts, use log-binomial or Poisson to estimate RR directly. Avoid when risk ratios or risk differences are of primary interest.',
    assumptions: [
      'Binary outcome: Y ∈ {0, 1}',
      'Log-odds is a linear function of predictors (logit-linearity)',
      'Independence of observations (no clustering within subjects)',
      'No complete separation: predictors should not perfectly predict the outcome',
      'Large enough sample: rule of thumb ≥10 events per predictor variable (EPV)'
    ],
    buildFormula: function(o, x, cs, ms) {
      var terms = ['β₀', 'β₁·' + x];
      cs.forEach(function(c, i) { terms.push('β' + subscript(i+2) + '·' + c); });
      var ni = cs.length + 2;
      ms.forEach(function(m, i) {
        terms.push('β' + subscript(ni + i*2) + '·' + m);
        terms.push('β' + subscript(ni + i*2 + 1) + '·(' + x + '×' + m + ')');
      });
      return 'logit(P(' + o + '=1)) = ' + terms.join(' + ') + '\n\nOR = exp(β₁)';
    },
    effectNote: function(x) {
      return 'OR = exp(β₁): odds ratio for a one-unit increase in ' + (x||'exposure') + '. Interpret as the multiplicative change in odds of the outcome. Approximates RR only when outcome prevalence is <10%.';
    },
    rCode: function(o, x, cs, ms) {
      var rhs = [x].concat(cs);
      var csSet = {}; cs.forEach(function(c) { csSet[c] = true; });
      ms.forEach(function(m) { rhs.push(x + ':' + m); if (!csSet[m]) rhs.push(m); });
      return [
        'model <- glm(' + (o||'outcome') + ' ~ ' + rhs.join(' + ') + ',',
        '             family = binomial(link = "logit"), data = df)',
        'summary(model)',
        '',
        '# Odds ratios with 95% CI (profile likelihood):',
        'exp(cbind(OR = coef(model), confint(model)))',
        '',
        '# Robust SEs (when data are clustered or to guard against misspecification):',
        'library(sandwich); library(lmtest)',
        'coeftest(model, vcov = vcovHC(model, type = "HC3"))',
        '',
        '# Predicted probabilities:',
        'predict(model, type = "response")'
      ].join('\n');
    },
    danishContext: 'Standard for case-control studies using Danish registers (e.g., nested case-control within a cohort). When using conditional logistic regression for matched designs (e.g., matched on birth year, sex), use clogit() instead. For common binary outcomes in cohort studies (prevalence >10%), consider log-binomial or Poisson with robust SEs.',
    outputSvg: '<svg role="img" viewBox="0 0 400 200" style="width:100%;height:auto"><title>Logistic regression: S-shaped probability curve</title><desc>S-shaped logistic curve showing predicted probability of outcome as a function of exposure</desc><line x1="55" y1="165" x2="380" y2="165" stroke="currentColor" stroke-width="1.5"/><line x1="55" y1="15" x2="55" y2="165" stroke="currentColor" stroke-width="1.5"/><line x1="50" y1="165" x2="58" y2="165" stroke="currentColor" stroke-width="1.5"/><line x1="50" y1="90" x2="58" y2="90" stroke="currentColor" stroke-width="1.5"/><line x1="50" y1="15" x2="58" y2="15" stroke="currentColor" stroke-width="1.5"/><text x="46" y="168" text-anchor="end" font-size="9" fill="currentColor" opacity="0.6" font-family="system-ui,sans-serif">0</text><text x="46" y="93" text-anchor="end" font-size="9" fill="currentColor" opacity="0.6" font-family="system-ui,sans-serif">0.5</text><text x="46" y="18" text-anchor="end" font-size="9" fill="currentColor" opacity="0.6" font-family="system-ui,sans-serif">1</text><line x1="58" y1="90" x2="378" y2="90" stroke="currentColor" stroke-width="1" stroke-dasharray="4,4" opacity="0.3"/><path d="M68,161 C90,159 115,155 140,145 C165,134 185,118 207,100 C229,82 248,66 270,56 C292,46 318,40 345,38 C360,37 373,36 378,36" fill="none" stroke="var(--svg-exposed)" stroke-width="2.5"/><text x="218" y="185" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.7" font-family="system-ui,sans-serif">Exposure (X)</text><text x="15" y="90" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7" font-family="system-ui,sans-serif" transform="rotate(-90 15 90)">P(outcome=1)</text><text x="355" y="30" font-size="9" fill="var(--svg-exposed)" font-family="system-ui,sans-serif">logit curve</text><text x="265" y="105" font-size="9" fill="currentColor" opacity="0.5" font-family="system-ui,sans-serif">p=0.5</text></svg>'
  },

  {
    id: 'log-binomial',
    label: 'Log-binomial regression',
    category: 'binary',
    outcomeType: 'Binary (0/1)',
    effectMeasure: 'Risk Ratio — RR = exp(β₁)',
    link: 'Log — log(P(Y=1)) = Xβ',
    description: 'Directly estimates risk ratios for binary outcomes by modelling log-probability as a linear function of predictors.',
    useWhen: 'Binary outcome in a cohort study where risk ratios are the preferred measure (especially when outcome is common, making OR a poor approximation of RR). Preferred over logistic when you want RR rather than OR. Warning: the model frequently fails to converge — use Poisson with robust SEs (same β, correct CI) as a fallback.',
    assumptions: [
      'Binary outcome: Y ∈ {0, 1}',
      'Log-risk is a linear function of predictors',
      'Predicted probabilities must remain between 0 and 1 (convergence may fail at boundary)',
      'Independence of observations',
      'Adequate sample size; sparse data causes convergence problems'
    ],
    buildFormula: function(o, x, cs, ms) {
      var terms = ['β₀', 'β₁·' + x];
      cs.forEach(function(c, i) { terms.push('β' + subscript(i+2) + '·' + c); });
      var ni = cs.length + 2;
      ms.forEach(function(m, i) {
        terms.push('β' + subscript(ni + i*2) + '·' + m);
        terms.push('β' + subscript(ni + i*2 + 1) + '·(' + x + '×' + m + ')');
      });
      return 'log(P(' + o + '=1)) = ' + terms.join(' + ') + '\n\nRR = exp(β₁)';
    },
    effectNote: function(x) {
      return 'RR = exp(β₁): risk ratio (relative risk) comparing exposed to unexposed for ' + (x||'exposure') + '. Directly interpretable as the ratio of probabilities.';
    },
    rCode: function(o, x, cs, ms) {
      var rhs = [x].concat(cs);
      var csSet = {}; cs.forEach(function(c) { csSet[c] = true; });
      ms.forEach(function(m) { rhs.push(x + ':' + m); if (!csSet[m]) rhs.push(m); });
      return [
        '# Log-binomial (may fail to converge for common outcomes):',
        'model <- glm(' + (o||'outcome') + ' ~ ' + rhs.join(' + ') + ',',
        '             family = binomial(link = "log"), data = df)',
        'exp(cbind(RR = coef(model), confint(model)))',
        '',
        '# Fallback — Poisson with robust SEs (gives same β, valid CI):',
        'model_p <- glm(' + (o||'outcome') + ' ~ ' + rhs.join(' + ') + ',',
        '               family = poisson(link = "log"), data = df)',
        'library(sandwich); library(lmtest)',
        'coeftest(model_p, vcov = vcovHC(model_p, type = "HC3"))',
        'exp(coef(model_p))                # RR point estimates',
        '',
        '# Or use modified Poisson (Zou 2004 approach) via MASS::glm.nb as fallback'
      ].join('\n');
    },
    danishContext: 'Useful when reporting RRs in Danish register-based cohort studies with common binary outcomes (e.g., hospitalisation, all-cause mortality at 1 year). Poisson with robust SEs is often used instead due to convergence issues. The βs are identical; only the SEs differ.',
    outputSvg: '<svg role="img" viewBox="0 0 400 200" style="width:100%;height:auto"><title>Log-binomial regression: risk ratio illustration</title><desc>Two horizontal bar charts showing risk in exposed and unexposed groups with RR annotation</desc><rect x="80" y="50" width="180" height="30" rx="4" fill="var(--svg-exposed)" opacity="0.8"/><rect x="80" y="100" width="90" height="30" rx="4" fill="var(--svg-control)" opacity="0.6"/><line x1="80" y1="40" x2="80" y2="145" stroke="currentColor" stroke-width="1.5"/><text x="268" y="70" font-size="11" fill="var(--svg-exposed)" font-family="system-ui,sans-serif">Risk₁ = 0.30</text><text x="178" y="120" font-size="11" fill="var(--svg-control)" font-family="system-ui,sans-serif">Risk₀ = 0.15</text><text x="60" y="70" text-anchor="end" font-size="10" fill="currentColor" opacity="0.7" font-family="system-ui,sans-serif">Exposed</text><text x="60" y="120" text-anchor="end" font-size="10" fill="currentColor" opacity="0.7" font-family="system-ui,sans-serif">Unexposed</text><text x="240" y="165" font-size="13" fill="var(--svg-exposed)" font-weight="600" font-family="system-ui,sans-serif">RR = exp(β₁) = 2.0</text><line x1="80" y1="155" x2="380" y2="155" stroke="currentColor" stroke-width="1" opacity="0.3"/><text x="80" y="172" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.5" font-family="system-ui,sans-serif">0</text><text x="230" y="172" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.5" font-family="system-ui,sans-serif">Risk</text></svg>'
  },

  {
    id: 'cox',
    label: 'Cox proportional hazards',
    category: 'time-to-event',
    outcomeType: 'Time-to-event (survival)',
    effectMeasure: 'Hazard Ratio — HR = exp(β₁)',
    link: 'Proportional hazards — h(t|X) = h₀(t)·exp(Xβ)',
    description: 'Semi-parametric survival model estimating hazard ratios while leaving the baseline hazard unspecified. Handles right-censoring and time-varying covariates.',
    useWhen: 'Outcome is time to an event (death, hospitalisation, treatment discontinuation) with right-censoring. The standard model for survival analysis in pharmacoepidemiology. Assumes hazards are proportional over time (check with Schoenfeld residuals or scaled Schoenfeld test). For non-proportional hazards use time-varying coefficients or flexible parametric models.',
    assumptions: [
      'Proportional hazards: the HR between any two individuals is constant over time (HR does not depend on t)',
      'Independence of censoring: censoring mechanism is unrelated to the risk of the event',
      'Linear relationship between log-hazard and continuous predictors',
      'No tied event times (handle with Breslow, Efron, or exact methods)',
      'Observations are independent (for clustered data use robust or frailty models)'
    ],
    buildFormula: function(o, x, cs, ms) {
      var terms = ['β₁·' + x];
      cs.forEach(function(c, i) { terms.push('β' + subscript(i+2) + '·' + c); });
      var ni = cs.length + 2;
      ms.forEach(function(m, i) {
        terms.push('β' + subscript(ni + i*2) + '·' + m);
        terms.push('β' + subscript(ni + i*2 + 1) + '·(' + x + '×' + m + ')');
      });
      return 'h(t | ' + x + (cs.length ? ', C' : '') + ') = h₀(t) · exp(' + terms.join(' + ') + ')\n\nHR = exp(β₁)';
    },
    effectNote: function(x) {
      return 'HR = exp(β₁): the instantaneous rate of the event in exposed vs. unexposed at any point in time, assuming proportional hazards. If HR is constant over time, it can be interpreted similarly to a rate ratio.';
    },
    rCode: function(o, x, cs, ms) {
      var rhs = [x].concat(cs);
      var csSet = {}; cs.forEach(function(c) { csSet[c] = true; });
      ms.forEach(function(m) { rhs.push(x + ':' + m); if (!csSet[m]) rhs.push(m); });
      return [
        'library(survival)',
        '',
        '# Basic Cox model:',
        'model <- coxph(Surv(time_to_event, ' + (o||'event') + ') ~ ' + rhs.join(' + ') + ',',
        '               data = df, ties = "efron")',
        'summary(model)                     # HRs, CIs, p-values',
        '',
        '# Test proportional hazards assumption:',
        'cox.zph(model)',
        'plot(cox.zph(model))               # Schoenfeld residuals',
        '',
        '# Robust SEs for clustered data:',
        'coxph(Surv(time_to_event, ' + (o||'event') + ') ~ ' + rhs.join(' + ') + ' + cluster(id),',
        '      data = df)',
        '',
        '# Kaplan-Meier curves (unadjusted):',
        'km <- survfit(Surv(time_to_event, ' + (o||'event') + ') ~ ' + x + ', data = df)',
        'plot(km, col = c("steelblue","grey50"), xlab = "Time", ylab = "Survival")'
      ].join('\n');
    },
    danishContext: 'The dominant model in Danish register-based pharmacoepidemiology. Entry time is typically first prescription/diagnosis date; exit is event, emigration, death, or end of follow-up. Use calendar time as time scale when comparing cohorts over different calendar periods. For active comparator designs, ensure comparability of follow-up start.',
    outputSvg: '<svg role="img" viewBox="0 0 400 200" style="width:100%;height:auto"><title>Cox regression: Kaplan-Meier survival curves for two groups</title><desc>Two Kaplan-Meier survival curves: exposed group drops faster than unexposed</desc><line x1="55" y1="165" x2="385" y2="165" stroke="currentColor" stroke-width="1.5"/><line x1="55" y1="15" x2="55" y2="165" stroke="currentColor" stroke-width="1.5"/><text x="46" y="168" text-anchor="end" font-size="9" fill="currentColor" opacity="0.6" font-family="system-ui,sans-serif">0</text><text x="44" y="18" text-anchor="end" font-size="9" fill="currentColor" opacity="0.6" font-family="system-ui,sans-serif">1.0</text><text x="44" y="93" text-anchor="end" font-size="9" fill="currentColor" opacity="0.6" font-family="system-ui,sans-serif">0.5</text><line x1="50" y1="90" x2="58" y2="90" stroke="currentColor" stroke-width="1.5"/><line x1="50" y1="15" x2="58" y2="15" stroke="currentColor" stroke-width="1.5"/><polyline points="55,18 100,18 100,35 145,35 145,55 195,55 195,72 245,72 245,90 295,90 295,108 345,108 345,128 385,128" fill="none" stroke="var(--svg-control)" stroke-width="2"/><polyline points="55,18 90,18 90,42 130,42 130,68 170,68 170,96 210,96 210,120 255,120 255,140 300,140 300,155 385,155" fill="none" stroke="var(--svg-exposed)" stroke-width="2"/><text x="355" y="122" font-size="10" fill="var(--svg-control)" font-family="system-ui,sans-serif">Ref</text><text x="310" y="150" font-size="10" fill="var(--svg-exposed)" font-family="system-ui,sans-serif">Exposed</text><text x="218" y="185" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.7" font-family="system-ui,sans-serif">Time (years)</text><text x="15" y="90" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7" font-family="system-ui,sans-serif" transform="rotate(-90 15 90)">Survival</text><text x="280" y="38" font-size="10" fill="var(--svg-exposed)" font-family="system-ui,sans-serif">HR = exp(β₁)</text></svg>'
  },

  {
    id: 'poisson',
    label: 'Poisson regression',
    category: 'count',
    outcomeType: 'Count / rate (with offset)',
    effectMeasure: 'Incidence Rate Ratio — IRR = exp(β₁)',
    link: 'Log — log(μ) = log(T) + Xβ',
    description: 'Models event counts (or rates via log-offset for person-time) assuming Poisson-distributed outcomes. Can also be used with robust SEs to estimate risk ratios for binary outcomes (modified Poisson).',
    useWhen: 'Outcome is a count of events or an incidence rate (events / person-time). Use when individuals can experience multiple events or when modelling population-level rates. Also the fallback for log-binomial convergence failures (binary outcome, Poisson with robust SEs gives valid RR CIs). Check for overdispersion — if variance >> mean, use negative binomial instead.',
    assumptions: [
      'Poisson distribution: variance equals mean (equidispersion) — check with deviance/df ≈ 1',
      'Log-linearity: log(rate) is a linear function of predictors',
      'Independence of events within and between individuals',
      'Correct offset: person-time at risk must be correctly computed and included as log(T)',
      'No excess zeros (use hurdle or zero-inflated models if zeros are abundant)'
    ],
    buildFormula: function(o, x, cs, ms) {
      var terms = ['β₀', 'β₁·' + x];
      cs.forEach(function(c, i) { terms.push('β' + subscript(i+2) + '·' + c); });
      var ni = cs.length + 2;
      ms.forEach(function(m, i) {
        terms.push('β' + subscript(ni + i*2) + '·' + m);
        terms.push('β' + subscript(ni + i*2 + 1) + '·(' + x + '×' + m + ')');
      });
      return 'log(E[' + o + ']) = log(T) + ' + terms.join(' + ') + '\n\nIRR = exp(β₁)';
    },
    effectNote: function(x) {
      return 'IRR = exp(β₁): incidence rate ratio for a one-unit increase in ' + (x||'exposure') + '. With binary exposure, it is the ratio of event rates (exposed / unexposed). log(T) is the person-time offset.';
    },
    rCode: function(o, x, cs, ms) {
      var rhs = [x].concat(cs);
      var csSet = {}; cs.forEach(function(c) { csSet[c] = true; });
      ms.forEach(function(m) { rhs.push(x + ':' + m); if (!csSet[m]) rhs.push(m); });
      return [
        '# Poisson regression with person-time offset:',
        'model <- glm(' + (o||'events') + ' ~ ' + rhs.join(' + ') + ' + offset(log(person_time)),',
        '             family = poisson(link = "log"), data = df)',
        'summary(model)',
        'exp(cbind(IRR = coef(model), confint(model)))',
        '',
        '# Check for overdispersion (deviance/df should be ~1):',
        'deviance(model) / df.residual(model)',
        '',
        '# Modified Poisson for binary outcome (Zou 2004) — robust SEs:',
        'library(sandwich); library(lmtest)',
        'coeftest(model_bin, vcov = vcovHC(model_bin, type = "HC3"))',
        '',
        '# Predicted rates:',
        'predict(model, type = "response") / df$person_time'
      ].join('\n');
    },
    danishContext: 'Standard model for Danish pharmacoepidemiology when outcome is event counts per person-year (e.g., hospitalisations per 100 person-years). Person-time computed from register data (first prescription → event/censoring). Check for overdispersion with deviance statistic — register data often shows overdispersion, favouring negative binomial.',
    outputSvg: '<svg role="img" viewBox="0 0 400 200" style="width:100%;height:auto"><title>Poisson regression: event rates with confidence intervals for two groups</title><desc>Bar chart showing event counts/rates for exposed and unexposed with confidence interval lines</desc><line x1="60" y1="155" x2="370" y2="155" stroke="currentColor" stroke-width="1.5"/><line x1="60" y1="20" x2="60" y2="155" stroke="currentColor" stroke-width="1.5"/><rect x="100" y="75" width="80" height="80" rx="4" fill="var(--svg-exposed)" opacity="0.75"/><rect x="240" y="115" width="80" height="40" rx="4" fill="var(--svg-control)" opacity="0.6"/><line x1="140" y1="58" x2="140" y2="92" stroke="var(--svg-exposed)" stroke-width="2"/><line x1="126" y1="58" x2="154" y2="58" stroke="var(--svg-exposed)" stroke-width="2"/><line x1="126" y1="92" x2="154" y2="92" stroke="var(--svg-exposed)" stroke-width="2"/><line x1="280" y1="103" x2="280" y2="127" stroke="var(--svg-control)" stroke-width="2"/><line x1="266" y1="103" x2="294" y2="103" stroke="var(--svg-control)" stroke-width="2"/><line x1="266" y1="127" x2="294" y2="127" stroke="var(--svg-control)" stroke-width="2"/><text x="140" y="175" text-anchor="middle" font-size="10" fill="var(--svg-exposed)" font-family="system-ui,sans-serif">Exposed</text><text x="280" y="175" text-anchor="middle" font-size="10" fill="var(--svg-control)" font-family="system-ui,sans-serif">Unexposed</text><text x="155" y="70" font-size="10" fill="var(--svg-exposed)" font-family="system-ui,sans-serif">Rate₁</text><text x="295" y="108" font-size="10" fill="var(--svg-control)" font-family="system-ui,sans-serif">Rate₀</text><text x="210" y="38" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.7" font-family="system-ui,sans-serif">IRR = Rate₁ / Rate₀ = exp(β₁)</text></svg>'
  },

  {
    id: 'negbin',
    label: 'Negative binomial regression',
    category: 'count',
    outcomeType: 'Count (overdispersed)',
    effectMeasure: 'Incidence Rate Ratio — IRR = exp(β₁)',
    link: 'Log — log(μ) = log(T) + Xβ  (with dispersion θ)',
    description: 'Extends Poisson regression by adding a dispersion parameter θ to handle overdispersion (variance > mean). The log link and IRR interpretation are identical to Poisson.',
    useWhen: 'Count outcomes with overdispersion (variance substantially exceeds the mean). Common when there is between-individual heterogeneity in event rates not explained by covariates. If deviance/df >> 1 in a Poisson model, switch to negative binomial. Same link and interpretation as Poisson — only the variance structure differs.',
    assumptions: [
      'Log-linearity: log(mean count) is a linear function of predictors',
      'Negative binomial variance: Var[Y] = μ + μ²/θ (Poisson is a special case as θ → ∞)',
      'Dispersion parameter θ is estimated from data (checked by profile likelihood)',
      'Independence of observations (for clustered data use GEE or mixed models)',
      'Correct person-time offset'
    ],
    buildFormula: function(o, x, cs, ms) {
      var terms = ['β₀', 'β₁·' + x];
      cs.forEach(function(c, i) { terms.push('β' + subscript(i+2) + '·' + c); });
      var ni = cs.length + 2;
      ms.forEach(function(m, i) {
        terms.push('β' + subscript(ni + i*2) + '·' + m);
        terms.push('β' + subscript(ni + i*2 + 1) + '·(' + x + '×' + m + ')');
      });
      return 'log(E[' + o + ']) = log(T) + ' + terms.join(' + ') + '\nVar[' + o + '] = μ + μ²/θ\n\nIRR = exp(β₁)';
    },
    effectNote: function(x) {
      return 'IRR = exp(β₁): same interpretation as Poisson — rate ratio for ' + (x||'exposure') + '. The dispersion parameter θ absorbs between-individual variation in baseline risk; smaller θ means more overdispersion.';
    },
    rCode: function(o, x, cs, ms) {
      var rhs = [x].concat(cs);
      var csSet = {}; cs.forEach(function(c) { csSet[c] = true; });
      ms.forEach(function(m) { rhs.push(x + ':' + m); if (!csSet[m]) rhs.push(m); });
      return [
        'library(MASS)',
        '',
        '# Negative binomial regression:',
        'model <- glm.nb(' + (o||'events') + ' ~ ' + rhs.join(' + ') + ' + offset(log(person_time)),',
        '                data = df)',
        'summary(model)                     # includes dispersion θ',
        'exp(cbind(IRR = coef(model), confint(model)))',
        '',
        '# Compare to Poisson with LR test (if Poisson is appropriate, use it):',
        'model_p <- glm(' + (o||'events') + ' ~ ' + rhs.join(' + ') + ' + offset(log(person_time)),',
        '               family = poisson, data = df)',
        'pchisq(2*(logLik(model) - logLik(model_p)), df = 1, lower.tail = FALSE)',
        '',
        '# Dispersion estimate:',
        'model$theta                         # larger = less overdispersion'
      ].join('\n');
    },
    danishContext: 'Appropriate for register-based count outcomes with high between-person heterogeneity (e.g., number of GP contacts, hospitalisations over a period). Check dispersion after Poisson. In Danish data, overdispersion is common due to high-risk subgroups not captured by covariates.',
    outputSvg: '<svg role="img" viewBox="0 0 400 200" style="width:100%;height:auto"><title>Negative binomial regression: wider CI band vs Poisson</title><desc>Comparison of Poisson and negative binomial confidence intervals showing wider uncertainty in negative binomial</desc><line x1="55" y1="165" x2="385" y2="165" stroke="currentColor" stroke-width="1.5"/><line x1="55" y1="15" x2="55" y2="165" stroke="currentColor" stroke-width="1.5"/><polygon points="70,140 375,80 375,50 70,115" fill="var(--svg-period)" opacity="0.1"/><polygon points="70,135 375,90 375,60 70,120" fill="var(--svg-exposed)" opacity="0.12"/><line x1="70" y1="128" x2="375" y2="74" stroke="var(--svg-exposed)" stroke-width="2"/><line x1="70" y1="128" x2="375" y2="74" stroke="var(--svg-period)" stroke-width="2" stroke-dasharray="6,3"/><text x="218" y="185" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.7" font-family="system-ui,sans-serif">Predictor (X)</text><text x="15" y="90" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7" font-family="system-ui,sans-serif" transform="rotate(-90 15 90)">log(rate)</text><text x="310" y="47" font-size="9" fill="var(--svg-period)" opacity="0.8" font-family="system-ui,sans-serif">NB 95% CI</text><text x="310" y="59" font-size="9" fill="var(--svg-exposed)" font-family="system-ui,sans-serif">Poisson 95% CI</text><text x="310" y="71" font-size="9" fill="currentColor" opacity="0.6" font-family="system-ui,sans-serif">Fitted rate</text></svg>'
  },

  {
    id: 'clogit',
    label: 'Conditional logistic regression',
    category: 'binary',
    outcomeType: 'Binary — matched design',
    effectMeasure: 'Odds Ratio — OR = exp(β₁)',
    link: 'Conditional logit — strata-stratified log-odds',
    description: 'Logistic regression conditioned on matched strata (e.g., matched case-control sets). Stratum-level nuisance parameters cancel out, eliminating confounding by matching variables.',
    useWhen: 'Matched case-control studies or within-person designs (SCCS, case-crossover) where each case is matched to ≥1 control on confounders (age, sex, calendar time, etc.). Also used in nested case-control designs. The model conditions on each stratum so matched variables are implicitly controlled — do not include matching variables as covariates.',
    assumptions: [
      'Binary outcome within matched strata',
      'Correct matching: cases and controls share the same stratum on matching variables',
      'Log-odds of outcome is linear in unmatched covariates within strata',
      'No unmeasured confounding beyond matched variables',
      'Strata are independent of each other (no cross-stratum dependencies)'
    ],
    buildFormula: function(o, x, cs, ms) {
      var terms = ['β₁·' + x];
      cs.forEach(function(c, i) { terms.push('β' + subscript(i+2) + '·' + c); });
      var ni = cs.length + 2;
      ms.forEach(function(m, i) {
        terms.push('β' + subscript(ni + i*2) + '·' + m);
        terms.push('β' + subscript(ni + i*2 + 1) + '·(' + x + '×' + m + ')');
      });
      return 'logit(P(' + o + '=1 | stratum)) = ' + terms.join(' + ') + '\n\n(No intercept — strata absorb baseline)\nOR = exp(β₁)';
    },
    effectNote: function(x) {
      return 'OR = exp(β₁): within-stratum odds ratio for ' + (x||'exposure') + '. Stratum-specific intercepts cancel; matching variables need not be in the model. Equivalent to Mantel-Haenszel OR in simple designs.';
    },
    rCode: function(o, x, cs, ms) {
      var rhs = [x].concat(cs);
      var csSet = {}; cs.forEach(function(c) { csSet[c] = true; });
      ms.forEach(function(m) { rhs.push(x + ':' + m); if (!csSet[m]) rhs.push(m); });
      return [
        'library(survival)',
        '',
        '# Conditional logistic regression:',
        '# strata_id: variable identifying matched sets',
        'model <- clogit(' + (o||'case') + ' ~ ' + rhs.join(' + ') + ' + strata(strata_id),',
        '                data = df)',
        'summary(model)',
        'exp(cbind(OR = coef(model), confint(model)))',
        '',
        '# Note: do NOT include matching variables (e.g., age, sex) as covariates —',
        '# they are absorbed by the strata() term.',
        '',
        '# Check concordance (c-statistic):',
        'model$concordance'
      ].join('\n');
    },
    danishContext: 'Used in nested case-control studies sampling from Danish register cohorts — cases matched to risk-set controls on index date (incidence density sampling). Also used in case-crossover designs where each person serves as their own control. Efficient when the full cohort is large but outcome is rare.',
    outputSvg: '<svg role="img" viewBox="0 0 400 200" style="width:100%;height:auto"><title>Conditional logistic: matched case-control sets</title><desc>Three matched strata each containing one case and one or two controls, showing within-stratum comparison</desc><rect x="30" y="20" width="330" height="48" rx="6" fill="var(--bg-raised)" stroke="currentColor" stroke-width="1" opacity="0.5"/><rect x="30" y="80" width="330" height="48" rx="6" fill="var(--bg-raised)" stroke="currentColor" stroke-width="1" opacity="0.5"/><rect x="30" y="140" width="330" height="48" rx="6" fill="var(--bg-raised)" stroke="currentColor" stroke-width="1" opacity="0.5"/><circle cx="75" cy="44" r="12" fill="var(--svg-event)" opacity="0.8"/><circle cx="120" cy="44" r="12" fill="var(--svg-control)" opacity="0.5"/><circle cx="165" cy="44" r="12" fill="var(--svg-control)" opacity="0.5"/><circle cx="75" cy="104" r="12" fill="var(--svg-event)" opacity="0.8"/><circle cx="120" cy="104" r="12" fill="var(--svg-control)" opacity="0.5"/><circle cx="165" cy="104" r="12" fill="var(--svg-control)" opacity="0.5"/><circle cx="210" cy="104" r="12" fill="var(--svg-control)" opacity="0.5"/><circle cx="75" cy="164" r="12" fill="var(--svg-event)" opacity="0.8"/><circle cx="120" cy="164" r="12" fill="var(--svg-control)" opacity="0.5"/><text x="75" y="48" text-anchor="middle" font-size="9" fill="white" font-family="system-ui,sans-serif">Case</text><text x="120" y="48" text-anchor="middle" font-size="8" fill="currentColor" opacity="0.8" font-family="system-ui,sans-serif">Ctrl</text><text x="165" y="48" text-anchor="middle" font-size="8" fill="currentColor" opacity="0.8" font-family="system-ui,sans-serif">Ctrl</text><text x="75" y="108" text-anchor="middle" font-size="9" fill="white" font-family="system-ui,sans-serif">Case</text><text x="120" y="108" text-anchor="middle" font-size="8" fill="currentColor" opacity="0.8" font-family="system-ui,sans-serif">Ctrl</text><text x="165" y="108" text-anchor="middle" font-size="8" fill="currentColor" opacity="0.8" font-family="system-ui,sans-serif">Ctrl</text><text x="210" y="108" text-anchor="middle" font-size="8" fill="currentColor" opacity="0.8" font-family="system-ui,sans-serif">Ctrl</text><text x="75" y="168" text-anchor="middle" font-size="9" fill="white" font-family="system-ui,sans-serif">Case</text><text x="120" y="168" text-anchor="middle" font-size="8" fill="currentColor" opacity="0.8" font-family="system-ui,sans-serif">Ctrl</text><text x="370" y="44" text-anchor="end" font-size="9" fill="currentColor" opacity="0.6" font-family="system-ui,sans-serif">Stratum 1</text><text x="370" y="104" text-anchor="end" font-size="9" fill="currentColor" opacity="0.6" font-family="system-ui,sans-serif">Stratum 2</text><text x="370" y="164" text-anchor="end" font-size="9" fill="currentColor" opacity="0.6" font-family="system-ui,sans-serif">Stratum 3</text></svg>'
  },

  {
    id: 'iptw',
    label: 'IPTW / Marginal Structural Model',
    category: 'causal',
    outcomeType: 'Any (binary, continuous, time-to-event)',
    effectMeasure: 'Marginal causal effect (ATE or ATT)',
    link: 'Two-stage: PS model (logit) → weighted outcome model',
    description: 'Inverse probability of treatment weighting (IPTW) reweights each observation by the inverse of its probability of receiving the observed treatment. The resulting pseudo-population is balanced on measured confounders. A Marginal Structural Model (MSM) is then fit on the weighted data to estimate marginal (population-average) causal effects.',
    useWhen: 'Want to estimate a marginal (population-average) causal effect rather than a conditional effect. Particularly useful when (1) there are many confounders and covariate adjustment is difficult; (2) interest is in time-varying treatments (dynamic IPTW); (3) you want to avoid outcome model misspecification by placing all confounding adjustment in the propensity score model. Requires correct specification of the PS model and positivity assumption.',
    assumptions: [
      'No unmeasured confounding: all confounders are measured and included in the PS model',
      'Positivity: every individual has a non-zero probability of each treatment level (check PS distribution overlap)',
      'Consistency: the observed outcome under treatment equals the potential outcome',
      'Correct PS model specification (check balance with SMDs after weighting)',
      'Stable unit treatment value assumption (SUTVA): no interference between subjects'
    ],
    buildFormula: function(o, x, cs, ms) {
      var psArr = cs.length ? cs : ['C₁', 'C₂'];
      var psTerms = psArr.map(function(c, i) { return 'α' + subscript(i+1) + '·' + c; }).join(' + ');
      var msTerms = ['β₁·' + x];
      ms.forEach(function(m, i) {
        msTerms.push('β' + subscript(i+2) + '·' + m);
        msTerms.push('β' + subscript(i+3) + '·(' + x + '×' + m + ')');
      });
      return 'Stage 1 — Propensity score model:\n  logit(P(' + x + '=1 | C)) = α₀ + ' + psTerms + '\n  w = 1/P(' + x + ' | C)    [stabilised: w = P(' + x + ')/P(' + x + ' | C)]\n\nStage 2 — MSM on weighted data:\n  g(E[' + o + ']^x) = ' + msTerms.join(' + ') + '\n  (no confounders in outcome model — absorbed by weights)';
    },
    effectNote: function(x) {
      return 'β₁ estimates the average treatment effect (ATE): marginal causal effect of ' + (x||'exposure') + ' in the target population. Use stabilised weights and truncation (e.g., at 99th percentile) to limit influence of extreme weights.';
    },
    rCode: function(o, x, cs, ms) {
      var psRhs = cs.length ? cs.join(' + ') : 'C1 + C2';
      var msRhs = [x].concat(ms).join(' + ');
      return [
        'library(WeightIt)   # or manual computation',
        '',
        '# Step 1: Estimate propensity scores and IPTW weights:',
        'ps_fit <- glm(' + x + ' ~ ' + psRhs + ', family = binomial, data = df)',
        'ps    <- predict(ps_fit, type = "response")',
        '',
        '# Unstabilised weights:',
        'df$w_iptw <- ifelse(df$' + x + ' == 1, 1/ps, 1/(1-ps))',
        '',
        '# Stabilised weights (recommended):',
        'p_x <- mean(df$' + x + ')',
        'df$w_stab <- ifelse(df$' + x + ' == 1, p_x/ps, (1-p_x)/(1-ps))',
        '',
        '# Check overlap and weight distribution:',
        'summary(df$w_stab)',
        'hist(df$w_stab[df$' + x + '==1], main = "Weights: exposed")',
        '',
        '# Step 2: Check covariate balance (SMD < 0.1 after weighting):',
        'library(cobalt)',
        'bal.tab(ps_fit, data = df, weights = df$w_stab, method = "weighting")',
        '',
        '# Step 3: Fit MSM on weighted data with robust SEs:',
        'library(sandwich); library(lmtest)',
        'msm <- glm(' + (o||'outcome') + ' ~ ' + msRhs + ', data = df,',
        '           weights = w_stab, family = binomial)',
        'coeftest(msm, vcov = vcovHC(msm, type = "HC3"))'
      ].join('\n');
    },
    danishContext: 'Increasingly used in Danish pharmacoepidemiology for marginal causal inference when many confounders exist (comorbidities, coprescriptions, socioeconomics). Key challenge: positivity violations common when drug use is highly channelled. Always report PS overlap plot and SMD table. Consider doubly-robust estimators (AIPW) for added protection against model misspecification.',
    outputSvg: '<svg role="img" viewBox="0 0 400 200" style="width:100%;height:auto"><title>IPTW: propensity score overlap before and after weighting</title><desc>Two pairs of distributions: before weighting, exposed and unexposed are separated; after weighting, they overlap</desc><text x="105" y="18" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7" font-family="system-ui,sans-serif">Before weighting</text><text x="295" y="18" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7" font-family="system-ui,sans-serif">After weighting</text><path d="M20,140 C30,140 45,120 60,85 C75,50 85,35 100,32 C115,29 125,45 140,85 C155,125 165,140 175,140" fill="var(--svg-exposed)" opacity="0.35" stroke="var(--svg-exposed)" stroke-width="1.5"/><path d="M55,140 C65,140 80,130 95,115 C110,100 130,90 155,82 C180,74 195,75 210,80 C225,85 235,95 245,140" fill="var(--svg-control)" opacity="0.3" stroke="var(--svg-control)" stroke-width="1.5"/><path d="M220,140 C230,140 242,118 255,90 C268,62 278,42 295,38 C312,34 322,52 335,88 C348,124 358,140 370,140" fill="var(--svg-exposed)" opacity="0.35" stroke="var(--svg-exposed)" stroke-width="1.5"/><path d="M218,140 C228,140 240,120 253,92 C266,64 278,44 295,40 C312,36 322,54 335,90 C348,126 360,140 372,140" fill="var(--svg-control)" opacity="0.3" stroke="var(--svg-control)" stroke-width="1.5"/><line x1="10" y1="140" x2="390" y2="140" stroke="currentColor" stroke-width="1" opacity="0.4"/><line x1="200" y1="15" x2="200" y2="155" stroke="currentColor" stroke-width="1" stroke-dasharray="5,5" opacity="0.3"/><text x="58" y="160" text-anchor="middle" font-size="9" fill="var(--svg-exposed)" font-family="system-ui,sans-serif">Exposed PS</text><text x="155" y="160" text-anchor="middle" font-size="9" fill="var(--svg-control)" font-family="system-ui,sans-serif">Unexposed PS</text><text x="200" y="185" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.6" font-family="system-ui,sans-serif">Propensity score distributions — overlap increases after weighting</text></svg>'
  },

  {
    id: 'sccs',
    label: 'SCCS — Self-Controlled Case Series',
    category: 'self-controlled',
    outcomeType: 'Count/event within-person (Poisson)',
    effectMeasure: 'Incidence Rate Ratio — IRR = exp(β₁)',
    link: 'Conditional Poisson — within-person stratification',
    description: 'A self-controlled design using only cases (individuals who experience the event). Each person contributes their own control period. Estimates the IRR of the event during a defined risk window vs. baseline within the same person, automatically adjusting for all time-invariant confounders.',
    useWhen: 'Vaccine safety studies, acute drug reactions, or any transient exposure where you want within-person control for fixed confounders (genetics, stable comorbidities, socioeconomic status). Outcome must be rare and independent across observations within a person. Requires careful definition of risk window(s) and appropriate age/calendar-time adjustment.',
    assumptions: [
      'The event is rare and recurrent (or only one event per person in a modified SCCS)',
      'The occurrence of the event does not affect subsequent exposure (independence of event and subsequent exposure)',
      'The observation period ends independently of the event (event does not censor observation)',
      'Risk window is correctly specified — misspecification biases the IRR',
      'Only cases (event-experiencing individuals) contribute — controls are excluded',
      'Age/seasonal effects are modelled and controlled within each person'
    ],
    buildFormula: function(o, x, cs, ms) {
      var ageTerms = cs.length ? cs.join(' + ') : 'age_group';
      return 'log(λᵢ(t)) = φᵢ + β·' + x + '(t) + γ·' + ageTerms + '\n\nφᵢ = person-specific fixed effect (nuisance)\n' + x + '(t) = 1 during risk window, 0 during reference period\n\nIRR = exp(β)';
    },
    effectNote: function(x) {
      return 'IRR = exp(β): ratio of the event rate during the ' + (x||'risk') + ' window vs. reference (baseline) period within the same individual. All time-invariant confounders are implicitly controlled by within-person stratification.';
    },
    rCode: function(o, x, cs, ms) {
      var ageTerms = cs.length ? cs.join(' + ') : 'age_group';
      return [
        'library(SCCS)',
        '',
        '# Standard SCCS (Farrington method):',
        '# Data must be in long format with one row per person per time interval',
        'model <- standardsccs(',
        '  event   = ' + (o||'event_count') + ',',
        '  indiv   = person_id,',
        '  astart  = start_age,',
        '  aend    = end_age,',
        '  aevent  = event_age,',
        '  adrug   = cbind(risk_start, risk_end),',
        '  aedrug  = risk_end,',
        '  data    = df',
        ')',
        'summary(model)',
        'exp(coef(model))               # IRR',
        '',
        '# Alternative via gnm (generalised nonlinear models):',
        'library(gnm)',
        'model2 <- gnm(' + (o||'event_count') + ' ~ ' + x + ' + ' + ageTerms + ',',
        '              eliminate = factor(person_id),',
        '              family = poisson, data = df_long)',
        'exp(coef(model2)[1])           # IRR for exposure'
      ].join('\n');
    },
    danishContext: 'Widely used in Danish vaccine safety studies and drug-event association studies using CPR-linked registers. Key advantages: automatically controls for time-invariant confounding (channelling by indication, socioeconomic status) — particularly valuable when healthy user bias is a concern. Define risk/reference windows carefully from prescription dates; adjust for age using Poisson segments.',
    outputSvg: '<svg role="img" viewBox="0 0 400 200" style="width:100%;height:auto"><title>SCCS: within-person timeline with risk and reference periods</title><desc>Person timeline showing pre-exposure reference period, exposure risk window, and post-exposure reference period with event marker</desc><line x1="30" y1="100" x2="375" y2="100" stroke="currentColor" stroke-width="2.5"/><rect x="30" y="84" width="120" height="32" rx="0" fill="var(--svg-control)" opacity="0.2"/><rect x="170" y="76" width="90" height="48" rx="4" fill="var(--svg-period)" opacity="0.25" stroke="var(--svg-period)" stroke-width="1.5"/><rect x="275" y="84" width="100" height="32" rx="0" fill="var(--svg-control)" opacity="0.2"/><line x1="170" y1="68" x2="170" y2="136" stroke="var(--svg-period)" stroke-width="1.5" stroke-dasharray="4,3"/><line x1="260" y1="68" x2="260" y2="136" stroke="var(--svg-period)" stroke-width="1.5" stroke-dasharray="4,3"/><polygon points="230,72 224,62 236,62" fill="var(--svg-event)" opacity="0.9"/><line x1="230" y1="72" x2="230" y2="100" stroke="var(--svg-event)" stroke-width="1.5" opacity="0.8"/><circle cx="230" cy="100" r="5" fill="var(--svg-event)" opacity="0.9"/><text x="90" y="58" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7" font-family="system-ui,sans-serif">Reference</text><text x="215" y="58" text-anchor="middle" font-size="10" fill="var(--svg-period)" font-family="system-ui,sans-serif">Risk window</text><text x="325" y="58" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7" font-family="system-ui,sans-serif">Reference</text><text x="250" y="52" font-size="9" fill="var(--svg-event)" font-family="system-ui,sans-serif">Event</text><text x="375" y="104" text-anchor="end" font-size="9" fill="currentColor" opacity="0.5" font-family="system-ui,sans-serif">Time →</text><text x="30" y="155" font-size="10" fill="currentColor" opacity="0.6" font-family="system-ui,sans-serif">IRR = rate(risk window) / rate(reference) within-person</text><line x1="168" y1="125" x2="168" y2="118" stroke="var(--svg-period)" stroke-width="1"/><line x1="262" y1="125" x2="262" y2="118" stroke="var(--svg-period)" stroke-width="1"/><line x1="168" y1="122" x2="262" y2="122" stroke="var(--svg-period)" stroke-width="1"/><text x="215" y="135" text-anchor="middle" font-size="8" fill="var(--svg-period)" font-family="system-ui,sans-serif">exposure period</text></svg>'
  }
];

/* Helper: numeric subscript characters */
function subscript(n) {
  var subs = ['₀','₁','₂','₃','₄','₅','₆','₇','₈','₉'];
  return String(n).split('').map(function(d) {
    return subs[parseInt(d, 10)] || d;
  }).join('');
}
