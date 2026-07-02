'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
export type DashboardSortOrder = 'asc' | 'desc';
export type DashboardFilterKey = 'isOverdue' | 'isUpcoming' | 'hasAssessmentDue';

export interface DashboardParams {
  sortBy?: string;
  sortOrder?: DashboardSortOrder;
  searchTerm?: string;
  is_overdue?: boolean;
  is_upcoming?: boolean;
  has_assessment_due?: boolean;
  status?: string;
  cycle_number?: number;
  skip?: number;
  limit?: number;
}

export interface DashboardFilterState {
  isOverdue: boolean;
  isUpcoming: boolean;
  hasAssessmentDue: boolean;
  status: string | null;
}

interface UseDashboardFiltersOptions {
  initialDeadlineAlert?: boolean;
  onApplyFilters: (params: DashboardParams) => void;
}

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilterState = {
  isOverdue: false,
  isUpcoming: false,
  hasAssessmentDue: false,
  status: null,
};

export function buildDashboardParams(
  searchTerm: string,
  sortBy: string,
  sortOrder: DashboardSortOrder,
  filters: DashboardFilterState,
  overrides: Partial<DashboardParams> = {}
): DashboardParams {
  return {
    searchTerm,
    sortBy,
    sortOrder,
    is_overdue: filters.isOverdue,
    is_upcoming: filters.isUpcoming,
    has_assessment_due: filters.hasAssessmentDue,
    status: filters.status || undefined,
    ...overrides,
  };
}

export function getNextDashboardSortOrder(
  currentSortBy: string,
  currentSortOrder: DashboardSortOrder,
  targetSortBy: string
): DashboardSortOrder {
  return currentSortBy === targetSortBy && currentSortOrder === 'asc' ? 'desc' : 'asc';
}

export function getDashboardSortButtonLabel(
  currentSortBy: string,
  currentSortOrder: DashboardSortOrder,
  targetSortBy: string
) {
  if (currentSortBy !== targetSortBy) return '昇順';
  return currentSortOrder === 'asc' ? '降順' : '昇順';
}

export function hasDashboardFilter(searchTerm: string, filters: DashboardFilterState) {
  return (
    Boolean(searchTerm) ||
    filters.isOverdue ||
    filters.isUpcoming ||
    filters.hasAssessmentDue ||
    Boolean(filters.status)
  );
}

export function useDashboardFilters({
  initialDeadlineAlert = false,
  onApplyFilters,
}: UseDashboardFiltersOptions) {
  const [sortOrder, setSortOrder] = useState<DashboardSortOrder>('asc');
  const [sortBy, setSortBy] = useState('next_renewal_deadline');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<DashboardFilterState>(
    initialDeadlineAlert
      ? { ...DEFAULT_DASHBOARD_FILTERS, isUpcoming: true }
      : DEFAULT_DASHBOARD_FILTERS
  );

  const buildParams = useCallback(
    (
      nextSearchTerm = searchTerm,
      nextSortBy = sortBy,
      nextSortOrder = sortOrder,
      nextFilters = activeFilters,
      overrides: Partial<DashboardParams> = {}
    ) =>
      buildDashboardParams(
        nextSearchTerm,
        nextSortBy,
        nextSortOrder,
        nextFilters,
        overrides
      ),
    [activeFilters, searchTerm, sortBy, sortOrder]
  );

  const handleNextRenewalSortClick = useCallback(() => {
    const nextSortBy = 'next_renewal_deadline';
    const nextSortOrder = getNextDashboardSortOrder(sortBy, sortOrder, nextSortBy);
    setSortBy(nextSortBy);
    setSortOrder(nextSortOrder);
    onApplyFilters(buildParams(searchTerm, nextSortBy, nextSortOrder, activeFilters));
  }, [activeFilters, buildParams, onApplyFilters, searchTerm, sortBy, sortOrder]);

  const handleNameSortClick = useCallback(() => {
    const nextSortBy = 'name_phonetic';
    const nextSortOrder = getNextDashboardSortOrder(sortBy, sortOrder, nextSortBy);
    setSortBy(nextSortBy);
    setSortOrder(nextSortOrder);
    onApplyFilters(buildParams(searchTerm, nextSortBy, nextSortOrder, activeFilters));
  }, [activeFilters, buildParams, onApplyFilters, searchTerm, sortBy, sortOrder]);

  const getSortButtonLabel = useCallback(
    (targetSortBy: string) =>
      getDashboardSortButtonLabel(sortBy, sortOrder, targetSortBy),
    [sortBy, sortOrder]
  );

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleFilterToggle = useCallback(
    (filterType: DashboardFilterKey, value: boolean) => {
      setActiveFilters((prev) => {
        const nextFilters = { ...prev, [filterType]: value };
        onApplyFilters(buildParams(searchTerm, sortBy, sortOrder, nextFilters));
        return nextFilters;
      });
    },
    [buildParams, onApplyFilters, searchTerm, sortBy, sortOrder]
  );

  const handleStatusFilter = useCallback(
    (status: string | null) => {
      setActiveFilters((prev) => {
        const nextFilters = { ...prev, status };
        onApplyFilters(buildParams(searchTerm, sortBy, sortOrder, nextFilters));
        return nextFilters;
      });
    },
    [buildParams, onApplyFilters, searchTerm, sortBy, sortOrder]
  );

  const handleFilterRemove = useCallback(
    (filterKey: string) => {
      if (filterKey === 'search') {
        setSearchTerm('');
        setDebouncedSearchTerm('');
        return;
      }

      setActiveFilters((prev) => {
        const nextFilters = { ...prev };
        if (filterKey === 'status') {
          nextFilters.status = null;
        } else {
          (nextFilters as Record<string, unknown>)[filterKey] = false;
        }
        onApplyFilters(buildParams(searchTerm, sortBy, sortOrder, nextFilters));
        return nextFilters;
      });
    },
    [buildParams, onApplyFilters, searchTerm, sortBy, sortOrder]
  );

  const handleClearAllFilters = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setActiveFilters(DEFAULT_DASHBOARD_FILTERS);
    onApplyFilters(buildParams('', sortBy, sortOrder, DEFAULT_DASHBOARD_FILTERS));
  }, [buildParams, onApplyFilters, sortBy, sortOrder]);

  const resetFiltersForDisplayReset = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSortBy('name_phonetic');
    setSortOrder('asc');
    setActiveFilters(DEFAULT_DASHBOARD_FILTERS);
  }, []);

  const hasActiveDashboardFilter = useMemo(
    () => hasDashboardFilter(searchTerm, activeFilters),
    [activeFilters, searchTerm]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return;
    if (debouncedSearchTerm) {
      onApplyFilters(buildParams(debouncedSearchTerm));
    }
  }, [buildParams, debouncedSearchTerm, onApplyFilters, searchTerm]);

  return {
    activeFilters,
    searchTerm,
    sortBy,
    sortOrder,
    hasActiveDashboardFilter,
    handleNextRenewalSortClick,
    handleNameSortClick,
    getSortButtonLabel,
    handleSearch,
    handleFilterToggle,
    handleStatusFilter,
    handleFilterRemove,
    handleClearAllFilters,
    resetFiltersForDisplayReset,
  };
}
