import React, { useState, useMemo } from 'react';
import { 
  Student, 
  Teacher, 
  SchoolProfile, 
  ClassGrade, 
  DailyClassAttendance, 
  AttendanceStatus, 
  AttendanceRecordItem,
  ClassRoomItem
} from '../types';
import { 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Users, 
  UserCheck, 
  UserX, 
  FileSpreadsheet, 
  Download, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  AlertTriangle, 
  HeartHandshake, 
  Save, 
  Zap, 
  Phone,
  CalendarDays,
  Sparkles,
  Info,
  Check,
  CheckCheck,
  UserMinus,
  RotateCcw,
  Ban
} from 'lucide-react';
import { exportDailyAttendanceToExcel, exportMonthlyAttendanceRecapExcel } from '../utils/excelAttendanceUtils';
import { OfficialSchoolKop } from './OfficialSchoolKop';
import { 
  getDayScheduleInfo, 
  getEffectiveSchoolDaysInMonth, 
  formatIndonesianFullDate,
  INDONESIAN_HOLIDAYS_MAP,
  HolidayInfo
} from '../utils/indonesianCalendarUtils';

interface StudentAttendanceViewProps {
  students: Student[];
  teachers: Teacher[];
  school: SchoolProfile;
  attendanceList: DailyClassAttendance[];
  classes?: ClassRoomItem[];
  onOpenClassModal?: () => void;
  onSaveAttendance: (attendance: DailyClassAttendance) => void;
  onBatchUpdateAttendance: (attendanceList: DailyClassAttendance[]) => void;
  onAddToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

const DEFAULT_CLASS_LIST: ClassGrade[] = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];

