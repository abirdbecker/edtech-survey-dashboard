import { useState } from 'react';
import { useDashboardData } from './hooks/useDashboardData.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import DistrictFilter from './components/DistrictFilter.jsx';
import CountyMap from './components/CountyMap.jsx';
import CountyTable from './components/CountyTable.jsx';
import SentimentBar from './components/SentimentBar.jsx';
import ConcernBreakdown from './components/ConcernBreakdown.jsx';
import PolicyBreakdown from './components/PolicyBreakdown.jsx';

function pct(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

export default function App() {
  const { data, loading, error } = useDashboardData();
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const active = selectedDistrict && data?.byDistrict?.[selectedDistrict]
    ? data.byDistrict[selectedDistrict]
    : data;

  return (
    <>
      <Header />

      <main className="main-content">
        {loading && <div className="loading-state">Loading survey data…</div>}
        {error && <div className="error-state">Failed to load survey data: {error}</div>}

        {data && active && (
          <>
            <DistrictFilter
              districts={data.districts || []}
              selected={selectedDistrict}
              onChange={setSelectedDistrict}
            />

            <section className="section hero-section">
              {selectedDistrict && (
                <p className="district-context">
                  Showing {active.totalResponses} response{active.totalResponses !== 1 ? 's' : ''} from <strong>{selectedDistrict}</strong>
                </p>
              )}

              <div className="hero-stats">
                <div className="hero-stat hero-stat--red">
                  <div className="hero-stat-pct">
                    {pct(
                      active.screenTimeSentiment?.['Too much'] || 0,
                      Object.values(active.screenTimeSentiment || {}).reduce((a, b) => a + b, 0)
                    )}%
                  </div>
                  <div className="hero-stat-label">say there's <strong>too much</strong> screen time at school</div>
                </div>

                <div className="hero-stat hero-stat--orange">
                  <div className="hero-stat-pct">
                    {pct(
                      active.concernsTopLine?.Yes || 0,
                      (active.concernsTopLine?.Yes || 0) + (active.concernsTopLine?.No || 0)
                    )}%
                  </div>
                  <div className="hero-stat-label">of parents <strong>report concerns</strong> about device use</div>
                </div>
              </div>

              {Object.keys(active.concernsBreakdown || {}).length > 0 && (
                <div className="hero-top-concerns">
                  <h3 className="hero-concerns-title">Top concerns</h3>
                  <ol className="hero-concerns-list">
                    {Object.entries(active.concernsBreakdown).slice(0, 4).map(([label, count]) => (
                      <li key={label}>
                        <span className="concern-name">{label}</span>
                        <span className="concern-pct">
                          {pct(count, active.totalResponses)}% of respondents
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <p className="hero-footnote">
                Based on {active.totalResponses.toLocaleString()} survey response{active.totalResponses !== 1 ? 's' : ''}
                {!selectedDistrict && data.districts?.length > 0 && ` from ${data.districts.length} school districts`}
              </p>
            </section>

            <section className="section">
              <h2 className="section-title">Geographic Breakdown</h2>
              <p className="section-desc">Responses by PA county (public school families only)</p>
              <CountyMap byCounty={active.byCounty} />
              <CountyTable byCounty={active.byCounty} />
            </section>

            <section className="section">
              <h2 className="section-title">Screen Time Sentiment</h2>
              <p className="section-desc">How parents feel about the amount of screen time in school</p>
              <SentimentBar screenTimeSentiment={active.screenTimeSentiment} />
            </section>

            <section className="section">
              <h2 className="section-title">Concerns</h2>
              <ConcernBreakdown
                concernsTopLine={active.concernsTopLine}
                concernsBreakdown={active.concernsBreakdown}
                totalResponses={active.totalResponses}
              />
            </section>

            <section className="section">
              <h2 className="section-title">Policy Preferences</h2>
              <p className="section-desc">Which policy changes parents would support (select all that apply)</p>
              <PolicyBreakdown
                policies={active.policies}
                totalResponses={active.totalResponses}
              />
            </section>
          </>
        )}
      </main>

      <Footer generated={data?.generated} />
    </>
  );
}
