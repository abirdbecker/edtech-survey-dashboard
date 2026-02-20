export default function Footer({ generated }) {
  const date = generated
    ? new Date(generated).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
      })
    : null;

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {date && <p className="footer-updated">Data last updated: {date}</p>}
        <p className="footer-links">
          <a href="https://paunplugged.org" target="_blank" rel="noopener noreferrer">
            PA Unplugged
          </a>
          {' · '}
          <a href="https://paunplugged.org/survey" target="_blank" rel="noopener noreferrer">
            Take the Survey
          </a>
          {' · '}
          <a href="https://bills.paunplugged.org" target="_blank" rel="noopener noreferrer">
            Bill Tracker
          </a>
        </p>
      </div>
    </footer>
  );
}
