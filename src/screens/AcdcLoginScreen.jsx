/**
 * AcdcLoginScreen — TC Staff ID entry for ACDC portal login.
 *
 * Entry point: tapping "Admin" on the SplashScreen.
 * On a valid TC Staff ID that matches an ACDC record, calls onVerified(acdcProfile).
 * On failure, shows a "not found" error consistent with the student ID screen.
 */
import { useState } from 'react';
import { C, FF } from '../tokens';
import { getAcdcByTcId } from '../data/acdc';

const BLUE = '#065990';
const LIME = '#EAFF00';
const DARK = '#022b52';

export default function AcdcLoginScreen({ onVerified, onBack }) {
  const [value,   setValue]   = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleInput = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 10);
    setValue(v);
    if (error) setError('');
  };

  const handleContinue = async () => {
    setError('');
    setLoading(true);

    // Simulate a brief lookup delay — matches student onboarding feel
    await new Promise(r => setTimeout(r, 650));

    const acdc = getAcdcByTcId(value);
    if (acdc) {
      onVerified(acdc);
    } else {
      setLoading(false);
      setError('TC Staff ID not found. Please check the number and try again.');
    }
  };

  const canSubmit = value.length >= 4 && !loading;

  return (
    <div
      className="tc-screen"
      style={{
        width: '100%', height: '100%',
        background: '#fff',
        display: 'flex', flexDirection: 'column',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px 40px' }}>

        {/* Back */}
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 18px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          <span style={{ fontFamily: FF, fontSize: 13, fontWeight: 600, color: BLUE }}>Back</span>
        </button>

        {/* Eyebrow */}
        <div style={{ fontFamily: FF, fontSize: 12, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: '1.8px', marginBottom: 10 }}>
          ACDC Portal
        </div>

        {/* Heading */}
        <h1 style={{ fontFamily: FF, fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 6 }}>
          Enter Your TC Staff ID
        </h1>
        <p style={{ fontFamily: FF, fontSize: 14, color: C.text2, lineHeight: 1.55, marginBottom: 28 }}>
          Academic Coaches for Dual Credit — enter your Texarkana College staff ID to access the portal.
        </p>

        {/* Numeric input */}
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          value={value}
          onChange={handleInput}
          placeholder="Staff ID"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            height: 64,
            borderRadius: 16,
            border: error ? `2px solid ${C.red}` : `2px solid ${C.border}`,
            background: C.bg,
            fontFamily: FF,
            fontSize: 26,
            fontWeight: 700,
            color: C.text,
            textAlign: 'center',
            letterSpacing: '5px',
            outline: 'none',
          }}
        />

        {/* Error */}
        {error && (
          <p style={{ fontFamily: FF, fontSize: 13, color: C.red, marginTop: 10, lineHeight: 1.5 }}>
            {error}
          </p>
        )}

        {/* Continue */}
        <button
          onClick={handleContinue}
          disabled={!canSubmit}
          style={{
            width: '100%',
            height: 54,
            borderRadius: 16,
            border: 'none',
            background: canSubmit ? LIME : '#e5e7eb',
            cursor: canSubmit ? 'pointer' : 'default',
            marginTop: error ? 18 : 24,
            boxShadow: canSubmit ? '0 4px 20px rgba(234,255,0,.35)' : 'none',
            transition: 'background .15s, box-shadow .15s',
          }}
        >
          <span style={{ fontFamily: FF, fontSize: 16, fontWeight: 800, color: canSubmit ? DARK : '#9ca3af' }}>
            {loading ? 'Looking up…' : 'Continue'}
          </span>
        </button>

      </div>
    </div>
  );
}
