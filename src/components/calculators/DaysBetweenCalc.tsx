import { useState, useCallback } from 'react';

const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatDate(d: Date) {
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

interface Result {
  totalDays: number;
  calendarDays: number;
  businessDays: number;
  weekends: number;
  weeks: number;
  months: number;
  hours: number;
  minutes: number;
  start: Date;
  end: Date;
  isNegative: boolean;
}

function countBusinessDays(start: Date, end: Date) {
  let count = 0;
  const cur = new Date(start);
  cur.setDate(cur.getDate() + 1);
  while (cur <= end) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export default function DaysBetweenCalc() {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  const calculate = useCallback(() => {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

    const isNegative = end < start;
    const a = isNegative ? end : start;
    const b = isNegative ? start : end;

    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.round((b.getTime() - a.getTime()) / msPerDay);
    const businessDays = countBusinessDays(a, b);
    const weekends = totalDays - businessDays;
    const weeks = Math.floor(totalDays / 7);
    const months = Math.round(totalDays / 30.44);
    const hours = totalDays * 24;
    const minutes = hours * 60;

    setResult({ totalDays, calendarDays: totalDays, businessDays, weekends, weeks, months, hours, minutes, start, end, isNegative });
  }, [startDate, endDate]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-navy-900 to-brand-900 px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">📆</span>
        <div>
          <h2 className="text-white font-bold text-lg">Days Between Dates</h2>
          <p className="text-slate-400 text-xs">Calculate the exact duration between any two dates</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="calc-label">Start Date</label>
            <div className="flex gap-2">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="calc-input flex-1" />
            </div>
          </div>
          <div>
            <label className="calc-label">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="calc-input" />
          </div>
        </div>

        <button onClick={calculate} className="btn-primary w-full justify-center py-3">
          Calculate Duration
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>

        {result && (
          <div className="space-y-4">
            {result.isNegative && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-xs text-yellow-700 font-medium">
                Note: End date is before start date — showing absolute difference.
              </div>
            )}

            {/* Main result */}
            <div className="result-card text-center">
              <div className="text-slate-400 text-xs uppercase tracking-widest mb-1">Total Duration</div>
              <div className="text-4xl font-extrabold text-brand-300">{result.totalDays.toLocaleString()}</div>
              <div className="text-slate-400 text-sm">calendar days</div>
            </div>

            {/* Breakdown grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { val: result.businessDays.toLocaleString(), label: 'Business Days' },
                { val: result.weekends.toLocaleString(), label: 'Weekend Days' },
                { val: result.weeks.toLocaleString(), label: 'Weeks' },
                { val: `~${result.months.toLocaleString()}`, label: 'Months' },
                { val: result.hours.toLocaleString(), label: 'Hours' },
                { val: result.minutes.toLocaleString(), label: 'Minutes' },
              ].map(({ val, label }) => (
                <div key={label} className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-navy-900">{val}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            <div className="text-xs text-slate-400 text-center">
              From {formatDate(result.start)} → {formatDate(result.end)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
