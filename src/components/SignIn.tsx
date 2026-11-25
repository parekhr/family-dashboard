import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { modalFontClass, modalTitleClass, raisedPrimaryClass } from './styles'

export function SignIn() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) setError('Wrong email or password.')
    }
    // Only users who have an account created on Supabase can sign in
    return (
        <div className="flex h-[800px] w-[1280px] items-center justify-center bg-page text-ink">
            <form onSubmit={handleSubmit} className={`flex w-[360px] flex-col gap-3 rounded-3xl bg-card p-6 ${modalFontClass}`}>
                <h3 className={modalTitleClass}>Sign in</h3>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-control border border-muted/30 bg-white px-3"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-control border border-muted/30 bg-white px-3"
                />
                {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
                <button type="submit" className={`h-11 rounded-control ${raisedPrimaryClass}`}>
                    Sign in
                </button>
            </form>
        </div>
    )
}