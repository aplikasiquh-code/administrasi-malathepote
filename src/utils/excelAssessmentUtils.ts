import * as XLSX from 'xlsx';
import { 
  Student, 
  StudentAssessment, 
  ClassGrade, 
  SchoolProfile, 
  AssessmentType,
  ExtracurricularAssessment,
  CocurricularProject
} from '../types';
import { formatIndonesianFullDate } from './indonesianCalendarUtils';

/**
 * Export a single assessment sheet to Excel (.xlsx)
 */
export const exportSingleAssessmentToExcel = (
  assessment: StudentAssessment,
  studentsInClass: Student[],
  school: SchoolProfile
) => {
  const gradesMap = new Map((assessment.grades || []).map(g => [g.studentId, g]));
  const kkm = assessment.kkm || 75;

  const rows = studentsInClass.map((student, idx) => {
    const gradeItem = gradesMap.get(student.id);
    const score = gradeItem?.nilai !== undefined && gradeItem?.nilai !== null ? gradeItem.nilai : null;
    
    let predikat = '-';
    let status = 'Belum Dinilai';
    if (score !== null) {
      if (score >= 90) predikat = 'A (Sangat Baik)';
      else if (score >= 80) predikat = 'B (Baik)';
      else if (score >= kkm) predikat = 'C (Cukup)';
      else predikat = 'D (Perlu Bimbingan)';

      status = score >= kkm ? 'Tuntas' : 'Remedial / Belum Tuntas';
    }

    return {
      'No': idx + 1,
      'NISN': student.nisn,
      'NIS': student.nis,
      'Nama Lengkap Siswa': student.namaLengkap,
      'L/P': student.jenisKelamin,
      'Kelas': student.kelas,
      'Nilai (0-100)': score !== null ? score : '',
      'Predikat': predikat,
      'Status Ketuntasan (KKTP)': status,
      'Catatan / Tindak Lanjut Guru': gradeItem?.catatan || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 12 },
    { wch: 32 },
    { wch: 6 },
    { wch: 8 },
    { wch: 16 },
    { wch: 20 },
    { wch: 26 },
    { wch: 40 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Nilai Asesmen');

  const safeFilename = `Nilai_${assessment.mataPelajaran.replace(/[^a-zA-Z0-9]/g, '_')}_${assessment.jenisPenilaian}_Kls${assessment.kelas}_${assessment.tanggal}.xlsx`;
  XLSX.writeFile(workbook, safeFilename);
};

/**
 * Export Extracurricular Assessment to Excel (.xlsx)
 */
export const exportExtracurricularToExcel = (
  assessment: ExtracurricularAssessment,
  studentsInClass: Student[],
  school: SchoolProfile
) => {
  const gradesMap = new Map((assessment.grades || []).map(g => [g.studentId, g]));

  const rows = studentsInClass.map((student, idx) => {
    const gradeItem = gradesMap.get(student.id);
    const predikat = gradeItem?.predikat || '-';
    let predikatLabel = '-';
    if (predikat === 'A') predikatLabel = 'A (Sangat Baik)';
    else if (predikat === 'B') predikatLabel = 'B (Baik)';
    else if (predikat === 'C') predikatLabel = 'C (Cukup)';
    else if (predikat === 'D') predikatLabel = 'D (Kurang)';

    return {
      'No': idx + 1,
      'NISN': student.nisn,
      'NIS': student.nis,
      'Nama Lengkap Siswa': student.namaLengkap,
      'L/P': student.jenisKelamin,
      'Kelas': student.kelas,
      'Predikat': predikatLabel,
      'Nilai Angka': gradeItem?.nilaiAngka !== undefined && gradeItem?.nilaiAngka !== null ? gradeItem.nilaiAngka : '',
      'Keterangan / Capaian Pembina': gradeItem?.keterangan || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 12 },
    { wch: 32 },
    { wch: 6 },
    { wch: 8 },
    { wch: 20 },
    { wch: 14 },
    { wch: 50 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Nilai Ekskul');

  const currentTa = school?.tahunAjaran ? school.tahunAjaran.replace('/', '-') : '2025-2026';
  const safeFilename = `Nilai_Ekskul_${assessment.namaEkskul.replace(/[^a-zA-Z0-9]/g, '_')}_Kls${assessment.kelas}_${currentTa}.xlsx`;
  XLSX.writeFile(workbook, safeFilename);
};

/**
 * Export Cocurricular P5 Project to Excel (.xlsx)
 */
export const exportCocurricularProjectToExcel = (
  project: CocurricularProject,
  studentsInClass: Student[],
  school: SchoolProfile
) => {
  const gradesMap = new Map((project.studentGrades || []).map(g => [g.studentId, g]));

  const rows = studentsInClass.map((student, idx) => {
    const studentGrade = gradesMap.get(student.id);
    const ratings = studentGrade?.ratings || {};

    const rowObj: Record<string, any> = {
      'No': idx + 1,
      'NISN': student.nisn,
      'NIS': student.nis,
      'Nama Lengkap Siswa': student.namaLengkap,
      'L/P': student.jenisKelamin,
      'Kelas': student.kelas
    };

    project.targetElements.forEach((elem, eIdx) => {
      const scale = ratings[elem.id] || '-';
      let scaleDesc = scale;
      if (scale === 'MB') scaleDesc = 'MB (Mulai Berkembang)';
      else if (scale === 'SB') scaleDesc = 'SB (Sedang Berkembang)';
      else if (scale === 'BSH') scaleDesc = 'BSH (Berkembang Sesuai Harapan)';
      else if (scale === 'SAB') scaleDesc = 'SAB (Sangat Berkembang)';

      rowObj[`[${eIdx + 1}] ${elem.dimensi} - ${elem.subElemen}`] = scaleDesc;
    });

    rowObj['Catatan Proses Guru'] = studentGrade?.catatanProses || '';

    return rowObj;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rapor P5 Kokurikuler');

  const safeFilename = `Nilai_P5_${project.tema.replace(/[^a-zA-Z0-9]/g, '_')}_Kls${project.kelas}_${project.semester}.xlsx`;
  XLSX.writeFile(workbook, safeFilename);
};

/**
 * Export Class Grade Ledger (Leger Nilai Lengkap SH 1 - SH 6, PTS, SAS) to Excel (.xlsx)
 */
export const exportClassGradeLedgerExcel = (
  grade: ClassGrade,
  subject: string,
  studentsInClass: Student[],
  assessments: StudentAssessment[],
  school: SchoolProfile,
  kkm: number = 75
) => {
  const relevantAssessments = assessments.filter(
    a => a.kelas === grade && a.mataPelajaran.toLowerCase() === subject.toLowerCase()
  );

  const getScoreFor = (studentId: string, type: AssessmentType): number | null => {
    const matched = relevantAssessments.find(a => a.jenisPenilaian === type);
    if (!matched) return null;
    const g = matched.grades?.find(item => item.studentId === studentId);
    return g?.nilai !== undefined && g?.nilai !== null ? g.nilai : null;
  };

  const rows = studentsInClass.map((student, idx) => {
    const sh1 = getScoreFor(student.id, 'SH 1');
    const sh2 = getScoreFor(student.id, 'SH 2');
    const sh3 = getScoreFor(student.id, 'SH 3');
    const sh4 = getScoreFor(student.id, 'SH 4');
    const sh5 = getScoreFor(student.id, 'SH 5');
    const sh6 = getScoreFor(student.id, 'SH 6');
    const pts = getScoreFor(student.id, 'PTS');
    const sas = getScoreFor(student.id, 'SAS');

    const shScores = [sh1, sh2, sh3, sh4, sh5, sh6].filter((s): s is number => s !== null);
    const avgSh = shScores.length > 0 
      ? Math.round((shScores.reduce((acc, curr) => acc + curr, 0) / shScores.length) * 10) / 10 
      : null;

    // Calculate Final Grade (Nilai Akhir / NA)
    // Formula standard: If PTS & SAS exist, NA = (2*avgSh + PTS + SAS) / 4. Or weighted average of existing components.
    let finalGrade: number | null = null;
    if (avgSh !== null && pts !== null && sas !== null) {
      finalGrade = Math.round(((avgSh * 2 + pts + sas) / 4) * 10) / 10;
    } else if (avgSh !== null) {
      const parts = [avgSh * 2];
      let divider = 2;
      if (pts !== null) { parts.push(pts); divider += 1; }
      if (sas !== null) { parts.push(sas); divider += 1; }
      finalGrade = Math.round((parts.reduce((a, b) => a + b, 0) / divider) * 10) / 10;
    }

    let predikat = '-';
    let status = 'Belum Lengkap';
    if (finalGrade !== null) {
      if (finalGrade >= 90) predikat = 'A (Sangat Baik)';
      else if (finalGrade >= 80) predikat = 'B (Baik)';
      else if (finalGrade >= kkm) predikat = 'C (Cukup)';
      else predikat = 'D (Perlu Bimbingan)';

      status = finalGrade >= kkm ? 'Tuntas' : 'Remedial / Belum Tuntas';
    }

    return {
      'No': idx + 1,
      'NISN': student.nisn,
      'NIS': student.nis,
      'Nama Lengkap Siswa': student.namaLengkap,
      'L/P': student.jenisKelamin,
      'SH 1': sh1 !== null ? sh1 : '',
      'SH 2': sh2 !== null ? sh2 : '',
      'SH 3': sh3 !== null ? sh3 : '',
      'SH 4': sh4 !== null ? sh4 : '',
      'SH 5': sh5 !== null ? sh5 : '',
      'SH 6': sh6 !== null ? sh6 : '',
      'Rata-rata SH': avgSh !== null ? avgSh : '',
      'PTS': pts !== null ? pts : '',
      'SAS': sas !== null ? sas : '',
      'Nilai Akhir (NA)': finalGrade !== null ? finalGrade : '',
      'Predikat': predikat,
      'Keterangan': status
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 12 },
    { wch: 32 },
    { wch: 6 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 14 },
    { wch: 8 },
    { wch: 8 },
    { wch: 16 },
    { wch: 18 },
    { wch: 22 }
  ];

  const workbook = XLSX.utils.book_new();
  const safeSheetName = `Leger ${grade} - ${subject.slice(0, 15)}`.replace(/[\\/?*[\]]/g, '');
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName.slice(0, 31));

  const currentTa = school?.tahunAjaran ? school.tahunAjaran.replace('/', '-') : '2025-2026';
  const fileName = `Leger_Nilai_${grade}_${subject.replace(/\s+/g, '_')}_${currentTa}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
