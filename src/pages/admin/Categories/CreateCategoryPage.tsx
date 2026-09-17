import React from 'react';
import { Info, ListChecks, Tags } from 'lucide-react';
import { CreateEntityPage, CreateFieldValue } from '@/components/admin/CreatePage/CreateEntityPage';
import { useCategoryStore } from '@/store/categoryStore';
import { MovieCategoryInput } from '@/types/category';

export const CreateCategoryPage: React.FC = () => {
  const { create } = useCategoryStore();

  const handleSubmit = async (values: Record<string, CreateFieldValue>) => {
    const payload: MovieCategoryInput = {
      name: String(values.name ?? '').trim(),
      description: String(values.description ?? '').trim(),
      isActive: values.status === 'true',
    };
    await create(payload);
  };

  return (
    <CreateEntityPage
      backUrl="/admin/movie-categories"
      backLabel="movie categories"
      icon={Tags}
      title="Add New Category"
      subtitle="Enter details to register a new movie category in the catalog."
      submitLabel="Save Category"
      sections={[
        {
          title: 'Basic Information',
          description: 'Display name and short description of the category.',
          icon: Info,
          fields: [
            {
              name: 'name',
              label: 'Category Name',
              type: 'text',
              placeholder: 'e.g. Sci-Fi & Fantasy',
              required: true,
            },
            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
              placeholder: 'Short description of the category',
              spanFull: true,
            },
          ],
        },
        {
          title: 'Status',
          description: 'Control whether the category is visible in the catalog.',
          icon: ListChecks,
          fields: [
            {
              name: 'status',
              label: 'Visibility',
              type: 'segment',
              required: true,
              options: [
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
              ],
            },
          ],
        },
      ]}
      initialValues={{ status: 'true' }}
      onSubmit={handleSubmit}
    />
  );
};

export default CreateCategoryPage;