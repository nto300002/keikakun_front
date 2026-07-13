'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Download, X } from 'lucide-react';

interface IcsDownloadControlProps {
  isDownloading: boolean;
  onDownload: () => void | Promise<void>;
  buttonLabel?: string;
  downloadingLabel?: string;
  className?: string;
}

const imageGuidePaths = [
  '/calendar/c1.png',
  '/calendar/c2.png',
  '/calendar/c3.png',
  '/calendar/c4.png',
  '/calendar/c5.png',
  '/calendar/c6.png',
  '/calendar/c7.png',
];

const imageGuideWidth = 1920;
const imageGuideHeight = 857;

export function IcsDownloadControl({
  isDownloading,
  onDownload,
  buttonLabel = '.icsをダウンロード',
  downloadingLabel = '作成中...',
  className = '',
}: IcsDownloadControlProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showImageGuide, setShowImageGuide] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const closeHelp = () => {
    setIsHelpOpen(false);
    setShowImageGuide(false);
    setExpandedImage(null);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <button
          type="button"
          onClick={() => setIsHelpOpen(true)}
          className="relative rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-sm font-bold text-cyan-900 shadow-sm transition-colors hover:bg-cyan-100 dark:border-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-100 dark:hover:bg-cyan-900/60"
        >
          .icsファイルとは？/使い方
          <span className="absolute -bottom-1 right-5 h-2 w-2 rotate-45 border-b border-r border-cyan-300 bg-cyan-50 dark:border-cyan-700 dark:bg-cyan-950" />
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={isDownloading}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-cyan-600 dark:hover:bg-cyan-500 dark:disabled:bg-slate-700"
        >
          <Download className="h-5 w-5" aria-hidden="true" />
          {isDownloading ? downloadingLabel : buttonLabel}
        </button>
      </div>

      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-300 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                .icsファイルとは？
              </h2>
              <button
                type="button"
                onClick={closeHelp}
                className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                aria-label="閉じる"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-3 text-base font-semibold text-slate-700 dark:text-gray-200">
              <p>
                `.ics` ファイルは、カレンダー予定を外部カレンダーアプリへ取り込むための標準形式です。
              </p>
              <p>
                ダウンロードしたファイルをGoogle Calendarなどへ取り込むと、支援計画の期限をカレンダー予定として確認できます。
              </p>
            </div>
            <div className="mb-3 mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                Google Calendarへの取り込み手順
              </h3>
              <button
                type="button"
                onClick={() => setShowImageGuide((current) => !current)}
                className="relative self-start rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-sm font-bold text-cyan-900 shadow-sm transition-colors hover:bg-cyan-100 dark:border-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-100 dark:hover:bg-cyan-900/60 sm:self-auto"
                aria-expanded={showImageGuide}
              >
                {showImageGuide ? '画像付き解説閉じる' : '画像付き解説開く'}
                <span className="absolute -bottom-1 right-5 h-2 w-2 rotate-45 border-b border-r border-cyan-300 bg-cyan-50 dark:border-cyan-700 dark:bg-cyan-950" />
              </button>
            </div>
            <ol className="list-decimal space-y-2 pl-6 text-base font-semibold text-slate-700 dark:text-gray-200">
              <li>このページから `.ics` ファイルをダウンロードする。</li>
              <li>Google Calendarを開く。</li>
              <li>設定の「取り込み/書き出し」を開く。</li>
              <li>ダウンロードした `.ics` ファイルを選択する。</li>
              <li>反映先カレンダーを選び、取り込む。</li>
            </ol>
            {showImageGuide && (
              <div className="mt-5 space-y-4 rounded-lg border border-slate-300 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                  手順2〜3
                </h2>
                {imageGuidePaths.map((image, index) => (
                  <div key={image} className="space-y-4">
                    {index === 2 && (
                      <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                        手順4〜5
                      </h2>
                    )}
                    {index === 5 && (
                      <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                        成功したか確認
                      </h2>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpandedImage(image)}
                      className="group relative block w-full rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    >
                      <Image
                        src={image}
                        width={imageGuideWidth}
                        height={imageGuideHeight}
                        alt={`Google Calendarへの取り込み手順 ${index + 1}`}
                        className="aspect-[1920/857] w-full rounded-md border border-slate-200 bg-black object-contain dark:border-gray-700"
                        loading="lazy"
                      />
                      <span className="absolute bottom-3 right-3 rounded-md bg-black/75 px-3 py-1.5 text-sm font-bold text-white shadow-sm transition-colors group-hover:bg-black/90">
                        クリックで拡大
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700/60 dark:bg-amber-950/30">
              <p className="text-base font-semibold text-amber-800 dark:text-amber-200">
                `.ics` は手動で取り込むためのファイルです。支援計画の期限が変わった場合は、再ダウンロードと再取り込みが必要です。再取り込み時にGoogle Calendar側で予定が重複する場合があります。
              </p>
            </div>
          </div>
          {expandedImage && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
              <div className="relative w-full max-w-6xl">
                <button
                  type="button"
                  onClick={() => setExpandedImage(null)}
                  className="absolute -right-2 -top-12 rounded-md bg-white/90 p-2 text-slate-700 transition-colors hover:bg-white hover:text-slate-950 dark:bg-gray-900/90 dark:text-gray-200 dark:hover:bg-gray-800"
                  aria-label="拡大画像を閉じる"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedImage(null)}
                  className="group relative block w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <Image
                    src={expandedImage}
                    width={imageGuideWidth}
                    height={imageGuideHeight}
                    alt="Google Calendarへの取り込み手順の拡大画像"
                    className="max-h-[85vh] w-full rounded-lg bg-black object-contain"
                  />
                  <span className="absolute bottom-3 right-3 rounded-md bg-black/75 px-3 py-1.5 text-sm font-bold text-white shadow-sm transition-colors group-hover:bg-black/90">
                    再クリックで閉じる
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
