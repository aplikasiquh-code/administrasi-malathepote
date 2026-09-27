import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  SchoolProfile, 
  Teacher, 
  Student, 
  ClassGrade, 
  StudentAssessment, 
  DailyClassAttendance, 
  ExtracurricularAssessment, 
  CocurricularProject, 
  ClassRoomItem, 
  StudentReportConfig,
  CurriculumItem
} from '../types';
import { OfficialSchoolKop } from './OfficialSchoolKop';
import { StudentReportCardDocument } from './StudentReportCardDocument';
import { printDocumentWithA4 } from '../utils/exportUtils';
import { 
  calculateStudentGrades, 
  exportStudentSingleReportExcel, 
  exportClassReportRecapExcel,
  CalculatedSubjectGrade
} from '../utils/excelReportCardUtils';
import { 
  getStoredStudentReports, 
  saveStoredStudentReports,
  sanitizeReportDateString
} from '../utils/storage';
import { 
  getStudentAttendanceSummaryFromLogs, 
  determineSemesterFromDate, 
  isAttendanceInSemester, 
  deriveAcademicPeriodFromDate,
  getDefaultReportDateForSemester,
  formatReportDateIndonesian,
  AcademicPeriod,
  AttendanceDetailItem 
} from '../utils/reportAttendanceUtils';
import { 
  BookOpenCheck, 
  BookOpen,
  Printer, 
  Download, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Save, 
  RotateCcw, 
  Award, 
  Calendar, 
  CheckCircle2, 
  FileSpreadsheet, 
  Sparkles, 
  Layers, 
  UserCheck, 
  AlertCircle,
  FileText,
  RefreshCw,
  Activity,
  User,
  HeartPulse,
  Check,
  CheckCheck,
  Zap,
  SlidersHorizontal,
  Users,
  Eye,
  X,
  Info
} from 'lucide-react';

interface StudentReportCardViewProps {
  school: SchoolProfile;
  teachers: Teacher[];
  students: Student[];
  classes: ClassRoomItem[];
  assessments: StudentAssessment[];
  attendance: DailyClassAttendance[];
  curriculum: CurriculumItem[];
  extracurriculars: ExtracurricularAssessment[];
  cocurricularProjects: CocurricularProject[];
  onUpdateStudent?: (student: Student) => void;
  onAddToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  onOpenPrintReports?: (type: 'sampul-rapor' | 'biodata-rapor') => void;
}

type ViewMode = 'single' | 'bulk-print' | 'recap';

