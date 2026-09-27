import { DailyClassAttendance, AttendanceStatus } from '../types';

export interface AttendanceDetailItem {
  tanggal: string;
  status: AttendanceStatus;
  keterangan?: string;
  catatanKelas?: string;
  kelas?: string;
}

export interface StudentSemesterAttendanceSummary {
  sakit: number;
  izin: number;
  alpa: number;
  hadir: number;
  total: number;
  totalDaysRecorded: number;
  details: AttendanceDetailItem[];
}

/**
 * Determine semester ('Ganjil' | 'Genap') from a date string (YYYY-MM-DD).
 * In Indonesian school calendar:
 * - Months 7–12 (July–December) = Semester Ganjil (Semester 1)
 * - Months 1–6 (January–June) = Semester Genap (Semester 2)
 */
export const determineSemesterFromDate = (dateStr?: string): 'Ganjil' | 'Genap' => {
  if (!dateStr) return 'Ganjil';
  const parts = dateStr.trim().split('-');
  const month = parseInt(parts[1], 10);
  if (isNaN(month) || month < 1 || month > 12) return 'Ganjil';
  return (month >= 7 && month <= 12) ? 'Ganjil' : 'Genap';
};

export interface AcademicPeriod {
  semester: 'Ganjil' | 'Genap';
  semesterNumber: 1 | 2;
  semesterRomawi: 'I' | 'II';
  semesterFormatted: string; // e.g. "1 (Satu) / Ganjil"
  tahunAjaran: string; // e.g. "2026/2027"
  startYear: number;
  endYear: number;
  labelLengkap: string; // e.g. "Semester Ganjil Tahun Pelajaran 2026/2027"
}

/**
 * Derives academic period (Semester and Tahun Pelajaran) from a given date.
 * Strictly adheres to Indonesian national curriculum calendar rules:
 * - Dates in Months 7–12 (July–December) of Year Y:
 *     Semester: 'Ganjil' (Semester 1)
 *     Tahun Pelajaran: `${Y}/${Y + 1}` (e.g., 22 Desember 2026 -> Semester Ganjil TP 2026/2027)
 * - Dates in Months 1–6 (January–June) of Year Y:
 *     Semester: 'Genap' (Semester 2)
 *     Tahun Pelajaran: `${Y - 1}/${Y}` (e.g., 20 Juni 2027 -> Semester Genap TP 2026/2027)
 */
export const deriveAcademicPeriodFromDate = (
  dateStr?: string,
  fallbackTahunAjaran?: string
): AcademicPeriod => {
  if (!dateStr || !dateStr.trim()) {
    const rawFallback = (fallbackTahunAjaran || '2026/2027').trim();
    const parts = rawFallback.split('/');
    let sYear = parseInt(parts[0], 10);
    let eYear = parseInt(parts[1], 10);
    if (isNaN(sYear) || sYear < 2000 || sYear > 2100) sYear = 2026;
    if (isNaN(eYear) || eYear <= sYear) eYear = sYear + 1;

    return {
      semester: 'Ganjil',
      semesterNumber: 1,
      semesterRomawi: 'I',
      semesterFormatted: '1 (Satu) / Ganjil',
      tahunAjaran: `${sYear}/${eYear}`,
      startYear: sYear,
      endYear: eYear,
      labelLengkap: `Semester Ganjil Tahun Pelajaran ${sYear}/${eYear}`
    };
  }

  const clean = dateStr.trim();
  const parts = clean.split('-');
  let year = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10);

  // Guard against malformed or truncated dates
  if (isNaN(year) || year < 1900 || year > 2150) {
    year = 2026;
  }
  if (isNaN(month) || month < 1 || month > 12) {
    month = 12; // default to December
  }

  const isGanjil = month >= 7 && month <= 12;
  const semester: 'Ganjil' | 'Genap' = isGanjil ? 'Ganjil' : 'Genap';
  const semesterNumber: 1 | 2 = isGanjil ? 1 : 2;
  const semesterRomawi: 'I' | 'II' = isGanjil ? 'I' : 'II';
  const semesterFormatted = isGanjil ? '1 (Satu) / Ganjil' : '2 (Dua) / Genap';

  const startYear = isGanjil ? year : year - 1;
  const endYear = startYear + 1;
  const tahunAjaran = `${startYear}/${endYear}`;

  return {
    semester,
    semesterNumber,
    semesterRomawi,
    semesterFormatted,
    tahunAjaran,
    startYear,
    endYear,
    labelLengkap: `Semester ${semester} Tahun Pelajaran ${tahunAjaran}`
  };
};

/**
 * Produces default report date according to semester and academic year:
 * - Semester Ganjil: 22 Desember startYear (e.g. 2026/2027 -> 2026-12-22)
 * - Semester Genap: 20 Juni endYear (e.g. 2026/2027 -> 2027-06-20)
 */
