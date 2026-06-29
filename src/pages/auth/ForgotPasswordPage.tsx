import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Bike, Mail, ArrowRight, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Spinner } from '../../components/ui/Spinner';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 bg-ink-950 relative overflow-hidden">
      <div className="absolute top-0 left-1/3 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)' }} />

      <div className="relative w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-glow-sm group-hover:bg-emerald-400 transition-colors">
            <Bike className="w-5 h-5 text-ink-950" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">RouteMate</span>
        </Link>

        <div className="glass-card p-7 anim-scale-in">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-5">
            <ChevronLeft className="w-4 h-4" /> Back to sign in
          </Link>

          {sent ? (
            <div className="text-center py-4 anim-scale-in">
              <div className="w-14 h-14 rounded-3xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="font-display font-bold text-xl mb-2">Check your inbox</h2>
              <p className="text-white/45 text-sm mb-6 leading-relaxed">
                If an account exists for <span className="text-white font-medium">{email}</span>, a password reset link is on its way.
              </p>
              <Link to="/login" className="btn-ghost w-full">Back to sign in</Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Reset password</h1>
              <p className="text-white/40 text-sm mb-6">Enter your email to receive a reset link.</p>

              {error && (
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm mb-5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label-text" htmlFor="forgot-email">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    <input id="forgot-email" type="email" required value={email}
                      onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                      className="input-field pl-11" autoComplete="email" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? <Spinner size="sm" /> : (<>Send reset link <ArrowRight className="w-4 h-4" /></>)}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
