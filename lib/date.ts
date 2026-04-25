const MS_PER_DAY = 1000 * 60 * 60 * 24

function padDatePart(value: number) {
  return String(value).padStart(2, '0')
}

function parseDateParts(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return { year, month, day }
}

function getDateKeyTimestamp(value: string) {
  const { year, month, day } = parseDateParts(value)
  return Date.UTC(year, month - 1, day)
}

export function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`
}

export function addDaysToLocalDate(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

export function shiftDateKey(value: string, days: number) {
  const timestamp = getDateKeyTimestamp(value)
  return formatUtcDateKey(new Date(timestamp + days * MS_PER_DAY))
}

export function getDateKeyDayOffset(targetDate: string, startDate: string) {
  return Math.floor(
    (getDateKeyTimestamp(targetDate) - getDateKeyTimestamp(startDate)) / MS_PER_DAY
  )
}

export function formatMonthDayFromDateKey(value: string) {
  const { month, day } = parseDateParts(value)
  return `${month}/${day}`
}

function formatUtcDateKey(date: Date) {
  return `${date.getUTCFullYear()}-${padDatePart(date.getUTCMonth() + 1)}-${padDatePart(date.getUTCDate())}`
}
