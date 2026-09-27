import * as XLSX from 'xlsx';
import { Student, DailyClassAttendance, ClassGrade, SchoolProfile } from '../types';
import { getDayScheduleInfo, formatIndonesianFullDate } from './indonesianCalendarUtils';

/**
 * Export daily attendance to Excel (.xlsx) with 6-day school context & holiday status
 */
export const exportDailyAttendanceToExcel = (
  dateStr: string,
  grade: ClassGrade,
  studentsInClass: Student[],
  attendanceRecord: DailyClassAttendance | undefined,
  school: SchoolProfile
) => {
  const schedule = getDayScheduleInfo(dateStr);
  const recordsMap = new Map(
    attendanceRecord?.records.map(r => [r.studentId, r]) || []
  );

  const rows = studentsInClass.map((student, idx) => {
    const rec = recordsMap.get(student.id);
    let status = rec?.status || (schedule.isSchoolDay ? 'Hadir' : 'Libur');
    if (!schedule.isSchoolDay) {
      status = (schedule.holidayInfo ? `Libur (${schedule.holidayInfo.name})` : 'Libur (Minggu)') as any;
    }

    return {
      'No': idx + 1,
      'NISN': student.nisn,
      'NIS': student.nis,
      'Nama Lengkap Siswa': student.namaLengkap,
      'L/P': student.jenisKelamin,
      'Kelas': student.kelas,
      'Hari & Tanggal': formatIndonesianFullDate(dateStr),
      'Status Hari': schedule.isSchoolDay 
        ? (schedule.isSaturday ? 'Hari Efektif (Sabtu)' : 'Hari Efektif (Senin-Jumat)')
        : (schedule.holidayInfo?.name || 'Libur Mingguan'),
      'Status Kehadiran': status,
      'Keterangan': rec?.keterangan || '-'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 12 },
    { wch: 30 },
    { wch: 6 },
    { wch: 8 },
    { wch: 28 },
    { wch: 28 },
    { wch: 18 },
    { wch: 32 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Presensi ${grade} - ${dateStr}`);

  const fileName = `Presensi_Kelas_${grade}_${dateStr}_${school.namaSekolah.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

/**
 * Export monthly attendance recap matrix to Excel (.xlsx) with 6-day work week (Senin - Sabtu)
 * and Indonesian National Holidays / Cuti Bersama mapping.
 */
export const exportMonthlyAttendanceRecapExcel = (
  year: number,
  month: number, // 0-indexed (0 = Jan, 7 = Aug)
  grade: ClassGrade,
  studentsInClass: Student[],
  allAttendance: DailyClassAttendance[],
  school: SchoolProfile
) => {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthName = monthNames[month];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Filter attendance records for this year, month, and grade
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const classRecords = allAttendance.filter(
    a => a.kelas === grade && a.tanggal.startsWith(monthPrefix)
  );

  const rows = studentsInClass.map((student, idx) => {
    const rowObj: Record<string, any> = {
      'No': idx + 1,
      'NISN': student.nisn,
      'Nama Siswa': student.namaLengkap,
      'L/P': student.jenisKelamin
    };

    let countH = 0;
    let countS = 0;
    let countI = 0;
    let countA = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDateStr = `${monthPrefix}-${String(day).padStart(2, '0')}`;
      const schedule = getDayScheduleInfo(dayDateStr);
      const dayRecord = classRecords.find(r => r.tanggal === dayDateStr);
      const studentRec = dayRecord?.records.find(sr => sr.studentId === student.id);

      let code = '-';

      if (studentRec) {
        if (studentRec.status === 'Hadir') { code = 'H'; countH++; }
        else if (studentRec.status === 'Sakit') { code = 'S'; countS++; }
        else if (studentRec.status === 'Izin') { code = 'I'; countI++; }
        else if (studentRec.status === 'Alpa') { code = 'A'; countA++; }
      } else if (dayRecord) {
        // If teacher created record for this day and student has no custom status
        if (schedule.isSchoolDay) {
          code = 'H';
          countH++;
        } else {
          code = schedule.isHoliday ? 'LIBUR' : 'L';
        }
      } else if (schedule.isSunday) {
        code = 'M'; // Minggu
      } else if (schedule.isHoliday) {
        code = schedule.holidayInfo?.isCutiBersama ? 'CB' : 'LN'; // Cuti Bersama / Libur Nasional
      }

      rowObj[`Tgl ${day}`] = code;
    }

    const totalDaysRecorded = countH + countS + countI + countA;
    const percentage = totalDaysRecorded > 0 ? Math.round((countH / totalDaysRecorded) * 100) : 100;

    rowObj['Total H (Hadir)'] = countH;
    rowObj['Total S (Sakit)'] = countS;
    rowObj['Total I (Izin)'] = countI;
    rowObj['Total A (Alpa)'] = countA;
    rowObj['% Kehadiran'] = `${percentage}%`;

    return rowObj;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  const colWidths = [
    { wch: 5 },  // No
    { wch: 14 }, // NISN
    { wch: 28 }, // Nama
    { wch: 5 },  // L/P
  ];

  // Daily cols
  for (let i = 1; i <= daysInMonth; i++) {
    colWidths.push({ wch: 6 });
  }

  // Summary cols
  colWidths.push(
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 14 }
  );

  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap ${grade} - ${monthName} ${year}`);

  const fileName = `Rekap_Presensi_Kelas_${grade}_${monthName}_${year}_(6HariKerja).xlsx`;
  XLSX.writeFile(workbook, fileName);
};
