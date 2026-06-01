import { useEffect } from 'react';

export default function SplashScreen({ onComplete }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        width: '100%', height: '100%',
        background: '#065990',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Faded TC star/monogram watermark */}
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          width: '90vw',
          maxWidth: 520,
          opacity: 0.12,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
        aria-hidden="true"
      >
        {/* 6-pointed star (Star of David shape) */}
        <polygon
          points="100,10 117,65 174,65 128,99 145,154 100,120 55,154 72,99 26,65 83,65"
          fill="white"
        />
        {/* TC letters centered */}
        <text
          x="100"
          y="112"
          textAnchor="middle"
          fontFamily="serif"
          fontWeight="900"
          fontSize="52"
          fill="white"
          letterSpacing="-2"
        >TC</text>
      </svg>

      {/* Centered logo — dominant foreground */}
      <img
        src="/tcdclogo2.png"
        alt="TC Dual Credit"
        style={{
          width: '67vw',
          maxWidth: 380,
          objectFit: 'contain',
          position: 'relative',
          zIndex: 1,
        }}
      />
    </div>
  );
}
