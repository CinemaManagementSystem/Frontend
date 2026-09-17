import React, { useCallback } from 'react';
import { DollarSign, Link2, Receipt } from 'lucide-react';
import { CreateEntityPage, CreateFieldValue } from '@/components/admin/CreatePage/CreateEntityPage';
import { useOrderItemStore } from '@/store/orderItemStore';
import { useOrderStore } from '@/store/orderStore';
import { useProductStore } from '@/store/productStore';
import { OrderItemInput } from '@/types/orderItem';

export const CreateOrderItemPage: React.FC = () => {
  const { create } = useOrderItemStore();
  const { orders, fetchAll: fetchOrders } = useOrderStore();
  const { products, fetchAll: fetchProducts } = useProductStore();

  const loadOptions = useCallback(async () => {
    await Promise.all([fetchOrders(), fetchProducts()]);
  }, [fetchOrders, fetchProducts]);

  const handleSubmit = async (values: Record<string, CreateFieldValue>) => {
    const payload: OrderItemInput = {
      quantity: Number(values.quantity ?? 0),
      subtotal: Number(values.subtotal ?? 0),
      unitPrice: Number(values.unitPrice ?? 0),
      orderId: Number(values.orderId ?? 0),
      productId: Number(values.productId ?? 0),
    };
    await create(payload);
  };

  return (
    <CreateEntityPage
      backUrl="/admin/order-items"
      backLabel="order items"
      icon={Receipt}
      title="Add New Order Item"
      subtitle="Enter details to attach a line item to an order."
      submitLabel="Save Order Item"
      loadOptions={loadOptions}
      sections={[
        {
          title: 'Relations',
          description: 'Link the line item to a product and an order.',
          icon: Link2,
          fields: [
            {
              name: 'productId',
              label: 'Product',
              type: 'select',
              required: true,
              options: products.map((product) => ({
                value: String(product.id),
                label: product.name,
              })),
            },
            {
              name: 'orderId',
              label: 'Order',
              type: 'select',
              required: true,
              options: orders.map((order) => ({
                value: String(order.id),
                label: order.orderNumber,
              })),
            },
          ],
        },
        {
          title: 'Pricing',
          description: 'Quantity and price details.',
          icon: DollarSign,
          fields: [
            {
              name: 'quantity',
              label: 'Quantity',
              type: 'number',
              placeholder: 'e.g. 2',
              min: 1,
              required: true,
            },
            {
              name: 'unitPrice',
              label: 'Unit Price (USD)',
              type: 'number',
              placeholder: 'e.g. 4.50',
              min: 0,
              step: '0.01',
              required: true,
            },
            {
              name: 'subtotal',
              label: 'Subtotal (USD)',
              type: 'number',
              placeholder: 'e.g. 9.00',
              min: 0,
              step: '0.01',
              required: true,
              spanFull: true,
            },
          ],
        },
      ]}
      onSubmit={handleSubmit}
    />
  );
};

export default CreateOrderItemPage;