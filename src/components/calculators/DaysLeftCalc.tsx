import { useState, useEffect } from 'react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export default function DaysLeftCalc() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Update every minute
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);
  const totalDays = isLeapYear(year) ? 366 : 365;

  const dayOfYear = Math.ceil((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysLeft = totalDays - dayOfYear + 1;
  const weeksLeft = Math.floor(daysLeft / 7);
  const weekdaysLeft = (() => {
    let count = 0;
    const cur = new Date(now);
    cur.setHours(0,0,0,0);
    const end = new Date(endOfYear);
    while (cur <= end) {
      const d = cur.getDay();
      if (d !== 0 && d !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  })();

  const weekendsLeft = daysLeft - weekdaysLeft;
  const progress = ((dayOfYear - 1) / totalDays) * 100;

  const nextYear = new Date(year + 1, 0, 1);
  const daysUntilNewYear = Math.ceil((nextYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Quarter info
  const quarters = [
    { name: 'Q1', start: new Date(year, 0, 1), end: new Date(year, 2, 31) },
    { name: 'Q2', start: new Date(year, 3, 1), end: new Date(year, 5, 30) },
    { name: 'Q3', start: new Date(year, 6, 1), end: new Date(year, 8, 30) },
    { name: 'Q4', start: new Date(year, 9, 1), end: new Date(year, 11, 31) },
  ];
  const currentQuarter = quarters.findIndex(q => now >= q.start && now <= q.end);
  const currentQ = quarters[currentQuarter] ?? quarters[3];
  const daysLeftInQ = Math.ceil((currentQ.end.getTime() - now.getTime()) / (1000*60*60*24)) + 1;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-navy-900 to-brand-900 px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">🗓️</span>
        <div>
          <h2 className="text-white font-bold text-lg">Days Left in {year}</h2>
          <p className="text-slate-400 text-xs">Live tracker — updated automatically</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Main stat */}
        <div className="result-card text-center">
          <div className="text-slate-400 text-xs uppercase tracking-widest mb-2">Days Remaining in {year}</div>
          <div className="text-5xl font-extrabold text-brand-300">{daysLeft}</div>
          <div className="text-slate-400 text-sm mt-1">calendar days left</div>
          <div className="mt-3 text-xs text-slate-400">Today is day {dayOfYear} of {totalDays}</div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Jan 1</span>
            <span className="font-semibold text-brand-600">{progress.toFixed(1)}% complete</span>
            <span>Dec 31</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { val: daysLeft, label: 'Days Left' },
            { val: weeksLeft, label: 'Weeks Left' },
            { val: weekdaysLeft, label: 'Weekdays Left' },
            { val: weekendsLeft, label: 'Weekend Days Left' },
            { val: daysUntilNewYear, label: 'Days Until New Year' },
            { val: `Q${currentQuarter+1}: ${daysLeftInQ}d`, label: 'Days Left in Quarter' },
          ].map(({ val, label }) => (
            <div key={label} className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-center">
              <div className="text-base font-bold text-navy-900">{val}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Month breakdown */}
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Remaining Months</div>
          <div className="space-y-1.5">
            {Array.from({ length: 12 }, (_, i) => {
              const monthStart = new Date(year, i, 1);
              const monthEnd = new Date(year, i + 1, 0);
              if (monthEnd < now) return null;
              const start = monthStart > now ? monthStart : now;
              const daysInMonth = Math.ceil((monthEnd.getTime() - start.getTime()) / (1000*60*60*24)) + 1;
              const totalInMonth = new Date(year, i + 1, 0).getDate();
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-8">{MONTHS[i].slice(0,3)}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-400 rounded-full"
                      style={{ width: `${(daysInMonth / totalInMonth) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600 w-8 text-right">{daysInMonth}d</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
