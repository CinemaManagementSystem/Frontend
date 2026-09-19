// The API returns LocalDateTime values in Cambodia's cinema time zone.
export const CINEMA_TIME_ZONE = 'Asia/Phnom_Penh';
const CINEMA_OFFSET = '+07:00';

// Keep this aligned with the backend's BOOKING_HOLD_TTL_MINUTES setting.
const configuredHoldMinutes = Number(import.meta.env.VITE_BOOKING_HOLD_MINUTES);
export const BOOKING_CUTOFF_MINUTES = Number.isFinite(configuredHoldMinutes) && configuredHoldMinutes > 0
  ? configuredHoldMinutes
  : 5;

type ShowtimeSchedule = {
  startTime?: string;
  status?: string;
  date?: string;
  time?: string;
};

export function parseShowtimeStart(startTime: string): number {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(startTime)) return NaN;
  const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(startTime);
  return Date.parse(hasOffset ? startTime : `${startTime}${CINEMA_OFFSET}`);
}

export function getCinemaDate(now: number | Date = Date.now()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CINEMA_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function getCinemaDateTime(startTime: string): { date: string; time: string } {
  const start = parseShowtimeStart(startTime);
  if (!Number.isFinite(start)) return { date: '', time: '' };
  return {
    date: getCinemaDate(start),
    time: new Intl.DateTimeFormat('en-GB', {
      timeZone: CINEMA_TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).format(start),
  };
}

export function showtimeUnavailableReason(show: ShowtimeSchedule, now = Date.now()): string {
  const status = show.status?.trim().toUpperCase();
  if (status === 'SOLD_OUT') return 'This showtime is sold out. Please choose another showtime.';
  if (status !== 'ACTIVE' && status !== 'SCHEDULED') {
    return 'This showtime is not open for booking. Please choose another showtime.';
  }
  const start = parseShowtimeStart(show.startTime ?? `${show.date ?? ''}T${show.time ?? ''}`);
  if (!Number.isFinite(start)) return 'The schedule for this showtime is unavailable. Please choose another showtime.';
  if (start <= now) return 'This showtime has already started or ended. Please choose an upcoming showtime.';
  if (start - BOOKING_CUTOFF_MINUTES * 60_000 <= now) {
    return `Online booking closes ${BOOKING_CUTOFF_MINUTES} minutes before the show starts. Please choose an upcoming showtime.`;
  }
  return '';
}

export function isUpcomingShowtime(show: ShowtimeSchedule, now = Date.now()): boolean {
  return showtimeUnavailableReason(show, now) === '';
}
