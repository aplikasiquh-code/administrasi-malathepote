import React from 'react';
import { 
  Student, 
  SchoolProfile, 
  StudentGradeItem, 
  Teacher, 
  ExtracurricularAssessment, 
  CocurricularProject 
} from '../types';
import { OfficialSchoolKop } from './OfficialSchoolKop';
import { formatReportDateIndonesian } from '../utils/reportAttendanceUtils';

export interface StudentReportCardDocumentProps {
  student: Student;
  school: SchoolProfile;
  academicPeriod: {
    semesterNumber: string;
    semester: 'Ganjil' | 'Genap';
    tahunAjaran: string;
  };
  studentFase: string;
  studentGrades: StudentGradeItem[];
  ekskuls: ExtracurricularAssessment[];
  p5Projects: CocurricularProject[];
  attendance: {
    sakit: number;
    izin: number;
    alpa: number;
  };
  physicalAndHealth: {
    tinggiBadan: string;
    beratBadan: string;
    catatanKesehatan: string;
  };
  catatanWaliKelas: string;
  keputusanKenaikan?: string;
  homeroomTeacher?: Teacher;
  tempatRapor: string;
  tanggalRapor: string;
  isBulkPrint?: boolean;
  isLastInBulk?: boolean;
  containerId?: string;
}

