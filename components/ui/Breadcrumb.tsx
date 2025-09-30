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
      <ol className="flex items-center space-x-2 text-sm">
        {/* ダッシュボード（ホーム） */}
        <li>
          <Link
            href="/dashboard"
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <HomeIcon className="w-4 h-4 mr-1" />
            ダッシュボード
          </Link>
        </li>

        {/* 各パンくずリストアイテム */}
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRightIcon className="w-4 h-4 text-gray-500 mx-2" />
            {item.current || !item.href ? (
              <span className="text-white font-medium" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-400 hover:text-white transition-colors"
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