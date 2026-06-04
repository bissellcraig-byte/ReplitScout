export function PainPoint() {
  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#2e3842',
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
          style={{ maxWidth: '38vw', maxHeight: '12vh', width: 'auto', height: 'auto', objectFit: 'contain' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3vh' }}>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '8vw', fontWeight: 500,
          lineHeight: 1.15, color: '#ffffff',
          letterSpacing: '-0.01em'
        }}>
          Your website should work while you work.
        </div>
        <div style={{
          fontFamily: "'Jost', 'Open Sans', sans-serif",
          fontSize: '2.8vw', fontWeight: 300,
          color: 'rgba(255,255,255,0.72)', lineHeight: 1.55
        }}>
          Websites that bring in the right clients.
        </div>
        <div style={{
          display: 'inline-block', alignSelf: 'flex-start',
          padding: '1.6vh 3.6vw',
          background: '#f4f1ea', color: '#26313a',
          fontFamily: "'Jost', 'Open Sans', sans-serif",
          fontSize: '2vw', fontWeight: 500,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          borderRadius: '2px', cursor: 'pointer'
        }}>
          Talk through your project →
        </div>
      </div>

      <div style={{
        fontFamily: "'Jost', 'Open Sans', sans-serif",
        fontSize: '1.8vw', fontWeight: 300,
        color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em'
      }}>
        scoutcontentstudio.com
      </div>
    </div>
  );
}
