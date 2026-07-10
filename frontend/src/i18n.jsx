import { createContext, useContext, useMemo, useState } from "react";

export const STRINGS = {
  en: {
    appTitle: "Lin-Gang Ai-Powered Platform",
    subtitle: "Country cluster assignment & solution matching (MVP)",
    showMatching: "Show how matching works",
    hideMatching: "Hide how matching works",
    countries: "Countries",
    error: "Error",
    cluster: "Cluster",
    rankedMatches: "Ranked Solution Matches",
    loadingMatches: "Loading matches…",
    noMatches: "No matches computed yet.",
    tier: "Tier",
    capex: "CAPEX",
    matchScore: "Match Score",
    cosineSim: "Cosine Sim",
    clusterFit: "Cluster Fit",
    policy: "Policy",
    riskAdj: "Risk Adj",
    viable: "Viable",
    showMore: "More info",
    showLess: "Show less",
    showExcludedPrefix: "Show",
    hideExcludedPrefix: "Hide",
    excludedSuffix: "excluded solution(s) (policy/supplier gate)",
    parameterProfile: "Parameter Profile",
    paramScaleNote:
      "68 parameters across 8 blocks (S/C/I/T/E/G/X/R), each normalized to a 0–1 scale " +
      "against the framework's reference ranges. The radar shows each block's average; " +
      "expand a block below to see the raw parameters behind it.",
    paramsCount: "params",
    pipelineInputLabel: "Input — five aspect vectors",
    pipelineLayerLabel: "4-layer AI model",
    pipelineOutputLabel: "Output",
    pipelineRankedPlans: "Ranked Plans",
    pipelineRiskQualified: "Risk-qualified · policy-compliant",
    pipelineFootnotePrefix: "runs layers 1–2 ·",
    pipelineFootnoteMiddle: "runs layers 3–4",
    languageToggle: "中文",
    addCountry: "+ Add country",
    addCountryTitle: "Add a new country",
    addCountryNamePlaceholder: "Start typing a country name…",
    addCountryRegionLabel: "Region",
    addCountrySubmit: "Add & compute",
    addCountryCancel: "Cancel",
    addCountrySubmitting: "Computing…",
    addCountryNameRequired: "Please enter a country name.",
    newTag: "NEW",
    printReport: "Print report (PDF)",
  },
  zh: {
    appTitle: "临港人工智能平台",
    subtitle: "国别集群划分与解决方案匹配（MVP）",
    showMatching: "显示匹配原理",
    hideMatching: "隐藏匹配原理",
    countries: "国家",
    error: "错误",
    cluster: "集群",
    rankedMatches: "解决方案匹配排名",
    loadingMatches: "正在加载匹配结果…",
    noMatches: "尚未计算匹配结果。",
    tier: "层级",
    capex: "资本支出",
    matchScore: "匹配得分",
    cosineSim: "余弦相似度",
    clusterFit: "集群契合度",
    policy: "政策",
    riskAdj: "风险调整",
    viable: "可行",
    showMore: "更多信息",
    showLess: "收起",
    showExcludedPrefix: "显示",
    hideExcludedPrefix: "隐藏",
    excludedSuffix: "个被排除的解决方案（政策/供应商门槛）",
    parameterProfile: "参数概况",
    paramScaleNote:
      "涵盖8大板块（S/C/I/T/E/G/X/R）共68项参数，均按框架的参考区间归一化到0–1区间。" +
      "雷达图显示各板块的平均值；点击下方板块可展开查看具体参数。",
    paramsCount: "项参数",
    pipelineInputLabel: "输入 — 五类要素向量",
    pipelineLayerLabel: "四层人工智能模型",
    pipelineOutputLabel: "输出",
    pipelineRankedPlans: "排序方案",
    pipelineRiskQualified: "风险合规 · 政策合规",
    pipelineFootnotePrefix: "执行第1-2层 ·",
    pipelineFootnoteMiddle: "执行第3-4层",
    languageToggle: "EN",
    addCountry: "+ 添加国家",
    addCountryTitle: "添加新国家",
    addCountryNamePlaceholder: "输入国家名称…",
    addCountryRegionLabel: "地区",
    addCountrySubmit: "添加并计算",
    addCountryCancel: "取消",
    addCountrySubmitting: "计算中…",
    addCountryNameRequired: "请输入国家名称。",
    newTag: "新增",
    printReport: "打印报告（PDF）",
  },
};

export const CLUSTER_LABELS = {
  en: {
    A: "Export-Stabilization",
    B: "Leapfrog-Capable",
    C: "Infrastructure-Constrained",
    D: "Fragile/Conflict-Affected",
    E: "Advanced Emerging",
  },
  zh: {
    A: "出口稳定型",
    B: "跨越式发展型",
    C: "基础设施受限型",
    D: "脆弱/冲突影响型",
    E: "先进新兴型",
  },
};

export const GATE_LABELS = {
  en: {
    PROCEED: "PROCEED",
    FLAG_FOR_REVIEW: "FLAG FOR REVIEW",
    ELIMINATE: "ELIMINATE",
  },
  zh: {
    PROCEED: "可推进",
    FLAG_FOR_REVIEW: "需人工复核",
    ELIMINATE: "已淘汰",
  },
};

