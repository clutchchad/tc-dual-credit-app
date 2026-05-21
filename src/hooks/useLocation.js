/**
 * useLocation — GPS acquisition hook with verbose diagnostic logging.
 *
 * DEBUG AID ONLY — all output is console-only, no UI changes.
 * Filter Web Inspector console by "[TC-GPS]" to see all location events.
 *
 * What gets logged:
 *  - Geolocation API availability
 *  - iOS DeviceOrientation / DeviceMotion permission gate detection
 *  - Permission state on load (granted / denied / prompt)
 *  - Permission state changes
 *  - watchPosition call (= when permission prompt fires, if needed)
 *  - Watcher start / pause / clear (including reason)
 *  - Every successful position (lat, lng, accuracy, altitude, heading, speed, ts)
 *  - Every rejected position (accuracy > ACCURACY_THRESHOLD)
 *  - Every geolocation error (code + human label + message)
 *  - Timeout details
 *  - App going to background / coming back to foreground
 */

import { useEffect, useRef } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const PREFIX = '[TC-GPS]';
const ACCURACY_THRESHOLD = 30; // metres — positions coarser than this are rejected
const WATCH_TIMEOUT_MS   = 15_000; // watchPosition timeout option

// Geolocation API error code → readable label
const ERROR_LABELS = {
  1: 'PERMISSION_DENIED',
  2: 'POSITION_UNAVAILABLE',
  3: 'TIMEOUT',
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function fmt(val, unit, dp = 1) {
  return val !== null && val !== undefined ? `${val.toFixed(dp)}${unit}` : 'n/a';
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useLocation() {
  const watchIdRef = useRef(null);

  useEffect(() => {
    // ── 1. API availability ──────────────────────────────────────────────────
    if (!('geolocation' in navigator)) {
      console.warn(`${PREFIX} navigator.geolocation is NOT available on this device/browser — aborting GPS setup`);
      return;
    }
    console.log(`${PREFIX} navigator.geolocation is AVAILABLE`);

    // ── 2. iOS sensor permission gate detection ──────────────────────────────
    const isIOS =
      /iP(hone|ad|od)/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS) {
      console.log(`${PREFIX} iOS device detected | userAgent snippet: "${navigator.userAgent.slice(0, 100)}"`);

      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        console.log(
          `${PREFIX} DeviceOrientationEvent.requestPermission API PRESENT — iOS 13+ motion gate exists. ` +
          `Permission has NOT been requested yet (requires a user gesture to call requestPermission).`
        );
      } else {
        console.log(`${PREFIX} DeviceOrientationEvent.requestPermission NOT present (pre-iOS 13 or non-iOS)`);
      }

      if (
        typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function'
      ) {
        console.log(
          `${PREFIX} DeviceMotionEvent.requestPermission API PRESENT — iOS 13+ motion gate exists`
        );
      } else {
        console.log(`${PREFIX} DeviceMotionEvent.requestPermission NOT present`);
      }
    } else {
      console.log(
        `${PREFIX} Non-iOS device detected | userAgent snippet: "${navigator.userAgent.slice(0, 100)}"`
      );
    }

    // ── 3. Permission state on load ──────────────────────────────────────────
    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((status) => {
          console.log(`${PREFIX} Permission state on load: ${status.state.toUpperCase()}`);

          if (status.state === 'denied') {
            console.warn(
              `${PREFIX} DENIED — Location is blocked. On iOS: Settings → Privacy & Security → Location Services → Safari → "While Using"`
            );
          } else if (status.state === 'prompt') {
            console.log(`${PREFIX} PROMPT — Permission dialog will appear when watchPosition is called`);
          } else if (status.state === 'granted') {
            console.log(`${PREFIX} GRANTED — Location permission already approved, no prompt expected`);
          }

          // Log future changes (e.g. user toggles permission in Settings while app is open)
          status.addEventListener('change', () => {
            console.log(
              `${PREFIX} Permission state CHANGED → ${status.state.toUpperCase()} ` +
              `(user toggled location permission while app was running)`
            );
          });
        })
        .catch((err) => {
          console.warn(`${PREFIX} navigator.permissions.query failed: ${err.message}`);
        });
    } else {
      console.log(
        `${PREFIX} navigator.permissions API not available — cannot check permission state before calling watchPosition`
      );
    }

    // ── 4. Success callback ──────────────────────────────────────────────────
    function onSuccess(pos) {
      const { latitude, longitude, accuracy, altitude, heading, speed } = pos.coords;
      const ts = new Date(pos.timestamp).toISOString();

      if (accuracy > ACCURACY_THRESHOLD) {
        console.log(
          `${PREFIX} Position REJECTED | Accuracy: ${Math.round(accuracy)}m | Threshold: ${ACCURACY_THRESHOLD}m | ` +
          `Lat: ${latitude.toFixed(6)} | Lng: ${longitude.toFixed(6)} | Timestamp: ${ts}`
        );
        return;
      }

      console.log(
        `${PREFIX} Position received ✓ | ` +
        `Accuracy: ${Math.round(accuracy)}m | ` +
        `Lat: ${latitude.toFixed(6)} | ` +
        `Lng: ${longitude.toFixed(6)} | ` +
        `Altitude: ${fmt(altitude, 'm')} | ` +
        `Heading: ${fmt(heading, '°')} | ` +
        `Speed: ${fmt(speed, 'm/s')} | ` +
        `Timestamp: ${ts}`
      );
    }

    // ── 5. Error callback ────────────────────────────────────────────────────
    function onError(err) {
      const label = ERROR_LABELS[err.code] ?? `UNKNOWN_CODE_${err.code}`;
      console.error(
        `${PREFIX} ERROR | Code: ${err.code} (${label}) | Message: "${err.message}"`
      );

      switch (err.code) {
        case 1:
          console.warn(
            `${PREFIX} PERMISSION_DENIED detail — user blocked location access or iOS Location Services are ` +
            `off for this app. Check: Settings → Privacy & Security → Location Services → Safari / TC Dual Credit`
          );
          break;
        case 2:
          console.warn(
            `${PREFIX} POSITION_UNAVAILABLE detail — device cannot determine location. ` +
            `Possible causes: no GPS fix indoors, Airplane Mode, weak signal, or iOS location services globally disabled.`
          );
          break;
        case 3:
          console.warn(
            `${PREFIX} TIMEOUT detail — position was not obtained within the ${WATCH_TIMEOUT_MS}ms timeout window. ` +
            `This commonly happens indoors on iOS when GPS cold-starts or when accuracy takes time to converge.`
          );
          break;
        default:
          console.warn(`${PREFIX} Unknown error code ${err.code}`);
      }
    }

    // ── 6. Watcher management ────────────────────────────────────────────────
    function startWatcher() {
      if (watchIdRef.current !== null) {
        console.log(
          `${PREFIX} startWatcher called but watcher already running | watchId: ${watchIdRef.current} — skipping`
        );
        return;
      }

      console.log(
        `${PREFIX} Calling watchPosition — if permission is "prompt", the iOS permission dialog will appear NOW | ` +
        `options: { enableHighAccuracy: true, timeout: ${WATCH_TIMEOUT_MS}ms, maximumAge: 0 }`
      );

      const id = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: WATCH_TIMEOUT_MS,
        maximumAge: 0,
      });

      watchIdRef.current = id;
      console.log(`${PREFIX} Watcher STARTED | watchId: ${id}`);
    }

    function clearWatcher(reason) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        console.log(
          `${PREFIX} Watcher CLEARED | watchId: ${watchIdRef.current} | reason: ${reason}`
        );
        watchIdRef.current = null;
      } else {
        console.log(`${PREFIX} clearWatcher called but no active watcher | reason: ${reason}`);
      }
    }

    // ── 7. Visibility change (background / foreground) ───────────────────────
    function onVisibilityChange() {
      if (document.hidden) {
        console.log(
          `${PREFIX} App went to BACKGROUND (document.hidden = true) — clearing watcher to conserve battery`
        );
        clearWatcher('app backgrounded via visibilitychange');
      } else {
        console.log(
          `${PREFIX} App came to FOREGROUND (document.hidden = false) — restarting watcher`
        );
        startWatcher();
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange);

    // ── 8. Initial start ─────────────────────────────────────────────────────
    console.log(`${PREFIX} Mounting location hook — initiating first watchPosition call`);
    startWatcher();

    // ── 9. Cleanup on unmount ────────────────────────────────────────────────
    return () => {
      clearWatcher('useLocation hook unmounted');
      document.removeEventListener('visibilitychange', onVisibilityChange);
      console.log(`${PREFIX} useLocation hook UNMOUNTED — all listeners removed`);
    };
  }, []); // run once on mount; no deps — watcher is self-contained
}
