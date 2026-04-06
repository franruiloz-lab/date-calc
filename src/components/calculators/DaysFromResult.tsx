import { useState, useEffect } from 'react';

interface Props {
  days: number;
  direction: 'future' | 'past';
}

const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function compute(days: number, direction: 'future' | 'past') {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result = new Date(today);
  result.setDate(result.getDate() + (direction === 'future' ? days : -days));

  let businessDays = 0;
  const a = direction === 'future' ? today : result;
  const b = direction === 'future' ? result : today;
  const cur = new Date(a);
  cur.setDate(cur.getDate() + 1);
  while (cur <= b) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) businessDays++;
    cur.setDate(cur.getDate() + 1);
  }

  return {
    resultDate: result,
    weekday: WEEKDAYS[result.getDay()],
    month: MONTHS[result.getMonth()],
    day: result.getDate(),
    year: result.getFullYear(),
    weeks: Math.floor(days / 7),
    remDays: days % 7,
    businessDays,
    hours: days * 24,
    minutes: days * 24 * 60,
    seconds: days * 24 * 60 * 60,
    isWeekend: result.getDay() === 0 || result.getDay() === 6,
    todayStr: `${MONTHS[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`,
  };
}

export default function DaysFromResult({ days, direction }: Props) {
  const [r, setR] = useState(() => compute(days, direction));
  const [customDays, setCustomDays] = useState(String(days));

  // Recompute client-side on mount for live date
  useEffect(() => { setR(compute(days, direction)); }, [days, direction]);

  const handleCustom = () => {
    const n = parseInt(customDays);
    if (n > 0) setR(compute(n, direction));
  };

  const isFuture = direction === 'future';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-navy-900 to-brand-900 px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">{isFuture ? '📅' : '🕰️'}</span>
        <div>
          <h2 className="text-white font-bold text-lg">
            {isFuture ? `${days} Days From Today` : `${days} Days Ago`}
          </h2>
          <p className="text-slate-400 text-xs">
            {isFuture ? 'What date will it be?' : 'What date was it?'}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Main result */}
        <div className="result-card text-center">
          <div className="text-slate-400 text-xs uppercase tracking-widest mb-2">
            {isFuture ? `${days} Days From Today` : `${days} Days Ago`}
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-brand-300">
            {r.weekday}, {r.month} {r.day}, {r.year}
          </div>
          {r.isWeekend && (
            <div className="mt-1.5 inline-flex items-center gap-1 text-yellow-400 text-xs font-medium">
              ⚠️ This date falls on a weekend
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { val: days, label: 'Calendar Days' },
            { val: `${r.weeks}w ${r.remDays}d`, label: 'Weeks + Days' },
            { val: r.businessDays, label: 'Business Days' },
            { val: r.hours.toLocaleString(), label: 'Hours' },
          ].map(({ val, label }) => (
            <div key={label} className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-center">
              <div className="text-base font-bold text-navy-900">{val}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Try different number */}
        <div className="border border-slate-100 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Try a Different Number of Days
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                min="1"
                value={customDays}
                onChange={e => setCustomDays(e.target.value)}
                className="calc-input"
                placeholder="Enter days..."
              />
            </div>
            <button onClick={handleCustom} className="btn-primary py-2.5 whitespace-nowrap">
              Calculate
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(isFuture ? [7,14,28,30,60,90,120,180] : [7,14,30,60,90,180]).map(n => (
              <button
                key={n}
                onClick={() => { setCustomDays(String(n)); setR(compute(n, direction)); }}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                  n === days ? 'bg-brand-100 text-brand-700 border-brand-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-300'
                }`}
              >
                {n} days
              </button>
            ))}
          </div>
        </div>

        {/* Time countdown */}
        <div className="bg-navy-900 rounded-xl p-4 text-center">
          <div className="text-slate-400 text-xs mb-1">Starting from today: {r.todayStr}</div>
          <div className="text-slate-300 text-sm">
            {isFuture ? 'Adding' : 'Subtracting'} <span className="text-brand-300 font-bold">{days} days</span> → <span className="text-white font-bold">{r.weekday}, {r.month} {r.day}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
