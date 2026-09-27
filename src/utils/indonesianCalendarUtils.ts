/**
 * Utility for Indonesian National Holidays (Hari Libur Nasional), 
 * Joint Leave (Cuti Bersama), and 6-Day School Schedule (Senin - Sabtu masuk, Minggu libur).
 */

export interface HolidayInfo {
  date: string; // YYYY-MM-DD
  name: string;
  isCutiBersama?: boolean;
}

// Master List of Indonesian Holidays and Cuti Bersama (covering 2025, 2026, 2027)
export const INDONESIAN_HOLIDAYS_MAP: Record<string, HolidayInfo> = {
  // 2025
  '2025-01-01': { date: '2025-01-01', name: 'Tahun Baru 2025 Masehi' },
  '2025-01-27': { date: '2025-01-27', name: 'Isra Mikraj Nabi Muhammad SAW' },
  '2025-01-28': { date: '2025-01-28', name: 'Cuti Bersama Tahun Baru Imlek', isCutiBersama: true },
  '2025-01-29': { date: '2025-01-29', name: 'Tahun Baru Imlek 2576 Kongzili' },
  '2025-03-28': { date: '2025-03-28', name: 'Cuti Bersama Hari Suci Nyepi', isCutiBersama: true },
  '2025-03-29': { date: '2025-03-29', name: 'Hari Suci Nyepi Tahun Baru Saka 1947' },
  '2025-03-31': { date: '2025-03-31', name: 'Hari Raya Idul Fitri 1446 H' },
  '2025-04-01': { date: '2025-04-01', name: 'Hari Raya Idul Fitri 1446 H' },
  '2025-04-02': { date: '2025-04-02', name: 'Cuti Bersama Idul Fitri 1446 H', isCutiBersama: true },
  '2025-04-03': { date: '2025-04-03', name: 'Cuti Bersama Idul Fitri 1446 H', isCutiBersama: true },
  '2025-04-04': { date: '2025-04-04', name: 'Cuti Bersama Idul Fitri 1446 H', isCutiBersama: true },
  '2025-04-07': { date: '2025-04-07', name: 'Cuti Bersama Idul Fitri 1446 H', isCutiBersama: true },
  '2025-04-18': { date: '2025-04-18', name: 'Wafat Yesus Kristus' },
  '2025-04-20': { date: '2025-04-20', name: 'Hari Paskah' },
  '2025-05-01': { date: '2025-05-01', name: 'Hari Buruh Internasional' },
  '2025-05-12': { date: '2025-05-12', name: 'Hari Raya Waisak 2569 BE' },
  '2025-05-13': { date: '2025-05-13', name: 'Cuti Bersama Hari Raya Waisak', isCutiBersama: true },
  '2025-05-29': { date: '2025-05-29', name: 'Kenaikan Yesus Kristus' },
  '2025-05-30': { date: '2025-05-30', name: 'Cuti Bersama Kenaikan Yesus Kristus', isCutiBersama: true },
  '2025-06-01': { date: '2025-06-01', name: 'Hari Lahir Pancasila' },
  '2025-06-06': { date: '2025-06-06', name: 'Hari Raya Idul Adha 1446 H' },
  '2025-06-09': { date: '2025-06-09', name: 'Cuti Bersama Idul Adha 1446 H', isCutiBersama: true },
  '2025-06-27': { date: '2025-06-27', name: '1 Muharam Tahun Baru Islam 1447 H' },
  '2025-08-17': { date: '2025-08-17', name: 'Proklamasi Kemerdekaan RI Ke-80' },
  '2025-09-05': { date: '2025-09-05', name: 'Maulid Nabi Muhammad SAW' },
  '2025-12-25': { date: '2025-12-25', name: 'Hari Raya Natal' },
  '2025-12-26': { date: '2025-12-26', name: 'Cuti Bersama Hari Raya Natal', isCutiBersama: true },

  // 2026
  '2026-01-01': { date: '2026-01-01', name: 'Tahun Baru 2026 Masehi' },
  '2026-01-16': { date: '2026-01-16', name: 'Isra Mikraj Nabi Muhammad SAW' },
  '2026-02-16': { date: '2026-02-16', name: 'Cuti Bersama Tahun Baru Imlek', isCutiBersama: true },
  '2026-02-17': { date: '2026-02-17', name: 'Tahun Baru Imlek 2577 Kongzili' },
  '2026-03-19': { date: '2026-03-19', name: 'Hari Suci Nyepi Tahun Baru Saka 1948' },
  '2026-03-20': { date: '2026-03-20', name: 'Cuti Bersama Hari Suci Nyepi & Idul Fitri', isCutiBersama: true },
  '2026-03-21': { date: '2026-03-21', name: 'Hari Raya Idul Fitri 1447 H' },
  '2026-03-22': { date: '2026-03-22', name: 'Hari Raya Idul Fitri 1447 H' },
  '2026-03-23': { date: '2026-03-23', name: 'Cuti Bersama Idul Fitri 1447 H', isCutiBersama: true },
  '2026-03-24': { date: '2026-03-24', name: 'Cuti Bersama Idul Fitri 1447 H', isCutiBersama: true },
  '2026-04-03': { date: '2026-04-03', name: 'Wafat Yesus Kristus (Jumat Agung)' },
  '2026-04-05': { date: '2026-04-05', name: 'Hari Kebangkitan Yesus Kristus (Paskah)' },
  '2026-05-01': { date: '2026-05-01', name: 'Hari Buruh Internasional' },
  '2026-05-14': { date: '2026-05-14', name: 'Kenaikan Yesus Kristus' },
  '2026-05-15': { date: '2026-05-15', name: 'Cuti Bersama Kenaikan Yesus Kristus', isCutiBersama: true },
  '2026-05-27': { date: '2026-05-27', name: 'Hari Raya Idul Adha 1447 H' },
  '2026-05-28': { date: '2026-05-28', name: 'Cuti Bersama Idul Adha 1447 H', isCutiBersama: true },
  '2026-05-31': { date: '2026-05-31', name: 'Hari Raya Waisak 2570 BE' },
  '2026-06-01': { date: '2026-06-01', name: 'Hari Lahir Pancasila' },
  '2026-06-16': { date: '2026-06-16', name: 'Tahun Baru Islam 1448 H (1 Muharram)' },
  '2026-08-17': { date: '2026-08-17', name: 'Hari Proklamasi Kemerdekaan RI Ke-81' },
  '2026-08-25': { date: '2026-08-25', name: 'Maulid Nabi Muhammad SAW 1448 H' },
  '2026-12-24': { date: '2026-12-24', name: 'Cuti Bersama Hari Raya Natal', isCutiBersama: true },
  '2026-12-25': { date: '2026-12-25', name: 'Hari Raya Natal' },

  // 2027
  '2027-01-01': { date: '2027-01-01', name: 'Tahun Baru 2027 Masehi' },
  '2027-01-05': { date: '2027-01-05', name: 'Isra Mikraj Nabi Muhammad SAW' },
  '2027-02-06': { date: '2027-02-06', name: 'Tahun Baru Imlek 2578 Kongzili' },
  '2027-03-08': { date: '2027-03-08', name: 'Hari Suci Nyepi Tahun Baru Saka 1949' },
  '2027-03-10': { date: '2027-03-10', name: 'Hari Raya Idul Fitri 1448 H' },
  '2027-03-11': { date: '2027-03-11', name: 'Hari Raya Idul Fitri 1448 H' },
  '2027-03-12': { date: '2027-03-12', name: 'Cuti Bersama Idul Fitri 1448 H', isCutiBersama: true },
  '2027-03-26': { date: '2027-03-26', name: 'Wafat Yesus Kristus' },
  '2027-05-01': { date: '2027-05-01', name: 'Hari Buruh Internasional' },
  '2027-05-06': { date: '2027-05-06', name: 'Kenaikan Yesus Kristus' },
  '2027-05-17': { date: '2027-05-17', name: 'Hari Raya Idul Adha 1448 H' },
  '2027-05-20': { date: '2027-05-20', name: 'Hari Raya Waisak 2571 BE' },
  '2027-06-01': { date: '2027-06-01', name: 'Hari Lahir Pancasila' },
  '2027-06-06': { date: '2027-06-06', name: 'Tahun Baru Islam 1449 H' },
  '2027-08-17': { date: '2027-08-17', name: 'Hari Kemerdekaan RI Ke-82' },
  '2027-08-15': { date: '2027-08-15', name: 'Maulid Nabi Muhammad SAW' },
  '2027-12-25': { date: '2027-12-25', name: 'Hari Raya Natal' }
};

