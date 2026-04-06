import { useState, useCallback } from 'react';

type Op = 'add' | 'subtract';
type Unit = 'days' | 'weeks' | 'months' | 'years';

interface Result {
  resultDate: Date;
  daysTotal: number;
  weekday: string;
  isWeekend: boolean;
  businessDays?: number;
}

const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatDate(d: Date) {
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function countBusinessDays(start: Date, end: Date) {
  let count = 0;
  const cur = new Date(start);
  const direction = end >= start ? 1 : -1;
  while (cur.toDateString() !== end.toDateString()) {
    cur.setDate(cur.getDate() + direction);
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

export default function DateCalc() {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;

  const [startDate, setStartDate] = useState(todayStr);
  const [operation, setOperation] = useState<Op>('add');
  const [years, setYears] = useState('');
  const [months, setMonths] = useState('');
  const [weeks, setWeeks] = useState('');
  const [days, setDays] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  const calculate = useCallback(() => {
    const base = new Date(startDate + 'T00:00:00');
    if (isNaN(base.getTime())) return;

    const totalDays =
      (parseInt(years || '0') * 365) +
      (parseInt(months || '0') * 30) +
      (parseInt(weeks || '0') * 7) +
      parseInt(days || '0');

    if (totalDays === 0) return;

    const sign = operation === 'add' ? 1 : -1;
    const resultDate = addDays(base, sign * totalDays);
    const businessDays = countBusinessDays(base, resultDate);

    setResult({
      resultDate,
      daysTotal: totalDays,
      weekday: WEEKDAYS[resultDate.getDay()],
      isWeekend: resultDate.getDay() === 0 || resultDate.getDay() === 6,
      businessDays,
    });
  }, [startDate, operation, years, months, weeks, days]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 to-brand-900 px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">📅</span>
        <div>
          <h2 className="text-white font-bold text-lg">Date Calculator</h2>
          <p className="text-slate-400 text-xs">Add or subtract time from any date</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Start date */}
        <div>
          <label className="calc-label">Start Date</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="calc-input flex-1"
            />
            <button
              onClick={() => setStartDate(todayStr)}
              className="px-3 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold rounded-lg border border-brand-200 transition-colors whitespace-nowrap"
            >
              Today
            </button>
          </div>
        </div>

        {/* Operation */}
        <div>
          <label className="calc-label">Operation</label>
          <div className="grid grid-cols-2 gap-2">
            {(['add','subtract'] as Op[]).map(op => (
              <button
                key={op}
                onClick={() => setOperation(op)}
                className={`py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                  operation === op
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                }`}
              >
                {op === 'add' ? '+ Add Time' : '− Subtract Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Duration inputs */}
        <div>
          <label className="calc-label">Duration</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Years', val: years, set: setYears },
              { label: 'Months', val: months, set: setMonths },
              { label: 'Weeks', val: weeks, set: setWeeks },
              { label: 'Days', val: days, set: setDays },
            ].map(({ label, val, set }) => (
              <div key={label}>
                <span className="text-xs text-slate-400 font-medium block mb-1">{label}</span>
                <input
                  type="number"
                  min="0"
                  value={val}
                  onChange={e => set(e.target.value)}
                  placeholder="0"
                  className="calc-input"
                />
              </div>
            ))}
          </div>
        </div>

        <button onClick={calculate} className="btn-primary w-full justify-center py-3">
          Calculate Date
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>

        {/* Result */}
        {result && (
          <div className="result-card space-y-4 animate-fade-in">
            <div className="text-center">
              <div className="text-slate-400 text-xs uppercase tracking-widest mb-1">Result Date</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-300">{formatDate(result.resultDate)}</div>
              {result.isWeekend && (
                <div className="mt-1 inline-flex items-center gap-1 text-yellow-400 text-xs font-medium">
                  <span>⚠️</span> This falls on a weekend
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{result.daysTotal.toLocaleString()}</div>
                <div className="text-slate-400 text-xs">Calendar Days</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{Math.floor(result.daysTotal/7)}</div>
                <div className="text-slate-400 text-xs">Weeks</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{result.businessDays?.toLocaleString()}</div>
                <div className="text-slate-400 text-xs">Business Days</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
