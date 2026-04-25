import React, { memo, useMemo } from 'react'
import { Booking, BookingStatus, RoomUnit } from '@/types'
import { useAppContext } from '@/context/AppContext'
import { formatMonthDayFromDateKey, getDateKeyDayOffset, shiftDateKey } from '@/lib/date'
import { RoomRow } from './RoomRow'
import type { RenderableBooking } from './RoomRow'

const TOTAL_DAYS = 30

const STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: '#4CAF50',
  pending: '#FF9800',
  in_house: '#2196F3',
  checked_out: '#9E9E9E',
  cancelled: '#F44336',
}

interface BookingGridProps {
  roomUnits: RoomUnit[]
  bookings: Booking[]
  onBookingClick: (booking: Booking) => void
}

function getDayLabels(startDate: string, totalDays: number): string[] {
  return Array.from({ length: totalDays }, (_, index) =>
    formatMonthDayFromDateKey(shiftDateKey(startDate, index))
  )
}

export const BookingGrid = memo(function BookingGrid({ roomUnits, bookings, onBookingClick }: BookingGridProps) {
  const { config } = useAppContext()
  const dayLabels = useMemo(
    () => getDayLabels(config.dateRangeStart, TOTAL_DAYS),
    [config.dateRangeStart],
  )
  const renderableBookingsByRoom = useMemo(() => {
    const groupedBookings = new Map<string, RenderableBooking[]>()
    const lastDayIndex = TOTAL_DAYS - 1

    bookings.forEach((booking) => {
      const startDay = getDateKeyDayOffset(booking.checkIn, config.dateRangeStart)
      const endDay = getDateKeyDayOffset(booking.checkOut, config.dateRangeStart)

      if (endDay < 0 || startDay > lastDayIndex) {
        return
      }

      const visibleStartDay = Math.max(startDay, 0)
      const visibleEndDay = Math.min(endDay, lastDayIndex)
      const span = visibleEndDay - visibleStartDay + 1

      if (span <= 0) {
        return
      }

      const renderableBooking: RenderableBooking = {
        booking,
        startColumn: visibleStartDay + 1,
        span,
        color: STATUS_COLORS[booking.status] ?? '#ccc',
      }
      const roomBookings = groupedBookings.get(booking.roomUnit.roomId)

      if (roomBookings) {
        roomBookings.push(renderableBooking)
        return
      }

      groupedBookings.set(booking.roomUnit.roomId, [renderableBooking])
    })

    return groupedBookings
  }, [bookings, config.dateRangeStart])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header row */}
      <div style={{ display: 'flex', borderBottom: '2px solid #ddd', background: '#fafafa' }}>
        <div style={{ width: 140, minWidth: 140, padding: '8px 12px', fontWeight: 600, fontSize: 13, borderRight: '1px solid #eee', background: config.bookingHeaderBackground }}>
          Room
        </div>
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            background: config.bookingHeaderBackground
          }}
        >
          {Array.from({ length: TOTAL_DAYS }, (_, dayIndex) => {
            return (
              <div
                key={dayIndex}
                style={{
                  width: config.columnWidthPx,
                  minWidth: config.columnWidthPx,
                  padding: '8px 4px',
                  fontSize: 11,
                  textAlign: 'center',
                  borderRight: '1px solid #eee',
                  color: '#666',
                }}
              >
                {dayLabels[dayIndex]}
              </div>
            )
          })}
        </div>
      </div>

      {/* Scrollable grid body */}
      <div
        style={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}
      >
        <div style={{ minWidth: TOTAL_DAYS * config.columnWidthPx + 140 }}>
          {roomUnits.map(room => {
            const roomBookings = renderableBookingsByRoom.get(room.id) ?? []
            return (
              <RoomRow
                key={room.id}
                rowId={room.id}
                rowName={room.name}
                renderableBookings={roomBookings}
                totalDays={TOTAL_DAYS}
                onBookingClick={onBookingClick}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
})
