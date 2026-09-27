import * as XLSX from 'xlsx';
import { 
  Student, 
  SchoolProfile, 
  StudentAssessment, 
  ExtracurricularAssessment, 
  CocurricularProject, 
  StudentReportConfig,
  DailyClassAttendance,
  STANDARD_SD_SUBJECTS,
  normalizeSubjectName
} from '../types';
import { sanitizeReportDateString } from './storage';
import { 
  getStudentAttendanceSummaryFromLogs, 
  deriveAcademicPeriodFromDate, 
  getDefaultReportDateForSemester, 
  formatReportDateIndonesian 
} from './reportAttendanceUtils';

export interface CalculatedSubjectGrade {
  mataPelajaran: string;
  nilaiAkhir: number | null;
  predikat: string;
  capaianTertinggi: string;
  perluPeningkatan: string;
}

/**
 * Calculate subjects and final grades for a student
 */
export const calculateStudentGrades = (
  student: Student,
  assessments: StudentAssessment[],
  semester: 'Ganjil' | 'Genap',
  kkmScore = 75,
  customCompetencies?: { [subject: string]: { tertinggi?: string; perluPeningkatan?: string } }
): CalculatedSubjectGrade[] => {
  // Collect all available subjects: standard SD subjects + any assessment subjects for this class
  const classAssessments = assessments.filter(a => a.kelas === student.kelas);
  const extraSubjects = Array.from(new Set(
    classAssessments.map(a => a.mataPelajaran)
  )).filter(subj => !STANDARD_SD_SUBJECTS.some(std => normalizeSubjectName(std).toLowerCase() === normalizeSubjectName(subj).toLowerCase()));

  const allSubjects = [...STANDARD_SD_SUBJECTS, ...extraSubjects];

  return allSubjects.map(subject => {
    const normSubj = normalizeSubjectName(subject).toLowerCase();
    const relevant = classAssessments.filter(a => {
      const matchSubj = normalizeSubjectName(a.mataPelajaran).toLowerCase() === normSubj;
      const matchSem = !a.semester || a.semester === semester;
      return matchSubj && matchSem;
    });

    const getScore = (type: string) => {
      const matched = relevant.find(a => a.jenisPenilaian === type);
      if (!matched) return null;
      const item = matched.grades?.find(g => g.studentId === student.id);
      return item?.nilai !== undefined && item?.nilai !== null ? item.nilai : null;
    };

    const shScores = [
      getScore('SH 1'),
      getScore('SH 2'),
      getScore('SH 3'),
      getScore('SH 4'),
      getScore('SH 5'),
      getScore('SH 6')
    ].filter((s): s is number => s !== null);

    const pts = getScore('PTS');
    const sas = getScore('SAS');

    const avgSh = shScores.length > 0 
      ? Math.round((shScores.reduce((a, b) => a + b, 0) / shScores.length) * 10) / 10 
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
    } else if (pts !== null || sas !== null) {
      const parts = [pts, sas].filter((p): p is number => p !== null);
      finalNa = Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 10) / 10;
    }

    let predikat = '-';
    if (finalNa !== null) {
      if (finalNa >= 90) predikat = 'A';
      else if (finalNa >= 80) predikat = 'B';
      else if (finalNa >= kkmScore) predikat = 'C';
      else predikat = 'D';
    }

    // Determine highest and improvement competency descriptions
    const custom = customCompetencies?.[subject];
    let capaianTertinggi = custom?.tertinggi || '';
    let perluPeningkatan = custom?.perluPeningkatan || '';

    // Sesuai ketentuan: jika nilai angka dan predikat kosong maka kosongkan deskripsi pada capaian kompetensi pembelajaran
    if (finalNa !== null && predikat !== '-') {
      if (!capaianTertinggi) {
        if (finalNa >= 85) {
          capaianTertinggi = `Menunjukkan penguasaan yang sangat baik dalam memahami dan menerapkan tujuan pembelajaran materi ${subject}.`;
        } else if (finalNa >= kkmScore) {
          capaianTertinggi = `Menunjukkan pemahaman yang baik dalam sebagian besar materi pokok dan aktivitas pembelajaran ${subject}.`;
        } else {
          capaianTertinggi = `Mulai menunjukkan pemahaman dasar dalam konsep pembelajaran ${subject}.`;
        }
      }

      if (!perluPeningkatan) {
        if (finalNa < kkmScore) {
          perluPeningkatan = `Perlu bimbingan intensif dan pendampingan lanjutan dalam penguatan materi dasar dan tugas mandiri ${subject}.`;
        } else if (finalNa < 85) {
          perluPeningkatan = `Perlu peningkatan ketelitian dan latihan berkelanjutan untuk memperdalam pemahaman konsep ${subject}.`;
        } else {
          perluPeningkatan = `Perlu mempertahankan prestasi serta terus meningkatkan literasi dan eksplorasi mandiri.`;
        }
      }
    }

    return {
      mataPelajaran: subject,
      nilaiAkhir: finalNa,
      predikat,
      capaianTertinggi,
      perluPeningkatan
    };
  });
};

