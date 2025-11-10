'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import EmployeeActionRequestModal from '@/components/common/EmployeeActionRequestModal';
import { useStaffRole } from '@/hooks/useStaffRole';
import { ActionType, ResourceType } from '@/types/employeeActionRequest';

interface PlanDeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  onReupload: (deliverableId: string, file: File) => void;
  stepType: string;
  cycleNumber: number;
  existingPdfUrl?: string | null;
  existingPdfFilename?: string | null;
  deliverableId?: string | null;
}

export default function PlanDeliverableModal({
  isOpen,
  onClose,
  onUpload,
  onReupload,
  stepType,
  cycleNumber,
  existingPdfUrl,
  existingPdfFilename,
  deliverableId,
}: PlanDeliverableModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [loadedPdfUrl, setLoadedPdfUrl] = useState<string | null>(null);

  // Employee Action Request Modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const { isEmployee } = useStaffRole();

  // PDFをBlobとして読み込む
  useEffect(() => {
    if (showPdfPreview && existingPdfUrl && existingPdfUrl !== loadedPdfUrl) {
      setIsLoadingPdf(true);

      // CORS対応: mode: 'cors' と credentials を追加
      fetch(existingPdfUrl, {
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'application/pdf',
        }
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.blob();
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setPdfBlobUrl((prev) => {
            // 古いBlobをクリーンアップ
            if (prev) {
              URL.revokeObjectURL(prev);
            }
            return url;
          });
          setLoadedPdfUrl(existingPdfUrl);
          setIsLoadingPdf(false);
        })
        .catch((err) => {
          console.error('PDF読み込みエラー:', err);
          setError('PDFの読み込みに失敗しました。CORS設定を確認してください。');
          setIsLoadingPdf(false);
        });
    }
  }, [showPdfPreview, existingPdfUrl, loadedPdfUrl]);

  // モーダルが閉じられたときにBlobをクリーンアップ
  useEffect(() => {
    if (!isOpen) {
      setPdfBlobUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
      setLoadedPdfUrl(null);
      setShowPdfPreview(false);
    }
  }, [isOpen]);

  const getStepLabel = () => {
    if (stepType === 'assessment' && cycleNumber === 1) return 'アセスメント';
    if (stepType === 'assessment' && cycleNumber > 1) return 'モニタリング';
    if (stepType === 'draft_plan') return '個別支援計画書作成';
    if (stepType === 'staff_meeting') return '担当者会議';
    if (stepType === 'final_plan_signed') return '個別支援計画書完成';
    return stepType;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);

    if (acceptedFiles.length === 0) {
      setError('ファイルが選択されていません');
      return;
    }

    const file = acceptedFiles[0];

    // ファイルサイズチェック（10MB）
    if (file.size > 10 * 1024 * 1024) {
      setError('ファイルサイズは10MB以下にしてください');
      return;
    }

    // PDF形式チェック
    if (file.type !== 'application/pdf') {
      setError('PDFファイルのみアップロード可能です');
      return;
    }

    setSelectedFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('ファイルを選択してください');
      return;
    }

    // Employeeの場合はリクエスト申請モーダルを表示
    if (isEmployee) {
      setIsRequestModalOpen(true);
      return;
    }

    // Manager/Ownerの場合は直接実行
    await executeUpload();
  };

  const executeUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // アップロード進捗のシミュレーション
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // 実際のアップロード処理（再アップロードか新規アップロード）
      if (deliverableId && existingPdfUrl) {
        await onReupload(deliverableId, selectedFile);
      } else {
        await onUpload(selectedFile);
      }

      clearInterval(interval);
      setUploadProgress(100);

      // 成功後にモーダルを閉じる
      setTimeout(() => {
        onClose();
        setSelectedFile(null);
        setUploadProgress(0);
        setIsUploading(false);
      }, 500);
    } catch {
      setError('アップロードに失敗しました。もう一度お試しください。');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRequestSuccess = () => {
    // リクエスト送信成功時の処理
    onClose();
    setSelectedFile(null);
  };



  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1f2e] border border-[#2a3441] rounded-xl w-full max-w-lg animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-6 border-b border-[#2a3441]">
          <div>
            <h3 className="text-lg font-semibold text-white">{getStepLabel()}</h3>
            <p className="text-sm text-[#9ca3af] mt-1">第{cycleNumber}回 サイクル</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {/* 既存のPDFがある場合 */}
          {existingPdfUrl && !selectedFile && (
            <div className="mb-6 bg-[#0f1419] border border-[#2a3441] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="text-white text-sm font-medium">{existingPdfFilename || 'PDF登録済み'}</p>
                    <div className="flex gap-3 mt-1">
                      <button
                        onClick={() => setShowPdfPreview(!showPdfPreview)}
                        className="text-xs text-[#00bcd4] hover:underline"
                      >
                        {showPdfPreview ? 'プレビューを閉じる' : 'プレビューを表示'}
                      </button>
                      <a
                        href={existingPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#00bcd4] hover:underline"
                      >
                        新しいタブで開く
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDFプレビュー */}
              {showPdfPreview && (
                <div className="mt-3 border border-[#2a3441] rounded-lg overflow-hidden">
                  {isLoadingPdf ? (
                    <div className="h-[500px] flex items-center justify-center bg-[#0f1419]">
                      <p className="text-[#9ca3af]">読み込み中...</p>
                    </div>
                  ) : pdfBlobUrl ? (
                    <iframe
                      src={pdfBlobUrl}
                      className="w-full h-[500px]"
                      title="PDF Preview"
                      allow="fullscreen"
                    />
                  ) : (
                    <div className="h-[500px] flex items-center justify-center bg-[#0f1419]">
                      <p className="text-[#9ca3af]">PDFが見つかりません</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 削除確認は今は実装しない(非MVP) */}


          {/* ドラッグ&ドロップエリア */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-[#4f46e5] bg-[#4f46e5]/10'
                  : 'border-[#2a3441] hover:border-[#4f46e5]/50 hover:bg-[#0f1419]'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-3">
                <span className="text-5xl">📎</span>
                {selectedFile ? (
                  <>
                    <p className="text-white font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-[#9ca3af]">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : isDragActive ? (
                  <p className="text-white">ここにドロップしてください</p>
                ) : (
                  <>
                    <p className="text-white">
                      PDFファイルをドラッグ&ドロップ
                      <br />
                      または<span className="text-[#4f46e5]">クリックして選択</span>
                    </p>
                    <p className="text-xs text-[#9ca3af]">最大ファイルサイズ: 10MB</p>
                  </>
                )}
              </div>
            </div>

          {/* エラー表示 */}
          {error && (
            <div className="mt-4 bg-[#ef4444]/10 border border-[#ef4444] rounded-lg p-3">
              <p className="text-[#ef4444] text-sm">⚠️ {error}</p>
            </div>
          )}

          {/* アップロード進捗 */}
          {isUploading && uploadProgress > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-[#9ca3af] mb-2">
                <span>アップロード中...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#0f1419] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#4f46e5] h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex justify-end gap-3 p-6 border-t border-[#2a3441]">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'アップロード中...' : 'アップロード'}
          </button>
        </div>
      </div>

      {/* Employee Action Request Modal */}
      {selectedFile && (
        <EmployeeActionRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          onSuccess={handleRequestSuccess}
          actionType={deliverableId && existingPdfUrl ? ActionType.UPDATE : ActionType.CREATE}
          resourceType={ResourceType.SUPPORT_PLAN_STATUS}
          requestData={{
            step_type: stepType,
            cycle_number: cycleNumber,
            file_name: selectedFile.name,
            file_size: selectedFile.size,
          }}
          actionDescription={`${getStepLabel()}のPDFを${deliverableId && existingPdfUrl ? '再' : ''}アップロード`}
        />
      )}
    </div>
  );
}
