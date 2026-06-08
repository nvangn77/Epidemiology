/* =========================================================
   data/registries.js — Nordic Registry Navigator
   Globals: REGISTRIES (array), REGISTRY_NEEDS (array)
   ========================================================= */

var REGISTRIES = [

  /* ── LINKAGE / POPULATION ────────────────────────────────── */

  {
    id: 'cpr',
    label: 'Civil Registration System',
    danishName: 'Det Centrale Personregister',
    abbreviation: 'CPR',
    category: 'linkage',
    dataHolder: 'CPR-kontoret (Indenrigs- og Sundhedsministeriet)',
    accessRoute: 'Via Statistics Denmark (DST) Forskermaskinrummet; pseudonymised CPR via SDS',
    coverageStart: 1968,
    coverageEnd: null,
    geoCoverage: 'National — all Danish residents',
    population: 'Every person registered as resident in Denmark: births, immigrations, emigrations, deaths since 1968.',
    structuralBreak: null,
    keyVariables: [
      { name: 'CPR number',              type: 'linkage',     description: '10-digit personal identifier (DDMMYY-XXXX). Encodes date of birth and sex. Master linkage key across all Danish registers.' },
      { name: 'Date of birth',           type: 'demographic', description: 'Exact date; extracted from CPR number.' },
      { name: 'Sex',                     type: 'demographic', description: 'Biological sex encoded in the sequence number (odd = male, even = female).' },
      { name: 'Vital status + date',     type: 'outcome',     description: 'Exact date of death or emigration. Enables complete censoring in survival analyses.' },
      { name: 'Municipality (KOM)',      type: 'geographic',  description: 'Current and historical residence municipality; links to area-level SES data.' },
      { name: 'Immigration/emigration dates', type: 'temporal', description: 'Precise start/end of Danish residency for defining at-risk periods.' },
      { name: 'Family links (PNR)',      type: 'linkage',     description: 'Mother\'s, father\'s, and children\'s CPR numbers. Enables sibling-control and multigenerational designs.' }
    ],
    strengths: [
      'The backbone of Danish register research — every other register links via CPR.',
      'Exact emigration dates minimise informative censoring (a major strength vs. countries relying on loss-to-follow-up).',
      'Family linkage (parents, children) enables sibling-control, parent-offspring, and matched-sibling designs.',
      'Long time series from 1968 supports historical cohort studies with 50+ years of follow-up.',
      'Municipality codes enable time-varying geographic and contextual covariate adjustment.'
    ],
    limitations: [
      'Unregistered immigrants, tourists, and undocumented residents are not captured.',
      'CPR number changes (rare; e.g., legal gender change) complicate longitudinal linkage without bridging tables.',
      'Strict GDPR/data protection constraints: raw CPR numbers cannot leave secure Forskermaskinrummet environments.',
      'Pre-1968 persons may have incomplete or absent records.'
    ],
    knownPPVs: [],
    flaggedFor: ['linkage-backbone', 'vital-status', 'emigration-censoring', 'family-design', 'sibling-control'],
    nordics: {
      sweden:  { name: 'Swedish personnummer (PIN)',   coverage: '1947+', notes: '10-character. Maintained by Skatteverket (Swedish Tax Agency). Used as linkage key in all Swedish health registers.' },
      norway:  { name: 'Norwegian fødselsnummer (FNR)', coverage: '1964+', notes: '11-digit. Folkeregisteret. A synthetic linkage number (Lopenummer) is used in research extracts.' },
      finland: { name: 'Finnish henkilötunnus (HETU)', coverage: '1964+', notes: '11-character alphanumeric. Digi- ja väestötietovirasto (DVV). Used across Finnish health and social registers.' }
    }
  },

  /* ── EXPOSURE ─────────────────────────────────────────────── */

  {
    id: 'lpdb',
    label: 'National Prescription Registry',
    danishName: 'Lægemiddelstatistikregisteret',
    abbreviation: 'LPDB',
    category: 'exposure',
    dataHolder: 'Sundhedsdatastyrelsen (SDS)',
    accessRoute: 'Forskerservice, Sundhedsdatastyrelsen (sds.dk/forskerservice). Project application required; processing ~3–6 months.',
    coverageStart: 1994,
    coverageEnd: null,
    geoCoverage: 'National — all Danish community pharmacies',
    population: 'All reimbursed prescriptions dispensed from community pharmacies in Denmark. ~40 million records/year.',
    structuralBreak: null,
    keyVariables: [
      { name: 'ATC code (7-level)',      type: 'exposure',    description: 'WHO Anatomical Therapeutic Chemical classification to 7th level (e.g., C10AA01 = simvastatin). Essential for drug class and individual agent analyses.' },
      { name: 'Dispensing date (EKSD)',  type: 'temporal',    description: 'Exact date the prescription was collected from the pharmacy. Enables new-user designs, washout periods, and prescription sequence analyses.' },
      { name: 'Package size / strength', type: 'dose',        description: 'Number of units dispensed and per-unit dose; combined with DDD to estimate drug-days of supply.' },
      { name: 'Defined Daily Doses (DDD)', type: 'dose',      description: 'WHO-standardised dose metric enabling cross-drug dose–response analyses.' },
      { name: 'Prescriber ID (YNUMMER)', type: 'prescriber',  description: 'Anonymised prescribing physician identifier. Used as instrumental variable (prescriber preference IV design).' },
      { name: 'Pharmacy ID',            type: 'administrative', description: 'Dispensing pharmacy identifier for geographic and pharmacy-level analyses.' },
      { name: 'Reimbursement category', type: 'economic',     description: 'Patient co-payment category; proxy for drug cost and socioeconomic access.' },
      { name: 'CPR number',             type: 'linkage',      description: 'Patient identifier for linkage to all other Danish registers.' }
    ],
    strengths: [
      'Complete national coverage — captures all reimbursed community-dispensed drugs with no sampling.',
      'Exact dispensing dates enable new-user (first-dispense) cohort entry and washout period definitions.',
      'ATC coding to 7th level supports both drug-class analyses and individual active substance analyses.',
      'Prescriber ID (YNUMMER) is the standard instrument for prescriber-preference IV designs in Danish studies.',
      'DDD data supports dose–response analyses and adherence estimation (PDC/MPR).',
      'Long history from 1994 — 30+ years for historical pharmacoepidemiology.'
    ],
    limitations: [
      'Community dispensing only. Does NOT capture drugs administered in hospital — use DHMR for biologics, chemotherapy, IV medications.',
      'Records dispensing (pharmacy pickup), not actual ingestion. Adherence must be inferred from refill patterns.',
      'Over-the-counter drugs (including low-dose ibuprofen, paracetamol) are NOT included unless prescribed.',
      'No indication recorded. Drug–indication linkage requires external algorithms (e.g., prior diagnosis codes, sequence rules).',
      'Magistral preparations and hospital-compounded drugs are underrepresented.',
      'Private clinic prescriptions may be underrepresented in certain specialties before 2012.'
    ],
    knownPPVs: [
      { phenotype: 'Metformin initiation (T2DM proxy)',          ppv: '≥95%', source: 'Thomsen et al., Dan Med J' },
      { phenotype: 'Statin initiation (new user)',               ppv: '≥97%', source: 'Danish pharmacoepidemiology consensus' },
      { phenotype: 'SSRI/SNRI prescription (antidepressant use)', ppv: '≥92%', source: 'Wallach-Kildemoes et al.' },
      { phenotype: 'Oral anticoagulant (warfarin / NOAC)',       ppv: '≥96%', source: 'Register cross-validation' },
      { phenotype: 'Proton pump inhibitor use',                  ppv: '≥98%', source: 'High dispensing compliance data' }
    ],
    flaggedFor: ['exposure-community-drug', 'new-user-design', 'pssa', 'iv-prescriber-preference', 'dose-response'],
    nordics: {
      sweden:  { name: 'Swedish Prescribed Drug Register (PDR)', coverage: '2005+', notes: 'Socialstyrelsen. ATC-coded. Does not cover hospital drugs. ~90M dispensings/year.' },
      norway:  { name: 'Norwegian Prescription Database (NorPD)', coverage: '2004+', notes: 'Folkehelseinstituttet (FHI). ATC-coded. Covers community pharmacies. No hospital drugs.' },
      finland: { name: 'Finnish Social Insurance Institution (Kela) Drug Register', coverage: '1994+', notes: 'Kela. Covers reimbursed prescriptions. ATC-coded. Hospital drugs not included.' }
    }
  },

  {
    id: 'dhmr',
    label: 'National Hospital Medication Register',
    danishName: 'Sygehusmedicinregisteret',
    abbreviation: 'DHMR',
    category: 'exposure',
    dataHolder: 'Sundhedsdatastyrelsen (SDS)',
    accessRoute: 'Forskerservice, Sundhedsdatastyrelsen. Note: data completeness varies 2010–2012; full mandatory coverage from 2013.',
    coverageStart: 2010,
    coverageEnd: null,
    geoCoverage: 'National — all Danish public hospitals (mandatory from 2013; voluntary 2010–2012)',
    population: 'All drug administrations during hospitalisation in Denmark. Covers IV infusions, injected biologics, chemotherapy, anaesthetics, and ward-dispensed oral drugs.',
    structuralBreak: null,
    keyVariables: [
      { name: 'ATC code (7-level)',        type: 'exposure',    description: 'Drug identification. Critical: biosimilar vs. originator distinction requires manual ATC review (e.g., adalimumab biosimilars share L04AB04).' },
      { name: 'Administration date/time',  type: 'temporal',    description: 'Precise timestamp of each drug administration — enables time-to-first-dose and intra-hospital sequence analyses.' },
      { name: 'Dose (mg / unit)',          type: 'dose',        description: 'Administered dose in milligrams or clinical units (e.g., IU for biologics). Enables dose–response analyses for hospital drugs.' },
      { name: 'Administration route',      type: 'route',       description: 'IV, SC, IM, oral, topical, etc. Essential for separating parenteral from oral regimens.' },
      { name: 'Contact ID',               type: 'linkage',     description: 'Links to LPR3 hospital contact record. Enables linkage to diagnosis, procedure, and ward data.' },
      { name: 'CPR number',               type: 'linkage',     description: 'Patient identifier for cross-register linkage.' }
    ],
    strengths: [
      'The only Danish register capturing in-hospital drug administration — essential for biologics, chemotherapy, IV antibiotics, and anaesthetics.',
      'Precise dose and route information enables dose–response analyses not possible with community prescription data.',
      'Contact ID linkage to LPR3 enables full in-hospital pathway analysis (diagnosis → drug → outcome).',
      'Critical for oncology pharmacoepidemiology: chemotherapy regimen reconstruction, infusion centre visits.',
      'Key for rheumatology, gastroenterology, and dermatology studies involving IV or SC biologics.'
    ],
    limitations: [
      'Coverage is incomplete before 2013 (voluntary participation 2010–2012 means ~40–70% hospital coverage in early years).',
      'Does not capture community prescriptions — LPDB must be used for those (the two registers are complementary, not overlapping).',
      'Data quality and coding practices vary across hospitals and across the 2010–2013 ramp-up period.',
      'Biosimilar vs. originator distinction problematic: many biosimilars share the originator ATC code.',
      'Unlicensed (magistral) preparations may have incomplete or inconsistent ATC coding.',
      'Does not capture drug use in private hospitals.'
    ],
    knownPPVs: [
      { phenotype: 'TNF inhibitor administration (adalimumab/etanercept/infliximab)', ppv: '~90%', source: 'DANBIO-DHMR cross-linkage studies' },
      { phenotype: 'IV platinum-based chemotherapy',                                  ppv: '>85%', source: 'Oncology register cross-validation' },
      { phenotype: 'IV corticosteroid (methylprednisolone)',                          ppv: '~80%', source: 'Internal SDS data quality reports' }
    ],
    flaggedFor: ['exposure-inhospital-drug', 'biologic', 'chemotherapy', 'iv-antibiotic', 'dose-response'],
    nordics: {
      sweden:  { name: 'Swedish Patient Register (NPR) + Drug Register', coverage: 'Partial via NPR DRG codes', notes: 'Sweden has no direct equivalent to DHMR. Hospital drugs partially reconstructed via NPR procedure codes and oncology quality registers.' },
      norway:  { name: 'Norwegian Hospital Drug Register (in development)', coverage: 'Pilot from ~2018', notes: 'Norway is developing a hospital medication register; coverage not yet national. NorPD covers community only.' },
      finland: { name: 'Finnish Hospital Drug Register (Hilmo + Kela partial)', coverage: 'Partial', notes: 'Finland does not have a comprehensive hospital drug register equivalent to DHMR. Some hospital drug use reconstructable from HILMO procedure codes.' }
    }
  },

  /* ── OUTCOME / DIAGNOSIS ──────────────────────────────────── */

  {
    id: 'lpr',
    label: 'National Patient Registry',
    danishName: 'Landspatientregisteret',
    abbreviation: 'LPR',
    category: 'outcome',
    dataHolder: 'Sundhedsdatastyrelsen (SDS)',
    accessRoute: 'Forskerservice, Sundhedsdatastyrelsen. Bridging LPR2/LPR3 data extracts available; specify which version(s) required in the application.',
    coverageStart: 1977,
    coverageEnd: null,
    geoCoverage: 'National — all Danish public hospitals',
    population: 'All somatic hospital contacts in Denmark: inpatient admissions (from 1977), outpatient specialist visits (from 1995), and emergency department contacts (from 1995).',
    structuralBreak: {
      description: 'Structural shift from LPR2 to LPR3 in February 2019. Studies spanning this date require explicit data model bridging.',
      lpr2: {
        label: 'LPR2 (1977 – Jan 2019)',
        unit: 'Single admission row per hospital contact (inlæggelse / ambulant)',
        diagnosisField: 'DIAG table: one primary (aktionsdiagnose) + multiple secondary (bidiagnoser) ICD-10 codes per contact',
        procedureField: 'PROC table: SKS/NCSP procedure codes linked by admission identifier',
        keyTables: ['T_ADM (admissions)', 'T_DIAG (diagnoses)', 'T_SKSUBE (procedures)'],
        notes: 'One record per contact; straightforward reshaping for most analyses. ICD-10 coding from 1994 (ICD-8 1977–1993). No sub-contact hierarchy.'
      },
      lpr3: {
        label: 'LPR3 (Feb 2019 – present)',
        unit: 'Three-level hierarchy: Episode → Contact → Sub-contact',
        diagnosisField: 'DIAGNOSE table linked to sub-contacts via KONTAKT_ID — each sub-contact can carry independent diagnoses',
        procedureField: 'PROCEDURE table linked to sub-contacts; enables intra-contact procedure sequencing',
        keyTables: ['FORLOEB (episode)', 'KONTAKT (contact)', 'DIAGNOSE', 'PROCEDURE'],
        notes: 'More granular but requires restructuring to produce LPR2-equivalent "index contact" logic. Timestamps at sub-contact level. Contact type (inpatient/outpatient/ED) now a structured field.'
      }
    },
    keyVariables: [
      { name: 'ICD-10 diagnosis codes',    type: 'outcome',       description: 'Primary (aktionsdiagnose) and secondary (bidiagnoser) diagnoses. ICD-10 from 1994; ICD-8 in 1977–1993.' },
      { name: 'SKS/NCSP procedure codes',  type: 'outcome',       description: 'Surgical and diagnostic procedure codes. Nordic Medico-Statistical Committee (NOMESCO) classification.' },
      { name: 'Admission/discharge dates', type: 'temporal',      description: 'Hospitalisation start and end dates; length of stay calculable.' },
      { name: 'Contact type',             type: 'administrative', description: 'Inpatient (stationær), outpatient (ambulant), emergency (akut ambulant). Critical for defining index events.' },
      { name: 'Hospital / department code', type: 'administrative', description: 'Treating hospital (SHAKcode) and clinical department. Enables provider-level analyses.' },
      { name: 'DRG code',                 type: 'economic',       description: 'Diagnosis-Related Group. Used for healthcare cost analyses.' },
      { name: 'CPR number',               type: 'linkage',        description: 'Patient identifier.' }
    ],
    strengths: [
      'Near-complete national coverage of all hospital contacts since 1977 — >99% of admissions captured.',
      'Outpatient and emergency contacts from 1995 expand outcome ascertainment well beyond hospitalised cases.',
      'Long time series with ICD-8 → ICD-10 transition allows very long lookback for comorbidity (Charlson, Elixhauser).',
      'SKS procedure codes enable surgical and diagnostic procedure-based outcome and exposure definitions.',
      'LPR3 sub-contact resolution enables fine-grained intra-hospital pathway analyses.'
    ],
    limitations: [
      'Structural LPR2→LPR3 break in February 2019 requires explicit bridging logic in any study spanning this period.',
      'Primary care diagnoses are NOT included — conditions managed solely in general practice are invisible (use DAMD or sentinel networks).',
      'Coding quality is administrative, not clinically validated: up-coding, miscoding, and incomplete secondary diagnoses occur.',
      'LPR2 diagnosis codes recorded at admission level; sub-contact granularity only available in LPR3.',
      'Private hospital contacts not included (unless contracted by the public system).',
      'Readmission / transfer logic differs between LPR2 and LPR3, affecting recurrence and re-hospitalisation outcome definitions.'
    ],
    knownPPVs: [
      { phenotype: 'Acute myocardial infarction (I21)',                ppv: '94%',  source: 'Joensen et al. 2009, Dan Med J' },
      { phenotype: 'Ischaemic stroke (I63)',                           ppv: '~93%', source: 'Johnsen et al. 2002, Neuroepidemiology' },
      { phenotype: 'Heart failure (I50)',                              ppv: '84%',  source: 'Kasner et al., register validation' },
      { phenotype: 'Type 2 diabetes (E11)',                            ppv: '~85%', source: 'Carstensen et al., Diabet Med 2008' },
      { phenotype: 'Hip fracture (S72)',                               ppv: '97%',  source: 'Danish Hip Fracture Register cross-validation' },
      { phenotype: 'COPD (J44)',                                       ppv: '~82%', source: 'Thomsen et al. 2011, Clin Epidemiol' },
      { phenotype: 'Atrial fibrillation (I48)',                        ppv: '93%',  source: 'Frost et al. 2012, Eur J Epidemiol' },
      { phenotype: 'Venous thromboembolism / PE (I26, I80)',           ppv: '~75%', source: 'Severinsen et al. 2010, Br J Haematol' }
    ],
    flaggedFor: ['outcome-hospitalisation', 'outcome-procedure', 'comorbidity-charlson', 'outcome-ami', 'outcome-stroke', 'lpr2-lpr3-bridging'],
    nordics: {
      sweden:  { name: 'Swedish National Patient Register (NPR / Patientregistret)', coverage: 'Inpatient 1987+; outpatient 2001+', notes: 'Socialstyrelsen. ICD-10 from 1997. ~99% inpatient completeness. Often called the Swedish "PAR".' },
      norway:  { name: 'Norwegian Patient Register (NPR / Norsk pasientregister)',   coverage: 'Individual-level 2008+',          notes: 'Helsedirektoratet. ICD-10. Individual-level data (pseudonymised) from 2008; earlier data were aggregated.' },
      finland: { name: 'Finnish Hospital Discharge Register (HILMO)',                 coverage: 'Inpatient 1969+; outpatient 1998+', notes: 'THL (Finnish Institute for Health and Welfare). ICD-10 from 1996. One of Europe\'s oldest hospital registers.' }
    }
  },

  {
    id: 'cod',
    label: 'Cause of Death Register',
    danishName: 'Dødsårsagsregisteret',
    abbreviation: 'COD',
    category: 'outcome',
    dataHolder: 'Sundhedsdatastyrelsen (SDS)',
    accessRoute: 'Forskerservice, Sundhedsdatastyrelsen. ~1–2 year data lag; most recent calendar year typically not yet available.',
    coverageStart: 1970,
    coverageEnd: null,
    geoCoverage: 'National — all deaths of Danish residents regardless of location (including abroad)',
    population: 'All deaths of persons registered in CPR: underlying cause, contributing causes, and manner of death from death certificates.',
    structuralBreak: null,
    keyVariables: [
      { name: 'Underlying cause of death', type: 'outcome',   description: 'Single ICD-10 code for the primary cause (ICD-8 pre-1994). The standard field for cause-specific mortality.' },
      { name: 'Contributing causes (1–4)', type: 'outcome',   description: 'Up to 4 ICD-10 codes for comorbidities contributing to death but not the underlying cause.' },
      { name: 'Date of death',             type: 'temporal',  description: 'Exact date. Also available in CPR — COD adds the causal classification.' },
      { name: 'Manner of death',           type: 'outcome',   description: 'Natural / accident / suicide / homicide / undetermined. Required for cause-specific analyses involving suicide or injury.' },
      { name: 'Place of death',            type: 'administrative', description: 'Hospital, home, nursing home, other institution. Relevant for healthcare utilisation and end-of-life studies.' }
    ],
    strengths: [
      'Complete national coverage — captures all deaths of Danish residents including those occurring abroad.',
      'Underlying and contributing causes enable cause-specific mortality and competing-risk analyses.',
      'Linkage to CPR provides all competing-risk death dates for non-cause deaths (essential for competing risks framework).',
      'Long historical series from 1970 with ICD-10 coding from 1994.'
    ],
    limitations: [
      'Approximately 1–2 year data lag; the most recent calendar year is typically unavailable when applying.',
      'Coding quality variable: underlying cause misclassification is most common in elderly patients with multiple comorbidities.',
      'Suicide and accident classifications may be underestimated due to "undetermined" coding (~10–25% misclassification).',
      'Death certificate coding does not routinely use clinical records: coding relies on attending physician\'s documentation.',
      'Deaths in Denmark of non-residents (tourists) are recorded but linkage to Danish health registers is not possible for these individuals.'
    ],
    knownPPVs: [
      { phenotype: 'Cardiovascular death (I00–I99 as underlying)',   ppv: '~80%', source: 'Joensen et al., Danish register validation' },
      { phenotype: 'Cancer death (C00–C97 as underlying)',            ppv: '>90%', source: 'DCR vs. COD cross-validation' },
      { phenotype: 'Suicide (X60–X84)',                               ppv: '~75%', source: 'Erlangsen et al. 2017, Lancet Psychiatry' }
    ],
    flaggedFor: ['outcome-death', 'cause-specific-mortality', 'competing-risks'],
    nordics: {
      sweden:  { name: 'Swedish Cause of Death Register (Dödsorsaksregistret)', coverage: '1952+', notes: 'Socialstyrelsen. ICD-10 from 1997. ~99% completeness; <1% of deaths are death-certificate-only.' },
      norway:  { name: 'Norwegian Cause of Death Registry',                      coverage: '1951+', notes: 'Folkehelseinstituttet. ICD-10 from 1996. Register re-structured in 2012; minor comparability issues before/after.' },
      finland: { name: 'Finnish Cause of Death Statistics',                       coverage: '1936+', notes: 'Statistics Finland. ICD-10 from 1996. One of the world\'s longest continuous cause-of-death series.' }
    }
  },

  {
    id: 'dcr',
    label: 'Danish Cancer Registry',
    danishName: 'Cancerregisteret',
    abbreviation: 'DCR',
    category: 'outcome',
    dataHolder: 'Sundhedsdatastyrelsen (SDS)',
    accessRoute: 'Forskerservice, Sundhedsdatastyrelsen. Mandatory notification since 1942; all incident cancers reportable.',
    coverageStart: 1943,
    coverageEnd: null,
    geoCoverage: 'National',
    population: 'All incident cancer cases in Denmark. Mandatory notification by pathology departments, clinical departments, and death certificates.',
    structuralBreak: null,
    keyVariables: [
      { name: 'ICD-10 / ICD-O-3 topography', type: 'outcome',       description: 'Cancer site coded to ICD-O-3 topography and morphology (histological type). Enables cancer subtype analyses.' },
      { name: 'Date of diagnosis',            type: 'temporal',      description: 'Date of incident cancer diagnosis — the standard cancer incidence index date.' },
      { name: 'TNM stage',                    type: 'outcome',       description: 'Tumour–node–metastasis staging. Improving completeness from 2004; systematic collection from 2010 (RKKP).' },
      { name: 'Morphology (ICD-O-3)',         type: 'outcome',       description: 'Histological type code. Enables distinction of e.g. squamous vs. adenocarcinoma, NSCLC subtypes.' },
      { name: 'Notification source',          type: 'administrative', description: 'Pathology report, clinical notification, or death certificate only (DCO — lower data quality).' }
    ],
    strengths: [
      'One of the world\'s oldest population-based cancer registries (since 1943) — among the longest cancer time series globally.',
      'Mandatory notification ensures near-complete incidence coverage (~98% for most cancers).',
      'Morphology coding enables cancer subtype analyses (essential for e.g. breast cancer, lymphoma, NSCLC subtype studies).',
      'Long historical series supports secular trend analyses and cohort effects across birth cohorts.'
    ],
    limitations: [
      'Staging (TNM) data incomplete before 2004; systematic population-level staging from RKKP quality registers from ~2010.',
      'Treatment information not captured in DCR — reconstruct from LPDB (oral drugs) + DHMR (IV/SC chemo) + LPR (surgery).',
      'Death-certificate-only (DCO) cases have less validated histology and no staging.',
      'Rare cancers or unusual morphologies may have heterogeneous coding across reporting institutions.'
    ],
    knownPPVs: [
      { phenotype: 'Any malignant cancer (all sites)',            ppv: '~98%', source: 'Storm et al., Danish Cancer Society register validation' },
      { phenotype: 'Colorectal cancer (C18–C20)',                 ppv: '>97%', source: 'DCR vs. pathology register cross-validation' },
      { phenotype: 'Breast cancer (C50)',                         ppv: '>98%', source: 'Danish Breast Cancer Cooperative Group (DBCG) validation' }
    ],
    flaggedFor: ['outcome-cancer', 'cancer-incidence', 'cancer-subtype'],
    nordics: {
      sweden:  { name: 'Swedish Cancer Register', coverage: '1958+', notes: 'Socialstyrelsen / Cancerfonden. NORDCAN member. ICD-7 early years, ICD-10 now. ~98% completeness.' },
      norway:  { name: 'Cancer Registry of Norway (CRN)', coverage: '1952+', notes: 'Kreftregisteret. NORDCAN member. Mandatory notification. TNM staging well-developed.' },
      finland: { name: 'Finnish Cancer Registry (FCR)', coverage: '1953+', notes: 'Suomen Syöpärekisteri. NORDCAN member. One of the world\'s longest running. ~99% completeness.' }
    }
  },

  /* ── CONFOUNDERS / CONTEXT ────────────────────────────────── */

  {
    id: 'dst',
    label: 'Statistics Denmark Registers',
    danishName: 'Danmarks Statistik — registerdata',
    abbreviation: 'DST',
    category: 'confounder',
    dataHolder: 'Danmarks Statistik (DST)',
    accessRoute: 'SEPARATE application to DST Forskerservice (dst.dk/microdata). Requires own data agreement distinct from SDS agreement. Budget extra 2–4 months and ~DKK 5,000–15,000/year access fee.',
    coverageStart: 1980,
    coverageEnd: null,
    geoCoverage: 'National — all Danish residents',
    population: 'Annual individual-level records on education, income, employment, housing, and family composition for all Danish residents.',
    structuralBreak: null,
    keyVariables: [
      { name: 'Education (DISCED / HFAUDD)',        type: 'confounder',   description: 'Highest completed education coded to ISCED-aligned Danish classification. Available annually from ~1970.' },
      { name: 'Disposable income (PERINDKIALT_13)', type: 'confounder',   description: 'Annual household disposable income in DKK. Used for income quintile/decile adjustment in health equity analyses.' },
      { name: 'Employment status (BESKST13)',        type: 'confounder',   description: 'Employed, unemployed, self-employed, retired, student, outside labour market. Annual snapshot.' },
      { name: 'Cohabitation / marital status',       type: 'confounder',   description: 'Married, cohabiting, single, divorced, widowed. Relevant for social support confounding.' },
      { name: 'Country of origin (FOED_LAND)',       type: 'demographic',  description: 'Birth country and immigrant/descendant classification. Proxy for ethnicity in the absence of ethnic data.' },
      { name: 'Housing type / ownership',            type: 'confounder',   description: 'Owner-occupied, rented, social housing. Indicator of material deprivation.' },
      { name: 'Municipality (BOPIKOM)',              type: 'geographic',   description: 'Annual residential municipality for geographic confounding and healthcare access analyses.' }
    ],
    strengths: [
      'The only source for socioeconomic confounders (income, education, employment) in Danish research — not available in health registers.',
      'Annual updates enable time-varying socioeconomic covariate adjustment, critical for long follow-up studies.',
      'All data are administrative (tax records, education registries) — no self-report bias.',
      'Income and education completeness is very high (>98%) for persons with Danish CPR numbers.'
    ],
    limitations: [
      'SEPARATE data agreement with DST required (independent from SDS health register agreements) — additional cost, time, and governance.',
      'Analysis must occur within DST\'s secure Forskermaskinrummet — data cannot be transferred outside.',
      'Education level may be missing for recent immigrants with no Danish educational registration.',
      'Income data available from ~1980; education records vary in completeness pre-1980.'
    ],
    knownPPVs: [],
    flaggedFor: ['confounder-ses', 'confounder-education', 'confounder-income', 'health-equity', 'nordic'],
    nordics: {
      sweden:  { name: 'Statistics Sweden (SCB) — LISA database', coverage: '1990+', notes: 'Longitudinal Integration Database for Health Insurance and Labour Market Studies. Annual update. Education, income, employment.' },
      norway:  { name: 'Statistics Norway (SSB) — FD-Trygd / income registers', coverage: '1992+', notes: 'Various linked registers (FD-Trygd for social benefits). Education register from ~1970.' },
      finland: { name: 'Statistics Finland / THL — FOLK database', coverage: '1987+', notes: 'Integrated dataset from Statistics Finland and THL. Education, income, employment.' }
    }
  },

  {
    id: 'damd',
    label: 'Danish General Practice Database',
    danishName: 'Dansk Almen Medicinsk Database / Sentinel netværket',
    abbreviation: 'DAMD',
    category: 'confounder',
    dataHolder: 'Regionernes Kliniske Kvalitetsudviklingsprogram (RKKP) / Praktiserende Lægers Organisation (PLO)',
    accessRoute: 'Application to RKKP or individual regional research committees. Access pathway less standardised than SDS/DST; processing times vary. Not available via standard Forskerservice.',
    coverageStart: 2000,
    coverageEnd: null,
    geoCoverage: 'Partial national — approximately 60–70% of GP practices participate (varies by region)',
    population: 'Consultations, diagnoses (ICPC-2), prescriptions, referrals, and chronic disease management data from participating Danish general practitioners.',
    structuralBreak: null,
    keyVariables: [
      { name: 'ICPC-2 diagnosis code',    type: 'outcome',       description: 'International Classification of Primary Care (version 2). The only source of GP-level diagnoses in Denmark.' },
      { name: 'Consultation date',        type: 'temporal',      description: 'Date of GP contact (in-person or telephone).' },
      { name: 'Chronic disease flags',    type: 'confounder',    description: 'Structured chronic disease registration (diabetes, asthma, COPD, hypertension) by GPs.' },
      { name: 'GP referral codes',        type: 'administrative', description: 'Specialist referral codes indicating the referred specialty; relevant for care pathway analyses.' },
      { name: 'Lab values (partial)',     type: 'confounder',    description: 'HbA1c, lipid profiles, blood pressure — available from some practices; coverage variable.' }
    ],
    strengths: [
      'The only source for primary care diagnoses — captures the substantial disease burden managed exclusively in general practice.',
      'ICPC-2 coding enables chronic disease burden estimation beyond hospital-recorded diagnoses.',
      'Captures GP-level morbidity relevant for adjustment in pharmacoepidemiology (e.g., conditions not requiring hospitalisation).'
    ],
    limitations: [
      '60–70% GP participation means non-random missing data — practices that opt in may differ systematically.',
      'ICPC-2 coding quality varies substantially between practices and EHR systems (XMO, Novax, PLC systems differ).',
      'Not available via standard SDS Forskerservice — requires separate application with less predictable processing times.',
      'Lab values (HbA1c, lipids) available from subset of practices only; completeness insufficient for population-level analyses.'
    ],
    knownPPVs: [
      { phenotype: 'Type 2 diabetes (ICPC T90)', ppv: '~88%', source: 'DAMD internal validation study' }
    ],
    flaggedFor: ['outcome-primary-care', 'confounder-comorbidity-gp'],
    nordics: null
  }

];

