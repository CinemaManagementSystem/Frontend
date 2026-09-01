import { useCallback } from 'react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { AsyncThunk, AsyncThunkAction, AsyncThunkConfig, ThunkAction, AnyAction } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import type { RootState } from '@/app/store';

type AppThunkAction = ThunkAction<Promise<unknown>, RootState, undefined, AnyAction>;
type ThunkCallable<A> = (arg: A) => AsyncThunkAction<unknown, A, AsyncThunkConfig>;

export interface CrudListState<T> {
  items: T[];
  loading: boolean;
}

export interface CrudService<I> {
  list: () => Promise<unknown[]>;
  create: (payload: I) => Promise<unknown>;
  update: (id: number, payload: I) => Promise<unknown>;
  remove: (id: number) => Promise<void>;
}

export interface ResourceThunks<I> {
  fetchAll: AsyncThunk<unknown[], void, Record<string, unknown>>;
  create: AsyncThunk<void, I, Record<string, unknown>>;
  update: AsyncThunk<void, { id: number; payload: I }, Record<string, unknown>>;
  remove: AsyncThunk<void, number, Record<string, unknown>>;
}

/**
 * Generates a standard Redux slice + async thunks for a CRUD resource backed
 * by a feature service. Mutations re-fetch the list afterwards (mirrors the
 * previous Zustand pattern: `await get().fetchAll()`).
 */
export function createCrudResource<T, I>(name: string, service: CrudService<I>) {
  const fetchAll = createAsyncThunk(`${name}/fetchAll`, async () => service.list());

  const create = createAsyncThunk(
    `${name}/create`,
    async (payload: I, { dispatch }) => {
      await service.create(payload);
      await dispatch(fetchAll());
    },
  );

  const update = createAsyncThunk(
    `${name}/update`,
    async (args: { id: number; payload: I }, { dispatch }) => {
      await service.update(args.id, args.payload);
      await dispatch(fetchAll());
    },
  );

  const remove = createAsyncThunk(
    `${name}/remove`,
    async (id: number, { dispatch }) => {
      await service.remove(id);
      await dispatch(fetchAll());
    },
  );

  const initialState: CrudListState<T> = { items: [] as T[], loading: false };

  const slice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchAll.pending, (state) => {
          state.loading = true;
        })
        .addCase(fetchAll.fulfilled, (state, action) => {
          state.items = action.payload as typeof state.items;
          state.loading = false;
        })
        .addCase(fetchAll.rejected, (state) => {
          state.loading = false;
        });
    },
  });

  return { slice, fetchAll, create, update, remove };
}

/**
 * Builds a React hook exposing the same ergonomic API as the old Zustand
 * stores (`{ items, loading, fetchAll, create, update, remove }`) backed by
 * Redux dispatch. All callbacks are memoized so they stay referentially stable.
 */
export function createResourceHook<T, I>(selectState: (state: RootState) => CrudListState<T>, thunks: ResourceThunks<I>) {
  return function useResource() {
    const dispatch = useAppDispatch();
    const { items, loading } = useAppSelector(selectState);
    const fetchAll = useCallback(
      () =>
        dispatch((thunks.fetchAll as unknown as ThunkCallable<void>)() as AppThunkAction),
      [dispatch],
    );
    const create = useCallback(
      (payload: I) =>
        dispatch((thunks.create as unknown as ThunkCallable<I>)(payload) as AppThunkAction),
      [dispatch],
    );
    const update = useCallback(
      (id: number, payload: I) =>
        dispatch(
          (thunks.update as unknown as ThunkCallable<{ id: number; payload: I }>)({ id, payload }) as AppThunkAction,
        ),
      [dispatch],
    );
    const remove = useCallback(
      (id: number) =>
        dispatch((thunks.remove as unknown as ThunkCallable<number>)(id) as AppThunkAction),
      [dispatch],
    );
    return { items, loading, fetchAll, create, update, remove };
  };
}