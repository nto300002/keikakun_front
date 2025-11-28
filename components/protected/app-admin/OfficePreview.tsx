'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { appAdminApi } from '@/lib/api/appAdmin';
import { OfficeDetailResponse } from '@/types/office';
import { FaArrowLeft, FaBuilding, FaUsers, FaCheckCircle, FaTimesCircle, FaShieldAlt } from 'react-icons/fa';

interface OfficePreviewProps {
  officeId: string;
}

export default function OfficePreview({ officeId }: OfficePreviewProps) {
  const [office, setOffice] = useState<OfficeDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOffice = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await appAdminApi.getOffice(officeId);
        setOffice(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '事務所の取得に失敗しました';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOffice();
  }, [officeId]);

  const getOfficeTypeName = (type: string) => {
    switch (type) {
      case 'transition_to_employment':
        return '移行支援';
      case 'type_A_office':
        return '就労A型';
      case 'type_B_office':
        return '就労B型';
      default:
        return type;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'owner':
        return 'オーナー';
      case 'manager':
        return 'マネージャー';
      case 'employee':
        return '従業員';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500/20 text-purple-400';
      case 'manager':
        return 'bg-blue-500/20 text-blue-400';
      case 'employee':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-gray-400 mt-4">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <button
          onClick={() => router.push('/app-admin')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          戻る
        </button>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!office) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-6">
      {/* ヘッダー */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/app-admin')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          事務所一覧に戻る
        </button>
        <div className="flex items-center gap-3">
          <FaBuilding className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">{office.name}</h1>
            <span className="bg-gray-600 text-gray-200 px-2 py-1 rounded text-xs">
              {getOfficeTypeName(office.office_type)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 事務所基本情報 */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4">基本情報</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">住所</p>
              <p className="text-white">{office.address || '未設定'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">電話番号</p>
              <p className="text-white">{office.phone_number || '未設定'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">メールアドレス</p>
              <p className="text-white">{office.email || '未設定'}</p>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4">統計</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <FaUsers className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{office.staffs.length}</p>
              <p className="text-sm text-gray-400">スタッフ数</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <FaCheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {office.staffs.filter(s => s.is_email_verified).length}
              </p>
              <p className="text-sm text-gray-400">メール認証済み</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-400">メール認証率</span>
              <span className="text-white">
                {office.staffs.length > 0
                  ? Math.round((office.staffs.filter(s => s.is_email_verified).length / office.staffs.length) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{
                  width: `${office.staffs.length > 0
                    ? (office.staffs.filter(s => s.is_email_verified).length / office.staffs.length) * 100
                    : 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4">アクション</h2>
          <p className="text-gray-400 text-sm">
            この事務所に対するアクションは、各機能タブから実行できます。
          </p>
        </div>
      </div>

      {/* スタッフ一覧 */}
      <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FaUsers className="w-5 h-5 text-purple-400" />
            スタッフ一覧
          </h2>
        </div>
        {office.staffs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">スタッフが登録されていません</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">氏名</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">メールアドレス</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">役割</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">MFA</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">メール認証</th>
                </tr>
              </thead>
              <tbody>
                {office.staffs.map((staff) => (
                  <tr key={staff.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <span className="text-white">
                        {staff.full_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm">
                      {staff.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${getRoleBadgeColor(staff.role)}`}>
                        {getRoleName(staff.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {staff.is_mfa_enabled ? (
                        <span className="flex items-center gap-1 text-green-400 text-sm">
                          <FaShieldAlt className="w-4 h-4" />
                          有効
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400 text-sm">
                          <FaTimesCircle className="w-4 h-4" />
                          無効
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {staff.is_email_verified ? (
                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs flex items-center gap-1 w-fit">
                          <FaCheckCircle className="w-3 h-3" />
                          認証済み
                        </span>
                      ) : (
                        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs flex items-center gap-1 w-fit">
                          <FaTimesCircle className="w-3 h-3" />
                          未認証
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
