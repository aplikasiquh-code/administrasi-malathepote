import React, { useState, useMemo, useEffect } from 'react';
import { 
  Student, 
  Teacher, 
  SchoolProfile, 
  ClassGrade, 
  CocurricularProject, 
  P5Theme, 
  P5Dimension, 
  P5AchievementScale, 
  P5TargetElement, 
  StudentP5Grade,
  ClassRoomItem
} from '../types';
import { 
  Sparkles, 
  Users, 
  Save, 
  Printer, 
  Download, 
  Plus, 
  Trash2, 
  Search, 
  RotateCcw, 
  ChevronRight, 
  Info, 
  Layers, 
  Award, 
  BookOpen, 
  FolderCheck, 
  Tag, 
  CheckCircle2, 
  Calendar,
  Compass,
  Edit3,
  Flame,
  Globe2,
  Heart,
  Lightbulb,
  Palette,
  ShieldAlert
} from 'lucide-react';
import { exportCocurricularProjectToExcel } from '../utils/excelAssessmentUtils';
import { printDocumentWithA4 } from '../utils/exportUtils';
import { OfficialSchoolKop } from './OfficialSchoolKop';
import { formatIndonesianFullDate } from '../utils/indonesianCalendarUtils';
import { ConfirmDeleteModal, ConfirmDeleteState } from './ConfirmDeleteModal';

