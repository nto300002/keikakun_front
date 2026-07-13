/* eslint-disable @typescript-eslint/no-require-imports */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = process.cwd();

test('Issue 186 frontend acceptance checklist: user-facing copy avoids technical terms', () => {
  const acceptanceChecklist = {
    'エラー・成功メッセージに不要な英語が残っていない': {
      'components/protected/support_plan/PlanDeliverableModal.tsx': ['HTTP error!', 'CORS設定', 'PDF Preview'],
      'components/protected/pdf-list/PdfViewContent.tsx': ['PDF Preview'],
      'components/protected/profile/RequestCard.tsx': ['Role Change Request', 'Employee Action Request'],
    },
    'ユーザー向け画面で認証・権限の専門用語が表示されない': {
      'components/auth/MfaFirstSetupForm.tsx': ['MFA', 'TOTPアプリ', '一時トークン'],
      'components/auth/MfaSetupForm.tsx': ['MFA登録'],
      'app/auth/mfa-verify/page.tsx': ['MFA', '一時トークン'],
      'components/protected/admin/AdminMenu.tsx': ['TOTPアプリ', 'JSONファイル'],
      'components/protected/admin/StaffManagementTab.tsx': ['TOTPアプリ'],
      'components/common/EmployeeActionRequestModal.tsx': ['マネージャー/オーナー'],
      'components/protected/recipients/RecipientEditForm.tsx': ['Manager/Owner'],
      'components/protected/recipients/RecipientRegistrationForm.tsx': ['Manager/Owner'],
      'lib/authFlow.ts': ['MFA認証'],
      'lib/dal.ts': ['未認証:', 'アクセス拒否:'],
    },
    'リクエストは申請または依頼に統一されている': {
      'components/common/EmployeeActionRequestModal.tsx': [
        '承認リクエスト',
        'リクエストの送信',
        'リクエスト理由',
        'リクエスト送信',
      ],
      'components/notice/ApprovalRequestsTab.tsx': [
        '承認リクエスト',
        '権限変更リクエストを承認しました',
        '権限変更リクエストを却下しました',
        '利用者の作成、編集、削除リクエスト',
      ],
      'components/notice/NoticeCard.tsx': [
        '権限変更リクエスト',
        '一般社員の作成、編集、削除リクエスト',
        'このリクエスト',
      ],
      'components/notice/NoticeDetail.tsx': [
        '権限変更リクエスト',
        '一般社員の作成、編集、削除リクエスト',
        'このリクエスト',
      ],
      'components/notice/NotificationsTab.tsx': [
        '権限変更リクエスト',
        'Role変更リクエスト',
        'Employee制限リクエスト',
        '利用者の作成、編集、削除リクエスト',
      ],
      'components/protected/profile/RoleChangeModal.tsx': [
        '権限変更リクエスト',
        'リクエストの送信',
        'リクエストする権限',
        'リクエスト送信',
      ],
      'components/protected/profile/SentRequestsTab.tsx': [
        '権限変更リクエスト',
        '利用者の作成、編集、削除リクエスト',
        '送信済みリクエスト',
        'リクエストはありません',
        'このリクエストを取り消しますか',
      ],
      'components/protected/profile/Profile.tsx': [
        'メールアドレス変更リクエスト',
        '権限変更をリクエスト',
        'Role変更リクエスト',
      ],
      'components/protected/profile/RequestCard.tsx': [
        '権限変更リクエスト',
        'リクエストデータ',
        'リクエスト',
      ],
      'components/protected/dashboard/Dashboard.tsx': [
        '削除リクエスト',
        'リクエスト送信',
        'ページをリロード',
      ],
    },
    'ステータスは状態に統一されている': {
      'components/protected/app-admin/tabs/InquiriesTab.tsx': ['ステータス:'],
      'components/protected/dashboard/ActiveFilters.tsx': ['ステータス:'],
      'components/ui/google/CalendarLinkButton.tsx': ['ステータス:'],
      'components/protected/admin/GoogleIntegrationTab.tsx': ['接続ステータス'],
      'components/protected/admin/PlanTab.tsx': ['現在のステータス', '>ステータス<'],
    },
    'トークンは確認リンクまたは認証情報に言い換えられている': {
      'app/auth/verify-email/page.tsx': ['認証トークン'],
      'app/auth/verify-email-change/page.tsx': ['確認トークン', 'トークンが無効'],
      'components/auth/ResetPasswordForm.tsx': ['トークンを確認中', 'トークンが見つかりません', 'トークンエラー'],
      'lib/http.ts': ['CSRFトークンの取得に失敗しました', 'CSRF token validation failed'],
    },
    'アーカイブとインポートは保管・取り込みに統一されている': {
      'components/notice/MessageCard.tsx': ['アーカイブ'],
      'components/notice/MessagesTab.tsx': ['アーカイブ'],
      'components/ui/ics-download-control.tsx': ['インポート'],
    },
    '管理者向けに必要な専門用語は説明されているか、表示用語に置換されている': {
      'components/protected/admin/GoogleIntegrationTab.tsx': ['サービスアカウント JSON ファイル'],
      'components/auth/TermsModal.tsx': ['Webhook処理ログ', 'トークン方式'],
    },
  };

  const checks = {
    'components/common/EmployeeActionRequestModal.tsx': ['承認リクエスト'],
    'components/notice/ApprovalRequestsTab.tsx': [
      '承認リクエスト',
      '権限変更リクエストを承認しました',
      '権限変更リクエストを却下しました',
    ],
    'components/protected/app-admin/AppAdminDashboard.tsx': ['承認リクエスト'],
    'components/protected/app-admin/appAdminTabs.ts': ['承認リクエスト'],
    'components/protected/app-admin/OfficePreview.tsx': ['>MFA<'],
    'components/notice/NoticeCard.tsx': ['権限変更リクエスト'],
    'components/notice/NotificationsTab.tsx': ['権限変更リクエストを承認しました'],
    'components/notice/NoticeDetail.tsx': ['権限変更リクエスト'],
    'components/protected/app-admin/tabs/ApprovalRequestsTab.tsx': ['退会リクエスト'],
    'components/protected/app-admin/tabs/AuditLogTab.tsx': ['退会リクエスト'],
    'components/protected/app-admin/tabs/InquiriesTab.tsx': ['ステータス:'],
    'app/auth/verify-email/page.tsx': ['認証トークン'],
    'app/auth/verify-email-change/page.tsx': ['確認トークン'],
    'components/protected/profile/RoleChangeModal.tsx': ['権限変更リクエスト'],
    'components/protected/profile/RequestCard.tsx': ['計画ステータス', '権限変更リクエスト'],
    'components/protected/profile/Profile.tsx': ['権限変更リクエストを送信しました'],
    'components/protected/profile/SentRequestsTab.tsx': [
      '権限変更リクエストを取り消しました',
      '送信済みリクエスト',
    ],
    'components/protected/dashboard/ActiveFilters.tsx': ['ステータス:'],
    'components/ui/google/CalendarLinkButton.tsx': ['ステータス:'],
    'components/protected/admin/GoogleIntegrationTab.tsx': ['接続ステータス'],
    'components/protected/admin/PlanTab.tsx': ['現在のステータス', '>ステータス<'],
    'components/auth/MfaPrompt.tsx': ['2段階認証（MFA）'],
    'components/auth/ResetPasswordForm.tsx': ['トークンを確認中'],
    'components/ui/ics-download-control.tsx': ['インポート'],
    'components/auth/TermsModal.tsx': ['Webhook処理ログ', 'トークン方式'],
  };

  const combinedChecks = { ...checks };
  for (const [requirement, files] of Object.entries(acceptanceChecklist)) {
    for (const [relativePath, bannedTerms] of Object.entries(files)) {
      combinedChecks[relativePath] = [
        ...(combinedChecks[relativePath] || []),
        ...bannedTerms.map((term) => `${requirement}::${term}`),
      ];
    }
  }

  const violations = [];
  for (const [relativePath, bannedTerms] of Object.entries(combinedChecks)) {
    const source = readFileSync(join(root, relativePath), 'utf8');
    for (const item of bannedTerms) {
      const [requirement, term] = item.includes('::')
        ? item.split('::')
        : ['既存チェック', item];
      if (source.includes(term)) {
        violations.push(`[${requirement}] ${relativePath}: ${term}`);
      }
    }
  }

  assert.deepEqual(violations, []);
});
