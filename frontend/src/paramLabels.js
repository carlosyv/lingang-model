// Human-readable labels for the 68-key SCITEGXR parameter vector (see docs/data-model.md
// and the framework deck's "SCITEGXR Dimension System" page). All values are normalized
// to [0,1] against the framework's reference ranges; for inverted signals (e.g. a "low
// value is favorable" parameter), the label still reads as "higher raw score."

export const BLOCKS_BY_LANG = {
  en: [
    { key: "S", name: "Socio-Economic", color: "#4c8bf5" },
    { key: "C", name: "Cultural", color: "#b02bd9" },
    { key: "I", name: "Industrial", color: "#d9552b" },
    { key: "T", name: "Technological", color: "#2e9e5b" },
    { key: "E", name: "Environmental", color: "#3ec9c9" },
    { key: "G", name: "Geopolitical", color: "#d9a62b" },
    { key: "X", name: "Infrastructure", color: "#8a8f98" },
    { key: "R", name: "Critical Resources", color: "#e05b8f" },
  ],
  zh: [
    { key: "S", name: "社会经济", color: "#4c8bf5" },
    { key: "C", name: "文化", color: "#b02bd9" },
    { key: "I", name: "工业", color: "#d9552b" },
    { key: "T", name: "技术", color: "#2e9e5b" },
    { key: "E", name: "环境", color: "#3ec9c9" },
    { key: "G", name: "地缘政治", color: "#d9a62b" },
    { key: "X", name: "基础设施", color: "#8a8f98" },
    { key: "R", name: "关键资源", color: "#e05b8f" },
  ],
};

// Backwards-compatible default export (English) for any non-language-aware callers.
export const BLOCKS = BLOCKS_BY_LANG.en;

export const PARAM_LABELS_BY_LANG = {
  en: {
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
  },
  zh: {
    S01: "人均GDP（购买力平价）",
    S02: "人类发展指数",
    S03: "城市化率",
    S04: "能源贫困率",
    S05: "财政能力",
    S06: "公共债务占GDP比重",
    S07: "通胀稳定性",
    S08: "失业率",
    S09: "基尼系数（不平等程度）",
    S10: "化石能源收入占GDP比重",

    C01: "权力距离（霍夫斯泰德）",
    C02: "个人主义程度（霍夫斯泰德）",
    C03: "不确定性规避（霍夫斯泰德）",
    C04: "长期导向（霍夫斯泰德）",
    C05: "制度信任度",
    C06: "技术接受度",
    C07: "商务语言契合度",
    C08: "监管透明度",

    I01: "制造业成熟度",
    I02: "工业多元化程度",
    I03: "高耗能产业占比",
    I04: "出口加工能力",
    I05: "经济特区/自贸区密度",
    I06: "劳动力成本竞争力",
    I07: "化石燃料生产能力",
    I08: "可再生能源发电结构",
    I09: "化石燃料/天然气管道及LNG基础设施",
    I10: "氢能改造准备度",

    T01: "数字化准备指数",
    T02: "电网现代化水平",
    T03: "氢能技术准备度",
    T04: "人工智能平台采用率",
    T05: "研发投入强度",
    T06: "电信/宽带普及率",
    T07: "STEM技能劳动力",
    T08: "专利与知识产权活跃度",

    E01: "人均二氧化碳排放量",
    E02: "太阳能发电潜力",
    E03: "风能发电潜力",
    E04: "水资源压力指数",
    E05: "可再生能源可用土地",
    E06: "生物多样性/环境风险",
    E07: "气候脆弱性（ND-GAIN）",
    E08: "气候适应准备度",
    E09: "国家自主贡献（NDC）/环保雄心",

    G01: "政治稳定性（WGI）",
    G02: "冲突强度",
    G03: "脆弱性指数",
    G04: "政府效能",
    G05: "能源出口影响力",
    G06: "中国双边关系",
    G07: "欧盟伙伴关系深度",
    G08: "西方/美国对齐程度",
    G09: "区域一体化程度",
    G10: "法治水平",

    X01: "物流绩效指数（LPI）",
    X02: "港口连通性",
    X03: "公路/铁路密度",
    X04: "电网可靠性",
    X05: "经济特区基础设施质量",
    X06: "供水与卫生基础设施",
    X07: "电信基础设施",
    X08: "数据中心密度",

    R01: "锂储量",
    R02: "钴储量",
    R03: "稀土元素储量",
    R04: "铜储量",
    R05: "铝/铝土矿储量",
    R06: "镍储量",
    R07: "石墨储量",
    R08: "锰储量",
    R09: "天然气储量",
    R10: "石油储量",
    R11: "稀土/锂进口依存度",
    R12: "关键矿产加工能力",
    R13: "矿产出口基础设施",
    R14: "磷酸盐储量",
    R15: "电池级材料供应地位",
  },
};

export const PARAM_LABELS = PARAM_LABELS_BY_LANG.en;

export function paramsByBlock(parameters, lang = "en") {
  const blocks = BLOCKS_BY_LANG[lang] || BLOCKS_BY_LANG.en;
  const labels = PARAM_LABELS_BY_LANG[lang] || PARAM_LABELS_BY_LANG.en;
  const grouped = {};
  for (const block of blocks) grouped[block.key] = [];
  for (const [key, value] of Object.entries(parameters || {})) {
    const blockKey = key[0];
    if (grouped[blockKey]) grouped[blockKey].push({ key, value, label: labels[key] || key });
  }
  for (const block of blocks) {
    grouped[block.key].sort((a, b) => a.key.localeCompare(b.key));
  }
  return grouped;
}

export function blockAverages(parameters, lang = "en") {
  const blocks = BLOCKS_BY_LANG[lang] || BLOCKS_BY_LANG.en;
  const grouped = paramsByBlock(parameters, lang);
  return blocks.map((block) => {
    const entries = grouped[block.key];
    const avg = entries.length
      ? entries.reduce((sum, e) => sum + e.value, 0) / entries.length
      : 0;
    return { ...block, avg };
  });
}
