/**
 * AcdcPortalLookupScreen — ACDC Staff Portal entry via last-name self-lookup.
 *
 * A coach types their own last name to load their profile and toolkit.
 * FERPA-safe: no student data is queried, stored, or displayed anywhere in this flow.
 */
import { useState } from 'react';
import { C, FF } from '../tokens';
import { getAcdcByLastName } from '../data/acdc';

const BLUE = '#065990';
const LIME = '#EAFF00';
const DARK = '#022b52';

export default function AcdcPortalLookupScreen({ onFound, onBack }) {
  const [value,   setValue]   = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleInput = (e) => {
    setValue(e.target.value);
    if (error) setError('');
  };

  const handleLookup = async () => {
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    const coach = getAcdcByLastName(value);
    if (coach) {
      onFound(coach);
    } else {
      setLoading(false);
      setError('No coach found by that name — check spelling or contact the DC office.');
    }
  };

  const canSubmit = value.trim().length >= 2 && !loading;

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
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          <span style={{ fontFamily: FF, fontSize: 13, fontWeight: 600, color: BLUE }}>Back</span>
        </button>

        {/* Icon mark */}
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: `linear-gradient(135deg, ${DARK}, ${BLUE})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={LIME} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </div>

        {/* Eyebrow */}
        <div style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: '1.8px', marginBottom: 8 }}>
          ACDC Staff Portal
        </div>

        {/* Heading */}
        <h1 style={{ fontFamily: FF, fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 8 }}>
          Find Your Profile
        </h1>
        <p style={{ fontFamily: FF, fontSize: 14, color: C.text2, lineHeight: 1.55, marginBottom: 32 }}>
          Enter your last name to load your ACDC toolkit. This is a self-lookup — no student data is accessed here.
        </p>

        {/* Last name input */}
        <label style={{ fontFamily: FF, fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 8 }}>
          Your Last Name
        </label>
        <input
          type="text"
          autoCapitalize="words"
          autoComplete="family-name"
          value={value}
          onChange={handleInput}
          onKeyDown={e => e.key === 'Enter' && canSubmit && handleLookup()}
          placeholder="e.g. Barrett"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            height: 58,
            borderRadius: 16,
            border: error ? `2px solid ${C.red}` : `2px solid ${C.border}`,
            background: C.bg,
            fontFamily: FF,
            fontSize: 22,
            fontWeight: 700,
            color: C.text,
            paddingLeft: 18,
            paddingRight: 18,
            outline: 'none',
            transition: 'border-color .15s',
          }}
        />

        {/* Error */}
        {error && (
          <p style={{ fontFamily: FF, fontSize: 13, color: C.red, marginTop: 10, lineHeight: 1.5 }}>
            {error}
          </p>
        )}

        {/* Lookup button */}
        <button
          onClick={handleLookup}
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
            {loading ? 'Looking up…' : 'Load My Portal'}
          </span>
        </button>

        {/* Footnote */}
        <p style={{ fontFamily: FF, fontSize: 12, color: C.text3, textAlign: 'center', marginTop: 28, lineHeight: 1.55 }}>
          Only coaches listed in the TC Dual Credit directory can be found here.
          Contact the office if your name isn't appearing.
        </p>

      </div>
    </div>
  );
}
