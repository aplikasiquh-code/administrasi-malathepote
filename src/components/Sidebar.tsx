import React from 'react';
import { ActiveTab, AuthUser } from '../types';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  GraduationCap, 
  FileSpreadsheet, 
  ChevronRight,
  ShieldCheck,
  Award,
  UserCheck,
  BookOpenCheck,
  Compass,
  Sparkles,
  FileText,
  KeyRound,
  LogOut,
  User,
  Cloud
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  teacherCount: number;
  studentCount: number;
  classCount?: number;
  onOpenClassModal?: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  currentUser?: AuthUser | null;
  onOpenChangePassword?: () => void;
  onLogout?: () => void;
  isSyncing?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  teacherCount,
  studentCount,
  classCount = 12,
  onOpenClassModal,
  isMobileOpen,
  onCloseMobile,
  currentUser,
  onOpenChangePassword,
  onLogout,
  isSyncing
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      description: 'Ringkasan & statistik sekolah',
      icon: LayoutDashboard,
      badge: null,
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'data-sekolah' as ActiveTab,
      label: 'Data Sekolah',
      description: 'Identitas, sarpras & visi misi',
      icon: Building2,
      badge: null,
      color: 'from-amber-600 to-orange-600'
    },
    {
      id: 'data-guru' as ActiveTab,
      label: 'Data Guru & GTK',
      description: 'Pendidik & tenaga administrasi',
      icon: Users,
      badge: `${teacherCount} Guru`,
      color: 'from-emerald-600 to-teal-600'
    },
    {
      id: 'data-siswa' as ActiveTab,
      label: 'Data Siswa',
      description: 'Buku induk siswa kelas 1-6',
      icon: GraduationCap,
      badge: `${studentCount} Siswa`,
      color: 'from-violet-600 to-purple-600'
    },
    {
      id: 'presensi' as ActiveTab,
      label: 'Presensi Siswa',
      description: 'Absensi harian, jurnal & rekap',
      icon: UserCheck,
      badge: 'Harian / Rekap',
      color: 'from-emerald-600 to-teal-600'
    },
    {
      id: 'jurnal-mengajar' as ActiveTab,
      label: 'Jurnal Mengajar',
      description: 'Agenda KBM & Kurikulum TP/Materi',
      icon: BookOpenCheck,
      badge: 'Harian KBM',
      color: 'from-sky-600 to-blue-600'
    },
    {
      id: 'penilaian' as ActiveTab,
      label: 'Penilaian Siswa',
      description: 'Nilai Mapel, Ekskul & Kokurikuler P5',
      icon: Award,
      badge: 'Buku Nilai',
      color: 'from-amber-600 to-orange-600'
    },
    {
      id: 'rapor' as ActiveTab,
      label: 'Rapor Siswa',
      description: 'Semester ganjil, genap & cetak',
      icon: FileText,
      badge: 'Ganjil & Genap',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'laporan' as ActiveTab,
      label: 'Laporan & Cetak',
      description: 'Format rekap resmi SD',
      icon: FileSpreadsheet,
      badge: 'Resmi',
      color: 'from-rose-600 to-pink-600'
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 bg-slate-900/95 lg:bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } print:hidden`}
      >
        {/* Sidebar Header with KKG Guslah 1 Malathe Pote Kokop Logo */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onSelectTab('dashboard');
              if (isMobileOpen) onCloseMobile();
            }}
            className="flex items-center gap-3 text-left cursor-pointer group focus:outline-none"
            title="Kembali ke Dashboard"
          >
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 shrink-0 shadow-md ring-2 ring-emerald-500/40 group-hover:ring-emerald-400 overflow-hidden">
              <img 
                src="/logo_kkg_guslah.jpg" 
                alt="Logo KKG Guslah 1 Malathe Pote Kokop" 
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
            <div className="min-w-0">
              <span className="font-extrabold text-white text-xs block truncate group-hover:text-emerald-300 transition-colors">
                KKG Guslah 1
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold block truncate">
                Malathe Pote Kokop
              </span>
            </div>
          </button>
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded-md"
          >
            Tutup
          </button>
        </div>

        {/* Navigation List */}
        <div className="p-4 flex-1 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Menu Administrasi
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full group flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white border border-blue-500/30 shadow-md shadow-blue-900/20'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm leading-tight truncate">
                      {item.label}
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                      isActive
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Class Management Quick Access */}
        {onOpenClassModal && (
          <div className="px-3 pt-2 pb-1">
            <button
              type="button"
              onClick={() => {
                onOpenClassModal();
                if (isMobileOpen) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-950/40 border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-300 hover:text-white text-xs font-semibold transition-all group shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <span>Kelola Rombel & Kelas</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                {classCount} Kelas
              </span>
            </button>
          </div>
        )}

        {/* User Profile Card & Account Actions */}
        {currentUser && (
          <div className="p-3 border-t border-slate-800 bg-slate-950/40">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 mb-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 font-bold text-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-100 truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-emerald-400 truncate">{currentUser.role || 'Guru Kelas'}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">{currentUser.schoolName || 'KKG Guslah 1'}</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                  <Cloud className="w-3 h-3" />
                  Cloud
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {onOpenChangePassword && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenChangePassword();
                    if (isMobileOpen) onCloseMobile();
                  }}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 text-xs font-medium transition-all"
                  title="Ganti Password Akun"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sandi</span>
                </button>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    if (isMobileOpen) onCloseMobile();
                  }}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/20 text-xs font-medium transition-all"
                  title="Keluar dari Akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer Info Card */}
        <div className="p-3 border-t border-slate-800">
          <div className="bg-slate-800/40 rounded-xl p-2.5 border border-slate-700/40">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>KKG Guslah 1 Malathe Pote</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Data tersinkron ke Cloud dan dapat diakses dari mana saja.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
