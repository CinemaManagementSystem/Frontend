const START_TIME_MESSAGE = "Cannot read properties of undefined (reading 'startTime')";

function getStack(value: unknown): string {
  return value instanceof Error ? value.stack ?? '' : '';
}

export function isInjectedStartTimeReporterError(
  message: string,
  filename: string | undefined,
  error: unknown,
): boolean {
  if (message !== START_TIME_MESSAGE) return false;

  const stack = getStack(error);
  const source = `${filename ?? ''}\n${stack}`;
  return /\breportAllChanges\b/.test(source) || /\bVM\d+\b/.test(source) || source.includes('<anonymous>');
}

export function installDevConsoleNoiseFilter(): void {
  if (!import.meta.env.DEV || typeof window === 'undefined') return;
  if (window.__cinematiqueDevConsoleNoiseFilterInstalled) return;

  window.__cinematiqueDevConsoleNoiseFilterInstalled = true;

  window.addEventListener(
    'error',
    (event) => {
      if (isInjectedStartTimeReporterError(event.message, event.filename, event.error)) {
        event.preventDefault();
      }
    },
    true,
  );
}

declare global {
  interface Window {
    __cinematiqueDevConsoleNoiseFilterInstalled?: boolean;
  }
}
