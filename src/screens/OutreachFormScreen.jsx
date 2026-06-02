/**
 * OutreachFormScreen — Student-Initiated Outreach / Request Info
 *
 * FERPA NOTE: This form intentionally collects only non-sensitive inquiry data —
 * name, role, high school affiliation, contact preference, and a free-text message.
 * It does NOT collect student ID, TC ID, grades, date of birth, enrollment status,
 * or any data that would constitute a student education record under FERPA.
 *
 * MOCK SUBMISSION — pending team/compliance review.
 * Do not wire to any backend or data store without approval.
 * The submit handler below is intentionally a no-op that shows a success state only.
 */
import { useState } from 'react';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import { useIsTablet } from '../hooks/useIsTablet';
import { SCHOOLS } from '../data/schools';
import { C, FF } from '../tokens';

const BLUE = '#065990';
const LIME = '#EAFF00';
const DARK = '#022b52';

const ROLE_OPTIONS = [
  { id: 'student', label: 'Student' },
  { id: 'parent',  label: 'Parent/Guardian' },
  { id: 'guest',   label: 'Other' },
];

const CONTACT_METHODS = [
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
];

// ── Input wrapper label ───────────────────────────────────────────────────────

function FieldLabel({ children, required }) {
  return (
    <div style={{ fontFamily: FF, fontSize: 12, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 7 }}>
      {children}{required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}
    </div>
  );
}

// ── Field error ───────────────────────────────────────────────────────────────

function FieldError({ msg }) {
  if (!msg) return null;
  return <div style={{ fontFamily: FF, fontSize: 12, color: C.red, marginTop: 5 }}>{msg}</div>;
}

// ── Text input ────────────────────────────────────────────────────────────────

function TextInput({ value, onChange, placeholder, hasError, type = 'text', inputMode, autoCapitalize }) {
  return (
    <input
      type={type}
      inputMode={inputMode}
      autoCapitalize={autoCapitalize}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%', boxSizing: 'border-box',
        height: 46,
        border: `1.5px solid ${hasError ? C.red : C.border}`,
        borderRadius: 14,
        fontFamily: FF, fontSize: 14, color: C.text,
        background: C.bg,
        paddingLeft: 14, paddingRight: 14,
        outline: 'none',
        transition: 'border-color .15s',
      }}
    />
  );
}

// ── Pill toggle ───────────────────────────────────────────────────────────────

