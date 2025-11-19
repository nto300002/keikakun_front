'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'
import { mfaApi } from '@/lib/api/mfa'
import { tokenUtils } from '@/lib/auth'
import { toast } from '@/lib/toast-debug'

function MfaFirstSetupFormComponent() {
    const router = useRouter()
    const [qrCodeUri, setQrCodeUri] = useState('')
    const [secretKey, setSecretKey] = useState('')
    const [message, setMessage] = useState('')
    const [totpCode, setTotpCode] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [verifyAttempts, setVerifyAttempts] = useState(0)

    useEffect(() => {
        // セッションストレージからMFA設定情報を取得
        const qrUri = sessionStorage.getItem('mfa_qr_code_uri')
        const secret = sessionStorage.getItem('mfa_secret_key')
        const msg = sessionStorage.getItem('mfa_setup_message')

        if (!qrUri || !secret) {
            setError('MFA設定情報が見つかりません。再度ログインしてください。')
            setTimeout(() => {
                router.push('/auth/login')
            }, 3000)
            return
        }

        setQrCodeUri(qrUri)
        setSecretKey(secret)
        setMessage(msg || '管理者がMFAを設定しました。以下の情報でTOTPアプリに登録してください。')
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // 一時トークンを取得
            const temporaryToken = tokenUtils.getTemporaryToken()
            if (!temporaryToken) {
                throw new Error('一時トークンが見つかりません。再度ログインしてください。')
            }

            // MFA初回検証を実行
            await mfaApi.verifyMfaFirstTime(temporaryToken, totpCode)

            // セッションストレージをクリア
            sessionStorage.removeItem('mfa_qr_code_uri')
            sessionStorage.removeItem('mfa_secret_key')
            sessionStorage.removeItem('mfa_setup_message')
            tokenUtils.removeTemporaryToken()

            toast.success('MFAの初回検証が完了しました。ログインに成功しました。')
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
        } finally {
            setLoading(false)
        }
    }

    if (error && !qrCodeUri) {
        return (
            <div className="min-h-screen bg-[#0C1421] flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="bg-[#2A2A2A] rounded-lg border border-gray-700 p-8">
                        <div className="text-red-400 text-center whitespace-pre-wrap">{error}</div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0C1421] flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        MFA初回設定
                    </h2>
                    <p className="text-gray-400">
                        {message}
                    </p>
                </div>

                <div className="bg-[#2A2A2A] rounded-lg border border-gray-700 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-center">
                            <p className="text-gray-300 mb-4 text-center">
                                認証アプリ（Google Authenticatorなど）で以下のQRコードをスキャンしてください。
                            </p>
                            {qrCodeUri && (
                                <div className="p-4 bg-white border border-gray-600 rounded-lg">
                                    <QRCodeCanvas value={qrCodeUri} size={200} />
                                </div>
                            )}
                            <p className="mt-4 text-sm text-gray-400">または、以下のキーを手動で入力してください。</p>
                            <p className="mt-2 text-sm font-mono p-2 bg-[#1A1A1A] border border-gray-600 rounded text-white">
                                {secretKey}
                            </p>
                        </div>

                        <div>
                            <label htmlFor="totp-code" className="block text-sm font-medium text-gray-300 mb-2">
                                認証アプリに表示された6桁のコード <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="totp-code"
                                name="totp-code"
                                type="text"
                                required
                                className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                                value={totpCode}
                                onChange={(e) => setTotpCode(e.target.value)}
                                placeholder="123456"
                                maxLength={6}
                                autoComplete="off"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                <p className="text-red-400 text-sm whitespace-pre-wrap">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? '検証中...' : '確認して有効化'}
                        </button>

                        <div className="mt-4 text-center">
                            <a
                                href="/auth/login"
                                className="text-sm text-gray-400 hover:text-gray-300 underline"
                            >
                                ログイン画面に戻る
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default function MfaFirstSetupForm() {
    return (
        <Suspense fallback={<div>読み込み中...</div>}>
            <MfaFirstSetupFormComponent />
        </Suspense>
    )
}
