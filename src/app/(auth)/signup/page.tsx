import { Timer } from 'lucide-react';
import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';

export const metadata = {
  title: '회원가입',
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-amber-50 px-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500">
          <Timer className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-900">FocusFlow</span>
      </Link>
      <SignupForm />
    </div>
  );
}
