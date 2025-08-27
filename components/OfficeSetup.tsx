'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OfficeFormData {
  name: string;
  officeType: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  phoneNumber: string;
  directorName: string;
  capacity: string;
  businessHours: string;
  description: string;
}

export default function OfficeSetup() {
  const [formData, setFormData] = useState<OfficeFormData>({
    name: '',
    officeType: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
    phoneNumber: '',
    directorName: '',
    capacity: '',
    businessHours: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const officeTypes = [
    { value: 'transition_to_employment', label: '就労移行支援' },
    { value: 'type_A_office', label: '就労継続支援A型' },
    { value: 'type_B_office', label: '就労継続支援B型' }
  ];

  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県',
    '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
    '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県',
    '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // ここでAPIに送信
      console.log('Office setup data:', formData);
      
      // 仮の成功処理
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error) {
      setError('事業所情報の登録に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C1421] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            事業所情報の登録
          </h1>
          <p className="text-gray-400">
            ケイカくんをご利用いただくため、事業所の基本情報を登録してください
          </p>
        </div>

        {/* プログレス */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#10B981]">アカウント作成</span>
            <span className="text-[#10B981] font-semibold">事業所登録</span>
            <span className="text-gray-400">セットアップ完了</span>
          </div>
          <div className="mt-2 flex">
            <div className="flex-1 bg-[#10B981] h-2 rounded-l"></div>
            <div className="flex-1 bg-[#10B981] h-2"></div>
            <div className="flex-1 bg-gray-600 h-2 rounded-r"></div>
          </div>
        </div>

        {/* フォーム */}
        <div className="bg-[#2A2A2A] rounded-lg border border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* 基本情報 */}
            <div className="border-b border-gray-700 pb-6">
              <h2 className="text-lg font-semibold text-white mb-4">基本情報</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    事業所名 <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                    placeholder="○○就労移行支援事業所"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    事業所種別 <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="officeType"
                    required
                    value={formData.officeType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    {officeTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    管理責任者 <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="directorName"
                    type="text"
                    required
                    value={formData.directorName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                    placeholder="管理責任者名"
                  />
                </div>
              </div>
            </div>

 

            {/* ボタン */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 border-2 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                戻る
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? '登録中...' : '登録してセットアップ完了'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}