// =============================================
// PRICING DATA — All constants extracted from
// OpenCVM Pricing Calculator
// =============================================

// Hosted pricing: 23-tier degressive curve for Core/Flow/NBO (same curve)
const CORE_TIERS = [
  { subs: 100000,  rate: 50.00,  annual: 6000.00 },
  { subs: 200000,  rate: 45.10,  annual: 10823.40 },
  { subs: 300000,  rate: 42.23,  annual: 15202.68 },
  { subs: 400000,  rate: 40.20,  annual: 19293.72 },
  { subs: 500000,  rate: 38.62,  annual: 23170.08 },
  { subs: 600000,  rate: 37.33,  annual: 26875.68 },
  { subs: 700000,  rate: 36.24,  annual: 30439.20 },
  { subs: 800000,  rate: 35.29,  annual: 33881.04 },
  { subs: 900000,  rate: 34.46,  annual: 37216.44 },
  { subs: 1000000, rate: 33.71,  annual: 40457.40 },
  { subs: 1500000, rate: 30.85,  annual: 55524.12 },
  { subs: 2000000, rate: 28.81,  annual: 69148.80 },
  { subs: 2500000, rate: 27.23,  annual: 81701.40 },
  { subs: 3000000, rate: 25.94,  annual: 93399.36 },
  { subs: 3500000, rate: 24.85,  annual: 104386.92 },
  { subs: 4000000, rate: 23.91,  annual: 114765.96 },
  { subs: 4500000, rate: 23.08,  annual: 124613.28 },
  { subs: 5000000, rate: 22.33,  annual: 133988.16 },
  { subs: 6000000, rate: 21.04,  annual: 151501.32 },
  { subs: 7000000, rate: 19.95,  annual: 167593.32 },
  { subs: 8000000, rate: 19.01,  annual: 182468.64 },
  { subs: 9000000, rate: 18.17,  annual: 196280.28 },
  { subs: 9900000, rate: 17.50,  annual: 207900.00 }
];

// Churn pricing: 12-tier separate curve
const CHURN_TIERS = [
  { subs: 100000,  rate: 15.00, annual: 6000.00 },
  { subs: 500000,  rate: 10.80, annual: 6478.20 },
  { subs: 1000000, rate: 8.99,  annual: 10784.28 },
  { subs: 2000000, rate: 7.18,  annual: 17224.20 },
  { subs: 3000000, rate: 6.12,  annual: 22024.44 },
  { subs: 4000000, rate: 5.37,  annual: 25759.80 },
  { subs: 5000000, rate: 4.78,  annual: 28703.28 },
  { subs: 6000000, rate: 4.31,  annual: 31015.80 },
  { subs: 7000000, rate: 3.91,  annual: 32803.68 },
  { subs: 8000000, rate: 3.56,  annual: 34142.28 },
  { subs: 9000000, rate: 3.25,  annual: 35088.12 },
  { subs: 9900000, rate: 3.00,  annual: 35640.00 }
];

// AWS regional rates
const AWS_REGIONS = {
  '1': { name: 'Western Europe',       mult: 1.10, floor: 3520,  varRate: 0.825  },
  '2': { name: 'Eastern Europe',       mult: 1.10, floor: 3520,  varRate: 0.825  },
  '3': { name: 'Middle East / GCC',    mult: 1.30, floor: 4160,  varRate: 0.975  },
  '4': { name: 'Southeast Asia',       mult: 1.10, floor: 3520,  varRate: 0.825  },
  '5': { name: 'South Asia',           mult: 0.95, floor: 3040,  varRate: 0.7125 },
  '6': { name: 'Africa',               mult: 1.30, floor: 4160,  varRate: 0.975  },
  '7': { name: 'North America',        mult: 1.00, floor: 3200,  varRate: 0.750  },
  '8': { name: 'Latin America',        mult: 1.45, floor: 4640,  varRate: 1.0875 }
};

// On-Prem regional rates (EUR/unit/month)
const ONPREM_REGIONS = {
  '1': { name: 'Western Europe',    vcpu: 8.00, ram: 0.70, storage: 0.08 },
  '2': { name: 'Eastern Europe',    vcpu: 6.00, ram: 0.55, storage: 0.06 },
  '3': { name: 'Middle East / GCC', vcpu: 4.50, ram: 0.40, storage: 0.04 },
  '4': { name: 'Southeast Asia',    vcpu: 5.00, ram: 0.45, storage: 0.05 },
  '5': { name: 'South Asia',        vcpu: 3.50, ram: 0.35, storage: 0.03 },
  '6': { name: 'Africa',            vcpu: 6.00, ram: 0.55, storage: 0.07 },
  '7': { name: 'North America',     vcpu: 7.00, ram: 0.60, storage: 0.07 },
  '8': { name: 'Latin America',     vcpu: 5.50, ram: 0.50, storage: 0.05 }
};

// On-Prem infra CI scaling
const ONPREM_CI_SCALE = [
  { max: 500000,   cis: 80  },
  { max: 1000000,  cis: 100 },
  { max: 3000000,  cis: 133 },
  { max: 5000000,  cis: 160 },
  { max: 10000000, cis: 200 },
  { max: Infinity,  cis: 250 }
];

// Managed services rates (EUR/CI/month)
const MS_RATES = { '9x5': 45, '24x7': 70 };

// Enterprise support (annual)
const SUPPORT_RATES = { '9x5': 24000, '24x7': 48000 };

// Deployment fees
const DEPLOY_FEES = { hosted: 10000, aws: 40000, onprem: 80000 };

// Implementation
const PS_RATE = 72;
const QUICK_MIG = 750;
const TRAD_MIG = 2500;
const SIMPLE_INT = 4500;
const COMPLEX_INT = 12000;

// App CI count (fixed)
const APP_CIS = 112;
const AWS_INFRA_CIS = 43;

// Competitor data
const COMP_TIERS = [500000, 1000000, 3000000, 5000000, 10000000, 10000001];
const COMPETITORS = {
  'Salesforce CDP':  { rates: [0.40,0.32,0.24,0.18,0.14,0.10], impl: [120000,150000,200000,280000,380000,500000], support: [50000,70000,100000,140000,190000,250000] },
  'Adobe RT-CDP':    { rates: [0.55,0.45,0.35,0.28,0.22,0.16], impl: [180000,220000,300000,400000,550000,750000], support: [80000,100000,140000,190000,260000,350000] },
  'Braze':           { rates: [0.15,0.12,0.10,0.08,0.06,0.05], impl: [45000,60000,80000,100000,140000,180000],    support: [18000,30000,45000,60000,80000,100000] },
  'Pelatro':         { rates: [0.14,0.11,0.09,0.07,0.055,0.04], impl: [60000,75000,100000,130000,170000,220000],  support: [20000,28000,40000,55000,70000,90000] },
  'Flytxt':          { rates: [0.16,0.13,0.10,0.08,0.065,0.05], impl: [70000,85000,110000,140000,180000,230000],  support: [25000,32000,45000,60000,75000,95000] },
  'Segment':         { rates: [0.18,0.15,0.12,0.10,0.08,0.06], impl: [50000,70000,100000,130000,170000,220000],   support: [20000,35000,50000,70000,90000,120000] }
};

// Region display names
const REGION_NAMES = {
  '1': 'Western Europe',
  '2': 'Eastern Europe',
  '3': 'Middle East / GCC',
  '4': 'Southeast Asia',
  '5': 'South Asia',
  '6': 'Africa',
  '7': 'North America',
  '8': 'Latin America'
};
