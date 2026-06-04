export function Identity() {
  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#f4f1ea',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '6vh 7vw',
      boxSizing: 'border-box',
      margin: 0, overflow: 'hidden'
    }}>
      <div>
        <img
          src="/__mockup/images/scout-logo-white.png"
          alt="Scout Content Studio"
          style={{
            maxWidth: '38vw', maxHeight: '12vh',
            width: 'auto', height: 'auto', objectFit: 'contain',
            filter: 'invert(1)'
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3vh' }}>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '8vw', fontWeight: 500,
          lineHeight: 1.15, color: '#2e3842',
          letterSpacing: '-0.01em'
        }}>
          Built for behavioral health.
        </div>
        <div style={{
          fontFamily: "'Jost', 'Open Sans', sans-serif",
          fontSize: '2.8vw', fontWeight: 400,
          color: '#4a555e', lineHeight: 1.55
        }}>
          Websites, SEO, and marketing for therapists.
        </div>
        <div style={{
          display: 'inline-block', alignSelf: 'flex-start',
          padding: '1.6vh 3.6vw',
          background: '#2e3842', color: '#f4f1ea',
          fontFamily: "'Jost', 'Open Sans', sans-serif",
          fontSize: '2vw', fontWeight: 500,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          borderRadius: '2px', cursor: 'pointer'
        }}>
          Start a project →
        </div>
      </div>

      <div style={{
        fontFamily: "'Jost', 'Open Sans', sans-serif",
        fontSize: '1.8vw', fontWeight: 400,
        color: '#7c8790', letterSpacing: '0.06em'
      }}>
        scoutcontentstudio.com
      </div>
    </div>
  );
}
