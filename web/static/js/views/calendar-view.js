/**
 * Calendar View Component
 * Provides timeline visualization for tasks, goals, and deadlines
 */
class CalendarView {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      view: 'month', // month, week, day, agenda
      startOfWeek: 0, // 0 = Sunday, 1 = Monday
      showWeekends: true,
      showTime: true,
      allowEventCreation: true,
      allowEventEditing: true,
      eventHeight: 20,
      timeSlotDuration: 30, // minutes
      workingHours: { start: 9, end: 17 },
      ...options
    };
    
    this.data = [];
    this.currentDate = new Date();
    this.selectedDate = null;
    this.draggedEvent = null;
    
    this.views = {
      month: this.renderMonthView.bind(this),
      week: this.renderWeekView.bind(this),
      day: this.renderDayView.bind(this),
      agenda: this.renderAgendaView.bind(this)
    };
    
    this.init();
  }

  init() {
    this.container.className = 'calendar-view';
    this.setupEventListeners();
    this.loadStyles();
  }

  loadStyles() {
    const calendarViewStyles = `
      .calendar-view {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        overflow: hidden;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .calendar-header {
        padding: 16px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(255, 255, 255, 0.02);
      }

      .calendar-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .calendar-nav {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .calendar-nav-btn {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
      }

      .calendar-nav-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.3);
        color: var(--text-primary);
      }

      .calendar-today-btn {
        padding: 8px 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
        font-weight: 500;
      }

      .calendar-today-btn:hover {
        background: var(--glass-primary);
        border-color: rgba(99, 102, 241, 0.5);
        color: white;
      }

      .calendar-view-switcher {
        display: flex;
        gap: 4px;
        background: rgba(255, 255, 255, 0.05);
        padding: 4px;
        border-radius: 8px;
      }

      .calendar-view-btn {
        padding: 6px 12px;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 13px;
        font-weight: 500;
      }

      .calendar-view-btn:hover,
      .calendar-view-btn.active {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
      }

      .calendar-body {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      /* Month View */
      .calendar-month {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .calendar-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.02);
      }

      .calendar-weekday {
        padding: 12px 8px;
        text-align: center;
        font-weight: 600;
        font-size: 12px;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .calendar-dates {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-template-rows: repeat(6, 1fr);
      }

      .calendar-date {
        border-right: 1px solid rgba(255, 255, 255, 0.05);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        padding: 8px;
        cursor: pointer;
        position: relative;
        transition: all 0.3s ease;
        overflow: hidden;
      }

      .calendar-date:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .calendar-date.other-month {
        color: var(--text-muted);
        background: rgba(0, 0, 0, 0.1);
      }

      .calendar-date.today {
        background: rgba(99, 102, 241, 0.1);
        border: 2px solid rgba(99, 102, 241, 0.3);
      }

      .calendar-date.selected {
        background: rgba(99, 102, 241, 0.2);
        border: 2px solid rgba(99, 102, 241, 0.5);
      }

      .calendar-date-number {
        font-weight: 600;
        color: var(--text-primary);
        font-size: 14px;
        margin-bottom: 4px;
      }

      .calendar-date.other-month .calendar-date-number {
        color: var(--text-muted);
      }

      .calendar-date.today .calendar-date-number {
        color: var(--glass-primary);
      }

      .calendar-events {
        display: flex;
        flex-direction: column;
        gap: 2px;
        max-height: calc(100% - 24px);
        overflow: hidden;
      }

      .calendar-event {
        background: var(--glass-primary);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.2;
      }

      .calendar-event:hover {
        background: rgba(99, 102, 241, 0.9);
        transform: scale(1.02);
      }

      .calendar-event.dragging {
        opacity: 0.5;
        transform: rotate(2deg);
      }

      .calendar-event.goal { background: #8b5cf6; }
      .calendar-event.task { background: #10b981; }
      .calendar-event.deadline { background: #ef4444; }
      .calendar-event.meeting { background: #f59e0b; }

      .calendar-event-more {
        color: var(--text-muted);
        font-size: 10px;
        padding: 2px 6px;
        cursor: pointer;
      }

      .calendar-event-more:hover {
        color: var(--text-primary);
      }

      /* Week View */
      .calendar-week {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .calendar-week-header {
        display: grid;
        grid-template-columns: 60px repeat(7, 1fr);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.02);
      }

      .calendar-time-gutter {
        border-right: 1px solid rgba(255, 255, 255, 0.1);
      }

      .calendar-week-day {
        padding: 12px 8px;
        text-align: center;
        border-right: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .calendar-week-day-name {
        font-size: 12px;
        color: var(--text-secondary);
        text-transform: uppercase;
        font-weight: 600;
      }

      .calendar-week-day-number {
        font-size: 18px;
        font-weight: 700;
        color: var(--text-primary);
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }

      .calendar-week-day.today .calendar-week-day-number {
        background: var(--glass-primary);
        color: white;
      }

      .calendar-week-body {
        flex: 1;
        display: grid;
        grid-template-columns: 60px repeat(7, 1fr);
        overflow-y: auto;
      }

      .calendar-time-column {
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        position: relative;
      }

      .calendar-time-slot {
        height: 60px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 4px;
        font-size: 11px;
        color: var(--text-muted);
      }

      .calendar-day-column {
        border-right: 1px solid rgba(255, 255, 255, 0.05);
        position: relative;
        min-height: 100%;
      }

      .calendar-day-column:last-child {
        border-right: none;
      }

      .calendar-time-grid {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
      }

      .calendar-time-grid-line {
        height: 60px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .calendar-time-grid-line.hour {
        border-bottom-color: rgba(255, 255, 255, 0.1);
      }

      .calendar-timed-event {
        position: absolute;
        left: 4px;
        right: 4px;
        background: var(--glass-primary);
        color: white;
        border-radius: 4px;
        padding: 4px 6px;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.3s ease;
        overflow: hidden;
        z-index: 10;
      }

      .calendar-timed-event:hover {
        background: rgba(99, 102, 241, 0.9);
        transform: scale(1.02);
        z-index: 20;
      }

      .calendar-timed-event.goal { background: #8b5cf6; }
      .calendar-timed-event.task { background: #10b981; }
      .calendar-timed-event.deadline { background: #ef4444; }
      .calendar-timed-event.meeting { background: #f59e0b; }

      /* Day View */
      .calendar-day {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .calendar-day-header {
        padding: 16px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.02);
        text-align: center;
      }

      .calendar-day-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .calendar-day-body {
        flex: 1;
        display: grid;
        grid-template-columns: 80px 1fr;
        overflow-y: auto;
      }

      /* Agenda View */
      .calendar-agenda {
        flex: 1;
        overflow-y: auto;
        padding: 16px 20px;
      }

      .calendar-agenda-date {
        margin-bottom: 24px;
      }

      .calendar-agenda-date-header {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 2px solid rgba(255, 255, 255, 0.1);
      }

      .calendar-agenda-events {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .calendar-agenda-event {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        border-left: 4px solid var(--glass-primary);
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .calendar-agenda-event:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateX(4px);
      }

      .calendar-agenda-event.goal { border-left-color: #8b5cf6; }
      .calendar-agenda-event.task { border-left-color: #10b981; }
      .calendar-agenda-event.deadline { border-left-color: #ef4444; }
      .calendar-agenda-event.meeting { border-left-color: #f59e0b; }

      .calendar-agenda-event-time {
        font-size: 12px;
        color: var(--text-muted);
        font-weight: 600;
        min-width: 60px;
      }

      .calendar-agenda-event-content {
        flex: 1;
      }

      .calendar-agenda-event-title {
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 2px;
      }

      .calendar-agenda-event-description {
        font-size: 12px;
        color: var(--text-secondary);
      }

      /* Loading and Empty States */
      .calendar-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: var(--text-secondary);
        gap: 12px;
      }

      .calendar-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 300px;
        color: var(--text-secondary);
        text-align: center;
      }

      .calendar-empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      /* Event Modal */
      .calendar-event-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .calendar-event-modal-content {
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(20px);
        border-radius: 16px;
        padding: 24px;
        width: 90%;
        max-width: 500px;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      /* Mobile Responsive */
      @media (max-width: 768px) {
        .calendar-header {
          flex-direction: column;
          gap: 12px;
          align-items: stretch;
        }

        .calendar-nav {
          justify-content: space-between;
        }

        .calendar-view-switcher {
          order: -1;
        }

        .calendar-week-header,
        .calendar-week-body {
          grid-template-columns: 40px repeat(7, 1fr);
        }

        .calendar-day-body {
          grid-template-columns: 60px 1fr;
        }

        .calendar-events {
          max-height: 60px;
        }

        .calendar-event {
          font-size: 10px;
          padding: 1px 4px;
        }
      }

      /* Animations */
      @keyframes event-pop {
        0% { transform: scale(0.8); opacity: 0; }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); opacity: 1; }
      }

      .calendar-event.new {
        animation: event-pop 0.3s ease;
      }
    `;

    // Use StyleLoader if available, otherwise fallback to direct injection
    if (window.StyleLoader) {
      window.StyleLoader.injectStyles('calendar-view-styles', calendarViewStyles);
    } else {
      // Fallback for when StyleLoader is not available
      if (!document.getElementById('calendar-view-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'calendar-view-styles';
        styleEl.textContent = calendarViewStyles;
        document.head.appendChild(styleEl);
      }
    }
  }

  setupEventListeners() {
    this.container.addEventListener('click', this.handleClick.bind(this));
    this.container.addEventListener('dragstart', this.handleDragStart.bind(this));
    this.container.addEventListener('dragover', this.handleDragOver.bind(this));
    this.container.addEventListener('drop', this.handleDrop.bind(this));
    this.container.addEventListener('dragend', this.handleDragEnd.bind(this));
  }

  setData(data) {
    this.data = Array.isArray(data) ? data : [];
    this.render();
  }

  render() {
    this.container.innerHTML = `
      ${this.renderHeader()}
      ${this.renderBody()}
    `;
  }

  renderHeader() {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const title = this.options.view === 'month' 
      ? `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`
      : this.options.view === 'week'
      ? `Week of ${this.getWeekStartDate().toLocaleDateString()}`
      : this.currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });

    return `
      <div class="calendar-header">
        <div class="calendar-title">${title}</div>
        <div class="calendar-nav">
          <div class="calendar-nav-btn" data-action="prev">‹</div>
          <div class="calendar-today-btn" data-action="today">Today</div>
          <div class="calendar-nav-btn" data-action="next">›</div>
          <div class="calendar-view-switcher">
            <button class="calendar-view-btn ${this.options.view === 'month' ? 'active' : ''}" 
                    data-view="month">Month</button>
            <button class="calendar-view-btn ${this.options.view === 'week' ? 'active' : ''}" 
                    data-view="week">Week</button>
            <button class="calendar-view-btn ${this.options.view === 'day' ? 'active' : ''}" 
                    data-view="day">Day</button>
            <button class="calendar-view-btn ${this.options.view === 'agenda' ? 'active' : ''}" 
                    data-view="agenda">Agenda</button>
          </div>
        </div>
      </div>
    `;
  }

  renderBody() {
    return `
      <div class="calendar-body">
        ${this.views[this.options.view]()}
      </div>
    `;
  }

  renderMonthView() {
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + this.options.startOfWeek);
    
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (this.options.startOfWeek === 1) {
      weekdays.push(weekdays.shift());
    }

    let html = `
      <div class="calendar-month">
        <div class="calendar-weekdays">
          ${weekdays.map(day => `<div class="calendar-weekday">${day}</div>`).join('')}
        </div>
        <div class="calendar-dates">
    `;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isToday = date.getTime() === today.getTime();
      const isOtherMonth = date.getMonth() !== this.currentDate.getMonth();
      const isSelected = this.selectedDate && date.getTime() === this.selectedDate.getTime();
      
      const dateEvents = this.getEventsForDate(date);
      const visibleEvents = dateEvents.slice(0, 3);
      const moreCount = dateEvents.length - visibleEvents.length;

      html += `
        <div class="calendar-date ${isToday ? 'today' : ''} ${isOtherMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''}" 
             data-date="${date.toISOString().split('T')[0]}"
             data-action="select-date">
          <div class="calendar-date-number">${date.getDate()}</div>
          <div class="calendar-events">
            ${visibleEvents.map(event => this.renderMonthEvent(event)).join('')}
            ${moreCount > 0 ? `<div class="calendar-event-more">+${moreCount} more</div>` : ''}
          </div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    return html;
  }

  renderWeekView() {
    const weekStart = this.getWeekStartDate();
    const weekdays = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      weekdays.push(date);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let html = `
      <div class="calendar-week">
        <div class="calendar-week-header">
          <div class="calendar-time-gutter"></div>
          ${weekdays.map(date => {
            const isToday = date.getTime() === today.getTime();
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            return `
              <div class="calendar-week-day ${isToday ? 'today' : ''}">
                <div class="calendar-week-day-name">${dayName}</div>
                <div class="calendar-week-day-number">${date.getDate()}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="calendar-week-body">
          <div class="calendar-time-column">
            ${this.renderTimeSlots()}
          </div>
          ${weekdays.map(date => this.renderWeekDayColumn(date)).join('')}
        </div>
      </div>
    `;

    return html;
  }

  renderDayView() {
    const dayName = this.currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = this.currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

    return `
      <div class="calendar-day">
        <div class="calendar-day-header">
          <div class="calendar-day-title">${dayName}, ${dateStr}</div>
        </div>
        <div class="calendar-day-body">
          <div class="calendar-time-column">
            ${this.renderTimeSlots()}
          </div>
          ${this.renderWeekDayColumn(this.currentDate)}
        </div>
      </div>
    `;
  }

  renderAgendaView() {
    const events = this.getUpcomingEvents(14); // Next 14 days
    const eventsByDate = this.groupEventsByDate(events);

    let html = '<div class="calendar-agenda">';

    if (Object.keys(eventsByDate).length === 0) {
      html += `
        <div class="calendar-empty">
          <div class="calendar-empty-icon">📅</div>
          <div>No upcoming events</div>
        </div>
      `;
    } else {
      Object.entries(eventsByDate).forEach(([dateStr, dayEvents]) => {
        const date = new Date(dateStr);
        const isToday = this.isToday(date);
        const isTomorrow = this.isTomorrow(date);
        
        let dateLabel = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        });
        
        if (isToday) dateLabel = 'Today';
        else if (isTomorrow) dateLabel = 'Tomorrow';

        html += `
          <div class="calendar-agenda-date">
            <div class="calendar-agenda-date-header">${dateLabel}</div>
            <div class="calendar-agenda-events">
              ${dayEvents.map(event => this.renderAgendaEvent(event)).join('')}
            </div>
          </div>
        `;
      });
    }

    html += '</div>';
    return html;
  }

  renderTimeSlots() {
    let html = '';
    for (let hour = 0; hour < 24; hour++) {
      const timeStr = this.formatHour(hour);
      html += `<div class="calendar-time-slot">${timeStr}</div>`;
    }
    return html;
  }

  renderWeekDayColumn(date) {
    const dateStr = date.toISOString().split('T')[0];
    const events = this.getEventsForDate(date);
    
    return `
      <div class="calendar-day-column" data-date="${dateStr}">
        <div class="calendar-time-grid">
          ${Array.from({ length: 24 }, (_, i) => 
            `<div class="calendar-time-grid-line ${i % 1 === 0 ? 'hour' : ''}"></div>`
          ).join('')}
        </div>
        ${events.map(event => this.renderTimedEvent(event, date)).join('')}
      </div>
    `;
  }

  renderMonthEvent(event) {
    const typeClass = event.type || 'default';
    return `
      <div class="calendar-event ${typeClass}" 
           data-event-id="${event.id}"
           title="${event.title}">
        ${event.title}
      </div>
    `;
  }

  renderTimedEvent(event, date) {
    const startTime = event.startTime || event.dueDate || '09:00';
    const duration = event.duration || 60; // minutes
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startPixels = (startHour * 60 + startMinute) * (60 / this.options.timeSlotDuration);
    const heightPixels = duration * (60 / this.options.timeSlotDuration);
    
    const typeClass = event.type || 'default';
    
    return `
      <div class="calendar-timed-event ${typeClass}" 
           data-event-id="${event.id}"
           style="top: ${startPixels}px; height: ${heightPixels}px;"
           title="${event.title} (${startTime})">
        <div style="font-weight: 600;">${event.title}</div>
        <div style="font-size: 10px; opacity: 0.8;">${startTime}</div>
      </div>
    `;
  }

  renderAgendaEvent(event) {
    const typeClass = event.type || 'default';
    const time = event.startTime || event.dueDate || '';
    const timeDisplay = time ? this.formatTime(time) : 'All day';
    
    return `
      <div class="calendar-agenda-event ${typeClass}" 
           data-event-id="${event.id}">
        <div class="calendar-agenda-event-time">${timeDisplay}</div>
        <div class="calendar-agenda-event-content">
          <div class="calendar-agenda-event-title">${event.title}</div>
          ${event.description ? `
            <div class="calendar-agenda-event-description">${event.description}</div>
          ` : ''}
        </div>
      </div>
    `;
  }

  handleClick(event) {
    const action = event.target.dataset.action;
    const view = event.target.dataset.view;
    const date = event.target.dataset.date;
    const eventId = event.target.dataset.eventId;

    switch (action) {
      case 'prev':
        this.navigatePrevious();
        break;
      case 'next':
        this.navigateNext();
        break;
      case 'today':
        this.goToToday();
        break;
      case 'select-date':
        this.selectDate(new Date(date));
        break;
    }

    if (view) {
      this.setView(view);
    }

    if (eventId) {
      this.showEventDetails(eventId);
    }
  }

  handleDragStart(event) {
    const eventEl = event.target.closest('[data-event-id]');
    if (eventEl) {
      this.draggedEvent = eventEl.dataset.eventId;
      eventEl.classList.add('dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', this.draggedEvent);
    }
  }

  handleDragOver(event) {
    if (this.draggedEvent) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }
  }

  handleDrop(event) {
    if (this.draggedEvent) {
      event.preventDefault();
      
      const dateCell = event.target.closest('[data-date]');
      if (dateCell) {
        const newDate = dateCell.dataset.date;
        this.moveEvent(this.draggedEvent, newDate);
      }
    }
  }

  handleDragEnd(event) {
    if (this.draggedEvent) {
      const eventEl = document.querySelector(`[data-event-id="${this.draggedEvent}"]`);
      eventEl?.classList.remove('dragging');
      this.draggedEvent = null;
    }
  }

  // Navigation methods
  navigatePrevious() {
    switch (this.options.view) {
      case 'month':
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        break;
      case 'week':
        this.currentDate.setDate(this.currentDate.getDate() - 7);
        break;
      case 'day':
        this.currentDate.setDate(this.currentDate.getDate() - 1);
        break;
    }
    this.render();
    this.emit('navigate', { direction: 'prev', date: new Date(this.currentDate) });
  }

  navigateNext() {
    switch (this.options.view) {
      case 'month':
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        break;
      case 'week':
        this.currentDate.setDate(this.currentDate.getDate() + 7);
        break;
      case 'day':
        this.currentDate.setDate(this.currentDate.getDate() + 1);
        break;
    }
    this.render();
    this.emit('navigate', { direction: 'next', date: new Date(this.currentDate) });
  }

  goToToday() {
    this.currentDate = new Date();
    this.render();
    this.emit('navigate', { direction: 'today', date: new Date(this.currentDate) });
  }

  setView(view) {
    if (this.views[view]) {
      this.options.view = view;
      this.render();
      this.emit('viewChanged', { view });
    }
  }

  selectDate(date) {
    this.selectedDate = new Date(date);
    this.render();
    this.emit('dateSelected', { date: new Date(date) });
  }

  // Data methods
  getEventsForDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    return this.data.filter(event => {
      const eventDate = new Date(event.date || event.dueDate || event.startDate);
      return eventDate.toISOString().split('T')[0] === dateStr;
    });
  }

  getUpcomingEvents(days = 30) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return this.data
      .filter(event => {
        const eventDate = new Date(event.date || event.dueDate || event.startDate);
        return eventDate >= now && eventDate <= futureDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date || a.dueDate || a.startDate);
        const dateB = new Date(b.date || b.dueDate || b.startDate);
        return dateA - dateB;
      });
  }

  groupEventsByDate(events) {
    const grouped = {};
    events.forEach(event => {
      const date = new Date(event.date || event.dueDate || event.startDate);
      const dateStr = date.toISOString().split('T')[0];
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(event);
    });
    return grouped;
  }

  moveEvent(eventId, newDate) {
    const event = this.data.find(e => e.id == eventId);
    if (event) {
      // Update the event date
      if (event.date) event.date = newDate;
      if (event.dueDate) event.dueDate = newDate;
      if (event.startDate) event.startDate = newDate;
      
      this.render();
      this.emit('eventMoved', { eventId, event, newDate });
    }
  }

  showEventDetails(eventId) {
    const event = this.data.find(e => e.id == eventId);
    if (event) {
      this.emit('eventClick', { event });
    }
  }

  // Utility methods
  getWeekStartDate() {
    const date = new Date(this.currentDate);
    const day = date.getDay();
    const diff = day - this.options.startOfWeek;
    date.setDate(date.getDate() - diff);
    return date;
  }

  isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isTomorrow(date) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  }

  formatHour(hour) {
    if (this.options.showTime) {
      return hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
    }
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  formatTime(timeStr) {
    const [hour, minute] = timeStr.split(':').map(Number);
    if (this.options.showTime) {
      const period = hour < 12 ? 'AM' : 'PM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    }
    return timeStr;
  }

  // Public API
  addEvent(eventData) {
    const newEvent = {
      id: Date.now().toString(),
      ...eventData
    };
    this.data.push(newEvent);
    this.render();
    this.emit('eventAdded', { event: newEvent });
  }

  updateEvent(eventId, updates) {
    const event = this.data.find(e => e.id == eventId);
    if (event) {
      Object.assign(event, updates);
      this.render();
      this.emit('eventUpdated', { eventId, event, updates });
    }
  }

  removeEvent(eventId) {
    const index = this.data.findIndex(e => e.id == eventId);
    if (index !== -1) {
      const removed = this.data.splice(index, 1)[0];
      this.render();
      this.emit('eventRemoved', { eventId, event: removed });
    }
  }

  goToDate(date) {
    this.currentDate = new Date(date);
    this.render();
  }

  exportCalendar() {
    return {
      events: this.data,
      view: this.options.view,
      currentDate: this.currentDate.toISOString(),
      timestamp: new Date().toISOString()
    };
  }

  // Event system
  emit(event, data) {
    if (this.options.on && this.options.on[event]) {
      this.options.on[event](data);
    }
    
    // Also emit as DOM event
    this.container.dispatchEvent(new CustomEvent(`calendar-${event}`, { detail: data }));
  }
}

// Make CalendarView globally available
window.CalendarView = CalendarView;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CalendarView;
}