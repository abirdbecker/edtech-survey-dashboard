export default function ParentVoices({ quotes }) {
  if (!quotes || quotes.length === 0) return null;

  return (
    <div className="quotes-grid">
      {quotes.map((text, i) => (
        <blockquote key={i} className="quote-card">
          <p className="quote-text">{text}</p>
        </blockquote>
      ))}
    </div>
  );
}
