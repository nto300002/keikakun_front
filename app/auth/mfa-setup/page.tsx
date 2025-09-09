'use client'

import MfaSetupForm from '@/components/auth/MfaSetupForm'
import { Suspense } from 'react'

export default function MfaSetupPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center text-gray-900">2段階認証の設定</h1>
                <p className="text-sm text-center text-gray-600">
                    セキュリティ強化のため、2段階認証を設定してください。
                </p>
                <Suspense fallback={<div>読み込み中...</div>}>
                    <MfaSetupForm />
                </Suspense>
            </div>
        </div>
    )
}
