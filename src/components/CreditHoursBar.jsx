import { FF } from '../tokens';

const BLUE = '#065990';

/**
 * Reusable credit-hours progress bar + motivational line.
 * Used in MoreScreen (inside CreditHoursCard) and AcademicsScreen (Section 3).
 *
 * Props:
 *   earned  — confirmed credit hours (Royal Blue segment)
 *   pending — in-progress credit hours (muted lime segment)
 *   total   — earned + pending combined
 *   target  — degree target (default 60)
 */
export default function CreditHoursBar({ earned, pending, total, target = 60 }) {
  const earnedPct  = Math.min((earned  / target) * 100, 100);
  const pendingPct = Math.min((pending / target) * 100, Math.max(0, 100 - earnedPct));

  const motivation =
    total >= 60 ? "You did it — Associate's degree complete!" :
    total >= 45 ? 'Almost there — the finish line is in sight!'  :
    total >= 30 ? "Halfway there — you're ahead of the game!"    :
    total >= 15 ? "Great progress — you're building momentum!"   :
                  "You're just getting started — keep going!";

  return (
    <div>
      {/* Track */}
      <div style={{
        position: 'relative', height: 10, borderRadius: 99,
        background: 'rgba(6,89,144,.08)', overflow: 'hidden', marginBottom: 14,
      }}>
        {/* Pending segment — muted lime, earned + pending wide */}
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${earnedPct + pendingPct}%`,
          background: 'rgba(180,210,40,.50)',
          borderRadius: 99,
          transition: 'width .6s ease',
        }} />
        {/* Earned segment — Royal Blue, overlays the left portion */}
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${earnedPct}%`,
          background: BLUE,
          borderRadius: 99,
          transition: 'width .6s ease',
        }} />
      </div>

      {/* Motivational line */}
      <div style={{
        fontFamily: FF, fontSize: 12.5, fontWeight: 700,
        color: BLUE, textAlign: 'center',
      }}>
        {motivation}
      </div>
    </div>
  );
}
