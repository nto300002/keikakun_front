'use client';

interface FilterState {
  isOverdue: boolean;
  isUpcoming: boolean;
  hasAssessmentDue: boolean;
  status: string | null;
}

interface ActiveFiltersProps {
  activeFilters: FilterState;
  searchTerm: string;
  onFilterRemove: (filterKey: string) => void;
  onClearAll: () => void;
}

/**
 * 選択中のフィルター条件をチップ形式で表示するコンポーネント
 * 各チップから個別に条件を解除でき、「すべてクリア」で一括解除も可能
 * UI設計意図: 小さなチップを避け、text-sm以上と広めの解除ボタンで視認性と押しやすさを確保する。
 */
export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  activeFilters,
  searchTerm,
  onFilterRemove,
  onClearAll
}) => {
  // アクティブなフィルターが1つでもあるかチェック
  const hasActiveFilters =
    searchTerm ||
    activeFilters.isOverdue ||
    activeFilters.isUpcoming ||
    activeFilters.hasAssessmentDue ||
    activeFilters.status;

  // フィルターが何もない場合は表示しない
  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-3 mb-4 border border-slate-300 shadow-sm animate-in slide-in-from-top-2 duration-200 dark:bg-[#1a1f2e]/60 dark:border-[#2a3441]">
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-slate-700 text-base font-semibold mr-1 dark:text-gray-300">絞り込み中:</span>

        {/* 検索ワード */}
        {searchTerm && (
          <FilterChip
            label={`検索: "${searchTerm}"`}
            onRemove={() => onFilterRemove('search')}
          />
        )}

        {/* 計画期限超過 */}
        {activeFilters.isOverdue && (
          <FilterChip
            label="計画期限超過"
            onRemove={() => onFilterRemove('isOverdue')}
            color="red"
          />
        )}

        {/* 計画期限間近 */}
        {activeFilters.isUpcoming && (
          <FilterChip
            label="計画期限間近（30日以内）"
            onRemove={() => onFilterRemove('isUpcoming')}
            color="yellow"
          />
        )}

        {/* アセスメント開始期限あり */}
        {activeFilters.hasAssessmentDue && (
          <FilterChip
            label="アセスメント開始期限あり"
            onRemove={() => onFilterRemove('hasAssessmentDue')}
            color="blue"
          />
        )}

        {/* 状態 */}
        {activeFilters.status && (
          <FilterChip
            label={`状態: ${getStatusLabel(activeFilters.status)}`}
            onRemove={() => onFilterRemove('status')}
            color="purple"
          />
        )}

        {/* すべてクリアボタン */}
        <button
          onClick={onClearAll}
          className="ml-auto min-h-[40px] text-sm font-semibold text-slate-700 bg-transparent hover:text-slate-950 transition-colors duration-150 border border-slate-400 hover:border-slate-600 rounded px-3 py-1.5 dark:text-gray-200 dark:hover:text-white dark:border-gray-500 dark:hover:border-gray-300"
        >
          すべてクリア
        </button>
      </div>
    </div>
  );
};

/**
 * 個別のフィルターチップコンポーネント
 */
interface FilterChipProps {
  label: string;
  onRemove: () => void;
  color?: 'blue' | 'red' | 'yellow' | 'purple';
}

const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove, color = 'blue' }) => {
  const colorStyles = {
    blue: 'bg-cyan-50 text-cyan-800 border-cyan-300 dark:bg-gray-200 dark:text-[#00bcd4] dark:border-[#00bcd4]/30',
    red: 'bg-orange-50 text-orange-800 border-orange-300 dark:bg-gray-200 dark:text-[#ff9800] dark:border-[#ff9800]/30',
    yellow: 'bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-gray-200 dark:text-[#b88700] dark:border-[#ffd700]/30',
    purple: 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-gray-200 dark:text-[#9c27b0] dark:border-[#9c27b0]/30',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 min-h-[36px] rounded-md border text-sm font-semibold ${colorStyles[color]} transition-all duration-150 hover:brightness-110`}>
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="min-h-[32px] min-w-[32px] hover:text-slate-950 transition-colors duration-150 dark:hover:text-white"
        aria-label={`${label} フィルターを解除`}
        title="解除"
      >
        ×
      </button>
    </div>
  );
};

/**
 * 状態の表示名を取得
 */
function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    'assessment': 'アセスメント',
    'draft_plan': '個別原案',
    'staff_meeting': '担当者会議',
    'monitoring': 'モニタリング',
    'final_plan_signed': '個別本署名済',
  };
  return statusLabels[status] || status;
}
