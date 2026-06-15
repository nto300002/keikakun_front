import RecipientRegistrationForm from "@/components/protected/recipients/RecipientRegistrationForm";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function NewRecipientPage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 py-8 dark:bg-gradient-to-br dark:from-[#1a1f2e] dark:to-[#0f1419] dark:text-white">
      <div className="max-w-4xl mx-auto px-6">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: '利用者一覧', href: '/recipients' },
          { label: '新規登録', current: true }
        ]} />

        {/* Form */}
        <RecipientRegistrationForm />
      </div>
    </div>
  );
}
