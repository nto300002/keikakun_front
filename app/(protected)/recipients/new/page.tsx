import RecipientRegistrationForm from "@/components/protected/recipients/RecipientRegistrationForm";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function NewRecipientPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] text-white py-8">
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
