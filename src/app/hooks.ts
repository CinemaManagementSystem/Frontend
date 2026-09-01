import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Pre-typed hooks. Use these instead of useDispatch/useSelector directly.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();