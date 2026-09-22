import { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, CheckCircle2, Crown, DollarSign, LoaderCircle, Search, Users, X, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { membershipService } from '@/services/membershipService';
import { getApiErrorMessage } from '@/services/apiClient';
import type { UserMembership } from '@/types/membership';
import { formatCurrency } from '@/utils/formatCurrency';

export function MembershipMembersPage() {
  const [members, setMembers] = useState<UserMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setMembers(await membershipService.adminMembers());
    } catch (reason) {
      setError(getApiErrorMessage(reason, 'membership members'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const action = async (id: string, type: 'cancel' | 'extend') => {
    setBusy(id);
    setError('');
    try {
      if (type === 'cancel') await membershipService.cancelMember(id);
      else await membershipService.extendMember(id, 1);
      await load();
    } catch (reason) {
      setError(getApiErrorMessage(reason, 'membership update'));
    } finally {
      setBusy('');
    }
  };

  const planOptions = useMemo(() => {
    const names = Array.from(new Set(members.map((m) => m.planName).filter(Boolean)));
    return ['ALL', ...names];
  }, [members]);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      const matchSearch =
        !q ||
        String(m.customerId).includes(q) ||
        (m.planName && m.planName.toLowerCase().includes(q)) ||
        (m.status && m.status.toLowerCase().includes(q));
      const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;
      const matchPlan = planFilter === 'ALL' || m.planName === planFilter;
      return matchSearch && matchStatus && matchPlan;
    });
  }, [members, planFilter, search, statusFilter]);

  const hasFilters = search.trim() !== '' || statusFilter !== 'ALL' || planFilter !== 'ALL';
  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setPlanFilter('ALL');
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#E50914]">
            <Crown className="h-4 w-4" /> Membership Management
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">Members</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manage subscriber accounts, renewals, plan extensions, and memberships.
          </p>
        </div>
      </section>

      {/* KPI Stats Cards */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Members</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{members.length}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Subscriptions</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {members.filter((m) => m.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Cancelled / Expired</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {members.filter((m) => m.status === 'CANCELLED' || m.status === 'EXPIRED').length}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Subscription Value</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {formatCurrency(
                  members
                    .filter((m) => m.status === 'ACTIVE')
                    .reduce((sum, m) => sum + Number(m.priceSnapshot || 0), 0),
                )}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 text-sky-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-nowrap lg:items-center">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user ID, plan, or status..."
              className="h-10 w-full rounded-lg border border-border bg-muted py-2 pl-10 pr-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20"
            />
          </div>
          <div className="w-full sm:w-48 lg:w-44 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="h-10 w-full appearance-none rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none transition-all focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
          {planOptions.length > 2 && (
            <div className="w-full sm:w-48 lg:w-44 shrink-0">
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                aria-label="Filter by plan"
                className="h-10 w-full appearance-none rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none transition-all focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20"
              >
                {planOptions.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan === 'ALL' ? 'All plans' : plan}
                  </option>
                ))}
              </select>
            </div>
          )}
          <Button type="button" variant="outline" size="md" onClick={clearFilters} disabled={!hasFilters} className="h-10 shrink-0">
            <X className="mr-2 h-4 w-4" />
            Clear filters
          </Button>
        </div>
      </section>

      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</p>}

      {/* Table */}
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-bold text-foreground">Member Subscriptions</h2>
          <p className="text-xs text-muted-foreground">Showing {filteredMembers.length} of {members.length} records</p>
        </div>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center p-6 text-sm text-muted-foreground">
            <LoaderCircle className="h-5 w-5 animate-spin mr-2" /> Loading members...
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <h3 className="text-sm font-bold text-foreground">No members found</h3>
            <p className="text-xs text-muted-foreground mt-1">Try clearing filters or search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Member</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Paid</th>
                  <th className="px-5 py-3">Started</th>
                  <th className="px-5 py-3">Expires</th>
                  <th className="pr-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-foreground">
                      User #{member.customerId}
                    </td>
                    <td className="px-5 py-4 font-semibold text-foreground">{member.planName}</td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          member.status === 'ACTIVE'
                            ? 'success'
                            : member.status === 'CANCELLED'
                            ? 'destructive'
                            : 'secondary'
                        }
                        size="sm"
                      >
                        {member.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 font-bold text-foreground">
                      {formatCurrency(Number(member.priceSnapshot))}
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {member.startedAt ? new Date(member.startedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {member.expiresAt ? new Date(member.expiresAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="pr-5 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={() => void action(member.id, 'extend')}
                          disabled={busy === member.id || member.status !== 'ACTIVE'}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                        >
                          <CalendarPlus className="h-3.5 w-3.5 text-emerald-400" /> +1 mo
                        </button>
                        <button
                          type="button"
                          onClick={() => void action(member.id, 'cancel')}
                          disabled={busy === member.id || member.status === 'CANCELLED'}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-rose-500/10 hover:text-rose-400 transition-colors disabled:opacity-40"
                        >
                          <XCircle className="h-3.5 w-3.5 text-rose-400" /> Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