export const StudentAttendanceView: React.FC<StudentAttendanceViewProps> = ({
  students,
  teachers,
  school,
  attendanceList,
  classes = [],
  onOpenClassModal,
  onSaveAttendance,
  onBatchUpdateAttendance,
  onAddToast
}) => {
  const dynamicClassList: ClassGrade[] = useMemo(() => {
    if (classes && classes.length > 0) {
      return classes.map(c => c.nama as ClassGrade);
    }
    const studentClasses = Array.from(new Set(students.map(s => s.kelas as ClassGrade)));
    return studentClasses.length > 0 ? studentClasses.sort() : DEFAULT_CLASS_LIST;
  }, [classes, students]);

  // Navigation View: 'daily' | 'monthly' | 'stats'
  const [subView, setSubView] = useState<'daily' | 'monthly' | 'stats'>('daily');

  // Selected Filter States
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedClass, setSelectedClass] = useState<ClassGrade>(dynamicClassList[0] || '1A');
  const [searchQuery, setSearchQuery] = useState('');

  // Monthly Matrix States
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(7); // 7 = August (0-indexed)

  // Local draft records for currently selected date & class
  const [draftRecords, setDraftRecords] = useState<Record<string, { status: AttendanceStatus | null; keterangan: string }>>({});
  const [catatanKelas, setCatatanKelas] = useState('');
  const [guruPenginput, setGuruPenginput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Day Schedule Info for Selected Date (6-day work week & Indonesia Holidays)
  const currentDaySchedule = useMemo(() => {
    return getDayScheduleInfo(selectedDate);
  }, [selectedDate]);

  // Filter Active Students in selected class
  const activeClassStudents = useMemo(() => {
    const seen = new Set<string>();
    return students.filter(s => {
      if (s.kelas !== selectedClass || s.statusSiswa !== 'Aktif') return false;
      if (!s.id || seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [students, selectedClass]);

  // Find existing attendance for selected date & class
  const currentAttendance = useMemo(() => {
    return attendanceList.find(a => a.tanggal === selectedDate && a.kelas === selectedClass);
  }, [attendanceList, selectedDate, selectedClass]);

  // Sync draft when date or class changes
  React.useEffect(() => {
    const recordsMap: Record<string, { status: AttendanceStatus | null; keterangan: string }> = {};
    
    if (currentAttendance) {
      currentAttendance.records.forEach(r => {
        recordsMap[r.studentId] = {
          status: r.status,
          keterangan: r.keterangan || ''
        };
      });
      setCatatanKelas(currentAttendance.catatanKelas || '');
      setGuruPenginput(currentAttendance.guruPenginput || '');
      setIsSaved(true);
    } else {
      // Default to 'Hadir' if school day, else empty notes
      activeClassStudents.forEach(s => {
        recordsMap[s.id] = {
          status: 'Hadir',
          keterangan: ''
        };
      });
      setCatatanKelas('');
      
      // Auto-assign Homeroom Teacher if exists
      const homeroom = teachers.find(t => t.penugasanKelas.includes(selectedClass) || t.jabatan.includes(selectedClass.charAt(0)));
      setGuruPenginput(homeroom ? homeroom.namaLengkap : (teachers[0]?.namaLengkap || 'Wali Kelas'));
      setIsSaved(false);
    }

    setDraftRecords(recordsMap);
  }, [selectedDate, selectedClass, currentAttendance, activeClassStudents, teachers]);

  // Handlers for changing single student status
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setDraftRecords(prev => {
      const currentStatus = prev[studentId]?.status;
      // Toggle off if clicked again
      const newStatus = currentStatus === status ? null : status;
      return {
        ...prev,
        [studentId]: {
          ...(prev[studentId] || { keterangan: '' }),
          status: newStatus
        }
      };
    });
    setIsSaved(false);
  };

  const handleKeteranganChange = (studentId: string, keterangan: string) => {
    setDraftRecords(prev => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || 'Hadir',
        keterangan
      }
    }));
    setIsSaved(false);
  };

  // Quick Action 1: Set all to 'Hadir'
  const handleSetAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus | null; keterangan: string }> = {};
    activeClassStudents.forEach(s => {
      updated[s.id] = {
        status: 'Hadir',
        keterangan: ''
      };
    });
    setDraftRecords(updated);
    setIsSaved(false);
    onAddToast('Presensi Diperbarui', `Seluruh siswa kelas ${selectedClass} ditandai Hadir.`, 'success');
  };

  // Quick Action 2: Set Non Presensi (Kosongkan Status / Non-Presensi Hari Ini)
  const handleSetNonAttendance = () => {
    const updated: Record<string, { status: AttendanceStatus | null; keterangan: string }> = {};
    activeClassStudents.forEach(s => {
      updated[s.id] = {
        status: null,
        keterangan: ''
      };
    });
    setDraftRecords(updated);
    setCatatanKelas('');

    // If an attendance record for this day and class already exists in the database, remove it
    if (currentAttendance) {
      onBatchUpdateAttendance(
        attendanceList.filter(a => !(a.tanggal === selectedDate && a.kelas === selectedClass))
      );
    }

    setIsSaved(true);
    onAddToast(
      'Set Non-Presensi', 
      `Presensi kelas ${selectedClass} tanggal ${formatIndonesianFullDate(selectedDate)} diset sebagai Non-Presensi.`, 
      'info'
    );
  };

  // Calculations for current class on current date
  const counts = useMemo(() => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;
    let nonPresensi = 0;

    activeClassStudents.forEach(s => {
      const rec = draftRecords[s.id];
      const st = rec?.status;
      if (st === 'Hadir') hadir++;
      else if (st === 'Sakit') sakit++;
      else if (st === 'Izin') izin++;
      else if (st === 'Alpa') alpa++;
      else nonPresensi++;
    });

    const total = activeClassStudents.length;
    const totalFilled = hadir + sakit + izin + alpa;
    const percentage = totalFilled > 0 ? Math.round((hadir / totalFilled) * 100) : 0;
    const isAllNonPresensi = totalFilled === 0;

    return { hadir, sakit, izin, alpa, nonPresensi, total, totalFilled, percentage, isAllNonPresensi };
  }, [activeClassStudents, draftRecords]);

  // Save current attendance
  const handleSave = () => {
    if (counts.isAllNonPresensi) {
      if (currentAttendance) {
        onBatchUpdateAttendance(
          attendanceList.filter(a => !(a.tanggal === selectedDate && a.kelas === selectedClass))
        );
      }
      setIsSaved(true);
      onAddToast('Presensi Non-Presensi', `Kelas ${selectedClass} pada ${selectedDate} disimpan tanpa presensi.`, 'info');
      return;
    }

    const records: AttendanceRecordItem[] = [];
    activeClassStudents.forEach(s => {
      const draft = draftRecords[s.id];
      if (draft && draft.status) {
        records.push({
          studentId: s.id,
          status: draft.status,
          keterangan: draft.keterangan.trim() || undefined
        });
      }
    });

    const monthNum = parseInt(selectedDate.split('-')[1], 10) || 7;
    const derivedSemester: 'Ganjil' | 'Genap' = (monthNum >= 7 && monthNum <= 12) ? 'Ganjil' : 'Genap';

    const newAttendance: DailyClassAttendance = {
      id: currentAttendance?.id || `att-${selectedDate}-${selectedClass}`,
      tanggal: selectedDate,
      kelas: selectedClass,
      records,
      catatanKelas: catatanKelas.trim() || undefined,
      guruPenginput: guruPenginput.trim() || undefined,
      semester: currentAttendance?.semester || derivedSemester,
      tahunAjaran: currentAttendance?.tahunAjaran || school.tahunAjaran,
      updatedAt: new Date().toISOString()
    };

    onSaveAttendance(newAttendance);
    setIsSaved(true);
    onAddToast('Presensi Disimpan', `Presensi kelas ${selectedClass} tanggal ${selectedDate} berhasil disimpan.`, 'success');
  };

  // Filtered students for search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return activeClassStudents;
    const q = searchQuery.toLowerCase();
    return activeClassStudents.filter(
      s => s.namaLengkap.toLowerCase().includes(q) || s.nisn.includes(q) || s.nis.includes(q)
    );
  }, [activeClassStudents, searchQuery]);

  // Navigation helpers for dates
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().slice(0, 10));
  };

  // Monthly Matrix data calculations
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const daysInSelectedMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;

  // Month effective days calculation
  const monthlyEffectiveSummary = useMemo(() => {
    return getEffectiveSchoolDaysInMonth(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const monthlyClassRecords = useMemo(() => {
    return attendanceList.filter(
      a => a.kelas === selectedClass && a.tanggal.startsWith(monthPrefix)
    );
  }, [attendanceList, selectedClass, monthPrefix]);

  const monthlyStudentSummaries = useMemo(() => {
    return activeClassStudents.map(student => {
      let h = 0;
      let s = 0;
      let i = 0;
      let a = 0;

      const dayStatuses: Record<number, { code: string; keterangan?: string; schedule: ReturnType<typeof getDayScheduleInfo> }> = {};

      for (let day = 1; day <= daysInSelectedMonth; day++) {
        const dateStr = `${monthPrefix}-${String(day).padStart(2, '0')}`;
        const daySchedule = getDayScheduleInfo(dateStr);
        const dayRecord = monthlyClassRecords.find(r => r.tanggal === dateStr);
        const studentRecord = dayRecord?.records.find(r => r.studentId === student.id);

        if (studentRecord) {
          if (studentRecord.status === 'Hadir') { 
            dayStatuses[day] = { code: 'H', schedule: daySchedule }; 
            h++; 
          } else if (studentRecord.status === 'Sakit') { 
            dayStatuses[day] = { code: 'S', keterangan: studentRecord.keterangan, schedule: daySchedule }; 
            s++; 
          } else if (studentRecord.status === 'Izin') { 
            dayStatuses[day] = { code: 'I', keterangan: studentRecord.keterangan, schedule: daySchedule }; 
            i++; 
          } else if (studentRecord.status === 'Alpa') { 
            dayStatuses[day] = { code: 'A', keterangan: studentRecord.keterangan, schedule: daySchedule }; 
            a++; 
          }
        } else if (dayRecord && daySchedule.isSchoolDay) {
          dayStatuses[day] = { code: 'H', schedule: daySchedule };
          h++;
        } else if (daySchedule.isSunday) {
          dayStatuses[day] = { code: 'M', keterangan: 'Libur Hari Minggu', schedule: daySchedule };
        } else if (daySchedule.isHoliday) {
          dayStatuses[day] = { 
            code: daySchedule.holidayInfo?.isCutiBersama ? 'CB' : 'LN', 
            keterangan: daySchedule.holidayInfo?.name,
            schedule: daySchedule
          };
        } else {
          dayStatuses[day] = { code: '-', schedule: daySchedule };
        }
      }

      const totalRecorded = h + s + i + a;
      const rate = totalRecorded > 0 ? Math.round((h / totalRecorded) * 100) : 100;

      return {
        student,
        h,
        s,
        i,
        a,
        totals: {
          H: h,
          S: s,
          I: i,
          A: a
        },
        attendancePercentage: rate,
        totalRecorded,
        rate,
        dayStatuses
      };
    });
  }, [activeClassStudents, daysInSelectedMonth, monthPrefix, monthlyClassRecords, selectedYear, selectedMonth]);

  // Overall statistics across whole school for selected date
  const schoolWideTodayStats = useMemo(() => {
    let totalActive = 0;
    let totalHadir = 0;
    let totalSakit = 0;
    let totalIzin = 0;
    let totalAlpa = 0;

    const classBreakdown = dynamicClassList.map(grade => {
      const cStudents = students.filter(s => s.kelas === grade && s.statusSiswa === 'Aktif');
      const att = attendanceList.find(a => a.tanggal === selectedDate && a.kelas === grade);
      
      let h = 0, s = 0, i = 0, a = 0;
      if (att) {
        cStudents.forEach(st => {
          const rec = att.records?.find(r => r.studentId === st.id);
          const status = rec?.status || 'Hadir';
          if (status === 'Hadir') h++;
          else if (status === 'Sakit') s++;
          else if (status === 'Izin') i++;
          else if (status === 'Alpa') a++;
        });
      }

      totalActive += cStudents.length;
      totalHadir += h;
      totalSakit += s;
      totalIzin += i;
      totalAlpa += a;

      const recorded = !!att;
      const percent = cStudents.length > 0 && recorded ? Math.round((h / cStudents.length) * 100) : (recorded ? 100 : 0);

      return {
        grade,
        totalStudents: cStudents.length,
        hadir: h,
        sakit: s,
        izin: i,
        alpa: a,
        recorded,
        percent
      };
    });

    const recordedClassesCount = classBreakdown.filter(c => c.recorded).length;
    const overallRate = totalActive > 0 && recordedClassesCount > 0 ? Math.round((totalHadir / totalActive) * 100) : 0;

    return {
      totalActive,
      totalHadir,
      totalSakit,
      totalIzin,
      totalAlpa,
      overallRate,
      recordedClassesCount,
      classBreakdown
    };
  }, [students, attendanceList, selectedDate]);

  // Students with high absentees in the selected month
  const highAbsenteeStudents = useMemo(() => {
    const list: { student: Student; totalAlpha: number; totalSick: number; totalIzin: number; totalDays: number }[] = [];
    
    // Scan all active students
    const active = students.filter(s => s.statusSiswa === 'Aktif');
    active.forEach(student => {
      const recordsForStudent = attendanceList.filter(
        a => a.kelas === student.kelas && a.tanggal.startsWith(monthPrefix)
      );

      let alpha = 0;
      let sick = 0;
      let izin = 0;

      recordsForStudent.forEach(att => {
        const rec = att.records?.find(r => r.studentId === student.id);
        if (rec?.status === 'Alpa') alpha++;
        if (rec?.status === 'Sakit') sick++;
        if (rec?.status === 'Izin') izin++;
      });

      if (alpha >= 1 || sick >= 2 || (alpha + sick + izin) >= 3) {
        list.push({
          student,
          totalAlpha: alpha,
          totalSick: sick,
          totalIzin: izin,
          totalDays: alpha + sick + izin
        });
      }
    });

    return list.sort((a, b) => (b.totalAlpha * 3 + b.totalDays) - (a.totalAlpha * 3 + a.totalDays));
  }, [students, attendanceList, monthPrefix]);

  return (
    <div className="animate-in fade-in duration-200">
      <div className="space-y-6 print:hidden">
        {/* Top Banner & Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex flex-wrap items-center gap-2">
                  Presensi & Absensi Siswa
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    6 Hari Kerja Sekolah (Senin - Sabtu)
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Sistem pencatatan kehadiran resmi SD berstandar Indonesia: 6 hari aktif belajar per minggu dengan integrasi otomatis kalender libur nasional & cuti bersama.
                </p>
              </div>
            </div>
          </div>

          {/* Subview Tabs */}
          <div className="flex items-center bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 self-start md:self-auto">
            <button
              onClick={() => setSubView('daily')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                subView === 'daily'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Input Harian</span>
            </button>
            <button
              onClick={() => setSubView('monthly')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                subView === 'monthly'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Rekap Bulanan (Matrix)</span>
            </button>
            <button
              onClick={() => setSubView('stats')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                subView === 'stats'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Statistik & Monitoring</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBVIEW 1: INPUT PRESENSI HARIAN                                          */}
      {/* ========================================================================= */}
      {subView === 'daily' && (
        <div className="space-y-5">
          
          {/* Calendar Status Banner for Selected Date */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md transition-colors ${
            currentDaySchedule.isHoliday 
              ? 'bg-rose-950/40 border-rose-800/60 text-rose-200' 
              : currentDaySchedule.isSunday
              ? 'bg-slate-900 border-slate-700 text-slate-300'
              : currentDaySchedule.isSaturday
              ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
              : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                currentDaySchedule.isHoliday 
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : currentDaySchedule.isSunday
                  ? 'bg-slate-800 border-slate-700 text-slate-400'
                  : currentDaySchedule.isSaturday
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              }`}>
                {currentDaySchedule.dayName.slice(0, 3)}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
                  <span>{formatIndonesianFullDate(selectedDate)}</span>
                  {currentDaySchedule.isSchoolDay ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      {currentDaySchedule.isSaturday ? 'Hari Efektif (Sabtu)' : 'Hari Efektif Belajar'}
                    </span>
                  ) : currentDaySchedule.isHoliday ? (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      currentDaySchedule.holidayInfo?.isCutiBersama 
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' 
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {currentDaySchedule.holidayInfo?.isCutiBersama ? 'Cuti Bersama' : 'Hari Libur Nasional'}
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold border border-slate-700">
                      Libur Akhir Pekan (Minggu)
                    </span>
                  )}
                </div>
                <div className="text-xs opacity-90 mt-0.5">
                  {currentDaySchedule.isHoliday ? (
                    <span className="font-semibold text-rose-300">
                      Kalender Indonesia: {currentDaySchedule.holidayInfo?.name}
                    </span>
                  ) : currentDaySchedule.isSunday ? (
                    <span>Hari Minggu bukan hari kegiatan belajar mengajar.</span>
                  ) : currentDaySchedule.isSaturday ? (
                    <span>Hari Sabtu merupakan hari efektif belajar ke-6 pada jadwal 6 hari kerja sekolah.</span>
                  ) : (
                    <span>Jadwal kegiatan belajar mengajar aktif normal.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick 6-Day Work Week Info Badge */}
            <div className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-700/60 shrink-0 text-slate-300 flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sistem: <strong>6 Hari Sekolah</strong> (Sen - Sab)</span>
            </div>
          </div>

          {/* Controls Bar: Date & Class Selector + 2 Quick Action Buttons */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Date Picker Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-2 py-1">
                <button
                  onClick={handlePrevDay}
                  title="Hari Sebelumnya"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 px-2">
                  <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-white font-mono text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer"
                  />
                </div>
                <button
                  onClick={handleNextDay}
                  title="Hari Berikutnya"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleSetToday}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 transition-colors"
              >
                Hari Ini
              </button>

              <span className={`text-xs px-2.5 py-1.5 rounded-xl font-medium border flex items-center gap-1.5 ${
                isSaved 
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60' 
                  : 'bg-amber-950/40 text-amber-300 border-amber-800/60'
              }`}>
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sudah Tersimpan</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ada Perubahan Belum Disimpan</span>
                  </>
                )}
              </span>
            </div>

            {/* Quick Actions (Separated: Set Semua Hadir & Set Non Presensi) */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Function 1: Set Semua Hadir */}
              <button
                type="button"
                onClick={handleSetAllPresent}
                title="Tandai seluruh siswa kelas ini Hadir"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Set Semua Hadir</span>
              </button>

              {/* Function 2: Set Non Presensi */}
              <button
                type="button"
                onClick={handleSetNonAttendance}
                title="Kosongkan / Non-aktifkan presensi kelas pada tanggal ini"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/35 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <UserMinus className="w-3.5 h-3.5 text-rose-400" />
                <span>Set Non Presensi</span>
              </button>

              <button
                onClick={() => exportDailyAttendanceToExcel(selectedDate, selectedClass, activeClassStudents, currentAttendance, school)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                title="Unduh format spreadsheet Excel (.xlsx)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simpan Excel</span>
              </button>

              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer ml-auto sm:ml-0"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Presensi</span>
              </button>
            </div>
          </div>

          {/* Class Selectors Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            <span className="text-xs font-bold text-slate-400 shrink-0 px-2">Rombel / Kelas:</span>
            {dynamicClassList.map(grade => {
              const isSelected = selectedClass === grade;
              const hasAtt = attendanceList.some(a => a.tanggal === selectedDate && a.kelas === grade);
              const countInGrade = students.filter(s => s.kelas === grade && s.statusSiswa === 'Aktif').length;
              
              return (
                <button
                  key={grade}
                  onClick={() => setSelectedClass(grade)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>Kelas {grade}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-emerald-950/60 text-emerald-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {countInGrade}
                  </span>
                  {hasAtt && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" title="Sudah diisi" />
                  )}
                </button>
              );
            })}
            {onOpenClassModal && (
              <button
                type="button"
                onClick={onOpenClassModal}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors whitespace-nowrap shrink-0"
              >
                + Kelola Rombel
              </button>
            )}
          </div>

          {/* Summary Metric Cards for Selected Class */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Siswa</div>
              <div className="text-xl sm:text-2xl font-black text-white flex items-center justify-between">
                <span>{counts.total}</span>
                <Users className="w-5 h-5 text-slate-500" />
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Kelas {selectedClass} Aktif</div>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-800/40 p-3.5 rounded-2xl">
              <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">Hadir (H)</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-300 flex items-center justify-between">
                <span>{counts.hadir}</span>
                <UserCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-[10px] text-emerald-400/80 mt-1">
                {counts.isAllNonPresensi ? 'Non-Presensi' : `${counts.percentage}% Kehadiran`}
              </div>
            </div>

            <div className="bg-amber-950/30 border border-amber-800/40 p-3.5 rounded-2xl">
              <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1">Sakit (S)</div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 flex items-center justify-between">
                <span>{counts.sakit}</span>
                <HeartHandshake className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-[10px] text-amber-400/80 mt-1">Surat / Keterangan</div>
            </div>

            <div className="bg-sky-950/30 border border-sky-800/40 p-3.5 rounded-2xl">
              <div className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider mb-1">Izin (I)</div>
              <div className="text-xl sm:text-2xl font-black text-sky-300 flex items-center justify-between">
                <span>{counts.izin}</span>
                <Clock className="w-5 h-5 text-sky-400" />
              </div>
              <div className="text-[10px] text-sky-400/80 mt-1">Pemberitahuan Ortu</div>
            </div>

            <div className="bg-rose-950/30 border border-rose-800/40 p-3.5 rounded-2xl">
              <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider mb-1">Alpa (A)</div>
              <div className="text-xl sm:text-2xl font-black text-rose-300 flex items-center justify-between">
                <span>{counts.alpa}</span>
                <UserX className="w-5 h-5 text-rose-400" />
              </div>
              <div className="text-[10px] text-rose-400/80 mt-1">Tanpa Kabar</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Status Kehadiran</div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {counts.isAllNonPresensi ? (
                  <span className="text-slate-400 text-base">Non-Presensi</span>
                ) : (
                  `${counts.percentage}%`
                )}
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    counts.isAllNonPresensi 
                      ? 'bg-slate-700' 
                      : counts.percentage >= 90 
                      ? 'bg-emerald-500' 
                      : counts.percentage >= 75 
                      ? 'bg-amber-500' 
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${counts.isAllNonPresensi ? 0 : counts.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Student List & Attendance Marking Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            
            {/* Table Search & Filter Header */}
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Daftar Absensi Siswa Kelas {selectedClass}
                </span>
                <span className="text-xs text-slate-400">
                  ({filteredStudents.length} Siswa)
                </span>
                {counts.isAllNonPresensi && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium border border-slate-700">
                    Mode Non-Presensi
                  </span>
                )}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama / NISN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800/70 border-b border-slate-700 text-slate-300 font-semibold">
                    <th className="py-3 px-3.5 w-12 text-center">No</th>
                    <th className="py-3 px-4 min-w-[200px]">Identitas Siswa</th>
                    <th className="py-3 px-3 w-16 text-center">L/P</th>
                    <th className="py-3 px-4 min-w-[240px] text-center">Status Kehadiran</th>
                    <th className="py-3 px-4 min-w-[220px]">Keterangan / Alasan</th>
                    <th className="py-3 px-3 w-16 text-center">Kontak Ortu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                        Tidak ada data siswa aktif di kelas {selectedClass}.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, idx) => {
                      const record = draftRecords[student.id] || { status: null, keterangan: '' };
                      const isCurrentHadir = record.status === 'Hadir';
                      const isCurrentSakit = record.status === 'Sakit';
                      const isCurrentIzin = record.status === 'Izin';
                      const isCurrentAlpa = record.status === 'Alpa';
                      const isNonPresensi = record.status === null;

                      return (
                        <tr 
                          key={`${student.id}-${idx}`} 
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isCurrentAlpa ? 'bg-rose-950/15' : isCurrentSakit ? 'bg-amber-950/15' : isCurrentIzin ? 'bg-sky-950/15' : isNonPresensi ? 'bg-slate-900/40' : ''
                          }`}
                        >
                          <td className="py-3 px-3.5 text-center text-slate-400 font-mono">
                            {idx + 1}
                          </td>
                          
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs shrink-0">
                                {student.namaLengkap.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-white text-xs truncate">
                                  {student.namaLengkap}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  NISN: {student.nisn} • NIS: {student.nis}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              student.jenisKelamin === 'L' ? 'bg-sky-500/20 text-sky-300' : 'bg-pink-500/20 text-pink-300'
                            }`}>
                              {student.jenisKelamin}
                            </span>
                          </td>

                          {/* Attendance Status Buttons */}
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 max-w-[220px] mx-auto">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'Hadir')}
                                title="Hadir (H)"
                                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                                  isCurrentHadir 
                                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/50' 
                                    : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-700/50'
                                }`}
                              >
                                H
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'Sakit')}
                                title="Sakit (S)"
                                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                                  isCurrentSakit 
                                    ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/50' 
                                    : 'text-slate-400 hover:text-amber-300 hover:bg-slate-700/50'
                                }`}
                              >
                                S
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'Izin')}
                                title="Izin (I)"
                                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                                  isCurrentIzin 
                                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/50' 
                                    : 'text-slate-400 hover:text-sky-300 hover:bg-slate-700/50'
                                }`}
                              >
                                I
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.id, 'Alpa')}
                                title="Alpa (A)"
                                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                                  isCurrentAlpa 
                                    ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/50' 
                                    : 'text-slate-400 hover:text-rose-300 hover:bg-slate-700/50'
                                }`}
                              >
                                A
                              </button>
                            </div>
                          </td>

                          {/* Keterangan Input */}
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              placeholder={
                                isCurrentHadir 
                                  ? 'Catatan khusus (opsional)...' 
                                  : isCurrentSakit 
                                  ? 'Jenis penyakit / surat dokter...' 
                                  : isCurrentIzin 
                                  ? 'Alasan izin dari orang tua...' 
                                  : isCurrentAlpa
                                  ? 'Tanpa keterangan / belum ada kabar'
                                  : 'Status belum ditentukan (Non-Presensi)'
                              }
                              value={record.keterangan || ''}
                              onChange={(e) => handleKeteranganChange(student.id, e.target.value)}
                              className={`w-full px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 border focus:outline-none transition-colors ${
                                isCurrentAlpa || isCurrentSakit || isCurrentIzin
                                  ? 'border-slate-600 text-white focus:border-emerald-500'
                                  : 'border-slate-700/60 text-slate-300 placeholder-slate-600 focus:border-slate-500'
                              }`}
                            />
                          </td>

                          {/* Contact WhatsApp */}
                          <td className="py-3 px-3 text-center">
                            {student.noHpOrtu ? (
                              <a
                                href={`https://wa.me/${student.noHpOrtu.replace(/\D/g, '').replace(/^0/, '62')}`}
                                target="_blank"
                                rel="noreferrer"
                                title={`Hubungi Ortu: ${student.noHpOrtu}`}
                                className="inline-flex p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Meta Bar: Homeroom Teacher & Class Notes */}
            <div className="p-4 bg-slate-800/40 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Guru Penginput / Wali Kelas
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={guruPenginput}
                    onChange={(e) => {
                      setGuruPenginput(e.target.value);
                      setIsSaved(false);
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.namaLengkap}>
                        {t.namaLengkap} - {t.jabatan}
                      </option>
                    ))}
                    {!teachers.some(t => t.namaLengkap === guruPenginput) && guruPenginput && (
                      <option value={guruPenginput}>{guruPenginput}</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Catatan Harian Kelas (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Misal: Seluruh siswa kelas mengikuti senam pagi bersama..."
                  value={catatanKelas}
                  onChange={(e) => {
                    setCatatanKelas(e.target.value);
                    setIsSaved(false);
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBVIEW 2: REKAP BULANAN (MATRIX VIEW)                                     */}
      {/* ========================================================================= */}
      {subView === 'monthly' && (
        <div className="space-y-5">
          
          {/* Calendar Month Summary Card (6-Day School Calendar Info) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Month Selector */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Bulan</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
                >
                  {monthNames.map((m, idx) => (
                    <option key={m} value={idx}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Year Selector */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tahun</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
                >
                  {[2025, 2026, 2027, 2028].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Class Selector */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Kelas</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value as ClassGrade)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-emerald-300 font-bold focus:outline-none focus:border-emerald-500"
                >
                  {dynamicClassList.map(c => (
                    <option key={c} value={c}>Kelas {c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Effective Days Pill */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2">
                <span className="text-slate-400">Hari Belajar Efektif (6 Hari/Mgg):</span>
                <strong className="text-emerald-400">{monthlyEffectiveSummary.totalEffectiveDays} Hari</strong>
              </div>
              <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2">
                <span className="text-slate-400">Libur Nasional/CB:</span>
                <strong className="text-rose-400">{monthlyEffectiveSummary.totalHolidays} Hari</strong>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
              <button
                onClick={() => exportMonthlyAttendanceRecapExcel(selectedYear, selectedMonth, selectedClass, activeClassStudents, attendanceList, school)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs border border-emerald-500/30 transition-colors shadow-md cursor-pointer"
                title="Unduh / Simpan Rekap Bulanan dalam format Excel (.xlsx)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simpan Excel (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* National Holiday list in this selected month if any */}
          {monthlyEffectiveSummary.holidaysInMonth.length > 0 && (
            <div className="bg-rose-950/30 border border-rose-800/50 p-3.5 rounded-2xl text-xs text-rose-200 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <AlertCircle className="w-4 h-4" />
                <span>Daftar Hari Libur & Cuti Bersama Bulan Ini ({monthlyEffectiveSummary.holidaysInMonth.length}):</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {monthlyEffectiveSummary.holidaysInMonth.map((h, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-900/60 border border-rose-700/60 text-[11px]">
                    <strong>{formatIndonesianFullDate(h.date)}</strong>: {h.name} {h.isCutiBersama && '(Cuti Bersama)'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Matrix Grid Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60">
              <div>
                <h3 className="font-bold text-white text-sm">
                  Jurnal Matriks Presensi — Kelas {selectedClass}
                </h3>
                <p className="text-xs text-slate-400">
                  {monthNames[selectedMonth]} {selectedYear} • {monthlyClassRecords.length} hari telah terinput dari total {daysInSelectedMonth} hari
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <strong className="w-3 text-center">H</strong> Hadir
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <strong className="w-3 text-center">S</strong> Sakit
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  <strong className="w-3 text-center">I</strong> Izin
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <strong className="w-3 text-center">A</strong> Alpa
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  <strong className="w-3 text-center">M</strong> Libur Minggu
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                  <strong className="w-3 text-center">LN</strong> Libur Nasional
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300 font-semibold">
                    <th className="py-3 px-2 w-8 text-center sticky left-0 bg-slate-800 z-10">No</th>
                    <th className="py-3 px-3 min-w-[160px] sticky left-8 bg-slate-800 z-10">Nama Siswa</th>
                    <th className="py-3 px-2 w-8 text-center">L/P</th>
                    
                    {/* Days 1 to 31 */}
                    {Array.from({ length: daysInSelectedMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${monthPrefix}-${String(day).padStart(2, '0')}`;
                      const schedule = getDayScheduleInfo(dateStr);

                      return (
                        <th 
                          key={day} 
                          title={
                            schedule.holidayInfo 
                              ? `${schedule.holidayInfo.name} (${schedule.dayName})` 
                              : schedule.isSunday 
                              ? `Minggu (${schedule.date})` 
                              : schedule.isSaturday
                              ? `Sabtu (Hari Efektif Belajar Ke-6)`
                              : `${schedule.dayName}, ${schedule.date}`
                          }
                          className={`py-2 px-1 text-center min-w-[28px] border-r border-slate-800/60 font-mono text-[11px] ${
                            schedule.isHoliday
                              ? 'bg-rose-950/70 text-rose-300 font-bold'
                              : schedule.isSunday
                              ? 'bg-slate-950 text-slate-500'
                              : schedule.isSaturday
                              ? 'bg-amber-950/40 text-amber-300 font-bold'
                              : 'text-slate-300'
                          }`}
                        >
                          <div>{day}</div>
                          <div className="text-[8px] font-sans opacity-70">
                            {schedule.dayName.slice(0, 1)}
                          </div>
                        </th>
                      );
                    })}

                    <th className="py-3 px-2 text-center bg-emerald-950/40 text-emerald-300 font-bold w-10">H</th>
                    <th className="py-3 px-2 text-center bg-amber-950/40 text-amber-300 font-bold w-10">S</th>
                    <th className="py-3 px-2 text-center bg-sky-950/40 text-sky-300 font-bold w-10">I</th>
                    <th className="py-3 px-2 text-center bg-rose-950/40 text-rose-300 font-bold w-10">A</th>
                    <th className="py-3 px-3 text-center bg-slate-800 font-bold min-w-[70px]">% Hadir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {monthlyStudentSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={daysInSelectedMonth + 8} className="py-8 text-center text-slate-500">
                        Tidak ada data siswa aktif pada kelas ini.
                      </td>
                    </tr>
                  ) : (
                    monthlyStudentSummaries.map((item, idx) => {
                      return (
                        <tr key={`${item.student.id}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-2 text-center text-slate-400 font-mono sticky left-0 bg-slate-900 z-10 border-r border-slate-800">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-white truncate max-w-[180px] sticky left-8 bg-slate-900 z-10 border-r border-slate-800">
                            {item.student.namaLengkap}
                          </td>
                          <td className="py-2.5 px-2 text-center text-[10px] text-slate-400">
                            {item.student.jenisKelamin}
                          </td>

                          {/* Day Cells */}
                          {Array.from({ length: daysInSelectedMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayData = item.dayStatuses[day];
                            const code = dayData?.code || '-';
                            const isH = code === 'H';
                            const isS = code === 'S';
                            const isI = code === 'I';
                            const isA = code === 'A';
                            const isM = code === 'M';
                            const isHoliday = code === 'LN' || code === 'CB';

                            return (
                              <td 
                                key={day} 
                                title={dayData?.keterangan || (dayData?.schedule.holidayInfo?.name)}
                                className={`py-2 px-1 text-center font-bold font-mono text-[11px] border-r border-slate-800/40 ${
                                  isH ? 'text-emerald-400' :
                                  isS ? 'text-amber-400 bg-amber-950/20' :
                                  isI ? 'text-sky-400 bg-sky-950/20' :
                                  isA ? 'text-rose-400 bg-rose-950/30' :
                                  isM ? 'text-slate-600 bg-slate-950/60' :
                                  isHoliday ? 'text-rose-400 bg-rose-950/40' :
                                  'text-slate-700'
                                }`}
                              >
                                {code}
                              </td>
                            );
                          })}

                          <td className="py-2.5 px-2 text-center font-bold text-emerald-300 bg-emerald-950/20 font-mono">
                            {item.h}
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold text-amber-300 bg-amber-950/20 font-mono">
                            {item.s}
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold text-sky-300 bg-sky-950/20 font-mono">
                            {item.i}
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold text-rose-300 bg-rose-950/20 font-mono">
                            {item.a}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold font-mono text-white">
                            <span className={`px-2 py-0.5 rounded ${
                              item.rate >= 90 ? 'bg-emerald-500/20 text-emerald-300' :
                              item.rate >= 75 ? 'bg-amber-500/20 text-amber-300' :
                              'bg-rose-500/20 text-rose-300'
                            }`}>
                              {item.rate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBVIEW 3: STATISTIK & MONITORING TINGKAT SEKOLAH                         */}
      {/* ========================================================================= */}
      {subView === 'stats' && (
        <div className="space-y-6">
          
          {/* Top School-Wide Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
              <div className="text-xs font-semibold text-slate-400 mb-1">Tingkat Kehadiran Sekolah Hari Ini</div>
              <div className="text-3xl font-black text-emerald-400 mt-2">
                {schoolWideTodayStats.overallRate}%
              </div>
              <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{schoolWideTodayStats.totalHadir} dari {schoolWideTodayStats.totalActive} total siswa hadir</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
              <div className="text-xs font-semibold text-slate-400 mb-1">Total Izin & Sakit Hari Ini</div>
              <div className="text-3xl font-black text-amber-400 mt-2">
                {schoolWideTodayStats.totalSakit + schoolWideTodayStats.totalIzin}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                {schoolWideTodayStats.totalSakit} Sakit • {schoolWideTodayStats.totalIzin} Izin
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
              <div className="text-xs font-semibold text-slate-400 mb-1">Total Alpa (Tanpa Keterangan)</div>
              <div className="text-3xl font-black text-rose-400 mt-2">
                {schoolWideTodayStats.totalAlpa}
              </div>
              <div className="text-xs text-rose-400/80 mt-2">
                Perlu konfirmasi ke wali murid
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
              <div className="text-xs font-semibold text-slate-400 mb-1">Status Rombel Hari Ini</div>
              <div className="text-3xl font-black text-white mt-2">
                {schoolWideTodayStats.recordedClassesCount} / {dynamicClassList.length}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Kelas telah menyelesaikan presensi
              </div>
            </div>
          </div>

          {/* Breakdown per Class Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>Monitoring Presensi Seluruh Rombel ({formatIndonesianFullDate(selectedDate)})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {schoolWideTodayStats.classBreakdown.map((item) => {
                return (
                  <div
                    key={item.grade}
                    className={`p-4 rounded-2xl border transition-all ${
                      item.recorded 
                        ? 'bg-slate-800/50 border-slate-700/80' 
                        : 'bg-slate-900/40 border-dashed border-slate-800 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-white text-base">Kelas {item.grade}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.recorded 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.recorded ? 'Sudah Input' : 'Belum Input'}
                      </span>
                    </div>

                    <div className="text-2xl font-black text-emerald-400 mb-2">
                      {item.percent}%
                    </div>

                    <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-700/60">
                      <div className="flex justify-between">
                        <span>Hadir:</span>
                        <strong className="text-emerald-300">{item.hadir} / {item.totalStudents}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Sakit / Izin:</span>
                        <strong className="text-amber-300">{item.sakit + item.izin}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Alpa:</span>
                        <strong className="text-rose-400">{item.alpa}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedClass(item.grade);
                        setSubView('daily');
                      }}
                      className="w-full mt-3 py-1.5 text-center text-xs font-bold text-slate-300 hover:text-white bg-slate-700/50 hover:bg-emerald-600 rounded-xl transition-all"
                    >
                      Buka Input Kelas
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Early Warning: Siswa dengan Tingkat Ketidakhadiran Tinggi Bulan Ini */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>Sistem Peringatan Dini Absensi ({monthNames[selectedMonth]} {selectedYear})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Daftar siswa dengan riwayat ketidakhadiran (Alpa / Sakit / Izin) yang memerlukan perhatian khusus atau tindak lanjut wali kelas.
                </p>
              </div>
            </div>

            {highAbsenteeStudents.length === 0 ? (
              <div className="p-8 text-center bg-slate-800/30 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                Tidak ada siswa yang memiliki akumulasi absensi kritis pada bulan ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-800/70 border-b border-slate-700 text-slate-300 font-semibold">
                      <th className="py-3 px-3">Nama Siswa</th>
                      <th className="py-3 px-3">Kelas</th>
                      <th className="py-3 px-3 text-center">Alpa</th>
                      <th className="py-3 px-3 text-center">Sakit</th>
                      <th className="py-3 px-3 text-center">Izin</th>
                      <th className="py-3 px-3 text-center">Total Absen</th>
                      <th className="py-3 px-3 text-center">Tindakan Wali Kelas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {highAbsenteeStudents.map(({ student, totalAlpha, totalSick, totalIzin, totalDays }, idx) => (
                      <tr key={`${student.id}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{student.namaLengkap}</div>
                          <div className="text-[10px] text-slate-400">NISN: {student.nisn}</div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-emerald-400">
                          Kelas {student.kelas}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-rose-400 font-mono">
                          {totalAlpha > 0 ? `${totalAlpha} Hari` : '-'}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-amber-400 font-mono">
                          {totalSick > 0 ? `${totalSick} Hari` : '-'}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-sky-400 font-mono">
                          {totalIzin > 0 ? `${totalIzin} Hari` : '-'}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-white font-mono">
                          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                            {totalDays} Hari
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {student.noHpOrtu ? (
                            <a
                              href={`https://wa.me/${student.noHpOrtu.replace(/\D/g, '').replace(/^0/, '62')}?text=Assalamu'alaikum%20Bapak/Ibu%20Wali%20dari%20${encodeURIComponent(student.namaLengkap)},%20kami%20dari%20pihak%20sekolah%20${encodeURIComponent(school.namaSekolah)}%20ingin%20mengonfirmasi%20kehadiran%20putra/putri%20Bapak/Ibu...`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition-all"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Hubungi Ortu</span>
                            </a>
                          ) : (
                            <span className="text-slate-500 italic">No HP belum ada</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* ========================================================================= */}
      {/* HIDDEN PRINT SHEET SECTION FOR DIRECT BROWSER PRINT                        */}
      {/* ========================================================================= */}
      <div className="hidden print:block print:w-full bg-white text-black p-0 m-0">
        {subView === 'monthly' ? (
          /* MONTHLY MATRIX A4 LANDSCAPE PRINT */
          <div className="a4-landscape-sheet">
            <OfficialSchoolKop school={school} documentTitle="REKAPITULASI PRESENSI BULANAN SISWA" />
            
            <div className="my-3 text-center">
              <h2 className="text-sm font-bold uppercase underline">
                REKAPITULASI PRESENSI BULANAN KELAS {selectedClass}
              </h2>
              <p className="text-[11px] text-black mt-0.5">
                Bulan: <strong>{monthNames[selectedMonth]} {selectedYear}</strong> • Semester {school.semester} TP {school.tahunAjaran}
              </p>
            </div>

            <table className="w-full border-collapse border border-black text-[9px] my-3">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-black p-1 w-6 text-center">No</th>
                  <th className="border border-black p-1 text-left min-w-[120px]">Nama Lengkap</th>
                  <th className="border border-black p-1 w-6 text-center">L/P</th>
                  {Array.from({ length: daysInSelectedMonth }).map((_, i) => (
                    <th key={i + 1} className="border border-black p-0.5 w-5 text-center font-mono">
                      {i + 1}
                    </th>
                  ))}
                  <th className="border border-black p-1 w-6 text-center bg-slate-200">H</th>
                  <th className="border border-black p-1 w-6 text-center bg-slate-200">S</th>
                  <th className="border border-black p-1 w-6 text-center bg-slate-200">I</th>
                  <th className="border border-black p-1 w-6 text-center bg-slate-200">A</th>
                  <th className="border border-black p-1 w-10 text-center bg-slate-200">%</th>
                </tr>
              </thead>
              <tbody>
                {monthlyStudentSummaries.map((item, idx) => (
                  <tr key={`${item.student.id}-${idx}`} className="text-center">
                    <td className="border border-black p-1">{idx + 1}</td>
                    <td className="border border-black p-1 text-left font-medium truncate">{item.student.namaLengkap}</td>
                    <td className="border border-black p-1">{item.student.jenisKelamin}</td>
                    {Array.from({ length: daysInSelectedMonth }).map((_, i) => {
                      const day = i + 1;
                      const code = item.dayStatuses[day]?.code || '-';
                      return (
                        <td key={day} className="border border-black p-0.5 font-mono text-[8px]">
                          {code === '-' ? '' : code}
                        </td>
                      );
                    })}
                    <td className="border border-black p-1 font-bold">{item.totals?.H ?? item.h ?? 0}</td>
                    <td className="border border-black p-1">{(item.totals?.S ?? item.s) || '-'}</td>
                    <td className="border border-black p-1">{(item.totals?.I ?? item.i) || '-'}</td>
                    <td className="border border-black p-1">{(item.totals?.A ?? item.a) || '-'}</td>
                    <td className="border border-black p-1 font-bold">{item.attendancePercentage ?? item.rate ?? 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="grid grid-cols-2 gap-8 mt-6 text-xs text-center break-inside-avoid">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">Kepala {school.namaSekolah}</p>
                <div className="h-14" />
                <p className="font-bold underline">{school.kepalaSekolah || school.namaKepalaSekolah}</p>
                <p>NIP. {school.nipKepalaSekolah}</p>
              </div>
              <div>
                <p>{school.kabupatenKota}, {formatIndonesianFullDate(new Date().toISOString().slice(0, 10))}</p>
                <p className="font-bold">Guru Kelas / Wali Kelas {selectedClass}</p>
                <div className="h-14" />
                <p className="font-bold underline">{teachers.find(t => t.penugasanKelas.includes(selectedClass as any))?.namaLengkap || guruPenginput || 'Guru Kelas'}</p>
                <p>NIP. {teachers.find(t => t.penugasanKelas.includes(selectedClass as any))?.nip || '-'}</p>
              </div>
            </div>
          </div>
        ) : (
          /* DAILY JOURNAL A4 PORTRAIT PRINT */
          <div className="a4-portrait-sheet">
            <OfficialSchoolKop school={school} documentTitle="LEMBAR JURNAL PRESENSI KELAS" />
            
            <div className="my-4 text-center">
              <h2 className="text-base font-bold uppercase">
                JURNAL HARIAN PRESENSI SISWA KELAS {selectedClass}
              </h2>
              <p className="text-xs text-black">
                Hari / Tanggal: <strong>{formatIndonesianFullDate(selectedDate)}</strong> • Semester {school.semester} TP {school.tahunAjaran}
              </p>
            </div>

            <table className="w-full border-collapse border border-black text-xs my-4">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-black p-1 w-8 text-center">No</th>
                  <th className="border border-black p-1 w-28 text-center">NISN / NIS</th>
                  <th className="border border-black p-1 text-left">Nama Siswa</th>
                  <th className="border border-black p-1 w-10 text-center">L/P</th>
                  <th className="border border-black p-1 w-20 text-center">Status</th>
                  <th className="border border-black p-1 text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {activeClassStudents.map((student, idx) => {
                  const rec = draftRecords[student.id];
                  const st = rec?.status || '-';
                  return (
                    <tr key={`${student.id}-${idx}`}>
                      <td className="border border-black p-1 text-center">{idx + 1}</td>
                      <td className="border border-black p-1 text-center font-mono">{student.nisn}</td>
                      <td className="border border-black p-1 font-semibold">{student.namaLengkap}</td>
                      <td className="border border-black p-1 text-center">{student.jenisKelamin}</td>
                      <td className="border border-black p-1 text-center font-bold">{st}</td>
                      <td className="border border-black p-1">{rec?.keterangan || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="grid grid-cols-2 gap-8 mt-8 text-xs text-center break-inside-avoid">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">Kepala {school.namaSekolah}</p>
                <div className="h-16" />
                <p className="font-bold underline">{school.kepalaSekolah || school.namaKepalaSekolah}</p>
                <p>NIP. {school.nipKepalaSekolah}</p>
              </div>
              <div>
                <p>{school.kabupatenKota}, {formatIndonesianFullDate(selectedDate)}</p>
                <p className="font-bold">Guru Penginput / Wali Kelas</p>
                <div className="h-16" />
                <p className="font-bold underline">{guruPenginput || teachers.find(t => t.penugasanKelas.includes(selectedClass as any))?.namaLengkap || 'Guru Kelas'}</p>
                <p>NIP. {teachers.find(t => t.penugasanKelas.includes(selectedClass as any))?.nip || '-'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
