import React, { useEffect } from 'react';
import { CrudTable, CrudColumn, CrudField, CrudValue } from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { useUserAdminStore } from '@/store/userAdminStore';
import { User, UserInput, Role } from '@/types/user';

const ROLES = [
  { value: 'USER', label: 'USER' },
  { value: 'STAFF', label: 'STAFF' },
  { value: 'MANAGER', label: 'MANAGER' },
  { value: 'ADMIN', label: 'ADMIN' },
];

const STATUSES = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'DISABLED', label: 'DISABLED' },
];

function roleVariant(role: string): 'primary' | 'secondary' | 'warning' | 'outline' {
  const base = role.replace('ROLE_', '');
  if (base === 'ADMIN') return 'primary';
  if (base === 'STAFF') return 'warning';
  if (base === 'MANAGER') return 'outline';
  return 'secondary';
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
];

function toInput(values: Record<string, CrudValue>): UserInput {
  return {
    username: String(values.username ?? ''),
    email: String(values.email ?? ''),
    name: String(values.name ?? ''),
    password: String(values.password ?? ''),
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
    { name: 'name', label: 'Full Name', placeholder: 'e.g. Jane Smith', required: true },
    { name: 'username', label: 'Username', placeholder: '3-50 characters', required: true },
    { name: 'email', label: 'Email', placeholder: 'user@example.com', required: true },
    { name: 'password', label: 'Password', placeholder: 'min. 6 characters', required: true },
    { name: 'role', label: 'Role', type: 'select', options: ROLES, required: true },
    { name: 'status', label: 'Status', type: 'select', options: STATUSES, required: true },
  ];

  return (
    <CrudTable
      title="Users"
      subtitle="Manage customer accounts, staff and administrators"
      items={users}
      loading={loading}
      columns={columns}
      fields={fields}
      searchKeys={['username', 'email', 'role']}
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