'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { authApi } from '../../lib/auth';
import { billingApi } from '../../lib/api/billing';
import { dashboardApi, type DashboardParams } from '../../lib/dashboard';
import { welfareRecipientsApi } from '../../lib/welfare-recipients';
import { removeRecipientFromDashboardData } from '../../lib/permissions/dashboard';
import { normalizeDashboardData } from './dashboardDataState';
import type { BillingStatusResponse } from '../../types/billing';
import type { DashboardData } from '../../types/dashboard';
import type { StaffResponse } from '../../types/staff';

export function useDashboardData() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [staff, setStaff] = useState<StaffResponse | null>(null);
  const [billingStatus, setBillingStatus] = useState<BillingStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(isLoading);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const applyFilters = useCallback(async (filterParams: DashboardParams = {}) => {
    if (isLoadingRef.current) return;

    try {
      setIsLoading(true);
      const newDashboardData = await dashboardApi.getDashboardData(filterParams);
      setDashboardData(normalizeDashboardData(newDashboardData));
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      const [userData, data, billing] = await Promise.all([
        authApi.getCurrentUser(),
        dashboardApi.getDashboardData(),
        billingApi.getBillingStatus(),
      ]);
      setStaff(userData);
      setDashboardData(normalizeDashboardData(data));
      setBillingStatus(billing);
    } catch {
    }
  }, []);

  const resetDashboardData = useCallback(async () => {
    if (isLoadingRef.current) return;

    try {
      setIsLoading(true);
      const resetData = await dashboardApi.getDashboardData();
      setDashboardData(normalizeDashboardData(resetData));
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteRecipient = useCallback(async (recipientId: string) => {
    try {
      setIsLoading(true);
      await welfareRecipientsApi.delete(recipientId);
      setDashboardData((prevData) =>
        removeRecipientFromDashboardData(prevData, recipientId)
      );
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    dashboardData,
    staff,
    billingStatus,
    isLoading,
    isLoadingRef,
    applyFilters,
    fetchInitialData,
    resetDashboardData,
    deleteRecipient,
  };
}
