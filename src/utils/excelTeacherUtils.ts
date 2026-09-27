import * as XLSX from 'xlsx';
import { Teacher, Gender, EmploymentStatus, TeacherRole, EducationDegree } from '../types';

export interface ParsedTeacherRow {
  isValid: boolean;
  errors: string[];
  data: Teacher;
  originalRow: Record<string, any>;
}

// Flexible column name matching dictionary
const FIELD_ALIASES: Record<string, string[]> = {
  namaLengkap: ['nama', 'nama lengkap', 'nama guru', 'nama lengkap & gelar', 'nama_lengkap', 'full name', 'name'],
  gelar: ['gelar', 'gelar akademik', 'title'],
  nip: ['nip', 'nomor induk pegawai', 'nip (18 digit)', 'no nip'],
  nuptk: ['nuptk', 'nomor unik pendidik', 'nuptk (16 digit)', 'no nuptk'],
  jenisKelamin: ['jenis kelamin', 'jk', 'l/p', 'gender', 'jenis_kelamin', 'sex'],
  tempatLahir: ['tempat lahir', 'tempat_lahir', 'tmp lahir', 'kota lahir', 'birth place'],
  tanggalLahir: ['tanggal lahir', 'tgl lahir', 'tanggal_lahir', 'tgl_lahir', 'birth date', 'dob'],
  pendidikanTerakhir: ['pendidikan', 'pendidikan terakhir', 'pendidikan_terakhir', 'ijazah', 'education', 'jenjang pendidikan'],
  jurusan: ['jurusan', 'program studi', 'prodi', 'jurusan/prodi', 'major'],
  jabatan: ['jabatan', 'tugas', 'jabatan / tugas', 'role', 'jabatan/tugas', 'tugas utama'],
  penugasanKelas: ['penugasan kelas', 'penugasan', 'kelas', 'rombel', 'tugas kelas', 'rombel penugasan'],
  statusKepegawaian: ['status kepegawaian', 'status', 'status pegawai', 'kepegawaian', 'status_kepegawaian', 'employment status'],
  golonganRuang: ['golongan', 'golongan ruang', 'gol', 'gol/ruang', 'pangkat/golongan', 'golongan_ruang'],
  sertifikasi: ['sertifikasi', 'status sertifikasi', 'sertifikasi pendidik', 'serdik', 'certified'],
  noHp: ['no hp', 'no handphone', 'no telepon', 'no telp', 'telepon', 'hp', 'phone', 'whatsapp', 'wa'],
  email: ['email', 'surel', 'e-mail', 'alamat email'],
  alamat: ['alamat', 'alamat tinggal', 'domisili', 'alamat lengkap', 'address'],
  tmtKerja: ['tmt', 'tmt kerja', 'tmt pendidik', 'tanggal mulai tugas', 'tmt_kerja'],
  fotoUrl: ['foto', 'foto url', 'foto profil', 'photo', 'avatar', 'image', 'picture']
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
 * Parses date value from Excel (which may be a number serial or a formatted string)
 */
const parseDateValue = (val: any, defaultVal = '1990-01-01'): string => {
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
const normalizeGender = (val: any): Gender => {
  if (!val) return 'L';
  const str = String(val).toUpperCase().trim();
  if (str.startsWith('P') || str.includes('PEREMPUAN') || str.includes('WANITA')) {
    return 'P';
  }
  return 'L';
};

/**
 * Normalizes Employment Status
 */
const normalizeStatusKepegawaian = (val: any): EmploymentStatus => {
  if (!val) return 'GTT / Honorer';
  const str = String(val).toUpperCase().trim();
  if (str.includes('PNS') || str.includes('PEGAWAI NEGERI')) return 'PNS';
  if (str.includes('PPPK PW') || str.includes('P3K PW') || str.includes('PARUH WAKTU') || str.includes('PART TIME')) return 'PPPK PW';
  if (str.includes('PPPK') || str.includes('P3K')) return 'PPPK';
  if (str.includes('PTT') || str.includes('PEGAWAI TIDAK TETAP')) return 'PTT (Honorer)';
  if (str.includes('GTTY') || str.includes('TIDAK TETAP YAYASAN')) return 'GTTY (Guru Tidak Tetap Yayasan)';
  if (str.includes('YAYASAN') || str.includes('GTY') || str.includes('TETAP YAYASAN')) return 'Guru Tetap Yayasan';
  return 'GTT / Honorer';
};

/**
 * Normalizes Teacher Role
 */
const normalizeJabatan = (val: any): TeacherRole => {
  if (!val) return 'Guru Kelas 1';
  const str = String(val).toLowerCase().trim();
  
  if (str.includes('kepala')) return 'Kepala Sekolah';
  if (str.includes('kelas 1')) return 'Guru Kelas 1';
  if (str.includes('kelas 2')) return 'Guru Kelas 2';
  if (str.includes('kelas 3')) return 'Guru Kelas 3';
  if (str.includes('kelas 4')) return 'Guru Kelas 4';
  if (str.includes('kelas 5')) return 'Guru Kelas 5';
  if (str.includes('kelas 6')) return 'Guru Kelas 6';
  if (str.includes('pjok') || str.includes('olahraga') || str.includes('penjas')) return 'Guru PJOK';
  if (str.includes('pai') || str.includes('agama islam') || str.includes('islam') || str.includes('agama')) return 'Guru PAI';
  if (str.includes('inggris') || str.includes('english')) return 'Guru Bahasa Inggris';
  if (str.includes('daerah') || str.includes('jawa') || str.includes('sunda') || str.includes('mulok')) return 'Guru Bahasa Daerah';
  if (str.includes('seni') || str.includes('budaya') || str.includes('sbdp') || str.includes('kesenian')) return 'Guru Seni Budaya';
  if (str.includes('administrasi') || str.includes('tu') || str.includes('tata usaha')) return 'Tenaga Administrasi';
  if (str.includes('pustakawan') || str.includes('perpustakaan')) return 'Pustakawan';
  if (str.includes('operator') || str.includes('dapodik')) return 'Operator Dapodik';
  if (str.includes('penjaga') || str.includes('kebersihan') || str.includes('satpam') || str.includes('security') || str.includes('pesuruh')) return 'Penjaga Sekolah';
  
  return 'Guru Kelas 1';
};

/**
 * Normalizes boolean certification status
 */
const normalizeSertifikasi = (val: any): boolean => {
  if (val === true || val === 1 || val === '1') return true;
  if (!val) return false;
  const str = String(val).toLowerCase().trim();
  return (
    str === 'ya' ||
    str === 'yes' ||
    str === 'sudah' ||
    str === 'sudah sertifikasi' ||
    str === 'lulus' ||
    str === 'tersertifikasi' ||
    str === 'true'
  );
};

/**
 * Normalizes Education Degree
 */
const normalizePendidikan = (val: any): EducationDegree => {
  if (!val) return 'S1';
  const str = String(val).toUpperCase().trim();
  if (str.includes('S3') || str.includes('DOKTOR')) return 'S3';
  if (str.includes('S2') || str.includes('MAGISTER')) return 'S2';
  if (str.includes('S1') || str.includes('SARJANA')) return 'S1';
  if (str.includes('D4') || str.includes('DIPLOMA 4')) return 'D4';
  if (str.includes('D3') || str.includes('DIPLOMA 3') || str.includes('DIPLOMA')) return 'D3';
  if (str.includes('D2') || str.includes('DIPLOMA 2')) return 'D2';
  if (str.includes('D1') || str.includes('DIPLOMA 1')) return 'D1';
  if (str.includes('SMA') || str.includes('SMK') || str.includes('SLTA') || str.includes('MA')) return 'SMA/SMK';
  if (str.includes('SMP') || str.includes('MTS') || str.includes('SLTP')) return 'SMP';
  if (str.includes('SD') || str.includes('MI') || str.includes('SEKOLAH DASAR')) return 'SD';
  return 'S1';
};

/**
 * Parse an Excel or CSV file buffer into structured Teacher array with validation
 */
export const parseTeacherExcelFile = async (file: File): Promise<{
  results: ParsedTeacherRow[];
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
    throw new Error('Tidak ditemukan data guru pada berkas Excel.');
  }

  const results: ParsedTeacherRow[] = [];

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
      errors.push('Nama lengkap guru tidak boleh kosong');
    }

    const nip = mapped.nip ? String(mapped.nip).trim() : '-';
    const nuptk = mapped.nuptk ? String(mapped.nuptk).trim() : '-';
    const gelar = mapped.gelar ? String(mapped.gelar).trim() : '';
    const jenisKelamin = normalizeGender(mapped.jenisKelamin);
    const tempatLahir = mapped.tempatLahir ? String(mapped.tempatLahir).trim() : 'Kota Sekolah';
    const tanggalLahir = parseDateValue(mapped.tanggalLahir, '1985-05-15');
    const pendidikanTerakhir = normalizePendidikan(mapped.pendidikanTerakhir);
    const jurusan = mapped.jurusan ? String(mapped.jurusan).trim() : 'Pendidikan Guru Sekolah Dasar (PGSD)';
    const jabatan = normalizeJabatan(mapped.jabatan);
    const penugasanKelas = mapped.penugasanKelas ? String(mapped.penugasanKelas).trim() : 'Semua Kelas';
    const statusKepegawaian = normalizeStatusKepegawaian(mapped.statusKepegawaian);
    const golonganRuang = mapped.golonganRuang ? String(mapped.golonganRuang).trim() : (statusKepegawaian === 'PNS' ? 'III/a' : '-');
    const sertifikasi = normalizeSertifikasi(mapped.sertifikasi);
    const noHp = mapped.noHp ? String(mapped.noHp).trim() : '081234567890';
    const email = mapped.email ? String(mapped.email).trim() : `${namaLengkapRaw.toLowerCase().replace(/[^a-z0-9]/g, '') || 'guru'}@sekolah.sch.id`;
    const alamat = mapped.alamat ? String(mapped.alamat).trim() : 'Alamat Guru';
    const tmtKerja = parseDateValue(mapped.tmtKerja, '2018-07-16');
    const fotoUrl = mapped.fotoUrl ? String(mapped.fotoUrl).trim() : undefined;

    const teacherObj: Teacher = {
      id: `teacher-${Date.now()}-${index}-${Math.floor(Math.random() * 10000)}`,
      nip,
      nuptk,
      namaLengkap: namaLengkapRaw || `Guru Baru #${index + 1}`,
      gelar,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      pendidikanTerakhir,
      jurusan,
      jabatan,
      penugasanKelas,
      statusKepegawaian,
      golonganRuang,
      sertifikasi,
      noHp,
      email,
      alamat,
      tmtKerja,
      statusAktif: true,
      fotoUrl
    };

    results.push({
      isValid: errors.length === 0,
      errors,
      data: teacherObj,
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
 * Downloads a ready-to-use template Excel (.xlsx) file with sample data and guidelines
 */
export const downloadTeacherExcelTemplate = () => {
  const sampleData = [
    {
      'Nama Lengkap': 'Drs. H. Ahmad Sudrajat',
      'Gelar': 'M.Pd.',
      'NIP': '197503122000031002',
      'NUPTK': '4351753655200013',
      'Jenis Kelamin (L/P)': 'L',
      'Tempat Lahir': 'Bandung',
      'Tanggal Lahir (YYYY-MM-DD)': '1975-03-12',
      'Pendidikan Terakhir (SD/SMP/SMA/D1-D4/S1-S3)': 'S2',
      'Jurusan': 'Manajemen Pendidikan',
      'Jabatan / Tugas': 'Kepala Sekolah',
      'Penugasan Kelas': 'Semua Kelas',
      'Status Kepegawaian (PNS/PPPK/GTT)': 'PNS',
      'Golongan / Ruang': 'IV/b',
      'Sertifikasi (Sudah/Belum)': 'Sudah',
      'No HP': '081234567801',
      'Email': 'ahmad.sudrajat@sdnegeri.sch.id',
      'Alamat': 'Jl. Pendidikan No. 12, Bandung',
      'TMT Kerja (YYYY-MM-DD)': '2000-03-01'
    },
    {
      'Nama Lengkap': 'Siti Rahmawati',
      'Gelar': 'S.Pd.',
      'NIP': '198804152014022001',
      'NUPTK': '8745766668210032',
      'Jenis Kelamin (L/P)': 'P',
      'Tempat Lahir': 'Jakarta',
      'Tanggal Lahir (YYYY-MM-DD)': '1988-04-15',
      'Pendidikan Terakhir (SD/SMP/SMA/D1-D4/S1-S3)': 'S1',
      'Jurusan': 'Pendidikan Guru Sekolah Dasar (PGSD)',
      'Jabatan / Tugas': 'Guru Kelas 1',
      'Penugasan Kelas': 'Kelas 1A',
      'Status Kepegawaian (PNS/PPPK/GTT)': 'PNS',
      'Golongan / Ruang': 'III/c',
      'Sertifikasi (Sudah/Belum)': 'Sudah',
      'No HP': '081398765432',
      'Email': 'siti.rahmawati@sdnegeri.sch.id',
      'Alamat': 'Komplek Griya Asri Blok C-4, Bandung',
      'TMT Kerja (YYYY-MM-DD)': '2014-02-01'
    },
    {
      'Nama Lengkap': 'Budi Santoso',
      'Gelar': 'S.Pd.Jas',
      'NIP': '-',
      'NUPTK': '9238771673130092',
      'Jenis Kelamin (L/P)': 'L',
      'Tempat Lahir': 'Semarang',
      'Tanggal Lahir (YYYY-MM-DD)': '1993-09-20',
      'Pendidikan Terakhir (SD/SMP/SMA/D1-D4/S1-S3)': 'S1',
      'Jurusan': 'Pendidikan Jasmani & Kesehatan',
      'Jabatan / Tugas': 'Guru PJOK',
      'Penugasan Kelas': 'Kelas 1-6',
      'Status Kepegawaian (PNS/PPPK/GTT)': 'PPPK',
      'Golongan / Ruang': 'IX',
      'Sertifikasi (Sudah/Belum)': 'Sudah',
      'No HP': '085712349988',
      'Email': 'budi.santoso@sdnegeri.sch.id',
      'Alamat': 'Jl. Dahlia No. 45, Bandung',
      'TMT Kerja (YYYY-MM-DD)': '2021-06-01'
    },
    {
      'Nama Lengkap': 'Nurul Hidayah',
      'Gelar': 'S.Pd.I',
      'NIP': '-',
      'NUPTK': '1947772674230081',
      'Jenis Kelamin (L/P)': 'P',
      'Tempat Lahir': 'Cirebon',
      'Tanggal Lahir (YYYY-MM-DD)': '1995-11-05',
      'Pendidikan Terakhir (SD/SMP/SMA/D1-D4/S1-S3)': 'S1',
      'Jurusan': 'Pendidikan Agama Islam',
      'Jabatan / Tugas': 'Guru PAI',
      'Penugasan Kelas': 'Kelas 1-6',
      'Status Kepegawaian (PNS/PPPK/GTT)': 'GTT / Honorer',
      'Golongan / Ruang': '-',
      'Sertifikasi (Sudah/Belum)': 'Belum',
      'No HP': '082199887766',
      'Email': 'nurul.hidayah@sdnegeri.sch.id',
      'Alamat': 'Jl. Teratai No. 19, Bandung',
      'TMT Kerja (YYYY-MM-DD)': '2022-07-15'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 28 }, // Nama Lengkap
    { wch: 10 }, // Gelar
    { wch: 22 }, // NIP
    { wch: 20 }, // NUPTK
    { wch: 20 }, // Jenis Kelamin
    { wch: 16 }, // Tempat Lahir
    { wch: 26 }, // Tanggal Lahir
    { wch: 32 }, // Pendidikan Terakhir
    { wch: 35 }, // Jurusan
    { wch: 22 }, // Jabatan
    { wch: 18 }, // Penugasan Kelas
    { wch: 32 }, // Status Kepegawaian
    { wch: 18 }, // Golongan
    { wch: 24 }, // Sertifikasi
    { wch: 16 }, // No HP
    { wch: 30 }, // Email
    { wch: 38 }, // Alamat
    { wch: 24 }  // TMT Kerja
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Guru');

  // Trigger download
  XLSX.writeFile(workbook, 'Template_Import_Data_Guru_SD.xlsx');
};

/**
 * Export teacher data into a styled Excel (.xlsx) file
 */
export const exportTeachersExcel = (teachers: Teacher[], schoolName: string) => {
  const exportData = teachers.map((t, idx) => ({
    'No': idx + 1,
    'Nama Lengkap': t.namaLengkap,
    'Gelar': t.gelar || '-',
    'NIP': t.nip || '-',
    'NUPTK': t.nuptk || '-',
    'Jenis Kelamin': t.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
    'Tempat Lahir': t.tempatLahir,
    'Tanggal Lahir': t.tanggalLahir,
    'Pendidikan Terakhir': t.pendidikanTerakhir,
    'Jurusan': t.jurusan,
    'Jabatan / Tugas': t.jabatan,
    'Penugasan Kelas': t.penugasanKelas,
    'Status Kepegawaian': t.statusKepegawaian,
    'Golongan / Ruang': t.golonganRuang || '-',
    'Sertifikasi': t.sertifikasi ? 'Sudah Sertifikasi' : 'Belum Sertifikasi',
    'No HP': t.noHp,
    'Email': t.email,
    'Alamat Lengkap': t.alamat,
    'TMT Kerja': t.tmtKerja,
    'Status Keaktifan': t.statusAktif ? 'Aktif' : 'Non-Aktif'
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 10 },
    { wch: 22 },
    { wch: 20 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 18 },
    { wch: 32 },
    { wch: 22 },
    { wch: 18 },
    { wch: 22 },
    { wch: 16 },
    { wch: 20 },
    { wch: 16 },
    { wch: 28 },
    { wch: 36 },
    { wch: 14 },
    { wch: 14 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_GTK');

  const cleanSchool = schoolName.replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Data_Guru_${cleanSchool}_${dateStr}.xlsx`);
};
