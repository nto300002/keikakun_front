import { useState, useEffect } from 'react';
import { authApi } from '@/lib/auth';
import { StaffResponse } from '@/types/staff';

/**
 * 現在のユーザーの権限情報を取得するカスタムフック
 */
export function useStaffRole() {
  const [staff, setStaff] = useState<StaffResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setIsLoading(true);
        const userData = await authApi.getCurrentUser();
        setStaff(userData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch staff data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch staff data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, []);

  return {
    staff,
    isLoading,
    error,
    isEmployee: staff?.role === 'employee',
    isManager: staff?.role === 'manager',
    isOwner: staff?.role === 'owner',
    canApproveRequests: staff?.role === 'manager' || staff?.role === 'owner',
  };
}
