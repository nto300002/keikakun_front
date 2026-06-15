'use client';

import { RoleChangeRequest, RequestStatus } from '@/types/roleChangeRequest';
import { EmployeeActionRequest, ActionType, ResourceType } from '@/types/employeeActionRequest';
import { StaffRole } from '@/types/enums';

type Request = RoleChangeRequest | EmployeeActionRequest;

interface RequestCardProps {
  request: Request;
  type: 'role_change' | 'employee_action';
  onDelete?: (requestId: string, type: 'role_change' | 'employee_action') => void;
}

// Roleのラベルマップ
const roleLabels: Record<StaffRole, string> = {
  owner: '管理者',
  manager: 'マネージャー',
  employee: '従業員',
};

// ActionTypeのラベルマップ
const actionTypeLabels: Record<ActionType, string> = {
  create: '作成',
  update: '更新',
  delete: '削除',
};

// ResourceTypeのラベルマップ
const resourceTypeLabels: Record<ResourceType, string> = {
  welfare_recipient: '利用者',
  support_plan_cycle: '計画サイクル',
  support_plan_status: '計画ステータス',
};

export default function RequestCard({ request, type, onDelete }: RequestCardProps) {
  console.log('[DEBUG REQUEST_CARD] Rendering card for request:', {
    type,
    id: request.id,
    status: request.status,
    request,
  });

  // ステータスに応じたスタイルとアイコン
  const getStatusStyle = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.APPROVED:
        return {
          icon: '✓',
          label: '承認済み',
          bgColor: 'bg-green-50 dark:bg-green-900/30',
          borderColor: 'border-green-200 dark:border-green-700/50',
          textColor: 'text-green-700 dark:text-green-400',
        };
      case RequestStatus.REJECTED:
        return {
          icon: '✗',
          label: '却下済み',
          bgColor: 'bg-red-50 dark:bg-red-900/30',
          borderColor: 'border-red-200 dark:border-red-700/50',
          textColor: 'text-red-700 dark:text-red-400',
        };
      case RequestStatus.PENDING:
        return {
          icon: '⏱',
          label: '承認待ち',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-200 dark:border-yellow-700/50',
          textColor: 'text-yellow-800 dark:text-yellow-400',
        };
      default:
        return {
          icon: 'ℹ',
          label: '不明',
          bgColor: 'bg-blue-50 dark:bg-blue-900/30',
          borderColor: 'border-blue-200 dark:border-blue-700/50',
          textColor: 'text-blue-700 dark:text-blue-700 dark:text-blue-400',
        };
    }
  };

  const statusStyle = getStatusStyle(request.status);

  // Role変更リクエストの内容をレンダリング
  const renderRoleChangeContent = (req: RoleChangeRequest) => (
    <>
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{statusStyle.icon}</span>
          <div>
            <h3 className={`text-lg font-bold ${statusStyle.textColor}`}>
              権限変更リクエスト
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-500">Role Change Request</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* 変更内容 */}
        <div className="bg-white/70 dark:bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-slate-600 dark:text-gray-400 mb-2">変更内容</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-gray-500">現在</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-800 dark:bg-gray-700/70 dark:text-white text-sm font-medium">
                {roleLabels[req.from_role]}
              </span>
            </div>
            <svg className="w-5 h-5 text-slate-500 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-gray-500">希望</span>
              <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium">
                {roleLabels[req.requested_role]}
              </span>
            </div>
          </div>
        </div>

        {/* 申請理由 */}
        {req.request_notes && (
          <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/30 rounded-lg p-3">
            <p className="text-xs text-blue-700 dark:text-blue-400 mb-1 font-semibold">申請理由</p>
            <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">{req.request_notes}</p>
          </div>
        )}

        {/* 承認者/却下者のメモ */}
        {req.reviewer_notes && (
          <div className={`${
            request.status === RequestStatus.APPROVED
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700/30'
              : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700/30'
          } border rounded-lg p-3`}>
            <p className={`text-xs mb-1 font-semibold ${
              request.status === RequestStatus.APPROVED ? 'text-green-400' : 'text-red-400'
            }`}>
              {request.status === RequestStatus.APPROVED ? '承認者メモ' : '却下理由'}
            </p>
            <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">{req.reviewer_notes}</p>
          </div>
        )}
      </div>
    </>
  );

  // Employee制限リクエストの内容をレンダリング
  const renderEmployeeActionContent = (req: EmployeeActionRequest) => (
    <>
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{statusStyle.icon}</span>
          <div>
            <h3 className={`text-lg font-bold ${statusStyle.textColor}`}>
              {resourceTypeLabels[req.resource_type]}の{actionTypeLabels[req.action_type]}リクエスト
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-500">Employee Action Request</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* 操作内容 */}
        <div className="bg-white/70 dark:bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-slate-600 dark:text-gray-400 mb-2">操作内容</p>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-gray-500">操作</span>
              <span className="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-sm font-medium">
                {actionTypeLabels[req.action_type]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-gray-500">対象</span>
              <span className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm font-medium">
                {resourceTypeLabels[req.resource_type]}
              </span>
            </div>
            {req.resource_id && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-gray-500">ID</span>
                <span className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-xs font-mono dark:bg-gray-700/70 dark:text-gray-300">
                  #{req.resource_id}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* リクエストデータ */}
        {req.request_data && Object.keys(req.request_data).length > 0 && (
          <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/30 rounded-lg p-3">
            <p className="text-xs text-blue-700 dark:text-blue-400 mb-2 font-semibold">変更データ</p>
            <div className="space-y-1">
              {Object.entries(req.request_data).map(([key, value]) => (
                <div key={key} className="flex items-start gap-2 text-sm">
                  <span className="text-slate-600 dark:text-gray-400 min-w-[100px]">{key}:</span>
                  <span className="text-slate-700 dark:text-gray-300 flex-1 break-words">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 承認者/却下者のメモ */}
        {req.approver_notes && (
          <div className={`${
            request.status === RequestStatus.APPROVED
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700/30'
              : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700/30'
          } border rounded-lg p-3`}>
            <p className={`text-xs mb-1 font-semibold ${
              request.status === RequestStatus.APPROVED ? 'text-green-400' : 'text-red-400'
            }`}>
              {request.status === RequestStatus.APPROVED ? '承認者メモ' : '却下理由'}
            </p>
            <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">{req.approver_notes}</p>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div
      className={`${statusStyle.bgColor} border ${statusStyle.borderColor} rounded-lg p-4 mb-3`}
    >
      {type === 'role_change'
        ? renderRoleChangeContent(request as RoleChangeRequest)
        : renderEmployeeActionContent(request as EmployeeActionRequest)}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-gray-700/50">
        <div className="text-xs text-slate-500 dark:text-gray-500">
          <div>申請日時: {new Date(request.created_at).toLocaleString('ja-JP')}</div>
          {request.status !== RequestStatus.PENDING &&
            (type === 'role_change'
              ? (request as RoleChangeRequest).reviewed_at
              : (request as EmployeeActionRequest).approved_at) && (
              <div>
                処理日時:{' '}
                {new Date(
                  type === 'role_change'
                    ? (request as RoleChangeRequest).reviewed_at!
                    : (request as EmployeeActionRequest).approved_at!
                ).toLocaleString('ja-JP')}
              </div>
            )}
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle.textColor}`}>
            {statusStyle.label}
          </span>

          {/* 削除ボタン（承認待ちの場合のみ） */}
          {request.status === RequestStatus.PENDING && onDelete && (
            <button
              onClick={() => onDelete(request.id, type)}
              className="text-red-700 hover:text-red-800 text-xs px-3 py-1 rounded border border-red-300 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:border-red-700/50 dark:hover:bg-red-900/20"
            >
              取り消し
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
