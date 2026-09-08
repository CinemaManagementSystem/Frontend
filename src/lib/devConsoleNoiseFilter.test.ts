import { describe, expect, it } from 'vitest';
import { isInjectedStartTimeReporterError } from './devConsoleNoiseFilter';

describe('devConsoleNoiseFilter', () => {
  it('matches the injected reportAllChanges startTime error', () => {
    const error = new TypeError("Cannot read properties of undefined (reading 'startTime')");
    error.stack = "TypeError: Cannot read properties of undefined (reading 'startTime')\n    at et.reportAllChanges (<anonymous>:2:19429)";

    expect(isInjectedStartTimeReporterError(error.message, 'VM316', error)).toBe(true);
  });

  it('does not match normal application errors', () => {
    const error = new TypeError("Cannot read properties of undefined (reading 'startTime')");
    error.stack = "TypeError: Cannot read properties of undefined (reading 'startTime')\n    at formatDateTime (/src/pages/admin/Shows/ShowsPage.tsx:45:10)";

    expect(isInjectedStartTimeReporterError(error.message, '/src/pages/admin/Shows/ShowsPage.tsx', error)).toBe(false);
  });
});
