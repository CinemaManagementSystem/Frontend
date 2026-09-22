import { apiClient } from './apiClient';
import type {
  MembershipPlan,
  MembershipPlanInput,
  MembershipSubscribeResponse,
  MembershipUsage,
  UserMembership,
} from '@/types/membership';

export const membershipService = {
  async getPlans(): Promise<MembershipPlan[]> {
    const { data } = await apiClient.get<MembershipPlan[]>('/memberships/plans');
    return data;
  },

  async subscribe(planId: string): Promise<MembershipSubscribeResponse> {
    const { data } = await apiClient.post<MembershipSubscribeResponse>(`/memberships/plans/${planId}/subscribe`);
    return data;
  },

  async getMyMembership(): Promise<UserMembership | null> {
    const { data } = await apiClient.get<UserMembership | null>('/memberships/me');
    return data;
  },

  async getMyHistory(): Promise<UserMembership[]> {
    const { data } = await apiClient.get<UserMembership[]>('/memberships/me/history');
    return data;
  },

  async getMyUsage(): Promise<MembershipUsage[]> {
    const { data } = await apiClient.get<MembershipUsage[]>('/memberships/me/usage');
    return data;
  },

  async cancelMine(membershipId: string): Promise<UserMembership> {
    const { data } = await apiClient.delete<UserMembership>(`/memberships/me/${membershipId}`);
    return data;
  },

  async adminPlans(): Promise<MembershipPlan[]> {
    const { data } = await apiClient.get<MembershipPlan[]>('/admin/memberships/plans');
    return data;
  },

  async createPlan(payload: MembershipPlanInput): Promise<MembershipPlan> {
    const { data } = await apiClient.post<MembershipPlan>('/admin/memberships/plans', payload);
    return data;
  },

  async updatePlan(id: string, payload: MembershipPlanInput): Promise<MembershipPlan> {
    const { data } = await apiClient.put<MembershipPlan>(`/admin/memberships/plans/${id}`, payload);
    return data;
  },

  async deletePlan(id: string): Promise<void> {
    await apiClient.delete(`/admin/memberships/plans/${id}`);
  },

  async adminMembers(): Promise<UserMembership[]> {
    const { data } = await apiClient.get<UserMembership[]>('/admin/memberships/members');
    return data;
  },

  async cancelMember(id: string): Promise<UserMembership> {
    const { data } = await apiClient.post<UserMembership>(`/admin/memberships/members/${id}/cancel`);
    return data;
  },

  async extendMember(id: string, months: number): Promise<UserMembership> {
    const { data } = await apiClient.post<UserMembership>(`/admin/memberships/members/${id}/extend`, { months });
    return data;
  },
};
