export type Gender = 'L' | 'P';

export type EmploymentStatus = 
  | 'PNS' 
  | 'PPPK' 
  | 'PPPK PW' 
  | 'GTT / Honorer' 
  | 'PTT (Honorer)' 
  | 'Guru Tetap Yayasan' 
  | 'GTTY (Guru Tidak Tetap Yayasan)';

export type TeacherRole = 
  | 'Kepala Sekolah'
  | 'Guru Kelas 1'
  | 'Guru Kelas 2'
  | 'Guru Kelas 3'
  | 'Guru Kelas 4'
  | 'Guru Kelas 5'
  | 'Guru Kelas 6'
  | 'Guru PJOK'
  | 'Guru PAI'
  | 'Guru Bahasa Inggris'
  | 'Guru Bahasa Daerah'
  | 'Guru Seni Budaya'
  | 'Tenaga Administrasi'
  | 'Pustakawan'
  | 'Operator Dapodik'
  | 'Penjaga Sekolah';

export type EducationDegree = 
  | 'SD'
  | 'SMP'
  | 'SMA/SMK'
  | 'D1'
  | 'D2'
  | 'D3'
  | 'D4'
  | 'S1'
  | 'S2'
  | 'S3';

export interface Teacher {
  id: string;
  nip: string;
  nuptk: string;
  namaLengkap: string;
  gelar: string;
  jenisKelamin: Gender;
  tempatLahir: string;
  tanggalLahir: string;
  pendidikanTerakhir: EducationDegree;
  jurusan: string;
  jabatan: TeacherRole;
  penugasanKelas: string; // e.g. 'Kelas 1A', 'Kelas 5B', 'Semua Kelas', '-'
  statusKepegawaian: EmploymentStatus;
  golonganRuang?: string; // e.g. 'III/a', 'III/b', 'IV/a', '-'
  sertifikasi: boolean;
  noHp: string;
  email: string;
  alamat: string;
  tmtKerja: string; // Tanggal Mulai Tugas
  statusAktif: boolean;
  fotoUrl?: string;
}

export type ClassGrade = string;

export interface ClassRoomItem {
  id: string;
  nama: string; // e.g. '1A', '1B', '1C', '2A', etc.
  tingkat: number; // 1, 2, 3, 4, 5, 6
  waliKelas?: string; // Nama guru wali kelas
  ruangan?: string; // e.g. 'Ruang 101'
  kapasitas?: number; // e.g. 28
  keterangan?: string;
  tahunAjaran?: string;
}

export type StudentStatus = 'Aktif' | 'Pindah' | 'Lulus' | 'Non-Aktif';

export type Religion = 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';

export interface Student {
  id: string;
  nis: string; // Nomor Induk Siswa (e.g. 2024001)
  nisn: string; // 10 digit nasional
  namaLengkap: string;
  namaPanggilan?: string;
  jenisKelamin: Gender;
  kelas: ClassGrade;
  tempatLahir: string;
  tanggalLahir: string;
  agama: Religion;
  pendidikanSebelumnya?: string; // e.g. TK Pertiwi, PAUD Melati, RA Al-Ikhlas
  namaAyah: string;
  pekerjaanAyah: string;
  namaIbu: string;
  pekerjaanIbu: string;
  alamatOrtu?: string; // Alamat Orang Tua
  noHpOrtu: string;
  namaWali?: string;
  pekerjaanWali?: string;
  alamatWali?: string;
  hubunganWali?: string; // e.g. Paman, Kakek, Nenek, Saudara Kandung, Wali Asuh
  noHpWali?: string;
  alamat: string;
  rtRw?: string;
  kelurahan?: string;
  kecamatan?: string;
  kabupatenKota?: string;
  provinsi?: string;
  kodePos?: string;
  statusSiswa: StudentStatus;
  diterimaDiKelas?: string; // Tingkat / Kelas saat pertama kali diterima
  tanggalMasuk: string;
  anakKe?: number;
  jumlahSaudara?: number;
  tinggiBadan?: number; // Tinggi badan dalam cm (e.g. 128)
  beratBadan?: number; // Berat badan dalam kg (e.g. 26)
  fotoUrl?: string;
  catatanPrestasi?: string;
  catatanKesehatan?: string;
  sekolahTujuan?: string;
  tanggalMutasi?: string;
  alasanKeluar?: string;
  tanggalKeluar?: string;
}