export interface DayScheduleType {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  dayName: string; // 'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  isSchoolDay: boolean; // True jika Senin-Sabtu dan BUKAN hari libur/cuti bersama
  isSunday: boolean; // True jika hari Minggu
  isSaturday: boolean; // True jika hari Sabtu (Hari efektif ke-6 pada sistem 6 hari sekolah)
  isHoliday: boolean; // True jika Libur Nasional atau Cuti Bersama
  holidayInfo?: HolidayInfo;
}

const INDONESIAN_DAY_NAMES = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu'
];

/**
 * Check if a specific date is a School Working Day in a 6-day work week (Senin - Sabtu).
 * - Sunday is always day off (Libur Mingguan).
 * - Monday to Saturday are effective school days unless marked as National Holiday or Cuti Bersama.
 */
export function getDayScheduleInfo(dateStr: string): DayScheduleType {
  // Parse year, month, day safely from YYYY-MM-DD
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const dateObj = new Date(year, month, day);
  const dayOfWeek = dateObj.getDay(); // 0 = Minggu, 6 = Sabtu
  const dayName = INDONESIAN_DAY_NAMES[dayOfWeek];

  const holidayInfo = INDONESIAN_HOLIDAYS_MAP[dateStr];
  const isHoliday = !!holidayInfo;
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;

  // 6 hari kerja sekolah: Senin - Sabtu aktif, KECUALI hari libur nasional / cuti bersama
  const isSchoolDay = !isSunday && !isHoliday;

  return {
    date: dateStr,
    dayOfWeek,
    dayName,
    isSchoolDay,
    isSunday,
    isSaturday,
    isHoliday,
    holidayInfo
  };
}

