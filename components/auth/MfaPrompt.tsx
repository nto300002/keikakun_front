'use client'

import Link from 'next/link'

export default function MfaPrompt() {
    return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-md">
            <div className="flex">
                <div className="py-1">
                    <svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8h2v2H9v-2z"/></svg>
                </div>
                <div>
                    <p className="font-bold">アカウントのセキュリティを強化しましょう</p>
                    <p className="text-sm">2段階認証（MFA）が設定されていません。第三者による不正アクセスを防ぐため、設定を強くお勧めします。</p>
                    <Link href="/auth/mfa-setup" className="mt-2 inline-block bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600 transition-colors duration-200">
                        今すぐ設定する
                    </Link>
                </div>
            </div>
        </div>
    )
}
