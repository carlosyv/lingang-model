import { useLanguage } from "./i18n.jsx";

export default function PipelineDiagram() {
  const { t, pipeline } = useLanguage();

  return (
    <div className="pipeline-diagram">
      <div className="pipeline-section-label">{t("pipelineInputLabel")}</div>
      <div className="pipeline-row pipeline-inputs">
        {pipeline.inputs.map((i) => (
          <div className="pipeline-box" key={i.tag}>
            <span className="pipeline-tag">{i.tag}</span>
            <span className="pipeline-sub">{i.label}</span>
          </div>
        ))}
      </div>

      <div className="pipeline-arrow-down" aria-hidden="true">↓</div>

      <div className="pipeline-section-label">{t("pipelineLayerLabel")}</div>
      <div className="pipeline-row pipeline-layers">
        {pipeline.layers.map((l) => (
          <div className="pipeline-box pipeline-layer" key={l.n}>
            <span className="pipeline-title">
              {l.n} · {l.name}
            </span>
            <span className="pipeline-sub">{l.desc}</span>
          </div>
        ))}
      </div>

      <div className="pipeline-arrow-down" aria-hidden="true">↓</div>

      <div className="pipeline-section-label">{t("pipelineOutputLabel")}</div>
      <div className="pipeline-box pipeline-output">
        <span className="pipeline-title">{t("pipelineRankedPlans")}</span>
        <span className="pipeline-sub">{t("pipelineRiskQualified")}</span>
      </div>

      <p className="pipeline-footnote">
        <code>recompute_clusters()</code> {t("pipelineFootnotePrefix")}{" "}
        <code>compute_country_matches()</code> {t("pipelineFootnoteMiddle")} (
        <code>matching.py</code> → <code>risk.py</code>)
      </p>
    </div>
  );
}