/* =========================================================
   REGISTRY_NEEDS — Feasibility Checker Rules
   Each need maps to one or more register IDs and carries
   a specific tip for how the register fulfils that need.
   ========================================================= */
var REGISTRY_NEEDS = [

  /* Exposure */
  {
    id: 'exp-comm-rx',
    group: 'Exposure',
    label: 'Community prescription drug',
    description: 'Drug dispensed from a pharmacy (oral, topical, inhaled)',
    registers: ['lpdb'],
    tip: 'LPDB gives ATC code, exact dispensing date, DDD, and prescriber ID. Foundation for new-user designs and washout definitions.'
  },
  {
    id: 'exp-hosp-drug',
    group: 'Exposure',
    label: 'In-hospital drug (biologic / chemo / IV)',
    description: 'IV infusion, subcutaneous biologic, chemotherapy, or anaesthetic administered in hospital',
    registers: ['dhmr'],
    tip: 'DHMR is the only Danish register capturing hospital-administered drugs. Full coverage from 2013; verify completeness if using 2010–2012 data.'
  },
  {
    id: 'exp-both-rx',
    group: 'Exposure',
    label: 'Drug used both in hospital and community',
    description: 'E.g., insulin — dispensed from pharmacy AND administered in hospital during admissions',
    registers: ['lpdb', 'dhmr'],
    tip: 'Combine LPDB (community) and DHMR (hospital) to avoid exposure misclassification. The two registers are complementary and non-overlapping.'
  },

  /* Outcome */
  {
    id: 'out-hospital-diag',
    group: 'Outcome',
    label: 'Hospital diagnosis / procedure (ICD-10)',
    description: 'Any condition coded at a hospital contact (inpatient, outpatient, or ED)',
    registers: ['lpr'],
    tip: 'LPR covers all public hospital contacts. Flag: if your study spans February 2019, you need explicit LPR2→LPR3 bridging code.'
  },
  {
    id: 'out-death-allcause',
    group: 'Outcome',
    label: 'All-cause mortality',
    description: 'Date of death for survival/time-to-event analyses',
    registers: ['cpr'],
    tip: 'Exact death date is in CPR. CPR is always needed for censoring; emigration date is also here.'
  },
  {
    id: 'out-death-cause',
    group: 'Outcome',
    label: 'Cause-specific mortality (ICD-10)',
    description: 'Underlying or contributing cause of death (cardiovascular, cancer, suicide, etc.)',
    registers: ['cpr', 'cod'],
    tip: 'CPR gives the death date; COD register gives the ICD-10 underlying and contributing causes. Request both. Note ~1–2 year data lag in COD.'
  },
  {
    id: 'out-cancer',
    group: 'Outcome',
    label: 'Incident cancer (ICD-O-3 / ICD-10)',
    description: 'New cancer diagnosis, subtype, or stage',
    registers: ['dcr'],
    tip: 'DCR has near-complete cancer incidence (mandatory notification). Staging data reliable from 2004+. Morphology coding enables subtype analyses.'
  },
  {
    id: 'out-primary-care',
    group: 'Outcome',
    label: 'Primary care outcome (GP diagnosis)',
    description: 'Condition managed exclusively in general practice (not hospitalised)',
    registers: ['damd'],
    tip: 'DAMD is the only source for GP-level ICPC-2 diagnoses. Note ~60–70% GP participation — assess non-participation bias for your outcome.'
  },

  /* Adjustment & confounders */
  {
    id: 'adj-demographics',
    group: 'Adjustment',
    label: 'Age, sex, vital status, emigration',
    description: 'Core demographics and exact censoring dates',
    registers: ['cpr'],
    tip: 'CPR is always required. Provides exact emigration dates (for censoring) and family linkage (for sibling-control designs).'
  },
  {
    id: 'adj-comorbidity',
    group: 'Adjustment',
    label: 'Hospital comorbidities (Charlson / Elixhauser)',
    description: 'Prior hospital diagnoses for comorbidity indexing',
    registers: ['lpr'],
    tip: 'Use LPR diagnosis history (typically 10-year lookback) to compute the Charlson Comorbidity Index or Elixhauser score. Standard practice in Danish pharmacoepidemiology.'
  },
  {
    id: 'adj-ses',
    group: 'Adjustment',
    label: 'Socioeconomic status (income, education, employment)',
    description: 'Socioeconomic confounders not available in health registers',
    registers: ['dst'],
    tip: 'DST requires a SEPARATE data agreement independent from SDS. Budget 2–4 extra months and additional access fees. Data analysis must occur in DST\'s own Forskermaskinrummet.'
  },
  {
    id: 'adj-drug-history',
    group: 'Adjustment',
    label: 'Prior drug use (concomitant medications, channelling)',
    description: 'Previous drug prescriptions as confounders (polypharmacy, channelling bias control)',
    registers: ['lpdb'],
    tip: 'LPDB prescription history (e.g., 1-year lookback) provides concomitant medication data for confounding adjustment and channelling-bias control.'
  },

  /* Study design */
  {
    id: 'design-iv-prescriber',
    group: 'Study design',
    label: 'Instrumental variable: prescriber preference',
    description: 'Use physician prescribing tendency as IV for drug–outcome studies',
    registers: ['lpdb'],
    tip: 'Prescriber ID (YNUMMER) in LPDB links each prescription to an anonymised physician. Define instrument as physician\'s % prescribing drug A vs. B in prior 12 months.'
  },
  {
    id: 'design-pssa',
    group: 'Study design',
    label: 'Prescription sequence symmetry analysis (PSSA)',
    description: 'Drug A → Drug B temporal sequence as adverse drug reaction signal',
    registers: ['lpdb'],
    tip: 'Exact dispensing dates in LPDB are required for PSSA. Identify all incident co-users of both drugs; compare n(A→B) vs. n(B→A).'
  },
  {
    id: 'design-new-user',
    group: 'Study design',
    label: 'New-user (first-dispense) cohort entry',
    description: 'Restrict to patients initiating a drug for the first time (with washout)',
    registers: ['lpdb'],
    tip: 'LPDB from 1994 enables washout periods of 1–5+ years to define true new users. CPR provides the cohort frame and entry/exit dates.'
  },
  {
    id: 'nordic',
    group: 'Study design',
    label: 'Nordic cross-country linkage (Sweden, Norway, Finland)',
    description: 'Combine Danish data with equivalent Nordic registers',
    registers: ['cpr', 'dst'],
    tip: 'Cross-Nordic linkage requires inter-Nordic data-sharing agreements (e.g., NORDLINK). Personal identifiers are pseudonymised differently per country — bridging tables are required. Budget 6–18 months for ethics, data-sharing agreements, and governance approvals. Contact Forskerservice (SDS) and your institution\'s data governance team early.'
  }

];
