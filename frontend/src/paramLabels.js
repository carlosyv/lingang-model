// Human-readable labels for the 68-key SCITEGXR parameter vector (see docs/data-model.md
// and the framework deck's "SCITEGXR Dimension System" page). All values are normalized
// to [0,1] against the framework's reference ranges; for inverted signals (e.g. a "low
// value is favorable" parameter), the label still reads as "higher raw score."

export const BLOCKS = [
  { key: "S", name: "Socio-Economic", color: "#4c8bf5" },
  { key: "C", name: "Cultural", color: "#b02bd9" },
  { key: "I", name: "Industrial", color: "#d9552b" },
  { key: "T", name: "Technological", color: "#2e9e5b" },
  { key: "E", name: "Environmental", color: "#3ec9c9" },
  { key: "G", name: "Geopolitical", color: "#d9a62b" },
  { key: "X", name: "Infrastructure", color: "#8a8f98" },
  { key: "R", name: "Critical Resources", color: "#e05b8f" },
];

export const PARAM_LABELS = {
  S01: "GDP per capita (PPP)",
  S02: "Human Development Index",
  S03: "Urbanization rate",
  S04: "Energy poverty rate",
  S05: "Fiscal capacity",
  S06: "Public debt / GDP",
  S07: "Inflation stability",
  S08: "Unemployment rate",
  S09: "Gini coefficient (inequality)",
  S10: "Fossil revenue % of GDP",

  C01: "Power distance (Hofstede)",
  C02: "Individualism (Hofstede)",
  C03: "Uncertainty avoidance (Hofstede)",
  C04: "Long-term orientation (Hofstede)",
  C05: "Institutional trust",
  C06: "Technology acceptance",
  C07: "Business language alignment",
  C08: "Regulatory transparency",

  I01: "Manufacturing maturity",
  I02: "Industrial diversification",
  I03: "Energy-intensive industry share",
  I04: "Export processing capacity",
  I05: "SEZ / FTZ density",
  I06: "Labor cost competitiveness",
  I07: "Fossil fuel production capacity",
  I08: "Renewable generation mix",
  I09: "Fossil/gas pipeline & LNG infrastructure",
  I10: "Hydrogen repurposing readiness",

  T01: "Digital readiness index",
  T02: "Grid modernization level",
  T03: "Hydrogen technology readiness",
  T04: "AI platform adoption",
  T05: "R&D investment intensity",
  T06: "Telecom / broadband penetration",
  T07: "Skilled workforce (STEM)",
  T08: "Patent & IP activity",

  E01: "CO2 emissions per capita",
  E02: "Solar generation potential",
  E03: "Wind generation potential",
  E04: "Water stress index",
  E05: "Land availability for renewables",
  E06: "Biodiversity / environmental risk",
  E07: "Climate vulnerability (ND-GAIN)",
  E08: "Adaptation readiness",
  E09: "NDC / environmental ambition",

  G01: "Political stability (WGI)",
  G02: "Conflict intensity",
  G03: "Fragility index",
  G04: "Government effectiveness",
  G05: "Energy export leverage",
  G06: "China bilateral relations",
  G07: "EU partnership depth",
  G08: "Western/US alignment",
  G09: "Regional integration",
  G10: "Rule of law",

  X01: "Logistics Performance Index (LPI)",
  X02: "Port connectivity",
  X03: "Road / rail density",
  X04: "Grid reliability",
  X05: "SEZ infrastructure quality",
  X06: "Water & sanitation infrastructure",
  X07: "Telecom infrastructure",
  X08: "Data center density",

  R01: "Lithium reserves",
  R02: "Cobalt reserves",
  R03: "Rare earth elements (REE) reserves",
  R04: "Copper reserves",
  R05: "Aluminum / bauxite reserves",
  R06: "Nickel reserves",
  R07: "Graphite reserves",
  R08: "Manganese reserves",
  R09: "Natural gas reserves",
  R10: "Oil reserves",
  R11: "REE / lithium import dependency",
  R12: "Critical mineral processing capacity",
  R13: "Mineral export infrastructure",
  R14: "Phosphate reserves",
  R15: "Battery-grade material supply position",
};

export function paramsByBlock(parameters) {
  const grouped = {};
  for (const block of BLOCKS) grouped[block.key] = [];
  for (const [key, value] of Object.entries(parameters || {})) {
    const blockKey = key[0];
    if (grouped[blockKey]) grouped[blockKey].push({ key, value, label: PARAM_LABELS[key] || key });
  }
  for (const block of BLOCKS) {
    grouped[block.key].sort((a, b) => a.key.localeCompare(b.key));
  }
  return grouped;
}

export function blockAverages(parameters) {
  const grouped = paramsByBlock(parameters);
  return BLOCKS.map((block) => {
    const entries = grouped[block.key];
    const avg = entries.length
      ? entries.reduce((sum, e) => sum + e.value, 0) / entries.length
      : 0;
    return { ...block, avg };
  });
}
