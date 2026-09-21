import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { membershipService } from '@/services/membershipService';
import type { MembershipPlan, MembershipUsage, UserMembership } from '@/types/membership';

interface MembershipState {
  plans: MembershipPlan[];
  current: UserMembership | null;
  history: UserMembership[];
  usage: MembershipUsage[];
  loading: boolean;
  error: string | null;
}

const initialState: MembershipState = {
  plans: [],
  current: null,
  history: [],
  usage: [],
  loading: false,
  error: null,
};

export const fetchMembershipPlans = createAsyncThunk('membership/fetchPlans', membershipService.getPlans);
export const fetchMyMembership = createAsyncThunk('membership/fetchMine', async () => {
  const [current, history, usage] = await Promise.all([
    membershipService.getMyMembership(),
    membershipService.getMyHistory(),
    membershipService.getMyUsage(),
  ]);
  return { current, history, usage };
});

const membershipSlice = createSlice({
  name: 'membership',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembershipPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembershipPlans.fulfilled, (state, action) => {
        state.plans = action.payload;
        state.loading = false;
      })
      .addCase(fetchMembershipPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Unable to load memberships';
      })
      .addCase(fetchMyMembership.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyMembership.fulfilled, (state, action) => {
        state.current = action.payload.current;
        state.history = action.payload.history;
        state.usage = action.payload.usage;
        state.loading = false;
      })
      .addCase(fetchMyMembership.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Unable to load membership';
      });
  },
});

export const membershipReducer = membershipSlice.reducer;
