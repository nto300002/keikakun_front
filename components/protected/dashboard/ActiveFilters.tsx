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
    <div className="bg-[#1a1f2e]/60 rounded-lg p-3 mb-4 border border-[#2a3441] animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-gray-300 text-sm font-medium mr-1">絞り込み中:</span>

        {/* 検索ワード */}
        {searchTerm && (
          <FilterChip
            label={`検索: "${searchTerm}"`}
            onRemove={() => onFilterRemove('search')}
          />
        )}

        {/* 計画期限切れ */}
        {activeFilters.isOverdue && (
          <FilterChip
            label="計画期限切れ"
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

        {/* ステータス */}
        {activeFilters.status && (
          <FilterChip
            label={`ステータス: ${getStatusLabel(activeFilters.status)}`}
            onRemove={() => onFilterRemove('status')}
            color="purple"
          />
        )}

        {/* すべてクリアボタン */}
        <button
          onClick={onClearAll}
          className="ml-auto text-xs text-gray-400 bg-gray-200 hover:text-white transition-colors duration-150 border border-gray-600 hover:border-gray-400 rounded px-2 py-1"
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
    blue: 'bg-gray-200 text-[#00bcd4] border-[#00bcd4]/30',
    red: 'bg-gray-200 text-[#ff9800] border-[#ff9800]/30',
    yellow: 'bg-gray-200 text-[#ffd700] border-[#ffd700]/30',
    purple: 'bg-gray-200 text-[#9c27b0] border-[#9c27b0]/30',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${colorStyles[color]} transition-all duration-150 hover:brightness-110`}>
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:text-white transition-colors duration-150"
        aria-label={`${label} フィルターを解除`}
        title="解除"
      >
        ×
      </button>
    </div>
  );
};

/**
 * ステータスの表示名を取得
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
