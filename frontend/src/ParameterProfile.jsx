import { useState } from "react";
import { BLOCKS, paramsByBlock, blockAverages } from "./paramLabels.js";

function RadarChart({ averages }) {
  const size = 260;
  const center = size / 2;
  const radius = 92;
  const n = averages.length;

  const pointFor = (i, value) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = radius * value;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  };

  const ringPolygon = (frac) =>
    averages
      .map((_, i) => pointFor(i, frac).join(","))
      .join(" ");

  const dataPolygon = averages
    .map((b, i) => pointFor(i, b.avg).join(","))
    .join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="radar-chart">
      {[0.25, 0.5, 0.75, 1].map((frac) => (
        <polygon key={frac} points={ringPolygon(frac)} className="radar-ring" />
      ))}
      {averages.map((b, i) => {
        const [x, y] = pointFor(i, 1.12);
        return (
          <text key={b.key} x={x} y={y} className="radar-label" textAnchor="middle">
            {b.key}
          </text>
        );
      })}
      <polygon points={dataPolygon} className="radar-data" />
      {averages.map((b, i) => {
        const [x, y] = pointFor(i, b.avg);
        return <circle key={b.key} cx={x} cy={y} r="3" fill={b.color} />;
      })}
    </svg>
  );
}

function ParamBar({ entry }) {
  const pct = Math.round(entry.value * 100);
  return (
    <div className="param-row">
      <span className="param-key">{entry.key}</span>
      <span className="param-label">{entry.label}</span>
      <div className="prob-track param-track">
        <div className="prob-fill param-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="param-value">{entry.value.toFixed(2)}</span>
    </div>
  );
}

export default function ParameterProfile({ parameters }) {
  const [openBlock, setOpenBlock] = useState(null);
  if (!parameters) return null;

  const grouped = paramsByBlock(parameters);
  const averages = blockAverages(parameters);

  return (
    <div className="parameter-profile">
      <h3>Parameter Profile</h3>
      <p className="param-scale-note">
        68 parameters across 8 blocks (S/C/I/T/E/G/X/R), each normalized to a 0–1 scale
        against the framework's reference ranges. The radar shows each block's average;
        expand a block below to see the raw parameters behind it.
      </p>
      <div className="radar-wrap">
        <RadarChart averages={averages} />
        <ul className="radar-legend">
          {averages.map((b) => (
            <li key={b.key}>
              <span className="legend-dot" style={{ background: b.color }} />
              {b.key} · {b.name}
              <strong>{b.avg.toFixed(2)}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className="param-accordion">
        {BLOCKS.map((block) => {
          const isOpen = openBlock === block.key;
          return (
            <div className="param-block" key={block.key}>
              <button
                className="param-block-header"
                onClick={() => setOpenBlock(isOpen ? null : block.key)}
              >
                <span className="legend-dot" style={{ background: block.color }} />
                <span className="param-block-name">
                  {block.key} · {block.name}
                </span>
                <span className="param-block-count">{grouped[block.key].length} params</span>
                <span className="param-block-toggle">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <div className="param-block-body">
                  {grouped[block.key].map((entry) => (
                    <ParamBar entry={entry} key={entry.key} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
