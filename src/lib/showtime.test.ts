import { describe, expect, it } from 'vitest';
import { getCinemaDate, getCinemaDateTime, isUpcomingShowtime, parseShowtimeStart, showtimeUnavailableReason } from './showtime';

const now = Date.parse('2026-09-19T14:00:00Z'); // 9 PM in Cambodia
const show = { status: 'ACTIVE', startTime: '2026-09-20T18:00:00' };

describe('cinema showtime availability', () => {
  it('rejects a past ACTIVE screening even when its clock time matches an upcoming one', () => {
    expect(isUpcomingShowtime({ ...show, startTime: '2026-09-17T18:00:00' }, now)).toBe(false);
    expect(isUpcomingShowtime(show, now)).toBe(true);
  });

  it.each(['ACTIVE', 'SCHEDULED', 'scheduled'])('allows future %s screenings', (status) => {
    expect(isUpcomingShowtime({ ...show, status }, now)).toBe(true);
  });

  it.each(['CANCELLED', 'COMPLETED', 'SOLD_OUT', 'INACTIVE', 'IN_PROGRESS', '', 'UNKNOWN'])('blocks %s screenings', (status) => {
    expect(isUpcomingShowtime({ ...show, status }, now)).toBe(false);
  });

  it('uses the backend cinema time zone for timestamps without an offset', () => {
    expect(parseShowtimeStart(show.startTime)).toBe(Date.parse('2026-09-20T11:00:00Z'));
    expect(parseShowtimeStart('2026-09-20T18:00:00+07:00')).toBe(parseShowtimeStart(show.startTime));
    expect(getCinemaDateTime('2026-09-20T11:00:00Z')).toEqual({ date: '2026-09-20', time: '18:00' });
    expect(getCinemaDate(Date.parse('2026-09-19T18:30:00Z'))).toBe('2026-09-20');
  });

  it('closes at the backend five-minute pre-show cutoff and at show start', () => {
    const start = parseShowtimeStart(show.startTime);
    expect(isUpcomingShowtime(show, start - 5 * 60_000 - 1)).toBe(true);
    expect(isUpcomingShowtime(show, start - 5 * 60_000)).toBe(false);
    expect(showtimeUnavailableReason(show, start - 60_000)).toContain('5 minutes');
    expect(isUpcomingShowtime(show, start)).toBe(false);
  });

  it('does not offer malformed or missing schedules', () => {
    expect(isUpcomingShowtime({ ...show, startTime: 'invalid' }, now)).toBe(false);
    expect(isUpcomingShowtime({ status: 'ACTIVE' }, now)).toBe(false);
    expect(getCinemaDateTime('invalid')).toEqual({ date: '', time: '' });
  });
});
