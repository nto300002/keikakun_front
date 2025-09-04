
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { officeApi } from '@/lib/auth';
import { OfficeResponse } from '@/types/office';
import { tokenUtils } from '@/lib/auth';

export default function SelectOffice() {
  const [offices, setOffices] = useState<OfficeResponse[]>([]);
  const [selectedOffice, setSelectedOffice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = tokenUtils.getToken();
      if (token) {
        setTokenReady(true);
      } else {
        setError("認証トークンが見つかりません。ログインページに戻ります。");
        setTimeout(() => router.push('/auth/login'), 3000);
      }
    }
  }, [router]);

  useEffect(() => {
    if (!tokenReady) return;

    const fetchOffices = async () => {
      setIsLoading(true);
      try {
        const officeList = await officeApi.getAllOffices();
        setOffices(officeList);
        if (officeList.length > 0) {
          setSelectedOffice(officeList[0].id);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '事業所の読み込みに失敗しました';
        setError(errorMessage);
        console.log(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOffices();
  }, [tokenReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!selectedOffice) {
      setError('事業所を選択してください。');
      setIsLoading(false);
      return;
    }

    try {
      await officeApi.associateToOffice(selectedOffice);
      const params = new URLSearchParams({
        hotbar_message: '事業所が設定されました',
        hotbar_type: 'success'
      });
      router.push(`/auth/setup-success?${params.toString()}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '事業所の設定に失敗しました';
      setError(errorMessage);
      console.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C1421] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            事業所を選択
          </h2>
          <p className="text-gray-400">
            所属する事業所を選択して、利用を開始してください。
          </p>
        </div>

        <div className="bg-[#2A2A2A] rounded-lg border border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="office" className="block text-sm font-medium text-gray-300 mb-2">
                事業所 <span className="text-red-400">*</span>
              </label>
              <select
                id="office"
                name="office"
                required
                value={selectedOffice}
                onChange={(e) => setSelectedOffice(e.target.value)}
                disabled={isLoading || offices.length === 0}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              >
                {offices.length === 0 ? (
                  <option>読み込み中...</option>
                ) : (
                  offices.map((office) => (
                    <option key={office.id} value={office.id}>
                      {office.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading || !selectedOffice}
              className="w-full bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? '設定中...' : '決定'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
