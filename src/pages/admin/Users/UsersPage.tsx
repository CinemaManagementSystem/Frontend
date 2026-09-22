import React, { useEffect } from 'react';
import { CheckCircle2, ShieldCheck, Users, UserX } from 'lucide-react';
import {
  CrudTable,
  CrudColumn,
  CrudField,
  CrudFilter,
  CrudStat,
  CrudValue,
} from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { useUserAdminStore } from '@/store/userAdminStore';
import { User, UserInput, Role } from '@/types/user';

const ROLES = [
  { value: 'USER', label: 'Member' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'ADMIN', label: 'Admin' },
];

const STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DISABLED', label: 'Disabled' },
];

const roleOptionsForEdit = (values: Record<string, CrudValue>) => {
  const role = String(values.role ?? '').toUpperCase().replace(/^ROLE_/, '');
  return role === 'ADMIN' ? ROLES.filter((option) => option.value === 'ADMIN') : ROLES;
};

function roleVariant(role: string): 'primary' | 'secondary' | 'warning' | 'outline' {
  const base = role.replace('ROLE_', '');
  if (base === 'ADMIN') return 'primary';
  if (base === 'STAFF') return 'warning';
  return 'secondary';
}

function statusVariant(status?: string): 'success' | 'destructive' | 'outline' {
  const normalized = status?.toUpperCase();
  if (normalized === 'ACTIVE') return 'success';
  if (normalized === 'DISABLED') return 'destructive';
  return 'outline';
}

const columns: CrudColumn<User>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (row) => <span className="font-mono text-xs font-semibold text-foreground">#{row.id}</span>,
  },
  {
    key: 'username',
    header: 'User',
    render: (row) => (
      <div>
        <h4 className="font-bold text-foreground text-sm">{row.username}</h4>
        <p className="text-[11px] text-muted-foreground">{row.name && row.name !== row.username ? row.name : row.email}</p>
      </div>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    render: (row) => <span className="text-muted-foreground text-xs font-mono">{row.email}</span>,
  },
  {
    key: 'role',
    header: 'Role',
    render: (row) => (
      <Badge variant={roleVariant(row.role)} size="sm">
        {row.role.replace(/^ROLE_/, '')}
      </Badge>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={statusVariant(row.status)} size="sm">
        {row.status ?? 'Active'}
      </Badge>
    ),
  },
];

function toInput(values: Record<string, CrudValue>): UserInput {
  const username = String(values.username ?? '').trim();
  const password = String(values.password ?? '');
  const email = String(values.email ?? '').trim();

  return {
    ...(username ? { username } : {}),
    email,
    name: username || email,
    ...(password ? { password } : {}),
    role: String(values.role ?? 'USER') as Role,
    status: String(values.status ?? 'ACTIVE'),
  };
}

export const UsersPage: React.FC = () => {
  const { users, loading, fetchAll, create, update, remove } = useUserAdminStore();

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const stats: CrudStat[] = [
    {
      label: 'Total Registered Users',
      value: users.length,
      icon: Users,
      tone: 'border-border bg-muted text-foreground',
    },
    {
      label: 'Active Accounts',
      value: users.filter((u) => u.status !== 'DISABLED').length,
      icon: CheckCircle2,
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Staff & Administrators',
      value: users.filter((u) => u.role.includes('ADMIN') || u.role.includes('STAFF')).length,
      icon: ShieldCheck,
      tone: 'border-sky-500/20 bg-sky-500/10 text-sky-400',
    },
    {
      label: 'Disabled Accounts',
      value: users.filter((u) => u.status === 'DISABLED').length,
      icon: UserX,
      tone: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    },
  ];

  const filters: CrudFilter<User>[] = [
    {
      key: 'role',
      label: 'Filter by role',
      options: [{ value: 'ALL', label: 'All roles' }, ...ROLES],
      getValue: (u) => u.role.replace(/^ROLE_/, ''),
    },
    {
      key: 'status',
      label: 'Filter by status',
      options: [{ value: 'ALL', label: 'All statuses' }, ...STATUSES],
      getValue: (u) => u.status ?? 'ACTIVE',
    },
  ];

  const fields: CrudField[] = [
    { name: 'username', label: 'Username', placeholder: '3-50 characters (optional)', required: false },
    { name: 'email', label: 'Email', placeholder: 'user@example.com', required: true },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'min. 6 characters (leave blank to keep current password)',
      requiredOnCreate: true,
      hidden: (values, editingId) => {
        const role = String(values.role ?? '').toUpperCase().replace(/^ROLE_/, '');
        return editingId != null && (role === 'USER' || role === 'STAFF');
      },
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: roleOptionsForEdit,
      required: true,
      defaultValue: 'USER',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: STATUSES,
      required: true,
      defaultValue: 'ACTIVE',
    },
  ];

  return (
    <CrudTable
      title="Users"
      subtitle="Manage customer accounts, roles, access permissions and system administrators"
      items={users}
      loading={loading}
      columns={columns}
      fields={fields}
      stats={stats}
      filters={filters}
      searchPlaceholder="Search by username, email, role, or ID..."
      searchKeys={['username', 'email', 'role', 'status']}
      searchText={(u) => `${u.id} ${u.username} ${u.email} ${u.role} ${u.status ?? ''}`}
      createLabel="Add User"
      createUrl="/admin/users/create"
      pageSize={10}
      getId={(row) => row.id}
      getDisplayName={(row) => row.username}
      onSave={async (values, id) => {
        if (id == null) {
          await create(toInput(values));
        } else {
          await update(id, toInput(values));
        }
      }}
      onDelete={remove}
    />
  );
};