export interface FacilityItem {
  id: string;
  nama: string;
  jumlah: number;
  kondisiBaik: number;
  kondisiRusakRingan: number;
  kondisiRusakBerat: number;
  keterangan?: string;
}

export interface SchoolProfile {
  namaSekolah: string;
  npsn: string;
  nss: string;
  jenjang: 'SD (Sekolah Dasar)';
  statusSekolah: 'Negeri' | 'Swasta';
  akreditasi: 'A' | 'B' | 'C' | 'Belum Terakreditasi';
  nomorSkAkreditasi: string;
  tanggalSkAkreditasi: string;
  kurikulum: 'Kurikulum Merdeka' | 'Kurikulum 2013 (K13)' | 'Kombinasi';
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  email: string;
  telepon: string;
  website: string;
  alamatJalan: string;
  desaKelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  kodePos: string;
  visi: string;
  misi: string[];
  tujuanSekolah: string[];
  tahunAjaran: string; // e.g. '2025/2026'
  semester: 'Ganjil' | 'Genap';
  saranaPrasarana: FacilityItem[];
  logoUrl?: string;
  logoPemdaUrl?: string;
  titikKoordinat?: string;
}

export interface SchoolAgenda {
  id: string;
  judul: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  kategori: 'Akademik' | 'Kesiswaan' | 'Dinas / Rapat' | 'Kegiatan Ekstrakurikuler' | 'Ujian';
  keterangan: string;
  selesai: boolean;
}

export interface SchoolAnnouncement {
  id: string;
  judul: string;
  tanggal: string;
  prioritas: 'Tinggi' | 'Sedang' | 'Biasa';
  isi: string;
  pembuat: string;
}

export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';

export interface AttendanceRecordItem {
  studentId: string;
  status: AttendanceStatus;
  keterangan?: string;
}

export interface DailyClassAttendance {
  id: string;
  tanggal: string; // YYYY-MM-DD
  kelas: ClassGrade;
  records: AttendanceRecordItem[];
  catatanKelas?: string;
  guruPenginput?: string;
  semester?: 'Ganjil' | 'Genap';
  tahunAjaran?: string;
  updatedAt?: string;
}

export const SENI_BUDAYA_BRANCHES = [
  'Seni Rupa',
  'Seni Musik',
  'Seni Tari',
  'Seni Teater'
] as const;

export type SeniBudayaBranch = typeof SENI_BUDAYA_BRANCHES[number];

export const STANDARD_SD_SUBJECTS: string[] = [
  'Pendidikan Agama Islam dan Budi Pekerti',
  'Pendidikan Pancasila',
  'Bahasa Indonesia',
  'Matematika',
  'Ilmu Pengetahuan Alam dan Sosial',
  'Pendidikan Jasmani Olahraga dan Kesehatan',
  'Seni Budaya',
  'Bahasa Daerah',
  'Bahasa Inggris'
];

export const normalizeSubjectName = (subject: string): string => {
  if (!subject) return '';
  const trimmed = subject.trim();
  if (trimmed === 'Ilmu Pengetahuan Alam dan Sosial (IPAS)' || trimmed === 'IPAS') {
    return 'Ilmu Pengetahuan Alam dan Sosial';
  }
  if (
    trimmed === 'PJOK' ||
    trimmed === 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)' ||
    trimmed === 'Pendidikan Jasmani Olahraga dan Kesehatan (PJOK)' ||
    trimmed === 'Pendidikan Jasmani, Olahraga, dan Kesehatan'
  ) {
    return 'Pendidikan Jasmani Olahraga dan Kesehatan';
  }
  if (
    trimmed === 'Seni Rupa' ||
    trimmed === 'Seni Musik' ||
    trimmed === 'Seni Tari' ||
    trimmed === 'Seni Teater' ||
    trimmed.startsWith('Seni Budaya') ||
    trimmed === 'SBdP' ||
    trimmed === 'Seni Budaya dan Prakarya'
  ) {
    return 'Seni Budaya';
  }
  if (trimmed === 'Bahasa Jawa / Daerah' || trimmed === 'Bahasa Jawa') {
    return 'Bahasa Daerah';
  }
  return trimmed;
};

