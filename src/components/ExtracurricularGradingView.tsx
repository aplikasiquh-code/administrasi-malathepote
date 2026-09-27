import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Student, 
  Teacher, 
  SchoolProfile, 
  ClassGrade, 
  ExtracurricularAssessment, 
  StudentExtraGrade,
  ExtraPredicate,
  ClassRoomItem
} from '../types';
import { 
  Award, 
  Sparkles, 
  Users, 
  Save, 
  Printer, 
  Download, 
  Check, 
  Plus, 
  Trash2, 
  Search, 
  RotateCcw, 
  ChevronRight, 
  Info, 
  Layers, 
  Activity, 
  HeartHandshake, 
  Music, 
  ShieldCheck, 
  Trophy, 
  Compass, 
  Edit3,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { exportExtracurricularToExcel } from '../utils/excelAssessmentUtils';
import { printDocumentWithA4 } from '../utils/exportUtils';
import { OfficialSchoolKop } from './OfficialSchoolKop';
import { formatIndonesianFullDate } from '../utils/indonesianCalendarUtils';
import { ConfirmDeleteModal, ConfirmDeleteState } from './ConfirmDeleteModal';

interface ExtracurricularGradingViewProps {
  students: Student[];
  teachers: Teacher[];
  school: SchoolProfile;
  extracurriculars: ExtracurricularAssessment[];
  classes?: ClassRoomItem[];
  onSaveExtracurricular: (assessment: ExtracurricularAssessment) => void;
  onDeleteExtracurricular: (id: string) => void;
  onAddToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

const DEFAULT_EKSKUL_LIST = [
  { name: 'Praja Muda Karana (Pramuka Siaga/Penggalang)', category: 'Wajib', icon: Compass },
  { name: 'Dokter Kecil / UKS', category: 'Pilihan Olahraga', icon: ShieldCheck },
  { name: 'Seni Tari Tradisional', category: 'Pilihan Seni & Budaya', icon: Music },
  { name: 'Pencak Silat / Beladiri', category: 'Pilihan Olahraga', icon: Trophy },
  { name: 'Futsal & Sepak Bola Mini', category: 'Pilihan Olahraga', icon: Activity },
  { name: 'Bulu Tangkis Cilik', category: 'Pilihan Olahraga', icon: Trophy },
  { name: 'Seni Lukis, Mewarnai & Kaligrafi', category: 'Pilihan Seni & Budaya', icon: Sparkles },
  { name: 'Marching Band / Drumband Gita Cilik', category: 'Pilihan Seni & Budaya', icon: Music },
  { name: 'Tahfidz & BTQ (Baca Tulis Al-Qur\'an)', category: 'Pilihan Keagamaan', icon: HeartHandshake },
  { name: 'Robotika & Komputer Cilik', category: 'Pilihan Sains & Teknologi', icon: Layers },
  { name: 'Paduan Suara & Musik Tradisional', category: 'Pilihan Seni & Budaya', icon: Music }
];

const PRESET_DESCRIPTIONS: Record<ExtraPredicate, string[]> = {
  A: [
    'Sangat aktif, bersemangat, dan menunjukkan kecakapan serta kepemimpinan yang sangat tinggi dalam setiap kegiatan.',
    'Menunjukkan keterampilan teknik yang sangat mahir, disiplin tinggi, dan selalu menjadi teladan bagi rekan kelompok.',
    'Sangat antusias, kreatif, dan mandiri dalam menyelesaikan tugas kepembinaan dengan hasil luar biasa.'
  ],
  B: [
    'Aktif dan tertib mengikuti latihan rutin serta mampu mempraktikkan materi pembinaan dengan baik.',
    'Menunjukkan kerja sama tim yang solid, mematuhi arahan pembina, dan disiplin dalam berkegiatan.',
    'Mampu menguasai keterampilan dasar dengan baik dan berpartisipasi positif dalam seluruh agenda kegiatan.'
  ],
  C: [
    'Cukup aktif mengikuti kegiatan pembinaan dan mulai memahami materi dasar yang diajarkan.',
    'Mampu mengikuti sebagian instruksi latihan dengan bimbingan dan pendampingan dari pembina ekskul.'
  ],
  D: [
    'Perlu motivasi lebih untuk aktif berpartisipasi dan meningkatkan kehadiran dalam latihan mingguan.'
  ]
};

export const ExtracurricularGradingView: React.FC<ExtracurricularGradingViewProps> = ({
  students,
  teachers,
  school,
  extracurriculars,
  classes = [],
  onSaveExtracurricular,
  onDeleteExtracurricular,
  onAddToast
}) => {
  const classList: ClassGrade[] = useMemo(() => {
    if (classes && classes.length > 0) {
      return classes.map(c => c.nama as ClassGrade);
    }
    const studentClasses = Array.from(new Set(students.map(s => s.kelas as ClassGrade)));
    return studentClasses.length > 0 ? studentClasses.sort() : ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
  }, [classes, students]);

  const [activeSubTab, setActiveSubTab] = useState<'input' | 'riwayat' | 'rekap'>('input');
  const [selectedClass, setSelectedClass] = useState<ClassGrade>(classList[0] || '1A');
  const [selectedEkskul, setSelectedEkskul] = useState<string>('Praja Muda Karana (Pramuka Siaga/Penggalang)');
  const [customEkskul, setCustomEkskul] = useState<string>('');
  const [isCustomEkskul, setIsCustomEkskul] = useState<boolean>(false);
  const [pembina, setPembina] = useState<string>('');
  const [tanggalPenilaian, setTanggalPenilaian] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [deskripsiUmum, setDeskripsiUmum] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Grades local state: studentId -> StudentExtraGrade
  const [gradesState, setGradesState] = useState<Record<string, StudentExtraGrade>>({});
  const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isPrintModalOpen) {
      document.body.classList.add('print-modal-open');
    } else {
      document.body.classList.remove('print-modal-open');
    }
    return () => {
      document.body.classList.remove('print-modal-open');
    };
  }, [isPrintModalOpen]);

  // Delete modal state
  const [deleteConfirm, setDeleteConfirm] = useState<ConfirmDeleteState>({
    isOpen: false,
    title: '',
    itemName: '',
    description: '',
    confirmButtonText: '',
    onConfirm: () => {}
  });

  // Filter students in current class
  const classStudents = useMemo(() => {
    const seen = new Set<string>();
    return students
      .filter(s => {
        if (s.kelas !== selectedClass || s.statusSiswa !== 'Aktif') return false;
        if (!s.id || seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      })
      .sort((a, b) => a.namaLengkap.localeCompare(b.namaLengkap));
  }, [students, selectedClass]);

  // Set default pembina based on wali kelas or selected teacher
  useEffect(() => {
    if (!pembina) {
      const wali = teachers.find(t => t.penugasanKelas.includes(selectedClass));
      if (wali) {
        setPembina(wali.namaLengkap);
      } else if (teachers.length > 0) {
        setPembina(teachers[0].namaLengkap);
      }
    }
  }, [selectedClass, teachers, pembina]);

  // Initialize or load grades when class or ekskul changes
  useEffect(() => {
    const currentEkskulName = isCustomEkskul ? customEkskul : selectedEkskul;
    const existing = extracurriculars.find(
      e => e.kelas === selectedClass && e.namaEkskul.toLowerCase() === currentEkskulName.toLowerCase()
    );

    if (existing) {
      setEditingAssessmentId(existing.id);
      setPembina(existing.pembina || '');
      setTanggalPenilaian(existing.tanggalPenilaian || new Date().toISOString().slice(0, 10));
      setDeskripsiUmum(existing.deskripsiUmum || '');

      const initialMap: Record<string, StudentExtraGrade> = {};
      classStudents.forEach(s => {
        const found = existing.grades?.find(g => g.studentId === s.id);
        if (found) {
          initialMap[s.id] = { ...found };
        } else {
          initialMap[s.id] = {
            studentId: s.id,
            predikat: 'B',
            nilaiAngka: 85,
            keterangan: PRESET_DESCRIPTIONS.B[0]
          };
        }
      });
      setGradesState(initialMap);
    } else {
      setEditingAssessmentId(null);
      const initialMap: Record<string, StudentExtraGrade> = {};
      classStudents.forEach(s => {
        initialMap[s.id] = {
          studentId: s.id,
          predikat: 'B',
          nilaiAngka: 85,
          keterangan: PRESET_DESCRIPTIONS.B[0]
        };
      });
      setGradesState(initialMap);
    }
  }, [selectedClass, selectedEkskul, customEkskul, isCustomEkskul, extracurriculars, classStudents]);

  const handleSetPredikat = (studentId: string, pred: ExtraPredicate) => {
    setGradesState(prev => {
      const current = prev[studentId] || { studentId, predikat: pred, keterangan: '' };
      const defaultDesc = PRESET_DESCRIPTIONS[pred][0];
      const defaultScore = pred === 'A' ? 92 : pred === 'B' ? 85 : pred === 'C' ? 75 : 65;
      return {
        ...prev,
        [studentId]: {
          ...current,
          predikat: pred,
          nilaiAngka: current.nilaiAngka !== undefined && current.nilaiAngka !== null ? current.nilaiAngka : defaultScore,
          keterangan: current.keterangan ? current.keterangan : defaultDesc
        }
      };
    });
  };

  const handleSetKeterangan = (studentId: string, text: string) => {
    setGradesState(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { studentId, predikat: 'B' }),
        keterangan: text
      }
    }));
  };

  const handleSetNilaiAngka = (studentId: string, score: number | null) => {
    setGradesState(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { studentId, predikat: 'B', keterangan: '' }),
        nilaiAngka: score
      }
    }));
  };

  const handleBulkSetPredikat = (pred: ExtraPredicate) => {
    const newMap: Record<string, StudentExtraGrade> = {};
    const defaultScore = pred === 'A' ? 92 : pred === 'B' ? 85 : pred === 'C' ? 75 : 65;
    classStudents.forEach(s => {
      newMap[s.id] = {
        studentId: s.id,
        predikat: pred,
        nilaiAngka: defaultScore,
        keterangan: PRESET_DESCRIPTIONS[pred][0]
      };
    });
    setGradesState(newMap);
    onAddToast('Predikat Massal', `Seluruh siswa diatur ke Predikat ${pred}`, 'info');
  };

  const handleSave = () => {
    const finalEkskulName = isCustomEkskul ? customEkskul.trim() : selectedEkskul.trim();
    if (!finalEkskulName) {
      onAddToast('Gagal Simpan', 'Nama ekstrakurikuler wajib diisi', 'error');
      return;
    }

    const gradesList: StudentExtraGrade[] = classStudents.map(s => {
      const g = gradesState[s.id];
      return {
        studentId: s.id,
        predikat: g?.predikat || 'B',
        nilaiAngka: typeof g?.nilaiAngka === 'number' ? g.nilaiAngka : null,
        keterangan: g?.keterangan || PRESET_DESCRIPTIONS[g?.predikat || 'B'][0]
      };
    });

    const assessmentToSave: ExtracurricularAssessment = {
      id: editingAssessmentId || `ekskul-${Date.now()}`,
      namaEkskul: finalEkskulName,
      kelas: selectedClass,
      tahunAjaran: school.tahunAjaran,
      semester: school.semester,
      pembina: pembina || teachers[0]?.namaLengkap || 'Pembina Ekstrakurikuler',
      tanggalPenilaian: tanggalPenilaian,
      deskripsiUmum: deskripsiUmum,
      grades: gradesList,
      createdAt: editingAssessmentId ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveExtracurricular(assessmentToSave);
    setEditingAssessmentId(assessmentToSave.id);
    onAddToast('Berhasil Disimpan', `Nilai Ekstrakurikuler ${finalEkskulName} Kelas ${selectedClass} tersimpan.`, 'success');
  };

  const handleExportExcel = () => {
    const finalEkskulName = isCustomEkskul ? customEkskul.trim() : selectedEkskul.trim();
    const currentAssessment: ExtracurricularAssessment = {
      id: editingAssessmentId || 'temp',
      namaEkskul: finalEkskulName,
      kelas: selectedClass,
      tahunAjaran: school.tahunAjaran,
      semester: school.semester,
      pembina: pembina,
      grades: classStudents.map(s => gradesState[s.id] || { studentId: s.id, predikat: 'B', keterangan: '' })
    };
    exportExtracurricularToExcel(currentAssessment, classStudents, school);
    onAddToast('Ekspor Berhasil', 'File Excel Nilai Ekstrakurikuler berhasil diunduh.', 'success');
  };

  // Stats calculation
  const stats = useMemo(() => {
    let countA = 0;
    let countB = 0;
    let countC = 0;
    let countD = 0;
    classStudents.forEach(s => {
      const pred = gradesState[s.id]?.predikat || 'B';
      if (pred === 'A') countA++;
      else if (pred === 'B') countB++;
      else if (pred === 'C') countC++;
      else if (pred === 'D') countD++;
    });
    return { countA, countB, countC, countD, total: classStudents.length };
  }, [classStudents, gradesState]);

  return (
    <div className={`space-y-6 ${isPrintModalOpen ? 'print:hidden' : ''}`}>
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>Buku Nilai Ekstrakurikuler SD</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Penilaian & Capaian Ekstrakurikuler
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Pencatatan predikat (A, B, C, D), nilai capaian, deskripsi narasi kompetensi siswa, serta buku rekap kegiatan ekstrakurikuler wajib & pilihan.
            </p>
          </div>

          {/* Quick Sub-tab selector */}
          <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveSubTab('input')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'input'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Input Nilai</span>
            </button>
            <button
              onClick={() => setActiveSubTab('rekap')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'rekap'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Rekap Kelas</span>
            </button>
            <button
              onClick={() => setActiveSubTab('riwayat')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'riwayat'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Riwayat ({extracurriculars.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB: INPUT NILAI */}
      {activeSubTab === 'input' && (
        <div className="space-y-6">
          {/* Class & Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                  Pilih Rombel:
                </span>
                {classList.map(cls => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedClass === cls
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-2 ring-amber-500/40'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    Kelas {cls}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>T.A. {school.tahunAjaran} • Semester {school.semester}</span>
              </div>
            </div>

            {/* Ekskul Selector Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Pilih Jenis Ekstrakurikuler:</span>
                <button
                  onClick={() => setIsCustomEkskul(!isCustomEkskul)}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isCustomEkskul ? 'Pilih dari Daftar Preset' : '+ Tambah Ekskul Lain'}</span>
                </button>
              </label>

              {!isCustomEkskul ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {DEFAULT_EKSKUL_LIST.map(item => {
                    const Icon = item.icon;
                    const isSelected = selectedEkskul === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => setSelectedEkskul(item.name)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'bg-amber-600/15 border-amber-500 text-white shadow-sm'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                          {item.category === 'Wajib' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300">
                              Wajib
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold line-clamp-2">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={customEkskul}
                    onChange={e => setCustomEkskul(e.target.value)}
                    placeholder="Ketik nama ekstrakurikuler kustom, misal: Klub Panahan Cilik, Sinematografi..."
                    className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Details (Pembina, Tanggal, Deskripsi) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Guru Pembina / Pelatih:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={pembina}
                    onChange={e => setPembina(e.target.value)}
                    placeholder="Nama Pembina / Pelatih"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tanggal Penilaian:
                </label>
                <input
                  type="date"
                  value={tanggalPenilaian}
                  onChange={e => setTanggalPenilaian(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Fokus / Materi Pembinaan (Opsional):
                </label>
                <input
                  type="text"
                  value={deskripsiUmum}
                  onChange={e => setDeskripsiUmum(e.target.value)}
                  placeholder="e.g. Pembinaan Baris Berbaris, Latihan Sandi & Tali Temali"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Action & Stat Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-300">Aksi Cepat Massal:</span>
              <button
                onClick={() => handleBulkSetPredikat('A')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-colors"
              >
                Semua Predikat A
              </button>
              <button
                onClick={() => handleBulkSetPredikat('B')}
                className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-bold transition-colors"
              >
                Semua Predikat B
              </button>
            </div>

            {/* Grade summary pill */}
            <div className="flex items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-bold">
                A: {stats.countA}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-400 font-bold">
                B: {stats.countB}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-bold">
                C: {stats.countC}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-400 font-bold">
                D: {stats.countD}
              </span>
              <span className="text-slate-400 font-medium">Total: {stats.total} Siswa</span>
            </div>
          </div>

          {/* Student Grading Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-bold text-white">
                  Daftar Peserta Didik Kelas {selectedClass} ({classStudents.length} Siswa)
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari siswa..."
                    className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-3 w-12 text-center">No</th>
                    <th className="p-3 w-28">NISN / NIS</th>
                    <th className="p-3 min-w-[180px]">Nama Lengkap Siswa</th>
                    <th className="p-3 w-16 text-center">L/P</th>
                    <th className="p-3 w-56 text-center">Predikat Capaian</th>
                    <th className="p-3 w-24 text-center">Nilai (0-100)</th>
                    <th className="p-3 min-w-[280px]">Deskripsi Capaian Pembina</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {classStudents
                    .filter(s => s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery))
                    .map((student, idx) => {
                      const grade = gradesState[student.id] || { studentId: student.id, predikat: 'B', keterangan: '' };
                      return (
                        <tr key={`${student.id}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                          <td className="p-3 font-mono text-[11px] text-slate-400">{student.nisn}</td>
                          <td className="p-3 font-semibold text-white">
                            <div>{student.namaLengkap}</div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              student.jenisKelamin === 'L' ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'
                            }`}>
                              {student.jenisKelamin}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1.5">
                              {(['A', 'B', 'C', 'D'] as ExtraPredicate[]).map(pred => {
                                const isSelected = grade.predikat === pred;
                                const colorClass = 
                                  pred === 'A' ? (isSelected ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' : 'bg-slate-800 text-emerald-400 hover:bg-emerald-500/20') :
                                  pred === 'B' ? (isSelected ? 'bg-blue-600 text-white ring-2 ring-blue-400' : 'bg-slate-800 text-blue-400 hover:bg-blue-500/20') :
                                  pred === 'C' ? (isSelected ? 'bg-amber-600 text-white ring-2 ring-amber-400' : 'bg-slate-800 text-amber-400 hover:bg-amber-500/20') :
                                  (isSelected ? 'bg-rose-600 text-white ring-2 ring-rose-400' : 'bg-slate-800 text-rose-400 hover:bg-rose-500/20');

                                return (
                                  <button
                                    key={pred}
                                    type="button"
                                    onClick={() => handleSetPredikat(student.id, pred)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${colorClass}`}
                                  >
                                    {pred}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={grade.nilaiAngka !== undefined && grade.nilaiAngka !== null ? grade.nilaiAngka : ''}
                              onChange={e => {
                                const val = e.target.value === '' ? null : Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                handleSetNilaiAngka(student.id, val);
                              }}
                              placeholder="85"
                              className="w-16 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-center font-bold text-amber-300 text-xs focus:outline-none focus:border-amber-500"
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <textarea
                                rows={2}
                                value={grade.keterangan || ''}
                                onChange={e => handleSetKeterangan(student.id, e.target.value)}
                                placeholder="Deskripsi capaian siswa..."
                                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 bg-slate-800/70 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Predikat A (Sangat Baik), B (Baik), C (Cukup), D (Kurang) sesuai format rapor SD.</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportExcel}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Ekspor Excel</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-blue-400" />
                  <span>Cetak Format Resmi</span>
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition-all flex items-center gap-2 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Nilai Ekskul</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: RIWAYAT ASESMEN EKSKUL */}
      {activeSubTab === 'riwayat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              <span>Riwayat Penilaian Ekstrakurikuler Tersimpan ({extracurriculars.length})</span>
            </h2>
          </div>

          {extracurriculars.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-800/40 rounded-2xl border border-dashed border-slate-700">
              Belum ada penilaian ekstrakurikuler tersimpan. Silakan input pada tab "Input Nilai".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {extracurriculars.map(item => (
                <div key={item.id} className="p-5 bg-slate-800/70 border border-slate-700/80 rounded-2xl space-y-3 relative group">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs">
                      Kelas {item.kelas}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {item.tanggalPenilaian || 'Tersimpan'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{item.namaEkskul}</h3>
                    <p className="text-xs text-slate-400 mt-1">Pembina: {item.pembina || '-'}</p>
                    <p className="text-xs text-slate-500">{item.grades.length} siswa dinilai</p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                    <button
                      onClick={() => {
                        setSelectedClass(item.kelas as ClassGrade);
                        setSelectedEkskul(item.namaEkskul);
                        setActiveSubTab('input');
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 text-xs font-bold transition-colors"
                    >
                      Buka / Edit
                    </button>
                    <button
                      onClick={() => {
                        exportExtracurricularToExcel(item, students.filter(s => s.kelas === item.kelas), school);
                      }}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300"
                      title="Unduh Excel"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteConfirm({
                          isOpen: true,
                          title: 'Hapus Nilai Ekstrakurikuler',
                          itemName: `${item.namaEkskul} - Kelas ${item.kelas}`,
                          description: 'Apakah Anda yakin ingin menghapus data nilai ekstrakurikuler ini?',
                          confirmButtonText: 'Ya, Hapus Data',
                          onConfirm: () => {
                            onDeleteExtracurricular(item.id);
                            onAddToast('Data Dihapus', 'Nilai ekstrakurikuler berhasil dihapus.', 'info');
                          }
                        });
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: REKAP KELAS */}
      {activeSubTab === 'rekap' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">
                Buku Rekap Nilai Ekstrakurikuler — Kelas {selectedClass}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Tahun Ajaran {school.tahunAjaran} • Semester {school.semester}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {classList.map(cls => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedClass === cls
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-800 text-slate-300 font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-3 w-10 text-center">No</th>
                  <th className="p-3 w-28">NISN</th>
                  <th className="p-3 min-w-[160px]">Nama Lengkap Siswa</th>
                  {extracurriculars
                    .filter(e => e.kelas === selectedClass)
                    .map(e => (
                      <th key={e.id} className="p-3 text-center min-w-[120px]">
                        {e.namaEkskul}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {classStudents.map((s, idx) => (
                  <tr key={`${s.id}-${idx}`} className="hover:bg-slate-800/30">
                    <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-mono text-slate-400">{s.nisn}</td>
                    <td className="p-3 font-semibold text-white">{s.namaLengkap}</td>
                    {extracurriculars
                      .filter(e => e.kelas === selectedClass)
                      .map(e => {
                        const grade = e.grades?.find(g => g.studentId === s.id);
                        const pred = grade?.predikat || '-';
                        return (
                          <td key={e.id} className="p-3 text-center font-bold">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              pred === 'A' ? 'bg-emerald-500/20 text-emerald-300' :
                              pred === 'B' ? 'bg-blue-500/20 text-blue-300' :
                              pred === 'C' ? 'bg-amber-500/20 text-amber-300' :
                              pred === 'D' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-500'
                            }`}>
                              {pred} {grade?.nilaiAngka ? `(${grade.nilaiAngka})` : ''}
                            </span>
                          </td>
                        );
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINT MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:overflow-visible print:block print:z-auto">
          <div className="bg-white text-black rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl print:w-full print:max-w-none print:max-h-none print:shadow-none print:p-0 print:my-0 print:border-none print:block print:static a4-portrait-sheet">
            <div className="flex justify-between items-center pb-4 border-b print:hidden flex-wrap gap-2">
              <div>
                <span className="font-bold text-slate-800 text-sm block">Pratinjau Cetak Nilai Ekstrakurikuler</span>
                <span className="text-[11px] text-slate-500">Mendukung printer kabel (USB), nirkabel (Wi-Fi/Bluetooth), dan Simpan PDF format A4 Portrait</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportExcel}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Unduh format spreadsheet Excel (.xlsx)"
                >
                  <Download className="w-4 h-4 text-emerald-100" />
                  <span>Simpan Excel</span>
                </button>
                <button
                  onClick={() => {
                    printDocumentWithA4({
                      orientation: 'portrait',
                      title: `Nilai_Ekstrakurikuler_${(isCustomEkskul ? customEkskul : selectedEkskul).replace(/\s+/g, '_')}_Kelas_${selectedClass}`
                    });
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                  title="Cetak format A4 Portrait ke printer atau Simpan PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / PDF A4</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Official School Header */}
            <div className="pt-4">
              <OfficialSchoolKop school={school} />
            </div>

            <div className="text-center my-4 space-y-1">
              <h2 className="text-base font-bold uppercase underline">
                LEMBAR PENILAIAN KEGIATAN EKSTRAKURIKULER
              </h2>
              <p className="text-xs text-neutral-700">
                Ekstrakurikuler: <span className="font-bold">{isCustomEkskul ? customEkskul : selectedEkskul}</span> | Kelas: <span className="font-bold">{selectedClass}</span>
              </p>
              <p className="text-xs text-neutral-600">
                Tahun Ajaran {school.tahunAjaran} — Semester {school.semester}
              </p>
            </div>

            <table className="w-full border-collapse border border-neutral-950 text-[11px] mt-4">
              <thead className="bg-neutral-100 font-bold text-center">
                <tr>
                  <th className="border border-neutral-950 p-2 w-8">No</th>
                  <th className="border border-neutral-950 p-2 w-24">NISN</th>
                  <th className="border border-neutral-950 p-2 min-w-[150px] text-left">Nama Peserta Didik</th>
                  <th className="border border-neutral-950 p-2 w-10">L/P</th>
                  <th className="border border-neutral-950 p-2 w-16">Predikat</th>
                  <th className="border border-neutral-950 p-2 w-16">Nilai</th>
                  <th className="border border-neutral-950 p-2 min-w-[200px] text-left">Keterangan / Capaian</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((student, idx) => {
                  const g = gradesState[student.id];
                  return (
                    <tr key={`${student.id}-${idx}`}>
                      <td className="border border-neutral-950 p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-neutral-950 p-1.5 text-center font-mono">{student.nisn}</td>
                      <td className="border border-neutral-950 p-1.5 font-bold">{student.namaLengkap}</td>
                      <td className="border border-neutral-950 p-1.5 text-center">{student.jenisKelamin}</td>
                      <td className="border border-neutral-950 p-1.5 text-center font-bold">{g?.predikat || '-'}</td>
                      <td className="border border-neutral-950 p-1.5 text-center font-mono">{g?.nilaiAngka || '-'}</td>
                      <td className="border border-neutral-950 p-1.5">{g?.keterangan || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Signature block */}
            <div className="mt-8 flex justify-between items-start text-xs text-black pt-4 break-inside-avoid">
              <div className="w-72 text-center">
                <p>Mengetahui,</p>
                <p className="font-semibold">Kepala Sekolah</p>
                <div className="h-16" />
                <p className="font-bold underline">{school.kepalaSekolah}</p>
                <p className="text-[11px] font-mono">NIP. {school.nipKepalaSekolah}</p>
              </div>

              <div className="w-72 text-center">
                <p>{school.kabupatenKota}, {formatIndonesianFullDate(tanggalPenilaian)}</p>
                <p className="font-semibold">Pembina / Pelatih Ekstrakurikuler</p>
                <div className="h-16" />
                <p className="font-bold underline">{pembina || '....................................................'}</p>
                <p className="text-[11px] font-mono">NIP / NUPTK. .............................................</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        state={deleteConfirm}
        onClose={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
