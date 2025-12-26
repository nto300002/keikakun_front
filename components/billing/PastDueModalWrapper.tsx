'use client';

import { useState, useEffect } from 'react';
import { useBilling } from '@/contexts/BillingContext';
import PastDueModal from './PastDueModal';

const MODAL_SHOWN_KEY = 'pastDueModalShown';

/**
 * PastDueModal のラッパーコンポーネント
 *
 * BillingContext から isPastDue を取得し、
 * 支払い遅延状態の場合にモーダルを自動表示する。
 *
 * セッションごとに一度だけモーダルを表示する仕組み：
 * - sessionStorageを使用して、このセッション中にモーダルを表示したかを記録
 * - ログアウト/ブラウザを閉じるとsessionStorageはクリアされ、次回ログイン時に再度表示
 *
 * このコンポーネントは BillingProvider の子コンポーネントとして配置する必要があります。
 */
export default function PastDueModalWrapper() {
  const { isPastDue } = useBilling();
  const [showModal, setShowModal] = useState(false);

  // isPastDueが変化したときにモーダル表示状態を更新（セッション中に一度だけ）
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window === 'undefined') return;

    // past_due状態で、かつこのセッションでまだモーダルを表示していない場合
    const hasShownModal = sessionStorage.getItem(MODAL_SHOWN_KEY) === 'true';
    if (isPastDue && !hasShownModal) {
      setShowModal(true);
      // セッションストレージに記録（このセッション中は二度と表示しない）
      sessionStorage.setItem(MODAL_SHOWN_KEY, 'true');
    }
  }, [isPastDue]);

  const handleClose = () => {
    setShowModal(false);
    // モーダルを閉じた時点で既に記録済みなので、追加の処理は不要
  };

  return <PastDueModal isOpen={showModal} onClose={handleClose} />;
}
