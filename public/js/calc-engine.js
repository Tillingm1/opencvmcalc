// =============================================
// CALCULATION ENGINE
// =============================================

function tierLookup(tiers, subs) {
  // VLOOKUP approximate match - find largest tier <= subs
  let match = tiers[0];
  for (const t of tiers) {
    if (t.subs <= subs) match = t;
    else break;
  }
  return match;
}

function getCompTierIndex(subs) {
  if (subs <= 500000) return 0;
  if (subs <= 1000000) return 1;
  if (subs <= 3000000) return 2;
  if (subs <= 5000000) return 3;
  if (subs <= 10000000) return 4;
  return 5;
}

function calcImplementation(inp) {
  return (600 * PS_RATE) +
         (inp.quickMig * QUICK_MIG) +
         (inp.simpleInt * SIMPLE_INT) +
         (inp.complexInt * COMPLEX_INT);
}

function integrationCIs(inp) {
  return inp.simpleInt + inp.complexInt * 2;
}

function calcHosted(inp) {
  let appCount = 1; // Core always on
  if (inp.flow) appCount++;
  if (inp.nbo) appCount++;

  const coreTier = tierLookup(CORE_TIERS, inp.subs);
  let annual = coreTier.annual * appCount;

  if (inp.churn) {
    const churnTier = tierLookup(CHURN_TIERS, inp.subs);
    annual += churnTier.annual;
  }

  const deployFee = DEPLOY_FEES.hosted;
  const implCost = calcImplementation(inp);

  return {
    platformAnnual: annual,
    supportAnnual: 0,
    msAnnual: 0,
    infraAnnual: 0,
    totalAnnual: annual,
    deployFee: deployFee,
    implCost: implCost,
    year1: annual + deployFee + implCost,
    tco5: (annual * 5) + deployFee + implCost
  };
}

function calcAWS(inp) {
  const region = AWS_REGIONS[inp.region];
  const totalCIs = APP_CIS + AWS_INFRA_CIS + integrationCIs(inp);
  const msRate = MS_RATES[inp.sla];
  const msAnnual = totalCIs * msRate * 12;
  const supportAnnual = SUPPORT_RATES[inp.sla];
  const exaAnnual = msAnnual + supportAnnual;

  // AWS infra cost
  const monthlyInfra = region.floor + region.varRate * (inp.subs / 1000) * (inp.traits / 200);
  const infraAnnual = monthlyInfra * 12;

  const totalAnnual = exaAnnual + infraAnnual;
  const deployFee = DEPLOY_FEES.aws;
  const implCost = calcImplementation(inp);

  return {
    totalCIs: totalCIs,
    msAnnual: msAnnual,
    supportAnnual: supportAnnual,
    exaAnnual: exaAnnual,
    infraAnnual: infraAnnual,
    totalAnnual: totalAnnual,
    deployFee: deployFee,
    implCost: implCost,
    year1: totalAnnual + deployFee + implCost,
    tco5: (totalAnnual * 5) + deployFee + implCost
  };
}

function calcOnPrem(inp) {
  const region = ONPREM_REGIONS[inp.region];

  // DVI
  const dvi = (inp.subs / 3000000) * (inp.traits / 200);

  // Resources
  const vcpu = 120 + 168 * dvi;
  const ram = 408 + 1344 * dvi;
  const storage = 15900 + 1950 * dvi;

  // Monthly infra cost
  const monthlyInfra = (vcpu * region.vcpu) + (ram * region.ram) + (storage * region.storage);
  const infraAnnual = monthlyInfra * 12;

  // Infra CIs
  let infraCIs = 80;
  for (const tier of ONPREM_CI_SCALE) {
    if (inp.subs <= tier.max) { infraCIs = tier.cis; break; }
  }

  const totalCIs = APP_CIS + infraCIs + integrationCIs(inp);
  const msRate = MS_RATES[inp.sla];
  const msAnnual = totalCIs * msRate * 12;
  const supportAnnual = SUPPORT_RATES[inp.sla];
  const exaAnnual = msAnnual + supportAnnual;

  const totalAnnual = exaAnnual + infraAnnual;
  const deployFee = DEPLOY_FEES.onprem;
  const implCost = calcImplementation(inp);

  return {
    dvi: dvi,
    vcpu: vcpu,
    ram: ram,
    storage: storage,
    infraCIs: infraCIs,
    totalCIs: totalCIs,
    msAnnual: msAnnual,
    supportAnnual: supportAnnual,
    exaAnnual: exaAnnual,
    infraAnnual: infraAnnual,
    totalAnnual: totalAnnual,
    deployFee: deployFee,
    implCost: implCost,
    year1: totalAnnual + deployFee + implCost,
    tco5: (totalAnnual * 5) + deployFee + implCost
  };
}

function calcCompetitors(inp) {
  const ti = getCompTierIndex(inp.subs);
  const results = {};
  for (const [name, data] of Object.entries(COMPETITORS)) {
    const annualPlatform = data.rates[ti] * inp.subs;
    const impl = data.impl[ti];
    const support = data.support[ti];
    const tco5 = (annualPlatform + support) * 5 + impl;
    results[name] = { annualPlatform, impl, support, tco5 };
  }
  return results;
}

// =============================================
// FORMATTING HELPERS
// =============================================

function fmt(n) {
  if (n === 0) return '\u20AC0';
  if (Math.abs(n) >= 1000000) return '\u20AC' + (n/1000000).toFixed(2) + 'M';
  if (Math.abs(n) >= 1000) return '\u20AC' + Math.round(n).toLocaleString('en');
  return '\u20AC' + n.toFixed(0);
}

function fmtFull(n) {
  return '\u20AC' + Math.round(n).toLocaleString('en');
}

function fmtSubs(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
  return (n/1000).toFixed(0) + 'K';
}

function pctSavings(ours, theirs) {
  if (theirs === 0) return '\u2014';
  const pct = ((theirs - ours) / theirs * 100).toFixed(0);
  return pct > 0 ? pct + '%' : '\u2014';
}

// Parse inputs from URL query params
function getInputsFromParams(params) {
  return {
    company: params.get('company') || 'Client',
    region: params.get('region') || '2',
    subs: parseInt(params.get('subs')) || 1000000,
    flow: params.get('flow') === '1',
    nbo: params.get('nbo') === '1',
    churn: params.get('churn') === '1',
    sla: params.get('sla') || '9x5',
    traits: parseInt(params.get('traits')) || 200,
    quickMig: parseInt(params.get('qm')) || 0,
    simpleInt: parseInt(params.get('si')) || 0,
    complexInt: parseInt(params.get('ci')) || 0
  };
}
