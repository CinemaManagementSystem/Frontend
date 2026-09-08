import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/store/authStore';
import { auditLogService, isAuditLogConfigured } from '@/services/auditLogService';
import type { AuditPage } from '@/types/auditLog';
import { AuditLogsPage } from './AuditLogsPage';
import { createAuditPreview } from './auditLogPreview';

vi.mock('@/services/auditLogService', () => ({
  auditLogService: { list: vi.fn() },
  isAuditLogConfigured: vi.fn(() => false),
}));

const response: AuditPage = {
  content: [{ ...createAuditPreview()[0], id: 'server-event-1', action: 'Server-recorded action' }],
  totalElements: 1,
  summary: { SUCCESS: 1, FAILURE: 0, WARNING: 0 },
};

function renderPage() {
  return render(<MemoryRouter initialEntries={['/admin/audit-logs']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Routes><Route path="/admin/audit-logs" element={<AuditLogsPage />} /><Route path="/login" element={<h1>Sign in</h1>} /></Routes>
  </MemoryRouter>);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(isAuditLogConfigured).mockReturnValue(false);
  useAuthStore.setState({ isAuthenticated: true, user: { id: 1, username: 'Admin', email: 'admin@example.test', role: 'ADMIN' } });
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false, addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  })));
});

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('Audit Logs page', () => {
  it('redirects signed-out visitors without requesting audit records', () => {
    useAuthStore.setState({ isAuthenticated: false, user: null });
    renderPage();
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(auditLogService.list).not.toHaveBeenCalled();
  });

  it.each(['STAFF', 'USER'] as const)('denies %s access before any data is loaded', role => {
    useAuthStore.setState({ user: { id: 2, username: 'Other', email: 'other@example.test', role } });
    renderPage();
    expect(screen.getByRole('heading', { name: 'Administrator access required' })).toBeInTheDocument();
    expect(auditLogService.list).not.toHaveBeenCalled();
  });

  it('shows a truthful disconnected state without auto-fetching or inventing activity', () => {
    renderPage();
    expect(screen.getByText('Audit source not connected')).toBeInTheDocument();
    expect(screen.getByLabelText('Search activity')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled();
    expect(screen.queryByText('User role updated')).not.toBeInTheDocument();
    expect(auditLogService.list).not.toHaveBeenCalled();
  });

  it('opts into sample data, paginates, and filters across all records', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Preview sample events' }));
    expect(screen.getByText('Sample preview — not real activity')).toBeInTheDocument();
    expect(screen.getByText('Showing 1–10 of 12 sample events')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('Showing 11–12 of 12 sample events')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Search activity'), { target: { value: 'Alex Morgan' } });
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    expect(screen.getByText('Showing 1–5 of 5 sample events')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Result'), { target: { value: 'FAILURE' } });
    expect(screen.getByText('No matching events')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Authentication' } });
    expect(screen.getByText('Showing 1–3 of 3 sample events')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Exit sample preview' }));
    expect(screen.getByText('Audit source not connected')).toBeInTheDocument();
    expect(auditLogService.list).not.toHaveBeenCalled();
  });

  it('shows event details in a keyboard-dismissible read-only dialog', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Preview sample events' }));
    fireEvent.click(screen.getByRole('button', { name: 'View event SAMPLE-0001' }));
    const dialog = screen.getByRole('dialog', { name: 'Audit event details' });
    expect(within(dialog).getByText('Changed a user role from USER to STAFF.')).toBeInTheDocument();
    expect(within(dialog).getByText('192.0.2.10')).toBeInTheDocument();
    expect(within(dialog).getByText('Sample event — this action did not occur in your system.')).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: /edit|delete/i })).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('validates reversed dates and resets the date filters', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Preview sample events' }));
    fireEvent.change(screen.getByLabelText('From date'), { target: { value: '2026-09-09' } });
    fireEvent.change(screen.getByLabelText('To date'), { target: { value: '2026-09-08' } });
    expect(screen.getByRole('alert')).toHaveTextContent('From date must be on or before To date.');
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByText('Showing 1–10 of 12 sample events')).toBeInTheDocument();
  });

  it('loads real events from the configured service and sends filters', async () => {
    vi.mocked(isAuditLogConfigured).mockReturnValue(true);
    vi.mocked(auditLogService.list).mockResolvedValue(response);
    renderPage();
    expect(screen.getByRole('status', { name: 'Loading audit events' })).toBeInTheDocument();
    expect(await screen.findByText('Server-recorded action')).toBeInTheDocument();
    expect(screen.getByText('Showing 1–1 of 1 events')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Search activity'), { target: { value: 'Admin' } });
    await waitFor(() => expect(auditLogService.list).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'Admin', page: 0 }), expect.any(AbortSignal)));
  });

  it('shows API failures without substituting samples and supports retry', async () => {
    vi.mocked(isAuditLogConfigured).mockReturnValue(true);
    vi.mocked(auditLogService.list).mockRejectedValueOnce(new Error('Access denied')).mockResolvedValueOnce(response);
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('Access denied');
    expect(screen.queryByText('User role updated')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Server-recorded action')).toBeInTheDocument();
  });

  it('ignores an in-flight API response after switching to sample preview', async () => {
    let finish: (page: AuditPage) => void = () => {};
    vi.mocked(isAuditLogConfigured).mockReturnValue(true);
    vi.mocked(auditLogService.list).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    renderPage();
    await waitFor(() => expect(auditLogService.list).toHaveBeenCalledTimes(1));
    const signal = vi.mocked(auditLogService.list).mock.calls[0][1];
    fireEvent.click(screen.getByRole('button', { name: 'Preview sample events' }));
    await act(async () => { finish(response); });
    expect(signal?.aborted).toBe(true);
    expect(screen.queryByText('Server-recorded action')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 1–10 of 12 sample events')).toBeInTheDocument();
  });
});
