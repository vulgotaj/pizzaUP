import { RegisterForm } from '@/components/forms/register-form';
import { requiredAdmin } from '@/lib/auth';

export default async function Register() {
  await requiredAdmin();
  return (
    <div className="bg-app-background min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full"><RegisterForm /></div>
    </div>
  );
}