/**
 * Calculate total effective school days in a given month (6 work-days/week).
 */
export function getEffectiveSchoolDaysInMonth(year: number, month: number): {
  totalEffectiveDays: number;
  totalSundays: number;
  totalHolidays: number;
  holidaysInMonth: HolidayInfo[];
} {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let totalEffectiveDays = 0;
  let totalSundays = 0;
  let totalHolidays = 0;
  const holidaysInMonth: HolidayInfo[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const schedule = getDayScheduleInfo(dateStr);

    if (schedule.isSunday) {
      totalSundays++;
    } else if (schedule.isHoliday) {
      totalHolidays++;
      if (schedule.holidayInfo) {
        holidaysInMonth.push(schedule.holidayInfo);
      }
    } else if (schedule.isSchoolDay) {
      totalEffectiveDays++;
    }
  }

  return {
    totalEffectiveDays,
    totalSundays,
    totalHolidays,
    holidaysInMonth
  };
}

/**
 * Format standard Indonesian Date display (e.g. 'Senin, 24 Agustus 2026')
 */
export function formatIndonesianFullDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const dateObj = new Date(year, month, day);
  const dayName = INDONESIAN_DAY_NAMES[dateObj.getDay()];
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return `${dayName}, ${day} ${monthNames[month]} ${year}`;
}
