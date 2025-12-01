'use client';

import { FaBuilding, FaExclamationTriangle } from 'react-icons/fa';

interface DeletedOfficeNoticeProps {
  officeName?: string;
}

export default function DeletedOfficeNotice({ officeName }: DeletedOfficeNoticeProps) {
  return (
    <div className="min-h-screen bg-[#0C1421] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-[#2A2A2A] rounded-lg border border-gray-700 p-8 text-center">
          {/* アイコン */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <FaBuilding className="h-16 w-16 text-gray-500" />
              <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1">
                <FaExclamationTriangle className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          {/* タイトル */}
          <h1 className="text-2xl font-bold text-white mb-4">
            事務所が退会しました
          </h1>

          {/* メッセージ */}
          <div className="space-y-4 text-gray-400">
            {officeName && (
              <p className="text-lg">
                <span className="text-white font-medium">{officeName}</span>
              </p>
            )}
            <p>
              ご利用の事務所は退会処理が完了しました。
              <br />
              ご利用いただきありがとうございました。
            </p>
          </div>

          {/* 補足情報 */}
          <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-400">
              ご不明な点がございましたら、サポートまでお問い合わせください。
            </p>
          </div>

          {/* ログインページへ戻る */}
          <div className="mt-6">
            <a
              href="/auth/login"
              className="text-[#10B981] hover:text-[#0F9F6E] underline text-sm"
            >
              ログインページに戻る
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
