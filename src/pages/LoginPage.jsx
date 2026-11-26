import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Armchair,
  QrCode,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const redirectPath = location.state?.from || '/movies';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'register' || tabParam === 'login') {
      setActiveTab(tabParam);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [searchParams]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (activeTab === 'login') {
      if (!username.trim() || !password) {
        setErrorMsg('Username atau email beserta kata sandi wajib diisi.');
        return;
      }

      setSubmitting(true);
      try {
        await login(username.trim(), password);
        navigate(redirectPath, { replace: true });
      } catch (err) {
        setErrorMsg(err.message || 'Gagal masuk. Periksa kembali kredensial Anda.');
      } finally {
        setSubmitting(false);
      }
    } else {
      if (!username.trim() || !email.trim() || !password) {
        setErrorMsg('Username, email, dan kata sandi wajib diisi.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Kata sandi minimal terdiri dari 6 karakter.');
        return;
      }

      setSubmitting(true);
      try {
        await register(username.trim(), email.trim(), password);
        setSuccessMsg(
          'Akun penonton berhasil didaftarkan. Silakan masuk menggunakan akun baru Anda.'
        );
        setActiveTab('login');
        setPassword('');
      } catch (err) {
        if (Array.isArray(err.detail) && err.detail.length > 0) {
          setErrorMsg(`${err.message}: ${err.detail.join(', ')}`);
        } else {
          setErrorMsg(err.message || 'Gagal mendaftarkan akun baru.');
        }
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-12 bg-ivory pb-20 md:pb-0">
      <section className="hidden lg:flex lg:col-span-6 bg-obsidian text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden border-r border-slateLine">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-4 w-2 flex flex-col justify-around opacity-20"
        >
          {Array.from({ length: 18 }).map((_, idx) => (
            <span key={idx} className="w-2 h-3 rounded-[1px] bg-sand block" />
          ))}
        </div>

        <div className="pl-4">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.22em] text-brass border border-brass/40 px-3 py-1 rounded">
            Edisi Kuratorial · Studio 1–3
          </span>
          <h1 className="mt-6 font-display font-extrabold text-4xl xl:text-5xl leading-[1.12] tracking-tight text-white">
            Pengalaman Sinema Dimulai Sebelum Lampu Studio Padam.
          </h1>
          <p className="mt-5 text-zinc-400 text-base leading-relaxed max-w-lg">
            Telusuri kurasi film pilihan, amati ketersediaan kursi secara langsung lintas studio Reguler, Premiere, hingga IMAX, dan simpan e-ticket resmi dalam hitungan detik.
          </p>
        </div>

        <div className="pl-4 space-y-5 my-10 border-t border-b border-slateLine py-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded bg-charcoal border border-slateLine flex items-center justify-center shrink-0 text-brass">
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-white">
                Denah Kursi Presisi Anti-Bentrok
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Pemetaan kursi baris A hingga F yang dikunci secara atomik di peladen untuk mencegah pemesanan ganda.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded bg-charcoal border border-slateLine flex items-center justify-center shrink-0 text-brass">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-white">
                E-Ticket Instan Berstandar Fisik
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Dilengkapi kode unik monospasi dan matriks QR deterministik siap pindai di pintu studio.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded bg-charcoal border border-slateLine flex items-center justify-center shrink-0 text-brass">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-white">
                Keamanan Sesi Stateless JWT & RBAC
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Otentikasi terenkripsi bcrypt dan pembagian hak akses tegas antara penonton dan pengelola bioskop.
              </p>
            </div>
          </div>
        </div>

        <div className="pl-4 flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>CINEMATIX ARCHIVE</span>
          <span>KELOMPOK 5 · SI5B · UNIVERSITAS MDP</span>
        </div>
      </section>

      <section className="lg:col-span-6 flex items-center justify-center p-4 sm:p-8 xl:p-12">
        <div className="w-full max-w-md bg-white border border-sand rounded-lg shadow-editorial p-6 sm:p-8">
          <div className="mb-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-velvet font-semibold">
              Loket Daring CinemaTix
            </span>
            <h2 className="mt-1 font-display font-extrabold text-2xl text-ink">
              {activeTab === 'login' ? 'Masuk ke Akun Anda' : 'Pendaftaran Penonton Baru'}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {activeTab === 'login'
                ? 'Masukkan kredensial untuk melanjutkan pemilihan kursi dan melihat tiket.'
                : 'Buat akun penonton untuk memesan kursi dan menyimpan riwayat e-ticket.'}
            </p>
          </div>

          <div className="grid grid-cols-2 p-1 rounded bg-ivory border border-sand mb-6">
            <button
              type="button"
              onClick={() => switchTab('login')}
              className={`py-2 text-xs sm:text-sm font-semibold rounded transition-colors ${
                activeTab === 'login'
                  ? 'bg-velvet text-white shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => switchTab('register')}
              className={`py-2 text-xs sm:text-sm font-semibold rounded transition-colors ${
                activeTab === 'register'
                  ? 'bg-velvet text-white shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Daftar Akun
            </button>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded bg-velvet-soft border border-velvet/30 text-velvet text-xs sm:text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              className="mb-5 p-3.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5"
              >
                {activeTab === 'login' ? 'Username atau Email' : 'Username'}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  activeTab === 'login' ? 'Contoh: admin atau penonton01' : 'Contoh: penonton01'
                }
                autoComplete="username"
                className="w-full px-3.5 py-2.5 rounded border border-sand bg-ivory/50 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:bg-white focus:border-velvet transition-colors"
              />
            </div>

            {activeTab === 'register' && (
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5"
                >
                  Alamat Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  className="w-full px-3.5 py-2.5 rounded border border-sand bg-ivory/50 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:bg-white focus:border-velvet transition-colors"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  autoComplete={
                    activeTab === 'login' ? 'current-password' : 'new-password'
                  }
                  className="w-full pl-3.5 pr-10 py-2.5 rounded border border-sand bg-ivory/50 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:bg-white focus:border-velvet transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="absolute inset-y-0 right-0 px-3 text-muted hover:text-ink flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded bg-velvet hover:bg-velvet-hover disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <span>
                {submitting
                  ? 'Memproses...'
                  : activeTab === 'login'
                  ? 'Masuk ke CinemaTix'
                  : 'Daftarkan Akun Penonton'}
              </span>
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-sand text-xs text-muted space-y-1">
            <p className="font-semibold text-ink">Akun Pengelola Bawaan (Skrip Admin):</p>
            <p className="font-mono text-[11px]">
              Username: <span className="text-ink">admin</span> · Sandi:{' '}
              <span className="text-ink">Admin123!</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
