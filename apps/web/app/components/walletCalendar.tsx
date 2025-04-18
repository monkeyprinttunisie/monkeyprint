"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

interface WalletCalendarProps {
  onDateSelect?: (date: Date) => void
  initialDate?: Date
}

export default function WalletCalendar({ onDateSelect, initialDate }: WalletCalendarProps) {
  // Utility to normalize dates with fixed time (noon)
  const createDateWithFixedTime = (date: Date) => (
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0)
  )

  // Default date initialization
  const defaultDate = initialDate
    ? createDateWithFixedTime(initialDate)
    : createDateWithFixedTime(new Date())

  const [isExpanded, setIsExpanded] = useState(false)
  const [currentDate, setCurrentDate] = useState(defaultDate)
  const [selectedDate, setSelectedDate] = useState(defaultDate)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Trigger `onDateSelect` on mount if no `initialDate` is provided
  useEffect(() => {
    if (!hasInitialized && onDateSelect) {
      setHasInitialized(true)
      if (!initialDate) onDateSelect(defaultDate)
    }
  }, [onDateSelect, defaultDate, hasInitialized, initialDate])

  // Sync state with updated `initialDate` prop
  useEffect(() => {
    if (initialDate) {
      const normalizedDate = createDateWithFixedTime(initialDate)
      setSelectedDate(normalizedDate)
      setCurrentDate(new Date(normalizedDate.getFullYear(), normalizedDate.getMonth(), 1, 12, 0, 0))
    }
  }, [initialDate])

  // Calendar state helpers
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]

  // Generate calendar structure
  const generateCalendarDays = () => {
    const startingDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    const days = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: "", isCurrentMonth: false })
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i, 12, 0, 0)
      days.push({ day: i, isCurrentMonth: true, date })
    }

    const totalCells = Math.ceil(days.length / 7) * 7
    for (let i = days.length; i < totalCells; i++) {
      days.push({ day: "", isCurrentMonth: false })
    }

    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }

    return weeks
  }

  const goToPreviousMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1, 12, 0, 0))
  }

  const goToNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1, 12, 0, 0))
  }

  const handleDateSelect = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const newSelectedDate = createDateWithFixedTime(date)
    setSelectedDate(newSelectedDate)
    onDateSelect?.(newSelectedDate)

    if (newSelectedDate.getMonth() !== currentMonth || newSelectedDate.getFullYear() !== currentYear) {
      setCurrentDate(new Date(newSelectedDate.getFullYear(), newSelectedDate.getMonth(), 1, 12, 0, 0))
    }
  }

  const isDateSelected = (date: Date) => (
    date.getDate() === selectedDate.getDate() &&
    date.getMonth() === selectedDate.getMonth() &&
    date.getFullYear() === selectedDate.getFullYear()
  )

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const formatDay = (day: number | string) => (
    typeof day === "number" ? (day < 10 ? `0${day}` : `${day}`) : day
  )

  const calendarWeeks = generateCalendarDays()

  const formatSelectedDate = () => (
    `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
  )

  return (
    <div className="mb-6 relative">
      {/* Selected Date Display */}
      <div
        className="bg-blue-100 rounded-full py-2 px-4 mb-2 text-center cursor-pointer"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
      >
        {formatSelectedDate()}
      </div>

      {/* Calendar Dropdown */}
      {isExpanded && (
        <div
          className="bg-white rounded-lg shadow-md p-4 absolute w-full z-10"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <button
              className="p-1 text-gray-500 hover:text-blue-600"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft size={20} />
            </button>

            <div className="bg-blue-100 rounded-full py-1 px-6 text-blue-600 text-sm">
              {monthNames[currentMonth]} {currentYear}
            </div>

            <button
              className="p-1 text-gray-500 hover:text-blue-600"
              onClick={goToNextMonth}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, i) => (
              <div key={i} className="text-xs font-semibold text-gray-500">{day}</div>
            ))}
          </div>

          {/* Calendar Days */}
          {calendarWeeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1 text-center mb-1">
              {week.map((dayObj, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`text-xs py-1 ${dayObj.isCurrentMonth && dayObj.date && isDateSelected(dayObj.date)
                    ? "bg-blue-500 text-white rounded-full cursor-pointer"
                    : dayObj.isCurrentMonth && dayObj.date && isToday(dayObj.date)
                      ? "border border-blue-500 text-blue-600 rounded-full cursor-pointer"
                      : dayObj.isCurrentMonth
                        ? "text-gray-700 cursor-pointer hover:bg-blue-100 rounded-full"
                        : "text-gray-300"
                    }`}
                  onClick={(e) => {
                    if (dayObj.isCurrentMonth && dayObj.date) {
                      handleDateSelect(dayObj.date, e)
                    }
                  }}
                >
                  {formatDay(dayObj.day)}
                </div>
              ))}
            </div>
          ))}

          <div className="flex justify-center mt-2">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsExpanded(false)
              }}
              className="text-gray-400 hover:text-blue-600"
            >
              <ChevronDown size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}