import { useState, useEffect } from 'react';

interface Props { hours: number; }

const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function pad(n: number) { return String(n).padStart(2, '0'); }

function compute(hours: number) {
  const now = new Date();
  const result = new Date(now.getTime() + hours * 60 * 60 * 1000);
  const h12 = result.getHours() > 12 ? result.getHours() - 12 : result.getHours() || 12;
  const ampm = result.getHours() >= 12 ? 'PM' : 'AM';
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;

  return {
    timeStr: `${h12}:${pad(result.getMinutes())} ${ampm}`,
    dateStr: `${WEEKDAYS[result.getDay()]}, ${MONTHS[result.getMonth()]} ${result.getDate()}, ${result.getFullYear()}`,
    isToday: result.toDateString() === now.toDateString(),
    isTomorrow: result.toDateString() === new Date(now.getTime() + 86400000).toDateString(),
    days,
    remHours,
    minutes: hours * 60,
    seconds: hours * 3600,
    nowStr: `${now.getHours() > 12 ? now.getHours()-12 : now.getHours() || 12}:${pad(now.getMinutes())} ${now.getHours() >= 12 ? 'PM' : 'AM'}`,
  };
}

export default function HoursFromResult({ hours }: Props) {
  const [r, setR] = useState(() => compute(hours));
  const [customHours, setCustomHours] = useState(String(hours));

  useEffect(() => {
    setR(compute(hours));
    const interval = setInterval(() => setR(compute(parseInt(customHours) || hours)), 60000);
    return () => clearInterval(interval);
  }, [hours]);

  const handleCustom = () => {
    const n = parseInt(customHours);
    if (n > 0) setR(compute(n));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-navy-900 to-brand-900 px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">⏰</span>
        <div>
          <h2 className="text-white font-bold text-lg">{hours} Hours From Now</h2>
          <p className="text-slate-400 text-xs">Based on your current local time ({r.nowStr})</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Main result */}
        <div className="result-card text-center space-y-1">
          <div className="text-slate-400 text-xs uppercase tracking-widest">{hours} Hours From Now</div>
          <div className="text-3xl font-extrabold text-brand-300">{r.timeStr}</div>
          <div className="text-white text-lg font-semibold">
            {r.isToday ? 'Today' : r.isTomorrow ? 'Tomorrow' : r.dateStr}
          </div>
          {!r.isToday && (
            <div className="text-slate-400 text-sm">{r.dateStr}</div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { val: hours, label: 'Hours' },
            { val: `${r.days}d ${r.remHours}h`, label: 'Days + Hours' },
            { val: r.minutes.toLocaleString(), label: 'Minutes' },
            { val: r.seconds.toLocaleString(), label: 'Seconds' },
          ].map(({ val, label }) => (
            <div key={label} className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-center">
              <div className="text-sm font-bold text-navy-900">{val}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Try different */}
        <div className="border border-slate-100 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Try a Different Number of Hours</div>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={customHours}
              onChange={e => setCustomHours(e.target.value)}
              className="calc-input flex-1"
              placeholder="Enter hours..."
            />
            <button onClick={handleCustom} className="btn-primary py-2.5 whitespace-nowrap">Calculate</button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[6,12,24,36,48,72,96].map(n => (
              <button
                key={n}
                onClick={() => { setCustomHours(String(n)); setR(compute(n)); }}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                  n === hours ? 'bg-brand-100 text-brand-700 border-brand-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-300'
                }`}
              >
                {n}h
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
