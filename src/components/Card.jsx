import { C } from '../tokens';

export default function Card({ style = {}, children, onClick }) {
  const pressHandlers = onClick ? {
    onMouseDown:  e => e.currentTarget.style.transform = 'scale(0.98)',
    onMouseUp:    e => e.currentTarget.style.transform = 'scale(1)',
    onMouseLeave: e => e.currentTarget.style.transform = 'scale(1)',
    onTouchStart: e => e.currentTarget.style.transform = 'scale(0.98)',
    onTouchEnd:   e => e.currentTarget.style.transform = 'scale(1)',
  } : {};

  return (
    <div
      onClick={onClick}
      {...pressHandlers}
      style={{
        background: C.card,
        borderRadius: 20,
        border: `1px solid ${C.border}`,
        boxShadow: '0 2px 10px rgba(0,0,0,.05)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