export const REGION_LABELS = {
  en: {
    "Central Asia": "Central Asia",
    "East Asia": "East Asia",
    Europe: "Europe",
    "Latin America": "Latin America",
    "Middle East": "Middle East",
    "North Africa": "North Africa",
    "South Asia": "South Asia",
    "Southeast Asia": "Southeast Asia",
    "Sub-Saharan Africa": "Sub-Saharan Africa",
  },
  zh: {
    "Central Asia": "中亚",
    "East Asia": "东亚",
    Europe: "欧洲",
    "Latin America": "拉丁美洲",
    "Middle East": "中东",
    "North Africa": "北非",
    "South Asia": "南亚",
    "Southeast Asia": "东南亚",
    "Sub-Saharan Africa": "撒哈拉以南非洲",
  },
};

export const COUNTRY_LABELS = {
  en: {
    Algeria: "Algeria",
    Bangladesh: "Bangladesh",
    Brazil: "Brazil",
    Chile: "Chile",
    Colombia: "Colombia",
    Egypt: "Egypt",
    Ethiopia: "Ethiopia",
    Ghana: "Ghana",
    India: "India",
    Indonesia: "Indonesia",
    Kazakhstan: "Kazakhstan",
    Kenya: "Kenya",
    "Mainland China": "Mainland China",
    Malaysia: "Malaysia",
    Mexico: "Mexico",
    Morocco: "Morocco",
    Nigeria: "Nigeria",
    Pakistan: "Pakistan",
    Peru: "Peru",
    Philippines: "Philippines",
    Poland: "Poland",
    Romania: "Romania",
    "Saudi Arabia": "Saudi Arabia",
    "South Africa": "South Africa",
    Thailand: "Thailand",
    Turkey: "Turkey",
    "United Arab Emirates": "United Arab Emirates",
    Uzbekistan: "Uzbekistan",
    Vietnam: "Vietnam",
  },
  zh: {
    Algeria: "阿尔及利亚",
    Bangladesh: "孟加拉国",
    Brazil: "巴西",
    Chile: "智利",
    Colombia: "哥伦比亚",
    Egypt: "埃及",
    Ethiopia: "埃塞俄比亚",
    Ghana: "加纳",
    India: "印度",
    Indonesia: "印度尼西亚",
    Kazakhstan: "哈萨克斯坦",
    Kenya: "肯尼亚",
    "Mainland China": "中国大陆",
    Malaysia: "马来西亚",
    Mexico: "墨西哥",
    Morocco: "摩洛哥",
    Nigeria: "尼日利亚",
    Pakistan: "巴基斯坦",
    Peru: "秘鲁",
    Philippines: "菲律宾",
    Poland: "波兰",
    Romania: "罗马尼亚",
    "Saudi Arabia": "沙特阿拉伯",
    "South Africa": "南非",
    Thailand: "泰国",
    Turkey: "土耳其",
    "United Arab Emirates": "阿拉伯联合酋长国",
    Uzbekistan: "乌兹别克斯坦",
    Vietnam: "越南",
  },
};

export const PIPELINE = {
  en: {
    inputs: [
      { tag: "P", label: "Destination Clusters" },
      { tag: "L, F", label: "Suppliers" },
      { tag: "SC, SCR", label: "Supply Chain" },
      { tag: "PG", label: "Policies" },
      { tag: "RP", label: "Resource Prices" },
    ],
    layers: [
      { n: 1, name: "Profile", desc: "Normalize 68 country parameters into P ∈ ℝ⁶⁸" },
      { n: 2, name: "Cluster", desc: "assign_clusters() → label + cluster probabilities" },
      { n: 3, name: "Match", desc: "cosine_sim + cluster_fit + policy_score, policy gate" },
      { n: 4, name: "Risk", desc: "risk_adj applied → final match_score" },
    ],
  },
  zh: {
    inputs: [
      { tag: "P", label: "目的地集群" },
      { tag: "L, F", label: "供应商" },
      { tag: "SC, SCR", label: "供应链" },
      { tag: "PG", label: "政策" },
      { tag: "RP", label: "资源价格" },
    ],
    layers: [
      { n: 1, name: "画像", desc: "将68项国别参数归一化为 P ∈ ℝ⁶⁸" },
      { n: 2, name: "聚类", desc: "assign_clusters() → 标签 + 集群概率" },
      { n: 3, name: "匹配", desc: "余弦相似度 + 集群契合度 + 政策得分，政策门槛" },
      { n: 4, name: "风险", desc: "应用风险调整 → 最终匹配得分" },
    ],
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");
  const value = useMemo(() => {
    const t = (key) => STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
    return {
      lang,
      setLang,
      toggleLang: () => setLang((l) => (l === "en" ? "zh" : "en")),
      t,
      clusterLabels: CLUSTER_LABELS[lang],
      gateLabels: GATE_LABELS[lang],
      regionLabels: REGION_LABELS[lang],
      countryLabels: COUNTRY_LABELS[lang],
      pipeline: PIPELINE[lang],
    };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
