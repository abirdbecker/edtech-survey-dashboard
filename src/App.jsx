import { useDashboardData } from './hooks/useDashboardData.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import StatCard from './components/StatCard.jsx';
import CountyMap from './components/CountyMap.jsx';
import CountyTable from './components/CountyTable.jsx';
import SentimentBar from './components/SentimentBar.jsx';
import ConcernBreakdown from './components/ConcernBreakdown.jsx';
import PolicyBreakdown from './components/PolicyBreakdown.jsx';

export default function App() {
  const { data, loading, error } = useDashboardData();

  return (
    <>
      <Header />

      <main className="main-content">
        {loading && (
          <div className="loading-state">Loading survey data…</div>
        )}

        {error && (
          <div className="error-state">
            Failed to load survey data: {error}
          </div>
        )}

        {data && (
          <>
            {/* Hero */}
            <section className="section hero-section">
              <div className="stat-cards">
                <StatCard
                  value={data.totalResponses}
                  label="Survey Responses"
                  subtitle="from PA parents & caregivers"
                />
                {data.concernsTopLine && (
                  <StatCard
                    value={data.concernsTopLine.Yes || 0}
                    label="Report Concerns"
                    subtitle="about how school devices are used"
                  />
                )}
              </div>
            </section>

            {/* Geographic */}
            <section className="section">
              <h2 className="section-title">Geographic Breakdown</h2>
              <p className="section-desc">
                Responses by PA county (public school families only)
              </p>
              <CountyMap byCounty={data.byCounty} />
              <CountyTable byCounty={data.byCounty} />
            </section>

            {/* Screen Time Sentiment */}
            <section className="section">
              <h2 className="section-title">Screen Time Sentiment</h2>
              <p className="section-desc">
                How parents feel about the amount of screen time in school
              </p>
              <SentimentBar screenTimeSentiment={data.screenTimeSentiment} />
            </section>

            {/* Concerns */}
            <section className="section">
              <h2 className="section-title">Concerns</h2>
              <ConcernBreakdown
                concernsTopLine={data.concernsTopLine}
                concernsBreakdown={data.concernsBreakdown}
                totalResponses={data.totalResponses}
              />
            </section>

            {/* Policy Preferences */}
            <section className="section">
              <h2 className="section-title">Policy Preferences</h2>
              <p className="section-desc">
                Which policy changes parents would support (select all that apply)
              </p>
              <PolicyBreakdown
                policies={data.policies}
                totalResponses={data.totalResponses}
              />
            </section>
          </>
        )}
      </main>

      <Footer generated={data?.generated} />
    </>
  );
}
