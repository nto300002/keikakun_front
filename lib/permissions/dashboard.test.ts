import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildBillingRestrictionWarning,
  canEditDashboard,
  removeRecipientFromDashboardData,
} from './dashboard';
import type { DashboardData } from '../../types/dashboard';
import type { BillingStatusResponse } from '../../types/billing';
import type { StaffResponse } from '../../types/staff';
import { BillingStatus, StaffRole, SupportPlanStep } from '../../types/enums';

const baseStaff: StaffResponse = {
  id: 'staff-1',
  first_name: '太郎',
  last_name: '山田',
  full_name: '山田 太郎',
  email: 'test@example.com',
  role: StaffRole.MANAGER,
  is_mfa_enabled: true,
  is_deleted: false,
  deleted_at: null,
};

const baseBilling: BillingStatusResponse = {
  billing_status: BillingStatus.ACTIVE,
  trial_end_date: '2026-07-01T00:00:00Z',
  next_billing_date: null,
  current_plan_amount: 6000,
  subscription_start_date: null,
  scheduled_cancel_at: null,
  trial_days_remaining: null,
};

test('canEditDashboard requires MFA and writable billing status', () => {
  assert.equal(canEditDashboard(baseStaff, baseBilling), true);
  assert.equal(canEditDashboard({ ...baseStaff, is_mfa_enabled: false }, baseBilling), false);
  assert.equal(canEditDashboard(baseStaff, { ...baseBilling, billing_status: BillingStatus.TRIAL_EXPIRED }), false);
  assert.equal(canEditDashboard(null, baseBilling), false);
  assert.equal(canEditDashboard(baseStaff, null), false);
});

test('buildBillingRestrictionWarning maps restricted billing status to dashboard copy', () => {
  assert.equal(buildBillingRestrictionWarning(baseBilling), null);
  assert.deepEqual(
    buildBillingRestrictionWarning({ ...baseBilling, billing_status: BillingStatus.PAYMENT_FAILED }),
    {
      title: '有料会員料金のお支払いが失敗しているため利用できません',
      body: '新規作成・編集・削除などの操作はご利用いただけません。オーナーの方は管理者設定の有料会員ページから支払い方法を更新してください。',
    }
  );
});

test('removeRecipientFromDashboardData removes a recipient without mutating source data', () => {
  const data: DashboardData = {
    staff_name: '山田 太郎',
    staff_role: StaffRole.MANAGER,
    office_id: 'office-1',
    office_name: '事業所',
    current_user_count: 2,
    filtered_count: 2,
    max_user_count: 20,
    billing_status: BillingStatus.ACTIVE,
    recipients: [
      {
        id: 'recipient-1',
        full_name: '利用 一郎',
        last_name: '利用',
        current_cycle_number: 1,
        latest_step: SupportPlanStep.ASSESSMENT,
        next_renewal_deadline: null,
        monitoring_due_date: null,
        next_plan_start_date: null,
        next_plan_start_days_remaining: null,
      },
      {
        id: 'recipient-2',
        full_name: '利用 二郎',
        last_name: '利用',
        current_cycle_number: 1,
        latest_step: SupportPlanStep.MONITORING,
        next_renewal_deadline: null,
        monitoring_due_date: null,
        next_plan_start_date: null,
        next_plan_start_days_remaining: null,
      },
    ],
  };

  const next = removeRecipientFromDashboardData(data, 'recipient-1');

  assert.deepEqual(next?.recipients.map((recipient) => recipient.id), ['recipient-2']);
  assert.deepEqual(data.recipients.map((recipient) => recipient.id), ['recipient-1', 'recipient-2']);
  assert.equal(removeRecipientFromDashboardData(null, 'recipient-1'), null);
});
