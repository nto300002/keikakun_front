import Dashboard from '@/components/protected/dashboard/Dashboard';

export default function DashboardPage() {
  // UI設計意図: 福祉職員が期限・氏名・操作を一目で読めるよう、実表示はDashboard側で大きめの文字と文字ボタンに統一する。
  return <Dashboard />;
}
