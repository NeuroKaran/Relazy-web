import { useState } from 'react';
import CircularProgress from './CircularProgress';

export default function CalendarView({ activeDate, onSelectDate, completionData = {} }) {
  const parsed = new Date(activeDate);
  const [year, setYear] = useState(isNaN(parsed) ? new Date().getFullYear() : parsed.getFullYear());
  const [month, setMonth] = useState(isNaN(parsed) ? new Date().getMonth() : parsed.getMonth());

  const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  const totalDays = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const todayStr = new Date().toISOString().split('T')[0];
  const weekdays = ['Mo','Tu','We','Th','Fr','Sa','Su'];

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    cells.push({ day: d, dateStr: `${year}-${mm}-${dd}` });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="cal-header">
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--sky-800)' }}>{monthName}</div>
          <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>Daily Completion Rings</div>
        </div>
        <div className="cal-nav">
          <button onClick={prev}>◀</button>
          <button onClick={next}>▶</button>
        </div>
      </div>
      <div className="cal-weekdays">
        {weekdays.map((d, i) => <div key={i} className="cal-weekday">{d}</div>)}
      </div>
      <div className="cal-grid">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e${i}`} className="cal-empty" />;
          const progress = completionData[cell.dateStr] || 0;
          const isSelected = cell.dateStr === activeDate;
          const isToday = cell.dateStr === todayStr;
          return (
            <div key={cell.dateStr}
              className={`cal-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => onSelectDate(cell.dateStr)}>
              <CircularProgress progress={progress} size={32} strokeWidth={3} />
              <span className="cal-day-num">{cell.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
