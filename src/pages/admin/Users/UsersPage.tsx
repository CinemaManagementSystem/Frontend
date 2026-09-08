import React, { useEffect } from 'react';
import { CrudTable, CrudColumn, CrudField, CrudValue } from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { useUserAdminStore } from '@/store/userAdminStore';
import { User, UserInput, Role } from '@/types/user';

const ROLES = [
  { value: 'USER', label: 'USER' },
  { value: 'STAFF', label: 'STAFF' },
  { value: 'ADMIN', label: 'ADMIN' },
];

const STATUSES = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'DISABLED', label: 'DISABLED' },
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
  { key: 'username', header: 'Username', render: (row) => (
      <span className="font-bold text-foreground">{row.username}</span>
    ) },
  { key: 'email', header: 'Email', render: (row) => <span className="text-muted-foreground">{row.email}</span> },
  {
    key: 'role',
    header: 'Role',
    render: (row) => (
      <Badge variant={roleVariant(row.role)} size="sm">{row.role}</Badge>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={statusVariant(row.status)} size="sm">
        {row.status ?? '—'}
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
    // The API requires `name`, while the modal intentionally does not expose it.
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
      subtitle="Manage customer accounts, staff and administrators"
      items={users}
      loading={loading}
      columns={columns}
      fields={fields}
      searchKeys={['username', 'email', 'role', 'status']}
      createLabel="Add User"
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
