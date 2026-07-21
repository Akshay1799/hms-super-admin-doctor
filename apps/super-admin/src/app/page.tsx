import { LoginForm } from "@/features/auth/components/LoginForm";

export default function RootPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </main>
  );
}