/**
 * Export a single student's report card to Excel
 */
export const exportStudentSingleReportExcel = (
  student: Student,
  school: SchoolProfile,
  semester: 'Ganjil' | 'Genap',
  calculatedGrades: CalculatedSubjectGrade[],
  reportConfig?: StudentReportConfig,
  extracurriculars: ExtracurricularAssessment[] = [],
  cocurriculars: CocurricularProject[] = [],
  attendanceList: DailyClassAttendance[] = []
) => {
  const wb = XLSX.utils.book_new();

  // Helper to compute attendance if auto
  const isAutoAttendance = reportConfig?.isAutoAttendance !== false;
  let sakitVal = reportConfig?.sakitCount ?? 0;
  let izinVal = reportConfig?.izinCount ?? 0;
  let alpaVal = reportConfig?.alpaCount ?? 0;

  if (isAutoAttendance && attendanceList.length > 0) {
    const summary = getStudentAttendanceSummaryFromLogs(student.id, attendanceList, semester, school.tahunAjaran);
    sakitVal = summary.sakit;
    izinVal = summary.izin;
    alpaVal = summary.alpa;
  }

  // 1. Data Identitas & Nilai
  const studentClass = student.kelas;
  const classNum = parseInt(studentClass.charAt(0)) || 1;
  const fase = classNum <= 2 ? 'Fase A' : classNum <= 4 ? 'Fase B' : 'Fase C';

  const defaultDate = getDefaultReportDateForSemester(semester, school.tahunAjaran || '2026/2027');
  const rawDate = reportConfig?.tanggalRapor || defaultDate;
  const cleanDateStr = sanitizeReportDateString(rawDate);
  const reportPeriod = deriveAcademicPeriodFromDate(cleanDateStr, school.tahunAjaran || '2026/2027');

  const rows: any[] = [
    { Col1: 'LAPORAN HASIL BELAJAR (RAPOR PESERTA DIDIK)', Col2: '', Col3: '', Col4: '', Col5: '' },
    { Col1: school.namaSekolah.toUpperCase(), Col2: '', Col3: '', Col4: '', Col5: '' },
    { Col1: `Alamat: ${school.alamatJalan}, ${school.kecamatan}, ${school.kabupatenKota} | NPSN: ${school.npsn}`, Col2: '', Col3: '', Col4: '', Col5: '' },
    { Col1: '', Col2: '', Col3: '', Col4: '', Col5: '' },
    { Col1: 'Nama Peserta Didik', Col2: `: ${student.namaLengkap}`, Col3: 'Kelas', Col4: `: ${student.kelas}`, Col5: '' },
    { Col1: 'NISN / NIS', Col2: `: ${student.nisn} / ${student.nis || '-'}`, Col3: 'Fase', Col4: `: ${fase}`, Col5: '' },
    { Col1: 'Tahun Pelajaran', Col2: `: ${reportPeriod.tahunAjaran}`, Col3: 'Semester', Col4: `: ${reportPeriod.semesterNumber} (${reportPeriod.semester === 'Ganjil' ? 'Satu / Ganjil' : 'Dua / Genap'})`, Col5: '' },
    { Col1: '', Col2: '', Col3: '', Col4: '', Col5: '' },
    { Col1: 'A. NILAI INTRAKURIKULER (MATA PELAJARAN)', Col2: '', Col3: '', Col4: '', Col5: '' },
    { 
      Col1: 'No', 
      Col2: 'Mata Pelajaran', 
      Col3: 'Nilai Akhir', 
      Col4: 'Predikat', 
      Col5: 'Capaian Kompetensi Tertinggi', 
      Col6: 'Capaian Kompetensi yang Perlu Peningkatan' 
    }
  ];

  calculatedGrades.forEach((g, idx) => {
    rows.push({
      Col1: idx + 1,
      Col2: g.mataPelajaran,
      Col3: g.nilaiAkhir !== null ? g.nilaiAkhir : '-',
      Col4: g.predikat,
      Col5: g.capaianTertinggi,
      Col6: g.perluPeningkatan
    });
  });

  // Ekstrakurikuler
  rows.push({ Col1: '', Col2: '', Col3: '', Col4: '', Col5: '' });
  rows.push({ Col1: 'B. KEGIATAN EKSTRAKURIKULER', Col2: '', Col3: '', Col4: '', Col5: '' });
  rows.push({ Col1: 'No', Col2: 'Kegiatan Ekstrakurikuler', Col3: 'Predikat', Col4: 'Keterangan', Col5: '' });

  const studentEkskuls = extracurriculars.filter(e => e.semester === semester && e.grades?.some(m => m.studentId === student.id));
  if (studentEkskuls.length > 0) {
    studentEkskuls.forEach((ek, idx) => {
      const m = ek.grades?.find(mem => mem.studentId === student.id);
      rows.push({
        Col1: idx + 1,
        Col2: ek.namaEkskul,
        Col3: m?.predikat ? `${m.predikat} (${m.predikat === 'A' ? 'Sangat Baik' : m.predikat === 'B' ? 'Baik' : m.predikat === 'C' ? 'Cukup' : 'Kurang'})` : 'B (Baik)',
        Col4: m?.keterangan || ek.deskripsiUmum || 'Aktif mengikuti kegiatan',
        Col5: ''
      });
    });
  } else {
    rows.push({ Col1: 1, Col2: 'Pramuka (Wajib)', Col3: 'A (Sangat Baik)', Col4: 'Mengikuti kegiatan kepramukaan dengan disiplin dan aktif.', Col5: '' });
  }

  // P5
  rows.push({ Col1: '', Col2: '', Col3: '', Col4: '', Col5: '' });
  rows.push({ Col1: 'C. KOKURIKULER / PROYEK PROFIL PELAJAR PANCASILA (P5)', Col2: '', Col3: '', Col4: '', Col5: '' });
  rows.push({ Col1: 'No', Col2: 'Tema & Judul Projek', Col3: 'Catatan Perkembangan', Col4: '', Col5: '' });

  const studentP5 = cocurriculars.filter(p => p.semester === semester && (p.kelas === student.kelas || (p.kelas as any) === 'Semua Kelas' || !p.kelas));
  if (studentP5.length > 0) {
    studentP5.forEach((p, idx) => {
      const stRating = p.studentGrades?.find(r => r.studentId === student.id);
      rows.push({
        Col1: idx + 1,
        Col2: `[${p.tema}] ${p.judulProjek}`,
        Col3: stRating?.catatanProses || p.deskripsiSingkat || 'Menunjukkan perkembangan karakter profil pelajar Pancasila dengan baik.',
        Col4: '',
        Col5: ''
      });
    });
  } else {
    rows.push({ Col1: 1, Col2: 'Gaya Hidup Berkelanjutan: Pengelolaan Sampah Sekolah', Col3: 'Mampu bergotong royong dan bernalar kritis dalam memilah sampah di lingkungan sekolah.', Col4: '', Col5: '' });
  }

  // Presensi
  rows.push({ Col1: '', Col2: '', Col3: '', Col4: '', Col5: '' });
  rows.push({ Col1: 'D. KETIDAKHADIRAN', Col2: isAutoAttendance ? '(Tersinkron Otomatis dari Presensi)' : '(Penyesuaian Manual)', Col3: '', Col4: '', Col5: '' });
  rows.push({ Col1: 'Sakit (S)', Col2: `${sakitVal} hari`, Col3: '', Col4: '', Col5: '' });
  rows.push({ Col1: 'Izin (I)', Col2: `${izinVal} hari`, Col3: '', Col4: '', Col5: '' });
  rows.push({ Col1: 'Tanpa Keterangan (A)', Col2: `${alpaVal} hari`, Col3: '', Col4: '', Col5: '' });

  // Perkembangan Fisik & Kesehatan (Integrasi Data Siswa)
  rows.push({ Col1: '', Col2: '', Col3: '', Col4: '', Col5: '' });
  rows.push({ Col1: 'E. PERKEMBANGAN FISIK & KESEHATAN', Col2: '', Col3: '', Col4: '', Col5: '' });
  rows.push({ Col1: 'Tinggi Badan', Col2: reportConfig?.tinggiBadan || (student.tinggiBadan ? `${student.tinggiBadan} cm` : '128 cm'), Col3: '', Col4: '', Col5: '' });
  rows.push({ Col1: 'Berat Badan', Col2: reportConfig?.beratBadan || (student.beratBadan ? `${student.beratBadan} kg` : '26 kg'), Col3: '', Col4: '', Col5: '' });
  rows.push({ Col1: 'Kondisi Kesehatan', Col2: reportConfig?.catatanKesehatan || student.catatanKesehatan || 'Pendengaran, penglihatan, dan gigi dalam kondisi baik.', Col3: '', Col4: '', Col5: '' });

  // Catatan Wali Kelas
  rows.push({ Col1: '', Col2: '', Col3: '', Col4: '', Col5: '' });
  rows.push({ Col1: 'F. CATATAN WALI KELAS', Col2: '', Col3: '', Col4: '', Col5: '' });
  rows.push({ Col1: reportConfig?.catatanWaliKelas || 'Tingkatkan terus semangat belajar, kedisiplinan, dan keaktifan di kelas.', Col2: '', Col3: '', Col4: '', Col5: '' });

  // Kenaikan Kelas (Semester Genap)
  if (semester === 'Genap') {
    const isGrade6 = classNum === 6;
    rows.push({ Col1: '', Col2: '', Col3: '', Col4: '', Col5: '' });
    rows.push({ Col1: 'G. KEPUTUSAN KENAIKAN KELAS / KELULUSAN', Col2: '', Col3: '', Col4: '', Col5: '' });
    if (isGrade6) {
      rows.push({ Col1: `Berdasarkan hasil pembelajaran, peserta didik dinyatakan: ${reportConfig?.keputusanKenaikan || 'LULUS'} dari Satuan Pendidikan SD`, Col2: '', Col3: '', Col4: '', Col5: '' });
    } else {
      const nextGrade = classNum + 1;
      const statusText = reportConfig?.keputusanKenaikan || `NAIK KE KELAS ${nextGrade}`;
      rows.push({ Col1: `Berdasarkan pencapaian seluruh kompetensi, peserta didik dinyatakan: ${statusText}`, Col2: '', Col3: '', Col4: '', Col5: '' });
    }
  }

  // Titimangsa & Tanda Tangan
  const tempatRapor = reportConfig?.tempatRapor || school.kabupatenKota || 'Kota Depok';
  const tanggalRaporFormatted = formatReportDateIndonesian(cleanDateStr);

  rows.push({ Col1: '', Col2: '', Col3: '', Col4: '', Col5: '' });
  rows.push({ Col1: '', Col2: '', Col3: '', Col4: '', Col5: `${tempatRapor}, ${tanggalRaporFormatted}` });
  rows.push({ Col1: 'Mengetahui,', Col2: '', Col3: 'Mengetahui,', Col4: '', Col5: 'Guru Kelas / Wali Kelas' });
  rows.push({ Col1: 'Kepala Sekolah', Col2: '', Col3: 'Orang Tua / Wali Siswa', Col4: '', Col5: '' });
  rows.push({ Col1: '', Col2: '', Col3: '', Col4: '', Col5: '' });
  rows.push({ Col1: '', Col2: '', Col3: '', Col4: '', Col5: '' });
  rows.push({ Col1: school.kepalaSekolah, Col2: '', Col3: '....................................', Col4: '', Col5: reportConfig?.waliKelasNama || 'Guru Kelas' });
  rows.push({ Col1: `NIP. ${school.nipKepalaSekolah || '-'}`, Col2: '', Col3: '', Col4: '', Col5: `NIP. ${reportConfig?.waliKelasNip || '-'}` });

  const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: true });
  ws['!cols'] = [
    { wch: 6 },
    { wch: 32 },
    { wch: 14 },
    { wch: 10 },
    { wch: 45 },
    { wch: 45 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, `Rapor_${student.namaLengkap.slice(0, 15)}`);

  const fileName = `Rapor_${student.kelas}_${student.namaLengkap.replace(/\s+/g, '_')}_Semester_${reportPeriod.semester}_${reportPeriod.tahunAjaran.replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Export Class Report Recap (Rekap Buku Rapor Satu Kelas)
 */
export const exportClassReportRecapExcel = (
  className: string,
  classStudents: Student[],
  school: SchoolProfile,
  semester: 'Ganjil' | 'Genap',
  assessments: StudentAssessment[],
  savedReports: StudentReportConfig[],
  attendanceList: DailyClassAttendance[] = []
) => {
  const wb = XLSX.utils.book_new();

  const reportMap = new Map(savedReports.map(r => [`${r.studentId}_${r.semester}`, r]));

  // Helper to compute attendance from logs for target semester
  const getStudentAtt = (studentId: string) => {
    return getStudentAttendanceSummaryFromLogs(studentId, attendanceList, semester, school.tahunAjaran);
  };

  // Calculate grades for each student
  const rows = classStudents.map((student, idx) => {
    const grades = calculateStudentGrades(student, assessments, semester);
    const validScores = grades.map(g => g.nilaiAkhir).filter((s): s is number => s !== null);
    const totalScore = validScores.reduce((a, b) => a + b, 0);
    const avgScore = validScores.length > 0 ? Math.round((totalScore / validScores.length) * 10) / 10 : null;

    const reportCfg = reportMap.get(`${student.id}_${semester}`);
    const classNum = parseInt(student.kelas.charAt(0)) || 1;
    const isGrade6 = classNum === 6;

    let status = '-';
    if (semester === 'Genap') {
      status = reportCfg?.keputusanKenaikan || (isGrade6 ? 'Lulus' : `Naik ke Kelas ${classNum + 1}`);
    } else {
      status = avgScore !== null && avgScore >= 75 ? 'Tuntas Semester 1' : 'Perlu Pendampingan';
    }

    const logAtt = getStudentAtt(student.id);
    const isAuto = reportCfg?.isAutoAttendance !== false;
    const sakitCount = isAuto ? logAtt.sakit : (reportCfg?.sakitCount !== undefined && reportCfg?.sakitCount !== null ? reportCfg.sakitCount : logAtt.sakit);
    const izinCount = isAuto ? logAtt.izin : (reportCfg?.izinCount !== undefined && reportCfg?.izinCount !== null ? reportCfg.izinCount : logAtt.izin);
    const alpaCount = isAuto ? logAtt.alpa : (reportCfg?.alpaCount !== undefined && reportCfg?.alpaCount !== null ? reportCfg.alpaCount : logAtt.alpa);

    const tinggiBadanStr = reportCfg?.tinggiBadan || (student.tinggiBadan ? `${student.tinggiBadan} cm` : '128 cm');
    const beratBadanStr = reportCfg?.beratBadan || (student.beratBadan ? `${student.beratBadan} kg` : '26 kg');

    const rowObj: any = {
      'No': idx + 1,
      'NISN': student.nisn,
      'NIS': student.nis || '-',
      'Nama Siswa': student.namaLengkap,
      'L/P': student.jenisKelamin,
      'Kelas': student.kelas,
      'Semester': semester === 'Ganjil' ? '1 (Ganjil)' : '2 (Genap)',
      'Tahun Ajaran': school.tahunAjaran
    };

    // Add each subject score
    grades.forEach(g => {
      rowObj[g.mataPelajaran] = g.nilaiAkhir !== null ? g.nilaiAkhir : '-';
    });

    rowObj['Total Nilai'] = totalScore;
    rowObj['Rata-Rata (NA)'] = avgScore !== null ? avgScore : '-';
    rowObj['Sakit (S)'] = sakitCount;
    rowObj['Izin (I)'] = izinCount;
    rowObj['Alpa (A)'] = alpaCount;
    rowObj['Tinggi Badan'] = tinggiBadanStr;
    rowObj['Berat Badan'] = beratBadanStr;
    rowObj['Catatan Wali Kelas'] = reportCfg?.catatanWaliKelas || 'Rajin dan berprestasi';

    if (semester === 'Genap') {
      rowObj['Keterangan Kenaikan / Kelulusan'] = status;
    }

    return rowObj;
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 12 },
    { wch: 28 },
    { wch: 6 },
    { wch: 8 },
    { wch: 10 },
    { wch: 14 },
    // subjects
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    // stats
    { wch: 12 },
    { wch: 14 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 35 },
    { wch: 24 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, `Rekap_Rapor_${className}`);

  const fileName = `Rekap_Buku_Rapor_Kelas_${className}_Semester_${semester}_${school.tahunAjaran.replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