export const StudentReportCardDocument: React.FC<StudentReportCardDocumentProps> = ({
  student,
  school,
  academicPeriod,
  studentFase,
  studentGrades,
  ekskuls,
  p5Projects,
  attendance,
  physicalAndHealth,
  catatanWaliKelas,
  keputusanKenaikan,
  homeroomTeacher,
  tempatRapor,
  tanggalRapor,
  isBulkPrint = false,
  isLastInBulk = false,
  containerId
}) => {
  // Format report date cleanly
  const formattedDate = formatReportDateIndonesian(tanggalRapor);

  // Student specific ekskuls
  const resolvedEkskuls = ekskuls.map(ek => {
    const studentGrade = ek.grades?.find(mem => mem.studentId === student.id);
    let predikatText = 'A (Sangat Baik)';
    if (studentGrade?.predikat) {
      const p = studentGrade.predikat;
      predikatText = `${p} (${p === 'A' ? 'Sangat Baik' : p === 'B' ? 'Baik' : p === 'C' ? 'Cukup' : 'Kurang'})`;
    }
    const ketText = studentGrade?.keterangan || ek.deskripsiUmum || 'Aktif mengikuti kegiatan pembinaan rutin.';
    return {
      id: ek.id,
      nama: ek.namaEkskul,
      predikat: predikatText,
      keterangan: ketText
    };
  });

  // Student specific P5 projects
  const resolvedP5 = p5Projects.map(p => {
    const studentP5 = p.studentGrades?.find(st => st.studentId === student.id);
    const catatan = studentP5?.catatanProses || p.deskripsiSingkat || 'Menunjukkan partisipasi aktif dalam pelaksanaan kegiatan projek.';
    return {
      id: p.id,
      tema: p.tema,
      judul: p.judulProjek,
      catatan: catatan
    };
  });

  // Default fallback data if empty
  const displayEkskuls = resolvedEkskuls.length > 0 ? resolvedEkskuls : [
    {
      id: 'default-1',
      nama: 'Praja Muda Karana (Pramuka - Wajib)',
      predikat: 'A (Sangat Baik)',
      keterangan: 'Aktif, disiplin, dan terampil dalam seluruh kegiatan kepramukaan.'
    }
  ];

  const displayP5 = resolvedP5.length > 0 ? resolvedP5 : [
    {
      id: 'default-p5',
      tema: 'Gaya Hidup Berkelanjutan',
      judul: 'Pengolahan Sampah Organik dan Apotek Hidup Sekolah',
      catatan: 'Sangat mandiri dan peduli terhadap kebersihan lingkungan sekitar.'
    }
  ];

  // Dynamic proportional sizing for Sheet 1 based on subject count
  // Designed to fill Sheet 1 elegantly, readable, and uniformly sized with Sheet 2 without spilling
  const getSubjectRowConfig = (count: number) => {
    if (count <= 6) {
      return {
        minHeight: 70,
        cellPadding: 'py-2 px-2',
        descPadding: 'py-2 px-2.5',
        noFont: 'text-[10px] sm:text-[10.5px]',
        subjectFont: 'text-[10.5px] sm:text-[11px]',
        scoreFont: 'text-[12px] sm:text-[13px]',
        predikatFont: 'text-[11px] sm:text-[11.5px]',
        descFont: 'text-[10px] sm:text-[10.5px]',
        leading: 'leading-normal',
        itemGap: 'space-y-1'
      };
    }
    if (count === 7) {
      return {
        minHeight: 62,
        cellPadding: 'py-1.5 px-2',
        descPadding: 'py-1.5 px-2.5',
        noFont: 'text-[10px] sm:text-[10.5px]',
        subjectFont: 'text-[10.5px] sm:text-[11px]',
        scoreFont: 'text-[12px] sm:text-[12.5px]',
        predikatFont: 'text-[11px] sm:text-[11.5px]',
        descFont: 'text-[10px] sm:text-[10.5px]',
        leading: 'leading-snug',
        itemGap: 'space-y-1'
      };
    }
    if (count === 8) {
      return {
        minHeight: 56,
        cellPadding: 'py-1.5 px-2',
        descPadding: 'py-1.5 px-2.5',
        noFont: 'text-[10px] sm:text-[10.5px]',
        subjectFont: 'text-[10px] sm:text-[10.5px]',
        scoreFont: 'text-[11.5px] sm:text-[12px]',
        predikatFont: 'text-[10.5px] sm:text-[11px]',
        descFont: 'text-[10px] sm:text-[10.5px]',
        leading: 'leading-snug',
        itemGap: 'space-y-0.5'
      };
    }
    if (count === 9) { // EXACT CASE IN USER SCREENSHOT (SD: 9 mapel)
      return {
        minHeight: 50,
        cellPadding: 'py-1.5 px-2',
        descPadding: 'py-1 px-2.5',
        noFont: 'text-[10px] sm:text-[10.5px]',
        subjectFont: 'text-[10px] sm:text-[10.5px]',
        scoreFont: 'text-[11px] sm:text-[11.5px]',
        predikatFont: 'text-[10.5px] sm:text-[11px]',
        descFont: 'text-[10px] sm:text-[10.5px]',
        leading: 'leading-snug',
        itemGap: 'space-y-0.5'
      };
    }
    if (count === 10) {
      return {
        minHeight: 44,
        cellPadding: 'py-1 px-2',
        descPadding: 'py-0.5 px-2',
        noFont: 'text-[9.5px] sm:text-[10px]',
        subjectFont: 'text-[9.5px] sm:text-[10px]',
        scoreFont: 'text-[10.5px] sm:text-[11px]',
        predikatFont: 'text-[10px] sm:text-[10.5px]',
        descFont: 'text-[9.5px] sm:text-[10px]',
        leading: 'leading-snug',
        itemGap: 'space-y-0.5'
      };
    }
    if (count === 11) {
      return {
        minHeight: 38,
        cellPadding: 'py-0.5 px-1.5',
        descPadding: 'py-0.5 px-2',
        noFont: 'text-[9px] sm:text-[9.5px]',
        subjectFont: 'text-[9px] sm:text-[9.5px]',
        scoreFont: 'text-[10px] sm:text-[10.5px]',
        predikatFont: 'text-[9.5px] sm:text-[10px]',
        descFont: 'text-[9px] sm:text-[9.5px]',
        leading: 'leading-tight',
        itemGap: 'space-y-0.5'
      };
    }
    // 12 or more
    return {
      minHeight: 32,
      cellPadding: 'py-0.5 px-1',
      descPadding: 'py-0.5 px-1.5',
      noFont: 'text-[8.5px] sm:text-[9px]',
      subjectFont: 'text-[8.5px] sm:text-[9px]',
      scoreFont: 'text-[9.5px] sm:text-[10px]',
      predikatFont: 'text-[9px] sm:text-[9.5px]',
      descFont: 'text-[8.5px] sm:text-[9px]',
      leading: 'leading-tight',
      itemGap: 'space-y-0.5'
    };
  };

  const rowConfig = getSubjectRowConfig(studentGrades.length);

  return (
    <div id={containerId} className="w-full text-black space-y-6 print:space-y-0">
      {/* ==============================================================
          HALAMAN 1: IDENTITAS & NILAI INTRAKURIKULER (MATA PELAJARAN)
          Dibuat PAS memenuhi Halaman 1 A4 tanpa tumpah ke Halaman 2
         ============================================================== */}
      <div 
        className="report-card-page report-sheet-1 report-sheet-break bg-white text-black p-4 sm:p-6 print:p-0 rounded-2xl sm:border border-gray-200 shadow-md print:shadow-none print:border-none print:m-0 print:rounded-none a4-portrait-sheet break-after-page mb-6 print:mb-0"
        style={{ 
          breakAfter: 'page', 
          pageBreakAfter: 'always', 
          pageBreakInside: 'avoid', 
          breakInside: 'avoid',
          boxSizing: 'border-box'
        }}
      >
        {/* Banner Penanda Layar (Tersembunyi saat Cetak/PDF) */}
        <div className="print:hidden mb-2 pb-1.5 border-b border-gray-200 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-bold">
            📄 Halaman 1: Identitas & Nilai Intrakurikuler (Pas Halaman 1)
          </span>
          <span className="text-xs text-gray-500 font-medium">
            Standar PDF A4: Halaman 1 dari 2
          </span>
        </div>

        {/* 1. Kop Resmi Sekolah */}
        <OfficialSchoolKop school={school} className="mb-1.5 print:mb-1" />

        {/* 2. Judul Rapor */}
        <div className="text-center my-1 print:my-0.5 border-b-2 border-black pb-1 print:pb-0.5">
          <h3 className="text-[12px] sm:text-[13px] font-bold uppercase tracking-wider leading-tight">
            LAPORAN HASIL BELAJAR PESERTA DIDIK (RAPOR)
          </h3>
          <p className="text-[9.5px] sm:text-[10px] text-gray-800 font-semibold mt-0.5 tracking-wide">
            SEKOLAH DASAR — KURIKULUM MERDEKA
          </p>
        </div>

        {/* 3. Identitas Siswa & Sekolah */}
        <div className="grid grid-cols-2 text-[10px] sm:text-[10.5px] py-1 gap-x-6 gap-y-1 mb-1.5 border-b border-gray-400 pb-1 leading-snug">
          <div className="space-y-0.5">
            <div className="flex">
              <span className="w-32 font-semibold shrink-0">Nama Peserta Didik</span>
              <span className="font-bold truncate">: {student.namaLengkap}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold shrink-0">NISN / NIS</span>
              <span className="truncate">: {student.nisn} / {student.nis || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold shrink-0">Nama Sekolah</span>
              <span className="truncate">: {school.namaSekolah}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold shrink-0">Alamat Sekolah</span>
              <span className="truncate">: {school.alamatJalan}</span>
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="flex">
              <span className="w-28 font-semibold shrink-0">Kelas / Fase</span>
              <span>: {student.kelas} / {studentFase}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold shrink-0">Semester</span>
              <span className="font-bold">
                : {academicPeriod.semesterNumber} ({academicPeriod.semester === 'Ganjil' ? 'Satu / Ganjil' : 'Dua / Genap'})
              </span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold shrink-0">Tahun Pelajaran</span>
              <span className="font-bold">: {academicPeriod.tahunAjaran}</span>
            </div>
          </div>
        </div>

        {/* 4. Section A: Nilai Intrakurikuler (Mata Pelajaran) */}
        <div className="mb-1.5 print:mb-1">
          <div className="mb-1 bg-gray-100 px-3 py-1 border border-gray-400 flex items-center justify-between">
            <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wide text-gray-900">
              A. NILAI INTRAKURIKULER (MATA PELAJARAN)
            </span>
            <span className="text-[9.5px] sm:text-[10px] text-gray-700 font-semibold">Skala 0 - 100</span>
          </div>

          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400 text-center font-bold text-gray-900 text-[10px] sm:text-[10.5px]">
                <th className="py-1 px-1 border border-gray-400 w-8">No</th>
                <th className="py-1 px-2.5 border border-gray-400 w-44 sm:w-48 text-left">Mata Pelajaran</th>
                <th className="py-1 px-1.5 border border-gray-400 w-14 sm:w-16">Nilai Akhir</th>
                <th className="py-1 px-1.5 border border-gray-400 w-14 sm:w-16">Predikat</th>
                <th className="py-1 px-2.5 border border-gray-400 text-left">Capaian Kompetensi Pembelajaran</th>
              </tr>
            </thead>
            <tbody>
              {studentGrades.map((g, idx) => {
                const hasScore = g.nilaiAkhir !== null && g.nilaiAkhir !== undefined && g.predikat !== '-';
                const hasCompetencyText = Boolean(
                  (g.capaianTertinggi && g.capaianTertinggi.trim().length > 0) ||
                  (g.perluPeningkatan && g.perluPeningkatan.trim().length > 0)
                );
                // Ketentuan: jika nilai angka dan predikat kosong maka kosongkan deskripsi pada capaian kompetensi pembelajaran
                const showCompetency = hasScore && hasCompetencyText;

                return (
                  <tr 
                    key={g.mataPelajaran} 
                    className="border-b border-gray-300"
                    style={{ minHeight: `${rowConfig.minHeight}px` }}
                  >
                    <td 
                      className={`text-center border border-gray-300 font-mono ${rowConfig.noFont} align-middle ${rowConfig.cellPadding}`}
                    >
                      {idx + 1}
                    </td>
                    <td 
                      className={`font-semibold border border-gray-300 leading-snug text-gray-950 ${rowConfig.subjectFont} align-middle ${rowConfig.cellPadding}`}
                    >
                      {g.mataPelajaran}
                    </td>
                    <td 
                      className={`text-center font-bold border border-gray-300 font-mono ${rowConfig.scoreFont} align-middle ${rowConfig.cellPadding}`}
                    >
                      {g.nilaiAkhir !== null ? g.nilaiAkhir : '-'}
                    </td>
                    <td 
                      className={`text-center font-bold border border-gray-300 ${rowConfig.predikatFont} align-middle ${rowConfig.cellPadding}`}
                    >
                      {g.predikat}
                    </td>
                    <td 
                      className={`border border-gray-300 ${rowConfig.descFont} ${rowConfig.leading} align-middle ${rowConfig.descPadding}`}
                    >
                      {showCompetency ? (
                        <div className={rowConfig.itemGap}>
                          {g.capaianTertinggi && (
                            <div className={rowConfig.leading}>
                              <span className="font-bold text-emerald-950">Capaian Tertinggi: </span>
                              <span className="text-gray-900">{g.capaianTertinggi}</span>
                            </div>
                          )}
                          {g.perluPeningkatan && (
                            <div className={`${rowConfig.leading} ${g.capaianTertinggi ? "pt-1 border-t border-gray-200" : ""}`}>
                              <span className="font-bold text-amber-950">Perlu Peningkatan: </span>
                              <span className="text-gray-900">{g.perluPeningkatan}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center font-mono text-gray-400 py-1">-</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Keterangan Kriteria Penilaian & Interval Predikat (Melengkapi Halaman 1 agar Pas, Proporsional, & Resmi) */}
          <div className="mt-2 border border-gray-400 rounded-sm overflow-hidden">
            <div className="bg-gray-100 px-3 py-0.5 border-b border-gray-400 flex items-center justify-between text-[9px] sm:text-[9.5px] font-bold text-gray-900 uppercase tracking-wide">
              <span>Kriteria & Interval Predikat Capaian Pembelajaran</span>
              <span className="text-gray-600 normal-case font-semibold text-[8.5px] sm:text-[9px]">KKTP Satuan Pendidikan: 75</span>
            </div>
            <div className="grid grid-cols-4 divide-x divide-gray-300 text-[9px] sm:text-[9.5px] text-center bg-gray-50/70 py-1 px-1">
              <div className="px-1.5 py-0.5">
                <span className="font-bold text-gray-900 block leading-tight">Predikat A</span>
                <span className="text-gray-700 font-mono font-medium text-[8.5px] sm:text-[9px]">89 - 100</span>
                <span className="block text-[8px] sm:text-[8.5px] text-emerald-800 font-bold leading-tight mt-0.5">Sangat Baik</span>
              </div>
              <div className="px-1.5 py-0.5">
                <span className="font-bold text-gray-900 block leading-tight">Predikat B</span>
                <span className="text-gray-700 font-mono font-medium text-[8.5px] sm:text-[9px]">79 - 88</span>
                <span className="block text-[8px] sm:text-[8.5px] text-blue-800 font-bold leading-tight mt-0.5">Baik</span>
              </div>
              <div className="px-1.5 py-0.5">
                <span className="font-bold text-gray-900 block leading-tight">Predikat C</span>
                <span className="text-gray-700 font-mono font-medium text-[8.5px] sm:text-[9px]">75 - 78</span>
                <span className="block text-[8px] sm:text-[8.5px] text-amber-800 font-bold leading-tight mt-0.5">Cukup (Tuntas)</span>
              </div>
              <div className="px-1.5 py-0.5">
                <span className="font-bold text-gray-900 block leading-tight">Predikat D</span>
                <span className="text-gray-700 font-mono font-medium text-[8.5px] sm:text-[9px]">&lt; 75</span>
                <span className="block text-[8px] sm:text-[8.5px] text-rose-800 font-bold leading-tight mt-0.5">Perlu Bimbingan</span>
              </div>
            </div>
          </div>

          {/* Catatan Regulasi Penilaian Rapor Kurikulum Merdeka */}
          <div className="mt-1 text-[8.5px] sm:text-[9px] text-gray-600 leading-snug px-0.5">
            <em>* Nilai Akhir (NA) diperoleh dari nilai sumatif lingkup materi dan sumatif akhir semester (SAS). Deskripsi capaian kompetensi mencerminkan kompetensi tertinggi yang dicapai dan kompetensi yang masih perlu ditingkatkan.</em>
          </div>
        </div>

        {/* Lembar 1 Page Footer */}
        <div className="flex justify-between items-center text-[9px] sm:text-[9.5px] text-gray-500 pt-1.5 border-t border-gray-300 mt-2">
          <span>{school.namaSekolah} — Laporan Hasil Belajar Siswa (Kurikulum Merdeka)</span>
          <span className="font-bold text-gray-700">Halaman 1 dari 2</span>
        </div>
      </div>

      {/* ==============================================================
          HALAMAN 2: EKSTRAKURIKULER, P5, PRESENSI, FISIK, CATATAN, PENGESAHAN
          Halaman 2 tetap di Halaman 2, tertata rapi, elegan, dan proporsional
         ============================================================== */}
      <div 
        className={`report-card-page report-sheet-2 bg-white text-black p-4 sm:p-6 print:p-0 rounded-2xl sm:border border-gray-200 shadow-md print:shadow-none print:border-none print:m-0 print:rounded-none a4-portrait-sheet ${isBulkPrint && !isLastInBulk ? 'break-after-page' : ''}`}
        style={{
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          ...(isBulkPrint && !isLastInBulk ? { breakAfter: 'page', pageBreakAfter: 'always' } : {})
        }}
      >
        {/* Banner Penanda Layar (Tersembunyi saat Cetak/PDF) */}
        <div className="print:hidden mb-2 pb-1.5 border-b border-gray-200 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-900 rounded-lg text-xs font-bold">
            📄 Halaman 2: Ekskul, P5, Presensi, Catatan & Tanda Tangan
          </span>
          <span className="text-xs text-gray-500 font-medium">
            Standar PDF A4: Halaman 2 dari 2
          </span>
        </div>

        {/* Running Header Lembar 2 */}
        <div className="flex justify-between items-center text-[10px] sm:text-[10.5px] text-gray-800 border-b-2 border-black pb-1 mb-2.5 leading-tight">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5">
            <span>Nama Siswa: <strong className="text-black font-bold">{student.namaLengkap}</strong></span>
            <span>NISN: <strong className="text-black font-mono">{student.nisn}</strong></span>
            <span>Kelas / Semester: <strong className="text-black">{student.kelas} / {academicPeriod.semesterNumber}</strong></span>
          </div>
          <span className="font-bold text-gray-700 uppercase text-[9.5px] sm:text-[10px] bg-gray-100 px-2 py-0.5 rounded border border-gray-300 shrink-0">
            Lembar 2
          </span>
        </div>

        {/* B. KEGIATAN EKSTRAKURIKULER */}
        <div className="mb-2.5">
          <div className="bg-gray-100 px-3 py-1 border border-gray-400 mb-1">
            <h4 className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wide text-gray-900">
              B. KEGIATAN EKSTRAKURIKULER
            </h4>
          </div>
          <table className="w-full text-[10px] sm:text-[10.5px] border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400 font-bold text-gray-900">
                <th className="py-1 px-1 border border-gray-400 w-8 text-center">No</th>
                <th className="py-1 px-2.5 border border-gray-400 text-left w-52">Kegiatan</th>
                <th className="py-1 px-2 border border-gray-400 w-24 text-center">Predikat</th>
                <th className="py-1 px-2.5 border border-gray-400 text-left">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {displayEkskuls.map((ek, idx) => (
                <tr key={ek.id || idx} className="border-b border-gray-300">
                  <td className="py-1.5 px-1 text-center border border-gray-300 font-mono text-gray-900">{idx + 1}</td>
                  <td className="py-1.5 px-2.5 font-semibold text-gray-950 border border-gray-300">{ek.nama}</td>
                  <td className="py-1.5 px-2 text-center font-bold text-gray-950 border border-gray-300">{ek.predikat}</td>
                  <td className="py-1.5 px-2.5 border border-gray-300 leading-snug text-gray-900">{ek.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* C. KOKURIKULER / PROYEK P5 */}
        <div className="mb-2.5">
          <div className="bg-gray-100 px-3 py-1 border border-gray-400 mb-1">
            <h4 className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wide text-gray-900">
              C. KOKURIKULER / PROJEK PENGUATAN PROFIL PELAJAR PANCASILA (P5)
            </h4>
          </div>
          <table className="w-full text-[10px] sm:text-[10.5px] border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400 font-bold text-gray-900">
                <th className="py-1 px-1 border border-gray-400 w-8 text-center">No</th>
                <th className="py-1 px-2.5 border border-gray-400 text-left w-56">Tema & Judul Projek</th>
                <th className="py-1 px-2.5 border border-gray-400 text-left">Catatan Perkembangan</th>
              </tr>
            </thead>
            <tbody>
              {displayP5.map((p, idx) => (
                <tr key={p.id || idx} className="border-b border-gray-300">
                  <td className="py-1.5 px-1 text-center border border-gray-300 font-mono align-top text-gray-900">{idx + 1}</td>
                  <td className="py-1.5 px-2.5 border border-gray-300 font-medium align-top">
                    <span className="block text-[9px] sm:text-[9.5px] text-gray-600 font-bold uppercase">{p.tema}</span>
                    <span className="font-semibold text-gray-950">{p.judul}</span>
                  </td>
                  <td className="py-1.5 px-2.5 border border-gray-300 leading-snug text-gray-900 align-top">
                    {p.catatan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* D. PRESENSI & E. FISIK KESEHATAN (GRID 2 KOLOM) */}
        <div className="grid grid-cols-2 gap-3 mb-2.5">
          {/* D. Presensi */}
          <div>
            <div className="bg-gray-100 px-3 py-1 border border-gray-400 mb-1">
              <h4 className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wide text-gray-900">
                D. KETIDAKHADIRAN (PRESENSI)
              </h4>
            </div>
            <table className="w-full text-[10px] sm:text-[10.5px] border-collapse border border-gray-400">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="py-1 px-2.5 border border-gray-300 font-semibold text-gray-950 w-36">Sakit (S)</td>
                  <td className="py-1 px-2.5 border border-gray-300 font-mono text-gray-900">: {attendance.sakit} hari</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-1 px-2.5 border border-gray-300 font-semibold text-gray-950">Izin (I)</td>
                  <td className="py-1 px-2.5 border border-gray-300 font-mono text-gray-900">: {attendance.izin} hari</td>
                </tr>
                <tr>
                  <td className="py-1 px-2.5 border border-gray-300 font-semibold text-gray-950">Tanpa Keterangan (A)</td>
                  <td className="py-1 px-2.5 border border-gray-300 font-mono text-gray-900">: {attendance.alpa} hari</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* E. Fisik & Kesehatan */}
          <div>
            <div className="bg-gray-100 px-3 py-1 border border-gray-400 mb-1">
              <h4 className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wide text-gray-900">
                E. PERKEMBANGAN FISIK & KESEHATAN
              </h4>
            </div>
            <table className="w-full text-[10px] sm:text-[10.5px] border-collapse border border-gray-400">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="py-1 px-2.5 border border-gray-300 font-semibold text-gray-950 w-36">Tinggi & Berat Badan</td>
                  <td className="py-1 px-2.5 border border-gray-300 font-mono text-gray-900">: {physicalAndHealth.tinggiBadan} / {physicalAndHealth.beratBadan}</td>
                </tr>
                <tr>
                  <td className="py-1 px-2.5 border border-gray-300 font-semibold text-gray-950">Kondisi Kesehatan</td>
                  <td className="py-1 px-2.5 border border-gray-300 leading-snug text-gray-900">: {physicalAndHealth.catatanKesehatan}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* F. CATATAN GURU / WALI KELAS */}
        <div className="mb-2.5">
          <div className="bg-gray-100 px-3 py-1 border border-gray-400 mb-1">
            <h4 className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wide text-gray-900">
              F. CATATAN GURU / WALI KELAS
            </h4>
          </div>
          <div className="border border-gray-400 p-2.5 rounded-sm bg-white text-[10px] sm:text-[10.5px] min-h-[44px] flex items-center">
            <p className="italic leading-relaxed text-gray-900">
              "{catatanWaliKelas || 'Menunjukkan sikap yang baik, tekun, dan berprestasi dalam seluruh aktivitas pembelajaran.'}"
            </p>
          </div>
        </div>

        {/* G. KEPUTUSAN KENAIKAN KELAS / KELULUSAN (KHUSUS SEMESTER GENAP) */}
        {academicPeriod.semester === 'Genap' && (
          <div className="mb-2.5">
            <div className="bg-gray-100 px-3 py-1 border border-gray-400 mb-1">
              <h4 className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wide text-gray-900">
                G. KEPUTUSAN KENAIKAN KELAS / KELULUSAN
              </h4>
            </div>
            <div className="border border-gray-400 p-2 text-center bg-white rounded-sm">
              <p className="text-[10px] sm:text-[10.5px] text-gray-800">
                Berdasarkan pencapaian seluruh kompetensi, peserta didik dinyatakan:
              </p>
              <div className="mt-1 inline-block px-4 py-1 bg-gray-50 border border-gray-800 rounded font-bold text-[11px] tracking-wider uppercase text-black">
                {keputusanKenaikan || 'NAIK KE KELAS BERIKUTNYA'}
              </div>
            </div>
          </div>
        )}

        {/* H. TANDA TANGAN PENGESAHAN RESMI (3 KOLOM) */}
        <div className="grid grid-cols-3 text-[10px] sm:text-[10.5px] text-center pt-2 gap-2 border-t border-gray-400 break-inside-avoid print:break-inside-avoid">
          {/* Kiri: Kepala Sekolah */}
          <div className="text-center">
            <p>Mengetahui,</p>
            <p className="font-semibold">Kepala Sekolah</p>
            <div className="h-12 sm:h-14" />
            <p className="font-bold underline leading-tight text-gray-950 text-[10.5px] sm:text-[11px]">{school.kepalaSekolah}</p>
            <p className="text-[9px] sm:text-[9.5px] font-mono text-gray-700 mt-0.5">NIP. {school.nipKepalaSekolah}</p>
          </div>

          {/* Tengah: Orang Tua / Wali */}
          <div className="text-center">
            <p>Mengetahui,</p>
            <p className="font-semibold">Orang Tua / Wali Siswa</p>
            <div className="h-12 sm:h-14" />
            <p className="font-bold border-b border-gray-400 inline-block px-6 leading-tight">
              ................................................
            </p>
          </div>

          {/* Kanan: Guru Kelas / Wali Kelas */}
          <div className="text-center">
            <p>{tempatRapor}, {formattedDate}</p>
            <p className="font-semibold">Guru Kelas / Wali Kelas</p>
            <div className="h-12 sm:h-14" />
            <p className="font-bold underline leading-tight text-gray-950 text-[10.5px] sm:text-[11px]">{homeroomTeacher?.namaLengkap || 'Guru Kelas'}</p>
            <p className="text-[9px] sm:text-[9.5px] font-mono text-gray-700 mt-0.5">NIP. {homeroomTeacher?.nip || '-'}</p>
          </div>
        </div>

        {/* Lembar 2 Page Footer */}
        <div className="flex justify-between items-center text-[9px] sm:text-[9.5px] text-gray-500 pt-1.5 border-t border-gray-300 mt-2">
          <span>{school.namaSekolah} — Laporan Hasil Belajar Siswa (Kurikulum Merdeka)</span>
          <span className="font-bold text-gray-700">Halaman 2 dari 2</span>
        </div>
      </div>
    </div>
  );
};