export const detectSeniBudayaBranch = (...texts: (string | undefined)[]): SeniBudayaBranch | undefined => {
  for (const text of texts) {
    if (!text) continue;
    const lower = text.toLowerCase();
    if (lower.includes('seni rupa') || lower.includes('rupa')) return 'Seni Rupa';
    if (lower.includes('seni musik') || lower.includes('musik')) return 'Seni Musik';
    if (lower.includes('seni tari') || lower.includes('tari')) return 'Seni Tari';
    if (lower.includes('seni teater') || lower.includes('teater')) return 'Seni Teater';
  }
  return undefined;
};

export interface CurriculumItem {
  id: string;
  mataPelajaran: string; // e.g. 'Matematika', 'Bahasa Indonesia', 'Seni Budaya'
  subOpsiSeni?: 'Seni Rupa' | 'Seni Musik' | 'Seni Tari' | 'Seni Teater' | string; // Opsi cabang seni dari mapel Seni Budaya
  faseKelas?: string; // e.g. 'Fase A Kelas 1', 'Fase B Kelas 4', 'Fase C Kelas 5'
  kelasTarget?: string; // e.g. 'Kelas 1', 'Semua Kelas', '1A', etc.
  semester?: 'Ganjil' | 'Genap' | 'Semua';
  elemen?: string; // Elemen Kurikulum (e.g. 'Bilangan', 'Pancasila', 'Menyimak', 'Mengalami (Experiencing)')
  capaianPembelajaran?: string; // Capaian Pembelajaran (CP)
  tujuanPembelajaran: string; // TP description or code
  materi: string; // Learning material / Topic
  alokasiWaktu?: string; // e.g. '2 JP'
}

export interface BreakTimeConfig {
  id: string;
  name: string; // e.g. 'Istirahat 1 (Pagi)', 'Istirahat 2 (Siang / Dhuhur)'
  afterJp: number; // e.g. 3 (artinya istirahat setelah JP 3 selesai)
  durationMinutes: number; // durasi dalam menit, e.g. 20, 30
}

export interface JpScheduleConfig {
  jamMulai: string; // e.g. '07:00'
  durasiJpMenit: number; // Standar SD: 35 menit per JP
  totalJp: number; // e.g. 8 JP
  breaks: BreakTimeConfig[];
}

export interface CalculatedJpSlot {
  jpNumber: number;
  label: string; // e.g. 'JP 1'
  startTime: string; // e.g. '07:00'
  endTime: string; // e.g. '07:35'
  durationMinutes: number; // e.g. 35
}

export interface DailyTeachingJournal {
  id: string;
  tanggal: string; // YYYY-MM-DD
  hari: string; // e.g. 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  kelas: ClassGrade;
  fase?: string; // e.g. 'Fase A Kelas 1', 'Fase A Kelas 2', etc.
  mataPelajaran: string;
  tujuanPembelajaran: string;
  materi: string;
  refleksi: string;
  keterangan: string;
  jamPelajaran?: string; // e.g. 'JP 1 - 2 (07:00 - 08:10)'
  selectedJp?: number[]; // e.g. [1, 2]
  totalJpCount?: number; // e.g. 2
  totalMenit?: number; // e.g. 70
  guruPengajar?: string; // Nama guru
  statusKBM?: 'Terlaksana' | 'Tertunda' | 'Remedial' | 'Pengayaan';
  createdAt?: string;
  updatedAt?: string;
}

