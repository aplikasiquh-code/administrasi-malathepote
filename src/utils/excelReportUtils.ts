import * as XLSX from 'xlsx';
import { Student, Teacher, SchoolProfile, ClassRoomItem } from '../types';
import { formatReportDateIndonesian } from './reportAttendanceUtils';

/**
 * Export single student profile / biodata to Excel
 */
export const exportSingleStudentExcel = (student: Student, school?: SchoolProfile) => {
  const wb = XLSX.utils.book_new();

  const titleRows = [
    ['BIODATA BUKU INDUK SISWA SEKOLAH DASAR'],
    [school?.namaSekolah ? `${school.namaSekolah} — NPSN: ${school.npsn || '-'}` : 'DATA INDUK PESERTA DIDIK'],
    [`Tahun Ajaran: ${school?.tahunAjaran || '2025/2026'} | Dicetak: ${new Date().toLocaleDateString('id-ID')}`],
    []
  ];

  const dataRows = [
    ['A. IDENTITAS PESERTA DIDIK', ''],
    ['1. Nama Lengkap', student.namaLengkap],
    ['2. Nama Panggilan', student.namaPanggilan || '-'],
    ['3. Nomor Induk Siswa (NIS)', student.nis],
    ['4. NISN', student.nisn],
    ['5. Rombel / Kelas', `Kelas ${student.kelas}`],
    ['6. Jenis Kelamin', student.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'],
    ['7. Tempat, Tanggal Lahir', `${student.tempatLahir}, ${student.tanggalLahir}`],
    ['8. Agama', student.agama],
    ['9. Anak ke-', student.anakKe ? `${student.anakKe} dari ${student.jumlahSaudara || 1} bersaudara` : '-'],
    ['10. Status Keaktifan', student.statusSiswa],
    ['11. Tanggal Masuk Sekolah', student.tanggalMasuk || '-'],
    ['', ''],
    ['B. DATA ORANG TUA / WALI', ''],
    ['1. Nama Ayah Kandung', student.namaAyah || '-'],
    ['2. Pekerjaan Ayah', student.pekerjaanAyah || '-'],
    ['3. Nama Ibu Kandung', student.namaIbu || '-'],
    ['4. Pekerjaan Ibu', student.pekerjaanIbu || '-'],
    ['5. Nama Wali (jika ada)', student.namaWali || '-'],
    ['6. Nomor HP / WhatsApp Ortu', student.noHpOrtu || '-'],
    ['', ''],
    ['C. ALAMAT & DOMISILI', ''],
    ['1. Alamat Lengkap', student.alamat || '-'],
    ['2. Desa / Kelurahan', student.kelurahan || '-'],
    ['3. Kecamatan', student.kecamatan || '-'],
    ['', ''],
    ['D. CATATAN PRESTASI & KESEHATAN', ''],
    ['1. Catatan Prestasi Siswa', student.catatanPrestasi || '-'],
    ['2. Riwayat Kesehatan', student.catatanKesehatan || '-'],
    ['3. Sekolah Tujuan (Jika Pindah)', student.sekolahTujuan || '-'],
    ['4. Alasan Keluar (Jika Drop Out)', student.alasanKeluar || '-']
  ];

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, ...dataRows]);

  ws['!cols'] = [
    { wch: 32 },
    { wch: 45 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Biodata Siswa');
  const safeName = student.namaLengkap.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `Biodata_Siswa_${safeName}_Kls${student.kelas}.xlsx`);
};

/**
 * Export single teacher profile to Excel
 */
