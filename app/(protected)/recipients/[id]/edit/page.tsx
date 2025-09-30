'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { welfareRecipientsApi, type WelfareRecipient } from '@/lib/welfare-recipients';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import RecipientEditForm from '@/components/protected/recipients/RecipientEditForm';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function EditRecipientPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [recipient, setRecipient] = useState<WelfareRecipient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipientData = async () => {
      setIsLoading(true);
      try {
        const data = await welfareRecipientsApi.get(resolvedParams.id);
        console.log('[EditRecipientPage] Fetched recipient data:', data);
        console.log('[EditRecipientPage] data.detail:', data.detail);
        console.log('[EditRecipientPage] data.disability_status:', data.disability_status);
        setRecipient(data);
      } catch (err) {
        console.error('Failed to fetch recipient data:', err);
        setError('利用者情報の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipientData();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f1419] to-[#1a2332] p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#0f1419cc] rounded-lg border border-[#2a3441] p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#10b981]"></div>
            <p className="mt-4 text-gray-400">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipient) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f1419] to-[#1a2332] p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#0f1419cc] rounded-lg border border-[#2a3441] p-8 text-center">
            <p className="text-red-400">{error || '利用者が見つかりません'}</p>
            <Link
              href="/recipients"
              className="inline-block mt-4 px-4 py-2 bg-[#2a3441] hover:bg-[#3a4451] text-white rounded-lg transition-colors"
            >
              一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] text-white py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: '利用者一覧', href: '/recipients' },
          { label: recipient ? `${recipient.last_name} ${recipient.first_name}` : '利用者詳細', href: `/recipients/${resolvedParams.id}` },
          { label: '編集', current: true }
        ]} />
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href={`/recipients/${resolvedParams.id}`}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#2a3441] rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">利用者情報編集</h1>
            <p className="text-gray-400">
              {recipient.last_name} {recipient.first_name} の情報を編集します
            </p>
          </div>
        </div>

        {/* Edit Form - Using dedicated RecipientEditForm */}
        <RecipientEditForm
          recipientId={resolvedParams.id}
          initialData={recipient}
          onCancel={() => router.push('/dashboard')}
        />
      </div>
    </div>
  );
}