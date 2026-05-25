import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Alert from '../../components/ui/Alert';
import { useAuth } from '../../hooks/useAuth';
import { hasSupabaseConfig, supabase } from '../../services/supabaseClient';

export default function LoginPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) setError(signInError.message);
    setLoading(false);
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-8">
      <section className="w-full max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-soft sm:max-w-md sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-white">
            <ShieldCheck size={26} />
          </span>
          <div>
            <h1 className="text-xl font-black text-ink">SSOP Monitoring Records</h1>
            <p className="text-sm text-muted">Ilocos Food Products · Taleb, Bantay</p>
          </div>
        </div>

        {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}
        {!hasSupabaseConfig && (
          <div className="mb-4">
            <Alert type="warning">Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env` before signing in.</Alert>
          </div>
        )}

        <form className="space-y-4" onSubmit={submit}>
          <label>
            <span className="label">Email</span>
            <input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            <span className="label">Password</span>
            <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className="btn btn-primary w-full" type="submit" disabled={loading || !hasSupabaseConfig}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

       
      </section>
    </main>
  );
}