interface CocurricularGradingViewProps {
  students: Student[];
  teachers: Teacher[];
  school: SchoolProfile;
  cocurricularProjects: CocurricularProject[];
  classes?: ClassRoomItem[];
  onSaveCocurricularProject: (project: CocurricularProject) => void;
  onDeleteCocurricularProject: (projectId: string) => void;
  onAddToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

const P5_THEMES: { theme: P5Theme; desc: string; icon: any }[] = [
  { theme: 'Gaya Hidup Berkelanjutan', desc: 'Pemahaman dampak aktivitas manusia terhadap lingkungan fisik dan sosial.', icon: Globe2 },
  { theme: 'Kearifan Lokal', desc: 'Menelusuri dan melestarikan warisan budaya lokal serta kearifan leluhur.', icon: Compass },
  { theme: 'Bhinneka Tunggal Ika', desc: 'Mengenal dan menghargai keragaman suku, agama, dan budaya nusantara.', icon: Heart },
  { theme: 'Bangunlah Jiwa dan Raganya', desc: 'Kesehatan fisik, mental, kebugaran jasmani, dan kesejahteraan sosial.', icon: Flame },
  { theme: 'Rekayasa dan Teknologi', desc: 'Membuat produk inovatif atau teknologi rekayasa sederhana guna memecahkan masalah.', icon: Lightbulb },
  { theme: 'Kewirausahaan', desc: 'Menumbuhkan jiwa kewirausahaan, kreativitas pasar, dan etika kerja produktif.', icon: Sparkles }
];

const P5_DIMENSIONS: P5Dimension[] = [
  'Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia',
  'Berkebinekaan Global',
  'Bergotong Royong',
  'Mandiri',
  'Bernalar Kritis',
  'Kreatif'
];

const PRESET_ELEMENTS_BY_DIMENSION: Record<P5Dimension, { elemen: string; subElemen: string; targetCapaian: string }[]> = {
  'Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia': [
    { elemen: 'Akhlak kepada Alam', subElemen: 'Menjaga Lingkungan Alam Sekitar', targetCapaian: 'Membiasakan bersyukur atas karunia alam semesta dan tidak merusak lingkungan.' },
    { elemen: 'Akhlak Pribadi', subElemen: 'Integritas & Kejujuran', targetCapaian: 'Membiasakan bersikap jujur dan menepati janji dalam kegiatan bersama.' }
  ],
  'Berkebinekaan Global': [
    { elemen: 'Mengenal dan Menghargai Budaya', subElemen: 'Mendalami Budaya & Identitas', targetCapaian: 'Mengidentifikasi dan mendeskripsikan keragaman tradisi serta makanan lokal.' },
    { elemen: 'Komunikasi dan Interaksi Antar Budaya', subElemen: 'Mempertimbangkan Perspektif Orang Lain', targetCapaian: 'Mendengarkan dengan baik pendapat teman dari latar belakang berbeda.' }
  ],
  'Bergotong Royong': [
    { elemen: 'Kolaborasi', subElemen: 'Kerja Sama & Berbagi', targetCapaian: 'Menerima dan melaksanakan peran yang diberikan dalam kelompok kegiatan bersama.' },
    { elemen: 'Kepedulian', subElemen: 'Tanggap terhadap Lingkungan Sosial', targetCapaian: 'Peka terhadap kebutuhan teman di kelas dan lingkungan sekitar sekolah.' }
  ],
  'Mandiri': [
    { elemen: 'Pemahaman Diri dan Situasi', subElemen: 'Mengenali Kualitas Diri', targetCapaian: 'Mengidentifikasi potensi, kelebihan, dan tantangan yang dihadapi diri sendiri.' },
    { elemen: 'Regulasi Diri', subElemen: 'Percaya Diri & Disiplin Waktu', targetCapaian: 'Mengerjakan tugas proyek secara mandiri dan tepat waktu.' }
  ],
  'Bernalar Kritis': [
    { elemen: 'Memperoleh dan Memproses Informasi', subElemen: 'Mengajukan Pertanyaan Kritis', targetCapaian: 'Mengajukan pertanyaan untuk mengidentifikasi penyebab masalah lingkungan di sekitar.' },
    { elemen: 'Refleksi Pemikiran', subElemen: 'Menjelaskan Alasan / Argumen', targetCapaian: 'Menyampaikan alasan sederhana di balik pilihan solusi yang diajukan.' }
  ],
  'Kreatif': [
    { elemen: 'Menghasilkan Gagasan Orisinal', subElemen: 'Mengeksplorasi Ide Kreatif', targetCapaian: 'Mengekspresikan pikiran atau perasaan dalam bentuk karya orisinal/daur ulang.' },
    { elemen: 'Menghasilkan Karya dan Tindakan', subElemen: 'Mengeksekusi Karya Nyata', targetCapaian: 'Membuat produk atau karya fungsional sesuai tema proyek.' }
  ]
};

export const CocurricularGradingView: React.FC<CocurricularGradingViewProps> = ({
  students,
  teachers,
  school,
  cocurricularProjects,
  classes = [],
  onSaveCocurricularProject,
  onDeleteCocurricularProject,
  onAddToast
}) => {
  const classList: ClassGrade[] = useMemo(() => {
    if (classes && classes.length > 0) {
      return classes.map(c => c.nama as ClassGrade);
    }
    const studentClasses = Array.from(new Set(students.map(s => s.kelas as ClassGrade)));
    return studentClasses.length > 0 ? studentClasses.sort() : ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
  }, [classes, students]);

  const [activeSubTab, setActiveSubTab] = useState<'input' | 'projects' | 'rekap'>('input');
  const [selectedClass, setSelectedClass] = useState<ClassGrade>(classList[0] || '1A');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Form project state
  const [judulProjek, setJudulProjek] = useState<string>('');
  const [tema, setTema] = useState<P5Theme>('Gaya Hidup Berkelanjutan');
  const [fase, setFase] = useState<'Fase A (Kelas 1-2)' | 'Fase B (Kelas 3-4)' | 'Fase C (Kelas 5-6)'>('Fase A (Kelas 1-2)');
  const [deskripsiSingkat, setDeskripsiSingkat] = useState<string>('');
  const [koordinator, setKoordinator] = useState<string>('');
  const [targetElements, setTargetElements] = useState<P5TargetElement[]>([]);
  const [studentGradesMap, setStudentGradesMap] = useState<Record<string, StudentP5Grade>>({});
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // Modal delete
  const [deleteConfirm, setDeleteConfirm] = useState<ConfirmDeleteState>({
    isOpen: false,
    title: '',
    itemName: '',
    description: '',
    confirmButtonText: '',
    onConfirm: () => {}
  });

  // Current class students
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

  // Projects available for selected class
  const classProjects = useMemo(() => {
    return cocurricularProjects.filter(p => p.kelas === selectedClass);
  }, [cocurricularProjects, selectedClass]);

  // Load project or set default
  useEffect(() => {
    if (classProjects.length > 0 && !selectedProjectId) {
      loadProject(classProjects[0]);
    } else if (selectedProjectId) {
      const found = cocurricularProjects.find(p => p.id === selectedProjectId);
      if (found) loadProject(found);
    } else {
      initNewProject();
    }
  }, [selectedClass, selectedProjectId, cocurricularProjects]);

  const loadProject = (proj: CocurricularProject) => {
    setSelectedProjectId(proj.id);
    setJudulProjek(proj.judulProjek);
    setTema(proj.tema);
    setFase(proj.fase);
    setDeskripsiSingkat(proj.deskripsiSingkat);
    setKoordinator(proj.koordinator);
    setTargetElements(proj.targetElements || []);

    const gradesObj: Record<string, StudentP5Grade> = {};
    classStudents.forEach(s => {
      const existing = proj.studentGrades?.find(g => g.studentId === s.id);
      if (existing) {
        gradesObj[s.id] = { ...existing };
      } else {
        const defaultRatings: Record<string, P5AchievementScale> = {};
        proj.targetElements.forEach(e => {
          defaultRatings[e.id] = 'BSH';
        });
        gradesObj[s.id] = {
          studentId: s.id,
          ratings: defaultRatings,
          catatanProses: 'Menunjukkan partisipasi aktif dan mampu bekerjasama dengan baik dalam proyek.'
        };
      }
    });
    setStudentGradesMap(gradesObj);
  };

  const initNewProject = () => {
    setSelectedProjectId('');
    setJudulProjek('Pilah Sampah, Selamatkan Lingkungan Sekolah');
    setTema('Gaya Hidup Berkelanjutan');
    const autoFase = ['1A', '1B', '2A', '2B'].includes(selectedClass)
      ? 'Fase A (Kelas 1-2)'
      : ['3A', '3B', '4A', '4B'].includes(selectedClass)
      ? 'Fase B (Kelas 3-4)'
      : 'Fase C (Kelas 5-6)';
    setFase(autoFase);
    setDeskripsiSingkat('Projek penguatan karakter peduli lingkungan melalui pemilahan sampah organik dan anorganik serta pembuatan kreasi daur ulang.');
    setKoordinator(teachers[0]?.namaLengkap || 'Koordinator P5');

    const defaultElements: P5TargetElement[] = [
      {
        id: `elem-${Date.now()}-1`,
        dimensi: 'Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia',
        elemen: 'Akhlak kepada Alam',
        subElemen: 'Menjaga Lingkungan Sekitar',
        targetCapaian: 'Membiasakan bersyukur atas karunia alam dan tidak merusak lingkungan.'
      },
      {
        id: `elem-${Date.now()}-2`,
        dimensi: 'Bergotong Royong',
        elemen: 'Kolaborasi',
        subElemen: 'Kerja Sama & Berbagi',
        targetCapaian: 'Menerima dan melaksanakan peran yang diberikan dalam kelompok kegiatan bersama.'
      },
      {
        id: `elem-${Date.now()}-3`,
        dimensi: 'Kreatif',
        elemen: 'Menghasilkan Karya yang Orisinal',
        subElemen: 'Mengeksplorasi Ide Kreatif',
        targetCapaian: 'Mengekspresikan gagasan dalam bentuk produk daur ulang sederhana.'
      }
    ];
    setTargetElements(defaultElements);

    const initialMap: Record<string, StudentP5Grade> = {};
    classStudents.forEach(s => {
      const defaultRatings: Record<string, P5AchievementScale> = {};
      defaultElements.forEach(e => {
        defaultRatings[e.id] = 'BSH';
      });
      initialMap[s.id] = {
        studentId: s.id,
        ratings: defaultRatings,
        catatanProses: 'Aktif bekerjasama dalam tim dan antusias melaksanakan kegiatan projek.'
      };
    });
    setStudentGradesMap(initialMap);
  };

  const handleAddTargetElement = (dimensi: P5Dimension) => {
    const presets = PRESET_ELEMENTS_BY_DIMENSION[dimensi];
    const defaultItem = presets[0] || {
      elemen: 'Elemen Karakter',
      subElemen: 'Sub Elemen Capaian',
      targetCapaian: 'Mampu mencapai target kompetensi fase.'
    };

    const newElem: P5TargetElement = {
      id: `elem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dimensi: dimensi,
      elemen: defaultItem.elemen,
      subElemen: defaultItem.subElemen,
      targetCapaian: defaultItem.targetCapaian
    };

    setTargetElements(prev => [...prev, newElem]);

    // Update existing student grades to include this element
    setStudentGradesMap(prev => {
      const updated: Record<string, StudentP5Grade> = {};
      Object.keys(prev).forEach(sId => {
        updated[sId] = {
          ...prev[sId],
          ratings: {
            ...prev[sId].ratings,
            [newElem.id]: 'BSH'
          }
        };
      });
      return updated;
    });

    onAddToast('Target Dimensi Ditambahkan', `Dimensi "${dimensi}" ditambahkan ke lembar penilaian proyek.`, 'info');
  };

  const handleRemoveTargetElement = (elementId: string) => {
    if (targetElements.length <= 1) {
      onAddToast('Perhatian', 'Minimal harus ada 1 target dimensi dalam proyek.', 'error');
      return;
    }
    setTargetElements(prev => prev.filter(e => e.id !== elementId));
  };

  const handleSetStudentRating = (studentId: string, elementId: string, scale: P5AchievementScale) => {
    setStudentGradesMap(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { studentId, ratings: {} }),
        ratings: {
          ...(prev[studentId]?.ratings || {}),
          [elementId]: scale
        }
      }
    }));
  };

  const handleSetStudentProcessNote = (studentId: string, note: string) => {
    setStudentGradesMap(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { studentId, ratings: {} }),
        catatanProses: note
      }
    }));
  };

  const handleBulkSetScale = (elementId: string, scale: P5AchievementScale) => {
    setStudentGradesMap(prev => {
      const updated: Record<string, StudentP5Grade> = {};
      classStudents.forEach(s => {
        const cur = prev[s.id] || { studentId: s.id, ratings: {} };
        updated[s.id] = {
          ...cur,
          ratings: {
            ...cur.ratings,
            [elementId]: scale
          }
        };
      });
      return updated;
    });
    onAddToast('Penilaian Massal', `Semua siswa diatur ke skala ${scale} untuk indikator terpilih.`, 'info');
  };

  const handleSaveProject = () => {
    if (!judulProjek.trim()) {
      onAddToast('Gagal Simpan', 'Judul projek P5 wajib diisi.', 'error');
      return;
    }

    const studentGradesList: StudentP5Grade[] = classStudents.map(s => {
      const g = studentGradesMap[s.id];
      return {
        studentId: s.id,
        ratings: g?.ratings || {},
        catatanProses: g?.catatanProses || 'Berpartisipasi aktif dalam kegiatan projek.'
      };
    });

    const projectToSave: CocurricularProject = {
      id: selectedProjectId || `p5-${Date.now()}`,
      judulProjek: judulProjek.trim(),
      tema: tema,
      fase: fase,
      kelas: selectedClass,
      tahunAjaran: school.tahunAjaran,
      semester: school.semester,
      deskripsiSingkat: deskripsiSingkat,
      koordinator: koordinator || teachers[0]?.namaLengkap || 'Koordinator P5',
      targetElements: targetElements,
      studentGrades: studentGradesList,
      createdAt: selectedProjectId ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveCocurricularProject(projectToSave);
    setSelectedProjectId(projectToSave.id);
    onAddToast('Berhasil Disimpan', `Projek P5 "${projectToSave.judulProjek}" Kelas ${selectedClass} tersimpan.`, 'success');
  };

  const handleExportExcel = () => {
    const currentProject: CocurricularProject = {
      id: selectedProjectId || 'temp',
      judulProjek: judulProjek,
      tema: tema,
      fase: fase,
      kelas: selectedClass,
      tahunAjaran: school.tahunAjaran,
      semester: school.semester,
      deskripsiSingkat: deskripsiSingkat,
      koordinator: koordinator,
      targetElements: targetElements,
      studentGrades: classStudents.map(s => studentGradesMap[s.id] || { studentId: s.id, ratings: {} })
    };
    exportCocurricularProjectToExcel(currentProject, classStudents, school);
    onAddToast('Ekspor Berhasil', 'File Excel Rapor Projek P5 berhasil diunduh.', 'success');
  };

  return (
    <div className={`space-y-6 ${isPrintModalOpen ? 'print:hidden' : ''}`}>
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kokurikuler & Projek Profil Pelajar Pancasila (P5)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Penilaian & Rapor Kokurikuler (P5)
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Asesmen deskriptif 6 dimensi profil Pancasila dengan skala capaian MB (Mulai Berkembang), SB (Sedang Berkembang), BSH (Berkembang Sesuai Harapan), dan SAB (Sangat Berkembang).
            </p>
          </div>

          <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveSubTab('input')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'input'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Input Asesmen</span>
            </button>
            <button
              onClick={() => setActiveSubTab('projects')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'projects'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderCheck className="w-4 h-4" />
              <span>Daftar Projek ({cocurricularProjects.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('rekap')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'rekap'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Rekap Rapor</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB: INPUT PENILAIAN PROJEK */}
      {activeSubTab === 'input' && (
        <div className="space-y-6">
          {/* Class & Project Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                  Pilih Rombel:
                </span>
                {classList.map(cls => (
                  <button
                    key={cls}
                    onClick={() => {
                      setSelectedClass(cls);
                      setSelectedProjectId('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedClass === cls
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 ring-2 ring-violet-500/40'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    Kelas {cls}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={initNewProject}
                  className="px-3.5 py-1.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Buat Projek Baru</span>
                </button>
              </div>
            </div>

            {/* Existing Projects for this class chips */}
            {classProjects.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs text-slate-400 font-semibold shrink-0">Projek Tersimpan:</span>
                {classProjects.map(proj => (
                  <button
                    key={proj.id}
                    onClick={() => loadProject(proj)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
                      selectedProjectId === proj.id
                        ? 'bg-violet-500/30 text-violet-200 border border-violet-500/50'
                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    {proj.judulProjek.slice(0, 30)}...
                  </button>
                ))}
              </div>
            )}

            {/* Tema P5 Selector Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Pilih Tema Projek P5:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {P5_THEMES.map(t => {
                  const Icon = t.icon;
                  const isSelected = tema === t.theme;
                  return (
                    <button
                      key={t.theme}
                      onClick={() => setTema(t.theme)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'bg-violet-600/20 border-violet-500 text-white shadow-sm ring-1 ring-violet-500/50'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-violet-400' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold line-clamp-2">{t.theme}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Project Details Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Judul Projek:
                </label>
                <input
                  type="text"
                  value={judulProjek}
                  onChange={e => setJudulProjek(e.target.value)}
                  placeholder="e.g. Pilah Sampah, Selamatkan Bumi Kita (Eko-Enzim & Kompos)"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Fase Kurikulum & Koordinator:
                </label>
                <input
                  type="text"
                  value={koordinator}
                  onChange={e => setKoordinator(e.target.value)}
                  placeholder="Nama Koordinator Projek"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Deskripsi Singkat Projek:
              </label>
              <textarea
                rows={2}
                value={deskripsiSingkat}
                onChange={e => setDeskripsiSingkat(e.target.value)}
                placeholder="Uraian singkat tujuan dan tahapan kegiatan projek..."
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>
          </div>

          {/* Target Dimensi & Elemen Manager */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-violet-400" />
                <h2 className="text-sm font-bold text-white">
                  Target Dimensi & Elemen Capaian P5 ({targetElements.length} Indikator)
                </h2>
              </div>

              {/* Add Dimension Dropdown / Quick Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium mr-1">+ Tambah Dimensi:</span>
                {P5_DIMENSIONS.map(dim => {
                  const shortName = dim.split(',')[0].slice(0, 16);
                  return (
                    <button
                      key={dim}
                      onClick={() => handleAddTargetElement(dim)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-violet-600/30 text-slate-300 hover:text-violet-200 border border-slate-700 text-[11px] font-semibold transition-all"
                    >
                      + {shortName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dimension list cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {targetElements.map((elem, idx) => (
                <div key={elem.id} className="p-4 bg-slate-800/70 border border-slate-700 rounded-xl space-y-2 relative">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-violet-500/20 text-violet-300">
                      Dimensi {idx + 1}
                    </span>
                    <button
                      onClick={() => handleRemoveTargetElement(elem.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Hapus Indikator"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-violet-400 line-clamp-1">{elem.dimensi}</span>
                    <h3 className="text-xs font-bold text-white mt-0.5">{elem.subElemen}</h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{elem.targetCapaian}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scale Legend Guide */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 font-extrabold flex items-center justify-center text-xs">
                MB
              </span>
              <div>
                <div className="text-xs font-bold text-white">Mulai Berkembang</div>
                <div className="text-[10px] text-slate-400">Memerlukan bimbingan fasilitator</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-extrabold flex items-center justify-center text-xs">
                SB
              </span>
              <div>
                <div className="text-xs font-bold text-white">Sedang Berkembang</div>
                <div className="text-[10px] text-slate-400">Mulai konsisten dalam aksi</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-extrabold flex items-center justify-center text-xs">
                BSH
              </span>
              <div>
                <div className="text-xs font-bold text-white">Berkembang Sesuai Harapan</div>
                <div className="text-[10px] text-slate-400">Target capaian fase terpenuhi</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-xs">
                SAB
              </span>
              <div>
                <div className="text-xs font-bold text-white">Sangat Berkembang</div>
                <div className="text-[10px] text-slate-400">Melampaui target fase & teladan</div>
              </div>
            </div>
          </div>

          {/* Student Grading Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-400" />
                <h2 className="text-sm font-bold text-white">
                  Matriks Penilaian Peserta Didik ({classStudents.length} Siswa)
                </h2>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari siswa..."
                  className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-800/90 text-slate-300 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-3 w-10 text-center">No</th>
                    <th className="p-3 w-28">NISN</th>
                    <th className="p-3 min-w-[160px]">Nama Lengkap Siswa</th>
                    {targetElements.map((elem, eIdx) => (
                      <th key={elem.id} className="p-3 text-center min-w-[180px]">
                        <div className="font-bold text-white line-clamp-1">{elem.subElemen}</div>
                        <div className="text-[10px] text-violet-400 font-normal">{elem.dimensi.slice(0, 18)}...</div>
                        <div className="flex items-center justify-center gap-1 mt-1.5">
                          {(['MB', 'SB', 'BSH', 'SAB'] as P5AchievementScale[]).map(sc => (
                            <button
                              key={sc}
                              type="button"
                              onClick={() => handleBulkSetScale(elem.id, sc)}
                              className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-[9px] font-bold text-slate-200"
                              title={`Set semua ke ${sc}`}
                            >
                              {sc}
                            </button>
                          ))}
                        </div>
                      </th>
                    ))}
                    <th className="p-3 min-w-[240px]">Catatan Proses Guru</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {classStudents
                    .filter(s => s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery))
                    .map((student, idx) => {
                      const grade = studentGradesMap[student.id] || { studentId: student.id, ratings: {} };
                      return (
                        <tr key={`${student.id}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                          <td className="p-3 font-mono text-[11px] text-slate-400">{student.nisn}</td>
                          <td className="p-3 font-semibold text-white">
                            <div>{student.namaLengkap}</div>
                          </td>
                          {targetElements.map(elem => {
                            const scale = grade.ratings[elem.id] || 'BSH';
                            return (
                              <td key={elem.id} className="p-3 text-center">
                                <div className="inline-flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                                  {(['MB', 'SB', 'BSH', 'SAB'] as P5AchievementScale[]).map(sc => {
                                    const isSelected = scale === sc;
                                    const colorClass = 
                                      sc === 'MB' ? (isSelected ? 'bg-rose-600 text-white font-bold' : 'text-rose-400 hover:bg-rose-500/20') :
                                      sc === 'SB' ? (isSelected ? 'bg-amber-600 text-white font-bold' : 'text-amber-400 hover:bg-amber-500/20') :
                                      sc === 'BSH' ? (isSelected ? 'bg-blue-600 text-white font-bold' : 'text-blue-400 hover:bg-blue-500/20') :
                                      (isSelected ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-400 hover:bg-emerald-500/20');

                                    return (
                                      <button
                                        key={sc}
                                        type="button"
                                        onClick={() => handleSetStudentRating(student.id, elem.id, sc)}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all ${colorClass}`}
                                      >
                                        {sc}
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>
                            );
                          })}
                          <td className="p-3">
                            <textarea
                              rows={2}
                              value={grade.catatanProses || ''}
                              onChange={e => handleSetStudentProcessNote(student.id, e.target.value)}
                              placeholder="Catatan perkembangan aksi nyata siswa..."
                              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500 resize-none"
                            />
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
                <Info className="w-4 h-4 text-violet-400 shrink-0" />
                <span>Format penilaian P5 terintegrasi Rapor Kurikulum Merdeka Jenjang SD.</span>
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
                  <span>Cetak Lembar Rapor P5</span>
                </button>
                <button
                  onClick={handleSaveProject}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Nilai Projek P5</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: DAFTAR PROJEK */}
      {activeSubTab === 'projects' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FolderCheck className="w-5 h-5 text-violet-400" />
              <span>Daftar Seluruh Projek P5 Tersimpan ({cocurricularProjects.length})</span>
            </h2>
            <button
              onClick={() => {
                initNewProject();
                setActiveSubTab('input');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Buat Projek</span>
            </button>
          </div>

          {cocurricularProjects.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-800/40 rounded-2xl border border-dashed border-slate-700">
              Belum ada projek P5 tersimpan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cocurricularProjects.map(proj => (
                <div key={proj.id} className="p-5 bg-slate-800/70 border border-slate-700/80 rounded-2xl space-y-3 relative group">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-violet-500/20 text-violet-300 font-bold text-xs">
                      Kelas {proj.kelas}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{proj.tema}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{proj.judulProjek}</h3>
                    <p className="text-xs text-slate-400 mt-1">Koordinator: {proj.koordinator || '-'}</p>
                    <p className="text-xs text-slate-500">{proj.targetElements.length} Target Dimensi • {proj.studentGrades.length} Siswa</p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                    <button
                      onClick={() => {
                        setSelectedClass(proj.kelas);
                        loadProject(proj);
                        setActiveSubTab('input');
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 text-xs font-bold transition-colors"
                    >
                      Buka & Nilai
                    </button>
                    <button
                      onClick={() => {
                        exportCocurricularProjectToExcel(proj, students.filter(s => s.kelas === proj.kelas), school);
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
                          title: 'Hapus Projek P5',
                          itemName: `${proj.judulProjek} - Kelas ${proj.kelas}`,
                          description: 'Apakah Anda yakin ingin menghapus data projek dan seluruh penilaian siswa di dalamnya?',
                          confirmButtonText: 'Ya, Hapus Projek',
                          onConfirm: () => {
                            onDeleteCocurricularProject(proj.id);
                            onAddToast('Projek Dihapus', 'Projek P5 berhasil dihapus.', 'info');
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

      {/* SUB-TAB: REKAP RAPOR P5 */}
      {activeSubTab === 'rekap' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">
                Rekapitulasi Penilaian Projek P5 — Kelas {selectedClass}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {judulProjek} ({tema})
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {classList.map(cls => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedClass === cls
                      ? 'bg-violet-600 text-white'
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
                  {targetElements.map((elem, idx) => (
                    <th key={elem.id} className="p-3 text-center min-w-[120px]">
                      Dimensi {idx + 1} ({elem.subElemen})
                    </th>
                  ))}
                  <th className="p-3 min-w-[200px]">Catatan Proses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {classStudents.map((s, idx) => {
                  const g = studentGradesMap[s.id];
                  return (
                    <tr key={`${s.id}-${idx}`} className="hover:bg-slate-800/30">
                      <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-mono text-slate-400">{s.nisn}</td>
                      <td className="p-3 font-semibold text-white">{s.namaLengkap}</td>
                      {targetElements.map(elem => {
                        const sc = g?.ratings[elem.id] || '-';
                        return (
                          <td key={elem.id} className="p-3 text-center font-bold">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              sc === 'SAB' ? 'bg-emerald-500/20 text-emerald-300' :
                              sc === 'BSH' ? 'bg-blue-500/20 text-blue-300' :
                              sc === 'SB' ? 'bg-amber-500/20 text-amber-300' :
                              sc === 'MB' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-500'
                            }`}>
                              {sc}
                            </span>
                          </td>
                        );
                      })}
                      <td className="p-3 text-slate-300 text-[11px]">{g?.catatanProses || '-'}</td>
                    </tr>
                  );
                })}
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
                <span className="font-bold text-slate-800 text-sm block">Pratinjau Cetak Lembar Rapor P5</span>
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
                      title: `Asesmen_P5_${selectedClass}_${tema.replace(/\s+/g, '_')}`
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

