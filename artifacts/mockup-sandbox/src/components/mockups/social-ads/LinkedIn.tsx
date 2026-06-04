export function LinkedIn() {
  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#252c33',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '6vh 7vw',
      boxSizing: 'border-box',
      margin: 0, overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <img
          src="/__mockup/images/scout-logo-white.png"
          alt="Scout Content Studio"
          style={{ maxWidth: '28vw', maxHeight: '10vh', width: 'auto', height: 'auto', objectFit: 'contain' }}
        />
        <div style={{
          fontFamily: "'Jost', 'Open Sans', sans-serif",
          fontSize: '1.6vw', fontWeight: 300,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          paddingTop: '1vh'
        }}>
          Behavioral Health
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5vh', maxWidth: '72vw' }}>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '6.5vw', fontWeight: 500,
          lineHeight: 1.15, color: '#ffffff',
          letterSpacing: '-0.01em'
        }}>
          Private practice deserves a clear digital presence.
        </div>
        <div style={{
          fontFamily: "'Jost', 'Open Sans', sans-serif",
          fontSize: '2.2vw', fontWeight: 300,
          color: 'rgba(255,255,255,0.68)', lineHeight: 1.55
        }}>
          Scout builds websites and content for behavioral health.
        </div>
        <div style={{
          display: 'inline-block', alignSelf: 'flex-start',
          padding: '1.4vh 3vw',
          background: '#f4f1ea', color: '#252c33',
          fontFamily: "'Jost', 'Open Sans', sans-serif",
          fontSize: '1.8vw', fontWeight: 500,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          borderRadius: '2px', cursor: 'pointer'
        }}>
          Learn more →
        </div>
      </div>

      <div style={{
        fontFamily: "'Jost', 'Open Sans', sans-serif",
        fontSize: '1.6vw', fontWeight: 300,
        color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em'
      }}>
        scoutcontentstudio.com
      </div>
    </div>
  );
}
