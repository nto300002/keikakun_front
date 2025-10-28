'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PdfViewContent from '@/components/protected/pdf-list/PdfViewContent';
import { authApi } from '@/lib/auth';
import { pdfDeliverablesApi } from '@/lib/pdf-deliverables';
import { PlanDeliverableListResponse } from '@/types/pdf-deliverable';
import { Loader2 } from 'lucide-react';

export default function PdfViewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'owner' | 'manager' | 'employee'>('employee');
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
        console.log('[DEBUG] Fetching user data...');
        // 認証チェック
        const currentUser = await authApi.getCurrentUser();
        console.log('[DEBUG] Current user:', currentUser);
        setUserRole(currentUser.role);

        // office_idの取得
        if (!currentUser.office?.id) {
          console.error('[ERROR] User has no office associated');
          router.push('/auth/select-office');
          return;
        }
        console.log('[DEBUG] Office ID:', currentUser.office.id);
        setOfficeId(currentUser.office.id);

        // URLパラメータ取得
        const page = Number(searchParams.get('page')) || 1;
        const search = searchParams.get('search') || '';
        const recipientId = searchParams.get('recipient') || '';
        console.log('[DEBUG] URL params - page:', page, 'search:', search, 'recipientId:', recipientId);

        // PDF一覧取得
        const skip = (page - 1) * 20;
        console.log('[DEBUG] Calling pdfDeliverablesApi.getList with skip:', skip);
        const data = await pdfDeliverablesApi.getList({
          office_id: currentUser.office.id,
          skip,
          limit: 20,
          search: search || undefined,
          recipient_ids: recipientId && recipientId !== 'all' ? recipientId : undefined,
        });

        console.log('[DEBUG] PDF data received:', data);
        setPdfData(data);
      } catch (error) {
        console.error('[ERROR] Failed to fetch data:', error);
        if (error instanceof Error) {
          console.error('[ERROR] Error message:', error.message);
          console.error('[ERROR] Error stack:', error.stack);
        }
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
