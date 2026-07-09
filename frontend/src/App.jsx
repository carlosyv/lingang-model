import { useEffect, useState } from "react";
import { getCountries, getCountryMatches } from "./api.js";
import PipelineDiagram from "./PipelineDiagram.jsx";
import ParameterProfile from "./ParameterProfile.jsx";

const CLUSTER_LABELS = {
  A: "Export-Stabilization",
  B: "Leapfrog-Capable",
  C: "Infrastructure-Constrained",
  D: "Fragile/Conflict-Affected",
  E: "Advanced Emerging",
};

function MatchCard({ m, muted }) {
  return (
    <div className={`match-card ${m.viable ? "viable" : ""} ${muted ? "muted" : ""}`}>
      <div className="match-header">
        <h3>{m.solution.name}</h3>
        <span className="tier">Tier {m.solution.tier}</span>
      </div>
      <p className="supplier">{m.solution.supplier}</p>
      <p className="capex">
        CAPEX: ${m.solution.capex_low_usd_m}M – ${m.solution.capex_high_usd_m}M
      </p>
      <div className="scores">
        <div>
          Match Score: <strong>{m.match_score.toFixed(2)}</strong>
        </div>
        <div>Cosine Sim: {m.cosine_sim.toFixed(2)}</div>
        <div>Cluster Fit: {m.cluster_fit.toFixed(2)}</div>
        <div>Policy: {m.policy_score.toFixed(2)}</div>
        <div>Risk Adj: {m.risk_adj.toFixed(2)}</div>
      </div>
      <div className={`gate-badge gate-${m.gate}`}>{m.gate.replace(/_/g, " ")}</div>
      {m.gate_reasons.length > 0 && (
        <ul className="gate-reasons">
          {m.gate_reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
      {m.viable && <span className="viable-badge">Viable</span>}
    </div>
  );
}

export default function App() {
  const [countries, setCountries] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [matches, setMatches] = useState({ ranked: [], excluded: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showExcluded, setShowExcluded] = useState(false);
  const [showPipeline, setShowPipeline] = useState(false);

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

  return (
    <div className="app">
      <header>
        <h1>Lin-Gang Framework</h1>
        <p className="subtitle">Country cluster assignment &amp; solution matching (MVP)</p>
        <button className="pipeline-toggle" onClick={() => setShowPipeline((v) => !v)}>
          {showPipeline ? "Hide" : "Show"} how matching works
        </button>
        {showPipeline && <PipelineDiagram />}
      </header>

      <div className="layout">
        <aside>
          <h2>Countries</h2>
          <ul className="country-list">
            {countries.map((c) => (
              <li key={c.id}>
                <button
                  className={c.id === selectedId ? "active" : ""}
                  onClick={() => setSelectedId(c.id)}
                >
                  {c.name}
                  {c.cluster_label && (
                    <span className={`badge cluster-${c.cluster_label}`}>{c.cluster_label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main>
          {error && <p className="error">Error: {error}</p>}

          {selectedCountry && (
            <section className="country-detail">
              <h2>{selectedCountry.name}</h2>
              {selectedCountry.cluster_label && (
                <p>
                  Cluster: <strong>{selectedCountry.cluster_label}</strong> —{" "}
                  {CLUSTER_LABELS[selectedCountry.cluster_label]}
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
            <h2>Ranked Solution Matches</h2>
            {loading && <p>Loading matches…</p>}
            {!loading && matches.ranked.length === 0 && !error && (
              <p>No matches computed yet.</p>
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
                {showExcluded ? "Hide" : "Show"} {matches.excluded.length} excluded solution
                {matches.excluded.length === 1 ? "" : "s"} (policy/supplier gate)
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
