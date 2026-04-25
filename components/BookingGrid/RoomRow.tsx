import React, { memo, useMemo } from 'react'
import { Booking } from '@/types'
import { useAppContext } from '@/context/AppContext'
import styles from './RoomRow.module.css'

export interface RenderableBooking {
  booking: Booking
  startColumn: number
  span: number
  color: string
}

interface RoomRowProps {
  rowId: string
  rowName: string
  renderableBookings: RenderableBooking[]
  totalDays: number
  onBookingClick: (booking: Booking) => void
}

export const RoomRow = memo(function RoomRow({
  rowId,
  rowName,
  renderableBookings,
  totalDays,
  onBookingClick,
}: RoomRowProps) {
  console.log('render', rowId)
  const { config } = useAppContext()

  const dayIndices = useMemo(
    () =>
      Array.from({ length: totalDays }, (_, index) => {
        return index
      }),
    [totalDays],
  )

  const calendarGridTemplate =
    totalDays > 0
      ? `repeat(${totalDays}, ${config.columnWidthPx}px)`
      : 'none'

  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>{rowName}</div>

      <div className={styles.calendar}>
        <div
          className={styles.calendarGrid}
          style={{
            gridTemplateColumns: calendarGridTemplate,
            width: totalDays * config.columnWidthPx,
          }}
        >
          {dayIndices.map((dayIndex, columnIndex) => (
            <div
              key={dayIndex}
              className={styles.dayCell}
              style={{ gridColumn: columnIndex + 1 }}
            />
          ))}

          {renderableBookings.map(({ booking, startColumn, span, color }) => {
            return (
              <div
                key={booking.id}
                className={styles.bookingBar}
                title={`${booking.guestName} (${booking.status})`}
                onClick={() => onBookingClick(booking)}
                style={{
                  gridColumn: `${startColumn} / span ${span}`,
                  background: color,
                }}
              >
                {booking.guestName}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})
