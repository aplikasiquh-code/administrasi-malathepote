import * as XLSX from 'xlsx';
import { Student, Gender, ClassGrade, StudentStatus, Religion } from '../types';

export interface ParsedStudentRow {
  isValid: boolean;
  errors: string[];
  data: Student;
  originalRow: Record<string, any>;
}

// Flexible column name matching dictionary
const FIELD_ALIASES: Record<string, string[]> = {
  namaLengkap: ['nama', 'nama lengkap', 'nama siswa', 'nama peserta didik', 'nama_lengkap', 'full name', 'student name', 'name', 'nama murid'],
  namaPanggilan: ['nama panggilan', 'panggilan', 'nickname', 'nama_panggilan'],
  nis: ['nis', 'nomor induk', 'no induk', 'nis siswa', 'no_induk', 'nomor induk siswa', 'no_nis'],
  nisn: ['nisn', 'nomor induk siswa nasional', 'no nisn', 'nisn (10 digit)', 'no_nisn'],
  jenisKelamin: ['jenis kelamin', 'jk', 'l/p', 'gender', 'sex', 'jenis_kelamin'],
  kelas: ['kelas', 'rombel', 'kelas / rombel', 'kelas/rombel', 'rombel saat ini', 'tingkat kelas', 'grade', 'class', 'tingkat'],
  tempatLahir: ['tempat lahir', 'tempat_lahir', 'tmp lahir', 'kota lahir', 'birth place'],
  tanggalLahir: ['tanggal lahir', 'tgl lahir', 'tanggal_lahir', 'tgl_lahir', 'birth date', 'dob'],
  agama: ['agama', 'religion', 'kepercayaan'],
  namaAyah: ['nama ayah', 'ayah', 'nama orang tua (ayah)', 'ayah kandung', 'father name', 'father', 'nama_ayah'],
  pekerjaanAyah: ['pekerjaan ayah', 'pekerjaan_ayah', 'pekerjaan orang tua', 'job father', 'profesi ayah'],
  namaIbu: ['nama ibu', 'ibu', 'nama orang tua (ibu)', 'ibu kandung', 'mother name', 'mother', 'nama_ibu'],
  pekerjaanIbu: ['pekerjaan ibu', 'pekerjaan_ibu', 'job mother', 'profesi ibu'],
  alamatOrtu: ['alamat ortu', 'alamat orang tua', 'alamat_ortu', 'alamat orangtua'],
  namaWali: ['nama wali', 'wali', 'guardian', 'nama_wali'],
  hubunganWali: ['hubungan wali', 'hubungan keluarga wali', 'status wali', 'hubungan_wali'],
  pekerjaanWali: ['pekerjaan wali', 'pekerjaan_wali', 'profesi wali'],
  alamatWali: ['alamat wali', 'alamat_wali'],
  noHpWali: ['no hp wali', 'hp wali', 'telepon wali', 'no_hp_wali'],
  noHpOrtu: ['no hp ortu', 'no hp', 'no handphone ortu', 'no telepon ortu', 'telepon ortu', 'no whatsapp', 'wa ortu', 'hp ortu', 'phone', 'whatsapp'],
  alamat: ['alamat', 'alamat rumah', 'alamat tinggal', 'domisili', 'alamat lengkap', 'address', 'tempat tinggal'],
  rtRw: ['rt rw', 'rt/rw', 'rt_rw', 'rt', 'rw'],
  kelurahan: ['kelurahan', 'desa', 'kelurahan/desa', 'desa/kelurahan', 'desa_kelurahan'],
  kecamatan: ['kecamatan'],
  kabupatenKota: ['kabupaten', 'kota', 'kabupaten kota', 'kabupaten/kota', 'kab_kota'],
  provinsi: ['provinsi', 'propinsi'],
  kodePos: ['kode pos', 'kodepos', 'postal code', 'zip'],
  pendidikanSebelumnya: ['pendidikan sebelumnya', 'asal sekolah', 'asal tk', 'tk', 'paud', 'pendidikan_sebelumnya', 'sekolah asal'],
  diterimaDiKelas: ['diterima di kelas', 'diterima kelas', 'kelas diterima', 'diterima_di_kelas'],
  statusSiswa: ['status', 'status siswa', 'keaktifan', 'status_siswa', 'status keaktifan'],
  tanggalMasuk: ['tanggal masuk', 'tgl masuk', 'tahun masuk', 'tanggal_masuk', 'tgl_masuk'],
  anakKe: ['anak ke', 'anak ke-', 'anak_ke'],
  jumlahSaudara: ['jumlah saudara', 'jml saudara', 'jumlah_saudara'],
  catatanPrestasi: ['catatan prestasi', 'prestasi', 'catatan', 'keterangan', 'prestasi siswa'],
  catatanKesehatan: ['catatan kesehatan', 'kesehatan', 'riwayat kesehatan', 'riwayat penyakit'],
  sekolahTujuan: ['sekolah tujuan', 'tujuan sekolah', 'sekolah_tujuan', 'tujuan mutasi', 'tujuan pindah', 'sekolah pindah'],
  alasanKeluar: ['alasan keluar', 'alasan do', 'alasan drop out', 'alasan_keluar', 'alasan putus sekolah'],
  fotoUrl: ['foto', 'foto url', 'foto siswa', 'photo', 'avatar', 'image', 'picture', 'link foto', 'foto_url']
};

