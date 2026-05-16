import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-white px-8 py-10 shadow-[var(--shadow-soft)]">
        <div className="mb-8 flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--primary)] text-sm font-bold text-white shadow-sm">
            P
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-950">PBC Quote Calculator</h1>
            <p className="mt-1 text-sm text-slate-500">Internal quote automation tool</p>
          </div>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