            <div className="pt-4">
              <OfficialSchoolKop school={school} />
            </div>

            <div className="text-center my-4 space-y-1">
              <h2 className="text-base font-bold uppercase underline">
                LEMBAR ASESMEN PROJEK PENGUATAN PROFIL PELAJAR PANCASILA (P5)
              </h2>
              <p className="text-xs font-bold text-neutral-800">
                Tema: {tema} | Judul: {judulProjek}
              </p>
              <p className="text-xs text-neutral-600">
                Kelas: {selectedClass} • {fase} • Tahun Ajaran {school.tahunAjaran} ({school.semester})
              </p>
            </div>

            {/* Target dimensions summary table */}
            <div className="my-3 p-3 bg-neutral-50 border border-neutral-300 rounded text-xs space-y-1">
              <div className="font-bold text-neutral-800">Deskripsi Projek & Target Elemen Dimensi:</div>
              <p className="text-neutral-700 italic">{deskripsiSingkat}</p>
              <ol className="list-decimal list-inside space-y-0.5 pt-1 text-[11px]">
                {targetElements.map(e => (
                  <li key={e.id}>
                    <span className="font-bold">{e.dimensi} ({e.subElemen}):</span> {e.targetCapaian}
                  </li>
                ))}
              </ol>
            </div>

