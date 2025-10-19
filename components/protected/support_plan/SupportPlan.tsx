'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FaCheckSquare, FaRegSquare } from 'react-icons/fa';
import { MdWarning, MdNotifications } from 'react-icons/md';
import PlanDeliverableModal from './PlanDeliverableModal';
import MonitoringDeadlineModal from './MonitoringDeadlineModal';
import Breadcrumb, { BreadcrumbItem } from '@/components/ui/Breadcrumb';
import { welfareRecipientsApi, WelfareRecipient } from '@/lib/welfare-recipients';
import { supportPlanApi, PlanCycle } from '@/lib/support-plan';
import CalendarLinkButton from '@/components/ui/google/CalendarLinkButton';


export default function SupportPlan() {
  const params = useParams();
  const recipientId = params?.id as string;

  const [recipient, setRecipient] = useState<WelfareRecipient | null>(null);
  const [cycles, setCycles] = useState<PlanCycle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<PlanCycle | null>(null);
  const [selectedStepType, setSelectedStepType] = useState<string>('');

  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [currentMonitoringDeadline] = useState(7);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!recipientId) return;

      console.log('=== SupportPlan useEffect ===');
      console.log('recipientId:', recipientId);

      try {
        setIsLoading(true);
        setError(null);

        // 利用者情報とサイクル情報を並行取得
        const [recipientData, cyclesData] = await Promise.all([
          welfareRecipientsApi.get(recipientId),
          supportPlanApi.getCycles(recipientId),
        ]);

        console.log('recipientData:', recipientData);
        console.log('cyclesData:', cyclesData);

        setRecipient(recipientData);
        setCycles(cyclesData.cycles || []);
      } catch (err) {
        console.error('Failed to fetch support plan data:', err);
        setError('データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [recipientId]);

  const getStepLabel = (stepType: string, cycleNumber: number) => {
    if (stepType === 'assessment' && cycleNumber === 1) return 'アセスメント';
    if (stepType === 'assessment' && cycleNumber > 1) return 'モニタリング';
    if (stepType === 'draft_plan') return '個別支援計画書作成';
    if (stepType === 'staff_meeting') return '担当者会議';
    if (stepType === 'final_plan_signed') return '個別支援計画書完成';
    return stepType;
  };

  const getStepIcon = (completed: boolean, daysRemaining?: number | null) => {
    // 完了している場合はチェック済みアイコン
    if (completed) {
      return <FaCheckSquare className="text-green-500" size={24} />;
    }

    // 未完了で期限超過
    if (daysRemaining !== null && daysRemaining !== undefined && daysRemaining < 0) {
      return (
        <div className="relative">
          <FaRegSquare className="text-red-500" size={24} />
          <MdWarning className="absolute -top-1 -right-1 text-red-500" size={16} />
        </div>
      );
    }

    // 未完了で警告期間内（残り30日以内）
    if (daysRemaining !== null && daysRemaining !== undefined && daysRemaining <= 30) {
      return (
        <div className="relative">
          <FaRegSquare className="text-orange-500" size={24} />
          <MdNotifications className="absolute -top-1 -right-1 text-orange-500" size={16} />
        </div>
      );
    }

    // 未完了（通常）
    return <FaRegSquare className="text-gray-400" size={24} />;
  };

  const getDeadlineWarning = (daysRemaining: number | null) => {
    if (daysRemaining === null) return null;
    if (daysRemaining < 0) {
      return { text: `期限が過ぎています（${Math.abs(daysRemaining)}日超過）`, color: 'text-[#ef4444]' };
    }
    if (daysRemaining <= 30) {
      return { text: `残り${daysRemaining}日`, color: 'text-[#f59e0b]' };
    }
    return null;
  };

  const calculateDaysRemaining = (deadline: string | null) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleCellClick = (cycle: PlanCycle, stepType: string) => {
    console.log('=== handleCellClick ===');
    console.log('cycle:', cycle);
    console.log('stepType (passed):', stepType);
    console.log('cycle_number:', cycle.cycle_number);
    setSelectedCycle(cycle);
    setSelectedStepType(stepType);
    setIsModalOpen(true);
  };

  const handleUpload = async (file: File) => {
    if (!selectedCycle) return;

    console.log('=== handleUpload START ===');
    console.log('recipientId:', recipientId);
    console.log('cycleId:', selectedCycle.id);
    console.log('stepType:', selectedStepType);
    console.log('file:', file.name, file.type, file.size);

    try {
      const result = await supportPlanApi.uploadDeliverable(
        recipientId,
        selectedCycle.id,
        selectedStepType,
        file
      );
      console.log('Upload success:', result);

      // アップロード成功後、データを再取得
      const cyclesData = await supportPlanApi.getCycles(recipientId);
      setCycles(cyclesData.cycles || []);

      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to upload file:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      throw err; // モーダル側でエラーハンドリング
    }
  };

  const handleReupload = async (deliverableId: string, file: File) => {
    try {
      await supportPlanApi.reuploadDeliverable(deliverableId, file);

      // 再アップロード成功後、データを再取得
      const cyclesData = await supportPlanApi.getCycles(recipientId);
      setCycles(cyclesData.cycles || []);

      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to reupload file:', err);
      throw err;
    }
  };

  const handleSetMonitoringDeadline = async (deadlineDays: number) => {
    const latestCycle = cycles.find(c => c.is_latest_cycle);
    if (!latestCycle) {
      alert('対象となる計画サイクルが見つかりません。');
      return;
    }

    try {
      await supportPlanApi.updateMonitoringDeadline(latestCycle.id, deadlineDays);
      alert(`モニタリング期限を${deadlineDays}日に設定しました。`);
      // データを再取得して画面を更新
      const cyclesData = await supportPlanApi.getCycles(recipientId);
      setCycles(cyclesData.cycles || []);
    } catch (err) {
      console.error('Failed to set monitoring deadline:', err);
      alert('モニタリング期限の設定に失敗しました。');
    }
  };



  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  // エラー時
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] flex items-center justify-center p-4">
        <div className="bg-[#ef4444]/10 border border-[#ef4444] rounded-lg p-6 max-w-md">
          <p className="text-[#ef4444] text-center">⚠️ {error}</p>
        </div>
      </div>
    );
  }

  // 利用者情報の整形
  const fullName = recipient
    ? `${recipient.last_name} ${recipient.first_name}`
    : '読み込み中...';
  const furigana = recipient
    ? `${recipient.last_name_furigana} ${recipient.first_name_furigana}`
    : '-';

  // 最新サイクルの更新期限を計算
  const latestCycle = cycles.find(c => c.is_latest_cycle);
  const renewalDeadline = latestCycle?.plan_cycle_start_date
    ? new Date(new Date(latestCycle.plan_cycle_start_date).getTime() + 180 * 24 * 60 * 60 * 1000).toISOString()
    : null;
  const renewalDaysRemaining = calculateDaysRemaining(renewalDeadline);
  const renewalWarning = getDeadlineWarning(renewalDaysRemaining);

  // パンくずリスト
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: '利用者一覧', href: '/welfare-recipients' },
    { label: fullName, current: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] text-white p-4 md:p-6">
      {/* パンくずリスト */}
      <div className="max-w-[1400px] mx-auto">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* ヘッダー部分 */}
      <div className="max-w-[1400px] mx-auto mb-8">
        {/* 期限警告バナー */}
        {renewalWarning && (
          <div className={`${renewalWarning.color === 'text-[#ef4444]' ? 'bg-[#ef4444]/10 border-[#ef4444]' : 'bg-[#f59e0b]/10 border-[#f59e0b]'} border rounded-lg p-4 mb-4`}>
            <div className="flex items-center gap-3">
              {renewalDaysRemaining !== null && renewalDaysRemaining < 0 ? (
                <MdWarning className="text-red-500" size={32} />
              ) : (
                <MdNotifications className="text-orange-500" size={32} />
              )}
              <div>
                <p className={`${renewalWarning.color} font-medium`}>個別支援計画の更新期限</p>
                <p className={`${renewalWarning.color} text-sm mt-1`}>{renewalWarning.text}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#0f1419cc] rounded-lg border border-[#2a3441] p-6 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {fullName}
              </h1>
              <p className="text-[#9ca3af] text-sm">
                フリガナ: {furigana}
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              {/* 非MVP: モニタリング期限設定 */}
              <CalendarLinkButton />
            </div>
          </div>
        </div>
      </div>

      {/* メインテーブル */}
      <div className="max-w-[1400px] mx-auto">
        {/* デスクトップ表示 */}
        <div className="hidden md:block overflow-x-auto">
          <div className="bg-[#0f1419cc] rounded-lg border border-[#2a3441]">
            <table className="w-full table-fixed">
              <thead className="bg-[#1a1f2e]">
                <tr>
                  <th className="w-[7.7%] px-4 py-3 text-center text-sm font-medium text-[#9ca3af] border-r border-[#2a3441]">
                    回数
                  </th>
                  <th className="w-[23.1%] px-4 py-3 text-center text-sm font-medium text-[#9ca3af] border-r border-[#2a3441]">
                    アセスメント<br />モニタリング
                  </th>
                  <th className="w-[23.1%] px-4 py-3 text-center text-sm font-medium text-[#9ca3af] border-r border-[#2a3441]">
                    個別支援計画書<br />原案
                  </th>
                  <th className="w-[23.1%] px-4 py-3 text-center text-sm font-medium text-[#9ca3af] border-r border-[#2a3441]">
                    担当者会議
                  </th>
                  <th className="w-[23.1%] px-4 py-3 text-center text-sm font-medium text-[#9ca3af]">
                    個別支援計画書<br />本署名済
                  </th>
                </tr>
              </thead>
              <tbody>
                {cycles.map((cycle) => {
                  // サイクル1はassessment、サイクル2以降はmonitoring
                  const firstStepType = cycle.cycle_number === 1 ? 'assessment' : 'monitoring';
                  const assessmentStatus = cycle.statuses.find(s => s.step_type === firstStepType);
                  const draftStatus = cycle.statuses.find(s => s.step_type === 'draft_plan');
                  const meetingStatus = cycle.statuses.find(s => s.step_type === 'staff_meeting');
                  const finalStatus = cycle.statuses.find(s => s.step_type === 'final_plan_signed');

                  const daysRemaining = cycle.plan_cycle_start_date
                    ? calculateDaysRemaining(new Date(new Date(cycle.plan_cycle_start_date).getTime() + 180 * 24 * 60 * 60 * 1000).toISOString())
                    : null;

                  return (
                    <tr key={cycle.id} className="border-t border-[#2a3441] hover:bg-[#2a3f5f40] transition-colors">
                      <td className="px-4 py-6 text-center border-r border-[#2a3441]">
                        <div className="text-3xl font-bold text-white">{cycle.cycle_number}</div>
                      </td>

                      <td
                        className="px-4 py-6 text-center border-r border-[#2a3441] cursor-pointer hover:bg-[#4f46e5]/20"
                        onClick={() => handleCellClick(cycle, firstStepType)}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex justify-center items-center">
                            {getStepIcon(assessmentStatus?.completed || false, daysRemaining || undefined)}
                          </div>
                          <span className="text-xs text-[#9ca3af]">
                            {assessmentStatus?.completed_at
                              ? new Date(assessmentStatus.completed_at).toLocaleDateString('ja-JP')
                              : '未完了'}
                          </span>
                          {assessmentStatus?.pdf_url && (
                            <a
                              href={assessmentStatus.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#00bcd4] hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              📄 PDF
                            </a>
                          )}
                        </div>
                      </td>

                      <td
                        className="px-4 py-6 text-center border-r border-[#2a3441] cursor-pointer hover:bg-[#4f46e5]/20"
                        onClick={() => handleCellClick(cycle, 'draft_plan')}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex justify-center items-center">
                            {getStepIcon(draftStatus?.completed || false)}
                          </div>
                          <span className="text-xs text-[#9ca3af]">
                            {draftStatus?.completed_at
                              ? new Date(draftStatus.completed_at).toLocaleDateString('ja-JP')
                              : '未完了'}
                          </span>
                          {draftStatus?.pdf_url && (
                            <a
                              href={draftStatus.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#00bcd4] hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              📄 PDF
                            </a>
                          )}
                        </div>
                      </td>

                      <td
                        className="px-4 py-6 text-center border-r border-[#2a3441] cursor-pointer hover:bg-[#4f46e5]/20"
                        onClick={() => handleCellClick(cycle, 'staff_meeting')}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex justify-center items-center">
                            {getStepIcon(meetingStatus?.completed || false)}
                          </div>
                          <span className="text-xs text-[#9ca3af]">
                            {meetingStatus?.completed_at
                              ? new Date(meetingStatus.completed_at).toLocaleDateString('ja-JP')
                              : '未完了'}
                          </span>
                          {meetingStatus?.pdf_url && (
                            <a
                              href={meetingStatus.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#00bcd4] hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              📄 PDF
                            </a>
                          )}
                        </div>
                      </td>

                      <td
                        className="px-4 py-6 text-center cursor-pointer hover:bg-[#4f46e5]/20"
                        onClick={() => handleCellClick(cycle, 'final_plan_signed')}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex justify-center items-center">
                            {getStepIcon(finalStatus?.completed || false)}
                          </div>
                          <span className="text-xs text-[#9ca3af]">
                            {finalStatus?.completed_at
                              ? new Date(finalStatus.completed_at).toLocaleDateString('ja-JP')
                              : '未完了'}
                          </span>
                          {finalStatus?.pdf_url && (
                            <a
                              href={finalStatus.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#00bcd4] hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              📄 PDF
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* モバイル表示 */}
        <div className="md:hidden space-y-4">
          {cycles.map((cycle) => {
            // サイクル1はassessment、サイクル2以降はmonitoring
            const firstStepType = cycle.cycle_number === 1 ? 'assessment' : 'monitoring';
            const assessmentStatus = cycle.statuses.find(s => s.step_type === firstStepType);
            const draftStatus = cycle.statuses.find(s => s.step_type === 'draft_plan');
            const meetingStatus = cycle.statuses.find(s => s.step_type === 'staff_meeting');
            const finalStatus = cycle.statuses.find(s => s.step_type === 'final_plan_signed');

            return (
              <div key={cycle.id} className="bg-[#0f1419cc] rounded-lg border border-[#2a3441] p-4">
                <div className="text-2xl font-bold text-white mb-4 text-center">
                  第 {cycle.cycle_number} 回
                </div>

                <div className="space-y-3">
                  <div
                    className="bg-[#1a1f2e] rounded-lg p-3 cursor-pointer hover:bg-[#2a3f5f40]"
                    onClick={() => handleCellClick(cycle, 'assessment')}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#9ca3af]">
                        {getStepLabel('assessment', cycle.cycle_number)}
                      </span>
                      <div className="flex items-center">
                        {getStepIcon(assessmentStatus?.completed || false)}
                      </div>
                    </div>
                    <div className="text-xs text-[#6b7280] mt-1">
                      {assessmentStatus?.completed_at
                        ? new Date(assessmentStatus.completed_at).toLocaleDateString('ja-JP')
                        : '未完了'}
                    </div>
                  </div>

                  <div
                    className="bg-[#1a1f2e] rounded-lg p-3 cursor-pointer hover:bg-[#2a3f5f40]"
                    onClick={() => handleCellClick(cycle, 'draft_plan')}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#9ca3af]">個別支援計画書作成</span>
                      <div className="flex items-center">
                        {getStepIcon(draftStatus?.completed || false)}
                      </div>
                    </div>
                    <div className="text-xs text-[#6b7280] mt-1">
                      {draftStatus?.completed_at
                        ? new Date(draftStatus.completed_at).toLocaleDateString('ja-JP')
                        : '未完了'}
                    </div>
                  </div>

                  <div
                    className="bg-[#1a1f2e] rounded-lg p-3 cursor-pointer hover:bg-[#2a3f5f40]"
                    onClick={() => handleCellClick(cycle, 'staff_meeting')}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#9ca3af]">担当者会議</span>
                      <div className="flex items-center">
                        {getStepIcon(meetingStatus?.completed || false)}
                      </div>
                    </div>
                    <div className="text-xs text-[#6b7280] mt-1">
                      {meetingStatus?.completed_at
                        ? new Date(meetingStatus.completed_at).toLocaleDateString('ja-JP')
                        : '未完了'}
                    </div>
                  </div>

                  <div
                    className="bg-[#1a1f2e] rounded-lg p-3 cursor-pointer hover:bg-[#2a3f5f40]"
                    onClick={() => handleCellClick(cycle, 'final_plan_signed')}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#9ca3af]">個別支援計画書完成</span>
                      <div className="flex items-center">
                        {getStepIcon(finalStatus?.completed || false)}
                      </div>
                    </div>
                    <div className="text-xs text-[#6b7280] mt-1">
                      {finalStatus?.completed_at
                        ? new Date(finalStatus.completed_at).toLocaleDateString('ja-JP')
                        : '未完了'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* アップロードモーダル */}
      {isModalOpen && selectedCycle && (() => {
        const currentStatus = selectedCycle.statuses.find(s => s.step_type === selectedStepType);
        return (
          <PlanDeliverableModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onUpload={handleUpload}
            onReupload={handleReupload}
            stepType={selectedStepType}
            cycleNumber={selectedCycle.cycle_number}
            existingPdfUrl={currentStatus?.pdf_url || null}
            existingPdfFilename={currentStatus?.pdf_filename || null}
            deliverableId={currentStatus?.deliverable_id || null}
          />
        );
      })()}

      {/* モニタリング期限設定モーダル */}
      <MonitoringDeadlineModal
        isOpen={isDeadlineModalOpen}
        onClose={() => setIsDeadlineModalOpen(false)}
        onConfirm={handleSetMonitoringDeadline}
        currentDeadline={currentMonitoringDeadline}
      />
    </div>
  );
}