export type AssessmentType = 'SH 1' | 'SH 2' | 'SH 3' | 'SH 4' | 'SH 5' | 'SH 6' | 'PTS' | 'SAS';

export interface StudentGradeItem {
  studentId: string;
  nilai: number | null; // 0 - 100 or null if not yet graded
  catatan?: string;
}

export interface StudentAssessment {
  id: string;
  tanggal: string; // YYYY-MM-DD
  kelas: ClassGrade;
  mataPelajaran: string;
  jenisPenilaian: AssessmentType;
  semester?: 'Ganjil' | 'Genap';
  tahunAjaran?: string;
  materiTp?: string; // Capaian / Lingkup Materi / Judul Asesmen
  kkm?: number; // Kriteria Ketercapaian Tujuan Pembelajaran (KKTP / KKM, default 75)
  guruPengampu?: string;
  scores?: Array<{
    studentId: string;
    score: number | null;
    notes?: string;
  }>;
  grades?: StudentGradeItem[];
  createdAt?: string;
  updatedAt?: string;
}

// ----------------------------------------------------
// EKSTRAKURIKULER TYPES
// ----------------------------------------------------
export type ExtraPredicate = 'A' | 'B' | 'C' | 'D';

export interface StudentExtraGrade {
  studentId: string;
  predikat: ExtraPredicate; // A: Sangat Baik, B: Baik, C: Cukup, D: Kurang
  nilaiAngka?: number | null; // Opsional 0-100
  keterangan: string; // Deskripsi capaian, misal: "Sangat aktif dalam kegiatan..."
}

export interface ExtracurricularAssessment {
  id: string;
  namaEkskul: string; // e.g. 'Pramuka (Wajib)', 'Seni Tari', 'Dokter Kecil / UKS', 'Futsal', dll.
  kategori?: 'Wajib' | 'Pilihan Olahraga' | 'Pilihan Seni & Budaya' | 'Pilihan Keagamaan' | 'Pilihan Sains & Teknologi';
  kelas: ClassGrade | 'Semua Kelas';
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  pembina: string; // Nama guru atau pelatih
  tanggalPenilaian?: string;
  deskripsiUmum?: string;
  grades: StudentExtraGrade[];
  createdAt?: string;
  updatedAt?: string;
}

// ----------------------------------------------------
// KOKURIKULER / P5 (PROJEK PENGUATAN PROFIL PELAJAR PANCASILA)
// ----------------------------------------------------
export type P5Theme = 
  | 'Gaya Hidup Berkelanjutan'
  | 'Kearifan Lokal'
  | 'Bhinneka Tunggal Ika'
  | 'Bangunlah Jiwa dan Raganya'
  | 'Rekayasa dan Teknologi'
  | 'Kewirausahaan';

export type P5Dimension =
  | 'Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia'
  | 'Berkebinekaan Global'
  | 'Bergotong Royong'
  | 'Mandiri'
  | 'Bernalar Kritis'
  | 'Kreatif';

export type P5AchievementScale = 'MB' | 'SB' | 'BSH' | 'SAB'; // MB: Mulai Berkembang, SB: Sedang Berkembang, BSH: Berkembang Sesuai Harapan, SAB: Sangat Berkembang

export interface P5TargetElement {
  id: string;
  dimensi: P5Dimension;
  elemen: string; // e.g. "Akhlak kepada alam"
  subElemen: string; // e.g. "Menjaga lingkungan alam sekitar"
  targetCapaian: string; // Deskripsi capaian fase
}

export interface StudentP5Grade {
  studentId: string;
  ratings: Record<string, P5AchievementScale>; // elementId -> scale ('MB' | 'SB' | 'BSH' | 'SAB')
  catatanProses?: string; // Catatan guru terhadap partisipasi dan aksi nyata siswa
}

