import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="pbc-auth">
      <div className="pbc-authcard">
        <div className="pbc-authhead">
          <div className="pbc-brand__mark">P</div>
          <div>
            <h1>PBC Quote Calculator</h1>
            <p>Internal quote automation tool</p>
          </div>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
