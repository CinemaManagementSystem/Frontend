import { createCrudResource, createResourceHook } from './crudSlice';
import { orderService } from '@/services/orderService';
import type { Order, OrderInput } from '@/types/order';
import type { RootState } from '@/app/store';

export const {
  slice: orderSlice,
  fetchAll: fetchOrders,
  create: createOrder,
  update: updateOrder,
  remove: removeOrder,
} = createCrudResource<Order, OrderInput>('order', orderService);

export const useOrdersResource = createResourceHook<Order, OrderInput>(
  (state: RootState) => state.order,
  { fetchAll: fetchOrders, create: createOrder, update: updateOrder, remove: removeOrder },
);

export const orderReducer = orderSlice.reducer;