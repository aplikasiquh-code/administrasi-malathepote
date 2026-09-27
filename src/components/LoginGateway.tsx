import React, { useState } from 'react';
import { 
  LogIn, 
  UserPlus, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  School, 
  Mail, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Cloud, 
  Laptop, 
  Smartphone, 
  Hash,
  Check,
  Info
} from 'lucide-react';
import { authService } from '../services/authService';
import { AuthUser, AppSyncData } from '../types';

interface LoginGatewayProps {
  onLoginSuccess: (user: AuthUser, cloudData?: AppSyncData | null) => void;
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

type AuthMode = 'login' | 'register' | 'reset';

export const LoginGateway: React.FC<LoginGatewayProps> = ({
  onLoginSuccess,
  onShowToast
}) => {
  const [mode, setMode] = useState<AuthMode>('login');

  // Registered schools status (used for registration guidance)
  const [primarySchool, setPrimarySchool] = useState<{
    id: string;
    schoolName: string;
    npsn: string;
    email: string;
  } | null>(null);
  const [hasRegisteredSchool, setHasRegisteredSchool] = useState(false);

  // Login form state (Email Sekolah atau NPSN)
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showManualForm, setShowManualForm] = useState(false);

  // Simplified Register form state: Email Sekolah, Nama Sekolah, NPSN, Password
  const [regEmail, setRegEmail] = useState('');
  const [regSchoolName, setRegSchoolName] = useState('');
  const [regNpsn, setRegNpsn] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Reset password form state
  const [resetId, setResetId] = useState('');
  const [resetNpsn, setResetNpsn] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [alreadyRegisteredRedirect, setAlreadyRegisteredRedirect] = useState<{
    identifier: string;
    schoolName: string;
  } | null>(null);
  const [unregisteredPrompt, setUnregisteredPrompt] = useState<{
    identifier: string;
    message?: string;
  } | null>(null);

