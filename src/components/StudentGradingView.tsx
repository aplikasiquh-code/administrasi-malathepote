import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Student, 
  Teacher, 
  SchoolProfile, 
  ClassGrade, 
  CurriculumItem,
  AssessmentType,
  StudentAssessment,
  StudentGradeItem,
  ExtracurricularAssessment,
  CocurricularProject,
  ClassRoomItem,
  STANDARD_SD_SUBJECTS,
  normalizeSubjectName
} from '../types';
import { 
  Award, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Search, 
  Save, 
  Sparkles, 
  Compass,
  Info, 
  Check, 
  RotateCcw, 
  Trash2, 
  BookOpen, 
  BarChart3, 
  GraduationCap, 
  SlidersHorizontal,
  Plus,
  Edit3,
  CheckCheck,
  FileCheck,
  TrendingUp,
  HelpCircle,
  Clock,
  ChevronRight,
  UserCheck,
  ArrowUpDown,
  History,
  FileText
} from 'lucide-react';
import { exportSingleAssessmentToExcel, exportClassGradeLedgerExcel } from '../utils/excelAssessmentUtils';
import { printDocumentWithA4 } from '../utils/exportUtils';
import { OfficialSchoolKop } from './OfficialSchoolKop';
import { formatIndonesianFullDate } from '../utils/indonesianCalendarUtils';
import { ConfirmDeleteModal, ConfirmDeleteState } from './ConfirmDeleteModal';
import { ExtracurricularGradingView } from './ExtracurricularGradingView';
import { CocurricularGradingView } from './CocurricularGradingView';

interface StudentGradingViewProps {
  students: Student[];
  teachers: Teacher[];
  school: SchoolProfile;
  curriculum: CurriculumItem[];
  assessments: StudentAssessment[];
  classes?: ClassRoomItem[];
  onOpenClassModal?: () => void;
  onSaveAssessment: (assessment: StudentAssessment) => void;
  onDeleteAssessment: (assessmentId: string) => void;
  extracurriculars?: ExtracurricularAssessment[];
  onSaveExtracurricular?: (item: ExtracurricularAssessment) => void;
  onDeleteExtracurricular?: (id: string) => void;
  cocurricularProjects?: CocurricularProject[];
  onSaveCocurricularProject?: (project: CocurricularProject) => void;
  onDeleteCocurricularProject?: (id: string) => void;
  onAddToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  initialSubTab?: 'input' | 'ekskul' | 'kokurikuler' | 'leger' | 'history';
}

const DEFAULT_CLASS_LIST: ClassGrade[] = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];

const ASSESSMENT_TYPES: { id: AssessmentType; label: string; fullLabel: string; category: 'sh' | 'pts' | 'sas' }[] = [
  { id: 'SH 1', label: 'SH 1', fullLabel: 'Sumatif Harian 1 (Lingkup Materi 1)', category: 'sh' },
  { id: 'SH 2', label: 'SH 2', fullLabel: 'Sumatif Harian 2 (Lingkup Materi 2)', category: 'sh' },
  { id: 'SH 3', label: 'SH 3', fullLabel: 'Sumatif Harian 3 (Lingkup Materi 3)', category: 'sh' },
  { id: 'SH 4', label: 'SH 4', fullLabel: 'Sumatif Harian 4 (Lingkup Materi 4)', category: 'sh' },
  { id: 'SH 5', label: 'SH 5', fullLabel: 'Sumatif Harian 5 (Lingkup Materi 5)', category: 'sh' },
  { id: 'SH 6', label: 'SH 6', fullLabel: 'Sumatif Harian 6 (Lingkup Materi 6)', category: 'sh' },
  { id: 'PTS', label: 'PTS', fullLabel: 'Penilaian / Sumatif Tengah Semester', category: 'pts' },
  { id: 'SAS', label: 'SAS', fullLabel: 'Sumatif Akhir Semester (PAS)', category: 'sas' }
];

