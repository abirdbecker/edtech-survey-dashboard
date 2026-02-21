import { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const GEO_URL       = '/data/pa-counties.json';
const STATE_GEO_URL = '/data/pa-state.json';

function getColor(count, maxCount) {
  if (!count || count === 0) return '#e8f5e9';
  const t = Math.min(count / maxCount, 1);
  const r = Math.round(200 - t * 173);
  const g = Math.round(230 - t * 136);
  const b = Math.round(201 - t * 169);
  return `rgb(${r},${g},${b})`;
}

export default function CountyMap({ byCounty }) {
  const [tooltip, setTooltip] = useState(null);
  const maxCount = Math.max(1, ...Object.values(byCounty));

  return (
    <div className="county-map-wrap">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 7200, center: [-77.6, 41.0] }}
        width={800}
        height={340}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => {
              const county = geo.properties.name;
              const count = byCounty[county] || 0;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getColor(count, maxCount)}
                  stroke="#fff"
                  strokeWidth={0.6}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', opacity: 0.85, cursor: count > 0 ? 'pointer' : 'default' },
                    pressed: { outline: 'none' },
                  }}
                  onMouseEnter={e => setTooltip({ county, count, x: e.clientX, y: e.clientY })}
                  onMouseMove={e => setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : t)}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })
          }
        </Geographies>
        <Geographies geography={STATE_GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="none"
                stroke="#5a7a65"
                strokeWidth={1.8}
                style={{
                  default: { outline: 'none', pointerEvents: 'none' },
                  hover:   { outline: 'none', pointerEvents: 'none' },
                  pressed: { outline: 'none', pointerEvents: 'none' },
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>

      {tooltip && (
        <div className="map-tooltip" style={{ left: tooltip.x + 12, top: tooltip.y - 44 }}>
          <strong>{tooltip.county} County</strong><br />
          {tooltip.count} {tooltip.count === 1 ? 'response' : 'responses'}
        </div>
      )}

      <div className="map-legend">
        <span className="legend-swatch" style={{ background: '#e8f5e9', border: '1px solid #bdbdbd' }} /> 0 responses
        <span className="legend-swatch" style={{ background: '#81c784', border: '1px solid #388e3c', marginLeft: '1rem' }} /> Low
        <span className="legend-swatch" style={{ background: '#1b5e20', border: '1px solid #1b5e20', marginLeft: '0.75rem' }} /> High
      </div>
    </div>
  );
}
