import React, { useMemo } from "react";
import { Booking, BookingStatus } from "@/types";
import { useAppContext } from "@/context/AppContext";
import styles from "./RoomRow.module.css";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

interface RoomRowProps {
  rowId: string;
  rowName: string;
  bookings: Booking[];
  totalDays: number;
  onBookingClick: (booking: Booking) => void;
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: "#4CAF50",
  pending: "#FF9800",
  in_house: "#2196F3",
  checked_out: "#9E9E9E",
  cancelled: "#F44336",
};

function getDayOffset(date: string, startDate: string) {
  return Math.floor(
    (new Date(date).getTime() - new Date(startDate).getTime()) / MS_PER_DAY,
  );
}

export function RoomRow({
  rowId,
  rowName,
  bookings,
  totalDays,
  onBookingClick,
}: RoomRowProps) {
  console.log('render', rowId)
  const { config } = useAppContext();

  const getBookingStatus = (status: BookingStatus): string => {
    return STATUS_COLORS[status] ?? "#ccc";
  };

  const dayIndices = useMemo(
    () =>
      Array.from({ length: totalDays }, (_, index) => {
        return index;
      }),
    [totalDays],
  );

  const renderableBookings = useMemo(() => {
    const lastDayIndex = totalDays - 1;

    return bookings
      .filter((b) => {
        const startDay = getDayOffset(b.checkIn, config.dateRangeStart);
        const endDay = getDayOffset(b.checkOut, config.dateRangeStart);
        return endDay >= 0 && startDay <= lastDayIndex;
      })
      .map((b) => {
        const startDay = getDayOffset(b.checkIn, config.dateRangeStart);
        const endDay = getDayOffset(b.checkOut, config.dateRangeStart);
        const color = getBookingStatus(b.status);
        return { booking: b, startDay, endDay, color };
      });
  }, [
    bookings,
    config.dateRangeStart,
    totalDays,
  ]);

  const calendarGridTemplate =
    totalDays > 0
      ? `repeat(${totalDays}, ${config.columnWidthPx}px)`
      : "none";

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

          {renderableBookings.map(({ booking, startDay, endDay, color }) => {
            const startColumn = Math.max(startDay, 0) + 1;
            const span = Math.min(endDay, totalDays - 1) - Math.max(startDay, 0) + 1;

            if (span <= 0) return null;

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
            );
          })}
        </div>
      </div>
    </div>
  );
}
