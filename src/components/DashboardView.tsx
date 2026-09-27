import React, { useState } from 'react';
import { 
  SchoolProfile, 
  Teacher, 
  Student, 
  SchoolAgenda, 
  SchoolAnnouncement,
  ActiveTab,
  ClassRoomItem
} from '../types';
import { 
  Users, 
  GraduationCap, 
  School, 
  Award, 
  Calendar, 
  Bell, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  BookOpen,
  MapPin,
  FileText,
  UserPlus,
  Building,
  Check,
  Trash2,
  ClipboardCheck
} from 'lucide-react';

interface DashboardViewProps {
  school: SchoolProfile;
  teachers: Teacher[];
  students: Student[];
  agendas: SchoolAgenda[];
  announcements: SchoolAnnouncement[];
  classes?: ClassRoomItem[];
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenAddStudent: () => void;
  onOpenAddTeacher: () => void;
  onToggleAgenda: (agendaId: string) => void;
  onAddAgenda: (agenda: Omit<SchoolAgenda, 'id' | 'selesai'>) => void;
  onDeleteAgenda?: (agendaId: string, judul: string) => void;
  onAddAnnouncement: (announcement: Omit<SchoolAnnouncement, 'id'>) => void;
  onDeleteAnnouncement?: (annId: string, judul: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  school,
  teachers,
  students,
  agendas,
  announcements,
  classes = [],
  onNavigateTab,
  onOpenAddStudent,
  onOpenAddTeacher,
  onToggleAgenda,
  onAddAgenda,
  onDeleteAgenda,
  onAddAnnouncement,
  onDeleteAnnouncement
}) => {
  const [showAddAgendaModal, setShowAddAgendaModal] = useState(false);
  const [showAddAnnounceModal, setShowAddAnnounceModal] = useState(false);

  // New agenda form state
  const [newAgendaJudul, setNewAgendaJudul] = useState('');
  const [newAgendaTanggal, setNewAgendaTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [newAgendaWaktu, setNewAgendaWaktu] = useState('08.00 WIB');
  const [newAgendaLokasi, setNewAgendaLokasi] = useState('Sekolah');
  const [newAgendaKategori, setNewAgendaKategori] = useState<SchoolAgenda['kategori']>('Akademik');
  const [newAgendaKeterangan, setNewAgendaKeterangan] = useState('');

  // New announcement form state
  const [newAnnJudul, setNewAnnJudul] = useState('');
  const [newAnnPrioritas, setNewAnnPrioritas] = useState<SchoolAnnouncement['prioritas']>('Biasa');
  const [newAnnIsi, setNewAnnIsi] = useState('');
  const [newAnnPembuat, setNewAnnPembuat] = useState(school.kepalaSekolah);

  // Calculations
  const activeStudents = students.filter(s => s.statusSiswa === 'Aktif');
  const maleStudents = activeStudents.filter(s => s.jenisKelamin === 'L').length;
  const femaleStudents = activeStudents.filter(s => s.jenisKelamin === 'P').length;

  const activeTeachers = teachers.filter(t => t.statusAktif);
  const pnsTeachers = activeTeachers.filter(t => t.statusKepegawaian === 'PNS').length;
  const pppkTeachers = activeTeachers.filter(t => t.statusKepegawaian === 'PPPK' || t.statusKepegawaian === 'PPPK PW').length;
  const honorerTeachers = activeTeachers.filter(t => 
    t.statusKepegawaian === 'GTT / Honorer' || 
    t.statusKepegawaian === 'PTT (Honorer)' ||
    t.statusKepegawaian === 'Guru Tetap Yayasan' ||
    t.statusKepegawaian === 'GTTY (Guru Tidak Tetap Yayasan)'
  ).length;
  const certifiedTeachers = activeTeachers.filter(t => t.sertifikasi).length;

  // Class Distribution stats
  const classGrades = React.useMemo(() => {
    if (classes && classes.length > 0) {
      return classes.map(c => c.nama);
    }
    const studentClasses = Array.from(new Set(students.map(s => s.kelas)));
    return studentClasses.length > 0 ? studentClasses.sort() : ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
  }, [classes, students]);

  const classStats = classGrades.map((grade) => {
    const list = activeStudents.filter(s => s.kelas === grade);
    return {
      grade,
      total: list.length,
      male: list.filter(s => s.jenisKelamin === 'L').length,
      female: list.filter(s => s.jenisKelamin === 'P').length
    };
  });

  const maxStudentInClass = Math.max(...classStats.map(c => c.total), 1);

  // Sarpras stats
  const totalSarpras = school.saranaPrasarana.reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalBaik = school.saranaPrasarana.reduce((acc, curr) => acc + curr.kondisiBaik, 0);
  const persentaseSarprasBaik = totalSarpras > 0 ? Math.round((totalBaik / totalSarpras) * 100) : 100;

  const handleSaveAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgendaJudul.trim()) return;
    onAddAgenda({
      judul: newAgendaJudul,
      tanggal: newAgendaTanggal,
      waktu: newAgendaWaktu,
      lokasi: newAgendaLokasi,
      kategori: newAgendaKategori,
      keterangan: newAgendaKeterangan
    });
    setNewAgendaJudul('');
    setNewAgendaKeterangan('');
    setShowAddAgendaModal(false);
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnJudul.trim() || !newAnnIsi.trim()) return;
    onAddAnnouncement({
      judul: newAnnJudul,
      tanggal: new Date().toISOString().slice(0, 10),
      prioritas: newAnnPrioritas,
      isi: newAnnIsi,
      pembuat: newAnnPembuat
    });
    setNewAnnJudul('');
    setNewAnnIsi('');
    setShowAddAnnounceModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 max-w-2xl">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0 shadow-lg">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
                <School className="w-3.5 h-3.5 text-blue-400" />
                Tahun Pelajaran {school.tahunAjaran} • Semester {school.semester}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Sistem Administrasi {school.namaSekolah}
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Selamat datang di portal manajemen terpadu Sekolah Dasar. Pantau rekapitulasi data kesiswaan, kepegawaian GTK, sarana prasarana, serta agenda akademik secara akurat dan terstruktur.
              </p>
            </div>
          </div>

          {/* Action shortcuts */}
          <div className="flex flex-wrap gap-2.5 shrink-0 items-center">
            <button
              onClick={() => onNavigateTab('presensi')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold shadow-lg shadow-teal-600/30 transition-all active:scale-95"
              title="Buka Menu Presensi Siswa & Rekap Harian"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Input Presensi</span>
            </button>
            <button
              onClick={() => onNavigateTab('jurnal-mengajar')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              title="Buka Menu Jurnal Mengajar Harian Guru"
            >
              <BookOpen className="w-4 h-4" />
              <span>Input Jurnal</span>
            </button>
            <button
              onClick={() => onNavigateTab('penilaian')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold shadow-lg shadow-amber-600/30 transition-all active:scale-95"
              title="Buka Menu Penilaian Siswa (Mapel, Ekskul, P5)"
            >
              <Award className="w-4 h-4" />
              <span>Input Nilai</span>
            </button>
            <button
              onClick={() => onNavigateTab('rapor')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
              title="Buka Fitur Buku Rapor Siswa (Semester Ganjil & Genap)"
            >
              <FileText className="w-4 h-4" />
              <span>Rapor Siswa</span>
            </button>
            <button
              onClick={() => onNavigateTab('data-siswa')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
              title="Buka Fitur Data Siswa"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Data Siswa</span>
            </button>
            <button
              onClick={() => onNavigateTab('data-guru')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              title="Buka Fitur Data Guru & GTK"
            >
              <Users className="w-4 h-4" />
              <span>Data Guru & GTK</span>
            </button>
          </div>
        </div>

        {/* Decorative subtle gradient sphere */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Siswa */}
        <div 
          onClick={() => onNavigateTab('data-siswa')}
          className="group cursor-pointer bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Siswa Aktif</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {activeStudents.length}
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-medium text-sky-400">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                L: {maleStudents}
              </span>
              <span className="flex items-center gap-1 font-medium text-pink-400">
                <span className="w-2 h-2 rounded-full bg-pink-400" />
                P: {femaleStudents}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-blue-400 font-medium">
            <span>Buka Data Siswa</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Total Guru & GTK */}
        <div 
          onClick={() => onNavigateTab('data-guru')}
          className="group cursor-pointer bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Guru & Tenaga GTK</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {activeTeachers.length}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
              <span className="text-emerald-300 font-medium">PNS: {pnsTeachers}</span>
              <span>•</span>
              <span className="text-teal-300 font-medium">PPPK: {pppkTeachers}</span>
              <span>•</span>
              <span className="text-amber-300 font-medium">Honorer: {honorerTeachers}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-medium">
            <span>{certifiedTeachers} Pendidik Tersertifikasi</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Rombel & Kelas */}
        <div 
          onClick={() => onNavigateTab('data-sekolah')}
          className="group cursor-pointer bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rombongan Belajar</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <School className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {classGrades.length} <span className="text-base font-normal text-slate-400">Kelas</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Rombongan Belajar Aktif Terdaftar
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 font-medium">
            <span>Rata-rata {activeStudents.length && classGrades.length ? Math.round(activeStudents.length / classGrades.length) : 0} Siswa / Rombel</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Kelayakan Sarpras & Rasio */}
        <div 
          onClick={() => onNavigateTab('data-sekolah')}
          className="group cursor-pointer bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-violet-500/40 rounded-2xl p-5 transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kondisi Sarpras</span>
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {persentaseSarprasBaik}% <span className="text-sm font-normal text-emerald-400">Baik</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              {totalBaik} dari {totalSarpras} unit fasilitas siap pakai
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-violet-400 font-medium">
            <span>Rasio Guru:Siswa (1:{activeTeachers.length ? Math.round(activeStudents.length / activeTeachers.length) : 0})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 2-Column Section: Class Distribution Chart & Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Distribution Visualizer */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                Distribusi Siswa per Rombongan Belajar
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Persebaran peserta didik aktif kelas 1 sampai kelas 6
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('data-siswa')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 hover:underline"
            >
              Kelola Kelas
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {classStats.map((item) => {
              const heightPercent = Math.max(Math.round((item.total / (maxStudentInClass || 1)) * 100), 12);
              return (
                <div 
                  key={item.grade}
                  className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex flex-col justify-between hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-200">Kelas {item.grade}</span>
                    <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                      {item.total}
                    </span>
                  </div>

                  {/* Visual Bar representation */}
                  <div className="my-3 h-20 bg-slate-900/80 rounded-lg p-1 flex items-end justify-center">
                    <div 
                      style={{ height: `${heightPercent}%` }} 
                      className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded flex flex-col justify-end p-0.5 transition-all duration-500"
                    >
                      <div className="w-full bg-pink-400/80 rounded-b" style={{ height: `${item.total > 0 ? (item.female / item.total) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-sky-400">L: {item.male}</span>
                    <span className="text-pink-400">P: {item.female}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                Laki-laki (L)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-pink-400" />
                Perempuan (P)
              </span>
            </div>
            <div className="text-slate-400 font-medium">
              Total Rombel Terisi: {classStats.filter(c => c.total > 0).length} dari 12 Kelas
            </div>
          </div>
        </div>

        {/* School Snapshot / Headmaster Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-400" />
                Profil Pimpinan SD
              </h3>
              <span className="text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Aktif
              </span>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
                KS
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-100 text-sm truncate">
                  {school.kepalaSekolah}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Kepala Sekolah</p>
                <p className="text-[11px] text-amber-300/90 font-mono mt-0.5 truncate">
                  NIP. {school.nipKepalaSekolah}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 text-xs text-slate-300 bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                <span className="text-slate-300 leading-relaxed">
                  {school.alamatJalan}, {school.desaKelurahan}, {school.kecamatan}, {school.kabupatenKota}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-slate-400">
                <span>NPSN / NSS:</span>
                <span className="font-mono text-slate-200 font-semibold">{school.npsn} / {school.nss}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Akreditasi:</span>
                <span className="font-semibold text-emerald-400">Peringkat {school.akreditasi} (Sangat Baik)</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800">
            <button
              onClick={() => onNavigateTab('data-sekolah')}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span>Lihat Detail Profil & Visi Misi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Agenda & Pengumuman Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agenda Kegiatan Sekolah */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-bold text-slate-100 text-base">Agenda & Kalender Kegiatan</h3>
                <p className="text-xs text-slate-400">Rencana kegiatan akademik & kesiswaan</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddAgendaModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Agenda</span>
            </button>
          </div>

          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-1">
            {agendas.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Belum ada agenda kegiatan yang dicatat.
              </div>
            ) : (
              agendas.map((agenda) => {
                const isPast = new Date(agenda.tanggal) < new Date(new Date().toDateString());
                return (
                  <div
                    key={agenda.id}
                    className={`p-4 rounded-xl border transition-all ${
                      agenda.selesai
                        ? 'bg-slate-800/30 border-slate-800 opacity-60'
                        : 'bg-slate-800/70 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => onToggleAgenda(agenda.id)}
                          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                            agenda.selesai
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-600 hover:border-amber-400 text-transparent hover:text-amber-400'
                          }`}
                          title={agenda.selesai ? 'Tandai belum selesai' : 'Tandai selesai'}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <div className="min-w-0 flex-1">
                          <h4 className={`text-sm font-semibold text-slate-100 ${agenda.selesai ? 'line-through text-slate-400' : ''}`}>
                            {agenda.judul}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {agenda.keterangan}
                          </p>
                          <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                            <span className="flex items-center gap-1 text-amber-300">
                              <Calendar className="w-3 h-3" />
                              {agenda.tanggal} ({agenda.waktu})
                            </span>
                            <span className="flex items-center gap-1 text-slate-400">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {agenda.lokasi}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-700 text-slate-300">
                              {agenda.kategori}
                            </span>
                          </div>
                        </div>
                      </div>

                      {onDeleteAgenda && (
                        <button
                          type="button"
                          onClick={() => onDeleteAgenda(agenda.id, agenda.judul)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                          title="Hapus Agenda"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pengumuman & Informasi Sekolah */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="font-bold text-slate-100 text-base">Pengumuman & Pemberitahuan</h3>
                <p className="text-xs text-slate-400">Informasi internal guru & wali kelas</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddAnnounceModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-400/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Pengumuman</span>
            </button>
          </div>

          <div className="mt-4 space-y-3.5 max-h-96 overflow-y-auto pr-1">
            {announcements.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Belum ada pengumuman baru.
              </div>
            ) : (
              announcements.map((ann) => (
                <div 
                  key={ann.id}
                  className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      ann.prioritas === 'Tinggi'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : ann.prioritas === 'Sedang'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      Prioritas {ann.prioritas}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">{ann.tanggal}</span>
                      {onDeleteAnnouncement && (
                        <button
                          type="button"
                          onClick={() => onDeleteAnnouncement(ann.id, ann.judul)}
                          className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Hapus Pengumuman"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100 mt-2">
                    {ann.judul}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {ann.isi}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Oleh: <strong className="text-slate-300">{ann.pembuat}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Tambah Agenda */}
      {showAddAgendaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-4">Tambah Agenda Kegiatan Sekolah</h3>
            <form onSubmit={handleSaveAgenda} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Kegiatan *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Penilaian Tengah Semester (PTS)"
                  value={newAgendaJudul}
                  onChange={(e) => setNewAgendaJudul(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={newAgendaTanggal}
                    onChange={(e) => setNewAgendaTanggal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Waktu</label>
                  <input
                    type="text"
                    placeholder="08.00 - 11.00 WIB"
                    value={newAgendaWaktu}
                    onChange={(e) => setNewAgendaWaktu(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lokasi</label>
                  <input
                    type="text"
                    placeholder="Ruang Kelas / Aula"
                    value={newAgendaLokasi}
                    onChange={(e) => setNewAgendaLokasi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori</label>
                  <select
                    value={newAgendaKategori}
                    onChange={(e) => setNewAgendaKategori(e.target.value as SchoolAgenda['kategori'])}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Akademik">Akademik</option>
                    <option value="Kesiswaan">Kesiswaan</option>
                    <option value="Dinas / Rapat">Dinas / Rapat</option>
                    <option value="Kegiatan Ekstrakurikuler">Ekstrakurikuler</option>
                    <option value="Ujian">Ujian / Asesmen</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Keterangan / Deskripsi</label>
                <textarea
                  rows={2}
                  placeholder="Detail penjelasan kegiatan..."
                  value={newAgendaKeterangan}
                  onChange={(e) => setNewAgendaKeterangan(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddAgendaModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/30 transition-all"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Pengumuman */}
      {showAddAnnounceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-4">Buat Pengumuman Sekolah</h3>
            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Judul Pengumuman *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Batas Akhir Entri Nilai Rapor"
                  value={newAnnJudul}
                  onChange={(e) => setNewAnnJudul(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tingkat Prioritas</label>
                  <select
                    value={newAnnPrioritas}
                    onChange={(e) => setNewAnnPrioritas(e.target.value as SchoolAnnouncement['prioritas'])}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Biasa">Biasa</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Tinggi">Tinggi / Mendesak</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pembuat</label>
                  <input
                    type="text"
                    value={newAnnPembuat}
                    onChange={(e) => setNewAnnPembuat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Isi Pengumuman *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan pesan lengkap pengumuman..."
                  value={newAnnIsi}
                  onChange={(e) => setNewAnnIsi(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddAnnounceModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/30 transition-all"
                >
                  Publikasikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