  // Check if school is registered on mount to help users who mistakenly open the registration tab
  React.useEffect(() => {
    let isMounted = true;
    authService.getRegisteredSchools().then((data) => {
      if (!isMounted || !data) return;
      setHasRegisteredSchool(data.hasRegisteredSchool);
      setPrimarySchool(data.primarySchool || null);
      if (data.primarySchool && !loginId) {
        setLoginId(data.primarySchool.npsn || data.primarySchool.email);
      }
    }).catch((e) => {
      console.warn('Could not check registered schools:', e);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Quick 1-click login for registered active schools
  const handleQuickLogin = async (schoolId?: string, npsn?: string) => {
    setIsLoading(true);
    setErrorMessage('');
    setAlreadyRegisteredRedirect(null);
    setUnregisteredPrompt(null);
    try {
      const res = await authService.quickLogin({ schoolId, npsn });
      onShowToast(
        'Selamat Datang!',
        `Berhasil masuk ke portal ${res.user.schoolName || res.user.name}.`,
        'success'
      );
      onLoginSuccess(res.user, res.cloudData);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal masuk ke akun sekolah.');
      if (npsn) setLoginId(npsn);
      setMode('login');
    } finally {
      setIsLoading(false);
    }
  };

  // Switch tab and clear messages
  const handleSwitchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMessage('');
    setSuccessMessage('');
    setAlreadyRegisteredRedirect(null);
    setUnregisteredPrompt(null);
  };

  // 1. Handle Login (Per-School Account)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setAlreadyRegisteredRedirect(null);
    setUnregisteredPrompt(null);

    if (!loginId.trim() || !loginPassword) {
      setErrorMessage('Mohon masukkan Email Sekolah / NPSN dan Password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.login({
        identifier: loginId.trim(),
        password: loginPassword
      });

      onShowToast(
        'Selamat Datang!',
        `Berhasil masuk ke portal sekolah ${res.user.schoolName || res.user.name}.`,
        'success'
      );
      onLoginSuccess(res.user, res.cloudData);
    } catch (err: any) {
      if (err.notFound || err.canRegister || (err.message && err.message.toLowerCase().includes('tidak terdaftar'))) {
        setUnregisteredPrompt({
          identifier: err.identifier || loginId.trim(),
          message: err.detailMessage || 'Email Sekolah atau NPSN ini belum terdaftar di sistem.'
        });
      }
      setErrorMessage(err.message || 'Gagal masuk. Periksa kembali Email/NPSN dan Password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Register (Simplified: Email Sekolah, Nama Sekolah, NPSN, Password)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setAlreadyRegisteredRedirect(null);

    if (!regEmail.trim() || !regSchoolName.trim() || !regNpsn.trim() || !regPassword) {
      setErrorMessage('Mohon lengkapi seluruh kolom wajib: Email Sekolah, Nama Sekolah, NPSN, dan Password.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password minimal 6 karakter.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.register({
        email: regEmail.trim(),
        schoolName: regSchoolName.trim(),
        npsn: regNpsn.trim(),
        password: regPassword,
        name: regSchoolName.trim(),
        username: regNpsn.trim(),
        role: 'Admin Sekolah'
      });

      onShowToast(
        'Registrasi Sekolah Berhasil!',
        `Akun untuk ${res.user.schoolName || res.user.name} berhasil dibuat dan siap digunakan bersama oleh guru & tim sekolah di seluruh perangkat.`,
        'success'
      );
      onLoginSuccess(res.user, res.cloudData || null);
    } catch (err: any) {
      if (err.alreadyRegistered) {
        setErrorMessage(err.message || 'Sekolah ini sudah terdaftar di sistem.');
        setAlreadyRegisteredRedirect({
          identifier: err.identifier || regNpsn.trim() || regEmail.trim(),
          schoolName: err.schoolName || regSchoolName.trim()
        });
      } else {
        setErrorMessage(err.message || 'Gagal melakukan registrasi akun sekolah.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Reset Password (Verifikasi dengan NPSN Sekolah)
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!resetId.trim() || !resetNpsn.trim() || !resetNewPassword) {
      setErrorMessage('Mohon lengkapi Email/NPSN, verifikasi NPSN sekolah, dan kata sandi baru.');
      return;
    }

    if (resetNewPassword.length < 6) {
      setErrorMessage('Password baru minimal 6 karakter.');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setErrorMessage('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.resetPassword({
        identifier: resetId.trim(),
        securityAnswer: resetNpsn.trim(),
        newPassword: resetNewPassword
      });

      onShowToast(
        'Password Berhasil Diperbarui',
        'Kata sandi akun sekolah berhasil direset. Anda telah otomatis masuk ke sistem.',
        'success'
      );
      onLoginSuccess(res.user, null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mereset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center px-3 py-4 sm:p-6 relative overflow-hidden font-sans text-slate-100 selection:bg-emerald-500 selection:text-white">
      
      {/* Background Decorative Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-emerald-600/15 via-teal-900/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Outer Container */}
      <div className="w-full max-w-md relative z-10 my-auto">
        
        {/* ================================================================
            LOGO & TITLE SECTION (KOKOP - PER SEKOLAH)
            Logo proporsional & rapi, hemat ruang vertikal
           ================================================================ */}
        <div className="flex flex-col items-center text-center mb-3 sm:mb-4">
          {/* Logo Resmi KKG Guslah 1 Malathe Pote */}
          <div className="relative group transition-transform hover:scale-105 duration-300">
            <div className="w-20 h-20 sm:w-24 sm:h-24 p-2 bg-white rounded-2xl shadow-xl ring-2 ring-emerald-500/30 border border-slate-200 flex items-center justify-center overflow-hidden">
              <img 
                src="/logo_kkg_guslah.jpg" 
                alt="Logo Resmi KKG Guslah 1 Malathe Pote Kokop" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.endsWith('logo_kkg_guslah.svg')) {
                    target.src = '/logo_kkg_guslah.svg';
                  }
                }}
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="mt-2 text-lg sm:text-xl font-extrabold text-slate-100 tracking-tight drop-shadow-md">
            KKG Guslah 1 Malathe Pote Kokop
          </h1>
          
          <p className="mt-0.5 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 justify-center">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pintu Masuk Portal Sekolah Terpadu</span>
          </p>

          <p className="mt-0.5 text-[11px] text-slate-300 max-w-xs leading-tight flex items-center justify-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real-time antar perangkat aktif via Firebase Firestore</span>
          </p>
        </div>

        {/* ================================================================
            MAIN CARD CONTAINER
           ================================================================ */}
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl shadow-black/50">
          
          {/* Top Mode Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 mb-3.5">
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Sekolah</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMode('reset')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'reset'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Lupa Sandi</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs sm:text-sm animate-in fade-in space-y-2.5">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
              </div>

              {/* Helper if school account was not found: One-click fast register */}
              {unregisteredPrompt && (
                <div className="pt-2 border-t border-rose-500/30 flex flex-col gap-2 bg-rose-950/40 p-2.5 rounded-xl">
                  <div className="text-xs text-rose-100 font-medium">
                    💡 Cukup daftarkan 1 akun untuk lembaga sekolah Anda. Setelah itu seluruh guru dan staf di perangkat lain dapat langsung masuk bersama tanpa perlu mendaftar lagi.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const id = unregisteredPrompt.identifier;
                      if (id.includes('@')) {
                        setRegEmail(id);
                        const prefix = id.split('@')[0].replace(/[._-]/g, ' ');
                        if (!regSchoolName) setRegSchoolName(prefix.toUpperCase());
                      } else if (/^\d+$/.test(id)) {
                        setRegNpsn(id);
                      } else {
                        setRegEmail(id);
                      }
                      if (loginPassword) {
                        setRegPassword(loginPassword);
                        setRegConfirmPassword(loginPassword);
                      }
                      handleSwitchMode('register');
                      onShowToast('Pendaftaran Sekolah', 'Silakan lengkapi nama sekolah dan NPSN (cukup 1 kali).', 'info');
                    }}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Daftarkan Akun Sekolah Ini Sekarang (Cukup 1 Kali)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {alreadyRegisteredRedirect && (
                <div className="pt-2 border-t border-rose-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-xs text-rose-200">
                    Akun <strong>{alreadyRegisteredRedirect.schoolName || alreadyRegisteredRedirect.identifier}</strong> sudah aktif di sistem.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleQuickLogin(undefined, alreadyRegisteredRedirect.identifier)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>👉 Langsung Masuk Sekarang (1-Klik)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginId(alreadyRegisteredRedirect.identifier);
                        handleSwitchMode('login');
                      }}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Form Masuk
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-2.5 text-emerald-300 text-xs sm:text-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* ==============================================================
              TAB 1: LOGIN FORM (AKUN SEKOLAH)
             ============================================================== */}
          {mode === 'login' && (
            <div className="space-y-3">
              {/* Quick Login Card for Active Registered School */}
              {hasRegisteredSchool && primarySchool && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/50 shadow-lg shadow-emerald-950/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-400/40 rounded-xl flex items-center justify-center text-emerald-400 font-bold flex-shrink-0 shadow-inner">
                      <School className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                          Akun Sekolah Aktif
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-100 mt-0.5 truncate">
                        {primarySchool.schoolName}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate">
                        NPSN: <span className="font-mono text-emerald-400 font-semibold">{primarySchool.npsn}</span>
                        {primarySchool.email && ` • ${primarySchool.email}`}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleQuickLogin(primarySchool.id, primarySchool.npsn)}
                    className="w-full mt-3 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isLoading ? 'Sedang Masuk...' : 'Masuk Sekarang (1-Klik)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* If active school exists and manual form is hidden, show compact toggle to avoid bloated empty form */}
              {hasRegisteredSchool && primarySchool && !showManualForm ? (
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => setShowManualForm(true)}
                    className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer py-1"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Masuk manual dengan kata sandi / akun lain</span>
                  </button>
                </div>
              ) : (
                <div className={hasRegisteredSchool && primarySchool ? "pt-2 border-t border-slate-800/80 space-y-2.5" : "space-y-3"}>
                  {hasRegisteredSchool && primarySchool && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Form Kata Sandi:</span>
                      <button
                        type="button"
                        onClick={() => setShowManualForm(false)}
                        className="text-[11px] text-slate-400 hover:text-slate-200"
                      >
                        Tutup Form
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email Sekolah atau NPSN <span className="text-emerald-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <School className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={loginId}
                          onChange={(e) => {
                            setLoginId(e.target.value);
                            setErrorMessage('');
                            setUnregisteredPrompt(null);
                          }}
                          placeholder="Email resmi sekolah atau 8 digit NPSN"
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-300">
                          Kata Sandi (Password) <span className="text-emerald-400">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleSwitchMode('reset')}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline"
                        >
                          Lupa Password?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Masukkan kata sandi sekolah"
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                        >
                          {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <input
                        type="checkbox"
                        id="remember-me"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
                      />
                      <label htmlFor="remember-me" className="text-[11px] text-slate-300 cursor-pointer select-none">
                        Tetap masuk di perangkat ini
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                    >
                      {isLoading ? (
                        <span>Memeriksa Akun Sekolah...</span>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          <span>Masuk ke Akun Sekolah</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              <div className="text-center pt-1">
                <p className="text-[11px] text-slate-400">
                  Sekolah belum terdaftar?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('register')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
                  >
                    Daftarkan Sekolah Baru
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ==============================================================
              TAB 2: REGISTRATION (SIMPLIFIED PER-SCHOOL ACCOUNT)
              Sederhana: Email Sekolah, Nama Sekolah, NPSN, Password
             ============================================================== */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              
              {/* Guidance for 1-time school registration */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-200">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-300 mt-0.5">
                    <School className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-emerald-300 text-xs">
                      Pendaftaran Akun Sekolah (Cukup 1 Kali)
                    </p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Cukup daftarkan 1 akun untuk sekolah Anda. Setelah terdaftar, akun dapat digunakan oleh semua guru dan staf dari perangkat apa saja (HP, laptop, komputer) tanpa perlu mendaftar lagi.
                    </p>
                  </div>
                </div>
              </div>

              {/* 1. Email Sekolah */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Sekolah <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="contoh: sdn1kokop@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* 2. Nama Sekolah */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Sekolah <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <School className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regSchoolName}
                    onChange={(e) => setRegSchoolName(e.target.value)}
                    placeholder="contoh: SDN Malathe Pote 1 Kokop"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* 3. NPSN */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  NPSN Sekolah (8 digit) <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regNpsn}
                    onChange={(e) => setRegNpsn(e.target.value)}
                    placeholder="contoh: 20512345"
                    maxLength={10}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* 4. Password & Konfirmasi Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 6 digit"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 pr-8 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ulangi Password <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Submit Registration */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <span>Mendaftarkan Sekolah...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Daftarkan Sekolah & Langsung Masuk</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <p className="text-[11px] text-slate-400">
                  Sekolah sudah memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
                  >
                    Kembali ke Masuk
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ==============================================================
              TAB 3: RESET / GANTI PASSWORD SEKOLAH
              Verifikasi menggunakan NPSN sekolah
             ============================================================== */}
          {mode === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-3">
              <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-2.5 text-[11px] text-amber-300 flex items-start gap-2">
                <KeyRound className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                <p className="leading-snug">
                  <strong>Pemulihan Kata Sandi:</strong> Masukkan Email/NPSN sekolah dan 8 digit NPSN untuk verifikasi reset password.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email atau NPSN Terdaftar <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={resetId}
                    onChange={(e) => setResetId(e.target.value)}
                    placeholder="Email atau 8 digit NPSN"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              {/* NPSN Verification */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Verifikasi 8 Digit NPSN <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={resetNpsn}
                    onChange={(e) => setResetNpsn(e.target.value)}
                    placeholder="8 digit NPSN sekolah"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kata Sandi Baru <span className="text-amber-400">* (min. 6 digit)</span>
                </label>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="Password baru sekolah"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 pr-8 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showResetPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ulangi Kata Sandi Baru <span className="text-amber-400">*</span>
                </label>
                <input
                  type="password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  required
                  minLength={6}
                />
              </div>

              {/* Submit Reset */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <span>Memproses Reset...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Simpan Password Baru & Masuk</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="text-xs text-slate-400 hover:text-slate-200 hover:underline"
                >
                  Batal, kembali ke halaman Masuk
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer info: Multi-device & Cloud sync explanation */}
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cloud Sync Aktif</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5 text-sky-400" />
            <span>Laptop / Komputer</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>HP / Tablet Android & iOS</span>
          </div>
        </div>

      </div>
    </div>
  );
};
