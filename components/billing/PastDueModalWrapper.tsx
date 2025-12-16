'use client';

import { useState, useEffect } from 'react';
import { useBilling } from '@/contexts/BillingContext';
import PastDueModal from './PastDueModal';

/**
 * PastDueModal のラッパーコンポーネント
 *
 * BillingContext から isPastDue を取得し、
 * 支払い遅延状態の場合にモーダルを自動表示する。
 *
 * このコンポーネントは BillingProvider の子コンポーネントとして配置する必要があります。
 */
export default function PastDueModalWrapper() {
  const { isPastDue } = useBilling();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isPastDue) {
      setShowModal(true);
    }
  }, [isPastDue]);

  return <PastDueModal isOpen={showModal} onClose={() => setShowModal(false)} />;
}
