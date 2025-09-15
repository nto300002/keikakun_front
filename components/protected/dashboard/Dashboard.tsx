'use client';

import { useState, useEffect, useRef } from 'react';
import { dashboardApi } from '@/lib/dashboard';
import { DashboardData } from '@/types/dashboard';
import { authApi } from '@/lib/auth';
import { StaffResponse } from '@/types/staff';
import MfaPrompt from '@/components/auth/MfaPrompt';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [staff, setStaff] = useState<StaffResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [monitoringDays, setMonitoringDays] = useState(7);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [userData, data] = await Promise.all([
          authApi.getCurrentUser(),
          dashboardApi.getDashboardData()
        ]);
        setStaff(userData);
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };

    fetchInitialData();
  }, []);


  const toggleDropdown = (recipientId: string) => {
    setOpenDropdownId(openDropdownId === recipientId ? null : recipientId);
  };

  const getStepBadgeStyle = (step: string | null) => {
    switch (step) {
      case 'assessment': return 'bg-purple-600 text-white';
      case 'draft_plan': return 'bg-purple-600 text-white';
      case 'staff_meeting': return 'bg-blue-600 text-white';
      case 'monitoring': return 'bg-orange-600 text-white';
      case 'expired': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStepText = (step: string | null) => {
    switch (step) {
      case 'assessment': return 'アセスメント';
      case 'draft_plan': return '個別原案';
      case 'staff_meeting': return '担当者会議';
      case 'monitoring': return 'モニタリング';
      case 'expired': return '期限切れ';
      default: return '不明';
    }
  };

  const getDaysRemaining = (deadline: string | null) => {
    if (!deadline) return 0;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysRemainingColor = (days: number) => {
    if (days < 0) return 'text-red-500 bg-red-500/20 font-bold';
    if (days < 7) return 'text-red-500';
    if (days <= 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getCurrentDate = () => {
    const today = new Date();
    return `${today.getMonth() + 1}/${today.getDate()}`;
  };

  const serviceRecipients = dashboardData?.recipients || [];

  const { expiredCount, nearDeadlineCount } = serviceRecipients.reduce(
    (counts, sr) => {
      // 期限切れ処理
      const renewalDays = getDaysRemaining(sr.next_renewal_deadline);
      const monitoringDays = getDaysRemaining(sr.monitoring_due_date);

      const isRenewalExpired = sr.next_renewal_deadline && renewalDays < 0;
      const isMonitoringExpired =
        sr.latest_step === 'monitoring' && sr.monitoring_due_date && monitoringDays < 0;

      if (isRenewalExpired || isMonitoringExpired) {
        counts.expiredCount++;
      } else {
        // 期限間近処理
        const isRenewalNear =
          sr.next_renewal_deadline && renewalDays >= 0 && renewalDays <= 30;
        const isMonitoringNear =
          sr.latest_step === 'monitoring' &&
          sr.monitoring_due_date &&
          monitoringDays >= 0 &&
          monitoringDays <= 30;
        if (isRenewalNear || isMonitoringNear) {
          counts.nearDeadlineCount++;
        }
      }
      return counts;
    },
    { expiredCount: 0, nearDeadlineCount: 0 }
  );

  if (!dashboardData || !staff) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] text-white animate-in fade-in-0 slide-in-from-bottom-5 duration-300">

      <main className="pt-20 pb-8 px-4 md:px-6 max-w-[1400px] mx-auto">
        {!staff.is_mfa_enabled ? (
          <MfaPrompt />
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-white">ダッシュボード</h1>
                <div className="text-[#9ca3af] text-sm">
                  {getCurrentDate()}
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 w-full md:w-auto"
                >
                  モニタリング期限設定
                </button>
                
                <div className="bg-gradient-to-r from-[#4285f4] to-[#34a853] hover:from-[#3367d6] hover:to-[#2d8a44] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 w-full md:w-auto justify-center md:justify-start">
                  <span>🔗</span>
                  <span className="hidden sm:inline">Googleアカウント連携</span>
                  <span className="sm:hidden">Google連携</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in slide-in-from-top-4 duration-400 delay-150">
              <div className="bg-gradient-to-br from-[#3d1f1f] to-[#2a1515] rounded-lg p-6 border border-[#2a3441] transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">期限切れ</p>
                    <p className="text-2xl font-bold text-white mt-2">{expiredCount}件</p>
                  </div>
                  <div className="w-12 h-12 bg-[#ff9800]/20 rounded-lg flex items-center justify-center">
                    <span className="text-[#ff9800] text-xl">⚠️</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#3d3d1f] to-[#2a2a15] rounded-lg p-6 border border-[#2a3441] transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">期限間近</p>
                    <p className="text-2xl font-bold text-white mt-2">{nearDeadlineCount}件</p>
                  </div>
                  <div className="w-12 h-12 bg-[#ffd700]/20 rounded-lg flex items-center justify-center">
                    <span className="text-[#ffd700] text-xl">📋</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#1f2f3d] to-[#15202a] rounded-lg p-6 border border-[#2a3441] transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">利用者総数</p>
                    <p className="text-2xl font-bold text-white mt-2">{serviceRecipients.length}名</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="検索..."
                        className="bg-[#0f1419] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 w-32 focus:outline-none focus:border-[#00bcd4]"
                      />
                      <span className="absolute right-3 top-2 text-[#00bcd4]">🔍</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0f1419cc] rounded-lg border border-[#2a3441] shadow-xl animate-in slide-in-from-bottom-4 duration-400 delay-300">
              <div className="px-6 py-4 border-b border-[#2a3441]">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">利用者一覧</h2>
                </div>
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0f1419cc]">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[#9ca3af] w-1/5">
                        氏名
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-[#9ca3af] w-[15%]">
                        計画の進捗
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[#9ca3af] w-1/5">
                        次回更新日
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[#9ca3af] w-1/5">
                        モニタリング期限
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[#9ca3af] w-1/4">
                        詳細情報
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRecipients.map((recipient, index) => (
                      <tr 
                        key={recipient.id} 
                        className={`border-b border-[#2a3441] hover:bg-[#2a3f5f40] transition-colors duration-150 ${
                          index % 2 === 1 ? 'bg-[#1a1f2e20]' : 'bg-transparent'
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div className="cursor-pointer hover:underline">
                            <div className="text-white font-bold text-base">{recipient.full_name}</div>
                            <div className="text-[#6b7280] text-xs mt-1">{recipient.furigana}</div>
                          </div>
                        </td>
                        
                        <td className="px-4 py-4 text-center">
                          <div className="text-[#9ca3af] text-sm mb-1">第{recipient.current_cycle_number}回</div>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStepBadgeStyle(recipient.latest_step)}`}>
                            {getStepText(recipient.latest_step)}
                          </span>
                        </td>
                        
                        <td className="px-4 py-4">
                          <div className="text-white text-sm">
                            {recipient.next_renewal_deadline ? new Date(recipient.next_renewal_deadline).toLocaleDateString('ja-JP', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\//g, '/') : '-'}
                          </div>
                          <div className={`text-xs mt-1 ${getDaysRemainingColor(getDaysRemaining(recipient.next_renewal_deadline))}`}>
                            {getDaysRemaining(recipient.next_renewal_deadline) < 0 
                              ? `期限切れ ${Math.abs(getDaysRemaining(recipient.next_renewal_deadline))}日`
                              : `残り${getDaysRemaining(recipient.next_renewal_deadline)}日`
                            }
                          </div>
                        </td>
                        
                        <td className="px-4 py-4">
                          {recipient.latest_step === 'monitoring' ? (
                            <>
                              <div className="text-white text-sm">
                                {recipient.monitoring_due_date ? new Date(recipient.monitoring_due_date).toLocaleDateString('ja-JP', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\//g, '/') : '-'}
                              </div>
                              <div className={`text-xs mt-1 ${getDaysRemainingColor(getDaysRemaining(recipient.monitoring_due_date))}`}>
                                {getDaysRemaining(recipient.monitoring_due_date) < 0 
                                  ? `期限切れ ${Math.abs(getDaysRemaining(recipient.monitoring_due_date))}日`
                                  : `残り${getDaysRemaining(recipient.monitoring_due_date)}日`
                                }
                              </div>
                            </>
                          ) : (
                            <div className="text-white text-sm">-</div>
                          )}
                        </td>
                        
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <div className="relative" ref={dropdownRef}>
                              <button 
                                onClick={() => toggleDropdown(recipient.id)}
                                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-3 py-1 rounded text-xs font-medium transition-all duration-200 hover:shadow-lg hover:scale-95 flex items-center gap-1 min-w-[80px] h-7"
                              >
                                📊 詳細データ
                                <span className="ml-1">▼</span>
                              </button>
                              {openDropdownId === recipient.id && (
                                <div className="absolute right-0 mt-1 w-36 bg-[#0f1419] border border-[#2a3441] rounded-lg shadow-lg z-10">
                                  <button className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#2a3441] rounded-t-lg transition-colors flex items-center gap-2">
                                    📄 個別支援
                                  </button>
                                  <button className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#2a3441] rounded-t-lg transition-colors flex items-center gap-2">
                                    📄 PDF一覧
                                  </button>
                                  <button className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#2a3441] rounded-b-lg transition-colors flex items-center gap-2">
                                    📝 アセスメント
                                  </button>
                                </div>
                              )}
                            </div>
                            <button className="bg-[#10b981] hover:bg-[#0f9f6e] text-white px-2 py-1 rounded text-xs font-medium transition-all duration-200 hover:shadow-lg hover:scale-95 flex items-center gap-1 w-12 h-7">
                              編集
                            </button>
                            <button className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-2 py-1 rounded text-xs font-medium transition-all duration-200 hover:shadow-lg hover:scale-95 flex items-center gap-1 w-12 h-7">
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden">
                {serviceRecipients.map((recipient) => (
                  <div 
                    key={recipient.id} 
                    className="border-b border-[#2a3441] p-4 hover:bg-[#2a3f5f40] transition-colors duration-150"
                  >
                    <div className="space-y-3">
                      <div>
                        <div className="text-white font-bold text-base">{recipient.full_name}</div>
                        <div className="text-[#6b7280] text-xs">{recipient.furigana}</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[#9ca3af] text-sm">第{recipient.current_cycle_number}回</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStepBadgeStyle(recipient.latest_step)}`}>
                          {getStepText(recipient.latest_step)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-[#9ca3af] text-xs mb-1">次回更新日</div>
                          <div className="text-white">
                            {recipient.next_renewal_deadline ? new Date(recipient.next_renewal_deadline).toLocaleDateString('ja-JP', {month: '2-digit', day: '2-digit'}) : '-'}
                          </div>
                          <div className={`text-xs ${getDaysRemainingColor(getDaysRemaining(recipient.next_renewal_deadline))}`}>
                            {getDaysRemaining(recipient.next_renewal_deadline) < 0 
                              ? `期限切れ ${Math.abs(getDaysRemaining(recipient.next_renewal_deadline))}日`
                              : `残り${getDaysRemaining(recipient.next_renewal_deadline)}日`
                            }
                          </div>
                        </div>
                        <div>
                          <div className="text-[#9ca3af] text-xs mb-1">モニタリング期限</div>
                          {recipient.latest_step === 'monitoring' ? (
                            <>
                              <div className="text-white">
                                {recipient.monitoring_due_date ? new Date(recipient.monitoring_due_date).toLocaleDateString('ja-JP', {month: '2-digit', day: '2-digit'}) : '-'}
                              </div>
                              <div className={`text-xs ${getDaysRemainingColor(getDaysRemaining(recipient.monitoring_due_date))}`}>
                                {getDaysRemaining(recipient.monitoring_due_date) < 0 
                                  ? `期限切れ ${Math.abs(getDaysRemaining(recipient.monitoring_due_date))}日`
                                  : `残り${getDaysRemaining(recipient.monitoring_due_date)}日`
                                }
                              </div>
                            </>
                          ) : (
                            <div className="text-white text-sm">-</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="relative">
                          <button 
                            onClick={() => toggleDropdown(recipient.id)}
                            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-3 py-2 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1 w-full justify-center"
                          >
                            📊 詳細データ
                            <span className="ml-1">▼</span>
                          </button>
                          {openDropdownId === recipient.id && (
                            <div className="absolute left-0 mt-1 w-full bg-[#0f1419] border border-[#2a3441] rounded-lg shadow-lg z-10">
                              <button className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#2a3441] rounded-t-lg transition-colors flex items-center gap-2">
                                📄 個別支援PDF
                              </button>
                              <button className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#2a3441] rounded-b-lg transition-colors flex items-center gap-2">
                                📝 アセス
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button className="bg-[#10b981] hover:bg-[#0f9f6e] text-white px-3 py-2 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1 flex-1">
                            編集
                          </button>
                          <button className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-3 py-2 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1 flex-1">
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1a1f2e] border border-[#2a3441] rounded-xl p-6 w-96 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">モニタリング期限設定</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-3">
                モニタリング期限
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={monitoringDays}
                  onChange={(e) => setMonitoringDays(Number(e.target.value))}
                  className="bg-[#0f1419] border border-[#2a3441] rounded-lg px-4 py-3 text-white w-20 text-center focus:outline-none focus:border-[#3b82f6] transition-colors"
                />
                <span className="text-white">日</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                キャンセル
              </button>
              <button 
                onClick={() => {
                  console.log('モニタリング期限を', monitoringDays, '日に設定');
                  setIsModalOpen(false);
                }}
                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                設定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}