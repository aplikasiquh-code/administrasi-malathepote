import React, { useState, useEffect, useMemo } from 'react';
import { SchoolProfile, Teacher, Student, DailyClassAttendance, DailyTeachingJournal, StudentAssessment, AssessmentType, ClassRoomItem, STANDARD_SD_SUBJECTS, normalizeSubjectName } from '../types';
import { OfficialSchoolKop } from './OfficialSchoolKop';
import { 
  X, 
  Printer, 
  FileText, 
  Users, 
  GraduationCap, 
  Building2, 
  CheckCircle2,
  Calendar,
  Layers,
  BookMarked,
  Award,
  Download,
  Wifi,
  Cable,
  FileSpreadsheet,
  MapPin,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { getDayScheduleInfo } from '../utils/indonesianCalendarUtils';
import { exportTeachersExcel } from '../utils/excelTeacherUtils';
import { exportTeachingJournalsToExcel } from '../utils/excelCurriculumUtils';
import { exportClassGradeLedgerExcel } from '../utils/excelAssessmentUtils';
import { exportMonthlyAttendanceRecapExcel } from '../utils/excelAttendanceUtils';
import { 
  exportSchoolProfileExcel, 
  exportForm8355RecapExcel, 
  exportAttendanceFormatExcel,
  exportSingleStudentExcel
} from '../utils/excelReportUtils';
import { printDocumentWithA4 } from '../utils/exportUtils';
import { formatReportDateIndonesian } from '../utils/reportAttendanceUtils';
import { 
  StudentReportCoverPage, 
  StudentReportBiodataPage 
} from './StudentReportCoverView';

export type ReportModalType = 
  | 'rekap-siswa' 
  | 'rekap-guru' 
  | 'profil-sekolah' 
  | 'daftar-hadir' 
  | 'cetak-jurnal' 
  | 'leger-nilai'
  | 'sampul-rapor'
  | 'biodata-rapor';

interface PrintReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolProfile;
  teachers: Teacher[];
  students: Student[];
  classes?: ClassRoomItem[];
  attendanceList?: DailyClassAttendance[];
  teachingJournals?: DailyTeachingJournal[];
  assessments?: StudentAssessment[];
  initialReportType?: ReportModalType;
  initialPrintDate?: string;
  initialPrintPlace?: string;
}