export const getDefaultReportDateForSemester = (
  semester: 'Ganjil' | 'Genap',
  tahunAjaranOrStartYear?: string | number
): string => {
  let startYear = 2026;
  if (typeof tahunAjaranOrStartYear === 'number') {
    startYear = tahunAjaranOrStartYear;
  } else if (typeof tahunAjaranOrStartYear === 'string') {
    const parts = tahunAjaranOrStartYear.trim().split('/');
    const parsed = parseInt(parts[0], 10);
    if (!isNaN(parsed) && parsed >= 2000 && parsed <= 2100) {
      startYear = parsed;
    }
  }

  const endYear = startYear + 1;

  if (semester === 'Ganjil') {
    return `${startYear}-12-22`;
  } else {
    return `${endYear}-06-20`;
  }
};

/**
 * Format a YYYY-MM-DD date into Indonesian full display (e.g. "2026-12-22" -> "22 Desember 2026").
 */
export const formatReportDateIndonesian = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.trim().split('-');
    if (parts.length === 3) {
      let year = parts[0];
      if (year.length > 4) year = year.slice(-4);
      const monthNum = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      if (!isNaN(day) && monthNum >= 1 && monthNum <= 12) {
        return `${day} ${months[monthNum - 1]} ${year}`;
      }
    }
  } catch {
    // fallback
  }
  return dateStr;
};

/**
 * Check if a daily class attendance record belongs to the target semester and academic year.
 */
export const isAttendanceInSemester = (
  att: DailyClassAttendance,
  targetSemester: 'Ganjil' | 'Genap',
  targetTahunAjaran?: string
): boolean => {
  if (!att) return false;

  // 1. If att has explicit semester tag
  if (att.semester) {
    if (att.semester !== targetSemester) return false;
    // If att also has explicit tahunAjaran and targetTahunAjaran is provided
    if (att.tahunAjaran && targetTahunAjaran && att.tahunAjaran.trim() !== targetTahunAjaran.trim()) {
      return false;
    }
    return true;
  }

  // 2. If att doesn't have explicit semester, infer from att.tanggal
  if (!att.tanggal) return false;
  const inferredSem = determineSemesterFromDate(att.tanggal);
  if (inferredSem !== targetSemester) {
    return false;
  }

  // 3. Check academic year compatibility if targetTahunAjaran provided (e.g. "2025/2026")
  if (targetTahunAjaran && att.tanggal) {
    const parts = att.tanggal.split('-');
    const year = parseInt(parts[0], 10);
    const taParts = targetTahunAjaran.split('/');
    let startYear = parseInt(taParts[0], 10);
    let endYear = parseInt(taParts[1], 10);

    if (!isNaN(startYear)) {
      if (isNaN(endYear)) endYear = startYear + 1;
      if (endYear < 100) endYear += 2000;
      if (endYear > 9999) endYear = parseInt(String(endYear).slice(-4), 10);

      // Allow years within or adjacent to the academic cycle [startYear - 1, endYear + 1]
      // to accommodate transitional or sample demo dates smoothly
      if (!isNaN(year) && (year < startYear - 1 || year > endYear + 1)) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Retrieve and aggregate student attendance data from logs for a specific semester and academic year.
 */
export const getStudentAttendanceSummaryFromLogs = (
  studentId: string,
  attendanceList: DailyClassAttendance[] = [],
  targetSemester: 'Ganjil' | 'Genap',
  targetTahunAjaran?: string
): StudentSemesterAttendanceSummary => {
  let sakit = 0;
  let izin = 0;
  let alpa = 0;
  let hadir = 0;
  let totalDaysRecorded = 0;
  const details: AttendanceDetailItem[] = [];

  // Filter logs that match target semester and academic year
  const filteredLogs = attendanceList.filter(att => 
    isAttendanceInSemester(att, targetSemester, targetTahunAjaran)
  );

  filteredLogs.forEach(att => {
    const rec = att.records?.find(r => r.studentId === studentId);
    if (!rec) return;

    totalDaysRecorded++;
    if (rec.status === 'Sakit') sakit++;
    else if (rec.status === 'Izin') izin++;
    else if (rec.status === 'Alpa') alpa++;
    else if (rec.status === 'Hadir') hadir++;

    // Record details (especially absences and notes for transparency)
    details.push({
      tanggal: att.tanggal,
      status: rec.status,
      keterangan: rec.keterangan,
      catatanKelas: att.catatanKelas,
      kelas: att.kelas
    });
  });

  // Sort details chronologically
  details.sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  return {
    sakit,
    izin,
    alpa,
    hadir,
    total: sakit + izin + alpa + hadir,
    totalDaysRecorded,
    details
  };
};