export const exportSingleTeacherExcel = (teacher: Teacher, school?: SchoolProfile) => {
  const wb = XLSX.utils.book_new();

  const titleRows = [
    ['BIODATA GURU & TENAGA KEPENDIDIKAN (GTK)'],
    [school?.namaSekolah ? `${school.namaSekolah} — NPSN: ${school.npsn || '-'}` : 'DATA PEGAWAI'],
    [`Dicetak: ${new Date().toLocaleDateString('id-ID')}`],
    []
  ];

  const dataRows = [
    ['A. IDENTITAS UTAMA GTK', ''],
    ['1. Nama Lengkap & Gelar', `${teacher.namaLengkap}${teacher.gelar ? ', ' + teacher.gelar : ''}`],
    ['2. NIP', teacher.nip || '-'],
    ['3. NUPTK', teacher.nuptk || '-'],
    ['4. Jenis Kelamin', teacher.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'],
    ['5. Tempat, Tanggal Lahir', `${teacher.tempatLahir}, ${teacher.tanggalLahir}`],
    ['6. Status Kepegawaian', teacher.statusKepegawaian],
    ['7. Golongan / Ruang', teacher.golonganRuang || '-'],
    ['8. Jabatan / Tugas Pokok', teacher.jabatan],
    ['9. Penugasan Kelas', teacher.penugasanKelas],
    ['10. Sertifikasi Pendidik', teacher.sertifikasi ? 'Sudah Sertifikasi (Lulus Sertifikasi)' : 'Belum Sertifikasi'],
    ['11. TMT Kerja (Mulai Tugas)', teacher.tmtKerja || '-'],
    ['12. Status Keaktifan', teacher.statusAktif ? 'Aktif Mengajar' : 'Non-Aktif'],
    ['', ''],
    ['B. PENDIDIKAN & KEAHLIAN', ''],
    ['1. Pendidikan Terakhir', teacher.pendidikanTerakhir],
    ['2. Jurusan / Program Studi', teacher.jurusan],
    ['', ''],
    ['C. KONTAK & ALAMAT DOMISILI', ''],
    ['1. Nomor HP / WhatsApp', teacher.noHp],
    ['2. Alamat Email', teacher.email],
    ['3. Alamat Lengkap', teacher.alamat]
  ];

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, ...dataRows]);

  ws['!cols'] = [
    { wch: 32 },
    { wch: 45 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Biodata GTK');
  const safeName = teacher.namaLengkap.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `Biodata_Guru_${safeName}.xlsx`);
};

/**
 * Export School Profile to Excel
 */
export const exportSchoolProfileExcel = (
  school: SchoolProfile,
  studentCount: number,
  teacherCount: number,
  printDate?: string,
  printPlace?: string
) => {
  const wb = XLSX.utils.book_new();

  const formattedDate = printDate ? formatReportDateIndonesian(printDate) : formatReportDateIndonesian(new Date().toISOString().slice(0, 10));
  const place = printPlace || school.kabupatenKota || 'Kota';

  const titleRows = [
    ['PROFIL SATUAN PENDIDIKAN RESMI'],
    [school.namaSekolah],
    [`NPSN: ${school.npsn} | NSS: ${school.nss || '-'} | Akreditasi: ${school.akreditasi}`],
    [`Tahun Ajaran: ${school.tahunAjaran} | Semester: ${school.semester} | Tanggal Cetak: ${place}, ${formattedDate}`],
    []
  ];

  const dataRows = [
    ['1. IDENTITAS SATUAN PENDIDIKAN', ''],
    ['Nama Sekolah', school.namaSekolah],
    ['NPSN', school.npsn],
    ['NSS', school.nss || '-'],
    ['Bentuk Pendidikan', 'Sekolah Dasar (SD)'],
    ['Status Sekolah', school.statusSekolah],
    ['Status Akreditasi', school.akreditasi],
    ['Kurikulum yang Digunakan', school.kurikulum],
    ['Tahun Ajaran Aktif', school.tahunAjaran],
    ['Semester Aktif', school.semester],
    ['', ''],
    ['2. KEPALA SEKOLAH & MANAJEMEN', ''],
    ['Nama Kepala Sekolah', school.kepalaSekolah],
    ['NIP Kepala Sekolah', school.nipKepalaSekolah || '-'],
    ['', ''],
    ['3. ALAMAT & KONTAK RESMI', ''],
    ['Alamat Lengkap', school.alamatJalan],
    ['Kelurahan / Desa', school.desaKelurahan || '-'],
    ['Kecamatan', school.kecamatan || '-'],
    ['Kabupaten / Kota', school.kabupatenKota || '-'],
    ['Provinsi', school.provinsi || '-'],
    ['Kode Pos', school.kodePos || '-'],
    ['Nomor Telepon', school.telepon || '-'],
    ['Email Sekolah', school.email || '-'],
    ['Website Resmi', school.website || '-'],
    ['', ''],
    ['4. REKAPITULASI DATA WARGA SEKOLAH', ''],
    ['Total Peserta Didik Aktif', `${studentCount} Siswa`],
    ['Total Guru & Tenaga Kependidikan', `${teacherCount} Orang`],
    ['', ''],
    ['5. PENGESAHAN DOKUMEN', ''],
    ['Tempat & Tanggal Cetak', `${place}, ${formattedDate}`],
    ['Kepala Sekolah', school.kepalaSekolah],
    ['NIP Kepala Sekolah', school.nipKepalaSekolah || '-']
  ];

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, ...dataRows]);

  ws['!cols'] = [
    { wch: 35 },
    { wch: 45 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Profil Sekolah');
  const safeSchool = school.namaSekolah.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `Profil_Sekolah_${safeSchool}_${printDate || new Date().toISOString().slice(0, 10)}.xlsx`);
};

