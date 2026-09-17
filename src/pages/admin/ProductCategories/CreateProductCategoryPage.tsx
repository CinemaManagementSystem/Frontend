import React from 'react';
import { Info, ListChecks, Package } from 'lucide-react';
import { CreateEntityPage, CreateFieldValue } from '@/components/admin/CreatePage/CreateEntityPage';
import { useProductCategoryStore } from '@/store/productCategoryStore';
import { ProductCategoryInput } from '@/types/productCategory';

export const CreateProductCategoryPage: React.FC = () => {
  const { create } = useProductCategoryStore();

  const handleSubmit = async (values: Record<string, CreateFieldValue>) => {
    const payload: ProductCategoryInput = {
      name: String(values.name ?? '').trim(),
      description: String(values.description ?? '').trim(),
      isActive: values.status === 'true',
    };
    await create(payload);
  };

  return (
    <CreateEntityPage
      backUrl="/admin/product-categories"
      backLabel="product categories"
      icon={Package}
      title="Add New Product Category"
      subtitle="Enter details to register a new concession product category."
      submitLabel="Save Category"
      sections={[
        {
          title: 'Basic Information',
          description: 'Display name and short description of the product category.',
          icon: Info,
          fields: [
            {
              name: 'name',
              label: 'Category Name',
              type: 'text',
              placeholder: 'e.g. Popcorn',
              required: true,
            },
            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
              placeholder: 'Describe the category',
              spanFull: true,
            },
          ],
        },
        {
          title: 'Status',
          description: 'Control whether the category is active in the concessions menu.',
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

export default CreateProductCategoryPage;