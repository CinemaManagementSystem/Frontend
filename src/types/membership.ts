import type { Payment } from './payment';

export type MembershipStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
export type MembershipBenefitType =
  | 'TICKET_DISCOUNT'
  | 'FOOD_DISCOUNT'
  | 'FREE_TICKET'
  | 'PRIORITY_BOOKING'
  | 'POINT_MULTIPLIER'
  | 'LOUNGE_ACCESS';

export interface MembershipBenefit {
  id?: string;
  benefitType: MembershipBenefitType;
  value: number;
  monthlyLimit?: number | null;
  active?: boolean;
}

export interface MembershipPlan {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  price: number;
  durationMonths: number;
  active: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
  benefits: MembershipBenefit[];
}

export interface MembershipPlanInput {
  name: string;
  code: string;
  description?: string;
  price: number;
  durationMonths: number;
  active: boolean;
  sortOrder: number;
  benefits: MembershipBenefit[];
}

export interface UserMembership {
  id: string;
  customerId: number;
  planId: string;
  planName: string;
  planCode: string;
  status: MembershipStatus;
  priceSnapshot: number;
  durationMonthsSnapshot: number;
  startedAt: string | null;
  expiresAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  paymentId: number | null;
}

export interface MembershipUsage {
  id: string;
  userMembershipId: string;
  benefitType: MembershipBenefitType;
  usagePeriod: string;
  sourceType: string;
  sourceId: number;
  discountAmount: number;
  createdAt: string;
}

export interface MembershipSubscribeResponse {
  membership: UserMembership;
  payment: Payment;
}