export const StudentReportCardView: React.FC<StudentReportCardViewProps> = ({
  school,
  teachers,
  students,
  classes,
  assessments,
  attendance,
  curriculum: _curriculum,
  extracurriculars,
  cocurricularProjects,
  onUpdateStudent,
  onAddToast,
  onOpenPrintReports
}) => {
  // Available classes
  const availableClasses: ClassGrade[] = useMemo(() => {
    if (classes && classes.length > 0) {
      return classes.map(c => c.nama as ClassGrade);
    }
    const set = Array.from(new Set(students.map(s => s.kelas as ClassGrade)));
    return set.length > 0 ? set.sort() : ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
  }, [classes, students]);

  // Semester State (default to school current semester or 'Ganjil')
  const [selectedSemester, setSelectedSemester] = useState<'Ganjil' | 'Genap'>(school.semester || 'Ganjil');
  const [selectedClass, setSelectedClass] = useState<ClassGrade>(availableClasses[0] || '1A');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Stored reports state
  const [savedReports, setSavedReports] = useState<StudentReportConfig[]>(() => {
    return getStoredStudentReports();
  });

  // Filter students in the selected class
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

  // Ensure an active student is selected
  useEffect(() => {
    if (classStudents.length > 0) {
      if (!selectedStudentId || !classStudents.some(s => s.id === selectedStudentId)) {
        setSelectedStudentId(classStudents[0].id);
      }
    } else {
      setSelectedStudentId('');
    }
  }, [classStudents, selectedStudentId]);

  // Currently selected student object
  const activeStudent = useMemo(() => {
    return classStudents.find(s => s.id === selectedStudentId) || classStudents[0] || null;
  }, [classStudents, selectedStudentId]);

  // Active student's report config
  const reportKey = activeStudent ? `${activeStudent.id}_${selectedSemester}_${school.tahunAjaran}` : '';
  const currentReportConfig = useMemo(() => {
    return savedReports.find(r => r.id === reportKey) || null;
  }, [savedReports, reportKey]);

  // Assigned Homeroom Teacher (Wali Kelas)
  const homeroomTeacher = useMemo(() => {
    const matched = teachers.find(t => 
      t.penugasanKelas === `Kelas ${selectedClass}` || 
      t.penugasanKelas === selectedClass ||
      t.jabatan === `Guru Kelas ${selectedClass.charAt(0)}` as any
    );
    return matched || teachers[0] || null;
  }, [teachers, selectedClass]);

  // Helper to compute attendance from logs for any student in this semester
  const getStudentAttendanceFromLogs = useCallback((studentId: string, sem: 'Ganjil' | 'Genap' = selectedSemester) => {
    return getStudentAttendanceSummaryFromLogs(studentId, attendance, sem, school.tahunAjaran);
  }, [attendance, selectedSemester, school.tahunAjaran]);

  // Calculate default attendance from logs for active student in this semester
  const autoCalculatedAttendance = useMemo(() => {
    if (!activeStudent) {
      return { 
        sakit: 0, 
        izin: 0, 
        alpa: 0, 
        hadir: 0, 
        total: 0, 
        totalDaysRecorded: 0, 
        details: [] as AttendanceDetailItem[] 
      };
    }
    return getStudentAttendanceFromLogs(activeStudent.id, selectedSemester);
  }, [activeStudent, selectedSemester, getStudentAttendanceFromLogs]);

  // Attendance Details Modal State
  const [showAttendanceDetailsModal, setShowAttendanceDetailsModal] = useState<boolean>(false);

  // Form State for editing report details
  const [formCatatanWali, setFormCatatanWali] = useState('');
  const [formIsAutoAttendance, setFormIsAutoAttendance] = useState<boolean>(true);
  const [formSakit, setFormSakit] = useState<number>(0);
  const [formIzin, setFormIzin] = useState<number>(0);
  const [formAlpa, setFormAlpa] = useState<number>(0);
  const [formTinggiBadan, setFormTinggiBadan] = useState('');
  const [formBeratBadan, setFormBeratBadan] = useState('');
  const [formCatatanKesehatan, setFormCatatanKesehatan] = useState('');
  const [formKeputusanKenaikan, setFormKeputusanKenaikan] = useState('');
  const [formTanggalRapor, setFormTanggalRapor] = useState('');
  const [formTempatRapor, setFormTempatRapor] = useState(school.kabupatenKota || 'Bangkalan');
  const [syncToStudentData, setSyncToStudentData] = useState<boolean>(true);

  // Settings Scope State: 'single' (siswa aktif) or 'class' (massal 1 kelas)
  const [settingsScope, setSettingsScope] = useState<'single' | 'class'>('single');
  const [classDefaultTanggal, setClassDefaultTanggal] = useState<string>('');
  const [classDefaultTempat, setClassDefaultTempat] = useState<string>(school.kabupatenKota || 'Kota Depok');

  // Safe parsing of academic years (e.g., "2026/2027" -> startYear: 2026, endYear: 2027)
  const academicYears = useMemo(() => {
    const raw = (school.tahunAjaran || '2026/2027').trim();
    const parts = raw.split('/');
    let sY = parseInt(parts[0], 10);
    let eY = parseInt(parts[1], 10);
    if (isNaN(sY) || sY < 2000 || sY > 2100) sY = 2026;
    if (isNaN(eY) || eY <= sY) eY = sY + 1;
    if (eY < 100) eY = 2000 + eY;
    if (eY > 9999) {
      const str = String(eY);
      eY = parseInt(str.slice(-4), 10);
    }
    return { startYear: sY, endYear: eY };
  }, [school.tahunAjaran]);

  // Default report issuance date based on Indonesian school calendar:
  // - Semester Ganjil: 22 Desember tahun awal (misal 2026-12-22 -> 22 Desember 2026)
  // - Semester Genap: 20 Juni tahun akhir (misal 2027-06-20 -> 20 Juni 2027)
  const defaultTanggal = useMemo(() => {
    return getDefaultReportDateForSemester(selectedSemester, school.tahunAjaran || '2026/2027');
  }, [selectedSemester, school.tahunAjaran]);

  // Dynamically derive Semester and Tahun Pelajaran from the active report date:
  // e.g. Jika tanggal rapor 22 Desember 2026 -> Semester Ganjil, Tahun Pelajaran 2026/2027
  // e.g. Jika tanggal rapor 20 Juni 2027 -> Semester Genap, Tahun Pelajaran 2026/2027
  const currentAcademicPeriod = useMemo(() => {
    const effectiveDate = formTanggalRapor || defaultTanggal;
    return deriveAcademicPeriodFromDate(effectiveDate, school.tahunAjaran || '2026/2027');
  }, [formTanggalRapor, defaultTanggal, school.tahunAjaran]);

  // Sync form whenever active student, semester, or stored config changes
  useEffect(() => {
    if (!activeStudent) return;

    const classNum = parseInt(activeStudent.kelas.charAt(0)) || 1;
    const isGrade6 = classNum === 6;
    const defaultKeputusan = isGrade6 
      ? 'LULUS dari Satuan Pendidikan SD' 
      : `NAIK KE KELAS ${classNum + 1}`;

    // Master student default values from student database
    const masterTb = activeStudent.tinggiBadan ? `${activeStudent.tinggiBadan} cm` : '128 cm';
    const masterBb = activeStudent.beratBadan ? `${activeStudent.beratBadan} kg` : '26 kg';
    const masterKes = activeStudent.catatanKesehatan || 'Pendengaran, penglihatan, dan kesehatan gigi dalam kondisi sangat baik.';

    const isAuto = currentReportConfig ? (currentReportConfig.isAutoAttendance !== false) : true;
    setFormIsAutoAttendance(isAuto);

    const safeDate = sanitizeReportDateString(currentReportConfig?.tanggalRapor, academicYears.endYear) || defaultTanggal;
    const safeTempat = currentReportConfig?.tempatRapor || school.kabupatenKota || 'Kota Depok';

    if (currentReportConfig) {
      setFormCatatanWali(currentReportConfig.catatanWaliKelas || 'Menunjukkan sikap yang baik, tekun, dan berprestasi dalam seluruh aktivitas pembelajaran.');
      setFormSakit(isAuto ? autoCalculatedAttendance.sakit : (currentReportConfig.sakitCount !== undefined && currentReportConfig.sakitCount !== null ? currentReportConfig.sakitCount : autoCalculatedAttendance.sakit));
      setFormIzin(isAuto ? autoCalculatedAttendance.izin : (currentReportConfig.izinCount !== undefined && currentReportConfig.izinCount !== null ? currentReportConfig.izinCount : autoCalculatedAttendance.izin));
      setFormAlpa(isAuto ? autoCalculatedAttendance.alpa : (currentReportConfig.alpaCount !== undefined && currentReportConfig.alpaCount !== null ? currentReportConfig.alpaCount : autoCalculatedAttendance.alpa));
      setFormTinggiBadan(currentReportConfig.tinggiBadan || masterTb);
      setFormBeratBadan(currentReportConfig.beratBadan || masterBb);
      setFormCatatanKesehatan(currentReportConfig.catatanKesehatan || masterKes);
      setFormKeputusanKenaikan(currentReportConfig.keputusanKenaikan || defaultKeputusan);
      setFormTanggalRapor(safeDate);
      setFormTempatRapor(safeTempat);
    } else {
      setFormCatatanWali('Menunjukkan sikap yang baik, tekun, dan berprestasi dalam seluruh aktivitas pembelajaran.');
      setFormSakit(autoCalculatedAttendance.sakit);
      setFormIzin(autoCalculatedAttendance.izin);
      setFormAlpa(autoCalculatedAttendance.alpa);
      setFormTinggiBadan(masterTb);
      setFormBeratBadan(masterBb);
      setFormCatatanKesehatan(masterKes);
      setFormKeputusanKenaikan(defaultKeputusan);
      setFormTanggalRapor(defaultTanggal);
      setFormTempatRapor(school.kabupatenKota || 'Kota Depok');
    }

    setClassDefaultTanggal(safeDate);
    setClassDefaultTempat(safeTempat);
  }, [activeStudent, currentReportConfig, selectedSemester, school, autoCalculatedAttendance, defaultTanggal, academicYears.endYear]);

  // Effective Attendance Values for Display and Printing
  const effectiveSakit = formIsAutoAttendance ? autoCalculatedAttendance.sakit : formSakit;
  const effectiveIzin = formIsAutoAttendance ? autoCalculatedAttendance.izin : formIzin;
  const effectiveAlpa = formIsAutoAttendance ? autoCalculatedAttendance.alpa : formAlpa;

  // Toggle Auto Attendance Mode
  const handleToggleAutoAttendance = (enableAuto: boolean) => {
    setFormIsAutoAttendance(enableAuto);
    if (enableAuto) {
      setFormSakit(autoCalculatedAttendance.sakit);
      setFormIzin(autoCalculatedAttendance.izin);
      setFormAlpa(autoCalculatedAttendance.alpa);
      onAddToast(
        'Presensi Otomatis Diaktifkan',
        `Presensi ${activeStudent?.namaLengkap} disinkronkan langsung dengan log kehadiran harian.`,
        'success'
      );
    } else {
      onAddToast(
        'Mode Manual Diaktifkan',
        'Anda dapat menyesuaikan jumlah sakit, izin, dan alpa secara mandiri.',
        'info'
      );
    }
  };

  // Handler to sync attendance immediately from attendance logs
  const handleSyncAttendanceFromLogs = () => {
    setFormIsAutoAttendance(true);
    setFormSakit(autoCalculatedAttendance.sakit);
    setFormIzin(autoCalculatedAttendance.izin);
    setFormAlpa(autoCalculatedAttendance.alpa);
    onAddToast(
      'Presensi Semester Disinkronkan',
      `Data presensi Semester ${selectedSemester} berhasil ditarik: Hadir: ${autoCalculatedAttendance.hadir}, Sakit: ${autoCalculatedAttendance.sakit}, Izin: ${autoCalculatedAttendance.izin}, Alpa: ${autoCalculatedAttendance.alpa} hari (${autoCalculatedAttendance.totalDaysRecorded} log terdata).`,
      'info'
    );
  };

  // Handler to sync entire class attendance to Auto Live Sync
  const handleSyncAllStudentsAttendanceToAuto = () => {
    if (!classStudents.length) return;
    const currentSaved = [...savedReports];

    classStudents.forEach(st => {
      const key = `${st.id}_${selectedSemester}_${school.tahunAjaran}`;
      const existingIdx = currentSaved.findIndex(r => r.id === key);
      const stAtt = getStudentAttendanceFromLogs(st.id, selectedSemester);

      if (existingIdx >= 0) {
        currentSaved[existingIdx] = {
          ...currentSaved[existingIdx],
          isAutoAttendance: true,
          sakitCount: stAtt.sakit,
          izinCount: stAtt.izin,
          alpaCount: stAtt.alpa,
          updatedAt: new Date().toISOString()
        };
      } else {
        const classNum = parseInt(st.kelas.charAt(0)) || 1;
        const isGrade6 = classNum === 6;
        const defaultKeputusan = isGrade6 
          ? 'LULUS dari Satuan Pendidikan SD' 
          : `NAIK KE KELAS ${classNum + 1}`;
        const targetDate = sanitizeReportDateString(formTanggalRapor, academicYears.endYear) || defaultTanggal;
        const targetPlace = formTempatRapor || school.kabupatenKota || 'Bangkalan';

        currentSaved.push({
          id: key,
          studentId: st.id,
          kelas: st.kelas as ClassGrade,
          semester: selectedSemester,
          tahunAjaran: school.tahunAjaran,
          isAutoAttendance: true,
          sakitCount: stAtt.sakit,
          izinCount: stAtt.izin,
          alpaCount: stAtt.alpa,
          tinggiBadan: st.tinggiBadan ? `${st.tinggiBadan} cm` : '128 cm',
          beratBadan: st.beratBadan ? `${st.beratBadan} kg` : '26 kg',
          catatanKesehatan: st.catatanKesehatan || 'Kondisi fisik dan kesehatan dalam kondisi baik.',
          catatanWaliKelas: 'Menunjukkan sikap yang baik, tekun, dan berprestasi dalam seluruh aktivitas pembelajaran.',
          keputusanKenaikan: defaultKeputusan,
          tanggalRapor: targetDate,
          tempatRapor: targetPlace,
          waliKelasNama: homeroomTeacher?.namaLengkap || 'Guru Kelas',
          waliKelasNip: homeroomTeacher?.nip || '-',
          kepalaSekolahNama: school.kepalaSekolah,
          kepalaSekolahNip: school.nipKepalaSekolah,
          updatedAt: new Date().toISOString()
        });
      }
    });

    setSavedReports(currentSaved);
    saveStoredStudentReports(currentSaved);
    setFormIsAutoAttendance(true);
    setFormSakit(autoCalculatedAttendance.sakit);
    setFormIzin(autoCalculatedAttendance.izin);
    setFormAlpa(autoCalculatedAttendance.alpa);

    onAddToast(
      'Integrasi Presensi 1 Kelas Berhasil',
      `Presensi otomatis aktif untuk seluruh ${classStudents.length} siswa Kelas ${selectedClass}. Log kehadiran akan selalu sinkron.`,
      'success'
    );
  };

  // Handler to apply Class Date & Place to all students in this class
  const handleApplyClassDateAndPlace = () => {
    if (!classStudents.length) return;
    const targetDate = sanitizeReportDateString(classDefaultTanggal || formTanggalRapor, academicYears.endYear) || defaultTanggal;
    const targetPlace = classDefaultTempat || formTempatRapor || school.kabupatenKota || 'Bangkalan';

    const currentSaved = [...savedReports];
    classStudents.forEach(st => {
      const key = `${st.id}_${selectedSemester}_${school.tahunAjaran}`;
      const existingIdx = currentSaved.findIndex(r => r.id === key);
      const stAtt = getStudentAttendanceFromLogs(st.id, selectedSemester);

      if (existingIdx >= 0) {
        currentSaved[existingIdx] = {
          ...currentSaved[existingIdx],
          tanggalRapor: targetDate,
          tempatRapor: targetPlace,
          updatedAt: new Date().toISOString()
        };
      } else {
        const classNum = parseInt(st.kelas.charAt(0)) || 1;
        const isGrade6 = classNum === 6;
        const defaultKeputusan = isGrade6 
          ? 'LULUS dari Satuan Pendidikan SD' 
          : `NAIK KE KELAS ${classNum + 1}`;

        currentSaved.push({
          id: key,
          studentId: st.id,
          kelas: st.kelas as ClassGrade,
          semester: selectedSemester,
          tahunAjaran: school.tahunAjaran,
          isAutoAttendance: true,
          sakitCount: stAtt.sakit,
          izinCount: stAtt.izin,
          alpaCount: stAtt.alpa,
          tinggiBadan: st.tinggiBadan ? `${st.tinggiBadan} cm` : '128 cm',
          beratBadan: st.beratBadan ? `${st.beratBadan} kg` : '26 kg',
          catatanKesehatan: st.catatanKesehatan || 'Kondisi fisik dan kesehatan dalam kondisi baik.',
          catatanWaliKelas: 'Menunjukkan sikap yang baik, tekun, dan berprestasi dalam seluruh aktivitas pembelajaran.',
          keputusanKenaikan: defaultKeputusan,
          tanggalRapor: targetDate,
          tempatRapor: targetPlace,
          waliKelasNama: homeroomTeacher?.namaLengkap || 'Guru Kelas',
          waliKelasNip: homeroomTeacher?.nip || '-',
          kepalaSekolahNama: school.kepalaSekolah,
          kepalaSekolahNip: school.nipKepalaSekolah,
          updatedAt: new Date().toISOString()
        });
      }
    });

    setSavedReports(currentSaved);
    saveStoredStudentReports(currentSaved);
    setFormTanggalRapor(targetDate);
    setFormTempatRapor(targetPlace);

    onAddToast(
      'Pengaturan Rapor Massal Berhasil',
      `Tanggal (${formatReportDate(targetDate)}) & Tempat (${targetPlace}) diterapkan ke ${classStudents.length} siswa Kelas ${selectedClass}.`,
      'success'
    );
  };

  // Handler to sync physical metrics immediately from master student data
  const handleSyncFromStudentData = () => {
    if (!activeStudent) return;
    const tbStr = activeStudent.tinggiBadan ? `${activeStudent.tinggiBadan} cm` : '128 cm';
    const bbStr = activeStudent.beratBadan ? `${activeStudent.beratBadan} kg` : '26 kg';
    const kesStr = activeStudent.catatanKesehatan || 'Pendengaran, penglihatan, dan kesehatan gigi dalam kondisi sangat baik.';
    setFormTinggiBadan(tbStr);
    setFormBeratBadan(bbStr);
    setFormCatatanKesehatan(kesStr);
    onAddToast(
      'Data Siswa Disinkronkan',
      `Tinggi (${tbStr}) dan Berat (${bbStr}) berhasil ditarik dari Buku Induk ${activeStudent.namaLengkap}.`,
      'info'
    );
  };

  // Save current report config
  const handleSaveReportConfig = () => {
    if (!activeStudent) return;
    const safeTanggal = sanitizeReportDateString(formTanggalRapor, academicYears.endYear) || defaultTanggal;
    const safeTempat = formTempatRapor || school.kabupatenKota || 'Bangkalan';

    const newConfig: StudentReportConfig = {
      id: reportKey,
      studentId: activeStudent.id,
      kelas: activeStudent.kelas as ClassGrade,
      semester: selectedSemester,
      tahunAjaran: school.tahunAjaran,
      catatanWaliKelas: formCatatanWali,
      isAutoAttendance: formIsAutoAttendance,
      sakitCount: formIsAutoAttendance ? autoCalculatedAttendance.sakit : formSakit,
      izinCount: formIsAutoAttendance ? autoCalculatedAttendance.izin : formIzin,
      alpaCount: formIsAutoAttendance ? autoCalculatedAttendance.alpa : formAlpa,
      tinggiBadan: formTinggiBadan,
      beratBadan: formBeratBadan,
      catatanKesehatan: formCatatanKesehatan,
      keputusanKenaikan: formKeputusanKenaikan,
      tanggalRapor: safeTanggal,
      tempatRapor: safeTempat,
      waliKelasNama: homeroomTeacher?.namaLengkap || 'Guru Kelas',
      waliKelasNip: homeroomTeacher?.nip || '-',
      kepalaSekolahNama: school.kepalaSekolah,
      kepalaSekolahNip: school.nipKepalaSekolah,
      updatedAt: new Date().toISOString()
    };

    const updated = savedReports.filter(r => r.id !== reportKey);
    updated.push(newConfig);
    setSavedReports(updated);
    saveStoredStudentReports(updated);

    // If enabled, also sync height, weight, and health note back to Master Student Record
    if (syncToStudentData && onUpdateStudent) {
      const parsedTb = parseFloat(formTinggiBadan.replace(/[^\d.]/g, '')) || undefined;
      const parsedBb = parseFloat(formBeratBadan.replace(/[^\d.]/g, '')) || undefined;
      onUpdateStudent({
        ...activeStudent,
        tinggiBadan: parsedTb,
        beratBadan: parsedBb,
        catatanKesehatan: formCatatanKesehatan
      });
    }

    setIsEditingNotes(false);
    onAddToast(
      'Data Rapor Disimpan', 
      `Rapor ${activeStudent.namaLengkap} Semester ${selectedSemester} berhasil diperbarui.${formIsAutoAttendance ? ' Presensi terintegrasi otomatis.' : ''}${syncToStudentData ? ' Fisik disinkronkan ke Data Induk.' : ''}`, 
      'success'
    );
  };

  // Subject Grades for active student
  const activeStudentGrades = useMemo(() => {
    if (!activeStudent) return [];
    return calculateStudentGrades(
      activeStudent, 
      assessments, 
      selectedSemester, 
      75,
      currentReportConfig?.customCompetencies
    );
  }, [activeStudent, assessments, selectedSemester, currentReportConfig]);

  // Extracurriculars for active student in this semester
  const activeStudentEkskuls = useMemo(() => {
    if (!activeStudent) return [];
    const list = extracurriculars.filter(e => 
      e.semester === selectedSemester && 
      e.grades?.some(m => m.studentId === activeStudent.id)
    );
    if (list.length > 0) return list;
    return [{
      id: 'ekskul-def',
      namaEkskul: 'Pramuka (Praja Muda Karana - Wajib)',
      kelas: activeStudent.kelas,
      pembina: 'Pembina Pramuka Gugus Depan SD',
      semester: selectedSemester,
      tahunAjaran: school.tahunAjaran,
      grades: [{
        studentId: activeStudent.id,
        predikat: 'A',
        keterangan: 'Aktif, disiplin, dan terampil dalam seluruh kegiatan kepramukaan.'
      }]
    }] as ExtracurricularAssessment[];
  }, [extracurriculars, activeStudent, selectedSemester, school]);

  // P5 Projects for active student
  const activeStudentP5 = useMemo(() => {
    if (!activeStudent) return [];
    const classNum = activeStudent.kelas.charAt(0);
    const list = cocurricularProjects.filter(p => 
      p.semester === selectedSemester && 
      (p.kelas === activeStudent.kelas || (p.kelas as any) === 'Semua Kelas')
    );
    if (list.length > 0) return list;
    return [{
      id: 'p5-def',
      tema: 'Gaya Hidup Berkelanjutan',
      judulProjek: 'Pengolahan Sampah Organik dan Apotek Hidup Sekolah',
      fase: classNum <= '2' ? 'Fase A (Kelas 1-2)' : classNum <= '4' ? 'Fase B (Kelas 3-4)' : 'Fase C (Kelas 5-6)',
      kelas: activeStudent.kelas,
      semester: selectedSemester,
      tahunAjaran: school.tahunAjaran,
      deskripsiSingkat: 'Menunjukkan kemampuan bergotong royong dan bernalar kritis dalam memelihara lingkungan sekolah.',
      targetElements: [],
      koordinator: 'Koordinator P5',
      studentGrades: [{
        studentId: activeStudent.id,
        ratings: {},
        catatanProses: 'Sangat mandiri dan peduli terhadap kebersihan lingkungan sekitar.'
      }]
    }] as CocurricularProject[];
  }, [cocurricularProjects, activeStudent, selectedSemester, school]);

  // Navigation between students in the class
  const activeStudentIndex = classStudents.findIndex(s => s.id === selectedStudentId);
  const handlePrevStudent = () => {
    if (activeStudentIndex > 0) {
      setSelectedStudentId(classStudents[activeStudentIndex - 1].id);
    }
  };
  const handleNextStudent = () => {
    if (activeStudentIndex < classStudents.length - 1) {
      setSelectedStudentId(classStudents[activeStudentIndex + 1].id);
    }
  };

  // Format Indonesian date for report footer
  const formatReportDate = (dateStr: string) => {
    return formatReportDateIndonesian(dateStr);
  };

  // Presets for Catatan Wali Kelas
  const catatanPresets = [
    { label: 'Sangat Berprestasi', text: 'Prestasi belajar sangat memuaskan. Pertahankan kedisiplinan dan teruslah menjadi teladan positif bagi teman-teman.' },
    { label: 'Perkembangan Positif', text: 'Menunjukkan peningkatan yang sangat baik dalam memahami materi. Terus tingkatkan keaktifan diskusi di kelas.' },
    { label: 'Disiplin & Santun', text: 'Sangat santun, rajin, dan berakhlak mulia. Terus tingkatkan kemampuan literasi dan numerasi secara konsisten.' },
    { label: 'Perlu Pendampingan', text: 'Perlu bimbingan lebih dalam fokus belajar dan latihan soal mandiri di rumah. Terus semangat dan jangan ragu bertanya.' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Navigation Header (Hidden on Print) */}
      <div className="print:hidden bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Buku Rapor Resmi SD
              </span>
              <span className="text-xs text-slate-400">Kurikulum Merdeka & K13</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <BookOpenCheck className="w-6 h-6 text-amber-400" />
              Laporan Hasil Belajar Peserta Didik (Rapor)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Penerbitan dan pencetakan buku rapor semester ganjil dan genap lengkap dengan capaian kompetensi, ekskul, P5, presensi, serta keterangan kenaikan kelas.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                if (activeStudent) {
                  exportStudentSingleReportExcel(
                    activeStudent,
                    school,
                    selectedSemester,
                    activeStudentGrades,
                    currentReportConfig || undefined,
                    extracurriculars,
                    cocurricularProjects,
                    attendance
                  );
                  onAddToast('Ekspor Excel Berhasil', `Rapor siswa ${activeStudent.namaLengkap} telah diunduh.`, 'success');
                }
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Unduh Lembar Rapor Siswa ke Excel (.xlsx)"
            >
              <Download className="w-4 h-4" />
              <span>Rapor Excel</span>
            </button>

            <button
              onClick={() => {
                exportClassReportRecapExcel(
                  selectedClass,
                  classStudents,
                  school,
                  selectedSemester,
                  assessments,
                  savedReports,
                  attendance
                );
                onAddToast('Ekspor Rekap Berhasil', `File rekap rapor kelas ${selectedClass} semester ${selectedSemester} telah diunduh.`, 'success');
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Unduh Rekap Nilai Rapor Satu Kelas ke Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Rekap Kelas Excel</span>
            </button>

            <button
              onClick={() => {
                if (viewMode === 'recap') {
                  printDocumentWithA4({
                    orientation: 'landscape',
                    title: `Rekap_Nilai_Rapor_Kelas_${selectedClass}_Semester_${selectedSemester}_${school.tahunAjaran.replace(/[^a-zA-Z0-9]/g, '-')}`
                  });
                } else if (viewMode === 'bulk-print') {
                  printDocumentWithA4({
                    orientation: 'portrait',
                    title: `Rapor_Kolektif_Kelas_${selectedClass}_Semester_${selectedSemester}_${school.tahunAjaran.replace(/[^a-zA-Z0-9]/g, '-')}`
                  });
                } else {
                  printDocumentWithA4({
                    orientation: 'portrait',
                    title: `Rapor_SD_Kelas_${selectedClass}_Semester_${selectedSemester}_${activeStudent?.namaLengkap.replace(/[^a-zA-Z0-9]/g, '_') || 'Siswa'}_NISN_${activeStudent?.nisn || ''}`
                  });
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
              title="Cetak via Printer atau Simpan ke file PDF standar A4 (Pilih Tujuan: 'Simpan sebagai PDF')"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF (A4)</span>
            </button>

            {onOpenPrintReports && (
              <button
                onClick={() => onOpenPrintReports('sampul-rapor')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                title="Buka Cetak Sampul Rapor (Halaman 1) dan Keterangan Diri Siswa (Halaman 2)"
              >
                <BookOpen className="w-4 h-4" />
                <span>Sampul & Keterangan Diri</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters and Semester Selector Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Semester Selector Pill */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-300">Pilih Semester:</span>
            <div className="inline-flex p-1 bg-slate-800 rounded-xl border border-slate-700/80">
              <button
                onClick={() => setSelectedSemester('Ganjil')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedSemester === 'Ganjil'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Semester Ganjil (1)
              </button>
              <button
                onClick={() => setSelectedSemester('Genap')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedSemester === 'Genap'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Semester Genap (2 / Kenaikan)
              </button>
            </div>
          </div>

          {/* Class & View Mode */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Class Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Kelas:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as ClassGrade)}
                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
              >
                {availableClasses.map(c => (
                  <option key={c} value={c}>Kelas {c}</option>
                ))}
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="inline-flex p-1 bg-slate-800 rounded-xl border border-slate-700/80">
              <button
                onClick={() => setViewMode('single')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'single'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Per Siswa
              </button>
              <button
                onClick={() => setViewMode('bulk-print')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'bulk-print'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Cetak Satu Kelas
              </button>
              <button
                onClick={() => setViewMode('recap')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'recap'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tabel Rekap
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RECAP TABLE VIEW */}
      {viewMode === 'recap' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm a4-landscape-sheet print:bg-white print:border-none print:shadow-none print:p-0">
          {/* Print-Only Header */}
          <div className="hidden print:block p-4 pb-2">
            <OfficialSchoolKop school={school} documentTitle="REKAPITULASI BUKU RAPOR" />
            <div className="text-center my-3">
              <h2 className="text-base font-bold uppercase underline">
                REKAPITULASI BUKU RAPOR KELAS {selectedClass}
              </h2>
              <p className="text-xs text-black mt-0.5">
                Semester {selectedSemester} • Tahun Pelajaran {school.tahunAjaran}
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between print:hidden">
            <div>
              <h3 className="font-bold text-white text-sm">
                Rekapitulasi Buku Rapor Kelas {selectedClass} — Semester {selectedSemester}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rangkuman pencapaian nilai seluruh siswa kelas {selectedClass} TP {school.tahunAjaran}.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-300 font-medium">
                Total Siswa: <span className="text-amber-400 font-bold">{classStudents.length}</span>
              </div>
              <button
                onClick={() => {
                  printDocumentWithA4({
                    orientation: 'landscape',
                    title: `Rekap_Buku_Rapor_Kelas_${selectedClass}_Semester_${selectedSemester}`
                  });
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Cetak format A4 Landscape atau Simpan PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Rekap A4</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left text-xs border-collapse print:text-black print:border print:border-black print:text-[10px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/60 text-slate-400 text-[11px] font-semibold uppercase print:bg-gray-100 print:text-black print:border-b-2 print:border-black">
                  <th className="py-3 px-3 text-center w-10 print:border print:border-gray-400">No</th>
                  <th className="py-3 px-3 w-28 print:border print:border-gray-400">NISN</th>
                  <th className="py-3 px-4 min-w-[180px] print:border print:border-gray-400">Nama Siswa</th>
                  <th className="py-3 px-2 text-center w-10 print:border print:border-gray-400">L/P</th>
                  <th className="py-3 px-3 text-center w-20 print:border print:border-gray-400">Rata-rata NA</th>
                  <th className="py-3 px-2 text-center w-12 print:border print:border-gray-400" title="Sakit (hari)">S</th>
                  <th className="py-3 px-2 text-center w-12 print:border print:border-gray-400" title="Izin (hari)">I</th>
                  <th className="py-3 px-2 text-center w-12 print:border print:border-gray-400" title="Alpa / Tanpa Keterangan (hari)">A</th>
                  <th className="py-3 px-3 text-center w-28 print:border print:border-gray-400" title="Tinggi & Berat Badan">Fisik (TB/BB)</th>
                  <th className="py-3 px-3 text-center w-36 print:border print:border-gray-400">
                    {selectedSemester === 'Genap' ? 'Keputusan Kenaikan' : 'Status Ketuntasan'}
                  </th>
                  <th className="py-3 px-3 text-center w-24 print:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-y-0">
                {classStudents.map((st, idx) => {
                  const grades = calculateStudentGrades(st, assessments, selectedSemester);
                  const valid = grades.map(g => g.nilaiAkhir).filter((v): v is number => v !== null);
                  const avg = valid.length > 0 ? Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10 : null;
                  const cfg = savedReports.find(r => r.id === `${st.id}_${selectedSemester}_${school.tahunAjaran}`);
                  const classNum = parseInt(st.kelas.charAt(0)) || 1;
                  const isGrade6 = classNum === 6;
                  const status = selectedSemester === 'Genap'
                    ? (cfg?.keputusanKenaikan || (isGrade6 ? 'LULUS' : `NAIK KE KELAS ${classNum + 1}`))
                    : (avg !== null && avg >= 75 ? 'Tuntas' : 'Perlu Pendampingan');

                  const stAtt = getStudentAttendanceFromLogs(st.id, selectedSemester);
                  const isAuto = cfg?.isAutoAttendance !== false;
                  const sakitVal = isAuto ? stAtt.sakit : (cfg?.sakitCount !== undefined && cfg?.sakitCount !== null ? cfg.sakitCount : stAtt.sakit);
                  const izinVal = isAuto ? stAtt.izin : (cfg?.izinCount !== undefined && cfg?.izinCount !== null ? cfg.izinCount : stAtt.izin);
                  const alpaVal = isAuto ? stAtt.alpa : (cfg?.alpaCount !== undefined && cfg?.alpaCount !== null ? cfg.alpaCount : stAtt.alpa);

                  const tbVal = cfg?.tinggiBadan || (st.tinggiBadan ? `${st.tinggiBadan} cm` : '-');
                  const bbVal = cfg?.beratBadan || (st.beratBadan ? `${st.beratBadan} kg` : '-');

                  return (
                    <tr key={`${st.id}-${idx}`} className="hover:bg-slate-800/40 transition-colors print:border print:border-gray-300">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono print:text-black print:border print:border-gray-300">{idx + 1}</td>
                      <td className="py-2.5 px-3 text-slate-300 font-mono print:text-black print:border print:border-gray-300">{st.nisn}</td>
                      <td className="py-2.5 px-4 font-semibold text-white print:text-black print:border print:border-gray-300">{st.namaLengkap}</td>
                      <td className="py-2.5 px-2 text-center text-slate-400 print:text-black print:border print:border-gray-300">{st.jenisKelamin}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-300 font-mono print:text-black print:border print:border-gray-300">
                        {avg !== null ? avg : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-300 font-mono print:text-black print:border print:border-gray-300">{sakitVal}</td>
                      <td className="py-2.5 px-2 text-center text-slate-300 font-mono print:text-black print:border print:border-gray-300">{izinVal}</td>
                      <td className="py-2.5 px-2 text-center text-slate-300 font-mono print:text-black print:border print:border-gray-300">{alpaVal}</td>
                      <td className="py-2.5 px-3 text-center text-slate-300 text-xs font-mono print:text-black print:border print:border-gray-300">{tbVal} / {bbVal}</td>
                      <td className="py-2.5 px-3 text-center print:border print:border-gray-300">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold print:text-black print:bg-transparent ${
                          status.includes('NAIK') || status.includes('LULUS') || status === 'Tuntas'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center print:hidden">
                        <button
                          onClick={() => {
                            setSelectedStudentId(st.id);
                            setViewMode('single');
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium hover:underline cursor-pointer"
                        >
                          Buka Rapor
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Signatures for Print on Recap */}
          <div className="hidden print:grid grid-cols-2 gap-8 text-xs text-center text-black pt-8 px-6 pb-6 mt-6 border-t border-gray-400 break-inside-avoid">
            <div className="text-center">
              <p>Mengetahui,</p>
              <p className="font-semibold">Kepala Sekolah</p>
              <div className="h-20" />
              <p className="font-bold underline">{school.kepalaSekolah}</p>
              <p className="text-[11px] font-mono text-gray-700">NIP. {school.nipKepalaSekolah}</p>
            </div>
            <div className="text-center">
              <p>{formTempatRapor}, {formatReportDate(formTanggalRapor)}</p>
              <p className="font-semibold">Guru Kelas {selectedClass}</p>
              <div className="h-20" />
              <p className="font-bold underline">{homeroomTeacher?.namaLengkap || 'Guru Kelas'}</p>
              <p className="text-[11px] font-mono text-gray-700">NIP. {homeroomTeacher?.nip || '-'}</p>
            </div>
          </div>
        </div>
      )}

      {/* BULK PRINT PREVIEW VIEW */}
      {viewMode === 'bulk-print' && (
        <div className="space-y-6">
          <div className="print:hidden bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Mode Pratinjau Cetak Seluruh Kelas {selectedClass}</h4>
                <p className="text-xs text-slate-400">
                  {classStudents.length} siswa akan dicetak berurutan. Setiap lembar siswa otomatis dipisah saat dicetak.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                printDocumentWithA4({
                  orientation: 'portrait',
                  title: `Rapor_Kolektif_Kelas_${selectedClass}_Semester_${selectedSemester}`
                });
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Mulai Cetak ({classStudents.length} Siswa) [A4]</span>
            </button>
          </div>

          <div className="space-y-8">
            {classStudents.map((student, idx) => {
              const studentGrades = calculateStudentGrades(student, assessments, selectedSemester);
              const studentCfg = savedReports.find(r => r.id === `${student.id}_${selectedSemester}_${school.tahunAjaran}`);
              const studentClassNum = parseInt(student.kelas.charAt(0)) || 1;
              const studentFase = studentClassNum <= 2 ? 'Fase A' : studentClassNum <= 4 ? 'Fase B' : 'Fase C';
              const isGrade6 = studentClassNum === 6;

              const batchDate = studentCfg?.tanggalRapor || classDefaultTanggal || defaultTanggal;
              const batchPeriod = deriveAcademicPeriodFromDate(batchDate, school.tahunAjaran || '2026/2027');

              const stAtt = getStudentAttendanceFromLogs(student.id, selectedSemester);
              const isAuto = studentCfg?.isAutoAttendance !== false;
              const bSakit = isAuto ? stAtt.sakit : (studentCfg?.sakitCount !== undefined && studentCfg?.sakitCount !== null ? studentCfg.sakitCount : stAtt.sakit);
              const bIzin = isAuto ? stAtt.izin : (studentCfg?.izinCount !== undefined && studentCfg?.izinCount !== null ? studentCfg.izinCount : stAtt.izin);
              const bAlpa = isAuto ? stAtt.alpa : (studentCfg?.alpaCount !== undefined && studentCfg?.alpaCount !== null ? studentCfg.alpaCount : stAtt.alpa);
              const bTb = studentCfg?.tinggiBadan || (student.tinggiBadan ? `${student.tinggiBadan} cm` : '128 cm');
              const bBb = studentCfg?.beratBadan || (student.beratBadan ? `${student.beratBadan} kg` : '26 kg');
              const bKes = studentCfg?.catatanKesehatan || student.catatanKesehatan || 'Pendengaran, penglihatan, dan kesehatan gigi dalam kondisi sangat baik.';
              const bCatatan = studentCfg?.catatanWaliKelas || 'Menunjukkan perkembangan belajar dan pembentukan karakter yang sangat baik.';
              const bKeputusan = studentCfg?.keputusanKenaikan || (isGrade6 ? 'LULUS DARI SATUAN PENDIDIKAN SD' : `NAIK KE KELAS ${studentClassNum + 1}`);

              // Extracurriculars for this student
              const studentEkskuls = extracurriculars.filter(e => 
                e.semester === selectedSemester && 
                e.grades?.some(m => m.studentId === student.id)
              );

              // P5 Projects for this student
              const studentP5 = cocurricularProjects.filter(p => 
                p.semester === selectedSemester && 
                (p.kelas === student.kelas || (p.kelas as any) === 'Semua Kelas')
              );

              return (
                <div key={`${student.id}-${idx}`} className="max-w-4xl mx-auto mb-8 print:mb-0">
                  <StudentReportCardDocument
                    student={student}
                    school={school}
                    academicPeriod={batchPeriod}
                    studentFase={studentFase}
                    studentGrades={studentGrades}
                    ekskuls={studentEkskuls.length > 0 ? studentEkskuls : activeStudentEkskuls}
                    p5Projects={studentP5.length > 0 ? studentP5 : activeStudentP5}
                    attendance={{
                      sakit: bSakit,
                      izin: bIzin,
                      alpa: bAlpa
                    }}
                    physicalAndHealth={{
                      tinggiBadan: bTb,
                      beratBadan: bBb,
                      catatanKesehatan: bKes
                    }}
                    catatanWaliKelas={bCatatan}
                    keputusanKenaikan={bKeputusan}
                    homeroomTeacher={homeroomTeacher}
                    tempatRapor={studentCfg?.tempatRapor || classDefaultTempat || school.kabupatenKota}
                    tanggalRapor={batchDate}
                    isBulkPrint={true}
                    isLastInBulk={idx === classStudents.length - 1}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SINGLE STUDENT VIEW & INTERACTIVE EDITING */}
      {viewMode === 'single' && activeStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:block print:w-full print:gap-0">
          {/* Left Column: Student Selector List (Hidden on Print) */}
          <div className="print:hidden lg:col-span-1 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  Daftar Siswa ({classStudents.length})
                </h3>
              </div>

              {/* Search input */}
              <div className="mt-3 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari siswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Student items */}
              <div className="mt-3 space-y-1 max-h-[500px] overflow-y-auto pr-1">
                {classStudents
                  .filter(s => s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery))
                  .map((st, idx) => {
                    const isSelected = st.id === selectedStudentId;
                    return (
                      <button
                        key={`${st.id}-${idx}`}
                        onClick={() => {
                          setSelectedStudentId(st.id);
                          setIsEditingNotes(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          {st.fotoUrl ? (
                            <img 
                              src={st.fotoUrl} 
                              alt={st.namaLengkap} 
                              className="w-7 h-7 rounded-lg object-cover border border-slate-700/80 shrink-0" 
                            />
                          ) : (
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              isSelected ? 'bg-slate-900 text-amber-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {st.namaLengkap.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate">{idx + 1}. {st.namaLengkap}</p>
                            <p className={`text-[10px] font-mono mt-0.5 truncate ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                              NISN: {st.nisn}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isSelected ? 'bg-slate-900/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                          {st.jenisKelamin}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Quick Edit Config Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Edit3 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                      Pengaturan Rapor
                    </h4>
                    <p className="text-[10px] text-slate-400">Terintegrasi Presensi Otomatis & Data Siswa</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingNotes(!isEditingNotes)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 font-semibold transition-colors cursor-pointer"
                >
                  {isEditingNotes ? 'Tutup' : 'Ubah Data'}
                </button>
              </div>

              {/* Scope Switcher: Siswa Ini vs Massal 1 Kelas */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setSettingsScope('single')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    settingsScope === 'single'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3 h-3" />
                  <span className="truncate">Siswa Ini</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsScope('class')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    settingsScope === 'class'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3 h-3" />
                  <span className="truncate">Massal Kelas {selectedClass}</span>
                </button>
              </div>

              {settingsScope === 'class' ? (
                /* Class-Wide Batch Settings */
                <div className="space-y-3 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">Integrasi Presensi 1 Kelas</h5>
                        <p className="text-[10px] text-slate-400">Hubungkan rapor ke log presensi harian</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Aktifkan presensi otomatis untuk seluruh <strong>{classStudents.length} siswa</strong> di Kelas {selectedClass}. Nilai Sakit, Izin, dan Alpa akan disinkronkan secara langsung dari catatan kehadiran harian.
                    </p>
                    <button
                      type="button"
                      onClick={handleSyncAllStudentsAttendanceToAuto}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Terapkan Presensi Otomatis ({classStudents.length} Siswa)</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">Seragamkan Tanggal & Tempat Terbit</h5>
                        <p className="text-[10px] text-slate-400">Samakan titimangsa rapor sekelas</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-400 block mb-0.5 text-[10px]">Tanggal Terbit:</label>
                        <input
                          type="date"
                          value={classDefaultTanggal}
                          onChange={(e) => {
                            const newDate = e.target.value;
                            setClassDefaultTanggal(newDate);
                            if (newDate) {
                              const period = deriveAcademicPeriodFromDate(newDate, school.tahunAjaran);
                              if (period.semester !== selectedSemester) {
                                setSelectedSemester(period.semester);
                                onAddToast(
                                  'Semester Disesuaikan Otomatis',
                                  `Tanggal ${formatReportDateIndonesian(newDate)} terdeteksi sebagai ${period.labelLengkap}. Semester kelas disinkronkan ke ${period.semester}.`,
                                  'info'
                                );
                              }
                            }
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        {classDefaultTanggal && (
                          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                            <span className="text-slate-400">Periode:</span>
                            <span className="font-semibold text-amber-300">
                              Semester {deriveAcademicPeriodFromDate(classDefaultTanggal, school.tahunAjaran).semester} • TP {deriveAcademicPeriodFromDate(classDefaultTanggal, school.tahunAjaran).tahunAjaran}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-0.5 text-[10px]">Tempat Terbit:</label>
                        <input
                          type="text"
                          value={classDefaultTempat}
                          onChange={(e) => setClassDefaultTempat(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyClassDateAndPlace}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Terapkan Tanggal & Tempat ke Semua Siswa</span>
                    </button>
                  </div>
                </div>
              ) : isEditingNotes ? (
                /* Edit Mode for Active Student */
                <div className="space-y-4 text-xs">
                  {/* Presensi Integration Section */}
                  <div className={`p-3 rounded-xl border space-y-2.5 transition-all ${
                    formIsAutoAttendance
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                      : 'bg-amber-950/20 border-amber-500/40'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className={`w-4 h-4 ${formIsAutoAttendance ? 'text-emerald-400' : 'text-amber-400'}`} />
                        <span className="font-bold text-white text-xs">
                          Presensi Semester {selectedSemester}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleSyncAttendanceFromLogs}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-800/60 flex items-center gap-1 transition-colors cursor-pointer"
                          title={`Tarik data kehadiran Semester ${selectedSemester} dari log`}
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>Tarik Log</span>
                        </button>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                          formIsAutoAttendance
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {formIsAutoAttendance ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>Otomatis (Live Sync)</span>
                            </>
                          ) : (
                            <span>Manual (Override)</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Mode Toggle Switch */}
                    <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleToggleAutoAttendance(true)}
                        className={`py-1 px-2 rounded font-semibold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                          formIsAutoAttendance
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Zap className="w-3 h-3" />
                        <span>Otomatis (Presensi)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleAutoAttendance(false)}
                        className={`py-1 px-2 rounded font-semibold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                          !formIsAutoAttendance
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        <span>Ubah Manual</span>
                      </button>
                    </div>

                    {/* Live Presensi Stats */}
                    <div className="grid grid-cols-4 gap-1.5 text-center bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Hadir</span>
                        <span className="font-mono font-bold text-emerald-400 text-xs">{autoCalculatedAttendance.hadir}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Sakit</span>
                        <span className="font-mono font-bold text-blue-400 text-xs">
                          {formIsAutoAttendance ? autoCalculatedAttendance.sakit : formSakit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Izin</span>
                        <span className="font-mono font-bold text-amber-400 text-xs">
                          {formIsAutoAttendance ? autoCalculatedAttendance.izin : formIzin}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Alpa</span>
                        <span className="font-mono font-bold text-rose-400 text-xs">
                          {formIsAutoAttendance ? autoCalculatedAttendance.alpa : formAlpa}
                        </span>
                      </div>
                    </div>

                    {/* Semester Log Info & Details Trigger */}
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-400 px-1 pt-0.5">
                      <span>
                        Periode: <strong className="text-slate-200">Semester {selectedSemester}</strong> ({selectedSemester === 'Ganjil' ? 'Bulan 7–12' : 'Bulan 1–6'}, TP {school.tahunAjaran})
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAttendanceDetailsModal(true)}
                        className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold underline decoration-dotted transition-colors cursor-pointer"
                        title="Lihat tanggal dan rincian catatan kehadiran semester ini"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Lihat Rincian ({autoCalculatedAttendance.details.length})</span>
                      </button>
                    </div>

                    {formIsAutoAttendance ? (
                      <p className="text-[10px] text-emerald-300/90 leading-relaxed bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/40">
                        ✓ Nilai ketidakhadiran di rapor otomatis disinkronkan dari catatan presensi semester <strong>{selectedSemester}</strong> siswa ({autoCalculatedAttendance.totalDaysRecorded} log terdata).
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-slate-400 block mb-0.5 text-[10px]">Sakit (hari):</label>
                            <input
                              type="number"
                              min={0}
                              value={formSakit}
                              onChange={(e) => setFormSakit(parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-white font-mono text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 block mb-0.5 text-[10px]">Izin (hari):</label>
                            <input
                              type="number"
                              min={0}
                              value={formIzin}
                              onChange={(e) => setFormIzin(parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-white font-mono text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 block mb-0.5 text-[10px]">Alpa (hari):</label>
                            <input
                              type="number"
                              min={0}
                              value={formAlpa}
                              onChange={(e) => setFormAlpa(parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-white font-mono text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleAutoAttendance(true)}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
                        >
                          ← Kembalikan ke Presensi Otomatis
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Fisik & Data Siswa Integration */}
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-300 font-bold flex items-center gap-1.5 text-[11px]">
                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Fisik & Buku Induk Siswa</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleSyncFromStudentData}
                        title="Tarik data tinggi & berat badan dari fitur Buku Induk Siswa"
                        className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/50 px-2 py-0.5 rounded border border-cyan-700/50 font-medium transition-colors cursor-pointer"
                      >
                        <User className="w-2.5 h-2.5" />
                        <span>Tarik Data Siswa</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-slate-400 block mb-0.5 text-[10px]">Tinggi Badan:</label>
                        <input
                          type="text"
                          value={formTinggiBadan}
                          onChange={(e) => setFormTinggiBadan(e.target.value)}
                          placeholder="Contoh: 130 cm"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-mono text-xs focus:ring-1 focus:ring-cyan-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-0.5 text-[10px]">Berat Badan:</label>
                        <input
                          type="text"
                          value={formBeratBadan}
                          onChange={(e) => setFormBeratBadan(e.target.value)}
                          placeholder="Contoh: 28 kg"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-mono text-xs focus:ring-1 focus:ring-cyan-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-0.5 text-[10px]">Catatan Kondisi Kesehatan:</label>
                      <input
                        type="text"
                        value={formCatatanKesehatan}
                        onChange={(e) => setFormCatatanKesehatan(e.target.value)}
                        placeholder="Penglihatan, pendengaran, gigi dalam kondisi baik"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-xs focus:ring-1 focus:ring-cyan-500 outline-none"
                      />
                    </div>

                    {/* Dual-sync checkbox to student master data */}
                    <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={syncToStudentData}
                        onChange={(e) => setSyncToStudentData(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-cyan-500 w-3.5 h-3.5"
                      />
                      <span className="text-[10px] text-cyan-300">
                        Sinkronkan TB, BB & Kesehatan ke Buku Induk Siswa saat simpan
                      </span>
                    </label>
                  </div>

                  {/* Catatan Wali Kelas Presets */}
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-[11px]">Catatan Wali Kelas:</label>
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {catatanPresets.map(cp => (
                        <button
                          key={cp.label}
                          type="button"
                          onClick={() => setFormCatatanWali(cp.text)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors"
                        >
                          {cp.label}
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={3}
                      value={formCatatanWali}
                      onChange={(e) => setFormCatatanWali(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none focus:ring-1 focus:ring-amber-500 text-xs leading-relaxed"
                    />
                  </div>

                  {/* Kenaikan Kelas (Semester Genap) */}
                  {selectedSemester === 'Genap' && (
                    <div>
                      <label className="text-amber-400 font-semibold block mb-1 text-[11px]">Keputusan Kenaikan / Kelulusan:</label>
                      <input
                        type="text"
                        value={formKeputusanKenaikan}
                        onChange={(e) => setFormKeputusanKenaikan(e.target.value)}
                        className="w-full bg-slate-800 border border-amber-500/50 rounded-lg p-1.5 text-white text-xs font-semibold focus:ring-1 focus:ring-amber-400 outline-none"
                      />
                    </div>
                  )}

                  {/* Tanggal & Tempat Rapor */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-0.5 text-[10px]">Tanggal Rapor:</label>
                      <input
                        type="date"
                        value={formTanggalRapor}
                        onChange={(e) => {
                          const newDate = e.target.value;
                          setFormTanggalRapor(newDate);
                          if (newDate) {
                            const period = deriveAcademicPeriodFromDate(newDate, school.tahunAjaran);
                            if (period.semester !== selectedSemester) {
                              setSelectedSemester(period.semester);
                              onAddToast(
                                'Semester Disesuaikan Otomatis',
                                `Tanggal ${formatReportDateIndonesian(newDate)} terdeteksi sebagai ${period.labelLengkap}. Semester rapor disinkronkan ke ${period.semester}.`,
                                'info'
                              );
                            }
                          }
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-0.5 text-[10px]">Tempat Terbit:</label>
                      <input
                        type="text"
                        value={formTempatRapor}
                        onChange={(e) => setFormTempatRapor(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Indikator Kaidah Kalender Pendidikan */}
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-700/60 text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        <span>Kaidah Semester Rapor:</span>
                      </span>
                      <span className="font-semibold text-amber-300 text-[11px]">
                        {currentAcademicPeriod.labelLengkap}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-slate-800">
                      <span>Rentang Kalender:</span>
                      <span className="text-slate-300">
                        {currentAcademicPeriod.semester === 'Ganjil' ? 'Juli — Desember' : 'Januari — Juni'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveReportConfig}
                    className="w-full mt-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Pengaturan Rapor Siswa</span>
                  </button>
                </div>
              ) : (
                /* Read-Only Summary View for Active Student */
                <div className="space-y-2.5 text-xs text-slate-300">
                  {/* Presensi summary */}
                  <div className={`p-2.5 rounded-xl border space-y-1.5 ${
                    formIsAutoAttendance
                      ? 'bg-emerald-950/20 border-emerald-600/30'
                      : 'bg-slate-800/60 border-slate-800'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 font-semibold flex items-center gap-1.5 text-xs">
                        <UserCheck className={`w-3.5 h-3.5 ${formIsAutoAttendance ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span>Presensi Semester {selectedSemester}:</span>
                      </span>
                      <span className="font-mono text-amber-300 font-bold">
                        S: {effectiveSakit} | I: {effectiveIzin} | A: {effectiveAlpa}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      <span>Status Presensi:</span>
                      {formIsAutoAttendance ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" /> Otomatis dari Log Presensi (Hadir: {autoCalculatedAttendance.hadir})
                        </span>
                      ) : (
                        <span className="text-amber-400 font-medium">
                          Penyesuaian Manual (Log: S:{autoCalculatedAttendance.sakit} I:{autoCalculatedAttendance.izin} A:{autoCalculatedAttendance.alpa})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Fisik & Data Siswa summary */}
                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Fisik (TB / BB):</span>
                      </span>
                      <span className="font-mono text-cyan-300 font-bold">{formTinggiBadan} / {formBeratBadan}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 pt-0.5 border-t border-slate-800/80">
                      <span>Data Induk Siswa:</span>
                      <span className="text-slate-300 font-mono">
                        {activeStudent?.tinggiBadan ? `${activeStudent.tinggiBadan} cm` : '-'} / {activeStudent?.beratBadan ? `${activeStudent.beratBadan} kg` : '-'}
                      </span>
                    </div>
                  </div>

                  {selectedSemester === 'Genap' && (
                    <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400 text-[11px]">Keputusan Kenaikan:</span>
                      <span className="text-emerald-400 font-bold text-xs">{formKeputusanKenaikan}</span>
                    </div>
                  )}

                  {/* Titimangsa & Kaidah Periode Rapor */}
                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>Titimangsa Rapor:</span>
                      </span>
                      <span className="text-white font-medium">
                        {formTempatRapor}, {formatReportDate(formTanggalRapor || defaultTanggal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5 border-t border-slate-800/80">
                      <span>Format Semester:</span>
                      <span className="text-amber-300 font-semibold">
                        {currentAcademicPeriod.labelLengkap}
                      </span>
                    </div>
                  </div>

                  <div className="pt-0.5">
                    <span className="text-slate-400 block mb-1 text-[11px]">Catatan Wali Kelas:</span>
                    <p className="text-[11px] text-slate-300 italic bg-slate-800/60 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                      "{formCatatanWali}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Ubah Pengaturan</span>
                    </button>
                    <button
                      onClick={() => setSettingsScope('class')}
                      className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>Aksi 1 Kelas</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Official Printable Report Card Sheet */}
          <div className="lg:col-span-3 print:w-full print:block print:p-0 print:m-0">
            {/* Student Pagination Controls (Hidden on Print) */}
            <div className="print:hidden mb-4 flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl">
              <button
                onClick={handlePrevStudent}
                disabled={activeStudentIndex <= 0}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Siswa Sebelumnya</span>
              </button>

              <div className="text-center text-xs">
                <span className="font-bold text-white">{activeStudent.namaLengkap}</span>
                <span className="text-slate-400 ml-2">({activeStudentIndex + 1} dari {classStudents.length} Siswa)</span>
              </div>

              <button
                onClick={handleNextStudent}
                disabled={activeStudentIndex >= classStudents.length - 1}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200"
              >
                <span>Siswa Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* THE OFFICIAL REPORT CARD DOCUMENT (2 LEMBAR STANDAR KURIKULUM MERDEKA) */}
            <div className="max-w-4xl mx-auto">
              <StudentReportCardDocument
                containerId="official-student-report-card"
                student={activeStudent}
                school={school}
                academicPeriod={currentAcademicPeriod}
                studentFase={parseInt(activeStudent.kelas.charAt(0)) <= 2 ? 'Fase A' : parseInt(activeStudent.kelas.charAt(0)) <= 4 ? 'Fase B' : 'Fase C'}
                studentGrades={activeStudentGrades}
                ekskuls={activeStudentEkskuls}
                p5Projects={activeStudentP5}
                attendance={{
                  sakit: effectiveSakit,
                  izin: effectiveIzin,
                  alpa: effectiveAlpa
                }}
                physicalAndHealth={{
                  tinggiBadan: formTinggiBadan,
                  beratBadan: formBeratBadan,
                  catatanKesehatan: formCatatanKesehatan
                }}
                catatanWaliKelas={formCatatanWali}
                keputusanKenaikan={formKeputusanKenaikan}
                homeroomTeacher={homeroomTeacher}
                tempatRapor={formTempatRapor}
                tanggalRapor={formTanggalRapor || defaultTanggal}
              />
            </div>
          </div>
        </div>
      )}
      {/* Attendance Details Modal */}
      {showAttendanceDetailsModal && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Rincian Presensi Semester {selectedSemester}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activeStudent.namaLengkap} • Kelas {activeStudent.kelas} (TP {school.tahunAjaran})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAttendanceDetailsModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Counters */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                <span className="text-[10px] text-emerald-400 block font-medium">Hadir</span>
                <span className="text-sm font-bold text-emerald-300 font-mono">{autoCalculatedAttendance.hadir}</span>
              </div>
              <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-800/40">
                <span className="text-[10px] text-blue-400 block font-medium">Sakit</span>
                <span className="text-sm font-bold text-blue-300 font-mono">{autoCalculatedAttendance.sakit}</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-800/40">
                <span className="text-[10px] text-amber-400 block font-medium">Izin</span>
                <span className="text-sm font-bold text-amber-300 font-mono">{autoCalculatedAttendance.izin}</span>
              </div>
              <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-800/40">
                <span className="text-[10px] text-rose-400 block font-medium">Alpa</span>
                <span className="text-sm font-bold text-rose-300 font-mono">{autoCalculatedAttendance.alpa}</span>
              </div>
            </div>

            {/* Period Info Note */}
            <div className="text-[11px] text-slate-300 bg-slate-800/70 p-2.5 rounded-xl border border-slate-700/60 leading-relaxed">
              <span className="font-semibold text-amber-400">Ketentuan Periode Semester {selectedSemester}: </span>
              {selectedSemester === 'Ganjil'
                ? 'Mencakup catatan kehadiran bulan Juli hingga Desember (Bulan 7–12)'
                : 'Mencakup catatan kehadiran bulan Januari hingga Juni (Bulan 1–6)'} pada Tahun Ajaran {school.tahunAjaran}. Total tercatat: <strong>{autoCalculatedAttendance.totalDaysRecorded} hari log kehadiran</strong>.
            </div>

            {/* List of records */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[42vh]">
              {autoCalculatedAttendance.details.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl space-y-2">
                  <AlertCircle className="w-7 h-7 text-amber-400 mx-auto opacity-80" />
                  <p className="font-bold text-slate-200">Belum ada catatan presensi untuk Semester {selectedSemester}</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Data kehadiran dapat dicatat setiap hari pada menu <strong>Presensi Siswa</strong>, atau Anda dapat memasukkan angka Sakit, Izin, dan Alpa secara manual pada form pengaturan rapor.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                      <th className="py-2 px-2">Tanggal</th>
                      <th className="py-2 px-2 text-center">Status</th>
                      <th className="py-2 px-2">Keterangan / Alasan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {autoCalculatedAttendance.details.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2 px-2 font-mono text-[11px] text-slate-300">{item.tanggal}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'Hadir'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : item.status === 'Sakit'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : item.status === 'Izin'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-slate-300 text-[11px]">
                          {item.keterangan || item.catatanKelas || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAttendanceDetailsModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
