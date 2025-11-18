'use client';

import { useState } from 'react';
import TermsModal from './TermsModal';

interface TermsAgreementProps {
  onTermsAgree: (agreed: boolean) => void;
  onPrivacyAgree: (agreed: boolean) => void;
  termsAgreed?: boolean;
  privacyAgreed?: boolean;
}

export default function TermsAgreement({
  onTermsAgree,
  onPrivacyAgree,
  termsAgreed = false,
  privacyAgreed = false
}: TermsAgreementProps) {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const handleTermsAgree = () => {
    onTermsAgree(true);
  };

  const handlePrivacyAgree = () => {
    onPrivacyAgree(true);
  };

  const handleTermsCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked) {
      onTermsAgree(false);
    }
  };

  const handlePrivacyCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked) {
      onPrivacyAgree(false);
    }
  };

  return (
    <>
      <div className="space-y-3">
        {/* 利用規約の同意 */}
        <div className="flex items-start">
          <input
            id="terms-agree"
            type="checkbox"
            checked={termsAgreed}
            onChange={handleTermsCheckboxChange}
            className="mt-1 mr-3 h-4 w-4 text-[#10B981] bg-[#1A1A1A] border-gray-600 rounded focus:ring-[#10B981] cursor-pointer"
          />
          <label htmlFor="terms-agree" className="text-sm text-gray-300 flex-1">
            <button
              type="button"
              onClick={() => setIsTermsModalOpen(true)}
              className="text-[#10B981] hover:text-[#0F9F6E] underline font-medium"
            >
              利用規約
            </button>
            を読み、同意します
            {termsAgreed && <span className="ml-2 text-[#10B981]">✓</span>}
          </label>
        </div>

        {/* プライバシーポリシーの同意 */}
        <div className="flex items-start">
          <input
            id="privacy-agree"
            type="checkbox"
            checked={privacyAgreed}
            onChange={handlePrivacyCheckboxChange}
            className="mt-1 mr-3 h-4 w-4 text-[#10B981] bg-[#1A1A1A] border-gray-600 rounded focus:ring-[#10B981] cursor-pointer"
          />
          <label htmlFor="privacy-agree" className="text-sm text-gray-300 flex-1">
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(true)}
              className="text-[#10B981] hover:text-[#0F9F6E] underline font-medium"
            >
              プライバシーポリシー
            </button>
            を読み、同意します
            {privacyAgreed && <span className="ml-2 text-[#10B981]">✓</span>}
          </label>
        </div>

        {/* 必須マーク */}
        <p className="text-xs text-gray-500 mt-2">
          <span className="text-red-400">*</span> 登録には両方への同意が必要です
        </p>
      </div>

      {/* 利用規約モーダル */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAgree={handleTermsAgree}
        type="terms"
      />

      {/* プライバシーポリシーモーダル */}
      <TermsModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onAgree={handlePrivacyAgree}
        type="privacy"
      />
    </>
  );
}
