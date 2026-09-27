import React from 'react';
import { SchoolProfile, ActiveTab, AuthUser } from '../types';
import { 
  Building2, 
  Printer, 
  Download, 
  RotateCcw, 
  Calendar, 
  GraduationCap, 
  Menu, 
  Sparkles, 
  BookOpen,
  Cloud,
  CloudCheck,
  RefreshCw,
  KeyRound,
  LogOut,
  User,
  Flame
} from 'lucide-react';

interface HeaderProps {
  school: SchoolProfile;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenPrintModal: () => void;
  onExportBackup: () => void;
  onResetData: () => void;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  currentUser?: AuthUser | null;
  onOpenChangePassword?: () => void;
  onLogout?: () => void;
  isSyncing?: boolean;
  lastSyncTime?: string | null;
  onManualSync?: () => void;
  firestoreStatus?: 'connected' | 'syncing' | 'offline' | 'error';
}

export const Header: React.FC<HeaderProps> = ({
  school,
  activeTab,
  onSelectTab,
  onOpenPrintModal,
  onExportBackup,
  onResetData,
  isMobileNavOpen,
  setIsMobileNavOpen,
  currentUser,
  onOpenChangePassword,
  onLogout,
  isSyncing,
  lastSyncTime,
  onManualSync,
  firestoreStatus = 'connected'
}) => {
  const currentDateFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const formatSyncTime = (isoString?: string | null) => {
    if (!isoString) return 'Belum tersinkron';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Tersinkron';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand & KKG Guslah 1 Malathe Pote Kokop Info */}
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Official Logo Button - Return to Dashboard */}
            <button
              type="button"
              onClick={() => onSelectTab('dashboard')}
              className="group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 shrink-0"
              title="Kembali ke Dashboard - KKG Guslah 1 Malathe Pote Kokop"
              aria-label="Kembali ke Dashboard"
            >
              <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg shadow-black/30 ring-2 ring-emerald-500/40 group-hover:ring-emerald-400 overflow-hidden transition-all">
                <img 
                  src="/logo_kkg_guslah.jpg" 
                  alt="KKG Guslah 1 Malathe Pote Kokop" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.src.endsWith('logo_kkg_guslah.svg')) {
                      target.src = '/logo_kkg_guslah.svg';
                    } else if (school.logoUrl) {
                      target.src = school.logoUrl;
                    }
                  }}
                />
              </div>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onSelectTab('dashboard')}
                  className="text-left text-base sm:text-lg font-black tracking-tight text-slate-100 hover:text-emerald-300 transition-colors truncate cursor-pointer focus:outline-none"
                  title="Kembali ke Dashboard"
                >
                  KKG Guslah 1 Malathe Pote Kokop
                </button>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {school.namaSekolah}
                </span>
                <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Akreditasi {school.akreditasi}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1 font-medium text-slate-300">
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  {school.kurikulum}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline text-slate-400">
                  T.P. {school.tahunAjaran} ({school.semester})
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Auth Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Firebase Firestore Real-Time Sync Indicator & Manual Sync Button */}
            {onManualSync && (
              <button
                type="button"
                onClick={onManualSync}
                disabled={isSyncing}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                  isSyncing 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                    : firestoreStatus === 'quota-exceeded'
                    ? 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border-amber-500/40 hover:border-amber-500/60'
                    : firestoreStatus === 'error'
                    ? 'bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border-rose-500/30'
                    : 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/50'
                }`}
                title={
                  firestoreStatus === 'quota-exceeded'
                    ? "Batas kuota tulis harian gratis Firestore telah tercapai (Reset besok). Data tetap aman di penyimpanan lokal perangkat."
                    : "Sinkronkan data dengan Firebase Firestore (Tersimpan & tersinkronisasi real-time antar perangkat)"
                }
              >
                <Flame className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce text-amber-400' : firestoreStatus === 'quota-exceeded' ? 'text-amber-400' : 'text-orange-400'}`} />
                <span className="hidden sm:inline">
                  {isSyncing 
                    ? 'Menyinkronkan...' 
                    : firestoreStatus === 'quota-exceeded'
                    ? 'Firestore: Kuota Penuh (Reset Besok)'
                    : firestoreStatus === 'error'
                    ? 'Firestore Offline (Coba Lagi)'
                    : `Firestore: ${formatSyncTime(lastSyncTime)}`}
                </span>
                <span className="sm:hidden">
                  {isSyncing ? 'Sync...' : firestoreStatus === 'quota-exceeded' ? 'Kuota Penuh' : 'Firestore'}
                </span>
                <span className={`w-2 h-2 rounded-full ${
                  isSyncing 
                    ? 'bg-amber-400 animate-ping' 
                    : firestoreStatus === 'quota-exceeded'
                    ? 'bg-amber-400'
                    : firestoreStatus === 'error' 
                    ? 'bg-rose-500' 
                    : 'bg-emerald-400 shadow-sm shadow-emerald-400'
                }`} />
              </button>
            )}

            <div className="hidden xl:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 border border-slate-700/70 px-3 py-2 rounded-xl">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{currentDateFormatted}</span>
            </div>

            <button
              onClick={onOpenPrintModal}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95"
              title="Cetak Laporan / Dokumen Resmi SD"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Cetak Dokumen</span>
            </button>

            <button
              onClick={onExportBackup}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-xs sm:text-sm font-medium transition-all"
              title="Unduh Backup Data Administrasi JSON"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Backup</span>
            </button>

            {/* Change Password Button */}
            {onOpenChangePassword && (
              <button
                type="button"
                onClick={onOpenChangePassword}
                className="p-2 rounded-xl text-slate-300 hover:text-amber-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 hover:border-amber-500/40 transition-all shadow-sm"
                title="Ganti / Perbarui Kata Sandi (Password)"
                aria-label="Ganti Kata Sandi"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
              </button>
            )}

            {/* Logout Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 hover:border-rose-500/50 transition-all shadow-sm active:scale-95"
                title="Keluar dari Aplikasi (Logout)"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden md:inline">Keluar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

