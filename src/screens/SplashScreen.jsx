import { useState, useEffect, useRef } from 'react';
import { FF } from '../tokens';

export default function SplashScreen({ onComplete, onAdminTap }) {
  const [visible, setVisible] = useState(false);
  const autoTimer = useRef(null);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 80);
    autoTimer.current = setTimeout(onComplete, 2900);
    return () => { clearTimeout(t1); clearTimeout(autoTimer.current); };
  }, []);

  const handleAdminTap = () => {
    clearTimeout(autoTimer.current);
    onAdminTap?.();
  };

  return (
    <div
      className="tc-screen"
      style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(160deg,#011e3a 0%,#065990 58%,#1380c8 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Glow orbs */}
      <div style={{ position:'absolute', width:380, height:380, borderRadius:'50%', background:'radial-gradient(circle,rgba(234,255,0,.12) 0%,transparent 70%)', top:'5%', left:'50%', transform:'translateX(-50%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(6,89,144,.7) 0%,transparent 70%)', bottom:'-8%', right:'-15%', pointerEvents:'none' }} />

      {/* Main logo — dominant center element */}
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'all .8s cubic-bezier(.34,1.56,.64,1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40,
      }}>
        <img
          src="/tcdclogo2.png"
          alt="TC Dual Credit"
          style={{
            width: '65vw',
            maxWidth: 320,
            objectFit: 'contain',
            filter: 'drop-shadow(0 8px 32px rgba(0,0,0,.4)) drop-shadow(0 0 60px rgba(234,255,0,.10))',
          }}
        />
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

      {/* Admin / ACDC portal link — bottom of splash */}
      <button
        onClick={handleAdminTap}
        style={{
          position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
          background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px',
          opacity: visible ? 0.55 : 0,
          transition: 'opacity .8s .4s ease',
        }}
      >
        <span style={{ fontFamily: FF, fontSize: 12, fontWeight: 600, color: '#fff', letterSpacing: '0.5px' }}>
          Admin
        </span>
      </button>

    </div>
  );
}