/**
 * Normalizes header string for fuzzy matching
 */
const cleanKey = (key: string): string => {
  return key.toLowerCase().trim().replace(/[^a-z0-9]/g, ' ');
};

/**
 * Finds which standard field matches an excel column key
 */
const matchField = (header: string): string | null => {
  const cleaned = cleanKey(header);
  for (const [standardKey, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const alias of aliases) {
      if (cleaned === alias || cleaned.includes(alias)) {
        return standardKey;
      }
    }
  }
  return null;
};

/**
 * Parses date value from Excel (serial number or formatted string)
 */
export const parseDateValue = (val: any, defaultVal = '2018-05-10'): string => {
  if (!val) return defaultVal;

  if (typeof val === 'number') {
    // Excel date serial number conversion
    const parsed = XLSX.SSF.parse_date_code(val);
    if (parsed) {
      const yyyy = parsed.y;
      const mm = String(parsed.m).padStart(2, '0');
      const dd = String(parsed.d).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  const str = String(val).trim();
  // Check ISO format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  // Check Indonesian format DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const dd = dmyMatch[1].padStart(2, '0');
    const mm = dmyMatch[2].padStart(2, '0');
    const yyyy = dmyMatch[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  // Try Date parse
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }

  return defaultVal;
};

/**
 * Normalizes Gender to 'L' | 'P'
 */
export const normalizeGender = (val: any): Gender => {
  if (!val) return 'L';
  const str = String(val).toUpperCase().trim();
  if (str.startsWith('P') || str.includes('PEREMPUAN') || str.includes('WANITA') || str === 'F') {
    return 'P';
  }
  return 'L';
};

/**
 * Normalizes Class Grade to valid ClassGrade (e.g. 1A, 1B, 1C, 6C, etc.)
 */
export const normalizeClassGrade = (val: any): ClassGrade => {
  if (!val) return '1A';
  let str = String(val).toUpperCase().trim().replace(/KELAS|\s+/g, '');
  
  // Roman numerals mapping
  str = str.replace(/^VI/, '6')
           .replace(/^IV/, '4')
           .replace(/^V/, '5')
           .replace(/^III/, '3')
           .replace(/^II/, '2')
           .replace(/^I/, '1');

  // Handle single digit "1" -> "1A"
  if (/^[1-6]$/.test(str)) {
    return `${str}A`;
  }

  // Handle "1-A" or "1_A"
  const match = str.match(/([1-6])[-_]?([A-Z])/);
  if (match) {
    return `${match[1]}${match[2]}`;
  }

  if (str) return str;

  return '1A';
};

/**
 * Normalizes Religion
 */
export const normalizeReligion = (val: any): Religion => {
  if (!val) return 'Islam';
  const str = String(val).toLowerCase().trim();
  if (str.includes('kristen') || str.includes('protestan')) return 'Kristen';
  if (str.includes('katolik')) return 'Katolik';
  if (str.includes('hindu')) return 'Hindu';
  if (str.includes('buddha') || str.includes('budha')) return 'Buddha';
  if (str.includes('konghucu') || str.includes('khonghucu')) return 'Konghucu';
  return 'Islam';
};

/**
 * Normalizes Student Status
 */
export const normalizeStudentStatus = (val: any): StudentStatus => {
  if (!val) return 'Aktif';
  const str = String(val).toLowerCase().trim();
  if (str.includes('pindah') || str.includes('mutasi')) return 'Pindah';
  if (str.includes('lulus') || str.includes('alumni')) return 'Lulus';
  if (str.includes('non') || str.includes('keluar') || str.includes('do') || str.includes('drop')) return 'Non-Aktif';
  return 'Aktif';
};

/**
 * Parse an Excel or CSV file buffer into structured Student array with validation
 */
export const parseStudentExcelFile = async (file: File): Promise<{
  results: ParsedStudentRow[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
}> => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Berkas Excel kosong atau tidak memiliki lembar kerja (worksheet).');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  // Convert sheet to JSON rows as objects
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: true });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('Tidak ditemukan data peserta didik pada berkas Excel.');
  }

  const results: ParsedStudentRow[] = [];

  rawRows.forEach((row, index) => {
    const mapped: Record<string, any> = {};
    
    // Map each column key to standard field
    Object.keys(row).forEach((colKey) => {
      const standardKey = matchField(colKey);
      if (standardKey && (mapped[standardKey] === undefined || mapped[standardKey] === '')) {
        mapped[standardKey] = row[colKey];
      }
    });

    const errors: string[] = [];

    const namaLengkapRaw = mapped.namaLengkap ? String(mapped.namaLengkap).trim() : '';
    if (!namaLengkapRaw) {
      errors.push('Nama lengkap siswa tidak boleh kosong');
    }

    // Clean NIS & NISN
    let nisRaw = mapped.nis ? String(mapped.nis).trim().replace(/[^0-9]/g, '') : '';
    if (!nisRaw) {
      nisRaw = `2025${String(index + 1).padStart(3, '0')}`;
    }

    let nisnRaw = mapped.nisn ? String(mapped.nisn).trim().replace(/[^0-9]/g, '') : '';
    if (!nisnRaw) {
      nisnRaw = `318${Math.floor(1000000 + Math.random() * 9000000)}`;
    }

    const namaPanggilan = mapped.namaPanggilan ? String(mapped.namaPanggilan).trim() : (namaLengkapRaw.split(' ')[0] || '');
    const jenisKelamin = normalizeGender(mapped.jenisKelamin);
    const kelas = normalizeClassGrade(mapped.kelas);
    const tempatLahir = mapped.tempatLahir ? String(mapped.tempatLahir).trim() : 'Kota Sekolah';
    const tanggalLahir = parseDateValue(mapped.tanggalLahir, '2018-05-10');
    const agama = normalizeReligion(mapped.agama);
    const namaAyah = mapped.namaAyah ? String(mapped.namaAyah).trim() : '-';
    const pekerjaanAyah = mapped.pekerjaanAyah ? String(mapped.pekerjaanAyah).trim() : 'Wiraswasta';
    const namaIbu = mapped.namaIbu ? String(mapped.namaIbu).trim() : '-';
    const pekerjaanIbu = mapped.pekerjaanIbu ? String(mapped.pekerjaanIbu).trim() : 'Ibu Rumah Tangga';
    const namaWali = mapped.namaWali ? String(mapped.namaWali).trim() : undefined;
    const noHpOrtu = mapped.noHpOrtu ? String(mapped.noHpOrtu).trim() : '081234567890';
    const alamat = mapped.alamat ? String(mapped.alamat).trim() : 'Alamat Domisili Siswa';
    const kelurahan = mapped.kelurahan ? String(mapped.kelurahan).trim() : '';
    const kecamatan = mapped.kecamatan ? String(mapped.kecamatan).trim() : '';
    const statusSiswa = normalizeStudentStatus(mapped.statusSiswa);
    const tanggalMasuk = parseDateValue(mapped.tanggalMasuk, new Date().toISOString().slice(0, 10));
    const anakKe = mapped.anakKe ? parseInt(String(mapped.anakKe), 10) || 1 : 1;
    const jumlahSaudara = mapped.jumlahSaudara ? parseInt(String(mapped.jumlahSaudara), 10) || 1 : 1;
    const catatanPrestasi = mapped.catatanPrestasi ? String(mapped.catatanPrestasi).trim() : '';
    const catatanKesehatan = mapped.catatanKesehatan ? String(mapped.catatanKesehatan).trim() : '';
    const sekolahTujuan = mapped.sekolahTujuan ? String(mapped.sekolahTujuan).trim() : '';
    const alasanKeluar = mapped.alasanKeluar ? String(mapped.alasanKeluar).trim() : '';

    const studentObj: Student = {
      id: `student-${Date.now()}-${index}-${Math.floor(Math.random() * 10000)}`,
      nis: nisRaw,
      nisn: nisnRaw,
      namaLengkap: namaLengkapRaw || `Siswa Baru #${index + 1}`,
      namaPanggilan,
      jenisKelamin,
      kelas,
      tempatLahir,
      tanggalLahir,
      agama,
      namaAyah,
      pekerjaanAyah,
      namaIbu,
      pekerjaanIbu,
      alamatOrtu: mapped.alamatOrtu ? String(mapped.alamatOrtu).trim() : undefined,
      namaWali,
      pekerjaanWali: mapped.pekerjaanWali ? String(mapped.pekerjaanWali).trim() : undefined,
      alamatWali: mapped.alamatWali ? String(mapped.alamatWali).trim() : undefined,
      hubunganWali: mapped.hubunganWali ? String(mapped.hubunganWali).trim() : undefined,
      noHpWali: mapped.noHpWali ? String(mapped.noHpWali).trim() : undefined,
      noHpOrtu,
      alamat,
      rtRw: mapped.rtRw ? String(mapped.rtRw).trim() : undefined,
      kelurahan,
      kecamatan,
      kabupatenKota: mapped.kabupatenKota ? String(mapped.kabupatenKota).trim() : undefined,
      provinsi: mapped.provinsi ? String(mapped.provinsi).trim() : undefined,
      kodePos: mapped.kodePos ? String(mapped.kodePos).trim() : undefined,
      pendidikanSebelumnya: mapped.pendidikanSebelumnya ? String(mapped.pendidikanSebelumnya).trim() : 'TK / PAUD / RA',
      diterimaDiKelas: mapped.diterimaDiKelas ? String(mapped.diterimaDiKelas).trim() : (kelas as string),
      statusSiswa,
      tanggalMasuk,
      anakKe,
      jumlahSaudara,
      catatanPrestasi,
      catatanKesehatan,
      sekolahTujuan: sekolahTujuan || undefined,
      alasanKeluar: alasanKeluar || undefined,
      fotoUrl: mapped.fotoUrl ? String(mapped.fotoUrl).trim() : undefined
    };

    results.push({
      isValid: errors.length === 0,
      errors,
      data: studentObj,
      originalRow: row
    });
  });

  const validRows = results.filter(r => r.isValid).length;
  const invalidRows = results.filter(r => !r.isValid).length;

  return {
    results,
    totalRows: results.length,
    validRows,
    invalidRows
  };
};