function PillRow({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(opt => {
        const on = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            style={{
              height: 34, padding: '0 16px', borderRadius: 20, border: 'none',
              cursor: 'pointer',
              background: on ? LIME : 'rgba(6,89,144,.08)',
              transition: 'background .15s',
            }}
          >
            <span style={{ fontFamily: FF, fontSize: 13, fontWeight: 700, color: on ? DARK : BLUE }}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Success state ─────────────────────────────────────────────────────────────

function SuccessView({ onReturn }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 28px 80px', textAlign: 'center' }}>
      {/* Check circle */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%', marginBottom: 24,
        background: 'rgba(22,163,74,.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      </div>

      <div style={{ fontFamily: FF, fontSize: 22, fontWeight: 900, color: DARK, letterSpacing: '-0.5px', marginBottom: 10 }}>
        Message Received!
      </div>
      <p style={{ fontFamily: FF, fontSize: 14, color: C.text2, lineHeight: 1.65, marginBottom: 32, maxWidth: 300 }}>
        Thanks for reaching out. Someone from the TC Dual Credit team will follow up with you soon using the contact info you provided.
      </p>

      <button
        onClick={onReturn}
        style={{
          height: 50, padding: '0 36px', borderRadius: 14, border: 'none',
          background: LIME, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(234,255,0,.35)',
          marginBottom: 16,
        }}
        onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={e    => e.currentTarget.style.transform = 'scale(1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
        onTouchEnd={e   => e.currentTarget.style.transform = 'scale(1)'}
      >
        <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 800, color: DARK }}>
          Back to Dashboard
        </span>
      </button>
    </div>
  );
}

// ── Validation helpers ────────────────────────────────────────────────────────

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function isValidPhone(v) {
  return /^[\d\s\-()+]{7,}$/.test(v.trim());
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function OutreachFormScreen({ role: initialRole, school: initialSchool, onNavigate, tabs }) {
  const isTablet = useIsTablet();

  // ── Form state ──
  const [name,          setName]          = useState('');
  const [role,          setRole]          = useState(initialRole || 'guest');
  const [schoolId,      setSchoolId]      = useState(initialSchool?.id || '');
  const [contactMethod, setContactMethod] = useState('email');
  const [contactValue,  setContactValue]  = useState('');
  const [message,       setMessage]       = useState('');

  // ── UI state ──
  const [errors,    setErrors]    = useState({});
  const [submitted, setSubmitted] = useState(false);

  const sidePad = isTablet ? '18px 28px 40px' : '18px 14px 140px';

  // Validate and return error map
  function validate() {
    const e = {};
    if (!name.trim())    e.name    = 'Name is required.';
    if (!message.trim()) e.message = 'Please enter your question or message.';
    if (!contactValue.trim()) {
      e.contactValue = `${contactMethod === 'email' ? 'Email address' : 'Phone number'} is required.`;
    } else if (contactMethod === 'email' && !isValidEmail(contactValue)) {
      e.contactValue = 'Please enter a valid email address.';
    } else if (contactMethod === 'phone' && !isValidPhone(contactValue)) {
      e.contactValue = 'Please enter a valid phone number.';
    }
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    // MOCK SUBMISSION — pending team/compliance review.
    // Do not wire to any backend or data store without approval.
    // No data is sent, stored, or transmitted. Success state is shown only.
    setSubmitted(true);
  }

  function handleReturn() {
    // Reset form on return
    setName(''); setRole(initialRole || 'guest'); setSchoolId(initialSchool?.id || '');
    setContactMethod('email'); setContactValue(''); setMessage('');
    setErrors({}); setSubmitted(false);
    onNavigate('home');
  }

  const canSubmit = name.trim() && message.trim() && contactValue.trim();

  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}>

      <BlueHeader style={{ paddingBottom: 36 }}>
        <PageTitle
          title="Have Questions?"
          sub="Reach out to the TC Dual Credit team"
          onBack={() => onNavigate('more')}
        />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: sidePad, marginTop: -24 }}>

        {submitted ? (
          <SuccessView onReturn={handleReturn} />
        ) : (
          <>
            {/* ── Form card ── */}
            <div style={{
              background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`,
              padding: '18px 16px 20px',
              boxShadow: '0 2px 12px rgba(0,0,0,.05)',
              marginBottom: 16,
            }}>

              {/* Name */}
              <div style={{ marginBottom: 18 }}>
                <FieldLabel required>Your Name</FieldLabel>
                <TextInput
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors(v => ({ ...v, name: '' })); }}
                  placeholder="First and last name"
                  hasError={!!errors.name}
                  autoCapitalize="words"
                />
                <FieldError msg={errors.name} />
              </div>

              {/* Role */}
              <div style={{ marginBottom: 18 }}>
                <FieldLabel>I am a</FieldLabel>
                <PillRow
                  options={ROLE_OPTIONS}
                  value={role}
                  onChange={setRole}
                />
              </div>

              {/* High school */}
              <div style={{ marginBottom: 18 }}>
                <FieldLabel>High School</FieldLabel>
                <select
                  value={schoolId}
                  onChange={e => setSchoolId(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    height: 46,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 14,
                    fontFamily: FF, fontSize: 14, color: schoolId ? C.text : C.text3,
                    background: C.bg,
                    paddingLeft: 12, paddingRight: 12,
                    outline: 'none', appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A94AA' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 14px center',
                  }}
                >
                  <option value="">Select your school (optional)</option>
                  {SCHOOLS.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Contact method */}
              <div style={{ marginBottom: 14 }}>
                <FieldLabel required>Preferred Contact</FieldLabel>
                <PillRow
                  options={CONTACT_METHODS}
                  value={contactMethod}
                  onChange={(m) => { setContactMethod(m); setContactValue(''); setErrors(v => ({ ...v, contactValue: '' })); }}
                />
              </div>

              {/* Contact value */}
              <div style={{ marginBottom: 18 }}>
                <FieldLabel required>
                  {contactMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </FieldLabel>
                <TextInput
                  value={contactValue}
                  onChange={e => { setContactValue(e.target.value); setErrors(v => ({ ...v, contactValue: '' })); }}
                  placeholder={contactMethod === 'email' ? 'you@example.com' : '(555) 555-5555'}
                  hasError={!!errors.contactValue}
                  type={contactMethod === 'email' ? 'email' : 'tel'}
                  inputMode={contactMethod === 'email' ? 'email' : 'tel'}
                />
                <FieldError msg={errors.contactValue} />
              </div>

              {/* Message */}
              <div style={{ marginBottom: 4 }}>
                <FieldLabel required>Your Question or Message</FieldLabel>
                <textarea
                  value={message}
                  onChange={e => { setMessage(e.target.value); setErrors(v => ({ ...v, message: '' })); }}
                  placeholder="What would you like to know about Dual Credit?"
                  rows={4}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    border: `1.5px solid ${errors.message ? C.red : C.border}`,
                    borderRadius: 14,
                    fontFamily: FF, fontSize: 14, color: C.text,
                    background: C.bg,
                    padding: '12px 14px',
                    outline: 'none', resize: 'vertical',
                    lineHeight: 1.55,
                    transition: 'border-color .15s',
                  }}
                />
                <FieldError msg={errors.message} />
              </div>

            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              style={{
                width: '100%', height: 54, borderRadius: 16, border: 'none',
                background: canSubmit ? LIME : '#e5e7eb',
                cursor: canSubmit ? 'pointer' : 'default',
                boxShadow: canSubmit ? '0 4px 20px rgba(234,255,0,.32)' : 'none',
                transition: 'background .15s, box-shadow .15s',
                marginBottom: 18,
              }}
              onMouseDown={e  => canSubmit && (e.currentTarget.style.transform = 'scale(0.98)')}
              onMouseUp={e    => (e.currentTarget.style.transform = 'scale(1)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              onTouchStart={e => canSubmit && (e.currentTarget.style.transform = 'scale(0.98)')}
              onTouchEnd={e   => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span style={{ fontFamily: FF, fontSize: 16, fontWeight: 800, color: canSubmit ? DARK : '#9ca3af' }}>
                Send Message
              </span>
            </button>

            {/* ACDC reassurance line */}
            <div style={{
              background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`,
              padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `${BLUE}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FF, fontSize: 12.5, color: C.text2, lineHeight: 1.5 }}>
                  You can also connect directly with your school's Academic Coach.{' '}
                  <button
                    onClick={() => onNavigate('schedule_advising')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: FF, fontSize: 12.5, fontWeight: 700, color: BLUE, textDecoration: 'underline' }}
                  >
                    Schedule Advising →
                  </button>
                </div>
              </div>
            </div>

          </>
        )}

      </div>

      {!submitted && <BottomNav active="more" onNavigate={onNavigate} tabs={tabs} />}
    </div>
  );
}
