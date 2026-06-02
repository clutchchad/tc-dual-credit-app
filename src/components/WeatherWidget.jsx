/**
 * WeatherWidget — shared weather hook + display components.
 *
 * Exports:
 *   DEFAULT_COORDS   — Texarkana, TX fallback { lat, lon }
 *   wmoIcon(code)    — WMO weather code → emoji string
 *   formatHour(iso)  — ISO datetime string → "3 PM" / "12 AM"
 *   useWeather(coords) — fetches Open-Meteo; returns { weather, loading }
 *   WeatherPill      — small pill button for the header bar
 *   ForecastSlider   — bottom-sheet with 12-hour horizontal swipe strip
 */
import { useState, useEffect } from 'react';
import { C, FF } from '../tokens';

const BLUE = '#065990';

export const DEFAULT_COORDS = { lat: 33.4418, lon: -94.0377 }; // Texarkana, TX

export function wmoIcon(code) {
  if (code === 0)                                return '☀️';
  if (code <= 3)                                 return '⛅';
  if (code === 45 || code === 48)                return '🌫️';
  if ([51, 53, 55, 61, 63, 65].includes(code))   return '🌧️';
  if (code === 71 || code === 73 || code === 75)  return '❄️';
  if (code === 80 || code === 81 || code === 82)  return '🌦️';
  if (code === 95 || code === 96 || code === 99)  return '⛈️';
  return '🌡️';
}

export function formatHour(isoStr) {
  const d = new Date(isoStr);
  const h = d.getHours();
  if (h === 0)  return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

/** Accepts a { lat, lon } coords object. Falls back to DEFAULT_COORDS if null. */
export function useWeather(coords) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const { lat, lon } = coords || DEFAULT_COORDS;

  useEffect(() => {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weathercode` +
      `&hourly=temperature_2m,weathercode` +
      `&temperature_unit=fahrenheit` +
      `&timezone=America%2FChicago&forecast_days=2`;

    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const cur    = data.current;
        const times  = data.hourly?.time || [];
        const nowIdx = times.findIndex(t => t >= cur.time.slice(0, 13));
        const start  = nowIdx >= 0 ? nowIdx : 0;
        const hourly = times.slice(start, start + 12).map((t, i) => ({
          time: t,
          temp: Math.round(data.hourly.temperature_2m[start + i]),
          code: data.hourly.weathercode[start + i],
        }));
        setWeather({ temp: Math.round(cur.temperature_2m), code: cur.weathercode, hourly });
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [lat, lon]);

  return { weather, loading };
}

/** Small pill that lives in the header bar. */
export function WeatherPill({ weather, loading, onClick }) {
  if (loading) {
    return (
      <div style={{
        height: 28, width: 68, borderRadius: 20,
        background: 'rgba(255,255,255,.12)',
        animation: 'tcPulse 1.4s ease-in-out infinite',
      }} />
    );
  }
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        background: 'rgba(255,255,255,.13)',
        border: '1px solid rgba(255,255,255,.18)',
        borderRadius: 20,
        padding: '4px 10px 4px 7px',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 14, lineHeight: 1 }}>{weather ? wmoIcon(weather.code) : '—'}</span>
      <span style={{ fontFamily: FF, fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>
        {weather ? `${weather.temp}°` : '—'}
      </span>
    </button>
  );
}

/** Bottom sheet with a horizontal 12-hour swipe strip. */
export function ForecastSlider({ weather, onClose }) {
  if (!weather) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(2,43,82,0.45)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '20px 20px 0 0',
          paddingBottom: 'env(safe-area-inset-bottom, 12px)',
          boxShadow: '0 -4px 32px rgba(2,43,82,.18)',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 2 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
        </div>

        {/* Label */}
        <div style={{
          fontFamily: FF, fontSize: 12, fontWeight: 700,
          color: C.text3, textTransform: 'uppercase', letterSpacing: '1.1px',
          textAlign: 'center', paddingBottom: 12,
        }}>
          Next 12 Hours
        </div>

        {/* Horizontal swipe strip */}
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          gap: 8,
          padding: '0 16px 16px',
        }}>
          {weather.hourly.map((h, i) => (
            <div
              key={i}
              style={{
                scrollSnapAlign: 'start',
                flexShrink: 0,
                width: 72,
                background: i === 0 ? BLUE : C.bg,
                borderRadius: 14,
                padding: '12px 0',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 6,
              }}
            >
              <span style={{
                fontFamily: FF, fontSize: 11, fontWeight: 700,
                color: i === 0 ? 'rgba(255,255,255,.75)' : C.text3,
                letterSpacing: '0.2px',
              }}>
                {formatHour(h.time)}
              </span>
              <span style={{ fontSize: 22, lineHeight: 1 }}>{wmoIcon(h.code)}</span>
              <span style={{
                fontFamily: FF, fontSize: 15, fontWeight: 900,
                color: i === 0 ? '#fff' : C.text,
                letterSpacing: '-0.4px',
              }}>
                {h.temp}°
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