/**
 * Downloads standard Excel (.xlsx) template for student import
 */
export const downloadStudentExcelTemplate = () => {
  const sampleData = [
    {
      'Nama Lengkap': 'Muhammad Rizky Pratama',
      'Nama Panggilan': 'Rizky',
      'NIS': '2025001',
      'NISN (10 Digit)': '3184920191',
      'Kelas / Rombel (1A-6B)': '1A',
      'Jenis Kelamin (L/P)': 'L',
      'Tempat Lahir': 'Bandung',
      'Tanggal Lahir (YYYY-MM-DD)': '2018-05-12',
      'Agama': 'Islam',
      'Nama Ayah': 'Hendra Pratama',
      'Pekerjaan Ayah': 'Karyawan Swasta',
      'Nama Ibu': 'Dewi Lestari',
      'Pekerjaan Ibu': 'Ibu Rumah Tangga',
      'No HP Ortu / WA': '081234567890',
      'Alamat Lengkap': 'Jl. Kenanga No. 15 RT 02/05',
      'Status Siswa (Aktif/Pindah/Lulus)': 'Aktif',
      'Tanggal Masuk (YYYY-MM-DD)': '2024-07-15',
      'Catatan Prestasi': 'Juara 1 Lomba Mewarnai Tingkat Kecamatan'
    },
    {
      'Nama Lengkap': 'Aisyah Putri Azzahra',
      'Nama Panggilan': 'Aisyah',
      'NIS': '2025002',
      'NISN (10 Digit)': '3184920192',
      'Kelas / Rombel (1A-6B)': '1A',
      'Jenis Kelamin (L/P)': 'P',
      'Tempat Lahir': 'Jakarta',
      'Tanggal Lahir (YYYY-MM-DD)': '2018-08-20',
      'Agama': 'Islam',
      'Nama Ayah': 'Agus Setiawan',
      'Pekerjaan Ayah': 'PNS',
      'Nama Ibu': 'Rina Anggraini',
      'Pekerjaan Ibu': 'Guru',
      'No HP Ortu / WA': '081398765432',
      'Alamat Lengkap': 'Komplek Griya Indah Blok B-3',
      'Status Siswa (Aktif/Pindah/Lulus)': 'Aktif',
      'Tanggal Masuk (YYYY-MM-DD)': '2024-07-15',
      'Catatan Prestasi': 'Peringkat 1 Lomba Membaca Puisi Anak'
    },
    {
      'Nama Lengkap': 'Dimas Satria Wibowo',
      'Nama Panggilan': 'Dimas',
      'NIS': '2024015',
      'NISN (10 Digit)': '3173829103',
      'Kelas / Rombel (1A-6B)': '2B',
      'Jenis Kelamin (L/P)': 'L',
      'Tempat Lahir': 'Semarang',
      'Tanggal Lahir (YYYY-MM-DD)': '2017-03-14',
      'Agama': 'Islam',
      'Nama Ayah': 'Bambang Wibowo',
      'Pekerjaan Ayah': 'Wiraswasta',
      'Nama Ibu': 'Sri Wahyuni',
      'Pekerjaan Ibu': 'Ibu Rumah Tangga',
      'No HP Ortu / WA': '085712349988',
      'Alamat Lengkap': 'Jl. Dahlia No. 42 RT 01/03',
      'Status Siswa (Aktif/Pindah/Lulus)': 'Aktif',
      'Tanggal Masuk (YYYY-MM-DD)': '2023-07-17',
      'Catatan Prestasi': 'Anggota Tim Futsal Juara 2 Antar SD'
    },
    {
      'Nama Lengkap': 'Grace Clarissa Manullang',
      'Nama Panggilan': 'Grace',
      'NIS': '2023028',
      'NISN (10 Digit)': '3162718294',
      'Kelas / Rombel (1A-6B)': '3A',
      'Jenis Kelamin (L/P)': 'P',
      'Tempat Lahir': 'Medan',
      'Tanggal Lahir (YYYY-MM-DD)': '2016-11-08',
      'Agama': 'Kristen',
      'Nama Ayah': 'Robert Manullang',
      'Pekerjaan Ayah': 'TNI / POLRI',
      'Nama Ibu': 'Maria Simanjuntak',
      'Pekerjaan Ibu': 'Bidan',
      'No HP Ortu / WA': '082199887766',
      'Alamat Lengkap': 'Asrama Polisi Blok C No. 8',
      'Status Siswa (Aktif/Pindah/Lulus/Non-Aktif)': 'Aktif',
      'Tanggal Masuk (YYYY-MM-DD)': '2022-07-18',
      'Catatan Prestasi': 'Juara 3 Olimpiade Sains Kuark',
      'Sekolah Tujuan (Jika Mutasi)': '',
      'Alasan Keluar (Jika Drop Out)': ''
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 28 }, // Nama Lengkap
    { wch: 16 }, // Nama Panggilan
    { wch: 14 }, // NIS
    { wch: 20 }, // NISN
    { wch: 24 }, // Kelas
    { wch: 20 }, // Jenis Kelamin
    { wch: 16 }, // Tempat Lahir
    { wch: 26 }, // Tanggal Lahir
    { wch: 14 }, // Agama
    { wch: 22 }, // Nama Ayah
    { wch: 22 }, // Pekerjaan Ayah
    { wch: 22 }, // Nama Ibu
    { wch: 22 }, // Pekerjaan Ibu
    { wch: 18 }, // No HP Ortu
    { wch: 36 }, // Alamat Lengkap
    { wch: 32 }, // Status Siswa
    { wch: 24 }, // Tanggal Masuk
    { wch: 36 }, // Catatan Prestasi
    { wch: 28 }, // Sekolah Tujuan
    { wch: 32 }  // Alasan Keluar
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Siswa');

  // Trigger download
  XLSX.writeFile(workbook, 'Template_Import_Data_Siswa_SD.xlsx');
};

/**
 * Export student data into a styled Excel (.xlsx) file
 */
export const exportStudentsExcel = (students: Student[], schoolName: string, gradeLabel?: string) => {
  const exportData = students.map((s, idx) => ({
    'No': idx + 1,
    'NIS': s.nis,
    'NISN': s.nisn,
    'Nama Lengkap': s.namaLengkap,
    'Nama Panggilan': s.namaPanggilan || '-',
    'Kelas': `Kelas ${s.kelas}`,
    'Jenis Kelamin': s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
    'Tempat Lahir': s.tempatLahir,
    'Tanggal Lahir': s.tanggalLahir,
    'Agama': s.agama,
    'Nama Ayah': s.namaAyah,
    'Pekerjaan Ayah': s.pekerjaanAyah,
    'Nama Ibu': s.namaIbu,
    'Pekerjaan Ibu': s.pekerjaanIbu,
    'No HP Ortu': s.noHpOrtu,
    'Alamat Lengkap': s.alamat,
    'Status Siswa': s.statusSiswa,
    'Sekolah Tujuan (Mutasi)': s.sekolahTujuan || '-',
    'Alasan Drop Out / Keluar': s.alasanKeluar || '-',
    'Tanggal Masuk': s.tanggalMasuk,
    'Catatan Prestasi': s.catatanPrestasi || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 16 },
    { wch: 28 },
    { wch: 16 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 12 },
    { wch: 22 },
    { wch: 18 },
    { wch: 22 },
    { wch: 18 },
    { wch: 16 },
    { wch: 36 },
    { wch: 14 },
    { wch: 26 },
    { wch: 30 },
    { wch: 14 },
    { wch: 30 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Peserta_Didik');

  const cleanSchool = schoolName.replace(/[^a-zA-Z0-9]/g, '_');
  const gradeSuffix = gradeLabel ? `_${gradeLabel.replace(/\s+/g, '_')}` : '';
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Data_Siswa_${cleanSchool}${gradeSuffix}_${dateStr}.xlsx`);
};
