/* =========================================================
   data/biases.js — Bias reference definitions
   Global: BIASES (array)

   ADDING A NEW BIAS — copy this template:
   {
     id: 'my-bias',                    // unique kebab-case
     label: 'My bias',                 // display name in dropdown
     category: 'Selection',            // Selection | Information | Confounding
     definition: 'Full definition.',
     directionOfBias: 'Toward null',   // Toward null | Away from null | Unpredictable
     directionExplanation: 'Why it goes in that direction.',
     typicalDesignContext: ['Cohort', 'Case-control'],
     mitigationStrategies: ['Strategy 1.', 'Strategy 2.'],
     exampleScenario: 'Optional concrete example.',  // optional
     relatedBiases: ['other-bias-id']               // optional, must match existing IDs
   }
   ========================================================= */

var BIASES = [

  /* =========================================================
     SELECTION BIAS
     ========================================================= */

  {
    id: 'healthy-worker',
    label: 'Healthy worker effect',
    category: 'Selection',
    definition: 'Workers in occupational studies tend to be healthier than the general population because severely ill individuals cannot obtain or maintain employment. Comparing workers to the general population produces a spuriously low estimate of occupational risk.',
    directionOfBias: 'Toward null',
    directionExplanation: 'Rates in the working exposure group are artificially low (they exclude the very ill), which attenuates the apparent association with adverse outcomes when compared to the general population.',
    typicalDesignContext: ['Occupational cohort', 'Register-based cohort', 'SMR/SIR studies'],
    mitigationStrategies: [
      'Use an internal comparison group (other worker groups) rather than the general population.',
      'Restrict analysis to individuals meeting employment criteria at baseline.',
      'Stratify by time since hire (exposure accumulation).',
      'Apply SMR with internal reference rates when possible.'
    ],
    exampleScenario: 'A study of shift workers uses the general Danish population as reference for SMR calculation. Because many Danes with severe illness are not employed, the SMR appears < 1 even for a harmful exposure.',
    relatedBiases: ['healthy-user']
  },

  {
    id: 'healthy-user',
    label: 'Healthy user / healthy adherer bias',
    category: 'Selection',
    definition: 'Patients who adhere to preventive therapies tend to be healthier in unmeasured ways than non-adherers. They may also be more likely to engage in other healthy behaviours (diet, exercise, other screening), leading to artificially favourable outcomes that are attributed to the drug.',
    directionOfBias: 'Away from null',
    directionExplanation: 'The treated (adherent) group has better baseline health, so their better outcomes exaggerate the drug\'s apparent benefit — the estimate is pulled away from the null toward a spuriously protective direction.',
    typicalDesignContext: ['Cohort (preventive therapies)', 'Case-control', 'ACNU design'],
    mitigationStrategies: [
      'Active comparator new-user (ACNU) design — compare initiators of two drugs with the same indication.',
      'Restrict to new users to avoid prevalent user bias, which overlaps with healthy user bias.',
      'Adjust for the healthcare utilisation proxy (HUP) as a surrogate for unmeasured health consciousness.',
      'Negative control outcomes that the drug cannot affect.',
      'Sensitivity analyses: instrumental variable approach.'
    ],
    exampleScenario: 'Statin users appear to have lower rates of injury deaths — not because statins prevent accidents, but because statin users have generally healthier lifestyles.',
    relatedBiases: ['healthy-worker', 'prevalent-user-bias']
  },

  {
    id: 'loss-to-followup',
    label: 'Loss to follow-up / attrition bias',
    category: 'Selection',
    definition: 'Participants who are lost to follow-up (emigrate, withdraw, or have missing data) differ systematically from those who remain under observation, introducing bias if loss is related to both exposure and outcome.',
    directionOfBias: 'Unpredictable',
    directionExplanation: 'Direction depends on how exposure and outcome both relate to the mechanism of loss. If the sicker exposed leave earlier (outcome-related loss in the exposed), the observed rate is biased downward; other patterns produce bias in either direction.',
    typicalDesignContext: ['Cohort', 'RCT', 'Case-control', 'Longitudinal studies'],
    mitigationStrategies: [
      'In Denmark: link to CPR for emigration and death — near-complete follow-up is a major strength.',
      'Sensitivity analysis: best-case / worst-case scenarios for lost participants.',
      'Inverse probability of censoring weighting (IPCW) to adjust for informative censoring.',
      'Multiple imputation if missingness mechanism is MAR (missing at random).',
      'Report number and characteristics of participants lost.'
    ],
    exampleScenario: 'In a drug trial, patients who experience side effects discontinue and are lost. If side effects are related to the outcome, the observed outcome rate in the treatment group is biased.',
    relatedBiases: ['immortal-time']
  },

  {
    id: 'berkson-bias',
    label: 'Berkson bias',
    category: 'Selection',
    definition: 'A form of selection bias arising when both the exposure and the disease independently increase the probability of hospitalisation (or of entering the study). Restricting to hospital patients creates a spurious negative association between exposure and disease.',
    directionOfBias: 'Toward null',
    directionExplanation: 'Berkson bias typically induces a spurious negative association (or attenuates a positive one) because those with neither the exposure nor the disease are under-represented in hospital-based samples.',
    typicalDesignContext: ['Hospital-based case-control', 'Clinical registry studies'],
    mitigationStrategies: [
      'Use population-based sampling for controls rather than hospital-based controls.',
      'Register-based case-control with population controls avoids Berkson bias.',
      'Sensitivity analyses comparing hospital-based and population-based control series.'
    ],
    exampleScenario: 'A hospital-based case-control selects both cases (lung cancer) and controls from hospitalised patients. Smoking causes other diseases also leading to hospitalisation, making smokers over-represented in controls — attenuating the OR for smoking and lung cancer.',
    relatedBiases: ['collider-selection']
  },

  {
    id: 'prevalent-user-bias',
    label: 'Prevalent user bias',
    category: 'Selection',
    definition: 'Including individuals who have been on treatment for a variable period before study entry (prevalent users) means the comparison group is enriched for survivors of early side effects and those who tolerate the drug, creating a non-random comparison at a heterogeneous point in treatment.',
    directionOfBias: 'Away from null',
    directionExplanation: 'Prevalent users represent a selected, healthy survivor group. This artificially improves outcomes in the exposed group relative to unexposed, creating a spurious protective effect or exaggerating true benefits.',
    typicalDesignContext: ['Cohort', 'Cross-sectional', 'Case-control with non-new users'],
    mitigationStrategies: [
      'New-user (incident user) design: restrict to patients starting a drug for the first time (after a washout period).',
      'Active comparator new-user (ACNU) design for head-to-head drug comparisons.',
      'Report use of washout period in methods section.'
    ],
    exampleScenario: 'Comparing current ACE inhibitor users to non-users: current users who have been on treatment for years are those who survived the first months of treatment and tolerated the drug — not representative of all who start the drug.',
    relatedBiases: ['depletion-of-susceptibles', 'healthy-user', 'immortal-time']
  },

  {
    id: 'immortal-time',
    label: 'Immortal time bias',
    category: 'Selection',
    definition: 'A period during follow-up in which the outcome cannot occur by design — often because the subject must survive to receive or be classified as exposed — but this period is nonetheless assigned to the exposed group in the analysis.',
    directionOfBias: 'Away from null',
    directionExplanation: 'Assigning the immortal period to the exposed group artificially lowers the event rate in that group relative to the unexposed, creating a spurious protective effect or exaggerating a true benefit.',
    typicalDesignContext: ['Cohort', 'Nested case-control', 'PSSA', 'Registry-based pharmacoepi'],
    mitigationStrategies: [
      'Time-conditional analysis: define exposure as time-varying and start follow-up at the correct time.',
      'Align index date (time zero) with the date of the first dispensing for new-user designs.',
      'Left truncation / delayed entry when participants are only eligible after reaching a condition.',
      'Landmark analysis: fix the time zero at a specific date after cohort entry.',
      'Carefully audit the timing of exposure classification relative to follow-up start.'
    ],
    exampleScenario: 'Patients classified as "statin users" if they have ≥ 2 prescriptions. Time between cohort entry and the second prescription is immortal (person must survive to receive it), but is attributed to the statin group, making statins appear spuriously protective.',
    relatedBiases: ['prevalent-user-bias', 'loss-to-followup']
  },

  {
    id: 'depletion-of-susceptibles',
    label: 'Depletion of susceptibles',
    category: 'Selection',
    definition: 'Long-term users of a drug may represent a depleted pool: those susceptible to early adverse effects have already experienced them (and possibly stopped the drug or died). New users in a later period appear to have lower risk not because the drug is safer, but because susceptibles have been removed.',
    directionOfBias: 'Toward null',
    directionExplanation: 'The remaining prevalent users are a selected healthy survivor group — their lower event rate attenuates the apparent harm of the drug (biasing the estimate toward a false null or protective finding).',
    typicalDesignContext: ['Cohort (drug safety)', 'PSSA', 'Time-series pharmacoepi'],
    mitigationStrategies: [
      'New-user design eliminates depletion of susceptibles by including everyone at the same point (drug initiation).',
      'Active comparator new-user design.',
      'Restriction to early follow-up windows where depletion has not yet occurred.'
    ],
    exampleScenario: 'NSAIDs appear safer in long-term users than in new users because those who experienced GI bleeds in the first weeks have already stopped the drug and are no longer observable as "users."',
    relatedBiases: ['prevalent-user-bias', 'healthy-user']
  },

  {
    id: 'collider-selection',
    label: 'Collider / selection bias from conditioning',
    category: 'Selection',
    definition: 'Conditioning on a common effect (collider) of the exposure and outcome (or their causes) opens a non-causal path, introducing spurious associations. In a causal DAG, a collider is a node with two incoming arrows; conditioning on it creates a dependence between its causes.',
    directionOfBias: 'Unpredictable',
    directionExplanation: 'Direction depends on the specific DAG structure. Conditioning on a collider can create positive or negative spurious associations; in selection contexts it typically induces a negative correlation between the collider\'s parents.',
    typicalDesignContext: ['Case-control (hospital-based)', 'Survival analysis', 'Any design with restricted sampling', 'Mediation analysis'],
    mitigationStrategies: [
      'Draw a causal DAG before analysis to identify colliders; avoid conditioning on them.',
      'Sensitivity analysis for collider bias using the E-value or quantitative bias analysis.',
      'Population-based sampling to avoid conditioning on colliders (e.g., hospitalisation).'
    ],
    exampleScenario: 'Adjusting for a variable on the causal pathway (mediator) — a special case of collider conditioning that may bias the direct effect estimate.',
    relatedBiases: ['berkson-bias', 'overadjustment']
  },

  {
    id: 'nonresponse-bias',
    label: 'Non-response bias',
    category: 'Selection',
    definition: 'When a substantial proportion of individuals invited to participate decline, and those who decline differ systematically from those who participate in terms of exposure or disease status.',
    directionOfBias: 'Unpredictable',
    directionExplanation: 'Depends on the joint distribution of non-response, exposure, and outcome. If sicker or more exposed individuals are less likely to respond, estimates can be biased in either direction.',
    typicalDesignContext: ['Survey-based studies', 'Self-reported questionnaire studies', 'Biobank studies'],
    mitigationStrategies: [
      'Compare characteristics of responders and non-responders using register data (possible in Denmark).',
      'Inverse probability weighting using register data to reweight the analysed sample.',
      'Sensitivity analysis under various non-response assumptions.',
      'Minimise non-response through study design (short questionnaires, repeated contact).'
    ],
    exampleScenario: 'A lifestyle questionnaire study has 40% response rate. Health-conscious individuals may be over-represented, biasing estimates of diet and disease associations.',
    relatedBiases: ['loss-to-followup']
  },

  /* =========================================================
     INFORMATION BIAS
     ========================================================= */

  {
    id: 'recall-bias',
    label: 'Recall bias',
    category: 'Information',
    definition: 'Cases who have experienced an adverse outcome are more likely to recall and report past exposures than controls who have not, leading to differential misclassification of exposure by disease status.',
    directionOfBias: 'Away from null',
    directionExplanation: 'Cases over-report exposure relative to controls, inflating the apparent OR or RR — biasing the estimate away from the null toward a spurious positive association.',
    typicalDesignContext: ['Case-control (self-reported exposure)', 'Cross-sectional', 'Retrospective cohort'],
    mitigationStrategies: [
      'Use objective, prospectively recorded exposure data (e.g., prescription registers, medical records).',
      'Register-based case-control eliminates recall bias for drug exposures recorded in LPDB.',
      'Blinding interviewers to case/control status to reduce differential probing.',
      'Validate self-reported exposure against register data in a subsample.'
    ],
    relatedBiases: ['observer-bias', 'exposure-misclassification']
  },

  {
    id: 'exposure-misclassification',
    label: 'Exposure misclassification (differential and non-differential)',
    category: 'Information',
    definition: 'Errors in classifying individuals\' exposure status. Non-differential: misclassification is independent of outcome status (error rate the same in cases and controls). Differential: the error rate differs by outcome status.',
    directionOfBias: 'Toward null',
    directionExplanation: 'Non-differential misclassification of a binary exposure typically biases toward the null (attenuates the association). Differential misclassification can bias in either direction depending on which group (cases or controls) has higher error rates.',
    typicalDesignContext: ['All observational designs', 'Case-control (self-reported)', 'Cohort (registry coding)'],
    mitigationStrategies: [
      'Validate the exposure measure against a gold standard in a subsample (quantitative bias analysis).',
      'Use administrative data (prescription register) instead of self-reported drug use.',
      'Sensitivity analysis using a range of plausible misclassification rates.',
      'For ATC codes in LPDB: validate against hospital medication records or GP records.'
    ],
    relatedBiases: ['recall-bias', 'outcome-misclassification', 'measurement-error']
  },

  {
    id: 'outcome-misclassification',
    label: 'Outcome misclassification',
    category: 'Information',
    definition: 'Errors in the classification of the outcome (disease) status. Non-differential: misclassification independent of exposure. Differential: the error rate differs by exposure status (often causing spurious associations).',
    directionOfBias: 'Toward null',
    directionExplanation: 'Non-differential outcome misclassification typically attenuates associations toward the null. Differential outcome misclassification (e.g., more intensive diagnostic scrutiny in the exposed group) can bias in either direction.',
    typicalDesignContext: ['All observational designs', 'Administrative data studies', 'Cohort with registry-coded outcomes'],
    mitigationStrategies: [
      'Validate ICD diagnoses in LPR/DNPR against medical records (positive predictive value studies are common in Denmark).',
      'Use validated outcome algorithms from published Danish register validation studies.',
      'Sensitivity analyses using different case definitions (primary vs. any diagnosis position).',
      'Negative control outcomes to detect systematic differential coding bias.'
    ],
    relatedBiases: ['detection-bias', 'exposure-misclassification']
  },

  {
    id: 'detection-bias',
    label: 'Detection / surveillance bias',
    category: 'Information',
    definition: 'Exposed individuals may be more intensively monitored, screened, or examined than unexposed individuals, leading to increased detection of outcomes in the exposed group not because of a true causal effect but because of differential diagnostic effort.',
    directionOfBias: 'Away from null',
    directionExplanation: 'More intensive surveillance of the exposed group increases apparent outcome rates relative to the less-monitored unexposed group, creating a spurious positive association or exaggerating a true one.',
    typicalDesignContext: ['Drug safety cohort studies', 'Screening studies', 'Administrative data cohort'],
    mitigationStrategies: [
      'Restrict to outcomes not plausibly influenced by surveillance intensity (e.g., fatal outcomes, hard endpoints).',
      'Negative control outcome analysis: if a drug spuriously appears to increase unrelated outcomes, detection bias may be operating.',
      'Restrict to outcomes that require hospitalisation (less susceptible to surveillance differences).',
      'Stratify on number of healthcare contacts as a proxy for surveillance intensity.'
    ],
    relatedBiases: ['outcome-misclassification', 'protopathic-bias']
  },

  {
    id: 'protopathic-bias',
    label: 'Protopathic bias (reverse causation in disguise)',
    category: 'Information',
    definition: 'A drug is prescribed for an early (prodromal) symptom of the disease under study, before the disease is diagnosed. The drug then appears to cause the disease, when in reality the early disease caused the drug prescription.',
    directionOfBias: 'Away from null',
    directionExplanation: 'The drug is confounded by the early manifestation of the outcome, creating a spurious positive association (or exaggerating a harmful one) — biasing away from the null toward an artifactual harmful effect.',
    typicalDesignContext: ['Drug safety cohort', 'Case-control', 'Pharmacoepidemiology register studies'],
    mitigationStrategies: [
      'Landmark analysis: exclude a fixed time window after drug initiation from follow-up (e.g., first 90 days).',
      'Define exposure with a lag period (exposure must precede outcome by a minimum latency window).',
      'Negative control exposure: a drug with the same indication but no plausible biological mechanism.',
      'Restrict to new users and apply a pre-exposure washout period to eliminate early users.',
      'Triangulation with active comparators sharing the same indication.'
    ],
    exampleScenario: 'Antacids appear to increase the risk of oesophageal cancer because oesophageal symptoms (early cancer) prompt antacid prescriptions before the cancer is diagnosed.',
    relatedBiases: ['confounding-by-indication', 'detection-bias']
  },

  {
    id: 'observer-bias',
    label: 'Observer / interviewer bias',
    category: 'Information',
    definition: 'Systematic differences in how an interviewer or observer collects or records information that are related to the disease or exposure status of participants — for example, more thorough probing of cases than controls for risk factor exposure.',
    directionOfBias: 'Away from null',
    directionExplanation: 'If cases are probed more intensively, their exposure prevalence is over-estimated relative to controls, inflating the apparent OR and pulling estimates away from the null.',
    typicalDesignContext: ['Case-control (interviewed)', 'Cross-sectional surveys', 'Clinical assessments'],
    mitigationStrategies: [
      'Blind interviewers to case/control status.',
      'Use standardised, structured interview instruments.',
      'Use objective exposure data (registers) rather than interviewer-ascertained data.',
      'Use multiple interviewers and check for interviewer-specific biases.'
    ],
    relatedBiases: ['recall-bias', 'exposure-misclassification']
  },

  {
    id: 'measurement-error',
    label: 'Measurement error / regression dilution',
    category: 'Information',
    definition: 'Random (non-differential) measurement error in a continuous exposure variable attenuates the estimated regression coefficient toward zero — the "regression dilution" or "attenuation" effect. The magnitude of bias depends on the ratio of true variance to total (measured) variance.',
    directionOfBias: 'Toward null',
    directionExplanation: 'Random measurement error in the exposure adds noise, reducing the apparent correlation between exposure and outcome. This biases coefficients toward zero (null) and reduces power. For multivariate adjustment, bias in one covariate can paradoxically increase bias in others.',
    typicalDesignContext: ['Epidemiological studies using biomarkers', 'Studies using self-reported continuous exposures', 'Mendelian randomisation (instrument strength)'],
    mitigationStrategies: [
      'Regression calibration using a validation subsample with more accurate measurements.',
      'SIMEX (simulation–extrapolation) method.',
      'Bayesian measurement error models.',
      'Repeated measurements to estimate the reliability ratio (used for regression dilution correction).',
      'Instrumental variable approach if a valid instrument is available.'
    ],
    relatedBiases: ['exposure-misclassification']
  },

  /* =========================================================
     CONFOUNDING
     ========================================================= */

  {
    id: 'unmeasured-confounding',
    label: 'Unmeasured / residual confounding',
    category: 'Confounding',
    definition: 'Confounding that persists after adjustment because the confounder is not measured in the data, is measured with error, or is measured too coarsely to fully control it. Even after multivariable adjustment, residual confounding from inadequately measured variables remains.',
    directionOfBias: 'Unpredictable',
    directionExplanation: 'Direction depends on the sign of the confounder\'s association with exposure and outcome. Unmeasured confounders can bias toward or away from the null, and can even create spurious protective effects.',
    typicalDesignContext: ['All observational designs'],
    mitigationStrategies: [
      'E-value calculation to quantify the strength of unmeasured confounding required to explain away the result.',
      'Active comparator new-user design to balance unmeasured confounders between groups.',
      'Instrumental variable analysis (if a valid instrument exists).',
      'Propensity score methods (IPTW, matching) — balances measured confounders but not unmeasured ones.',
      'Negative control exposure / outcome analysis to detect presence and direction of bias.',
      'Quantitative bias analysis to bound residual confounding effects.',
      'HDPS (high-dimensional propensity score) to adjust for a large number of proxy confounders from registers.'
    ],
    relatedBiases: ['confounding-by-indication', 'time-varying-confounding']
  },

  {
    id: 'confounding-by-indication',
    label: 'Confounding by indication / channelling bias',
    category: 'Confounding',
    definition: 'The indication for a drug or treatment is itself associated with the outcome, making it impossible to separate the drug\'s effect from the effect of the underlying disease. Channelling bias is a related phenomenon where drugs are preferentially prescribed to patients with different severity, risk profiles, or prognosis.',
    directionOfBias: 'Unpredictable',
    directionExplanation: 'If the indication is associated with worse prognosis, the drug appears harmful (bias away from null or confounds a true protective effect). If the drug is given to lower-risk patients (channelling), it appears spuriously protective.',
    typicalDesignContext: ['Drug effectiveness/safety cohort', 'Pharmacoepidemiology', 'Case-control'],
    mitigationStrategies: [
      'Active comparator new-user design: compare two drugs with the same indication.',
      'Propensity score matching or IPTW on measured confounders (indication variables).',
      'HDPS (high-dimensional propensity score) to adjust for proxy indication variables from claims data.',
      'Restriction to homogeneous indication subgroups.',
      'Quantitative bias analysis / E-value for residual confounding by indication.'
    ],
    exampleScenario: 'Comparing outcomes in anticoagulated vs. non-anticoagulated atrial fibrillation patients: anticoagulated patients have higher baseline stroke risk (the indication), biasing the estimate toward harm.',
    relatedBiases: ['unmeasured-confounding', 'healthy-user', 'protopathic-bias']
  },

  {
    id: 'time-varying-confounding',
    label: 'Time-varying confounding (affected by prior exposure)',
    category: 'Confounding',
    definition: 'A covariate that changes over time and is both (1) a confounder for the current exposure-outcome relationship and (2) itself affected by prior exposure. Standard regression adjustment introduces collider bias when conditioning on such variables; the confounder is on the pathway from past exposure to outcome.',
    directionOfBias: 'Unpredictable',
    directionExplanation: 'Standard adjustment for a time-varying confounder that was itself affected by prior exposure can open collider paths or block intermediate paths, biasing in either direction depending on the DAG structure.',
    typicalDesignContext: ['Longitudinal drug treatment studies', 'Repeated measures cohort', 'Survival analysis with time-dependent covariates'],
    mitigationStrategies: [
      'Marginal structural models (MSM) with inverse probability of treatment weighting (IPTW) — the standard approach.',
      'Structural nested models (SNM) / g-estimation.',
      'G-computation (parametric g-formula).',
      'Target trial emulation framework with per-protocol estimation.',
      'Avoid including intermediate variables (mediators or post-treatment variables) as covariates in standard regression.'
    ],
    relatedBiases: ['overadjustment', 'collider-bias', 'unmeasured-confounding']
  },

  {
    id: 'overadjustment',
    label: 'Overadjustment bias',
    category: 'Confounding',
    definition: 'Adjusting for a variable on the causal pathway between exposure and outcome (a mediator), or for a descendant of the exposure, blocks part of the causal effect. This biases the estimated total effect toward the null or produces incorrect estimates of the total effect.',
    directionOfBias: 'Toward null',
    directionExplanation: 'Conditioning on a mediator partitions the total effect into direct and indirect components. If the goal is to estimate the total effect, adjusting for the mediator removes part of the effect — attenuating the observed association toward null.',
    typicalDesignContext: ['Multivariable regression', 'Any adjusted analysis where the DAG is not carefully considered'],
    mitigationStrategies: [
      'Draw a DAG and identify which variables are confounders vs. mediators.',
      'Use mediation analysis if decomposing total vs. direct effect is the goal.',
      'Do not adjust for post-treatment variables in studies of total causal effect.',
      'Clearly state the causal estimand (total vs. direct effect) before analysis.'
    ],
    relatedBiases: ['collider-bias', 'time-varying-confounding']
  },

  {
    id: 'collider-bias',
    label: 'Collider bias (distinct from confounding)',
    category: 'Confounding',
    definition: 'A collider is a variable that has two or more causes on a directed acyclic graph. Conditioning on a collider (by adjusting, restricting, or stratifying on it) opens a non-causal path between its causes, inducing a spurious association even between variables that are otherwise independent.',
    directionOfBias: 'Unpredictable',
    directionExplanation: 'The direction and magnitude depend on the specific causal structure. Collider conditioning can induce both positive and negative spurious associations between the exposure and outcome or between causes of the collider.',
    typicalDesignContext: ['Any analysis with DAG-identified colliders', 'Mediation analysis', 'Survival analysis (conditioning on survival)', 'Stratified analyses'],
    mitigationStrategies: [
      'Draw a DAG before analysis to identify potential colliders.',
      'Avoid conditioning on colliders; if necessary, use sensitivity analyses.',
      'E-value or quantitative bias analysis to assess the potential impact.',
      'Consult with a methodologist for complex causal structures.'
    ],
    relatedBiases: ['collider-selection', 'overadjustment', 'time-varying-confounding']
  },

  {
    id: 'confounding-contraindication',
    label: 'Confounding by contraindication',
    category: 'Confounding',
    definition: 'Patients who do not receive a drug (are unexposed) may be so because of a contraindication that is itself associated with the outcome. The unexposed group is then a mixture of those who simply did not need the drug and those who had a specific condition preventing its use, making the comparison group heterogeneous and the estimate biased.',
    directionOfBias: 'Toward null',
    directionExplanation: 'The contraindicated patients in the unexposed group often have the condition that contraindicates the drug, which may itself increase the risk of the outcome. This increases the outcome rate in the unexposed, reducing the apparent relative risk (biasing toward null or producing a spurious protective effect).',
    typicalDesignContext: ['Drug safety / effectiveness cohort', 'Case-control', 'Any non-initiator comparison'],
    mitigationStrategies: [
      'Active comparator design: compare against users of a different drug with the same indication — avoids non-users (who may include contraindicated patients).',
      'Explicitly exclude patients with the contraindication from the unexposed group.',
      'Restriction to patients for whom the drug would be an appropriate choice (indication-restricted cohort).',
      'Propensity score methods that balance indication-related variables.'
    ],
    exampleScenario: 'Studying warfarin and stroke risk. Patients not on warfarin include those with bleeding disorders (contraindicated) who also have higher stroke risk — inflating the event rate in the unexposed and attenuating the protective effect of warfarin.',
    relatedBiases: ['confounding-by-indication', 'healthy-user', 'unmeasured-confounding']
  }

];
