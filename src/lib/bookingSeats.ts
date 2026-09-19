import type { Seat } from '@/types/seat';
export { showtimeUnavailableReason as showUnavailableReason } from '@/lib/showtime';

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
