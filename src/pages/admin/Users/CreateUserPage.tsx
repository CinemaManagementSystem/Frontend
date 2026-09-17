import React from 'react';
import { Gauge, Info, UserCog, Users } from 'lucide-react';
import { CreateEntityPage, CreateFieldValue } from '@/components/admin/CreatePage/CreateEntityPage';
import { useUserAdminStore } from '@/store/userAdminStore';
import { UserInput, Role } from '@/types/user';

export const CreateUserPage: React.FC = () => {
  const { create } = useUserAdminStore();

  const handleSubmit = async (values: Record<string, CreateFieldValue>) => {
    const username = String(values.username ?? '').trim();
    const email = String(values.email ?? '').trim();
    const password = String(values.password ?? '');

    const payload: UserInput = {
      ...(username ? { username } : {}),
      email,
      name: username || email,
      ...(password ? { password } : {}),
      role: String(values.role ?? 'USER') as Role,
      status: String(values.status ?? 'ACTIVE'),
    };
    await create(payload);
  };

  return (
    <CreateEntityPage
      backUrl="/admin/users"
      backLabel="users"
      icon={Users}
      title="Add New User"
      subtitle="Enter details to register a new customer, staff or administrator account."
      submitLabel="Create User"
      sections={[
        {
          title: 'Basic Information',
          description: 'Account credentials and contact information.',
          icon: Info,
          fields: [
            {
              name: 'username',
              label: 'Username',
              type: 'text',
              placeholder: '3-50 characters (optional)',
              helper: 'Leave blank to derive the username from the email.',
            },
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              placeholder: 'user@example.com',
              required: true,
            },
            {
              name: 'password',
              label: 'Password',
              type: 'password',
              placeholder: 'Minimum 6 characters',
              required: true,
              spanFull: true,
              helper: 'Choose a strong password with at least 6 characters.',
            },
          ],
        },
        {
          title: 'Role & Status',
          description: 'Access level and account state.',
          icon: UserCog,
          fields: [
            {
              name: 'role',
              label: 'Role',
              type: 'segment',
              required: true,
              options: [
                { value: 'USER', label: 'Customer' },
                { value: 'STAFF', label: 'Staff' },
                { value: 'ADMIN', label: 'Admin' },
              ],
            },
          ],
        },
        {
          title: 'Status',
          description: 'Whether the account is active or disabled.',
          icon: Gauge,
          fields: [
            {
              name: 'status',
              label: 'Account Status',
              type: 'segment',
              required: true,
              options: [
                { value: 'ACTIVE', label: 'Active' },
                { value: 'DISABLED', label: 'Disabled' },
              ],
            },
          ],
        },
      ]}
      initialValues={{ role: 'USER', status: 'ACTIVE' }}
      onSubmit={handleSubmit}
    />
  );
};

export default CreateUserPage;