/**
 * Export Form 8355 / Student Demographics Summary Table to Excel
 */
export const exportForm8355RecapExcel = (
  school: SchoolProfile,
  students: Student[],
  classes: string[],
  printDate?: string,
  printPlace?: string
) => {
  const wb = XLSX.utils.book_new();

  const formattedDate = printDate ? formatReportDateIndonesian(printDate) : formatReportDateIndonesian(new Date().toISOString().slice(0, 10));
  const place = printPlace || school.kabupatenKota || 'Kota';

  const titleRows = [
    [`REKAPITULASI PESERTA DIDIK FORM 8355 RESMI SD`],
    [school.namaSekolah],
    [`Tahun Pelajaran: ${school.tahunAjaran} | Semester: ${school.semester} | Tanggal Cetak: ${place}, ${formattedDate}`],
    []
  ];

  const summaryHeaders = ['No', 'Tingkat / Rombel', 'Laki-laki (L)', 'Perempuan (P)', 'Jumlah Siswa'];
  
  const activeStudents = students.filter(s => s.statusSiswa === 'Aktif');

  let totalL = 0;
  let totalP = 0;
  let grandTotal = 0;

  const summaryRows = classes.map((cls, idx) => {
    const list = activeStudents.filter(s => s.kelas === cls);
    const l = list.filter(s => s.jenisKelamin === 'L').length;
    const p = list.filter(s => s.jenisKelamin === 'P').length;
    const tot = list.length;

    totalL += l;
    totalP += p;
    grandTotal += tot;

    return [idx + 1, `Kelas ${cls}`, l, p, tot];
  });

  const totalRow = ['', 'TOTAL KESELURUHAN', totalL, totalP, grandTotal];

  const ws = XLSX.utils.aoa_to_sheet([
    ...titleRows,
    summaryHeaders,
    ...summaryRows,
    totalRow,
    [],
    ['DAFTAR RINCI PESERTA DIDIK AKTIF:'],
    ['No', 'NIS', 'NISN', 'Nama Lengkap', 'L/P', 'Kelas', 'Tempat Lahir', 'Tanggal Lahir', 'Agama', 'Nama Ayah', 'Nama Ibu', 'No HP Ortu', 'Alamat']
  ]);

  const detailRows = activeStudents.map((s, idx) => [
    idx + 1,
    s.nis,
    s.nisn,
    s.namaLengkap,
    s.jenisKelamin,
    `Kelas ${s.kelas}`,
    s.tempatLahir,
    s.tanggalLahir,
    s.agama,
    s.namaAyah,
    s.namaIbu,
    s.noHpOrtu,
    s.alamat
  ]);

  XLSX.utils.sheet_add_aoa(ws, detailRows, { origin: -1 });

  // Add signature footer
  const signRows = [
    [],
    ['', '', '', '', `${place}, ${formattedDate}`],
    ['Mengetahui,', '', '', '', 'Petugas Administrasi / Wali Kelas'],
    [`Kepala ${school.namaSekolah}`, '', '', '', ''],
    [],
    [],
    [school.kepalaSekolah, '', '', '', '....................................................'],
    [`NIP. ${school.nipKepalaSekolah || '-'}`, '', '', '', 'NIP. ..............................................']
  ];
  XLSX.utils.sheet_add_aoa(ws, signRows, { origin: -1 });

  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 16 },
    { wch: 30 },
    { wch: 8 },
    { wch: 12 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 20 },
    { wch: 20 },
    { wch: 16 },
    { wch: 35 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Siswa 8355');
  const safeSchool = school.namaSekolah.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `Rekap_Siswa_8355_${safeSchool}_${printDate || new Date().toISOString().slice(0, 10)}.xlsx`);
};

