import { useState, useCallback } from 'react';

const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

interface Result {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalHours: number;
  nextBirthday: Date;
  daysUntilBirthday: number;
  birthWeekday: string;
  birthMonth: string;
  nextBirthdayAge: number;
}

export default function AgeCalc() {
  const [birthDate, setBirthDate] = useState('');
  const [asOfDate, setAsOfDate] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;

  const calculate = useCallback(() => {
    setError('');
    const birth = new Date(birthDate + 'T00:00:00');
    const asOf = asOfDate ? new Date(asOfDate + 'T00:00:00') : new Date();

    if (isNaN(birth.getTime())) { setError('Please enter a valid birth date.'); return; }
    if (birth > asOf) { setError('Birth date cannot be in the future.'); return; }

    // Age in years/months/days
    let years = asOf.getFullYear() - birth.getFullYear();
    let months = asOf.getMonth() - birth.getMonth();
    let days = asOf.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) { years--; months += 12; }

    const totalDays = Math.floor((asOf.getTime() - birth.getTime()) / (1000*60*60*24));
    const totalHours = totalDays * 24;

    // Next birthday
    const nextBirthday = new Date(asOf.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= asOf) nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - asOf.getTime()) / (1000*60*60*24));

    setResult({
      years, months, days, totalDays, totalHours,
      nextBirthday,
      daysUntilBirthday,
      birthWeekday: WEEKDAYS[birth.getDay()],
      birthMonth: MONTHS[birth.getMonth()],
      nextBirthdayAge: years + 1,
    });
  }, [birthDate, asOfDate]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-navy-900 to-brand-900 px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">🎂</span>
        <div>
          <h2 className="text-white font-bold text-lg">Age Calculator</h2>
          <p className="text-slate-400 text-xs">Find your exact age in years, months, and days</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="calc-label">Date of Birth</label>
            <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="calc-input" />
          </div>
          <div>
            <label className="calc-label">Age As Of (optional)</label>
            <div className="flex gap-2">
              <input type="date" value={asOfDate} onChange={e => setAsOfDate(e.target.value)} className="calc-input flex-1" />
              <button
                onClick={() => setAsOfDate('')}
                className="px-3 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold rounded-lg border border-brand-200 transition-colors whitespace-nowrap"
              >
                Today
              </button>
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">{error}</div>}

        <button onClick={calculate} className="btn-primary w-full justify-center py-3">
          Calculate Age
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>

        {result && (
          <div className="space-y-4">
            {/* Main age */}
            <div className="result-card text-center">
              <div className="text-slate-400 text-xs uppercase tracking-widest mb-2">Your Age</div>
              <div className="flex items-end justify-center gap-4">
                <div>
                  <span className="text-4xl font-extrabold text-brand-300">{result.years}</span>
                  <span className="text-slate-400 text-sm ml-1">yrs</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">{result.months}</span>
                  <span className="text-slate-400 text-sm ml-1">mo</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">{result.days}</span>
                  <span className="text-slate-400 text-sm ml-1">days</span>
                </div>
              </div>
              <div className="text-slate-400 text-xs mt-2">
                You were born on a {result.birthWeekday}
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { val: result.totalDays.toLocaleString(), label: 'Days Lived' },
                { val: result.totalHours.toLocaleString(), label: 'Hours Lived' },
                { val: (result.totalDays * 24 * 60).toLocaleString(), label: 'Minutes Lived' },
                { val: result.daysUntilBirthday.toLocaleString(), label: 'Days to Birthday' },
              ].map(({ val, label }) => (
                <div key={label} className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-center">
                  <div className="text-base font-bold text-navy-900 leading-tight">{val}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Next birthday */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <div className="font-semibold text-navy-900 text-sm">Next Birthday</div>
                <div className="text-slate-600 text-sm">
                  {WEEKDAYS[result.nextBirthday.getDay()]}, {MONTHS[result.nextBirthday.getMonth()]} {result.nextBirthday.getDate()}, {result.nextBirthday.getFullYear()}
                  {' — '}<span className="font-bold text-brand-600">{result.daysUntilBirthday} days away</span>
                  {' (turning '}{result.nextBirthdayAge})
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
