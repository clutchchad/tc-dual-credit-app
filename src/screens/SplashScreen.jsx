import { useState, useEffect } from 'react';
import { FF } from '../tokens';

export default function SplashScreen({ onComplete }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 80);
    const t2 = setTimeout(onComplete, 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div
      onClick={onComplete}
      className="tc-screen"
      style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(160deg,#011e3a 0%,#065990 58%,#1380c8 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
      }}
    >
      {/* Glow orbs */}
      <div style={{ position:'absolute', width:380, height:380, borderRadius:'50%', background:'radial-gradient(circle,rgba(234,255,0,.12) 0%,transparent 70%)', top:'5%', left:'50%', transform:'translateX(-50%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(6,89,144,.7) 0%,transparent 70%)', bottom:'-8%', right:'-15%', pointerEvents:'none' }} />

      {/* Logo */}
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'all .8s cubic-bezier(.34,1.56,.64,1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 44,
      }}>
        <div style={{
          width: 90, height: 90, borderRadius: 26,
          background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(255,255,255,.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 26,
          boxShadow: '0 12px 40px rgba(0,0,0,.3),0 0 60px rgba(234,255,0,.08)',
        }}>
          <span style={{ fontFamily: FF, fontSize: 38, fontWeight: 900, color: '#fff', letterSpacing: '-2px' }}>TC</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FF, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.5)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 10 }}>
            Texarkana College
          </div>
          <div style={{ fontFamily: FF, fontSize: 34, fontWeight: 900, color: '#fff', letterSpacing: '-1.2px', lineHeight: 1.05 }}>Dual Credit</div>
          <div style={{ marginTop: 8, display: 'inline-block', background: '#EAFF00', borderRadius: 7, padding: '3px 12px' }}>
            <span style={{ fontFamily: FF, fontSize: 11, fontWeight: 800, color: '#022b52', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Program</span>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <p style={{
        fontFamily: FF, fontSize: 16, fontWeight: 500,
        color: 'rgba(255,255,255,.7)', textAlign: 'center',
        padding: '0 44px', lineHeight: 1.55, marginBottom: 56,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all .8s cubic-bezier(.34,1.56,.64,1) .18s',
      }}>
        Earn college credits while in high school.
      </p>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 8, opacity: visible ? 1 : 0, transition: 'opacity .6s .7s' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: i === 0 ? '#EAFF00' : 'rgba(255,255,255,.25)',
            animation: `tcPulse 1.6s ${i * 0.22}s infinite`,
          }} />
        ))}
      </div>

      <p style={{ position: 'absolute', bottom: 100, fontFamily: FF, fontSize: 12, color: 'rgba(255,255,255,.25)' }}>
        Tap anywhere to continue
      </p>
    </div>
  );
}
