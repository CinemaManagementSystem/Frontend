import { createCrudResource, createResourceHook } from './crudSlice';
import { orderItemService } from '@/services/orderItemService';
import type { OrderItem, OrderItemInput } from '@/types/orderItem';
import type { RootState } from '@/app/store';

export const {
  slice: orderItemSlice,
  fetchAll: fetchOrderItems,
  create: createOrderItem,
  update: updateOrderItem,
  remove: removeOrderItem,
} = createCrudResource<OrderItem, OrderItemInput>('orderItem', orderItemService);

export const useOrderItemsResource = createResourceHook<OrderItem, OrderItemInput>(
  (state: RootState) => state.orderItem,
  { fetchAll: fetchOrderItems, create: createOrderItem, update: updateOrderItem, remove: removeOrderItem },
);

export const orderItemReducer = orderItemSlice.reducer;