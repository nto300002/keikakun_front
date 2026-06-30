'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PdfViewContent from '@/components/protected/pdf-list/PdfViewContent';
import { authApi } from '@/lib/auth';
import { pdfDeliverablesApi } from '@/lib/pdf-deliverables';
import { PlanDeliverableListResponse } from '@/types/pdf-deliverable';
import { StaffRole } from '@/types/staff';
import { Loader2 } from 'lucide-react';

export default function PdfViewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<StaffRole>('employee');
  const [officeId, setOfficeId] = useState<string>('');
  const [pdfData, setPdfData] = useState<PlanDeliverableListResponse>({
    items: [],
    total: 0,
    skip: 0,
    limit: 20,
    has_more: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 認証チェック
        const currentUser = await authApi.getCurrentUser();
        setUserRole(currentUser.role);

        // office_idの取得
        if (!currentUser.office?.id) {
          router.push('/auth/select-office');
          return;
        }
        setOfficeId(currentUser.office.id);

        // URLパラメータ取得
        const page = Number(searchParams.get('page')) || 1;
        const search = searchParams.get('search') || '';
        const recipientId = searchParams.get('recipient') || '';

        // PDF一覧取得
        const skip = (page - 1) * 20;
        const data = await pdfDeliverablesApi.getList({
          office_id: currentUser.office.id,
          skip,
          limit: 20,
          search: search || undefined,
          recipient_ids: recipientId && recipientId !== 'all' ? recipientId : undefined,
        });

        setPdfData(data);
      } catch {
        console.error('PDF一覧の取得に失敗しました');
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router, searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const page = Number(searchParams.get('page')) || 1;

  if (!officeId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PdfViewContent
      initialPdfs={pdfData.items}
      initialTotal={pdfData.total}
      currentPage={page}
      userRole={userRole}
      officeId={officeId}
    />
  );
}
