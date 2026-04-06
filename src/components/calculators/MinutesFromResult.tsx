import { useState, useEffect } from 'react';

interface Props { minutes: number; }

function pad(n: number) { return String(n).padStart(2, '0'); }

const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function compute(minutes: number) {
  const now = new Date();
  const result = new Date(now.getTime() + minutes * 60 * 1000);
  const h12 = result.getHours() > 12 ? result.getHours()-12 : result.getHours() || 12;
  const ampm = result.getHours() >= 12 ? 'PM' : 'AM';
  const nowH12 = now.getHours() > 12 ? now.getHours()-12 : now.getHours() || 12;
  const nowAmpm = now.getHours() >= 12 ? 'PM' : 'AM';
  const isToday = result.toDateString() === now.toDateString();

  return {
    timeStr: `${h12}:${pad(result.getMinutes())} ${ampm}`,
    dateStr: isToday ? 'Today' : `${WEEKDAYS[result.getDay()]}, ${MONTHS[result.getMonth()]} ${result.getDate()}`,
    nowStr: `${nowH12}:${pad(now.getMinutes())} ${nowAmpm}`,
    hours: Math.floor(minutes / 60),
    remMins: minutes % 60,
    seconds: minutes * 60,
  };
}

export default function MinutesFromResult({ minutes }: Props) {
  const [r, setR] = useState(() => compute(minutes));
  const [customMins, setCustomMins] = useState(String(minutes));

  useEffect(() => {
    setR(compute(minutes));
    const interval = setInterval(() => setR(compute(parseInt(customMins) || minutes)), 10000);
    return () => clearInterval(interval);
  }, [minutes]);

  const handleCustom = () => {
    const n = parseInt(customMins);
    if (n > 0) setR(compute(n));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-navy-900 to-brand-900 px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">⏱️</span>
        <div>
          <h2 className="text-white font-bold text-lg">{minutes} Minutes From Now</h2>
          <p className="text-slate-400 text-xs">Current time: {r.nowStr}</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="result-card text-center">
          <div className="text-slate-400 text-xs uppercase tracking-widest mb-2">In {minutes} Minutes</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-brand-300">{r.timeStr}</div>
          <div className="text-slate-400 text-sm mt-1">{r.dateStr}</div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { val: minutes, label: 'Minutes' },
            { val: r.hours > 0 ? `${r.hours}h ${r.remMins}m` : `${minutes}m`, label: 'Hours + Minutes' },
            { val: r.seconds.toLocaleString(), label: 'Seconds' },
          ].map(({ val, label }) => (
            <div key={label} className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-center">
              <div className="text-sm font-bold text-navy-900">{val}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="border border-slate-100 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Try a Different Duration</div>
          <div className="flex gap-2">
            <input type="number" min="1" value={customMins} onChange={e => setCustomMins(e.target.value)} className="calc-input flex-1" placeholder="Enter minutes..." />
            <button onClick={handleCustom} className="btn-primary py-2.5 whitespace-nowrap">Calculate</button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[5,10,15,20,30,45,60,90].map(n => (
              <button
                key={n}
                onClick={() => { setCustomMins(String(n)); setR(compute(n)); }}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                  n === minutes ? 'bg-brand-100 text-brand-700 border-brand-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-300'
                }`}
              >
                {n}m
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
