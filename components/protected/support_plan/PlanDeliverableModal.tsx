'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useStaffRole } from '@/hooks/useStaffRole';
import { getSupportPlanStepLabel } from './stepLabels';

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

  const { isEmployee } = useStaffRole();

  // PDFをBlobとして読み込む
  useEffect(() => {
    if (showPdfPreview && existingPdfUrl && existingPdfUrl !== loadedPdfUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
          console.error('Client operation failed');
          setError('PDFの読み込みに失敗しました。CORS設定を確認してください。');
          setIsLoadingPdf(false);
        });
    }
  }, [showPdfPreview, existingPdfUrl, loadedPdfUrl]);

  // モーダルが閉じられたときにBlobをクリーンアップ
  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    return getSupportPlanStepLabel(stepType);
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

    // アップロード実行
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-300 dark:bg-[#1a1f2e] dark:border-[#2a3441] rounded-xl w-full max-w-lg animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-6 border-b border-slate-300 dark:border-[#2a3441]">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{getStepLabel()}</h3>
            <p className="text-base font-semibold text-slate-600 dark:text-[#9ca3af] mt-1">第{cycleNumber}回</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors text-2xl"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {/* 既存のPDFがある場合 */}
          {existingPdfUrl && !selectedFile && (
            <div className="mb-6 bg-slate-50 border border-slate-300 dark:bg-[#0f1419] dark:border-[#2a3441] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="text-slate-900 text-base font-semibold dark:text-white">{existingPdfFilename || 'PDF登録済み'}</p>
                    <div className="flex gap-3 mt-1">
                      <button
                        onClick={() => setShowPdfPreview(!showPdfPreview)}
                        className="text-base font-semibold text-cyan-600 dark:text-[#00bcd4] hover:underline"
                      >
                        {showPdfPreview ? 'プレビューを閉じる' : 'プレビューを表示'}
                      </button>
                      <a
                        href={existingPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-semibold text-cyan-600 dark:text-[#00bcd4] hover:underline"
                      >
                        新しいタブで開く
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDFプレビュー */}
              {showPdfPreview && (
                <div className="mt-3 border border-slate-300 dark:border-[#2a3441] rounded-lg overflow-hidden">
                  {isLoadingPdf ? (
                    <div className="h-[500px] flex items-center justify-center bg-slate-50 dark:bg-[#0f1419]">
                      <p className="text-slate-600 dark:text-[#9ca3af]">読み込み中...</p>
                    </div>
                  ) : pdfBlobUrl ? (
                    <iframe
                      src={pdfBlobUrl}
                      className="w-full h-[500px]"
                      title="PDF Preview"
                      allow="fullscreen"
                    />
                  ) : (
                    <div className="h-[500px] flex items-center justify-center bg-slate-50 dark:bg-[#0f1419]">
                      <p className="text-slate-600 dark:text-[#9ca3af]">PDFが見つかりません</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 削除確認は今は実装しない(非MVP) */}

          {/* Employee権限の場合は閲覧のみのメッセージを表示 */}
          {isEmployee ? (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="text-yellow-700 font-semibold dark:text-yellow-500 mb-1">閲覧専用モード</p>
                  <p className="text-base font-semibold text-slate-700 dark:text-gray-300">
                    一般の社員権限では個別支援計画のPDFをアップロードできません。
                    <br />
                    PDFのアップロードが必要な場合は、マネージャー職スタッフ/事務所オーナーにご依頼ください。
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ドラッグ&ドロップエリア（Manager/Ownerのみ） */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-indigo-600 bg-indigo-50 dark:border-[#4f46e5] dark:bg-[#4f46e5]/10'
                    : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50 dark:border-[#2a3441] dark:hover:border-[#4f46e5]/50 dark:bg-[#0f1419]'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                  <span className="text-5xl">📎</span>
                  {selectedFile ? (
                    <>
                      <p className="text-slate-900 font-semibold dark:text-white">{selectedFile.name}</p>
                      <p className="text-base font-semibold text-slate-600 dark:text-[#9ca3af]">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : isDragActive ? (
                    <p className="text-slate-900 font-semibold dark:text-white">ここにドロップしてください</p>
                  ) : (
                    <>
                      <p className="text-slate-900 font-semibold dark:text-white">
                        PDFファイルをドラッグ&ドロップ
                        <br />
                        または<span className="text-indigo-600 dark:text-[#4f46e5]">クリックして選択</span>
                      </p>
                      <p className="text-base font-semibold text-slate-600 dark:text-[#9ca3af]">最大ファイルサイズ: 10MB</p>
                    </>
                  )}
                </div>
              </div>

              {/* エラー表示 */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-500 dark:bg-[#ef4444]/10 dark:border-[#ef4444] rounded-lg p-3">
                  <p className="text-red-600 text-base font-semibold dark:text-[#ef4444]">⚠️ {error}</p>
                </div>
              )}

              {/* アップロード進捗 */}
              {isUploading && uploadProgress > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-base font-semibold text-slate-600 dark:text-[#9ca3af] mb-2">
                    <span>アップロード中...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-[#0f1419] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#4f46e5] h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* フッター */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-300 dark:border-[#2a3441]">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold dark:text-gray-400 dark:hover:text-white transition-colors disabled:opacity-50"
          >
            {isEmployee ? '閉じる' : 'キャンセル'}
          </button>
          {!isEmployee && (
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-2 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'アップロード中...' : 'アップロード'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
