'use client'

import { useActionState } from 'react'
import { signIn } from '@/lib/actions/auth'
import { initialAuthState } from '@/lib/actions/auth-state'

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialAuthState)

  return (
    <form action={formAction} className="pbc-form">
      <div className="pbc-field">
        <label htmlFor="email" className="pbc-field__label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          className="pbc-input"
          placeholder="you@example.com"
        />
      </div>

      <div className="pbc-field">
        <label htmlFor="password" className="pbc-field__label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="pbc-input"
          placeholder="Password"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="pbc-btn pbc-btn--primary pbc-btn--full"
      >
        {pending ? 'Signing in...' : 'Sign In'}
      </button>

      {state.error ? (
        <p className="pbc-alert pbc-alert--danger" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  )
}
