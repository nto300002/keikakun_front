'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'
import { http } from '@/lib/http'

type EnrollResponse = {
  qr_code_uri: string
  secret_key: string
}

function MfaSetupFormComponent() {
    const router = useRouter()
    const [qrCodeUri, setQrCodeUri] = useState('')
    const [secretKey, setSecretKey] = useState('')
    const [totpCode, setTotpCode] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Cookie認証: httpOnly Cookieから自動的に認証
        // 401エラー時は http.ts で自動的にログインページにリダイレクト

        const enrollMfa = async () => {
            try {
                const response = await http.post<EnrollResponse>(
                    `/api/v1/auth/mfa/enroll`,
                    {}
                )
                // http.request は body を直接返す（fetch ベース）
                setQrCodeUri(response.qr_code_uri)
                setSecretKey(response.secret_key)
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err)
                setError(message || 'MFA登録の開始に失敗しました。')
            } finally {
                setLoading(false)
            }
        }

        enrollMfa()
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Cookie認証: httpOnly Cookieから自動的に認証
        try {
            await http.post(`/api/v1/auth/mfa/verify`,
                { totp_code: totpCode }
            )

            alert('2段階認証が有効になりました。ダッシュボードに戻ります。')
            router.push('/dashboard')

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            setError(message || '無効なコードです。新しいコードを試してください。')
        }
    }

    if (loading) {
        return <div className="text-center">QRコードを生成しています...</div>
    }

    if (error && !qrCodeUri) {
        return <div className="text-red-500 text-center">{error}</div>
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
                <p className="text-gray-700 mb-4">
                    認証アプリ（Google Authenticatorなど）で以下のQRコードをスキャンしてください。
                </p>
                {qrCodeUri && (
                    <div className="p-4 bg-white border rounded-lg">
                        <QRCodeCanvas value={qrCodeUri} size={200} />
                    </div>
                )}
                <p className="mt-4 text-sm text-gray-600">または、以下のキーを手動で入力してください。</p>
                <p className="mt-1 text-sm font-mono p-2 bg-gray-500 rounded">{secretKey}</p>
            </div>

            <div>
                <label htmlFor="totp-code" className="block text-sm font-medium text-gray-700">
                    認証アプリに表示された6桁のコード
                </label>
                <input
                    id="totp-code"
                    name="totp-code"
                    type="text"
                    required
                    className="w-full px-3 py-2 mt-1 text-gray-600 border border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
                type="submit"
                className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                確認して有効化
            </button>
        </form>
    )
}

export default function MfaSetupForm() {
    return (
        <Suspense fallback={<div>読み込み中...</div>}>
            <MfaSetupFormComponent />
        </Suspense>
    )
}
