import { useState } from 'react'

// ── Constants ─────────────────────────────────────────────────────────────────

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_HEADERS  = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

// ── MiniCalendar ──────────────────────────────────────────────────────────────
//
// Props:
//   selectedDate   Date     — the currently selected day
//   onSelectDate   fn       — called with a new Date when the user clicks a day
//   taskDates      Set<str> — (optional) YYYY-MM-DD strings that have any tasks
//   allDoneDates   Set<str> — (optional) YYYY-MM-DD strings where all tasks are done
//
// The calendar keeps its own `calendarMonth` state so the user can browse months
// without changing the selected date. Clicking a day fires `onSelectDate`.

function MiniCalendar({ selectedDate, onSelectDate, taskDates, allDoneDates }) {
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  )

  const year  = calendarMonth.getFullYear()
  const month = calendarMonth.getMonth()

  // Total days in the displayed month
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Blank leading cells so the grid starts on Monday
  // getDay() returns 0=Sun…6=Sat; convert to Mon-start (Mon=0…Sun=6)
  const firstDayRaw   = new Date(year, month, 1).getDay()
  const leadingBlanks = firstDayRaw === 0 ? 6 : firstDayRaw - 1

  // null entries become blank grid cells; numbers become day buttons
  const cells = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const today = new Date()

  function isSelected(day) {
    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth()    === month &&
      selectedDate.getDate()     === day
    )
  }

  function isToday(day) {
    return (
      today.getFullYear() === year &&
      today.getMonth()    === month &&
      today.getDate()     === day
    )
  }

  // Build the YYYY-MM-DD key for a given day number in the displayed month.
  // This matches the format produced by getPeriodKey('daily', date).
  function toDateKey(day) {
    const m = String(month + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${year}-${m}-${d}`
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
          aria-label="Previous month"
          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
        >
          ←
        </button>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {SHORT_MONTHS[month]} {year}
        </span>
        <button
          onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
          aria-label="Next month"
          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
        >
          →
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-slate-400 dark:text-slate-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) =>
          day === null ? (
            <div key={`blank-${i}`} />
          ) : (() => {
            const key      = toDateKey(day)
            const selected = isSelected(day)
            const hasTasks = taskDates?.has(key)
            const allDone  = allDoneDates?.has(key)

            // Dot color: white when selected (visible on dark bg), green if all done, gray otherwise
            const dotColor = selected
              ? 'bg-white/70'
              : allDone
              ? 'bg-emerald-400'
              : 'bg-slate-300 dark:bg-slate-500'

            return (
              <button
                key={day}
                data-testid="calendar-day"
                data-date={key}
                onClick={() => onSelectDate(new Date(year, month, day))}
                className={[
                  'w-8 mx-auto flex flex-col items-center justify-center rounded-full text-xs transition-all cursor-pointer pt-1',
                  selected
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                    : isToday(day)
                    ? 'text-emerald-500 dark:text-emerald-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700',
                ].join(' ')}
              >
                <span className="leading-none mb-0.5">{day}</span>
                {/* Task indicator dot — only renders when taskDates prop is provided */}
                {hasTasks
                  ? <span className={`w-1 h-1 rounded-full mb-1 ${dotColor}`} />
                  : <span className="w-1 h-1 mb-1" />  /* spacer to keep row height uniform */
                }
              </button>
            )
          })()
        )}
      </div>
    </div>
  )
}

export default MiniCalendar
