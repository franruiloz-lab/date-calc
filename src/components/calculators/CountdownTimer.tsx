import { useState, useEffect, useRef } from 'react';

interface Props {
  targetHour?: number;   // 0-23
  targetMinute?: number; // 0, 15, 30, 45
  label?: string;
  mode?: 'fixed' | 'custom'; // fixed = preset time, custom = user picks
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  passed: boolean;
  nextOccurrence: Date;
}

function getNextOccurrence(hour: number, minute: number): Date {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target;
}

function calcTimeLeft(target: Date): TimeLeft {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, passed: true, nextOccurrence: target };
  }
  const totalSeconds = Math.floor(diff / 1000);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalSeconds,
    passed: false,
    nextOccurrence: target,
  };
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function CountdownTimer({ targetHour = 17, targetMinute = 0, label, mode = 'fixed' }: Props) {
  const [customHour, setCustomHour] = useState(targetHour);
  const [customMinute, setCustomMinute] = useState(targetMinute);
  const [activeTarget, setActiveTarget] = useState(() => getNextOccurrence(targetHour, targetMinute));
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(getNextOccurrence(targetHour, targetMinute)));
  const [confetti, setConfetti] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const tl = calcTimeLeft(activeTarget);
      setTimeLeft(tl);
      if (tl.passed) {
        // Reset to tomorrow same time
        const next = new Date(activeTarget);
        next.setDate(next.getDate() + 1);
        setActiveTarget(next);
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [activeTarget]);

  const applyCustom = () => {
    const next = getNextOccurrence(customHour, customMinute);
    setActiveTarget(next);
    setTimeLeft(calcTimeLeft(next));
  };

  const formatTimeLabel = (h: number, m: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${pad(m)} ${ampm}`;
  };

  const displayLabel = label || formatTimeLabel(customHour, customMinute);

  // Progress of day (0-100)
  const now = new Date();
  const secondsInDay = 24 * 3600;
  const secondsNow = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const secondsTarget = customHour * 3600 + customMinute * 60;
  const progress = timeLeft.passed ? 100 : Math.max(0, Math.min(100, (secondsNow / secondsTarget) * 100));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-navy-900 to-brand-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⏱️</span>
          <div>
            <h2 className="text-white font-bold text-lg">Countdown Timer</h2>
            <p className="text-slate-400 text-xs">Time remaining until {displayLabel}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-brand-300 font-bold text-lg">{displayLabel}</div>
          <div className="text-slate-400 text-xs">Target time</div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Countdown display */}
        <div className="bg-navy-900 rounded-2xl p-6 text-center">
          {timeLeft.passed ? (
            <div>
              <div className="text-4xl font-extrabold text-green-400 mb-2">✓ Time Reached!</div>
              <div className="text-slate-400 text-sm">Next occurrence: tomorrow at {displayLabel}</div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-center gap-2 sm:gap-4">
                {[
                  { val: timeLeft.hours, label: 'Hours' },
                  { val: timeLeft.minutes, label: 'Minutes' },
                  { val: timeLeft.seconds, label: 'Seconds' },
                ].map(({ val, label }, i) => (
                  <div key={label} className="flex items-center gap-2 sm:gap-4">
                    {i > 0 && <span className="text-brand-400 text-3xl font-bold">:</span>}
                    <div className="text-center">
                      <div className="bg-navy-800 border border-navy-700 rounded-xl px-3 sm:px-5 py-3 min-w-[60px] sm:min-w-[80px]">
                        <div className="text-3xl sm:text-4xl font-extrabold text-brand-300 font-mono">{pad(val)}</div>
                      </div>
                      <div className="text-slate-500 text-xs mt-1.5">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-slate-400 text-sm">
                = {timeLeft.totalSeconds.toLocaleString()} seconds
              </div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>12:00 AM</span>
            <span className="font-semibold text-brand-600">{progress.toFixed(0)}% of day elapsed</span>
            <span>11:59 PM</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Adjust time */}
        {mode === 'custom' || true ? (
          <div className="border border-slate-100 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Count Down to a Different Time</div>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="calc-label">Hour</label>
                <select
                  value={customHour}
                  onChange={e => setCustomHour(parseInt(e.target.value))}
                  className="calc-select"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i === 0 ? '12 AM (midnight)' : i < 12 ? `${i} AM` : i === 12 ? '12 PM (noon)' : `${i - 12} PM`}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="calc-label">Minute</label>
                <select
                  value={customMinute}
                  onChange={e => setCustomMinute(parseInt(e.target.value))}
                  className="calc-select"
                >
                  <option value={0}>:00</option>
                  <option value={15}>:15</option>
                  <option value={30}>:30</option>
                  <option value={45}>:45</option>
                </select>
              </div>
              <button onClick={applyCustom} className="btn-primary py-2.5 whitespace-nowrap">
                Update
              </button>
            </div>
          </div>
        ) : null}

        {/* Related times */}
        <div className="border-t border-slate-100 pt-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Similar Countdown Timers</div>
          <div className="flex flex-wrap gap-2">
            {[
              [12,0],[13,0],[14,0],[14,30],[15,0],[15,15],[15,30],[16,0],[17,0],[18,0]
            ].filter(([h,m]) => !(h === customHour && m === customMinute)).slice(0,8).map(([h,m]) => (
              <a
                key={`${h}-${m}`}
                href={`/countdown-timer/how-long-until-${h}-${pad(m)}-${h >= 12 ? 'pm' : 'am'}/`}
                className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-medium rounded-lg border border-brand-100 transition-colors"
              >
                {formatTimeLabel(h, m)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
