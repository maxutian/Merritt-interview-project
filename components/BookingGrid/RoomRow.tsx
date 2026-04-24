import React, { useMemo } from "react";
import { Booking, BookingStatus } from "@/types";
import { useAppContext } from "@/context/AppContext";
import styles from "./RoomRow.module.css";

const COLUMN_WIDTH_PX = 48;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

interface RoomRowProps {
  rowId: string;
  rowName: string;
  bookings: Booking[];
  visibleStartIndex: number;
  visibleEndIndex: number;
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
  visibleStartIndex,
  visibleEndIndex,
  totalDays,
  onBookingClick,
}: RoomRowProps) {
  console.log('render', rowId)
  const { config } = useAppContext();
  const visibleColumnCount = Math.max(
    0,
    Math.min(totalDays - visibleStartIndex, visibleEndIndex - visibleStartIndex + 1),
  );
  const clampedVisibleEndIndex = Math.min(visibleEndIndex, totalDays - 1);

  const getBookingStatus = (status: BookingStatus): string => {
    return STATUS_COLORS[status] ?? "#ccc";
  };

  const visibleDayIndices = useMemo(
    () =>
      Array.from({ length: visibleColumnCount }, (_, index) => {
        return visibleStartIndex + index;
      }),
    [visibleColumnCount, visibleStartIndex],
  );

  const visibleBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        const startDay = getDayOffset(b.checkIn, config.dateRangeStart);
        const endDay = getDayOffset(b.checkOut, config.dateRangeStart);
        return endDay >= visibleStartIndex && startDay <= clampedVisibleEndIndex;
      })
      .map((b) => {
        const startDay = getDayOffset(b.checkIn, config.dateRangeStart);
        const endDay = getDayOffset(b.checkOut, config.dateRangeStart);
        const color = getBookingStatus(b.status);
        return { booking: b, startDay, endDay, color };
      });
  }, [
    bookings,
    clampedVisibleEndIndex,
    config.dateRangeStart,
    visibleStartIndex,
  ]);

  const calendarGridTemplate =
    visibleColumnCount > 0
      ? `repeat(${visibleColumnCount}, ${COLUMN_WIDTH_PX}px)`
      : "none";

  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>{rowName}</div>

      <div className={styles.calendar}>
        <div
          className={styles.calendarGrid}
          style={{
            gridTemplateColumns: calendarGridTemplate,
            width: visibleColumnCount * COLUMN_WIDTH_PX,
          }}
        >
          {visibleDayIndices.map((dayIndex, columnIndex) => (
            <div
              key={dayIndex}
              className={styles.dayCell}
              style={{ gridColumn: columnIndex + 1 }}
            />
          ))}

          {visibleBookings.map(({ booking, startDay, endDay, color }) => {
            const startColumn =
              Math.max(startDay, visibleStartIndex) - visibleStartIndex + 1;
            const span =
              Math.min(endDay, clampedVisibleEndIndex) -
              Math.max(startDay, visibleStartIndex) +
              1;

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