/**
 * Export Blank or Filled Attendance format sheet for a class
 */
export const exportAttendanceFormatExcel = (
  grade: string,
  studentsInClass: Student[],
  monthStr: string,
  school: SchoolProfile,
  waliKelas?: string,
  printDate?: string,
  printPlace?: string
) => {
  const wb = XLSX.utils.book_new();

  const [yearStr, monthNumStr] = monthStr.split('-');
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const monthIndex = (parseInt(monthNumStr, 10) || 1) - 1;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthName = monthNames[monthIndex] || 'Bulan';

  const formattedDate = printDate ? formatReportDateIndonesian(printDate) : formatReportDateIndonesian(new Date().toISOString().slice(0, 10));
  const place = printPlace || school.kabupatenKota || 'Kota';

  const titleRows = [
    [`DAFTAR HADIR SISWA BULANAN (FORMAT PRESENSI KELAS)`],
    [`${school.namaSekolah} — KELAS ${grade}`],
    [`Bulan: ${monthName} ${year} | Tahun Ajaran: ${school.tahunAjaran} | Tanggal Cetak: ${place}, ${formattedDate}`],
    [`Wali Kelas: ${waliKelas || '-'} | Kepala Sekolah: ${school.kepalaSekolah}`],
    []
  ];

  const headers = ['No', 'NISN', 'Nama Siswa', 'L/P'];
  for (let d = 1; d <= daysInMonth; d++) {
    headers.push(String(d));
  }
  headers.push('H', 'S', 'I', 'A', 'Ket');

  const rows = studentsInClass.map((s, idx) => {
    const row = [idx + 1, s.nisn, s.namaLengkap, s.jenisKelamin];
    for (let d = 1; d <= daysInMonth; d++) {
      row.push('');
    }
    row.push('', '', '', '', '');
    return row;
  });

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, headers, ...rows]);

  // Append signature
  const signRows = [
    [],
    ['', '', '', `${place}, ${formattedDate}`],
    ['Mengetahui,', '', '', `Wali Kelas ${grade}`],
    [`Kepala ${school.namaSekolah}`, '', '', ''],
    [],
    [],
    [school.kepalaSekolah, '', '', waliKelas || '....................................................'],
    [`NIP. ${school.nipKepalaSekolah || '-'}`, '', '', 'NIP. ..............................................']
  ];
  XLSX.utils.sheet_add_aoa(ws, signRows, { origin: -1 });

  const cols = [
    { wch: 5 },
    { wch: 14 },
    { wch: 28 },
    { wch: 5 }
  ];
  for (let d = 1; d <= daysInMonth; d++) {
    cols.push({ wch: 4 });
  }
  cols.push({ wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 12 });

  ws['!cols'] = cols;

  XLSX.utils.book_append_sheet(wb, ws, `Presensi Kls ${grade}`);
  XLSX.writeFile(wb, `Format_Daftar_Hadir_Kelas_${grade}_${monthName}_${year}.xlsx`);
};
