import { useEffect, useMemo, useState } from "react";
import { addCountry, getCountries, getCountryMatches } from "./api.js";
import PipelineDiagram from "./PipelineDiagram.jsx";
import ParameterProfile from "./ParameterProfile.jsx";
import { useLanguage } from "./i18n.jsx";
import { getWorldCountryNames } from "./worldCountries.js";

function AddCountryForm({ regions, onAdded, onCancel }) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [region, setRegion] = useState(regions[0] || "");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const suggestions = useMemo(() => getWorldCountryNames(), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError(t("addCountryNameRequired"));
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const created = await addCountry(trimmed, region || null);
      onAdded(created);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="add-country-form" onSubmit={handleSubmit}>
      <h3>{t("addCountryTitle")}</h3>
      <input
        list="world-country-names"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("addCountryNamePlaceholder")}
        autoFocus
      />
      <datalist id="world-country-names">
        {suggestions.map((n) => (
          <option value={n} key={n} />
        ))}
      </datalist>
      <label className="add-country-region">
        {t("addCountryRegionLabel")}
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          {regions.map((r) => (
            <option value={r} key={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      {formError && <p className="error">{formError}</p>}
      <div className="add-country-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? t("addCountrySubmitting") : t("addCountrySubmit")}
        </button>
        <button type="button" onClick={onCancel} disabled={submitting}>
          {t("addCountryCancel")}
        </button>
      </div>
    </form>
  );
}

function MatchCard({ m, muted }) {
  const { t, gateLabels } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`match-card ${m.viable ? "viable" : ""} ${muted ? "muted" : ""}`}>
      <div className="match-header">
        <h3>{m.solution.name}</h3>
        <div className="match-header-right">
          <span className="tier">
            {t("tier")} {m.solution.tier}
          </span>
          {m.viable && <span className="viable-badge">{t("viable")}</span>}
        </div>
      </div>
      <p className="supplier">{m.solution.supplier}</p>
      <p className="capex">
        {t("capex")}: ${m.solution.capex_low_usd_m}M – ${m.solution.capex_high_usd_m}M
      </p>
      <div className="scores">
        <div>
          {t("matchScore")}: <strong>{m.match_score.toFixed(2)}</strong>
        </div>
        <div>
          {t("cosineSim")}: {m.cosine_sim.toFixed(2)}
        </div>
        <div>
          {t("clusterFit")}: {m.cluster_fit.toFixed(2)}
        </div>
        <div>
          {t("policy")}: {m.policy_score.toFixed(2)}
        </div>
        <div>
          {t("riskAdj")}: {m.risk_adj.toFixed(2)}
        </div>
      </div>
      <div className={`gate-badge gate-${m.gate}`}>
        {gateLabels[m.gate] || m.gate.replace(/_/g, " ")}
      </div>
      {m.gate_reasons.length > 0 && (
        <ul className="gate-reasons">
          {m.gate_reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className="more-info-btn"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? t("showLess") : t("showMore")}
      </button>
      {expanded && (
        <div className="match-details">
          <dl>
            <dt>{t("matchScore")}</dt>
            <dd>{m.match_score.toFixed(3)}</dd>
            <dt>{t("cosineSim")}</dt>
            <dd>{m.cosine_sim.toFixed(3)}</dd>
            <dt>{t("clusterFit")}</dt>
            <dd>{m.cluster_fit.toFixed(3)}</dd>
            <dt>{t("policy")}</dt>
            <dd>{m.policy_score.toFixed(3)}</dd>
            <dt>{t("riskAdj")}</dt>
            <dd>{m.risk_adj.toFixed(3)}</dd>
            <dt>{t("tier")}</dt>
            <dd>{m.solution.tier}</dd>
            <dt>{t("capex")}</dt>
            <dd>
              ${m.solution.capex_low_usd_m}M – ${m.solution.capex_high_usd_m}M
            </dd>
            <dt>{gateLabels[m.gate] || "Gate"}</dt>
            <dd>{m.gate.replace(/_/g, " ")}</dd>
          </dl>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const { t, lang, toggleLang, clusterLabels, regionLabels, countryLabels } = useLanguage();
  const [countries, setCountries] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [matches, setMatches] = useState({ ranked: [], excluded: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showExcluded, setShowExcluded] = useState(false);
  const [showPipeline, setShowPipeline] = useState(false);
  const [showAddCountry, setShowAddCountry] = useState(false);

  useEffect(() => {
    getCountries()
      .then((data) => {
        setCountries(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (selectedId == null) return;
    setLoading(true);
    setError(null);
    getCountryMatches(selectedId)
      .then(setMatches)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const selectedCountry = countries.find((c) => c.id === selectedId);

  // Prefer the curated seed label; fall back to the backend-translated name for
  // manually-added countries when in Chinese, then to the raw English name.
  const countryName = (c) =>
    countryLabels[c.name] || (lang === "zh" && c.name_zh) || c.name;

  const knownRegions = Array.from(
    new Set(countries.map((c) => c.region).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const handleCountryAdded = (created) => {
    setCountries((prev) => [...prev, created]);
    setSelectedId(created.id);
    setShowAddCountry(false);
  };

  const countriesByRegion = countries.reduce((groups, c) => {
    const region = c.region || "Other";
    (groups[region] ||= []).push(c);
    return groups;
  }, {});
  const sortedRegions = Object.keys(countriesByRegion).sort((a, b) => a.localeCompare(b));
  for (const region of sortedRegions) {
    countriesByRegion[region].sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="app">
      <header>
        <button className="language-toggle" onClick={toggleLang}>
          {t("languageToggle")}
        </button>
        <h1>{t("appTitle")}</h1>
        <p className="subtitle">{t("subtitle")}</p>
        <button className="pipeline-toggle" onClick={() => setShowPipeline((v) => !v)}>
          {showPipeline ? t("hideMatching") : t("showMatching")}
        </button>
        {showPipeline && <PipelineDiagram />}
      </header>

      <div className="layout">
        <aside>
          <h2>{t("countries")}</h2>
          <button
            type="button"
            className="add-country-toggle"
            onClick={() => setShowAddCountry((v) => !v)}
          >
            {t("addCountry")}
          </button>
          {showAddCountry && (
            <AddCountryForm
              regions={knownRegions}
              onAdded={handleCountryAdded}
              onCancel={() => setShowAddCountry(false)}
            />
          )}
          {sortedRegions.map((region) => (
            <div className="region-group" key={region}>
              <h3 className="region-heading">{regionLabels[region] || region}</h3>
              <ul className="country-list">
                {countriesByRegion[region].map((c) => (
                  <li key={c.id}>
                    <button
                      className={c.id === selectedId ? "active" : ""}
                      onClick={() => setSelectedId(c.id)}
                    >
                      {countryName(c)}
                      {c.cluster_label && (
                        <span className={`badge cluster-${c.cluster_label}`}>{c.cluster_label}</span>
                      )}
                      {c.is_new && <span className="badge badge-new">{t("newTag")}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        <main>
          {error && (
            <p className="error">
              {t("error")}: {error}
            </p>
          )}

          {selectedCountry && (
            <section className="country-detail">
              <h2>{countryName(selectedCountry)}</h2>
              {selectedCountry.cluster_label && (
                <p>
                  {t("cluster")}: <strong>{selectedCountry.cluster_label}</strong> —{" "}
                  {clusterLabels[selectedCountry.cluster_label]}
                </p>
              )}
              {selectedCountry.cluster_probabilities && (
                <div className="prob-bars">
                  {Object.entries(selectedCountry.cluster_probabilities)
                    .sort((a, b) => b[1] - a[1])
                    .map(([letter, prob]) => (
                      <div className="prob-row" key={letter}>
                        <span className="prob-letter">{letter}</span>
                        <div className="prob-track">
                          <div
                            className={`prob-fill cluster-${letter}`}
                            style={{ width: `${Math.round(prob * 100)}%` }}
                          />
                        </div>
                        <span className="prob-value">{(prob * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                </div>
              )}
              <ParameterProfile parameters={selectedCountry.parameters} />
            </section>
          )}

          <section>
            <h2>{t("rankedMatches")}</h2>
            {loading && <p>{t("loadingMatches")}</p>}
            {!loading && matches.ranked.length === 0 && !error && (
              <p>{t("noMatches")}</p>
            )}
            <div className="match-grid">
              {matches.ranked.map((m) => (
                <MatchCard m={m} key={m.solution.id} />
              ))}
            </div>
          </section>

          {matches.excluded.length > 0 && (
            <section>
              <button className="excluded-toggle" onClick={() => setShowExcluded((v) => !v)}>
                {showExcluded ? t("hideExcludedPrefix") : t("showExcludedPrefix")}{" "}
                {matches.excluded.length} {t("excludedSuffix")}
              </button>
              {showExcluded && (
                <div className="match-grid">
                  {matches.excluded.map((m) => (
                    <MatchCard m={m} key={m.solution.id} muted />
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
