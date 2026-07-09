const LAYERS = [
  { n: 1, name: "Profile", desc: "Normalize 68 country parameters into P ∈ ℝ⁶⁸" },
  { n: 2, name: "Cluster", desc: "assign_clusters() → label + cluster probabilities" },
  { n: 3, name: "Match", desc: "cosine_sim + cluster_fit + policy_score, policy gate" },
  { n: 4, name: "Risk", desc: "risk_adj applied → final match_score" },
];

const INPUTS = [
  { tag: "P", label: "Destination Clusters" },
  { tag: "L, F", label: "Suppliers" },
  { tag: "SC, SCR", label: "Supply Chain" },
  { tag: "PG", label: "Policies" },
  { tag: "RP", label: "Resource Prices" },
];

export default function PipelineDiagram() {
  return (
    <div className="pipeline-diagram">
      <div className="pipeline-section-label">Input — five aspect vectors</div>
      <div className="pipeline-row pipeline-inputs">
        {INPUTS.map((i) => (
          <div className="pipeline-box" key={i.tag}>
            <span className="pipeline-tag">{i.tag}</span>
            <span className="pipeline-sub">{i.label}</span>
          </div>
        ))}
      </div>

      <div className="pipeline-arrow-down" aria-hidden="true">↓</div>

      <div className="pipeline-section-label">4-layer AI model</div>
      <div className="pipeline-row pipeline-layers">
        {LAYERS.map((l) => (
          <div className="pipeline-box pipeline-layer" key={l.n}>
            <span className="pipeline-title">
              {l.n} · {l.name}
            </span>
            <span className="pipeline-sub">{l.desc}</span>
          </div>
        ))}
      </div>

      <div className="pipeline-arrow-down" aria-hidden="true">↓</div>

      <div className="pipeline-section-label">Output</div>
      <div className="pipeline-box pipeline-output">
        <span className="pipeline-title">Ranked Plans</span>
        <span className="pipeline-sub">Risk-qualified · policy-compliant</span>
      </div>

      <p className="pipeline-footnote">
        <code>recompute_clusters()</code> runs layers 1–2 · <code>compute_country_matches()</code>{" "}
        runs layers 3–4 (<code>matching.py</code> → <code>risk.py</code>)
      </p>
    </div>
  );
}
