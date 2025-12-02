import React, { useState } from 'react';
import '../../styles/calendar.css';

const Calendar = ({ onDayClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const changeMonth = (step) => {
    let newMonth = currentMonth + step;
    let newYear = currentYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const renderCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    });

    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    return { monthName, weekDays, offset, daysInMonth };
  };

  const { monthName, weekDays, offset, daysInMonth } = renderCalendar();

  return (
    <div className="os-calendar">
      <div className="cal-header">
        <button className="nav-btn" onClick={() => changeMonth(-1)}>◀</button>
        <span className="month-title">
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
        </span>
        <button className="nav-btn" onClick={() => changeMonth(1)}>▶</button>
      </div>
      
      <div className="cal-grid">
        {weekDays.map(day => (
          <div key={day} className="day-name">{day}</div>
        ))}
        
        {[...Array(offset)].map((_, i) => (
          <div key={`empty-${i}`} className="empty"></div>
        ))}
        
        {[...Array(daysInMonth)].map((_, i) => (
          <div
            key={i + 1}
            className="day"
            onClick={() => onDayClick(i + 1, currentMonth, currentYear)}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;