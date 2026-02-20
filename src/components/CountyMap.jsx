import { useState } from 'react';
import { PA_COUNTIES, project } from '../data/paCountyCentroids.js';

const W = 800;
const H = 360;

// PA state outline — simplified polygon (approximate)
// Points are [x, y] already in SVG space scaled to 800×360
const PA_OUTLINE =
  'M 20,180 L 20,60 L 60,55 L 120,52 L 200,50 L 280,48 L 360,46 L 420,44 L 480,44 ' +
  'L 540,44 L 600,50 L 660,55 L 720,60 L 770,68 L 780,100 L 778,130 L 775,160 ' +
  'L 770,200 L 760,240 L 740,270 L 720,290 L 680,300 L 640,308 L 580,312 ' +
  'L 520,314 L 460,314 L 400,312 L 340,310 L 280,305 L 220,295 L 160,280 ' +
  'L 100,260 L 60,230 L 30,210 Z';

function getColor(count, maxCount) {
  if (!count || count === 0) return '#e8f5e9';
  const intensity = Math.min(count / maxCount, 1);
  // Green scale: light to dark
  const r = Math.round(200 - intensity * 150);
  const g = Math.round(230 - intensity * 80);
  const b = Math.round(200 - intensity * 150);
  return `rgb(${r},${g},${b})`;
}

export default function CountyMap({ byCounty }) {
  const [tooltip, setTooltip] = useState(null);

  const maxCount = Math.max(1, ...Object.values(byCounty));

  return (
    <div className="county-map-wrap">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="county-map-svg"
        aria-label="Pennsylvania county response map"
      >
        {/* State background */}
        <path d={PA_OUTLINE} fill="#f1f8f1" stroke="#ccc" strokeWidth="1.5" />

        {/* County bubbles */}
        {PA_COUNTIES.map(county => {
          const { x, y } = project(county.lng, county.lat, W, H);
          const count = byCounty[county.name] || 0;
          const r = count > 0 ? Math.max(6, Math.min(32, 6 + (count / maxCount) * 26)) : 4;
          const fill = getColor(count, maxCount);

          return (
            <g key={county.name}>
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={fill}
                stroke={count > 0 ? '#2e7d32' : '#bdbdbd'}
                strokeWidth={count > 0 ? 1.5 : 0.8}
                opacity={count > 0 ? 0.85 : 0.4}
                style={{ cursor: count > 0 ? 'pointer' : 'default' }}
                onMouseEnter={e => setTooltip({ county: county.name, count, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setTooltip(null)}
              />
              {count > 0 && r >= 14 && (
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#1b5e20"
                  fontWeight="600"
                  style={{ pointerEvents: 'none' }}
                >
                  {count}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {tooltip && (
        <div
          className="map-tooltip"
          style={{ left: tooltip.x + 12, top: tooltip.y - 36 }}
        >
          <strong>{tooltip.county}</strong>
          <br />
          {tooltip.count} {tooltip.count === 1 ? 'response' : 'responses'}
        </div>
      )}

      <div className="map-legend">
        <span className="legend-dot" style={{ background: '#e8f5e9', border: '1px solid #bdbdbd' }} /> 0
        <span className="legend-dot" style={{ background: '#a5d6a7', border: '1px solid #2e7d32' }} /> Low
        <span className="legend-dot" style={{ background: '#388e3c', border: '1px solid #1b5e20' }} /> High
      </div>
    </div>
  );
}
