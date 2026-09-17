import React, { useCallback } from 'react';
import { DollarSign, Gauge, Image, Info, ShoppingBag } from 'lucide-react';
import { CreateEntityPage, CreateFieldValue } from '@/components/admin/CreatePage/CreateEntityPage';
import { useProductStore } from '@/store/productStore';
import { useProductCategoryStore } from '@/store/productCategoryStore';
import { ProductInput } from '@/types/product';

export const CreateProductPage: React.FC = () => {
  const { create } = useProductStore();
  const { categories, fetchAll: fetchCategories } = useProductCategoryStore();

  const loadOptions = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (values: Record<string, CreateFieldValue>) => {
    const payload: ProductInput = {
      name: String(values.name ?? '').trim(),
      price: Number(values.price ?? 0),
      stockQuantity: Number(values.stockQuantity ?? 0),
      isAvailable: values.status === 'true',
      productCategoryId: Number(values.productCategoryId ?? 0),
    };
    const image = values.image instanceof File ? values.image : null;
    await create(payload, image);
  };

  return (
    <CreateEntityPage
      backUrl="/admin/products"
      backLabel="products"
      icon={ShoppingBag}
      title="Add New Product"
      subtitle="Enter details to register a new concession product."
      submitLabel="Create Product"
      loadOptions={loadOptions}
      sections={[
        {
          title: 'Basic Information',
          description: 'Product identity and category.',
          icon: Info,
          fields: [
            {
              name: 'name',
              label: 'Product Name',
              type: 'text',
              placeholder: 'e.g. Caramel Popcorn (L)',
              required: true,
            },
            {
              name: 'productCategoryId',
              label: 'Category',
              type: 'select',
              required: true,
              options: categories.map((category) => ({
                value: String(category.id),
                label: category.name,
              })),
            },
          ],
        },
        {
          title: 'Pricing & Stock',
          description: 'Selling price and available inventory.',
          icon: DollarSign,
          fields: [
            {
              name: 'price',
              label: 'Price (USD)',
              type: 'number',
              placeholder: 'e.g. 4.50',
              min: 0,
              step: '0.01',
              required: true,
            },
            {
              name: 'stockQuantity',
              label: 'Stock Quantity',
              type: 'number',
              placeholder: 'e.g. 100',
              min: 0,
              required: true,
            },
          ],
        },
        {
          title: 'Media & Assets',
          description: 'Product image shown in the concessions menu.',
          icon: Image,
          fields: [
            {
              name: 'image',
              label: 'Product Image',
              type: 'file',
              accept: 'image/*',
              spanFull: true,
              helper: 'PNG, JPG or WebP — the file is uploaded as multipart data.',
            },
          ],
        },
        {
          title: 'Status',
          description: 'Whether the product is available for purchase.',
          icon: Gauge,
          fields: [
            {
              name: 'status',
              label: 'Availability',
              type: 'segment',
              required: true,
              options: [
                { value: 'true', label: 'Available' },
                { value: 'false', label: 'Unavailable' },
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

export default CreateProductPage;