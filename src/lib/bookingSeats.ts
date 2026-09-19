import type { Seat } from '@/types/seat';
import type { Show } from '@/types/show';

export function showUnavailableReason(show: Show, now = Date.now()): string {
  if (show.status.toUpperCase() !== 'ACTIVE') return 'This showtime is not open for booking. Please choose another showtime.';
  // Backend LocalDateTime values use Asia/Phnom_Penh (UTC+07:00).
  const start = /(?:Z|[+-]\d{2}:\d{2})$/i.test(show.startTime) ? show.startTime : `${show.startTime}+07:00`;
  if (!Number.isFinite(Date.parse(start)) || Date.parse(start) <= now) {
    return 'This showtime has already started or ended. Please choose an upcoming showtime.';
  }
  return '';
}

// Public catalog IDs are now derived from API IDs (st-${show.id}).
export function parseShowId(value: string | null | undefined): number | null {
  const match = value?.match(/^(?:st-)?([1-9]\d*)$/);
  const id = match ? Number(match[1]) : NaN;
  return Number.isSafeInteger(id) ? id : null;
}

export function seatLabel(seat: Seat): string {
  const row = seat.rowName.trim();
  const number = String(seat.seatNumber).trim();
  return number.toUpperCase().startsWith(row.toUpperCase()) ? number : `${row}${number}`;
}

export function seatsForScreen(seats: Seat[], screenId: number): Seat[] {
  return seats.filter((seat) => seat.screenId === screenId).sort((a, b) =>
    a.rowName.localeCompare(b.rowName, undefined, { numeric: true }) ||
    seatLabel(a).localeCompare(seatLabel(b), undefined, { numeric: true }),
  );
}