            <table className="w-full border-collapse border border-neutral-950 text-[10px] mt-4">
              <thead className="bg-neutral-100 font-bold text-center">
                <tr>
                  <th className="border border-neutral-950 p-1.5 w-7">No</th>
                  <th className="border border-neutral-950 p-1.5 w-20">NISN</th>
                  <th className="border border-neutral-950 p-1.5 min-w-[140px] text-left">Nama Peserta Didik</th>
                  {targetElements.map((elem, idx) => (
                    <th key={elem.id} className="border border-neutral-950 p-1.5 w-14">
                      D{idx + 1}
                    </th>
                  ))}
                  <th className="border border-neutral-950 p-1.5 min-w-[180px] text-left">Catatan Proses & Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((student, idx) => {
                  const g = studentGradesMap[student.id];
                  return (
                    <tr key={`${student.id}-${idx}`}>
                      <td className="border border-neutral-950 p-1 text-center">{idx + 1}</td>
                      <td className="border border-neutral-950 p-1 text-center font-mono">{student.nisn}</td>
                      <td className="border border-neutral-950 p-1 font-bold">{student.namaLengkap}</td>
                      {targetElements.map(elem => (
                        <td key={elem.id} className="border border-neutral-950 p-1 text-center font-bold">
                          {g?.ratings[elem.id] || '-'}
                        </td>
                      ))}
                      <td className="border border-neutral-950 p-1">{g?.catatanProses || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Signature Block */}
            <div className="mt-8 flex justify-between items-start text-xs text-black pt-4 break-inside-avoid">
              <div className="w-72 text-center">
                <p>Mengetahui,</p>
                <p className="font-semibold">Kepala Sekolah</p>
                <div className="h-16" />
                <p className="font-bold underline">{school.kepalaSekolah}</p>
                <p className="text-[11px] font-mono">NIP. {school.nipKepalaSekolah}</p>
              </div>

              <div className="w-72 text-center">
                <p>{school.kabupatenKota}, {formatIndonesianFullDate(new Date().toISOString().slice(0, 10))}</p>
                <p className="font-semibold">Koordinator Projek P5</p>
                <div className="h-16" />
                <p className="font-bold underline">{koordinator || '....................................................'}</p>
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
