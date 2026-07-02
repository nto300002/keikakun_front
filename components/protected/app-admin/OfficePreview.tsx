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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-slate-600 mt-4 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 dark:bg-gray-900">
        <button
          onClick={() => router.push('/app-admin')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-950 mb-6 transition-colors dark:text-gray-400 dark:hover:text-white"
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
    <div className="min-h-screen bg-slate-100 text-slate-900 p-6 dark:bg-gray-900 dark:text-gray-200">
      {/* ヘッダー */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/app-admin')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-950 mb-4 transition-colors dark:text-gray-400 dark:hover:text-white"
        >
          <FaArrowLeft className="w-4 h-4" />
          事務所一覧に戻る
        </button>
        <div className="flex items-center gap-3">
          <FaBuilding className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold text-slate-950 dark:text-white">{office.name}</h1>
            <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-base dark:bg-gray-600 dark:text-gray-200">
              {getOfficeTypeName(office.office_type)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 事務所基本情報 */}
        <div className="bg-white rounded-lg border border-slate-300 p-6 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-xl font-bold text-slate-950 mb-4 dark:text-white">基本情報</h2>
          <div className="space-y-4">
            <div>
              <p className="text-base text-slate-500 dark:text-gray-400">住所</p>
              <p className="text-slate-950 dark:text-white">{office.address || '未設定'}</p>
            </div>
            <div>
              <p className="text-base text-slate-500 dark:text-gray-400">電話番号</p>
              <p className="text-slate-950 dark:text-white">{office.phone_number || '未設定'}</p>
            </div>
            <div>
              <p className="text-base text-slate-500 dark:text-gray-400">メールアドレス</p>
              <p className="text-slate-950 dark:text-white">{office.email || '未設定'}</p>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="bg-white rounded-lg border border-slate-300 p-6 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-xl font-bold text-slate-950 mb-4 dark:text-white">統計</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-100 rounded-lg p-4 text-center dark:bg-gray-700/50">
              <FaUsers className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-950 dark:text-white">{office.staffs.length}</p>
              <p className="text-base text-slate-500 dark:text-gray-400">スタッフ数</p>
            </div>
            <div className="bg-slate-100 rounded-lg p-4 text-center dark:bg-gray-700/50">
              <FaCheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-950 dark:text-white">
                {office.staffs.filter(s => s.is_email_verified).length}
              </p>
              <p className="text-base text-slate-500 dark:text-gray-400">メール認証済み</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-base mb-1">
              <span className="text-slate-500 dark:text-gray-400">メール認証率</span>
              <span className="text-slate-950 dark:text-white">
                {office.staffs.length > 0
                  ? Math.round((office.staffs.filter(s => s.is_email_verified).length / office.staffs.length) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 dark:bg-gray-700">
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
        <div className="bg-white rounded-lg border border-slate-300 p-6 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-xl font-bold text-slate-950 mb-4 dark:text-white">アクション</h2>
          <p className="text-slate-500 text-base dark:text-gray-400">
            この事務所に対するアクションは、各機能タブから実行できます。
          </p>
        </div>
      </div>

      {/* スタッフ一覧 */}
      <div className="mt-6 bg-white rounded-lg border border-slate-300 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-4 border-b border-slate-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2 dark:text-white">
            <FaUsers className="w-5 h-5 text-purple-400" />
            スタッフ一覧
          </h2>
        </div>
        {office.staffs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-600 dark:text-gray-400">スタッフが登録されていません</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold dark:text-gray-300">氏名</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold dark:text-gray-300">メールアドレス</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold dark:text-gray-300">役割</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold dark:text-gray-300">MFA</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold dark:text-gray-300">メール認証</th>
                </tr>
              </thead>
              <tbody>
                {office.staffs.map((staff) => (
                  <tr key={staff.id} className="border-t border-slate-200 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <span className="text-slate-950 dark:text-white">
                        {staff.full_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-base dark:text-gray-300">
                      {staff.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-base ${getRoleBadgeColor(staff.role)}`}>
                        {getRoleName(staff.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {staff.is_mfa_enabled ? (
                        <span className="flex items-center gap-1 text-green-400 text-base">
                          <FaShieldAlt className="w-4 h-4" />
                          有効
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-500 text-base dark:text-gray-400">
                          <FaTimesCircle className="w-4 h-4" />
                          無効
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {staff.is_email_verified ? (
                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-base flex items-center gap-1 w-fit">
                          <FaCheckCircle className="w-3 h-3" />
                          認証済み
                        </span>
                      ) : (
                        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-base flex items-center gap-1 w-fit">
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