export const StudentGradingView: React.FC<StudentGradingViewProps> = ({
  students,
  teachers,
  school,
  curriculum,
  assessments,
  classes = [],
  onOpenClassModal,
  onSaveAssessment,
  onDeleteAssessment,
  extracurriculars = [],
  onSaveExtracurricular = () => {},
  onDeleteExtracurricular = () => {},
  cocurricularProjects = [],
  onSaveCocurricularProject = () => {},
  onDeleteCocurricularProject = () => {},
  onAddToast,
  initialSubTab = 'input'
}) => {
  const dynamicClassList: ClassGrade[] = useMemo(() => {
    if (classes && classes.length > 0) {
      return classes.map(c => c.nama as ClassGrade).sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
    }
    const studentClasses = Array.from(new Set(students.map(s => s.kelas as ClassGrade)));
    return studentClasses.length > 0 ? (studentClasses as string[]).sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })) as ClassGrade[] : DEFAULT_CLASS_LIST;
  }, [classes, students]);

  const dynamicSubjectList = useMemo(() => {
    const set = new Set<string>(STANDARD_SD_SUBJECTS);
    if (curriculum) {
      curriculum.forEach(c => {
        if (c.mataPelajaran) {
          const mapel = normalizeSubjectName(c.mataPelajaran) || c.mataPelajaran.trim();
          set.add(mapel);
        }
      });
    }
    if (assessments) {
      assessments.forEach(a => {
        if (a.mataPelajaran) {
          const mapel = normalizeSubjectName(a.mataPelajaran) || a.mataPelajaran.trim();
          set.add(mapel);
        }
      });
    }
    return Array.from(set);
  }, [curriculum, assessments]);

  // Main view mode: 'input' | 'ekskul' | 'kokurikuler' | 'leger' | 'history'
  const [activeTab, setActiveTab] = useState<'input' | 'ekskul' | 'kokurikuler' | 'leger' | 'history'>(initialSubTab);

  // Input Form States
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedClass, setSelectedClass] = useState<ClassGrade>(dynamicClassList[0] || '1A');

  // Sync selectedClass if dynamicClassList changes
  useEffect(() => {
    if (dynamicClassList.length > 0 && !dynamicClassList.includes(selectedClass)) {
      setSelectedClass(dynamicClassList[0]);
    }
  }, [dynamicClassList]);
  const [selectedSubject, setSelectedSubject] = useState<string>('Matematika');
  const [customSubjectInput, setCustomSubjectInput] = useState<string>('');
  const [isCustomSubject, setIsCustomSubject] = useState<boolean>(false);
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<AssessmentType>('SH 1');
  const [materiTp, setMateriTp] = useState<string>('');
  const [kkmScore, setKkmScore] = useState<number>(75);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');

  // Local live score mapping for the current class & assessment session: { [studentId]: { nilai: number | null, catatan: string } }
  const [currentGrades, setCurrentGrades] = useState<{ [studentId: string]: { nilai: number | null; catatan: string } }>({});
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // History Filters
  const [historyFilterClass, setHistoryFilterClass] = useState<string>('Semua');
  const [historyFilterSubject, setHistoryFilterSubject] = useState<string>('Semua');
  const [historyViewMode, setHistoryViewMode] = useState<'grid' | 'table'>('table');

  // Confirmation Delete Modal
  const [deleteConfirmState, setDeleteConfirmState] = useState<ConfirmDeleteState>({
    isOpen: false,
    title: '',
    itemName: '',
    description: '',
    onConfirm: () => {},
  });

  const openDeleteConfirm = (config: Omit<ConfirmDeleteState, 'isOpen'>) => {
    setDeleteConfirmState({ ...config, isOpen: true });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  // Ref array for input elements to enable smooth ArrowDown / Enter keyboard navigation
  const inputRefs = useRef<{ [studentId: string]: HTMLInputElement | null }>({});

  // Active subject string
  const activeSubjectName = isCustomSubject && customSubjectInput.trim() 
    ? customSubjectInput.trim() 
    : selectedSubject;

  // Filter students belonging to the selected class
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

  // Suggested TPs from curriculum bank for selected class & mapel
  const suggestedTps = useMemo(() => {
    const classNum = selectedClass.charAt(0);
    const normalizedActiveSubject = normalizeSubjectName(activeSubjectName).toLowerCase();
    const isSeni = normalizedActiveSubject === 'seni budaya';
    const seniBranches = ['seni rupa', 'seni musik', 'seni tari', 'seni teater', 'seni budaya'];
    return curriculum.filter(c => {
      const cNorm = normalizeSubjectName(c.mataPelajaran).toLowerCase();
      const matchMapel = cNorm === normalizedActiveSubject || (isSeni && seniBranches.includes(cNorm));
      const matchKelas = !c.kelasTarget || c.kelasTarget.includes(classNum) || c.kelasTarget === 'Semua Kelas' || (c.faseKelas && c.faseKelas.includes(`Kelas ${classNum}`));
      return matchMapel && matchKelas;
    });
  }, [curriculum, activeSubjectName, selectedClass]);

  // Find existing assessment record matching class, mapel, and assessment type
  const existingAssessment = useMemo(() => {
    const normalizedActiveSubject = normalizeSubjectName(activeSubjectName).toLowerCase();
    return assessments.find(
      a => a.kelas === selectedClass && 
           normalizeSubjectName(a.mataPelajaran).toLowerCase() === normalizedActiveSubject && 
           a.jenisPenilaian === selectedAssessmentType
    );
  }, [assessments, selectedClass, activeSubjectName, selectedAssessmentType]);

  // Suggest teacher based on class assignment
  useEffect(() => {
    if (!selectedTeacher) {
      const matchedTeacher = teachers.find(t => 
        t.penugasanKelas === `Kelas ${selectedClass}` || 
        t.penugasanKelas === selectedClass ||
        t.jabatan === `Guru Kelas ${selectedClass.charAt(0)}` as any
      );
      if (matchedTeacher) {
        setSelectedTeacher(matchedTeacher.namaLengkap);
      } else if (teachers.length > 0) {
        setSelectedTeacher(teachers[0].namaLengkap);
      }
    }
  }, [selectedClass, teachers]);

  // Synchronize local grades when switching class, subject, or assessment type
  useEffect(() => {
    if (existingAssessment) {
      const newGrades: { [studentId: string]: { nilai: number | null; catatan: string } } = {};
      classStudents.forEach(st => {
        const item = existingAssessment.grades?.find(g => g.studentId === st.id);
        newGrades[st.id] = {
          nilai: item?.nilai !== undefined && item?.nilai !== null ? item.nilai : null,
          catatan: item?.catatan || ''
        };
      });
      setCurrentGrades(newGrades);
      if (existingAssessment.tanggal) setSelectedDate(existingAssessment.tanggal);
      if (existingAssessment.materiTp) setMateriTp(existingAssessment.materiTp);
      if (existingAssessment.kkm) setKkmScore(existingAssessment.kkm);
      if (existingAssessment.guruPengampu) setSelectedTeacher(existingAssessment.guruPengampu);
    } else {
      // New / empty grading session for this class
      const emptyGrades: { [studentId: string]: { nilai: number | null; catatan: string } } = {};
      classStudents.forEach(st => {
        emptyGrades[st.id] = {
          nilai: null,
          catatan: ''
        };
      });
      setCurrentGrades(emptyGrades);
      setMateriTp('');
    }
    setIsSavedRecently(false);
  }, [selectedClass, activeSubjectName, selectedAssessmentType, existingAssessment?.id, classStudents]);

  // Handle score change for single student
  const handleScoreChange = (studentId: string, valStr: string) => {
    let scoreNum: number | null = null;
    if (valStr.trim() !== '') {
      const parsed = parseInt(valStr, 10);
      if (!isNaN(parsed)) {
        scoreNum = Math.max(0, Math.min(100, parsed));
      }
    }

    setCurrentGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        nilai: scoreNum
      }
    }));
    setIsSavedRecently(false);
  };

  // Handle note change for single student
  const handleNoteChange = (studentId: string, note: string) => {
    setCurrentGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        catatan: note
      }
    }));
    setIsSavedRecently(false);
  };

  // Save current assessment
  const handleSave = () => {
    if (classStudents.length === 0) {
      onAddToast('Tidak Ada Siswa', `Tidak ada siswa terdaftar di ${selectedClass}.`, 'error');
      return;
    }

    const gradeItems: StudentGradeItem[] = classStudents.map(st => ({
      studentId: st.id,
      nilai: currentGrades[st.id]?.nilai !== undefined ? currentGrades[st.id].nilai : null,
      catatan: currentGrades[st.id]?.catatan || ''
    }));

    const assessmentToSave: StudentAssessment = {
      id: existingAssessment?.id || `assess-${Date.now()}`,
      tanggal: selectedDate,
      kelas: selectedClass,
      mataPelajaran: activeSubjectName,
      jenisPenilaian: selectedAssessmentType,
      materiTp: materiTp.trim() || undefined,
      kkm: kkmScore || 75,
      guruPengampu: selectedTeacher || school.kepalaSekolah,
      grades: gradeItems,
      createdAt: existingAssessment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveAssessment(assessmentToSave);
    setIsSavedRecently(true);
    onAddToast(
      'Nilai Berhasil Disimpan',
      `Data nilai ${selectedAssessmentType} ${activeSubjectName} untuk Kelas ${selectedClass} berhasil disimpan.`,
      'success'
    );
  };

  // Bulk set score for all students
  const handleBulkSetScore = (score: number) => {
    setCurrentGrades(prev => {
      const updated = { ...prev };
      classStudents.forEach(st => {
        updated[st.id] = {
          ...updated[st.id],
          nilai: score
        };
      });
      return updated;
    });
    setIsSavedRecently(false);
    onAddToast('Nilai Massal Diterapkan', `Semua siswa diisi nilai ${score}.`, 'info');
  };

  // Clear all scores
  const handleClearAllScores = () => {
    openDeleteConfirm({
      title: 'Kosongkan Semua Nilai',
      itemName: `${selectedAssessmentType} - ${activeSubjectName} (Kelas ${selectedClass})`,
      description: 'Apakah Anda yakin ingin mengosongkan seluruh kolom nilai untuk sesi ini?',
      confirmButtonText: 'Ya, Kosongkan',
      onConfirm: () => {
        setCurrentGrades(prev => {
          const updated = { ...prev };
          classStudents.forEach(st => {
            updated[st.id] = {
              ...updated[st.id],
              nilai: null
            };
          });
          return updated;
        });
        setIsSavedRecently(false);
        onAddToast('Nilai Dikosongkan', 'Semua kolom nilai telah dikosongkan.', 'info');
      }
    });
  };

  // Delete an existing assessment
  const handleDeleteAssessment = (assess: StudentAssessment) => {
    openDeleteConfirm({
      title: 'Hapus Data Asesmen Penilaian',
      itemName: `${assess.jenisPenilaian} - ${assess.mataPelajaran} (Kelas ${assess.kelas}, Tanggal: ${assess.tanggal})`,
      description: 'Apakah Anda yakin ingin menghapus seluruh rekaman nilai pada asesmen ini secara permanen?',
      confirmButtonText: 'Ya, Hapus Asesmen',
      onConfirm: () => {
        onDeleteAssessment(assess.id);
        onAddToast('Asesmen Dihapus', `Data nilai ${assess.jenisPenilaian} telah dihapus.`, 'info');
      }
    });
  };

  // Keyboard navigation between student inputs
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextStudent = classStudents[currentIndex + 1];
      if (nextStudent && inputRefs.current[nextStudent.id]) {
        inputRefs.current[nextStudent.id]?.focus();
        inputRefs.current[nextStudent.id]?.select();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevStudent = classStudents[currentIndex - 1];
      if (prevStudent && inputRefs.current[prevStudent.id]) {
        inputRefs.current[prevStudent.id]?.focus();
        inputRefs.current[prevStudent.id]?.select();
      }
    }
  };

  // Score statistics for current session
  const stats = useMemo(() => {
    const scores: number[] = [];
    let gradedCount = 0;
    let tuntasCount = 0;
    let remedialCount = 0;

    classStudents.forEach(st => {
      const val = currentGrades[st.id]?.nilai;
      if (val !== undefined && val !== null) {
        scores.push(val);
        gradedCount++;
        if (val >= kkmScore) tuntasCount++;
        else remedialCount++;
      }
    });

    const avg = scores.length > 0 
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 
      : 0;
    const max = scores.length > 0 ? Math.max(...scores) : 0;
    const min = scores.length > 0 ? Math.min(...scores) : 0;
    const completionPercent = classStudents.length > 0 
      ? Math.round((gradedCount / classStudents.length) * 100) 
      : 0;
    const tuntasPercent = gradedCount > 0 
      ? Math.round((tuntasCount / gradedCount) * 100) 
      : 0;

    return {
      gradedCount,
      totalCount: classStudents.length,
      avg,
      max,
      min,
      tuntasCount,
      remedialCount,
      completionPercent,
      tuntasPercent
    };
  }, [classStudents, currentGrades, kkmScore]);

  // Filtered student list by search term
  const displayedStudents = useMemo(() => {
    if (!searchQuery.trim()) return classStudents;
    const q = searchQuery.toLowerCase();
    return classStudents.filter(s => 
      s.namaLengkap.toLowerCase().includes(q) ||
      s.nisn.includes(q) ||
      s.nis.includes(q)
    );
  }, [classStudents, searchQuery]);

  // Helper for grade level badge
  const getGradeBadge = (score: number | null) => {
    if (score === null || score === undefined) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
          Belum Dinilai
        </span>
      );
    }
    if (score >= 90) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          A • Sangat Baik
        </span>
      );
    }
    if (score >= 80) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
          B • Baik
        </span>
      );
    }
    if (score >= kkmScore) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
          C • Cukup (Tuntas)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
        D • Perlu Remedial
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Penilaian & Buku Nilai Siswa
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Kurikulum Merdeka & K13
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Pusat input dan rekap nilai: Nilai Mapel (SH 1-6, PTS, SAS), Ekstrakurikuler, Kokurikuler (Projek P5), serta Rekap Leger Kelas.
            </p>
          </div>
        </div>

        {/* View switcher & action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('input')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'input'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Input Nilai Mapel
            </button>
            <button
              onClick={() => setActiveTab('ekskul')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'ekskul'
                  ? 'bg-amber-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-300" />
              Ekstrakurikuler
            </button>
            <button
              onClick={() => setActiveTab('kokurikuler')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'kokurikuler'
                  ? 'bg-violet-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-300" />
              Kokurikuler (P5)
            </button>
            <button
              onClick={() => setActiveTab('leger')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'leger'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Rekap Leger
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Riwayat Asesmen ({assessments.length})
            </button>
          </div>

          {(activeTab === 'input' || activeTab === 'leger') && (
            <>
              <button
                onClick={() => {
                  if (activeTab === 'leger') {
                    exportClassGradeLedgerExcel(
                      selectedClass,
                      activeSubjectName,
                      classStudents,
                      assessments,
                      school,
                      kkmScore
                    );
                  } else {
                    const currentAssessmentObj: StudentAssessment = {
                      id: existingAssessment?.id || 'temp',
                      tanggal: selectedDate,
                      kelas: selectedClass,
                      mataPelajaran: activeSubjectName,
                      jenisPenilaian: selectedAssessmentType,
                      materiTp: materiTp,
                      kkm: kkmScore,
                      guruPengampu: selectedTeacher,
                      grades: classStudents.map(st => ({
                        studentId: st.id,
                        nilai: currentGrades[st.id]?.nilai !== undefined ? currentGrades[st.id].nilai : null,
                        catatan: currentGrades[st.id]?.catatan || ''
                      }))
                    };
                    exportSingleAssessmentToExcel(currentAssessmentObj, classStudents, school);
                  }
                  onAddToast('Ekspor Excel Berhasil', 'File format nilai telah diunduh.', 'success');
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold transition-all shrink-0 cursor-pointer"
                title="Unduh / Simpan ke Excel (.xlsx)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simpan Excel</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INPUT NILAI LANGSUNG                                              */}
      {/* ========================================================================= */}
      {activeTab === 'input' && (
        <div className="space-y-6">
          {/* Main Control / Filter Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5 print:hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Tanggal */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Tanggal Penilaian
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-normal hover:underline"
                  >
                    Hari Ini
                  </button>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1 truncate">
                  {formatIndonesianFullDate(selectedDate)}
                </p>
              </div>

              {/* 2. Mata Pelajaran Langsung Diberi Opsi */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                    Mata Pelajaran (Opsi Langsung)
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCustomSubject(!isCustomSubject)}
                    className="text-[10px] text-sky-400 hover:text-sky-300 font-normal hover:underline"
                  >
                    {isCustomSubject ? 'Pilih dari Daftar' : '+ Mapel Kustom'}
                  </button>
                </label>

                {isCustomSubject ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSubjectInput}
                      onChange={(e) => setCustomSubjectInput(e.target.value)}
                      placeholder="Ketik nama mata pelajaran kustom..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomSubject(false)}
                      className="px-3 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
                  >
                    {dynamicSubjectList.map((mapel) => (
                      <option key={mapel} value={mapel}>
                        {mapel}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  Kurikulum Merdeka Fase {selectedClass.startsWith('1') || selectedClass.startsWith('2') ? 'A' : selectedClass.startsWith('3') || selectedClass.startsWith('4') ? 'B' : 'C'}
                </p>
              </div>

              {/* 3. Guru Pengampu / KKTP */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    KKTP / KKM & Guru
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    KKTP: {kkmScore}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={kkmScore}
                      onChange={(e) => setKkmScore(parseInt(e.target.value) || 75)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-center text-amber-300 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                      title="Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)"
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      value={selectedTeacher}
                      onChange={(e) => setSelectedTeacher(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 outline-none truncate"
                    >
                      <option value="">-- Pilih Guru --</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.namaLengkap}>
                          {t.namaLengkap}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* DIRECT CLASS SELECTOR (KELAS LANGSUNG DIBERI OPSI) */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-violet-400" />
                    Pilih Rombongan Belajar / Kelas:
                  </span>
                  {onOpenClassModal && (
                    <button
                      type="button"
                      onClick={onOpenClassModal}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-violet-300 hover:text-violet-200 text-[11px] font-semibold border border-slate-700 transition-colors"
                    >
                      + Kelola Rombel
                    </button>
                  )}
                </div>
                <span className="text-xs text-violet-400 font-medium">
                  {classStudents.length} Siswa Terdaftar di {selectedClass}
                </span>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                {dynamicClassList.map((cls) => {
                  const isSelected = selectedClass === cls;
                  const countInClass = students.filter(s => s.kelas === cls && s.statusSiswa === 'Aktif').length;
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setSelectedClass(cls)}
                      className={`py-2 px-1 rounded-xl text-center font-bold text-xs transition-all relative ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400 scale-[1.02]'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      <div>{cls}</div>
                      <div className={`text-[10px] font-normal ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {countInClass} ssw
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DIRECT ASSESSMENT TYPE SELECTOR (OPSI SH 1 - SH 6, PTS, SAS) */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-orange-400" />
                  Jenis Penilaian / Asesmen (SH 1 s/d SH 6, PTS, SAS):
                </span>
                <span className="text-xs text-orange-300 font-medium">
                  {ASSESSMENT_TYPES.find(a => a.id === selectedAssessmentType)?.fullLabel}
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {ASSESSMENT_TYPES.map((typeObj) => {
                  const isSelected = selectedAssessmentType === typeObj.id;
                  let colorClass = 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700';
                  if (isSelected) {
                    if (typeObj.category === 'sh') {
                      colorClass = 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-2 ring-amber-400';
                    } else if (typeObj.category === 'pts') {
                      colorClass = 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400';
                    } else {
                      colorClass = 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400';
                    }
                  }

                  return (
                    <button
                      key={typeObj.id}
                      type="button"
                      onClick={() => setSelectedAssessmentType(typeObj.id)}
                      className={`py-2.5 px-2 rounded-xl text-center font-bold text-xs transition-all border ${colorClass}`}
                    >
                      <div className="tracking-wide">{typeObj.label}</div>
                      <div className={`text-[9px] font-normal truncate mt-0.5 ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                        {typeObj.category === 'sh' ? 'Sumatif' : typeObj.category === 'pts' ? 'Tengah Sem' : 'Akhir Sem'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Materi / TP & Quick Suggestions */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Capaian / Lingkup Materi / Tujuan Pembelajaran (TP):
                </label>
                <input
                  type="text"
                  value={materiTp}
                  onChange={(e) => setMateriTp(e.target.value)}
                  placeholder="Contoh: Mengenal nilai tempat ratusan dan operasi hitung penjumlahan..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Suggestions from curriculum bank */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Pilih dari Bank TP:</span>
                  <span className="text-[10px] text-slate-400">{suggestedTps.length} TP Tersedia</span>
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) setMateriTp(e.target.value);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 outline-none truncate"
                >
                  <option value="">-- Muat Cepat dari Bank TP --</option>
                  {suggestedTps.map((tp, idx) => (
                    <option key={`${tp.id}-${idx}`} value={`${tp.tujuanPembelajaran} (${tp.materi})`}>
                      {tp.subOpsiSeni ? `[${tp.subOpsiSeni}] ` : ''}{tp.tujuanPembelajaran} - {tp.materi}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Stats & Batch Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            {/* Live Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
                <div className="text-[10px] text-slate-400 font-medium">Terisi / Total</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  <span className="text-blue-400">{stats.gradedCount}</span> / {stats.totalCount} Siswa
                  <span className="text-[10px] text-slate-400 font-normal ml-1">({stats.completionPercent}%)</span>
                </div>
              </div>

              <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
                <div className="text-[10px] text-slate-400 font-medium">Rata-Rata Kelas</div>
                <div className="text-sm font-bold text-amber-300 mt-0.5">
                  {stats.avg > 0 ? stats.avg : '-'}
                  <span className="text-[10px] text-slate-400 font-normal ml-1">
                    (Max: {stats.max}, Min: {stats.min})
                  </span>
                </div>
              </div>

              <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
                <div className="text-[10px] text-slate-400 font-medium">Tuntas (≥ {kkmScore})</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  {stats.tuntasCount} Siswa
                  <span className="text-[10px] text-slate-400 font-normal ml-1">({stats.tuntasPercent}%)</span>
                </div>
              </div>

              <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
                <div className="text-[10px] text-slate-400 font-medium">Remedial (&lt; {kkmScore})</div>
                <div className="text-sm font-bold text-rose-400 mt-0.5">
                  {stats.remedialCount} Siswa
                </div>
              </div>
            </div>

            {/* Fast actions */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                <span className="text-[10px] text-slate-400 px-1.5 hidden lg:inline">Isi Massal:</span>
                <button
                  type="button"
                  onClick={() => handleBulkSetScore(80)}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold"
                  title="Isi semua nilai dengan 80"
                >
                  80
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkSetScore(85)}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold"
                  title="Isi semua nilai dengan 85"
                >
                  85
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkSetScore(90)}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold"
                  title="Isi semua nilai dengan 90"
                >
                  90
                </button>
                <button
                  type="button"
                  onClick={handleClearAllScores}
                  className="px-2 py-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg text-xs font-medium"
                  title="Kosongkan semua nilai"
                >
                  Kosongkan
                </button>
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
              >
                <Save className="w-4 h-4" />
                Simpan Nilai Asesmen
              </button>
            </div>
          </div>

          {/* TABLE OF STUDENTS & DIRECT GRADING COLUMNS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm a4-portrait-sheet print:border-none print:shadow-none print:bg-white">
            {/* Table Header Controls */}
            <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 print:hidden">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-white text-sm">
                  Daftar Siswa ({displayedStudents.length} Siswa)
                </span>
                
                {/* Inline Quick Selectors for Kelas, Mapel, and Asesmen */}
                <div className="flex items-center gap-1.5 flex-wrap bg-slate-900/90 p-1 rounded-xl border border-slate-700/80">
                  <div className="flex items-center gap-1 px-2 py-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Kelas:</span>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value as ClassGrade)}
                      className="bg-slate-800 text-blue-300 font-bold border border-slate-700 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
                      title="Pilih Kelas Langsung"
                    >
                      {dynamicClassList.map(cls => (
                        <option key={cls} value={cls}>Kelas {cls}</option>
                      ))}
                    </select>
                  </div>

                  <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>

                  <div className="flex items-center gap-1 px-2 py-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Mapel:</span>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="bg-slate-800 text-emerald-300 font-semibold border border-slate-700 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-500 outline-none cursor-pointer max-w-[170px] truncate"
                      title="Pilih Mata Pelajaran Langsung"
                    >
                      {dynamicSubjectList.map(mapel => (
                        <option key={mapel} value={mapel}>{mapel}</option>
                      ))}
                    </select>
                  </div>

                  <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>

                  <div className="flex items-center gap-1 px-2 py-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Asesmen:</span>
                    <select
                      value={selectedAssessmentType}
                      onChange={(e) => setSelectedAssessmentType(e.target.value)}
                      className="bg-slate-800 text-amber-300 font-bold border border-slate-700 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500 outline-none cursor-pointer"
                      title="Pilih Jenis Penilaian"
                    >
                      {['SH 1 (TP 1)', 'SH 2 (TP 2)', 'SH 3 (TP 3)', 'SH 4 (TP 4)', 'SH 5 (TP 5)', 'SH 6 (TP 6)', 'PTS', 'SAS'].map(tp => (
                        <option key={tp} value={tp}>{tp}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama / NISN siswa..."
                    className="bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:ring-2 focus:ring-blue-500 outline-none w-48 sm:w-60"
                  />
                </div>
              </div>
            </div>

            {/* PRINT HEADER ONLY VISIBLE DURING PRINT */}
            <div className="hidden print:block p-6 text-black bg-white">
              <OfficialSchoolKop school={school} />
              <div className="text-center my-4">
                <h3 className="text-base font-bold uppercase tracking-wider">
                  DAFTAR NILAI ASESMEN {selectedAssessmentType}
                </h3>
                <p className="text-xs text-gray-700">
                  Mata Pelajaran: <strong>{activeSubjectName}</strong> | Kelas: <strong>{selectedClass}</strong> | Tanggal: {formatIndonesianFullDate(selectedDate)}
                </p>
                {materiTp && (
                  <p className="text-xs italic text-gray-600 mt-1">
                    Lingkup Materi / TP: {materiTp}
                  </p>
                )}
              </div>
            </div>

            {/* Students Table */}
            {displayedStudents.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-white">Tidak Ada Data Siswa</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Belum ada siswa aktif yang terdaftar di rombel {selectedClass} atau tidak sesuai filter pencarian.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-800/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400 print:text-black print:bg-gray-100 print:border-black">
                      <th className="py-3 px-3 w-12 text-center">No</th>
                      <th className="py-3 px-3 w-28">NISN / NIS</th>
                      <th className="py-3 px-4 min-w-[180px]">Nama Lengkap Siswa</th>
                      <th className="py-3 px-3 min-w-[120px]">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-300">Kelas</span>
                          <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value as ClassGrade)}
                            className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-blue-300 font-bold rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer print:hidden"
                            title="Ganti kelas langsung dari kolom"
                          >
                            {dynamicClassList.map(cls => (
                              <option key={cls} value={cls}>Kelas {cls}</option>
                            ))}
                          </select>
                        </div>
                      </th>
                      <th className="py-3 px-2 w-12 text-center">L/P</th>
                      <th className="py-3 px-3 min-w-[160px] text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold text-slate-300">Nilai (0 - 100)</span>
                          <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-emerald-300 font-medium rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer max-w-[150px] truncate print:hidden"
                            title="Ganti mata pelajaran langsung dari kolom"
                          >
                            {dynamicSubjectList.map(mapel => (
                              <option key={mapel} value={mapel}>{mapel}</option>
                            ))}
                          </select>
                        </div>
                      </th>
                      <th className="py-3 px-3 w-36 text-center">Predikat / Status</th>
                      <th className="py-3 px-4 min-w-[200px]">Catatan / Evaluasi TP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-xs print:divide-gray-300 print:text-black">
                    {displayedStudents.map((student, index) => {
                      const score = currentGrades[student.id]?.nilai !== undefined ? currentGrades[student.id].nilai : null;
                      const note = currentGrades[student.id]?.catatan || '';

                      return (
                        <tr 
                          key={`${student.id}-${index}`}
                          className="hover:bg-slate-800/40 transition-colors group"
                        >
                          {/* No */}
                          <td className="py-3 px-3 text-center text-slate-400 font-mono print:text-black">
                            {index + 1}
                          </td>

                          {/* NISN / NIS */}
                          <td className="py-3 px-3">
                            <div className="font-mono text-slate-200 text-xs font-medium print:text-black">
                              {student.nisn || '-'}
                            </div>
                            <div className="text-[10px] text-slate-400 print:text-gray-600">
                              NIS: {student.nis || '-'}
                            </div>
                          </td>

                          {/* Nama Siswa */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300 shrink-0 print:hidden">
                                {student.namaLengkap.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-white group-hover:text-blue-300 transition-colors print:text-black">
                                  {student.namaLengkap}
                                </div>
                                <div className="text-[10px] text-slate-400 print:hidden">
                                  {student.namaPanggilan ? `(${student.namaPanggilan})` : ''}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Kelas Badge */}
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded font-bold text-xs">
                              {student.kelas}
                            </span>
                          </td>

                          {/* L/P */}
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              student.jenisKelamin === 'L' 
                                ? 'bg-blue-500/20 text-blue-300 print:text-black' 
                                : 'bg-pink-500/20 text-pink-300 print:text-black'
                            }`}>
                              {student.jenisKelamin}
                            </span>
                          </td>

                          {/* DIRECT SCORE INPUT COLUMN (0-100) */}
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <input
                                ref={(el) => (inputRefs.current[student.id] = el)}
                                type="number"
                                min={0}
                                max={100}
                                step={1}
                                value={score !== null && score !== undefined ? score : ''}
                                onChange={(e) => handleScoreChange(student.id, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                placeholder="0-100"
                                className={`w-20 px-2 py-1.5 text-center font-bold text-sm rounded-xl border outline-none transition-all ${
                                  score === null || score === undefined
                                    ? 'bg-slate-800 border-slate-700 text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
                                    : score >= kkmScore
                                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 focus:ring-2 focus:ring-emerald-500'
                                    : 'bg-rose-950/40 border-rose-500/50 text-rose-300 focus:ring-2 focus:ring-rose-500'
                                } print:border-black print:bg-white print:text-black`}
                              />
                            </div>
                          </td>

                          {/* Predikat & Status */}
                          <td className="py-3 px-3 text-center">
                            {getGradeBadge(score)}
                          </td>

                          {/* Catatan Guru / Evaluasi */}
                          <td className="py-2.5 px-4">
                            <input
                              type="text"
                              value={note}
                              onChange={(e) => handleNoteChange(student.id, e.target.value)}
                              placeholder="Catatan ketercapaian siswa..."
                              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none print:border-none print:bg-transparent print:text-black"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Footer Actions */}
            <div className="p-4 bg-slate-800/30 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>
                  Tip: Tekan tombol <strong>Enter</strong> atau <strong>Panah Bawah</strong> pada keyboard untuk langsung beralih ke input siswa berikutnya secara cepat.
                </span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan Nilai Asesmen
                </button>
              </div>
            </div>

            {/* PRINT SIGNATURE FOOTER */}
            <div className="hidden print:grid grid-cols-2 gap-8 mt-12 px-6 text-black text-xs text-center break-inside-avoid">
              <div className="text-center">
                <p>Mengetahui,</p>
                <p className="font-semibold">Kepala {school.namaSekolah}</p>
                <div className="h-16"></div>
                <p className="font-bold underline">{school.kepalaSekolah}</p>
                <p className="text-[11px] font-mono">NIP. {school.nipKepalaSekolah || '-'}</p>
              </div>

              <div className="text-center">
                <p>{school.kabupatenKota}, {formatIndonesianFullDate(selectedDate)}</p>
                <p className="font-semibold">Guru Pengampu / Wali Kelas</p>
                <div className="h-16"></div>
                <p className="font-bold underline">{selectedTeacher || 'Guru Kelas'}</p>
                <p className="text-[11px] font-mono">NIP. -</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EKSTRAKURIKULER                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'ekskul' && (
        <ExtracurricularGradingView
          students={students}
          teachers={teachers}
          school={school}
          extracurriculars={extracurriculars}
          classes={classes}
          onSaveExtracurricular={onSaveExtracurricular}
          onDeleteExtracurricular={onDeleteExtracurricular}
          onAddToast={onAddToast}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 3: KOKURIKULER (P5 - PROJEK PANCASILA)                               */}
      {/* ========================================================================= */}
      {activeTab === 'kokurikuler' && (
        <CocurricularGradingView
          students={students}
          teachers={teachers}
          school={school}
          cocurricularProjects={cocurricularProjects}
          classes={classes}
          onSaveCocurricularProject={onSaveCocurricularProject}
          onDeleteCocurricularProject={onDeleteCocurricularProject}
          onAddToast={onAddToast}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 4: REKAP BUKU LEGER NILAI KELAS (SH 1-6, PTS, SAS)                   */}
      {/* ========================================================================= */}
      {activeTab === 'leger' && (
        <div className="space-y-6">
          {/* Leger Filter Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 print:hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Kelas */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Pilih Rombel / Kelas:
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value as ClassGrade)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {dynamicClassList.map(cls => (
                    <option key={cls} value={cls}>Kelas {cls}</option>
                  ))}
                </select>
              </div>

              {/* Mata Pelajaran */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mata Pelajaran:
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {dynamicSubjectList.map(mapel => (
                    <option key={mapel} value={mapel}>{mapel}</option>
                  ))}
                </select>
              </div>

              {/* KKTP */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  KKTP / KKM Standar:
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={kkmScore}
                  onChange={(e) => setKkmScore(parseInt(e.target.value) || 75)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Leger Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm a4-landscape-sheet print:border-none print:shadow-none print:bg-white">
            <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between print:hidden">
              <div>
                <h3 className="font-bold text-white text-sm">
                  Leger Nilai Lengkap Kelas {selectedClass} — {activeSubjectName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rekapitulasi nilai Asesmen Formatif/Sumatif Harian (SH 1-6), PTS, SAS, dan Nilai Akhir (NA).
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    exportClassGradeLedgerExcel(
                      selectedClass,
                      activeSubjectName,
                      classStudents,
                      assessments,
                      school,
                      kkmScore
                    );
                    onAddToast('Ekspor Leger Berhasil', 'File excel rekap leger nilai telah diunduh.', 'success');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  title="Unduh / Simpan Buku Leger ke Excel (.xlsx)"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-100" />
                  <span>Simpan Leger Excel</span>
                </button>
              </div>
            </div>

            {/* PRINT HEADER FOR LEGER */}
            <div className="hidden print:block p-6 text-black bg-white">
              <OfficialSchoolKop school={school} />
              <div className="text-center my-4">
                <h3 className="text-base font-bold uppercase tracking-wider">
                  LEGER REKAPITULASI NILAI KELAS {selectedClass}
                </h3>
                <p className="text-xs text-gray-700">
                  Mata Pelajaran: <strong>{activeSubjectName}</strong> | Tahun Pelajaran: {school.tahunAjaran} ({school.semester})
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400 print:text-black print:bg-gray-100 print:border-black">
                    <th className="py-3 px-3 w-10 text-center">No</th>
                    <th className="py-3 px-3 w-28">NISN</th>
                    <th className="py-3 px-4 min-w-[180px]">Nama Siswa</th>
                    <th className="py-3 px-2 w-10 text-center">L/P</th>
                    <th className="py-3 px-2 text-center w-12">SH 1</th>
                    <th className="py-3 px-2 text-center w-12">SH 2</th>
                    <th className="py-3 px-2 text-center w-12">SH 3</th>
                    <th className="py-3 px-2 text-center w-12">SH 4</th>
                    <th className="py-3 px-2 text-center w-12">SH 5</th>
                    <th className="py-3 px-2 text-center w-12">SH 6</th>
                    <th className="py-3 px-2 text-center w-14 bg-amber-500/10 text-amber-300 font-bold">Rata SH</th>
                    <th className="py-3 px-2 text-center w-12 bg-indigo-500/10 text-indigo-300">PTS</th>
                    <th className="py-3 px-2 text-center w-12 bg-rose-500/10 text-rose-300">SAS</th>
                    <th className="py-3 px-3 text-center w-16 bg-blue-500/15 text-blue-300 font-bold">NA</th>
                    <th className="py-3 px-3 text-center w-14">Predikat</th>
                    <th className="py-3 px-3 text-center w-24">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-300 print:text-black">
                  {classStudents.map((student, idx) => {
                    const normalizedActiveSubject = normalizeSubjectName(activeSubjectName).toLowerCase();
                    const relevantAssessments = assessments.filter(
                      a => a.kelas === selectedClass && normalizeSubjectName(a.mataPelajaran).toLowerCase() === normalizedActiveSubject
                    );

                    const getScore = (type: AssessmentType) => {
                      const matched = relevantAssessments.find(a => a.jenisPenilaian === type);
                      if (!matched) return null;
                      const item = matched.grades?.find(g => g.studentId === student.id);
                      return item?.nilai !== undefined && item?.nilai !== null ? item.nilai : null;
                    };

                    const sh1 = getScore('SH 1');
                    const sh2 = getScore('SH 2');
                    const sh3 = getScore('SH 3');
                    const sh4 = getScore('SH 4');
                    const sh5 = getScore('SH 5');
                    const sh6 = getScore('SH 6');
                    const pts = getScore('PTS');
                    const sas = getScore('SAS');

                    const shList = [sh1, sh2, sh3, sh4, sh5, sh6].filter((s): s is number => s !== null);
                    const avgSh = shList.length > 0
                      ? Math.round((shList.reduce((a, b) => a + b, 0) / shList.length) * 10) / 10
                      : null;

                    let finalNa: number | null = null;
                    if (avgSh !== null && pts !== null && sas !== null) {
                      finalNa = Math.round(((avgSh * 2 + pts + sas) / 4) * 10) / 10;
                    } else if (avgSh !== null) {
                      const parts = [avgSh * 2];
                      let div = 2;
                      if (pts !== null) { parts.push(pts); div += 1; }
                      if (sas !== null) { parts.push(sas); div += 1; }
                      finalNa = Math.round((parts.reduce((a, b) => a + b, 0) / div) * 10) / 10;
                    }

                    return (
                      <tr key={`${student.id}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono print:text-black">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300 print:text-black">
                          {student.nisn}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-white print:text-black">
                          {student.namaLengkap}
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-400 print:text-black">
                          {student.jenisKelamin}
                        </td>

                        {/* SH 1 - 6 */}
                        <td className="py-2.5 px-2 text-center font-mono">{sh1 !== null ? sh1 : '-'}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{sh2 !== null ? sh2 : '-'}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{sh3 !== null ? sh3 : '-'}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{sh4 !== null ? sh4 : '-'}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{sh5 !== null ? sh5 : '-'}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{sh6 !== null ? sh6 : '-'}</td>

                        {/* Rata SH */}
                        <td className="py-2.5 px-2 text-center font-mono font-bold bg-amber-500/10 text-amber-300">
                          {avgSh !== null ? avgSh : '-'}
                        </td>

                        {/* PTS & SAS */}
                        <td className="py-2.5 px-2 text-center font-mono bg-indigo-500/10 text-indigo-300">
                          {pts !== null ? pts : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono bg-rose-500/10 text-rose-300">
                          {sas !== null ? sas : '-'}
                        </td>

                        {/* Nilai Akhir (NA) */}
                        <td className="py-2.5 px-3 text-center font-mono font-bold bg-blue-500/15 text-blue-300 text-sm">
                          {finalNa !== null ? finalNa : '-'}
                        </td>

                        {/* Predikat */}
                        <td className="py-2.5 px-3 text-center font-semibold">
                          {finalNa !== null 
                            ? (finalNa >= 90 ? 'A' : finalNa >= 80 ? 'B' : finalNa >= kkmScore ? 'C' : 'D')
                            : '-'}
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3 text-center">
                          {finalNa !== null ? (
                            finalNa >= kkmScore ? (
                              <span className="text-emerald-400 font-semibold text-[11px]">Tuntas</span>
                            ) : (
                              <span className="text-rose-400 font-semibold text-[11px]">Remedial</span>
                            )
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PRINT SIGNATURE FOOTER FOR LEGER NILAI */}
            <div className="hidden print:grid grid-cols-2 gap-8 mt-10 px-6 text-black text-xs text-center break-inside-avoid">
              <div className="text-center">
                <p>Mengetahui,</p>
                <p className="font-semibold">Kepala {school.namaSekolah}</p>
                <div className="h-16"></div>
                <p className="font-bold underline">{school.kepalaSekolah}</p>
                <p className="text-[11px] font-mono">NIP. {school.nipKepalaSekolah || '-'}</p>
              </div>

              <div className="text-center">
                <p>{school.kabupatenKota}, {formatIndonesianFullDate(new Date().toISOString().slice(0, 10))}</p>
                <p className="font-semibold">Guru Pengampu / Wali Kelas {selectedClass}</p>
                <div className="h-16"></div>
                <p className="font-bold underline">{selectedTeacher || 'Guru Pengampu / Wali Kelas'}</p>
                <p className="text-[11px] font-mono">NIP. -</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RIWAYAT ASESMEN TERSIMPAN                                          */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (() => {
        const filteredHistory = assessments.filter(assess => {
          const matchClass = historyFilterClass === 'Semua' || assess.kelas === historyFilterClass;
          const matchSubject = historyFilterSubject === 'Semua' || 
            normalizeSubjectName(assess.mataPelajaran).toLowerCase() === normalizeSubjectName(historyFilterSubject).toLowerCase();
          return matchClass && matchSubject;
        });

        return (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white text-base">
                    Riwayat Dokumen Asesmen Penilaian
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Daftar seluruh entri penilaian yang tersimpan di sistem administrasi.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setHistoryViewMode('table')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                        historyViewMode === 'table' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Tabel
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryViewMode('grid')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                        historyViewMode === 'grid' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Kartu
                    </button>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl border border-slate-700">
                    {filteredHistory.length} dari {assessments.length} Asesmen
                  </span>
                </div>
              </div>

              {filteredHistory.length === 0 ? (
                <div className="p-8 text-center bg-slate-800/30 rounded-xl border border-slate-800">
                  <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-300 font-medium">Belum ada penilaian yang sesuai dengan filter.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Ubah filter kelas atau mata pelajaran di atas.</p>
                </div>
              ) : historyViewMode === 'table' ? (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-3 w-10 text-center">No</th>
                        <th className="py-3 px-3 w-28">Tanggal</th>
                        <th className="py-3 px-3 min-w-[130px]">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-200">Kelas</span>
                            <select
                              value={historyFilterClass}
                              onChange={(e) => setHistoryFilterClass(e.target.value)}
                              className="px-2 py-1 bg-slate-900 border border-slate-700 text-blue-300 font-bold rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                              title="Pilih opsi kelas langsung dari kolom"
                            >
                              <option value="Semua">Semua Kelas</option>
                              {dynamicClassList.map(cls => (
                                <option key={cls} value={cls}>Kelas {cls}</option>
                              ))}
                            </select>
                          </div>
                        </th>
                        <th className="py-3 px-3 min-w-[180px]">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-200">Mata Pelajaran</span>
                            <select
                              value={historyFilterSubject}
                              onChange={(e) => setHistoryFilterSubject(e.target.value)}
                              className="px-2 py-1 bg-slate-900 border border-slate-700 text-emerald-300 font-semibold rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer max-w-[170px] truncate"
                              title="Pilih opsi mata pelajaran langsung dari kolom"
                            >
                              <option value="Semua">Semua Mapel</option>
                              {dynamicSubjectList.map(mapel => (
                                <option key={mapel} value={mapel}>{mapel}</option>
                              ))}
                            </select>
                          </div>
                        </th>
                        <th className="py-3 px-3 w-24">Jenis</th>
                        <th className="py-3 px-4 min-w-[200px]">Materi / TP</th>
                        <th className="py-3 px-3 text-center w-20">Terisi</th>
                        <th className="py-3 px-3 text-center w-20">Rata-Rata</th>
                        <th className="py-3 px-3 w-32">Guru Pengampu</th>
                        <th className="py-3 px-3 w-24 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                      {filteredHistory.map((assess, idx) => {
                        const gradedCount = assess.grades.filter(g => g.nilai !== null && g.nilai !== undefined).length;
                        const scores = assess.grades.map(g => g.nilai).filter((v): v is number => v !== null && v !== undefined);
                        const avg = scores.length > 0 
                          ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 
                          : 0;

                        return (
                          <tr key={assess.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                            <td className="py-3 px-3 text-slate-300 whitespace-nowrap">{assess.tanggal}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-bold border border-blue-500/20">
                                Kelas {assess.kelas}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-200">{assess.mataPelajaran}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                assess.jenisPenilaian.startsWith('SH')
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : assess.jenisPenilaian === 'PTS'
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}>
                                {assess.jenisPenilaian}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-300 italic truncate max-w-xs">{assess.materiTp || '-'}</td>
                            <td className="py-3 px-3 text-center text-slate-300 font-medium">{gradedCount} Siswa</td>
                            <td className="py-3 px-3 text-center font-bold text-amber-300">{avg > 0 ? avg : '-'}</td>
                            <td className="py-3 px-3 text-slate-300 truncate max-w-[130px]">{assess.guruPengampu || '-'}</td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const clsStudents = students.filter(s => s.kelas === assess.kelas);
                                    exportSingleAssessmentToExcel(assess, clsStudents, school);
                                    onAddToast('Ekspor Excel Berhasil', `Format nilai ${assess.jenisPenilaian} telah diunduh.`, 'success');
                                  }}
                                  className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors"
                                  title="Unduh format Excel (.xlsx)"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedClass(assess.kelas);
                                    setSelectedSubject(assess.mataPelajaran);
                                    setSelectedAssessmentType(assess.jenisPenilaian);
                                    if (assess.materiTp) setMateriTp(assess.materiTp);
                                    if (assess.kkm) setKkmScore(assess.kkm);
                                    if (assess.tanggal) setSelectedDate(assess.tanggal);
                                    if (assess.guruPengampu) setSelectedTeacher(assess.guruPengampu);
                                    setActiveTab('input');
                                    setTimeout(() => {
                                      printDocumentWithA4({
                                        orientation: 'portrait',
                                        title: `Daftar_Nilai_${assess.mataPelajaran.replace(/\s+/g, '_')}_Kelas_${assess.kelas}_${assess.jenisPenilaian.replace(/[\s()]+/g, '_')}`
                                      });
                                    }, 300);
                                  }}
                                  className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 transition-colors"
                                  title="Cetak via Kabel/Wireless atau Simpan ke PDF format A4"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedClass(assess.kelas);
                                    setSelectedSubject(assess.mataPelajaran);
                                    setSelectedAssessmentType(assess.jenisPenilaian);
                                    if (assess.materiTp) setMateriTp(assess.materiTp);
                                    if (assess.kkm) setKkmScore(assess.kkm);
                                    if (assess.tanggal) setSelectedDate(assess.tanggal);
                                    if (assess.guruPengampu) setSelectedTeacher(assess.guruPengampu);
                                    setActiveTab('input');
                                  }}
                                  className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 transition-colors"
                                  title="Buka / Edit Nilai"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAssessment(assess)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                                  title="Hapus Data Asesmen Ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredHistory.map((assess) => {
                    const gradedCount = assess.grades.filter(g => g.nilai !== null && g.nilai !== undefined).length;
                    const scores = assess.grades.map(g => g.nilai).filter((v): v is number => v !== null && v !== undefined);
                    const avg = scores.length > 0 
                      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 
                      : 0;

                    return (
                      <div 
                        key={assess.id}
                        className="bg-slate-800/60 border border-slate-700/70 hover:border-slate-600 rounded-xl p-4 transition-all hover:shadow-md flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                              assess.jenisPenilaian.startsWith('SH')
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : assess.jenisPenilaian === 'PTS'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {assess.jenisPenilaian}
                            </span>
                            <span className="text-xs font-bold text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/50">
                              Kelas {assess.kelas}
                            </span>
                          </div>

                          <h4 className="font-bold text-white text-sm truncate">
                            {assess.mataPelajaran}
                          </h4>

                          {assess.materiTp && (
                            <p className="text-xs text-slate-300 mt-1 line-clamp-2 italic">
                              "{assess.materiTp}"
                            </p>
                          )}

                          <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400">Tanggal:</span>
                              <div className="text-slate-200 font-medium">{assess.tanggal}</div>
                            </div>
                            <div>
                              <span className="text-slate-400">Rata-Rata:</span>
                              <div className="text-amber-300 font-bold">{avg > 0 ? avg : '-'}</div>
                            </div>
                            <div>
                              <span className="text-slate-400">Terisi:</span>
                              <div className="text-slate-200 font-medium">{gradedCount} Siswa</div>
                            </div>
                            <div>
                              <span className="text-slate-400">KKTP:</span>
                              <div className="text-slate-200 font-medium">{assess.kkm || 75}</div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClass(assess.kelas);
                              setSelectedSubject(assess.mataPelajaran);
                              setSelectedAssessmentType(assess.jenisPenilaian);
                              if (assess.materiTp) setMateriTp(assess.materiTp);
                              if (assess.kkm) setKkmScore(assess.kkm);
                              if (assess.tanggal) setSelectedDate(assess.tanggal);
                              if (assess.guruPengampu) setSelectedTeacher(assess.guruPengampu);
                              setActiveTab('input');
                            }}
                            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Buka / Edit Nilai
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const clsStudents = students.filter(s => s.kelas === assess.kelas);
                                exportSingleAssessmentToExcel(assess, clsStudents, school);
                                onAddToast('Ekspor Excel Berhasil', `Format nilai ${assess.jenisPenilaian} telah diunduh.`, 'success');
                              }}
                              className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors"
                              title="Unduh format Excel (.xlsx)"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedClass(assess.kelas);
                                setSelectedSubject(assess.mataPelajaran);
                                setSelectedAssessmentType(assess.jenisPenilaian);
                                if (assess.materiTp) setMateriTp(assess.materiTp);
                                if (assess.kkm) setKkmScore(assess.kkm);
                                if (assess.tanggal) setSelectedDate(assess.tanggal);
                                if (assess.guruPengampu) setSelectedTeacher(assess.guruPengampu);
                                setActiveTab('input');
                                setTimeout(() => {
                                  printDocumentWithA4({
                                    orientation: 'portrait',
                                    title: `Daftar_Nilai_${assess.mataPelajaran.replace(/\s+/g, '_')}_Kelas_${assess.kelas}_${assess.jenisPenilaian.replace(/[\s()]+/g, '_')}`
                                  });
                                }, 300);
                              }}
                              className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 transition-colors"
                              title="Cetak via Kabel/Wireless atau Simpan ke PDF format A4"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAssessment(assess)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                              title="Hapus Data Asesmen Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Confirmation Delete Modal */}
      <ConfirmDeleteModal
        state={deleteConfirmState}
        onClose={closeDeleteConfirm}
      />
    </div>
  );
};
