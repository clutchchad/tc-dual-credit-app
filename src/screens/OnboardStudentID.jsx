import { useState } from 'react';
import { C, FF } from '../tokens';
import { getStudentProfile } from '../data/studentProfile';
import { schools as schoolList } from '../data/schools';

const MOCK_ID = '123456';

const GRADE_MAP = { 9: 'Freshman', 10: 'Sophomore', 11: 'Junior', 12: 'Senior' };

export default function OnboardStudentID({ role, onVerified, onSkip, onBack }) {
  const [value,   setValue]   = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const isParent = role === 'parent';

  const heading = isParent
    ? "Enter Your Child's Student ID"
    : "Enter Student ID";

  const subtext = isParent
    ? "This helps us connect you to your child's dual credit journey"
    : "This helps us personalize your experience";

  const handleInput = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 10);
    setValue(v);
    if (error) setError('');
  };

  const handleContinue = async () => {
    setError('');
    setLoading(true);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 650));

    if (value === MOCK_ID) {
      const profile = await getStudentProfile();
      // Find the school object by name match
      const schoolObj = schoolList.find(s => s.name === profile.highSchool)
                     || schoolList.find(s => s.id === 'txh');
      const gradeVal = GRADE_MAP[profile.grade] || null;

      onVerified({
        schoolObj,
        gradeVal,
        studentIdVal: value,
        firstNameVal: isParent ? null : profile.firstName,
        lastNameVal:  isParent ? null : profile.lastName,
      });
    } else {
      setLoading(false);
      setError("Student ID not found. You can skip and enter your school manually.");
    }
  };

  const canSubmit = value.length >= 4 && !loading;

  return (
    <div
      className="tc-screen"
      style={{ width:'100%', height:'100%', background:'#fff', display:'flex', flexDirection:'column', paddingTop:'env(safe-area-inset-top, 0px)' }}
    >
      <div style={{ flex:1, overflow:'auto', padding:'20px 22px 40px' }}>

        {/* Back */}
        <button
          onClick={onBack}
          style={{ background:'none', border:'none', cursor:'pointer', padding:'0 0 18px', display:'flex', alignItems:'center', gap:6 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          <span style={{ fontFamily:FF, fontSize:13, fontWeight:600, color:C.blue }}>Back</span>
        </button>

        <div style={{ fontFamily:FF, fontSize:12, fontWeight:700, color:C.blue, textTransform:'uppercase', letterSpacing:'1.8px', marginBottom:10 }}>
          Step 2 of 3
        </div>
        <h1 style={{ fontFamily:FF, fontSize:28, fontWeight:900, color:C.text, letterSpacing:'-1px', lineHeight:1.15, marginBottom:8 }}>
          {heading}
        </h1>
        <p style={{ fontFamily:FF, fontSize:14, color:C.text2, marginBottom:32 }}>
          {subtext}
        </p>

        {/* Numeric input */}
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="e.g. 123456"
          maxLength={10}
          value={value}
          onChange={handleInput}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            height: 64,
            borderRadius: 16,
            border: error ? '2px solid #ef4444' : `2px solid ${C.border}`,
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

        {/* Inline error + skip-manual link */}
        {error && (
          <div style={{ marginTop: 10 }}>
            <p style={{ fontFamily:FF, fontSize:13, color:'#ef4444', margin:'0 0 8px', lineHeight:1.5 }}>
              {error}
            </p>
            <button
              onClick={() => { setError(''); onSkip(); }}
              style={{ background:'none', border:'none', cursor:'pointer', padding:0 }}
            >
              <span style={{ fontFamily:FF, fontSize:13, fontWeight:700, color:C.blue, textDecoration:'underline' }}>
                Skip and enter manually
              </span>
            </button>
          </div>
        )}

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={!canSubmit}
          style={{
            width: '100%',
            height: 54,
            borderRadius: 16,
            border: 'none',
            background: canSubmit ? '#EAFF00' : '#e5e7eb',
            cursor: canSubmit ? 'pointer' : 'default',
            marginTop: error ? 18 : 24,
            boxShadow: canSubmit ? '0 4px 20px rgba(234,255,0,.35)' : 'none',
            transition: 'background .15s, box-shadow .15s',
          }}
        >
          <span style={{ fontFamily:FF, fontSize:16, fontWeight:800, color: canSubmit ? '#022b52' : '#9ca3af' }}>
            {loading ? 'Looking up…' : 'Continue'}
          </span>
        </button>

        {/* Skip for now */}
        <button
          onClick={onSkip}
          style={{ background:'none', border:'none', cursor:'pointer', padding:'16px 0 0', width:'100%', textAlign:'center' }}
        >
          <span style={{ fontFamily:FF, fontSize:14, fontWeight:600, color:C.text3 }}>
            Skip for now
          </span>
        </button>
      </div>
    </div>
  );
}
