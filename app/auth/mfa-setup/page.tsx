'use client'

import MfaSetupForm from '@/components/auth/MfaSetupForm'
import { Suspense } from 'react'

export default function MfaSetupPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0C1421]">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-gray-700 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center text-slate-950 dark:text-white">2段階認証の設定</h1>
                <p className="text-sm text-center text-slate-600 dark:text-gray-400">
                    セキュリティ強化のため、2段階認証を設定してください。
                </p>
                <Suspense fallback={<div>読み込み中...</div>}>
                    <MfaSetupForm />
                </Suspense>
            </div>
        </div>
    )
}