export const PrintReportsModal: React.FC<PrintReportsModalProps> = ({
  isOpen,
  onClose,
  school,
  teachers,
  students,
  classes = [],
  attendanceList = [],
  teachingJournals = [],
  assessments = [],
  initialReportType = 'rekap-siswa',
  initialPrintDate,
  initialPrintPlace
}) => {
  const [reportType, setReportType] = useState<ReportModalType>(initialReportType);
  const [selectedClassForAttendance, setSelectedClassForAttendance] = useState<string>('1A');
  const [attendanceMonth, setAttendanceMonth] = useState<string>('2026-08');
  const [attendanceMode, setAttendanceMode] = useState<'filled' | 'blank'>('filled');

  // Automatic orientation selection: Portrait for Profil Sekolah, Sampul Rapor, and Biodata Rapor; Landscape for multi-column tabular reports
  const orientation: 'portrait' | 'landscape' = useMemo(() => {
    return (reportType === 'profil-sekolah' || reportType === 'sampul-rapor' || reportType === 'biodata-rapor') 
      ? 'portrait' 
      : 'landscape';
  }, [reportType]);

  // Manage print-modal-open class on body to cleanly isolate print layout
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('print-modal-open');
    } else {
      document.body.classList.remove('print-modal-open');
    }
    return () => {
      document.body.classList.remove('print-modal-open');
    };
  }, [isOpen]);

  // Filters for Cetak Jurnal
  const [selectedJournalClass, setSelectedJournalClass] = useState<string>('all');
  const [selectedJournalTeacher, setSelectedJournalTeacher] = useState<string>('all');
  const [selectedJournalMonth, setSelectedJournalMonth] = useState<string>('');
  const [selectedJournalSubject, setSelectedJournalSubject] = useState<string>('all');

  // Filters for Leger Nilai
  const [selectedAssessmentClass, setSelectedAssessmentClass] = useState<string>('1A');
  const [selectedAssessmentSubject, setSelectedAssessmentSubject] = useState<string>('Matematika');

  // Filters & Options for Sampul & Biodata Rapor
  const [selectedReportClass, setSelectedReportClass] = useState<string>('1A');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [coverPageOption, setCoverPageOption] = useState<'cover' | 'biodata' | 'both'>('cover');
  const [coverDataMode, setCoverDataMode] = useState<'filled' | 'blank'>('filled');

  // Tanggal & Tempat Cetak Dokumen
  const [printDate, setPrintDate] = useState<string>(() => {
    return initialPrintDate || new Date().toISOString().slice(0, 10);
  });
  const [printPlace, setPrintPlace] = useState<string>(() => {
    return initialPrintPlace || school.kabupatenKota || '';
  });

  useEffect(() => {
    if (initialPrintDate) setPrintDate(initialPrintDate);
  }, [initialPrintDate]);

  useEffect(() => {
    if (initialPrintPlace) setPrintPlace(initialPrintPlace);
    else if (!printPlace && school.kabupatenKota) setPrintPlace(school.kabupatenKota);
  }, [initialPrintPlace, school.kabupatenKota]);

  const formattedPrintDate = useMemo(() => {
    return formatReportDateIndonesian(printDate) || formatReportDateIndonesian(new Date().toISOString().slice(0, 10));
  }, [printDate]);

  useEffect(() => {
    if (isOpen && initialReportType) {
      setReportType(initialReportType as ReportModalType);
      if (initialReportType === 'sampul-rapor') {
        setCoverPageOption('cover');
      } else if (initialReportType === 'biodata-rapor') {
        setCoverPageOption('biodata');
      }
    }
  }, [isOpen, initialReportType]);

  const handleSelectReportType = (type: ReportModalType) => {
    setReportType(type);
    if (type === 'sampul-rapor') {
      setCoverPageOption('cover');
    } else if (type === 'biodata-rapor') {
      setCoverPageOption('biodata');
    }
  };

  // Extract unique subjects from assessments and teaching journals
  const availableAssessmentSubjects = useMemo(() => {
    const set = new Set<string>(STANDARD_SD_SUBJECTS);
    assessments.forEach(a => {
      if (a.mataPelajaran) {
        const mapel = normalizeSubjectName(a.mataPelajaran) || a.mataPelajaran.trim();
        set.add(mapel);
      }
    });
    return Array.from(set);
  }, [assessments]);

  // Extract unique subjects from teaching journals
  const availableJournalSubjects = useMemo(() => {
    const set = new Set<string>();
    teachingJournals.forEach(j => {
      if (j.mataPelajaran) {
        const mapel = normalizeSubjectName(j.mataPelajaran) || j.mataPelajaran.trim();
        set.add(mapel);
      }
    });
    return Array.from(set);
  }, [teachingJournals]);

  // Filtered Teaching Journals
  const filteredTeachingJournals = useMemo(() => {
    return teachingJournals.filter(j => {
      if (selectedJournalClass !== 'all' && j.kelas !== selectedJournalClass) return false;
      if (selectedJournalTeacher !== 'all' && j.guruPengajar !== selectedJournalTeacher) return false;
      if (selectedJournalMonth && !j.tanggal.startsWith(selectedJournalMonth)) return false;
      if (selectedJournalSubject !== 'all' && normalizeSubjectName(j.mataPelajaran) !== normalizeSubjectName(selectedJournalSubject)) return false;
      return true;
    }).sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  }, [teachingJournals, selectedJournalClass, selectedJournalTeacher, selectedJournalMonth, selectedJournalSubject]);

  const classGrades = useMemo(() => {
    if (classes && classes.length > 0) {
      return classes.map(c => c.nama).sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
    }
    const studentClasses = Array.from(new Set(students.map(s => s.kelas)));
    return studentClasses.length > 0 ? (studentClasses as string[]).sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })) : ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
  }, [classes, students]);

  // Students in selected report class for Sampul & Biodata
  const studentsInSelectedReportClass = useMemo(() => {
    return students
      .filter(s => s.kelas === selectedReportClass && s.statusSiswa === 'Aktif')
      .sort((a, b) => a.namaLengkap.localeCompare(b.namaLengkap));
  }, [students, selectedReportClass]);

  // Target students to print (all or specific single student)
  const targetReportStudents = useMemo(() => {
    if (selectedStudentId === 'all') {
      return studentsInSelectedReportClass;
    }
    const found = students.find(s => s.id === selectedStudentId);
    return found ? [found] : studentsInSelectedReportClass.slice(0, 1);
  }, [studentsInSelectedReportClass, selectedStudentId, students]);

  if (!isOpen) return null;

  const handlePrint = () => {
    const cleanSchoolName = (school.namaSekolah || 'Sekolah').replace(/\s+/g, '_');
    const cleanYear = (school.tahunAjaran || '2026-2027').replace(/[/\\?%*:|"<>]/g, '-');
    const docTitles: Record<ReportModalType, string> = {
      'rekap-siswa': `Laporan_Rekapitulasi_Siswa_SD_Form_8355_${cleanYear}_${printDate}`,
      'rekap-guru': `Daftar_GTK_${cleanSchoolName}_${cleanYear}_${printDate}`,
      'profil-sekolah': `Profil_Sekolah_${cleanSchoolName}_${printDate}`,
      'daftar-hadir': `Jurnal_Rekapitulasi_Presensi_Kelas_${selectedClassForAttendance}_${attendanceMonth}_${printDate}`,
      'cetak-jurnal': `Jurnal_KBM_Guru_Kelas_${selectedJournalClass}_${selectedJournalMonth || 'Semua'}_${printDate}`,
      'leger-nilai': `Buku_Leger_Nilai_${selectedAssessmentSubject.replace(/\s+/g, '_')}_Kelas_${selectedAssessmentClass}_${printDate}`,
      'sampul-rapor': `Sampul_Rapor_Kelas_${selectedReportClass}_${selectedStudentId === 'all' ? 'Semua_Siswa' : (targetReportStudents[0]?.namaLengkap.replace(/\s+/g, '_') || 'Siswa')}_${printDate}`,
      'biodata-rapor': `Keterangan_Diri_Siswa_Kelas_${selectedReportClass}_${selectedStudentId === 'all' ? 'Semua_Siswa' : (targetReportStudents[0]?.namaLengkap.replace(/\s+/g, '_') || 'Siswa')}_${printDate}`
    };

    printDocumentWithA4({
      orientation,
      title: docTitles[reportType] || `Laporan_Resmi_Sekolah_Dasar_${printDate}`
    });
  };

  const handleExportExcel = () => {
    if (reportType === 'rekap-siswa') {
      exportForm8355RecapExcel(school, students, classGrades, printDate, printPlace);
    } else if (reportType === 'rekap-guru') {
      exportTeachersExcel(teachers, school.namaSekolah);
    } else if (reportType === 'profil-sekolah') {
      exportSchoolProfileExcel(school, activeStudents.length, teachers.length, printDate, printPlace);
    } else if (reportType === 'daftar-hadir') {
      if (attendanceMode === 'filled') {
        const [yStr, mStr] = attendanceMonth.split('-');
        const y = parseInt(yStr, 10) || new Date().getFullYear();
        const m = (parseInt(mStr, 10) || 1) - 1;
        exportMonthlyAttendanceRecapExcel(
          y,
          m,
          selectedClassForAttendance as any,
          attendanceStudents,
          attendanceList,
          school
        );
      } else {
        exportAttendanceFormatExcel(
          selectedClassForAttendance,
          attendanceStudents,
          attendanceMonth,
          school,
          currentWaliKelas?.namaLengkap,
          printDate,
          printPlace
        );
      }
    } else if (reportType === 'cetak-jurnal') {
      exportTeachingJournalsToExcel(filteredTeachingJournals, school, {
        kelas: selectedJournalClass !== 'all' ? selectedJournalClass : undefined,
        mapel: selectedJournalSubject !== 'all' ? selectedJournalSubject : undefined,
        guru: selectedJournalTeacher !== 'all' ? selectedJournalTeacher : undefined,
        dateRange: selectedJournalMonth || undefined
      });
    } else if (reportType === 'leger-nilai') {
      const clsStudents = students.filter(s => s.kelas === selectedAssessmentClass);
      exportClassGradeLedgerExcel(
        selectedAssessmentClass as any,
        selectedAssessmentSubject,
        clsStudents,
        assessments,
        school
      );
    } else if (reportType === 'sampul-rapor' || reportType === 'biodata-rapor') {
      if (targetReportStudents.length === 1) {
        exportSingleStudentExcel(targetReportStudents[0], school);
      } else if (targetReportStudents.length > 1) {
        targetReportStudents.forEach(st => {
          exportSingleStudentExcel(st, school);
        });
      }
    }
  };

  const activeStudents = students.filter(s => s.statusSiswa === 'Aktif');

  const classSummary = classGrades.map((grade) => {
    const list = activeStudents.filter(s => s.kelas === grade);
    return {
      grade,
      male: list.filter(s => s.jenisKelamin === 'L').length,
      female: list.filter(s => s.jenisKelamin === 'P').length,
      total: list.length
    };
  });

  const totalAllStudents = classSummary.reduce((acc, c) => acc + c.total, 0);
  const totalAllMale = classSummary.reduce((acc, c) => acc + c.male, 0);
  const totalAllFemale = classSummary.reduce((acc, c) => acc + c.female, 0);

  const attendanceStudents = students.filter(
    s => s.kelas === selectedClassForAttendance && s.statusSiswa === 'Aktif'
  );

  const currentWaliKelas = teachers.find(t => t.penugasanKelas.includes(selectedClassForAttendance as any));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:overflow-visible print:block print:z-auto">
      <div className={`bg-slate-900 border border-slate-800 rounded-2xl w-full shadow-2xl animate-in fade-in zoom-in-95 my-4 max-h-[95vh] flex flex-col transition-all print:border-none print:shadow-none print:rounded-none print:my-0 print:max-h-none print:h-auto print:bg-white print:w-full print:max-w-none print:block print:static ${
        orientation === 'landscape' ? 'max-w-6xl' : 'max-w-4xl'
      }`}>
        {/* Modal Controls Header (Hidden on print) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 print:hidden bg-slate-900">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Pusat Cetak Dokumen & Laporan Resmi SD
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>Standar format cetak kertas A4 (210 × 297 mm) rapi tanpa terpotong untuk USB, Wi-Fi, dan PDF.</span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* Automatic Orientation Indicator (No manual toggle buttons) */}
            <div 
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-300 font-medium select-none"
              title="Orientasi kertas A4 ditentukan secara otomatis sesuai standar dokumen"
            >
              <span>{orientation === 'landscape' ? '📃 A4 Landscape' : '📄 A4 Portrait'}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">(Otomatis)</span>
            </div>

            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
              title="Unduh / Simpan dokumen ini dalam format spreadsheet Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Simpan Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
              title={`Cetak dokumen format A4 ${orientation === 'landscape' ? 'Landscape' : 'Portrait'} atau Simpan PDF`}
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Compatibility info badge banner */}
        <div className="bg-slate-950/70 border-b border-slate-800/80 px-4 py-2 text-[11px] text-slate-400 flex items-center justify-between gap-3 flex-wrap print:hidden">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Kertas Standar A4 ({orientation === 'landscape' ? '297 × 210 mm Landscape' : '210 × 297 mm Portrait'})
            </span>
            <span className="flex items-center gap-1 text-sky-400 font-medium">
              <Cable className="w-3.5 h-3.5" />
              Kabel USB
            </span>
            <span className="flex items-center gap-1 text-indigo-400 font-medium">
              <Wifi className="w-3.5 h-3.5" />
              Nirkabel (Wi-Fi / Bluetooth)
            </span>
          </div>
          <span className="text-slate-400 text-[10px]">
            Tip: Mode kertas otomatis menyesuaikan saat cetak / simpan PDF.
          </span>
        </div>

        {/* Tab Selection (Hidden on print) */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800 bg-slate-900/90 flex items-center gap-2 overflow-x-auto shrink-0 print:hidden">
          <button
            onClick={() => handleSelectReportType('rekap-siswa')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
              reportType === 'rekap-siswa'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Rekap Siswa (Form 8355)</span>
          </button>

          <button
            onClick={() => handleSelectReportType('rekap-guru')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
              reportType === 'rekap-guru'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Rekap GTK & Kepegawaian</span>
          </button>

          <button
            onClick={() => handleSelectReportType('profil-sekolah')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
              reportType === 'profil-sekolah'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Profil Lembaga Sekolah</span>
          </button>

          <button
            onClick={() => handleSelectReportType('daftar-hadir')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
              reportType === 'daftar-hadir'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Format Daftar Hadir Kelas</span>
          </button>

          <button
            onClick={() => handleSelectReportType('cetak-jurnal')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
              reportType === 'cetak-jurnal'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>Cetak Jurnal KBM</span>
          </button>

          <button
            onClick={() => handleSelectReportType('leger-nilai')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
              reportType === 'leger-nilai'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Buku Leger Nilai</span>
          </button>

          <button
            onClick={() => handleSelectReportType('sampul-rapor')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
              reportType === 'sampul-rapor' || reportType === 'biodata-rapor'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Sampul & Keterangan Diri Rapor</span>
          </button>
        </div>

        {/* Universal Print Settings (Tanggal & Tempat Cetak Dokumen) - Hidden on print */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            {/* Input Tanggal Cetak */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/90 px-3 py-1.5 rounded-xl shadow-inner">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <label htmlFor="modal-tanggal-cetak" className="text-slate-300 font-semibold text-xs whitespace-nowrap">
                Tanggal Cetak:
              </label>
              <input
                id="modal-tanggal-cetak"
                type="date"
                value={printDate}
                onChange={(e) => setPrintDate(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <span className="text-amber-300 text-xs font-semibold hidden md:inline ml-0.5">
                ({formattedPrintDate})
              </span>
            </div>

            {/* Input Tempat / Kota Cetak */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/90 px-3 py-1.5 rounded-xl shadow-inner">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
              <label htmlFor="modal-tempat-cetak" className="text-slate-300 font-semibold text-xs whitespace-nowrap">
                Kota / Tempat:
              </label>
              <input
                id="modal-tempat-cetak"
                type="text"
                value={printPlace}
                onChange={(e) => setPrintPlace(e.target.value)}
                placeholder="Contoh: Semarang"
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-medium w-28 sm:w-36 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            {/* Quick date presets */}
            <div className="hidden lg:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPrintDate(new Date().toISOString().slice(0, 10))}
                className="px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Gunakan tanggal hari ini"
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => {
                  const startYear = school.tahunAjaran ? school.tahunAjaran.split(/[-/]/)[0] : '2026';
                  setPrintDate(`${startYear}-12-22`);
                }}
                className="px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Tanggal Laporan Akhir Semester Ganjil (22 Des)"
              >
                Sem. 1 (22 Des)
              </button>
              <button
                type="button"
                onClick={() => {
                  const parts = (school.tahunAjaran || '2026/2027').split(/[-/]/);
                  const endYear = parts[1] || '2027';
                  setPrintDate(`${endYear}-06-20`);
                }}
                className="px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Tanggal Laporan Akhir Semester Genap (20 Jun)"
              >
                Sem. 2 (20 Jun)
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 ml-auto">
            <span>Teks Tanda Tangan:</span>
            <span className="font-semibold text-amber-300">
              {printPlace || school.kabupatenKota || 'Kota'}, {formattedPrintDate}
            </span>
          </div>
        </div>

        {/* Sub-controls if leger-nilai */}
        {reportType === 'leger-nilai' && (
          <div className="px-6 py-2.5 bg-slate-800/60 border-b border-slate-700/60 flex flex-wrap items-center gap-4 print:hidden text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-semibold">Pilih Rombel:</span>
              <select
                value={selectedAssessmentClass}
                onChange={(e) => setSelectedAssessmentClass(e.target.value)}
                className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-amber-300"
              >
                {classGrades.map((cls) => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-semibold">Mata Pelajaran:</span>
              <select
                value={selectedAssessmentSubject}
                onChange={(e) => setSelectedAssessmentSubject(e.target.value)}
                className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold"
              >
                {availableAssessmentSubjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <span className="text-[11px] text-slate-400 ml-auto font-medium">
              Tahun Ajaran {school.tahunAjaran} • Semester {school.semester}
            </span>
          </div>
        )}

        {/* Sub-controls if journal print */}
        {reportType === 'cetak-jurnal' && (
          <div className="px-6 py-2.5 bg-slate-800/60 border-b border-slate-700/60 flex flex-wrap items-center gap-3 print:hidden text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-300 font-semibold">Kelas:</span>
              <select
                value={selectedJournalClass}
                onChange={(e) => setSelectedJournalClass(e.target.value)}
                className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold text-xs"
              >
                <option value="all">Semua Rombel ({classGrades.length})</option>
                {classGrades.map((cls) => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-300 font-semibold">Guru Pengajar:</span>
              <select
                value={selectedJournalTeacher}
                onChange={(e) => setSelectedJournalTeacher(e.target.value)}
                className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold text-xs max-w-[170px]"
              >
                <option value="all">Semua Guru ({teachers.length})</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.namaLengkap}>{t.namaLengkap}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-300 font-semibold">Bulan:</span>
              <input
                type="month"
                value={selectedJournalMonth}
                onChange={(e) => setSelectedJournalMonth(e.target.value)}
                className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold text-xs"
                placeholder="Semua Bulan"
              />
              {selectedJournalMonth && (
                <button
                  type="button"
                  onClick={() => setSelectedJournalMonth('')}
                  className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-700"
                  title="Tampilkan semua bulan"
                >
                  ✕
                </button>
              )}
            </div>

            {availableJournalSubjects.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-300 font-semibold">Mapel:</span>
                <select
                  value={selectedJournalSubject}
                  onChange={(e) => setSelectedJournalSubject(e.target.value)}
                  className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold text-xs max-w-[150px]"
                >
                  <option value="all">Semua Mapel</option>
                  {availableJournalSubjects.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}

            <span className="text-[11px] text-slate-400 ml-auto font-medium">
              {filteredTeachingJournals.length} Catatan Jurnal
            </span>
          </div>
        )}

        {/* Sub-controls if attendance */}
        {reportType === 'daftar-hadir' && (
          <div className="px-6 py-2.5 bg-slate-800/60 border-b border-slate-700/60 flex flex-wrap items-center gap-4 print:hidden text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-semibold">Pilih Kelas:</span>
              <select
                value={selectedClassForAttendance}
                onChange={(e) => setSelectedClassForAttendance(e.target.value)}
                className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-violet-300"
              >
                {classGrades.map((cls) => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-semibold">Bulan:</span>
              <input
                type="month"
                value={attendanceMonth}
                onChange={(e) => setAttendanceMonth(e.target.value)}
                className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-blue-300"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-semibold">Mode Tampilan:</span>
              <div className="flex rounded-lg overflow-hidden border border-slate-700">
                <button
                  onClick={() => setAttendanceMode('filled')}
                  className={`px-2.5 py-1 text-xs font-semibold ${
                    attendanceMode === 'filled' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Rekap Terisi
                </button>
                <button
                  onClick={() => setAttendanceMode('blank')}
                  className={`px-2.5 py-1 text-xs font-semibold ${
                    attendanceMode === 'blank' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Format Kosong
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sub-controls if sampul-rapor or biodata-rapor */}
        {(reportType === 'sampul-rapor' || reportType === 'biodata-rapor') && (
          <div className="px-4 sm:px-6 py-2.5 bg-slate-800/80 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3 print:hidden text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Pilih Kelas */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-300 font-semibold">Pilih Rombel:</span>
                <select
                  value={selectedReportClass}
                  onChange={(e) => {
                    setSelectedReportClass(e.target.value);
                    setSelectedStudentId('all');
                  }}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-bold text-xs"
                >
                  {classGrades.map((cls) => (
                    <option key={cls} value={cls}>Kelas {cls}</option>
                  ))}
                </select>
              </div>

              {/* Pilih Siswa */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-300 font-semibold">Pilih Siswa:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium text-xs max-w-xs"
                >
                  <option value="all">
                    👥 Semua Siswa di Rombel Ini ({studentsInSelectedReportClass.length} Siswa - Cetak Massal)
                  </option>
                  <optgroup label="Pilih Siswa Tertentu:">
                    {studentsInSelectedReportClass.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.namaLengkap} ({s.nisn || s.nis})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Opsi Halaman */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setCoverPageOption('cover')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    coverPageOption === 'cover'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Hal 1: Sampul
                </button>
                <button
                  type="button"
                  onClick={() => setCoverPageOption('biodata')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    coverPageOption === 'biodata'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Hal 2: Keterangan Diri Siswa
                </button>
                <button
                  type="button"
                  onClick={() => setCoverPageOption('both')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    coverPageOption === 'both'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Hal 1 & 2 (Lengkap)
                </button>
              </div>

              {/* Opsi Format Data Sampul (Terisi / Blanko Kosong) */}
              {(coverPageOption === 'cover' || coverPageOption === 'both') && (
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
                  <span className="text-[11px] text-slate-400 font-semibold px-1 hidden md:inline">Format:</span>
                  <button
                    type="button"
                    onClick={() => setCoverDataMode('filled')}
                    className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
                      coverDataMode === 'filled'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Cetak sampul dengan nama dan nomor induk siswa yang sudah terisi otomatis"
                  >
                    Terisi Nama
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverDataMode('blank')}
                    className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
                      coverDataMode === 'blank'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Cetak format blanko kosong dengan garis titik-titik (persis gambar)"
                  >
                    Titik-titik (Blanko)
                  </button>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 font-medium ml-auto flex items-center gap-2">
              {targetReportStudents.length > 1 ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Siap cetak {targetReportStudents.length} siswa ({coverPageOption === 'both' ? targetReportStudents.length * 2 : targetReportStudents.length} lembar A4 terpisah)
                </span>
              ) : (
                <span>
                  Siswa: <strong className="text-white">{targetReportStudents[0]?.namaLengkap || '-'}</strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Document Printable View Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950 text-slate-100 print:p-0 print:m-0 print:bg-white print:text-black print:overflow-visible print:block print:h-auto print:static">
          {reportType === 'sampul-rapor' || reportType === 'biodata-rapor' ? (
            /* Dedicated A4 Print Container for Cover & Biodata Pages */
            <div 
              id="printable-report-document"
              className="w-full max-w-3xl mx-auto space-y-8 print:space-y-0 print:w-full print:max-w-none print:p-0 print:m-0"
            >
              {targetReportStudents.length === 0 ? (
                <div className="bg-white text-slate-800 p-12 rounded-xl text-center shadow-lg">
                  <p className="font-bold text-base">Tidak ada siswa aktif di Kelas {selectedReportClass}.</p>
                  <p className="text-xs text-slate-500 mt-1">Silakan pilih rombel lain atau tambahkan data siswa di menu Siswa.</p>
                </div>
              ) : (
                targetReportStudents.map((st, idx) => {
                  const isLastStudent = idx === targetReportStudents.length - 1;
                  const wali = teachers.find(t => t.penugasanKelas.includes(st.kelas as any));

                  return (
                    <div key={st.id} className="space-y-8 print:space-y-0">
                      {(coverPageOption === 'cover' || coverPageOption === 'both') && (
                        <div className={`bg-white text-black shadow-xl print:shadow-none rounded-xl print:rounded-none overflow-hidden print:overflow-visible ${
                          coverPageOption === 'both' || !isLastStudent ? 'break-after-page' : ''
                        }`}>
                          <StudentReportCoverPage
                            student={st}
                            school={school}
                            blankMode={coverDataMode === 'blank'}
                          />
                        </div>
                      )}

                      {(coverPageOption === 'biodata' || coverPageOption === 'both') && (
                        <div className={`bg-white text-black shadow-xl print:shadow-none rounded-xl print:rounded-none overflow-hidden print:overflow-visible ${
                          !isLastStudent ? 'break-after-page' : ''
                        }`}>
                          <StudentReportBiodataPage
                            student={st}
                            school={school}
                            printDate={printDate}
                            printPlace={printPlace}
                            waliKelas={wali}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Printable White Paper Container for Tabular & Official Administrative Reports */
            <div 
              id="printable-report-document"
              className={`bg-white text-slate-900 rounded-xl p-6 sm:p-10 mx-auto shadow-xl print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none print:block print:static font-sans transition-all ${
                orientation === 'landscape' ? 'w-full max-w-5xl a4-landscape-sheet' : 'w-full max-w-3xl a4-portrait-sheet'
              }`}
            >
              {/* Standard Kop Surat Resmi Sekolah Dasar */}
              <OfficialSchoolKop school={school} />

            {/* Document Title according to Report Type */}
            {reportType === 'rekap-siswa' && (
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <h2 className="text-base font-bold uppercase underline tracking-wide">
                    LAPORAN REKAPITULASI KEADAAN SISWA (FORM 8355)
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Keadaan Siswa Tahun Pelajaran {school.tahunAjaran} — Semester {school.semester} • Tanggal Cetak: {formattedPrintDate}
                  </p>
                </div>

                {/* Table */}
                <table className="w-full text-left text-xs border border-black border-collapse mt-4">
                  <thead>
                    <tr className="bg-slate-100 text-black border-b border-black">
                      <th className="border border-black p-2 text-center w-10" rowSpan={2}>No</th>
                      <th className="border border-black p-2 text-center w-28" rowSpan={2}>Rombel / Kelas</th>
                      <th className="border border-black p-1 text-center" colSpan={2}>Jenis Kelamin</th>
                      <th className="border border-black p-2 text-center w-24" rowSpan={2}>Jumlah Siswa</th>
                      <th className="border border-black p-2 text-left" rowSpan={2}>Nama Wali Kelas</th>
                    </tr>
                    <tr className="bg-slate-100 text-black border-b border-black">
                      <th className="border border-black p-1 text-center text-[10px] w-14">Laki-Laki</th>
                      <th className="border border-black p-1 text-center text-[10px] w-14">Perempuan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classSummary.map((item, idx) => {
                      const wali = teachers.find(t => t.penugasanKelas.includes(item.grade));
                      return (
                        <tr key={item.grade} className="border-b border-black">
                          <td className="border border-black p-2 text-center">{idx + 1}</td>
                          <td className="border border-black p-2 font-bold text-center">Kelas {item.grade}</td>
                          <td className="border border-black p-2 text-center">{item.male}</td>
                          <td className="border border-black p-2 text-center">{item.female}</td>
                          <td className="border border-black p-2 text-center font-bold">{item.total}</td>
                          <td className="border border-black p-2 text-xs">
                            {wali ? (
                              <div>
                                <span className="font-semibold text-black">{wali.namaLengkap}</span>
                                <span className="text-[10px] text-slate-600 block">NIP. {wali.nip}</span>
                              </div>
                            ) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="font-bold bg-slate-100 border-t-2 border-black">
                      <td className="border border-black p-2 text-center" colSpan={2}>TOTAL KESELURUHAN</td>
                      <td className="border border-black p-2 text-center">{totalAllMale}</td>
                      <td className="border border-black p-2 text-center">{totalAllFemale}</td>
                      <td className="border border-black p-2 text-center">{totalAllStudents}</td>
                      <td className="border border-black p-2 text-center">-</td>
                    </tr>
                  </tbody>
                </table>

                {/* Summary Statistics Box */}
                <div className="border border-black/40 bg-slate-50/60 p-3 rounded text-xs flex flex-wrap items-center justify-between gap-3 mt-3">
                  <div>
                    <span className="text-slate-700">Total Peserta Didik Aktif: </span>
                    <strong className="text-black font-bold">{totalAllStudents} Siswa</strong>
                    <span className="text-slate-600"> (L: {totalAllMale}, P: {totalAllFemale})</span>
                  </div>
                  <div>
                    <span className="text-slate-700">Rombongan Belajar: </span>
                    <strong className="text-black font-bold">{classGrades.length} Kelas</strong>
                    <span className="text-slate-600"> • Rata-rata: {classGrades.length > 0 ? (totalAllStudents / classGrades.length).toFixed(1) : 0} siswa/rombel</span>
                  </div>
                </div>
              </div>
            )}

            {reportType === 'rekap-guru' && (
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <h2 className="text-base font-bold uppercase underline tracking-wide">
                    DAFTAR PENDIDIK & TENAGA KEPENDIDIKAN (GTK)
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Keadaan Pegawai Tahun Pelajaran {school.tahunAjaran} — Semester {school.semester} • Tanggal Cetak: {formattedPrintDate}
                  </p>
                </div>

                <table className="w-full text-left text-[11px] border border-black border-collapse mt-4">
                  <thead>
                    <tr className="bg-slate-100 text-black border-b border-black">
                      <th className="border border-black p-1.5 text-center w-8">No</th>
                      <th className="border border-black p-1.5">Nama Lengkap & NIP / NUPTK</th>
                      <th className="border border-black p-1.5">Jabatan / Penugasan</th>
                      <th className="border border-black p-1.5 text-center w-9">L/P</th>
                      <th className="border border-black p-1.5 text-center w-20">Status</th>
                      <th className="border border-black p-1.5 text-center w-14">Gol</th>
                      <th className="border border-black p-1.5 text-center w-20">Sertifikasi</th>
                      <th className="border border-black p-1.5 text-center w-28">Tanda Tangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher, idx) => (
                      <tr key={teacher.id} className="border-b border-black">
                        <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-black p-1.5">
                          <div className="font-bold text-black">{teacher.namaLengkap}</div>
                          <div className="text-[10px] font-mono text-slate-700">
                            NIP. {teacher.nip !== '-' ? teacher.nip : '-'} {teacher.nuptk && teacher.nuptk !== '-' ? `| NUPTK. ${teacher.nuptk}` : ''}
                          </div>
                        </td>
                        <td className="border border-black p-1.5">
                          <div className="font-medium text-black">{teacher.jabatan}</div>
                          <div className="text-[10px] text-slate-600">{teacher.penugasanKelas}</div>
                        </td>
                        <td className="border border-black p-1.5 text-center">{teacher.jenisKelamin}</td>
                        <td className="border border-black p-1.5 text-center font-semibold">{teacher.statusKepegawaian}</td>
                        <td className="border border-black p-1.5 text-center font-mono">{teacher.golonganRuang || '-'}</td>
                        <td className="border border-black p-1.5 text-center">
                          {teacher.sertifikasi ? 'Sudah' : 'Belum'}
                        </td>
                        <td className="border border-black p-1.5 text-left text-[10px] text-slate-500 pl-2 align-bottom h-10">
                          {idx % 2 === 0 ? `${idx + 1}. ..................` : <span className="pl-6">{idx + 1}. ..................</span>}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-slate-100 border-t-2 border-black">
                      <td className="border border-black p-2 text-center" colSpan={3}>
                        TOTAL GTK: {teachers.length} ORANG (PNS: {teachers.filter(t => t.statusKepegawaian === 'PNS').length}, PPPK: {teachers.filter(t => t.statusKepegawaian === 'PPPK').length}, Non-ASN: {teachers.filter(t => t.statusKepegawaian !== 'PNS' && t.statusKepegawaian !== 'PPPK').length})
                      </td>
                      <td className="border border-black p-2 text-center">
                        L: {teachers.filter(t => t.jenisKelamin === 'L').length} | P: {teachers.filter(t => t.jenisKelamin === 'P').length}
                      </td>
                      <td className="border border-black p-2 text-center" colSpan={4}>
                        Sudah Bersertifikasi Pendidik: {teachers.filter(t => t.sertifikasi).length} Orang
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'profil-sekolah' && (
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <h2 className="text-base font-bold uppercase underline tracking-wide">
                    LEMBAR IDENTITAS & PROFIL SATUAN PENDIDIKAN
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Tahun Pelajaran {school.tahunAjaran} — Semester {school.semester} • Tanggal Cetak: {formattedPrintDate}
                  </p>
                </div>

                {/* Section A: Identitas Satuan Pendidikan */}
                <div className="border border-black text-xs">
                  <div className="bg-slate-100 font-bold p-1.5 border-b border-black uppercase text-[11px] tracking-wide">
                    A. IDENTITAS SATUAN PENDIDIKAN
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-black">
                    <div className="p-2 space-y-1.5">
                      <div className="flex"><span className="w-36 text-slate-600">1. Nama Sekolah</span><span className="font-bold">: {school.namaSekolah}</span></div>
                      <div className="flex"><span className="w-36 text-slate-600">2. NPSN</span><span className="font-mono font-bold">: {school.npsn}</span></div>
                      <div className="flex"><span className="w-36 text-slate-600">3. NSS</span><span className="font-mono">: {school.nss || '-'}</span></div>
                      <div className="flex"><span className="w-36 text-slate-600">4. Jenjang Lembaga</span><span>: Sekolah Dasar (SD)</span></div>
                    </div>
                    <div className="p-2 space-y-1.5">
                      <div className="flex"><span className="w-36 text-slate-600">5. Status Lembaga</span><span className="font-semibold">: SD {school.statusSekolah}</span></div>
                      <div className="flex"><span className="w-36 text-slate-600">6. Akreditasi</span><span className="font-semibold">: Peringkat {school.akreditasi} ({school.nomorSkAkreditasi || '-'})</span></div>
                      <div className="flex"><span className="w-36 text-slate-600">7. Kurikulum</span><span>: {school.kurikulum}</span></div>
                      <div className="flex"><span className="w-36 text-slate-600">8. Tahun Pelajaran</span><span>: {school.tahunAjaran} ({school.semester})</span></div>
                    </div>
                  </div>
                </div>

                {/* Section B: Alamat & Kontak Resmi */}
                <div className="border border-black text-xs">
                  <div className="bg-slate-100 font-bold p-1.5 border-b border-black uppercase text-[11px] tracking-wide">
                    B. ALAMAT & KONTAK RESMI
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-black">
                    <div className="p-2 space-y-1.5">
                      <div className="flex"><span className="w-36 text-slate-600">1. Alamat Jalan</span><span>: {school.alamatJalan || '-'}</span></div>
                      <div className="flex"><span className="w-36 text-slate-600">2. Desa / Kelurahan</span><span>: {school.kelurahan || '-'}</span></div>
                      <div className="flex"><span className="w-36 text-slate-600">3. Kecamatan</span><span>: {school.kecamatan || '-'}</span></div>
                      <div className="flex"><span className="w-36 text-slate-600">4. Kabupaten / Kota</span><span>: {school.kabupatenKota || '-'}</span></div>
                    </div>
                    <div className="p-2 space-y-1.5">
                      <div className="flex"><span className="w-36 text-slate-600">5. Provinsi</span><span>: {school.provinsi || '-'}</span></div>
                      <div className="flex"><span className="w-36 text-slate-600">6. Kode Pos</span><span className="font-mono">: {school.kodePos || '-'}</span></div>
                      <div className="flex"><span className="w-36 text-slate-600">7. Email Resmi</span><span>: {school.email || '-'}</span></div>
                      <div className="flex"><span className="w-36 text-slate-600">8. Website Resmi</span><span>: {school.website || '-'}</span></div>
                    </div>
                  </div>
                </div>

                {/* Section C: Pimpinan & Data Pokok */}
                <div className="border border-black text-xs">
                  <div className="bg-slate-100 font-bold p-1.5 border-b border-black uppercase text-[11px] tracking-wide">
                    C. PIMPINAN SEKOLAH & DATA STATISTIK
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-black">
                    <div className="p-2 space-y-1.5">
                      <div className="flex"><span className="w-36 text-slate-600">1. Kepala Sekolah</span><span className="font-bold">: {school.kepalaSekolah}</span></div>
                      <div className="flex"><span className="w-36 text-slate-600">2. NIP Kepala Sekolah</span><span className="font-mono">: {school.nipKepalaSekolah}</span></div>
                      <div className="flex"><span className="w-36 text-slate-600">3. Telepon / Kontak</span><span>: {school.noTelepon || '-'}</span></div>
                    </div>
                    <div className="p-2 space-y-1.5">
                      <div className="flex"><span className="w-36 text-slate-600">4. Rombongan Belajar</span><span className="font-bold">: {classGrades.length} Rombel</span></div>
                      <div className="flex"><span className="w-36 text-slate-600">5. Total Siswa Aktif</span><span className="font-bold">: {activeStudents.length} Siswa (L: {totalAllMale}, P: {totalAllFemale})</span></div>
                      <div className="flex"><span className="w-36 text-slate-600">6. Total Guru & Pegawai</span><span className="font-bold">: {teachers.length} Orang</span></div>
                    </div>
                  </div>
                </div>

                {/* Section D: Visi & Misi */}
                <div className="border border-black text-xs">
                  <div className="bg-slate-100 font-bold p-1.5 border-b border-black uppercase text-[11px] tracking-wide">
                    D. VISI & MISI SEKOLAH
                  </div>
                  <div className="p-3 space-y-2">
                    <div>
                      <strong className="text-slate-800 block mb-1">Visi Sekolah:</strong>
                      <p className="italic bg-slate-50 p-2 rounded border border-slate-200 text-slate-900 leading-relaxed">
                        "{school.visi}"
                      </p>
                    </div>
                    <div>
                      <strong className="text-slate-800 block mb-1">Misi Sekolah:</strong>
                      <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-900 leading-relaxed">
                        {school.misi.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {reportType === 'daftar-hadir' && (() => {
              const [yearStr, monthStr] = attendanceMonth.split('-');
              const yearNum = parseInt(yearStr, 10) || 2026;
              const monthNum = parseInt(monthStr, 10) || 8;
              const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
              const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

              const monthNames = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
              ];
              const monthLabel = monthNames[monthNum - 1] || 'Agustus';

              // Map of date string YYYY-MM-DD to attendance record
              const dateMap = new Map<string, DailyClassAttendance>();
              attendanceList.forEach((att) => {
                if (att.kelas === selectedClassForAttendance && att.tanggal.startsWith(attendanceMonth)) {
                  dateMap.set(att.tanggal, att);
                }
              });

              return (
                <div className="mt-6 space-y-4">
                  <div className="text-center">
                    <h2 className="text-base font-bold uppercase underline">
                      JURNAL REKAPITULASI PRESENSI SISWA KELAS {selectedClassForAttendance}
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Bulan: <strong>{monthLabel} {yearNum}</strong> — Tahun Pelajaran {school.tahunAjaran} • Sistem 6 Hari Belajar • Tanggal Cetak: {formattedPrintDate}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[9px] border border-black border-collapse mt-3">
                      <thead>
                        <tr className="bg-slate-100 text-black">
                          <th className="border border-black p-1 text-center" rowSpan={2}>No</th>
                          <th className="border border-black p-1 min-w-[130px]" rowSpan={2}>Nama Peserta Didik</th>
                          <th className="border border-black p-1 text-center" rowSpan={2}>L/P</th>
                          <th className="border border-black p-0.5 text-center" colSpan={daysInMonth}>Tanggal ({monthLabel})</th>
                          <th className="border border-black p-0.5 text-center" colSpan={4}>Rekapitulasi</th>
                          <th className="border border-black p-0.5 text-center" rowSpan={2}>%</th>
                        </tr>
                        <tr className="bg-slate-100 text-black">
                          {daysArray.map((day) => {
                            const dateString = `${attendanceMonth}-${String(day).padStart(2, '0')}`;
                            const schedule = getDayScheduleInfo(dateString);
                            return (
                              <th 
                                key={day} 
                                title={schedule.holidayInfo?.name || (schedule.isSunday ? 'Minggu' : schedule.isSaturday ? 'Sabtu (Masuk)' : 'Senin-Jumat')}
                                className={`border border-black p-0.5 text-center w-4 ${
                                  schedule.isHoliday 
                                    ? 'bg-rose-200 text-rose-900 font-bold' 
                                    : schedule.isSunday 
                                    ? 'bg-slate-200 text-slate-600' 
                                    : schedule.isSaturday 
                                    ? 'bg-amber-100 text-amber-900' 
                                    : ''
                                }`}
                              >
                                <div>{day}</div>
                              </th>
                            );
                          })}
                          <th className="border border-black p-0.5 text-center w-5 bg-emerald-50 text-emerald-800">H</th>
                          <th className="border border-black p-0.5 text-center w-5 bg-amber-50 text-amber-800">S</th>
                          <th className="border border-black p-0.5 text-center w-5 bg-blue-50 text-blue-800">I</th>
                          <th className="border border-black p-0.5 text-center w-5 bg-rose-50 text-rose-800">A</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceStudents.length === 0 ? (
                          <tr>
                            <td colSpan={daysInMonth + 8} className="border border-black p-4 text-center text-slate-500">
                              Tidak ada data siswa aktif di kelas {selectedClassForAttendance}.
                            </td>
                          </tr>
                        ) : (
                          attendanceStudents.map((s, idx) => {
                            let countH = 0;
                            let countS = 0;
                            let countI = 0;
                            let countA = 0;

                            const statusCells = daysArray.map((day) => {
                              const dateString = `${attendanceMonth}-${String(day).padStart(2, '0')}`;
                              const schedule = getDayScheduleInfo(dateString);
                              
                              if (attendanceMode === 'blank') {
                                return (
                                  <td 
                                    key={day} 
                                    className={`border border-black p-0 text-center ${
                                      schedule.isHoliday ? 'bg-rose-100 text-[8px] font-bold text-rose-800' : schedule.isSunday ? 'bg-slate-200' : ''
                                    }`}
                                  >
                                    {schedule.isHoliday ? 'L' : ''}
                                  </td>
                                );
                              }

                              const record = dateMap.get(dateString);
                              const item = record?.records.find((r) => r.studentId === s.id);
                              const status = item?.status;

                              let shortCode = '';
                              if (status === 'Hadir') {
                                countH++;
                                shortCode = 'H';
                              } else if (status === 'Sakit') {
                                countS++;
                                shortCode = 'S';
                              } else if (status === 'Izin') {
                                countI++;
                                shortCode = 'I';
                              } else if (status === 'Alpa') {
                                countA++;
                                shortCode = 'A';
                              } else if (schedule.isSunday) {
                                shortCode = 'M';
                              } else if (schedule.isHoliday) {
                                shortCode = schedule.holidayInfo?.isCutiBersama ? 'CB' : 'LN';
                              }

                              return (
                                <td 
                                  key={day} 
                                  className={`border border-black p-0.5 text-center font-bold ${
                                    schedule.isHoliday 
                                      ? 'bg-rose-100/70 text-rose-800' 
                                      : schedule.isSunday 
                                      ? 'bg-slate-100 text-slate-400' 
                                      : ''
                                  }`}
                                >
                                  {shortCode || '-'}
                                </td>
                              );
                            });

                            const totalRecordedDays = countH + countS + countI + countA;
                            const percentage = totalRecordedDays > 0 ? Math.round((countH / totalRecordedDays) * 100) : 100;

                            return (
                              <tr key={`${s.id}-${idx}`} className="hover:bg-slate-50">
                                <td className="border border-black p-1 text-center">{idx + 1}</td>
                                <td className="border border-black p-1 font-semibold truncate">{s.namaLengkap}</td>
                                <td className="border border-black p-1 text-center">{s.jenisKelamin}</td>
                                {statusCells}
                                <td className="border border-black p-0.5 text-center font-bold text-emerald-800 bg-emerald-50/30">
                                  {attendanceMode === 'filled' ? countH : ''}
                                </td>
                                <td className="border border-black p-0.5 text-center font-bold text-amber-800 bg-amber-50/30">
                                  {attendanceMode === 'filled' ? countS : ''}
                                </td>
                                <td className="border border-black p-0.5 text-center font-bold text-blue-800 bg-blue-50/30">
                                  {attendanceMode === 'filled' ? countI : ''}
                                </td>
                                <td className="border border-black p-0.5 text-center font-bold text-rose-800 bg-rose-50/30">
                                  {attendanceMode === 'filled' ? countA : ''}
                                </td>
                                <td className="border border-black p-0.5 text-center font-bold">
                                  {attendanceMode === 'filled' && totalRecordedDays > 0 ? `${percentage}%` : '-'}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      {attendanceMode === 'filled' && attendanceStudents.length > 0 && (
                        <tfoot>
                          <tr className="bg-slate-100 font-bold text-[8px] text-center border-t-2 border-black">
                            <td colSpan={3} className="border border-black p-1 text-center font-bold">
                              JUMLAH SISWA HADIR (H)
                            </td>
                            {daysArray.map((day) => {
                              const dateString = `${attendanceMonth}-${String(day).padStart(2, '0')}`;
                              const schedule = getDayScheduleInfo(dateString);
                              if (schedule.isSunday || schedule.isHoliday) {
                                return (
                                  <td key={day} className="border border-black p-0.5 text-center text-slate-400">
                                    -
                                  </td>
                                );
                              }
                              const record = dateMap.get(dateString);
                              const hadirToday = record?.records.filter(r => r.status === 'Hadir').length ?? 0;
                              return (
                                <td key={day} className="border border-black p-0.5 text-center text-emerald-800 font-bold">
                                  {hadirToday > 0 ? hadirToday : '-'}
                                </td>
                              );
                            })}
                            <td className="border border-black p-0.5 text-center font-bold bg-emerald-100/50">H</td>
                            <td className="border border-black p-0.5 text-center font-bold bg-amber-100/50">S</td>
                            <td className="border border-black p-0.5 text-center font-bold bg-blue-100/50">I</td>
                            <td className="border border-black p-0.5 text-center font-bold bg-rose-100/50">A</td>
                            <td className="border border-black p-0.5 text-center font-bold">%</td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>

                  {/* Keterangan & Legenda Kode Presensi */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-700 pt-1 border-t border-slate-200">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-black">Keterangan:</span>
                      <span className="inline-flex items-center gap-1">
                        <b className="text-emerald-700">H</b>: Hadir
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <b className="text-amber-700">S</b>: Sakit
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <b className="text-blue-700">I</b>: Izin
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <b className="text-rose-700">A</b>: Alpa (Tanpa Keterangan)
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <b className="text-slate-600">M</b>: Libur Hari Minggu
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <b className="text-rose-800">LN / CB</b>: Libur Nasional / Cuti Bersama
                      </span>
                    </div>
                    <div>
                      <span>Total Siswa: <b>{attendanceStudents.length} Siswa</b></span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Document Title according to Report Type: Cetak Jurnal */}
            {reportType === 'cetak-jurnal' && (
              <div className="mt-6 space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-base font-bold uppercase underline tracking-wider">
                    JURNAL KEGIATAN PEMBELAJARAN GURU (KBM)
                  </h2>
                  <p className="text-xs text-neutral-700">
                    Tahun Ajaran {school.tahunAjaran} — Semester {school.semester} | Kurikulum: {school.kurikulum}
                  </p>
                  <div className="flex items-center justify-center gap-3 text-xs font-semibold text-neutral-800 pt-1">
                    {selectedJournalClass !== 'all' && (
                      <span>Kelas / Rombel: {selectedJournalClass}</span>
                    )}
                    {selectedJournalTeacher !== 'all' && (
                      <span>• Guru: {selectedJournalTeacher}</span>
                    )}
                    {selectedJournalMonth && (
                      <span>• Periode: {selectedJournalMonth}</span>
                    )}
                    {selectedJournalSubject !== 'all' && (
                      <span>• Mapel: {selectedJournalSubject}</span>
                    )}
                    <span>• Tanggal Cetak: {formattedPrintDate}</span>
                  </div>
                </div>

                {/* Table of Journals */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-neutral-950 text-[11px] leading-snug">
                    <thead className="bg-neutral-100 font-bold text-center">
                      <tr>
                        <th className="border border-neutral-950 p-2 w-8">No</th>
                        <th className="border border-neutral-950 p-2 w-24">Hari, Tanggal</th>
                        <th className="border border-neutral-950 p-2 w-14">Jam / Kls</th>
                        <th className="border border-neutral-950 p-2 w-28">Mata Pelajaran</th>
                        <th className="border border-neutral-950 p-2 min-w-[140px]">Tujuan Pembelajaran (TP)</th>
                        <th className="border border-neutral-950 p-2 min-w-[130px]">Materi Pokok / Bahasan</th>
                        <th className="border border-neutral-950 p-2 min-w-[120px]">Refleksi Guru</th>
                        <th className="border border-neutral-950 p-2 w-20">Keterangan</th>
                        <th className="border border-neutral-950 p-2 w-24">Guru Pengajar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeachingJournals.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="border border-neutral-950 p-6 text-center text-neutral-500 italic">
                            Tidak ada catatan jurnal mengajar pada periode / filter yang dipilih.
                          </td>
                        </tr>
                      ) : (
                        filteredTeachingJournals.map((j, idx) => (
                          <tr key={j.id} className="align-top">
                            <td className="border border-neutral-950 p-2 text-center font-medium">{idx + 1}</td>
                            <td className="border border-neutral-950 p-2">
                              <strong className="block text-black">{j.hari}</strong>
                              <span className="text-[10px] text-neutral-600">{j.tanggal}</span>
                            </td>
                            <td className="border border-neutral-950 p-2 text-center">
                              <strong className="block text-black">{j.kelas}</strong>
                              <span className="block text-[10px] text-neutral-600">{j.jamPelajaran || '-'}</span>
                            </td>
                            <td className="border border-neutral-950 p-2 font-semibold text-black">{j.mataPelajaran}</td>
                            <td className="border border-neutral-950 p-2">{j.tujuanPembelajaran}</td>
                            <td className="border border-neutral-950 p-2">{j.materi}</td>
                            <td className="border border-neutral-950 p-2 italic text-neutral-700">{j.refleksi || '-'}</td>
                            <td className="border border-neutral-950 p-2">{j.keterangan || '-'}</td>
                            <td className="border border-neutral-950 p-2">{j.guruPengajar || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* LEGER NILAI VIEW */}
            {reportType === 'leger-nilai' && (() => {
              const classStudents = students
                .filter(s => s.kelas === selectedAssessmentClass && s.statusSiswa === 'Aktif')
                .sort((a, b) => a.namaLengkap.localeCompare(b.namaLengkap));

              const relAssessments = assessments.filter(
                a => a.kelas === selectedAssessmentClass && a.mataPelajaran === selectedAssessmentSubject
              );

              const sh1 = relAssessments.find(a => a.jenisPenilaian === 'SH 1');
              const sh2 = relAssessments.find(a => a.jenisPenilaian === 'SH 2');
              const sh3 = relAssessments.find(a => a.jenisPenilaian === 'SH 3');
              const sh4 = relAssessments.find(a => a.jenisPenilaian === 'SH 4');
              const sh5 = relAssessments.find(a => a.jenisPenilaian === 'SH 5');
              const sh6 = relAssessments.find(a => a.jenisPenilaian === 'SH 6');
              const pts = relAssessments.find(a => a.jenisPenilaian === 'PTS');
              const sas = relAssessments.find(a => a.jenisPenilaian === 'SAS');

              const kktp = relAssessments[0]?.kktp || 75;

              return (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h2 className="text-base font-bold uppercase underline tracking-wider">
                      BUKU LEGER NILAI CAPAIAN HASIL BELAJAR SISWA
                    </h2>
                    <p className="text-xs text-neutral-700">
                      Tahun Ajaran {school.tahunAjaran} — Semester {school.semester} | Kurikulum: {school.kurikulum}
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs font-semibold text-neutral-800 pt-1">
                      <span>Kelas / Rombel: {selectedAssessmentClass}</span>
                      <span>• Mata Pelajaran: {selectedAssessmentSubject}</span>
                      <span>• KKTP: {kktp}</span>
                      <span>• Tanggal Cetak: {formattedPrintDate}</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-neutral-950 text-[10px] leading-snug">
                      <thead className="bg-neutral-100 font-bold text-center">
                        <tr>
                          <th className="border border-neutral-950 p-1.5 w-7" rowSpan={2}>No</th>
                          <th className="border border-neutral-950 p-1.5 w-16" rowSpan={2}>NISN</th>
                          <th className="border border-neutral-950 p-1.5 min-w-[130px]" rowSpan={2}>Nama Peserta Didik</th>
                          <th className="border border-neutral-950 p-1.5 w-7" rowSpan={2}>L/P</th>
                          <th className="border border-neutral-950 p-1" colSpan={6}>Sumatif Harian (Formatif/Lingkup Materi)</th>
                          <th className="border border-neutral-950 p-1 w-10 bg-neutral-200" rowSpan={2}>Rata SH</th>
                          <th className="border border-neutral-950 p-1 w-10" rowSpan={2}>PTS</th>
                          <th className="border border-neutral-950 p-1 w-10" rowSpan={2}>SAS</th>
                          <th className="border border-neutral-950 p-1 w-12 bg-neutral-200" rowSpan={2}>Nilai Akhir</th>
                          <th className="border border-neutral-950 p-1 w-8" rowSpan={2}>Pred.</th>
                          <th className="border border-neutral-950 p-1 w-16" rowSpan={2}>Status</th>
                        </tr>
                        <tr>
                          <th className="border border-neutral-950 p-0.5 w-8">SH 1</th>
                          <th className="border border-neutral-950 p-0.5 w-8">SH 2</th>
                          <th className="border border-neutral-950 p-0.5 w-8">SH 3</th>
                          <th className="border border-neutral-950 p-0.5 w-8">SH 4</th>
                          <th className="border border-neutral-950 p-0.5 w-8">SH 5</th>
                          <th className="border border-neutral-950 p-0.5 w-8">SH 6</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classStudents.length === 0 ? (
                          <tr>
                            <td colSpan={15} className="border border-neutral-950 p-4 text-center text-neutral-500 italic">
                              Tidak ada data siswa aktif di kelas {selectedAssessmentClass}.
                            </td>
                          </tr>
                        ) : (
                          classStudents.map((s, idx) => {
                            const v1 = sh1?.grades?.find(g => g.studentId === s.id)?.nilai ?? sh1?.scores?.find(sc => sc.studentId === s.id)?.score;
                            const v2 = sh2?.grades?.find(g => g.studentId === s.id)?.nilai ?? sh2?.scores?.find(sc => sc.studentId === s.id)?.score;
                            const v3 = sh3?.grades?.find(g => g.studentId === s.id)?.nilai ?? sh3?.scores?.find(sc => sc.studentId === s.id)?.score;
                            const v4 = sh4?.grades?.find(g => g.studentId === s.id)?.nilai ?? sh4?.scores?.find(sc => sc.studentId === s.id)?.score;
                            const v5 = sh5?.grades?.find(g => g.studentId === s.id)?.nilai ?? sh5?.scores?.find(sc => sc.studentId === s.id)?.score;
                            const v6 = sh6?.grades?.find(g => g.studentId === s.id)?.nilai ?? sh6?.scores?.find(sc => sc.studentId === s.id)?.score;
                            const vPts = pts?.grades?.find(g => g.studentId === s.id)?.nilai ?? pts?.scores?.find(sc => sc.studentId === s.id)?.score;
                            const vSas = sas?.grades?.find(g => g.studentId === s.id)?.nilai ?? sas?.scores?.find(sc => sc.studentId === s.id)?.score;

                            const shScores = [v1, v2, v3, v4, v5, v6].filter((v): v is number => typeof v === 'number');
                            const avgSh = shScores.length > 0 ? (shScores.reduce((a, b) => a + b, 0) / shScores.length) : null;

                            let na: number | null = null;
                            if (avgSh !== null || typeof vPts === 'number' || typeof vSas === 'number') {
                              let count = 0;
                              let sum = 0;
                              if (avgSh !== null) { sum += avgSh * 2; count += 2; }
                              if (typeof vPts === 'number') { sum += vPts; count += 1; }
                              if (typeof vSas === 'number') { sum += vSas; count += 1; }
                              na = count > 0 ? Math.round(sum / count) : null;
                            }

                            const predikat = na === null ? '-' : na >= 90 ? 'A' : na >= 80 ? 'B' : na >= kktp ? 'C' : 'D';
                            const tuntas = na === null ? '-' : na >= kktp ? 'Tuntas' : 'Remedial';

                            return (
                              <tr key={`${s.id}-${idx}`} className="text-center">
                                <td className="border border-neutral-950 p-1 font-medium">{idx + 1}</td>
                                <td className="border border-neutral-950 p-1 font-mono text-[9px]">{s.nisn}</td>
                                <td className="border border-neutral-950 p-1 text-left font-semibold text-black">{s.namaLengkap}</td>
                                <td className="border border-neutral-950 p-1">{s.jenisKelamin}</td>
                                <td className="border border-neutral-950 p-1 font-mono">{typeof v1 === 'number' ? v1 : '-'}</td>
                                <td className="border border-neutral-950 p-1 font-mono">{typeof v2 === 'number' ? v2 : '-'}</td>
                                <td className="border border-neutral-950 p-1 font-mono">{typeof v3 === 'number' ? v3 : '-'}</td>
                                <td className="border border-neutral-950 p-1 font-mono">{typeof v4 === 'number' ? v4 : '-'}</td>
                                <td className="border border-neutral-950 p-1 font-mono">{typeof v5 === 'number' ? v5 : '-'}</td>
                                <td className="border border-neutral-950 p-1 font-mono">{typeof v6 === 'number' ? v6 : '-'}</td>
                                <td className="border border-neutral-950 p-1 font-mono font-bold bg-neutral-100">
                                  {avgSh !== null ? avgSh.toFixed(1) : '-'}
                                </td>
                                <td className="border border-neutral-950 p-1 font-mono font-semibold">{typeof vPts === 'number' ? vPts : '-'}</td>
                                <td className="border border-neutral-950 p-1 font-mono font-semibold">{typeof vSas === 'number' ? vSas : '-'}</td>
                                <td className="border border-neutral-950 p-1 font-mono font-bold bg-neutral-200 text-black">
                                  {na !== null ? na : '-'}
                                </td>
                                <td className="border border-neutral-950 p-1 font-bold">{predikat}</td>
                                <td className="border border-neutral-950 p-1 font-medium text-[9px]">
                                  {tuntas}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      {classStudents.length > 0 && (() => {
                        // Calculate class averages for each assessment
                        const calcAvg = (getter: (s: typeof classStudents[0]) => number | null | undefined) => {
                          const valid = classStudents.map(getter).filter((v): v is number => typeof v === 'number');
                          return valid.length > 0 ? (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1) : '-';
                        };

                        const avg1 = calcAvg(s => sh1?.grades?.find(g => g.studentId === s.id)?.nilai ?? sh1?.scores?.find(sc => sc.studentId === s.id)?.score);
                        const avg2 = calcAvg(s => sh2?.grades?.find(g => g.studentId === s.id)?.nilai ?? sh2?.scores?.find(sc => sc.studentId === s.id)?.score);
                        const avg3 = calcAvg(s => sh3?.grades?.find(g => g.studentId === s.id)?.nilai ?? sh3?.scores?.find(sc => sc.studentId === s.id)?.score);
                        const avg4 = calcAvg(s => sh4?.grades?.find(g => g.studentId === s.id)?.nilai ?? sh4?.scores?.find(sc => sc.studentId === s.id)?.score);
                        const avg5 = calcAvg(s => sh5?.grades?.find(g => g.studentId === s.id)?.nilai ?? sh5?.scores?.find(sc => sc.studentId === s.id)?.score);
                        const avg6 = calcAvg(s => sh6?.grades?.find(g => g.studentId === s.id)?.nilai ?? sh6?.scores?.find(sc => sc.studentId === s.id)?.score);
                        const avgPts = calcAvg(s => pts?.grades?.find(g => g.studentId === s.id)?.nilai ?? pts?.scores?.find(sc => sc.studentId === s.id)?.score);
                        const avgSas = calcAvg(s => sas?.grades?.find(g => g.studentId === s.id)?.nilai ?? sas?.scores?.find(sc => sc.studentId === s.id)?.score);

                        return (
                          <tfoot>
                            <tr className="bg-neutral-100 font-bold text-[9px] text-center border-t-2 border-neutral-950">
                              <td colSpan={4} className="border border-neutral-950 p-1 text-center font-bold">
                                RATA-RATA KELAS
                              </td>
                              <td className="border border-neutral-950 p-1 font-mono">{avg1}</td>
                              <td className="border border-neutral-950 p-1 font-mono">{avg2}</td>
                              <td className="border border-neutral-950 p-1 font-mono">{avg3}</td>
                              <td className="border border-neutral-950 p-1 font-mono">{avg4}</td>
                              <td className="border border-neutral-950 p-1 font-mono">{avg5}</td>
                              <td className="border border-neutral-950 p-1 font-mono">{avg6}</td>
                              <td className="border border-neutral-950 p-1 font-mono bg-neutral-200">-</td>
                              <td className="border border-neutral-950 p-1 font-mono">{avgPts}</td>
                              <td className="border border-neutral-950 p-1 font-mono">{avgSas}</td>
                              <td className="border border-neutral-950 p-1 font-mono bg-neutral-300">-</td>
                              <td className="border border-neutral-950 p-1">-</td>
                              <td className="border border-neutral-950 p-1">-</td>
                            </tr>
                          </tfoot>
                        );
                      })()}
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* Signature Block */}
            <div className="mt-8 flex justify-between items-start text-xs text-black pt-4 break-inside-avoid print:break-inside-avoid">
              {reportType === 'profil-sekolah' ? (
                <>
                  <div className="w-72" />
                  <div className="w-72 text-center">
                    <p>{printPlace || school.kabupatenKota || 'Kota'}, {formattedPrintDate}</p>
                    <p className="font-semibold">Kepala {school.namaSekolah}</p>
                    <div className="h-16 flex items-center justify-center text-[10px] text-slate-400 italic">
                      (Tanda Tangan & Cap Resmi)
                    </div>
                    <p className="font-bold underline uppercase">{school.kepalaSekolah}</p>
                    <p className="font-mono text-[11px]">NIP. {school.nipKepalaSekolah}</p>
                  </div>
                </>
              ) : (
                <>
                  {/* Left Column: Kepala Sekolah */}
                  <div className="w-72 text-center">
                    <p>&nbsp;</p>
                    <p>Mengetahui,</p>
                    <p className="font-semibold">Kepala {school.namaSekolah}</p>
                    <div className="h-16" />
                    <p className="font-bold underline uppercase">{school.kepalaSekolah}</p>
                    <p className="font-mono text-[11px]">NIP. {school.nipKepalaSekolah}</p>
                  </div>

                  {/* Right Column: Guru / Wali Kelas */}
                  <div className="w-72 text-center">
                    <p>{printPlace || school.kabupatenKota || 'Kota'}, {formattedPrintDate}</p>
                    <p className="font-semibold">
                      {reportType === 'daftar-hadir'
                        ? `Wali Kelas ${selectedClassForAttendance}`
                        : reportType === 'cetak-jurnal'
                        ? (selectedJournalClass !== 'all' ? `Guru Kelas ${selectedJournalClass}` : 'Guru Kelas / Pengajar')
                        : reportType === 'leger-nilai'
                        ? `Guru Kelas / Pengampu ${selectedAssessmentClass}`
                        : 'Wali Kelas / Petugas Administrasi'}
                    </p>
                    <div className="h-16" />
                    <p className="font-bold underline uppercase">
                      {reportType === 'daftar-hadir' && currentWaliKelas 
                        ? currentWaliKelas.namaLengkap 
                        : reportType === 'cetak-jurnal'
                        ? (selectedJournalTeacher !== 'all' ? selectedJournalTeacher : (teachers[0]?.namaLengkap || '....................................................'))
                        : reportType === 'leger-nilai'
                        ? (teachers.find(t => t.penugasanKelas.includes(selectedAssessmentClass as any))?.namaLengkap || teachers[0]?.namaLengkap || '....................................................')
                        : (teachers[0]?.namaLengkap || '....................................................')}
                    </p>
                    <p className="text-[11px]">
                      NIP. {reportType === 'daftar-hadir' && currentWaliKelas?.nip 
                        ? currentWaliKelas.nip 
                        : reportType === 'cetak-jurnal'
                        ? (teachers.find(t => t.namaLengkap === selectedJournalTeacher)?.nip || teachers[0]?.nip || '.............................................')
                        : reportType === 'leger-nilai'
                        ? (teachers.find(t => t.penugasanKelas.includes(selectedAssessmentClass as any))?.nip || teachers[0]?.nip || '.............................................')
                        : (teachers[0]?.nip || '.............................................')}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Formal Document Print Footer */}
            <div className="mt-8 pt-2.5 border-t border-slate-300 text-[10px] text-slate-500 flex justify-between items-center print:border-black/50 print:text-black">
              <span className="font-medium">
                {school.namaSekolah} • Dokumen Administrasi & Pelaporan Resmi SD
              </span>
              <span className="font-medium">
                Tanggal Cetak: <strong>{printPlace || school.kabupatenKota || 'Kota'}, {formattedPrintDate}</strong>
              </span>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
