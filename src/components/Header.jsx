export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-main">
          <h1 className="header-title">
            <span className="header-title-line1">Screen Time &amp; Tech Use</span>
            <span className="header-title-line2">in PA Schools</span>
          </h1>
          <p className="header-subtitle">Parent/Caregiver Survey Results</p>
        </div>
        <a
          className="header-cta"
          href="https://survey.paunplugged.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Take the Survey
        </a>
      </div>
    </header>
  );
}
