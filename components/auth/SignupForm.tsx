'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { authApi } from '@/lib/auth';
import { StaffCreateData } from '@/types/staff';

export default function SignupForm() {
  const [formData, setFormData] = useState<StaffCreateData & { confirmPassword: string }> ({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee', // デフォルト値を 'employee' に設定
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      setIsLoading(false);
      return;
    }

    try {
      // registerAdmin を registerStaff に変更
      const data = await authApi.registerStaff({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      router.push(`/auth/signup-success?role=${data.role}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("already exists")) {
          setError("このメールアドレスは既に使用されています。");
        } else {
          setError(err.message || 'サインアップに失敗しました');
        }
      } else {
        setError('予期せぬエラーが発生しました。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C1421] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            スタッフアカウント作成
          </h2>
          <p className="text-gray-400">
            ケイカくんへようこそ。まずはスタッフアカウントを作成してください。
          </p>
        </div>

        <div className="bg-[#2A2A2A] rounded-lg border border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* 名前フィールド (姓・名) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-2">
                  姓 <span className="text-red-400">*</span>
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  pattern="^[ぁ-ん ァ-ヶー一-龥々・　]+$"
                  maxLength={50}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  placeholder="山田"
                  title="姓は日本語のみ使用可能です"
                />
              </div>
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-2">
                  名 <span className="text-red-400">*</span>
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  pattern="^[ぁ-ん ァ-ヶー一-龥々・　]+$"
                  maxLength={50}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  placeholder="太郎"
                  title="名は日本語のみ使用可能です"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                メールアドレス <span className="text-red-400">*</span>
              </label>
              <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent" placeholder="staff@example.com" />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                役割 <span className="text-red-400">*</span>
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              >
                <option value="employee">従業員</option>
                <option value="manager">マネージャー</option>
              </select>
              <p className="text-xs text-gray-400 mt-2">
                <strong>従業員:</strong> 閲覧以外の操作には管理者の承認が必要です。<br />
                <strong>マネージャー:</strong> 利用者の登録や個別支援計画の作成が可能です。
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                パスワード <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent pr-10"
                  placeholder="パスワードを入力してください"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <AiOutlineEyeInvisible className="h-5 w-5" /> : <AiOutlineEye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                8文字以上で、英字大小文字・数字・記号を組み合わせてください
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                パスワード（確認） <span className="text-red-400">*</span>
              </label>
              <input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent" placeholder="パスワードを再入力してください" />
            </div>
            <div className="flex items-start">
              <input id="agree" type="checkbox" required className="mt-1 mr-2 text-[#10B981] bg-[#1A1A1A] border-gray-600 rounded focus:ring-[#10B981]" />
              <label htmlFor="agree" className="text-sm text-gray-300">
                <span className="text-red-400">* </span>
                <a href="#" className="text-[#10B981] hover:text-[#0F9F6E] underline">利用規約</a>
                および
                <a href="#" className="text-[#10B981] hover:text-[#0F9F6E] underline">プライバシーポリシー</a>
                に同意します
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? '作成中...' : 'アカウントを作成する'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              すでにアカウントをお持ちの方は
              <a href="/auth/login" className="text-[#10B981] hover:text-[#0F9F6E] underline ml-1">
                こちらからログイン
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
