'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'
import { http } from '@/lib/http'

type EnrollResponse = {
  qr_code_uri: string
  secret_key: string
}

const authenticatorApps = [
    {
        platform: 'iPhone / iPad',
        url: 'https://apps.apple.com/app/google-authenticator/id388497605',
    },
    {
        platform: 'Android',
        url: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2',
    },
]

function MfaSetupFormComponent() {
    const router = useRouter()
    const [qrCodeUri, setQrCodeUri] = useState('')
    const [secretKey, setSecretKey] = useState('')
    const [totpCode, setTotpCode] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [enrollError, setEnrollError] = useState(false)
    const [verifyAttempts, setVerifyAttempts] = useState(0)

    useEffect(() => {
        // Cookie認証: httpOnly Cookieから自動的に認証
        // 401エラー時は http.ts で自動的にログインページにリダイレクト

        const enrollMfa = async () => {
            setLoading(true)
            setError('')
            setEnrollError(false)

            try {
                const response = await http.post<EnrollResponse>(
                    `/api/v1/auth/mfa/enroll`,
                    {}
                )
                // http.request は body を直接返す（fetch ベース）
                setQrCodeUri(response.qr_code_uri)
                setSecretKey(response.secret_key)
                setEnrollError(false)
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err)
                setError(message || '2段階認証の設定の開始に失敗しました。')
                setEnrollError(true)
            } finally {
                setLoading(false)
            }
        }

        enrollMfa()
    }, [router])

    // 再試行ハンドラー
    const handleRetry = () => {
        setQrCodeUri('')
        setSecretKey('')
        setError('')
        setEnrollError(false)
        setLoading(true)

        // QRコード再取得
        const enrollMfa = async () => {
            try {
                const response = await http.post<EnrollResponse>(
                    `/api/v1/auth/mfa/enroll`,
                    {}
                )
                setQrCodeUri(response.qr_code_uri)
                setSecretKey(response.secret_key)
                setEnrollError(false)
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err)
                setError(message || '2段階認証の設定の開始に失敗しました。')
                setEnrollError(true)
            } finally {
                setLoading(false)
            }
        }

        enrollMfa()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Cookie認証: httpOnly Cookieから自動的に認証
        try {
            await http.post<void>(`/api/v1/auth/mfa/verify`,
                { totp_code: totpCode }
            )

            alert('2段階認証が有効になりました。ダッシュボードに戻ります。')
            router.push('/dashboard')

        } catch (err: unknown) {
            setVerifyAttempts(prev => prev + 1)
            const message = err instanceof Error ? err.message : String(err)
            let errorMessage = message || '無効なコードです。新しいコードを試してください。'

            // エラーヒントを追加
            if (verifyAttempts >= 1) {
                errorMessage += '\n\nヒント: QRコードを再スキャンして、最新のコードを入力してください。認証アプリのコードは30秒ごとに更新されます。'
            }

            setError(errorMessage)
        }
    }

    if (loading) {
        return <div className="text-center">QRコードを生成しています...</div>
    }

    if (error && !qrCodeUri) {
        return (
            <div className="space-y-4">
                <div className="text-red-500 text-center whitespace-pre-wrap">{error}</div>
                {enrollError && (
                    <div className="text-center">
                        <button
                            onClick={handleRetry}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            QRコードを再取得
                        </button>
                        <p className="mt-2 text-sm text-slate-600 dark:text-gray-400">
                            問題が解決しない場合は、管理者にお問い合わせください。
                        </p>
                    </div>
                )}
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/40 dark:bg-blue-950/30">
                <h2 className="text-base font-semibold text-blue-950 dark:text-blue-100">
                    認証アプリを準備してください
                </h2>
                <p className="mt-2 text-sm text-blue-900 dark:text-blue-200">
                    Google Authenticator などの認証アプリが必要です。未インストールの場合は、お使いの端末に合わせて入手してください。
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {authenticatorApps.map((app) => (
                        <div
                            key={app.platform}
                            className="rounded-md border border-blue-200 bg-white p-3 dark:border-blue-500/30 dark:bg-gray-900"
                        >
                            <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">{app.platform}</p>
                            <div className="flex items-center gap-3">
                                <div className="rounded bg-white p-2">
                                    <QRCodeCanvas value={app.url} size={88} />
                                </div>
                                <a
                                    href={app.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                                >
                                    Google Authenticator を開く
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col items-center">
                <p className="text-slate-700 dark:text-gray-300 mb-4">
                    認証アプリ（Google Authenticatorなど）で以下のQRコードをスキャンしてください。
                </p>
                {qrCodeUri && (
                    <div className="p-4 bg-white border rounded-lg">
                        <QRCodeCanvas value={qrCodeUri} size={200} />
                    </div>
                )}
                <p className="mt-4 text-sm text-slate-600 dark:text-gray-400">または、以下のキーを手動で入力してください。</p>
                <p className="mt-1 text-sm font-mono p-2 bg-slate-100 text-slate-950 dark:bg-gray-700 dark:text-white rounded">{secretKey}</p>
            </div>

            <div>
                <label htmlFor="totp-code" className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                    認証アプリに表示された6桁のコード
                </label>
                <input
                    id="totp-code"
                    name="totp-code"
                    type="text"
                    required
                    className="w-full px-3 py-2 mt-1 bg-white text-slate-950 placeholder-slate-400 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-[#1A1A1A] dark:text-white dark:placeholder-gray-500 dark:border-gray-600"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                />
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-500 text-sm whitespace-pre-wrap">{error}</p>
                    {verifyAttempts >= 2 && (
                        <button
                            type="button"
                            onClick={handleRetry}
                            className="mt-3 w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            QRコードを再取得して最初からやり直す
                        </button>
                    )}
                </div>
            )}

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
