'use client';

import { useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface ExpandableTextProps {
  text: string | undefined;
  maxLength?: number;
  className?: string;
}

export default function ExpandableText({
  text,
  maxLength = 50,
  className = ''
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text || text.length <= maxLength) {
    return <span className={className}>{text || '-'}</span>;
  }

  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <span className="whitespace-pre-wrap break-words">
        {isExpanded ? text : `${text.slice(0, maxLength)}...`}
      </span>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex-shrink-0 p-1 text-gray-400 hover:text-white hover:bg-[#2a3441] rounded transition-colors"
        title={isExpanded ? '閉じる' : '展開する'}
      >
        <ChevronRightIcon
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        />
      </button>
    </div>
  );
}
