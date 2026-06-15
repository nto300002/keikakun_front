'use client';

import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="パンくずリスト" className="mb-6">
      {/* UI設計意図: パンくずも主要導線として扱い、text-base以上とライト/ダーク双方の十分なコントラストを確保する。 */}
      <ol className="flex items-center space-x-2 text-base font-semibold">
        {/* ダッシュボード（ホーム） */}
        <li>
          <Link
            href="/dashboard"
            className="flex items-center text-slate-600 hover:text-slate-950 transition-colors dark:text-gray-300 dark:hover:text-white"
          >
            <HomeIcon className="w-5 h-5 mr-1.5" />
            ダッシュボード
          </Link>
        </li>

        {/* 各パンくずリストアイテム */}
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRightIcon className="w-5 h-5 text-slate-400 mx-2 dark:text-gray-500" />
            {item.current || !item.href ? (
              <span className="text-slate-950 font-bold dark:text-white" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-slate-600 hover:text-slate-950 transition-colors dark:text-gray-300 dark:hover:text-white"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
