'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, FileText, ChevronRight, Download, Loader2, FileX, AlertCircle, Filter, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import Breadcrumb, { BreadcrumbItem } from '@/components/ui/Breadcrumb';
import { pdfDeliverablesApi } from '@/lib/pdf-deliverables';
import { welfareRecipientsApi } from '@/lib/welfare-recipients';
import { PlanDeliverableListItem } from '@/types/pdf-deliverable';
import { RecipientOption } from '@/types/pdf';

interface PdfViewContentProps {
  initialPdfs: PlanDeliverableListItem[];
  initialTotal: number;
  currentPage: number;
  userRole: 'owner' | 'manager' | 'employee';
  officeId: string;
}

// ラベル定義
const DELIVERABLE_TYPE_LABELS: Record<string, string> = {
  assessment_sheet: 'アセスメントシート',
  monitoring_report_pdf: 'モニタリング報告書',
  draft_plan_pdf: '計画書（原案）',
  staff_meeting_minutes: '担当者会議議事録',
  final_plan_signed_pdf: '計画書（署名済）',
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function PdfViewContent({
  initialPdfs,
  initialTotal,
  currentPage,
  userRole, // eslint-disable-line @typescript-eslint/no-unused-vars
  officeId,
}: PdfViewContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pdfs, setPdfs] = useState<PlanDeliverableListItem[]>(initialPdfs);
  const [total, setTotal] = useState(initialTotal);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filterRecipient, setFilterRecipient] = useState(searchParams.get('recipient') || 'all');
  const [selectedPdf, setSelectedPdf] = useState<PlanDeliverableListItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [recipients, setRecipients] = useState<RecipientOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // 受給者一覧の取得
  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const response = await welfareRecipientsApi.list({ limit: 1000 });
        const recipientOptions: RecipientOption[] = response.recipients.map((r) => ({
          id: r.id,
          last_name: r.last_name,
          first_name: r.first_name,
        }));
        setRecipients(recipientOptions.sort((a, b) =>
          (a.last_name + a.first_name).localeCompare(b.last_name + b.first_name, 'ja')
        ));
      } catch (err) {
        console.error('Failed to fetch recipients:', err);
      }
    };

    fetchRecipients();
  }, []);

  // URLクエリパラメータの変更
  useEffect(() => {
    const fetchPdfs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (filterRecipient !== 'all') params.set('recipient', filterRecipient);

        // URLクエリパラメータの変更
        router.push(`/pdf-list?${params.toString()}`, { scroll: false });

        // PDF一覧の取得
        const skip = (currentPage - 1) * 20;
        const response = await pdfDeliverablesApi.getList({
          office_id: officeId,
          skip,
          limit: 20,
          search: debouncedSearch || undefined,
          recipient_ids: filterRecipient !== 'all' ? filterRecipient : undefined,
        });

        setPdfs(response.items);
        setTotal(response.total);
      } catch (err) {
        console.error('Failed to fetch PDFs:', err);
        setError('PDF一覧の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPdfs();
  }, [debouncedSearch, filterRecipient, currentPage, router, officeId]);

  // PDFプレビューの表示
  const handleOpenPreview = useCallback((pdf: PlanDeliverableListItem) => {
    setSelectedPdf(pdf);
    setIsPreviewOpen(true);
  }, []);

  // PDFダウンロード
  const handleDownload = useCallback(() => {
    if (selectedPdf) {
      const url = selectedPdf.download_url || selectedPdf.file_path;
      window.open(url, '_blank');
    }
  }, [selectedPdf]);


  // ページ変更
  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    if (searchQuery) params.set('search', searchQuery);
    if (filterRecipient !== 'all') params.set('recipient', filterRecipient);

    router.push(`/pdf-list?${params.toString()}`);
  }, [searchQuery, filterRecipient, router]);

  // 検索結果リセット
  const handleReset = useCallback(() => {
    setSearchQuery('');
    setFilterRecipient('all');
    router.push('/pdf-list?page=1');
  }, [router]);

  // PDF一覧の取得
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 総ページ数の計算
  const totalPages = Math.ceil(total / 20);

  // パンくずリストアイテム
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'PDF一覧', current: true }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* パンくずリスト */}
      <Breadcrumb items={breadcrumbItems} />

      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">PDF一覧</h1>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* 検索 */}
          <div className="relative w-full sm:w-96">
            <Input
              type="text"
              placeholder="検索キーワード"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          {/* 利用者絞り込み */}
          <Select value={filterRecipient} onValueChange={setFilterRecipient}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="利用者で絞り込み" />
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-[300px] z-50 bg-white dark:bg-gray-900 border border-gray-50 dark:border-gray-200 shadow-lg">
              <SelectItem value="all">全て</SelectItem>
              {recipients.map((recipient) => (
                <SelectItem key={recipient.id} value={recipient.id}>
                  {recipient.last_name} {recipient.first_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* リセットボタン */}
          {(searchQuery || filterRecipient !== 'all') && (
            <Button
              variant="outline"
              size="default"
              onClick={handleReset}
              className="w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              リセット
            </Button>
          )}
        </div>
      </div>

      {/* エラー */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 読み込み中 */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">PDFを読み込み中...</p>
        </div>
      )}

      {/* 空状態 */}
      {!isLoading && pdfs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileX className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">PDFは見つかりません</h3>
          <p className="text-muted-foreground">この事業所にアップロードされたPDFはありません</p>
        </div>
      )}

      {/* PDF一覧 */}
      {!isLoading && pdfs.length > 0 && (
        <div
          role="list"
          aria-label="PDF一覧"
          className="space-y-3"
        >
          {pdfs.map((pdf) => (
            <Card
              key={pdf.id}
              role="listitem"
              aria-label={`${pdf.original_filename}, ${pdf.welfare_recipient?.full_name || ''}さん, ${DELIVERABLE_TYPE_LABELS[pdf.deliverable_type] || pdf.deliverable_type}`}
              className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => handleOpenPreview(pdf)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleOpenPreview(pdf);
              }}
              tabIndex={0}
            >
              <div className="flex items-start justify-between gap-4">
                {/* タイトルとメタ */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                    <h3 className="font-semibold text-lg truncate">{pdf.original_filename}</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      {pdf.welfare_recipient?.full_name || ''} さん
                    </span>
                    <span>|</span>
                    <span>{pdf.uploaded_by?.name}</span>
                    <span>|</span>
                    <span>{formatDate(pdf.uploaded_at)}</span>
                    {pdf.plan_cycle && (
                      <>
                        <span>|</span>
                        <span>（第{pdf.plan_cycle.cycle_number}サイクル）</span>
                      </>
                    )}
                  </div>
                </div>

                {/* ラベルと矢印 */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="secondary">
                    {DELIVERABLE_TYPE_LABELS[pdf.deliverable_type] || pdf.deliverable_type}
                  </Badge>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ページネーション */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            前
          </Button>

          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 10) {
              pageNum = i + 1;
            } else if (currentPage <= 5) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 4) {
              pageNum = totalPages - 9 + i;
            } else {
              pageNum = currentPage - 4 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? 'default' : 'outline'}
                onClick={() => handlePageChange(pageNum)}
                className="min-w-[40px]"
              >
                {pageNum}
              </Button>
            );
          })}

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            次
          </Button>
        </div>
      )}

      {/* PDFプレビュー */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedPdf?.original_filename}</DialogTitle>
            <DialogDescription>
              {selectedPdf && (
                <>
                  {selectedPdf.welfare_recipient?.full_name || ''} さん | {' '}
                  {DELIVERABLE_TYPE_LABELS[selectedPdf.deliverable_type] || selectedPdf.deliverable_type}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto bg-gray-100 rounded">
            {selectedPdf && (
              <iframe
                src={selectedPdf.download_url || selectedPdf.file_path}
                className="w-full h-full"
                title="PDF Preview"
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              ダウンロード
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
