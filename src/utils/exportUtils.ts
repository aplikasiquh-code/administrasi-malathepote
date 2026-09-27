import { Teacher, Student, SchoolProfile } from '../types';

export const exportTeachersCSV = (teachers: Teacher[], schoolName: string): void => {
  const headers = [
    'No',
    'NIP',
    'NUPTK',
    'Nama Lengkap & Gelar',
    'Jenis Kelamin',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Pendidikan Terakhir',
    'Jurusan',
    'Jabatan / Tugas',
    'Penugasan Kelas',
    'Status Kepegawaian',
    'Golongan',
    'Sertifikasi',
    'No HP',
    'Email',
    'Alamat'
  ];

  const rows = teachers.map((t, idx) => [
    (idx + 1).toString(),
    `"${t.nip || '-'}"`,
    `"${t.nuptk || '-'}"`,
    `"${t.namaLengkap}"`,
    t.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
    `"${t.tempatLahir}"`,
    t.tanggalLahir,
    t.pendidikanTerakhir,
    `"${t.jurusan}"`,
    `"${t.jabatan}"`,
    `"${t.penugasanKelas}"`,
    t.statusKepegawaian,
    t.golonganRuang || '-',
    t.sertifikasi ? 'Sudah Sertifikasi' : 'Belum Sertifikasi',
    `"${t.noHp}"`,
    `"${t.email}"`,
    `"${t.alamat.replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  downloadBlob(csvContent, `Data_Guru_${schoolName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
};

export const exportStudentsCSV = (students: Student[], schoolName: string, filterLabel = 'Semua_Kelas'): void => {
  const headers = [
    'No',
    'NIS',
    'NISN',
    'Nama Lengkap',
    'Nama Panggilan',
    'Kelas',
    'Jenis Kelamin',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Agama',
    'Nama Ayah',
    'Pekerjaan Ayah',
    'Nama Ibu',
    'Pekerjaan Ibu',
    'No HP Orang Tua',
    'Alamat Lengkap',
    'Kelurahan',
    'Kecamatan',
    'Status Siswa',
    'Sekolah Tujuan (Mutasi)',
    'Alasan Drop Out / Keluar',
    'Tanggal Masuk',
    'Catatan Prestasi'
  ];

  const rows = students.map((s, idx) => [
    (idx + 1).toString(),
    `"${s.nis}"`,
    `"${s.nisn}"`,
    `"${s.namaLengkap}"`,
    `"${s.namaPanggilan || '-'}"`,
    s.kelas,
    s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
    `"${s.tempatLahir}"`,
    s.tanggalLahir,
    s.agama,
    `"${s.namaAyah}"`,
    `"${s.pekerjaanAyah}"`,
    `"${s.namaIbu}"`,
    `"${s.pekerjaanIbu}"`,
    `"${s.noHpOrtu}"`,
    `"${s.alamat.replace(/"/g, '""')}"`,
    `"${s.kelurahan || '-'}"`,
    `"${s.kecamatan || '-'}"`,
    s.statusSiswa,
    `"${(s.sekolahTujuan || '-').replace(/"/g, '""')}"`,
    `"${(s.alasanKeluar || '-').replace(/"/g, '""')}"`,
    s.tanggalMasuk,
    `"${(s.catatanPrestasi || '-').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  downloadBlob(csvContent, `Data_Siswa_${filterLabel}_${schoolName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
};

const downloadBlob = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export interface PrintDocumentA4Options {
  orientation?: 'portrait' | 'landscape';
  title?: string;
  margin?: string;
}

/**
 * Standard A4 Print & Save to PDF Engine
 * Injects dynamic @page CSS rule for exact A4 page size and orientation (Portrait/Landscape),
 * sets document title for standard PDF filename generation, and safely cleans up after printing.
 */
export const printDocumentWithA4 = (
  options: 'portrait' | 'landscape' | PrintDocumentA4Options = 'portrait',
  legacyTitle?: string
) => {
  const orientation = typeof options === 'string' ? options : (options.orientation || 'portrait');
  const title = typeof options === 'string' ? legacyTitle : (options.title || legacyTitle);
  const margin = typeof options === 'object' && options.margin
    ? options.margin
    : (orientation === 'landscape' ? '8mm 10mm 8mm 10mm' : '8mm 10mm 8mm 10mm');

  const originalTitle = document.title;
  const cleanTitle = title ? title.replace(/[\\/:*?"<>|]/g, '_').trim() : '';
  if (cleanTitle) {
    document.title = cleanTitle;
  }

  // Remove previous dynamic style if still present
  const existingStyle = document.getElementById('dynamic-print-a4-style');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create standard A4 print stylesheet
  const styleEl = document.createElement('style');
  styleEl.id = 'dynamic-print-a4-style';
  styleEl.innerHTML = `
    @page {
      size: A4 ${orientation} !important;
      margin: ${margin} !important;
    }
    @media print {
      html, body {
        width: 100% !important;
        min-height: 0 !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
        overflow: visible !important;
        position: static !important;
      }
      header, aside, nav, .print\\:hidden, .no-print {
        display: none !important;
      }
      #root, #root > div, #main-app-container, main {
        width: 100% !important;
        max-width: 100% !important;
        min-height: 0 !important;
        height: auto !important;
        display: block !important;
        position: static !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
        overflow: visible !important;
        float: none !important;
      }
      .a4-portrait-sheet, .a4-landscape-sheet {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 auto !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
        display: block !important;
        position: static !important;
      }
      .a4-portrait-sheet:first-child,
      .a4-landscape-sheet:first-child,
      #printable-report-document,
      #official-student-report-card,
      #printable-buku-induk-document {
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
      /* Ensure background app workspace is hidden when printing inside a modal */
      body.print-modal-open #main-app-container,
      body.print-modal-open .app-non-printable {
        display: none !important;
      }
      body.print-modal-open .fixed,
      body.print-modal-open .backdrop-blur-sm,
      body.print-modal-open .backdrop-blur-md,
      body.print-modal-open .animate-in,
      .print-unclip {
        position: static !important;
        display: block !important;
        overflow: visible !important;
        max-height: none !important;
        height: auto !important;
        min-height: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
        transform: none !important;
        animation: none !important;
      }
      .report-sheet-1,
      .report-sheet-break,
      .break-after-page,
      .page-break-always {
        break-after: page !important;
        page-break-after: always !important;
      }
      .break-inside-avoid,
      .print-avoid-break {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
    }
  `;
  document.head.appendChild(styleEl);

  // Set body orientation classes
  document.body.classList.remove('print-portrait', 'print-landscape');
  document.body.classList.add(orientation === 'landscape' ? 'print-landscape' : 'print-portrait');

  // Trigger print dialog
  window.print();

  // Clean up safely after print dialog closes
  let isCleanedUp = false;
  const cleanup = () => {
    if (isCleanedUp) return;
    isCleanedUp = true;
    if (cleanTitle) {
      document.title = originalTitle;
    }
    const el = document.getElementById('dynamic-print-a4-style');
    if (el) {
      el.remove();
    }
    document.body.classList.remove('print-portrait', 'print-landscape');
  };

  // Modern browsers fire afterprint when dialog is closed/saved
  window.addEventListener('afterprint', cleanup, { once: true });
  // Generous safety fallback (60s) in case afterprint is missed
  setTimeout(cleanup, 60000);
};

export const printDirectDocument = (title: string, orientation: 'portrait' | 'landscape' = 'portrait') => {
  printDocumentWithA4({ orientation, title });
};