export interface CocurricularProject {
  id: string;
  judulProjek: string; // e.g. "Pilah Sampah, Selamatkan Bumi Kita"
  tema: P5Theme;
  fase: 'Fase A (Kelas 1-2)' | 'Fase B (Kelas 3-4)' | 'Fase C (Kelas 5-6)';
  kelas: ClassGrade;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  deskripsiSingkat: string; // Ringkasan kegiatan proyek
  targetElements: P5TargetElement[];
  koordinator: string; // Guru koordinator proyek
  fasilitator?: string[]; // Guru-guru fasilitator
  tanggalMulai?: string;
  tanggalSelesai?: string;
  studentGrades: StudentP5Grade[];
  createdAt?: string;
  updatedAt?: string;
}

export type ActiveTab = 
  | 'dashboard' 
  | 'data-sekolah' 
  | 'data-guru' 
  | 'data-siswa' 
  | 'presensi' 
  | 'jurnal-mengajar' 
  | 'penilaian' 
  | 'rapor'
  | 'ekstrakurikuler' 
  | 'kokurikuler' 
  | 'laporan';

export interface StudentReportConfig {
  id: string; // unique key, e.g. `${studentId}_${semester}_${tahunAjaran}`
  studentId: string;
  kelas: ClassGrade;
  semester: 'Ganjil' | 'Genap';
  tahunAjaran: string; // e.g. '2025/2026'
  catatanWaliKelas?: string;
  keputusanKenaikan?: 'Naik ke Kelas' | 'Tinggal di Kelas' | 'Lulus' | 'Tidak Lulus' | string;
  targetKelasLanjutan?: string; // e.g. '2A' or 'Kelas 2'
  isAutoAttendance?: boolean; // When true or undefined, attendance automatically syncs from attendance logs
  sakitCount?: number | null;
  izinCount?: number | null;
  alpaCount?: number | null;
  tinggiBadan?: string; // e.g. '125 cm'
  beratBadan?: string; // e.g. '24 kg'
  catatanKesehatan?: string; // e.g. 'Pendengaran, penglihatan, dan gigi dalam kondisi baik.'
  catatanPrestasi?: string; // e.g. 'Juara 1 Lomba Menggambar Tingkat Kecamatan'
  tanggalRapor?: string; // YYYY-MM-DD
  tempatRapor?: string; // e.g. 'Jakarta' or nama kota sekolah
  waliKelasNama?: string;
  waliKelasNip?: string;
  kepalaSekolahNama?: string;
  kepalaSekolahNip?: string;
  customCompetencies?: {
    [subjectName: string]: {
      tertinggi?: string;
      perluPeningkatan?: string;
    };
  };
  updatedAt?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username: string;
  npsn?: string;
  nip?: string;
  schoolName: string;
  role: string;
  securityQuestion?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface LoginPayload {
  identifier: string; // Email Sekolah, NPSN, atau Username
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  email: string;       // Email Sekolah
  schoolName: string;  // Nama Sekolah
  npsn: string;        // NPSN Sekolah
  password: string;    // Kata Sandi
  confirmPassword?: string;
  name?: string;       // Optional / fallback
  username?: string;   // Optional / fallback
  role?: string;       // Default: 'Admin Sekolah'
  securityQuestion?: string;
  securityAnswer?: string;
}

export interface ResetPasswordPayload {
  identifier: string;
  securityAnswer: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface AppSyncData {
  school?: SchoolProfile;
  teachers?: Teacher[];
  students?: Student[];
  classes?: ClassRoomItem[];
  agendas?: SchoolAgenda[];
  announcements?: SchoolAnnouncement[];
  attendance?: DailyClassAttendance[];
  curriculum?: CurriculumItem[];
  teachingJournals?: DailyTeachingJournal[];
  jpSchedule?: JpScheduleConfig | JpScheduleConfig[];
  assessments?: StudentAssessment[];
  extracurriculars?: ExtracurricularAssessment[];
  cocurricularProjects?: CocurricularProject[];
  studentReports?: StudentReportConfig[];
  syncedAt?: string;
}

