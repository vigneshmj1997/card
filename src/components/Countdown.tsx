import { useEffect, useState } from "react";
import "./Countdown.css";

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  passed: boolean;
}

function remainingFrom(targetMs: number): Remaining {
  const diff = targetMs - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
  }

  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    passed: false,
  };
}

/**
 * Counts down to the muhurtham.
 *
 * The visible digits update every second, but the live region announces
 * only the day count and only when it changes — a screen reader reading
 * out a ticking seconds field would be unusable.
 */
export function Countdown({ targetISO }: { targetISO: string }) {
  const targetMs = new Date(targetISO).getTime();
  const [time, setTime] = useState(() => remainingFrom(targetMs));

  useEffect(() => {
    if (Number.isNaN(targetMs)) return;

    const id = window.setInterval(() => {
      const next = remainingFrom(targetMs);
      setTime(next);
      if (next.passed) window.clearInterval(id);
    }, 1000);

    return () => window.clearInterval(id);
  }, [targetMs]);

  if (Number.isNaN(targetMs)) return null;

  if (time.passed) {
    return (
      <p className="countdown countdown--done">
        Married, and very glad you were there.
      </p>
    );
  }

  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <div className="countdown">
      <ol className="countdown__list">
        {units.map((unit) => (
          <li key={unit.label} className="countdown__unit">
            <span className="countdown__value">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="countdown__label">{unit.label}</span>
          </li>
        ))}
      </ol>

      {/* One calm, complete phrase — not a per-second stream of numbers. */}
      <p className="visually-hidden" aria-live="polite">
        {time.days} days until the muhurtham.
      </p>
    </div>
  );
}
