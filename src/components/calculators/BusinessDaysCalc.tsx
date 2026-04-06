import { useState, useCallback } from 'react';

const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatDate(d: Date) {
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

type Mode = 'add' | 'between';

interface AddResult {
  resultDate: Date;
  calendarDays: number;
  weekendsSkipped: number;
}

interface BetweenResult {
  businessDays: number;
  weekendDays: number;
  totalDays: number;
  start: Date;
  end: Date;
}

export default function BusinessDaysCalc() {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;

  const [mode, setMode] = useState<Mode>('add');
  const [startDate, setStartDate] = useState(todayStr);
  const [businessDaysInput, setBusinessDaysInput] = useState('');
  const [endDate, setEndDate] = useState('');
  const [addResult, setAddResult] = useState<AddResult | null>(null);
  const [betweenResult, setBetweenResult] = useState<BetweenResult | null>(null);

  const calculateAdd = useCallback(() => {
    const start = new Date(startDate + 'T00:00:00');
    const days = parseInt(businessDaysInput);
    if (isNaN(start.getTime()) || isNaN(days) || days <= 0) return;

    let count = 0;
    let calendarDays = 0;
    const cur = new Date(start);
    let weekendsSkipped = 0;

    while (count < days) {
      cur.setDate(cur.getDate() + 1);
      calendarDays++;
      const d = cur.getDay();
      if (d !== 0 && d !== 6) count++;
      else weekendsSkipped++;
    }

    setAddResult({ resultDate: new Date(cur), calendarDays, weekendsSkipped });
  }, [startDate, businessDaysInput]);

  const calculateBetween = useCallback(() => {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

    const a = start <= end ? start : end;
    const b = start <= end ? end : start;

    const totalDays = Math.round((b.getTime() - a.getTime()) / (1000*60*60*24));
    let businessDays = 0;
    const cur = new Date(a);
    cur.setDate(cur.getDate() + 1);
    while (cur <= b) {
      const d = cur.getDay();
      if (d !== 0 && d !== 6) businessDays++;
      cur.setDate(cur.getDate() + 1);
    }
    const weekendDays = totalDays - businessDays;
    setBetweenResult({ businessDays, weekendDays, totalDays, start: a, end: b });
  }, [startDate, endDate]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-navy-900 to-brand-900 px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">💼</span>
        <div>
          <h2 className="text-white font-bold text-lg">Business Days Calculator</h2>
          <p className="text-slate-400 text-xs">Add business days or count workdays between dates</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-2">
          {([['add','Add Business Days'],['between','Days Between Dates']] as [Mode,string][]).map(([m, label]) => (
            <button
              key={m}
              onClick={() => { setMode(m); setAddResult(null); setBetweenResult(null); }}
              className={`py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                mode === m ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Start date (shared) */}
        <div>
          <label className="calc-label">Start Date</label>
          <div className="flex gap-2">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="calc-input flex-1" />
            <button onClick={() => setStartDate(todayStr)} className="px-3 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold rounded-lg border border-brand-200 transition-colors">Today</button>
          </div>
        </div>

        {mode === 'add' ? (
          <>
            <div>
              <label className="calc-label">Business Days to Add</label>
              <input type="number" min="1" value={businessDaysInput} onChange={e => setBusinessDaysInput(e.target.value)} placeholder="e.g. 30" className="calc-input" />
            </div>
            <button onClick={calculateAdd} className="btn-primary w-full justify-center py-3">
              Find End Date
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            {addResult && (
              <div className="result-card space-y-3">
                <div className="text-center">
                  <div className="text-slate-400 text-xs uppercase tracking-widest mb-1">End Date ({businessDaysInput} business days later)</div>
                  <div className="text-2xl font-extrabold text-brand-300">{formatDate(addResult.resultDate)}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{addResult.calendarDays}</div>
                    <div className="text-slate-400 text-xs">Calendar Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{addResult.weekendsSkipped}</div>
                    <div className="text-slate-400 text-xs">Weekends Skipped</div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <label className="calc-label">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="calc-input" />
            </div>
            <button onClick={calculateBetween} className="btn-primary w-full justify-center py-3">
              Count Business Days
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            {betweenResult && (
              <div className="space-y-3">
                <div className="result-card text-center">
                  <div className="text-slate-400 text-xs uppercase tracking-widest mb-1">Business Days Between</div>
                  <div className="text-4xl font-extrabold text-brand-300">{betweenResult.businessDays}</div>
                  <div className="text-slate-400 text-sm">working days</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: betweenResult.totalDays, label: 'Calendar Days' },
                    { val: betweenResult.businessDays, label: 'Work Days' },
                    { val: betweenResult.weekendDays, label: 'Weekend Days' },
                  ].map(({ val, label }) => (
                    <div key={label} className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-navy-900">{val}</div>
                      <div className="text-xs text-slate-500">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
