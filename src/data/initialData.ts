import { 
  SchoolProfile, 
  Teacher, 
  Student, 
  SchoolAgenda, 
  SchoolAnnouncement, 
  DailyClassAttendance, 
  CurriculumItem, 
  DailyTeachingJournal, 
  JpScheduleConfig, 
  StudentAssessment,
  ExtracurricularAssessment,
  CocurricularProject,
  ClassRoomItem
} from '../types';

export const initialClasses: ClassRoomItem[] = [
  { id: 'cls-1a', nama: '1A', tingkat: 1, waliKelas: 'Siti Rahmawati, S.Pd.', ruangan: 'Gedung A Lt. 1 (R. 101)', kapasitas: 28, keterangan: 'Kelas 1 Reguler A' },
  { id: 'cls-1b', nama: '1B', tingkat: 1, waliKelas: 'Ahmad Fauzi, S.Pd.I', ruangan: 'Gedung A Lt. 1 (R. 102)', kapasitas: 28, keterangan: 'Kelas 1 Reguler B' },
  { id: 'cls-2a', nama: '2A', tingkat: 2, waliKelas: 'Dewi Lestari, S.Pd.', ruangan: 'Gedung A Lt. 1 (R. 103)', kapasitas: 28, keterangan: 'Kelas 2 Reguler A' },
  { id: 'cls-2b', nama: '2B', tingkat: 2, waliKelas: 'Budi Santoso, S.Pd.', ruangan: 'Gedung A Lt. 1 (R. 104)', kapasitas: 28, keterangan: 'Kelas 2 Reguler B' },
  { id: 'cls-3a', nama: '3A', tingkat: 3, waliKelas: 'Rina Wijayanti, S.Pd.', ruangan: 'Gedung B Lt. 1 (R. 201)', kapasitas: 30, keterangan: 'Kelas 3 Reguler A' },
  { id: 'cls-3b', nama: '3B', tingkat: 3, waliKelas: 'Agus Pratama, S.Pd.', ruangan: 'Gedung B Lt. 1 (R. 202)', kapasitas: 30, keterangan: 'Kelas 3 Reguler B' },
  { id: 'cls-4a', nama: '4A', tingkat: 4, waliKelas: 'Nurul Hidayah, S.Pd.', ruangan: 'Gedung B Lt. 2 (R. 203)', kapasitas: 32, keterangan: 'Kelas 4 Reguler A' },
  { id: 'cls-4b', nama: '4B', tingkat: 4, waliKelas: 'Eko Prasetyo, S.Pd.', ruangan: 'Gedung B Lt. 2 (R. 204)', kapasitas: 32, keterangan: 'Kelas 4 Reguler B' },
  { id: 'cls-5a', nama: '5A', tingkat: 5, waliKelas: 'Tri Wahyuni, S.Pd.', ruangan: 'Gedung C Lt. 1 (R. 301)', kapasitas: 32, keterangan: 'Kelas 5 Reguler A' },
  { id: 'cls-5b', nama: '5B', tingkat: 5, waliKelas: 'Hendra Setiawan, S.Pd.', ruangan: 'Gedung C Lt. 1 (R. 302)', kapasitas: 32, keterangan: 'Kelas 5 Reguler B' },
  { id: 'cls-6a', nama: '6A', tingkat: 6, waliKelas: 'Sri Mulyani, S.Pd.', ruangan: 'Gedung C Lt. 2 (R. 303)', kapasitas: 32, keterangan: 'Kelas 6 Reguler A' },
  { id: 'cls-6b', nama: '6B', tingkat: 6, waliKelas: 'Dedi Kurniawan, S.Pd.', ruangan: 'Gedung C Lt. 2 (R. 304)', kapasitas: 32, keterangan: 'Kelas 6 Reguler B' },
];

export const initialSchoolProfile: SchoolProfile = {
  namaSekolah: 'SDN Malathe Pote 1 Kokop',
  npsn: '20512345',
  nss: '101052901001',
  jenjang: 'SD (Sekolah Dasar)',
  statusSekolah: 'Negeri',
  akreditasi: 'A',
  nomorSkAkreditasi: '1452/BAN-SM/SK/2023',
  tanggalSkAkreditasi: '2023-11-15',
  kurikulum: 'Kurikulum Merdeka',
  kepalaSekolah: 'Drs. H. Bambang Sujarwo, M.Pd.',
  nipKepalaSekolah: '196805121992031004',
  email: 'sekolah@malathepote.sch.id',
  telepon: '(021) 7821-4903',
  website: 'https://malathepote1.sch.id',
  alamatJalan: 'Jl. Raya Kokop No. 01',
  desaKelurahan: 'Kokop',
  kecamatan: 'Kecamatan Kokop',
  kabupatenKota: 'Kabupaten Bangkalan',
  provinsi: 'Jawa Timur',
  kodePos: '69155',
  visi: 'Terwujudnya peserta didik yang beriman, bertakwa, berkarakter Profil Pelajar Pancasila, cerdas, berprestasi, dan berwawasan lingkungan.',
  misi: [
    'Menanamkan nilai-nilai keagamaan dan budi pekerti luhur dalam kehidupan sehari-hari.',
    'Melaksanakan pembelajaran yang aktif, inovatif, kreatif, efektif, dan menyenangkan berbasis Kurikulum Merdeka.',
    'Mengembangkan potensi, bakat, dan minat siswa di bidang akademik maupun non-akademik.',
    'Mewujudkan lingkungan sekolah yang bersih, sehat, asri, aman, dan nyaman untuk belajar (Sekolah Ramah Anak).',
    'Meningkatkan kompetensi profesional pendidik dan tenaga kependidikan secara berkelanjutan.'
  ],
  tujuanSekolah: [
    'Meningkatkan nilai rata-rata Asesmen Nasional (ANBK) di atas standar nasional.',
    'Mencapai 100% kelulusan dengan karakter siswa yang berakhlak mulia dan siap melanjutkan ke jenjang SMP.',
    'Meraih prestasi minimal tingkat kabupaten/kota dalam bidang OSN, FLS2N, dan O2SN.'
  ],
  tahunAjaran: '2025/2026',
  semester: 'Genap',
  saranaPrasarana: [
    { id: 'sarpras-1', nama: 'Ruang Kelas Pembelajaran', jumlah: 12, kondisiBaik: 11, kondisiRusakRingan: 1, kondisiRusakBerat: 0, keterangan: 'Kelas 1A-6B dilengkapi proyektor' },
    { id: 'sarpras-2', nama: 'Ruang Perpustakaan Digital & Buku', jumlah: 1, kondisiBaik: 1, kondisiRusakRingan: 0, kondisiRusakBerat: 0, keterangan: 'Koleksi 3.500 judul buku' },
    { id: 'sarpras-3', nama: 'Laboratorium Komputer & TIK', jumlah: 1, kondisiBaik: 1, kondisiRusakRingan: 0, kondisiRusakBerat: 0, keterangan: '25 unit komputer siap ANBK' },
    { id: 'sarpras-4', nama: 'Ruang UKS (Usaha Kesehatan Sekolah)', jumlah: 1, kondisiBaik: 1, kondisiRusakRingan: 0, kondisiRusakBerat: 0, keterangan: 'Bekerjasama dengan Puskesmas setempat' },
    { id: 'sarpras-5', nama: 'Lapangan Olahraga & Upacara', jumlah: 1, kondisiBaik: 1, kondisiRusakRingan: 0, kondisiRusakBerat: 0, keterangan: 'Multifungsi basket/futsal/voli' },
    { id: 'sarpras-6', nama: 'Musholla Sekolah "Al-Ikhlas"', jumlah: 1, kondisiBaik: 1, kondisiRusakRingan: 0, kondisiRusakBerat: 0, keterangan: 'Kapasitas 150 jamaah siswa' },
    { id: 'sarpras-7', nama: 'Kantin Sehat & Bersih', jumlah: 3, kondisiBaik: 3, kondisiRusakRingan: 0, kondisiRusakBerat: 0, keterangan: 'Tersertifikasi higienis BPOM/Dinkes' },
    { id: 'sarpras-8', nama: 'Toilet / Jamban Siswa & Guru', jumlah: 8, kondisiBaik: 7, kondisiRusakRingan: 1, kondisiRusakBerat: 0, keterangan: 'Pemisahan toilet putra & putri' },
    { id: 'sarpras-9', nama: 'Taman Sekolah & Green House', jumlah: 1, kondisiBaik: 1, kondisiRusakRingan: 0, kondisiRusakBerat: 0, keterangan: 'Program Adiwiyata Tingkat Kota' }
  ],
  titikKoordinat: '-6.372841, 106.842189',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg',
  logoPemdaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Lambang_Kota_Depok.png/300px-Lambang_Kota_Depok.png'
};

export const initialTeachers: Teacher[] = [
  {
    id: 'guru-1',
    nip: '196805121992031004',
    nuptk: '4538746648200032',
    namaLengkap: 'Drs. H. Bambang Sujarwo, M.Pd.',
    gelar: 'M.Pd.',
    jenisKelamin: 'L',
    tempatLahir: 'Semarang',
    tanggalLahir: '1968-05-12',
    pendidikanTerakhir: 'S2',
    jurusan: 'Manajemen Pendidikan',
    jabatan: 'Kepala Sekolah',
    penugasanKelas: '-',
    statusKepegawaian: 'PNS',
    golonganRuang: 'IV/b',
    sertifikasi: true,
    noHp: '081288993411',
    email: 'bambang.sujarwo@guru.sd.belajar.id',
    alamat: 'Jl. Melati Blok C2 No. 12, Mekar Jaya',
    tmtKerja: '2018-09-01',
    statusAktif: true,
    fotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'guru-2',
    nip: '197503142000032001',
    nuptk: '7645753655300021',
    namaLengkap: 'Siti Rahmawati, S.Pd.',
    gelar: 'S.Pd.',
    jenisKelamin: 'P',
    tempatLahir: 'Bogor',
    tanggalLahir: '1975-03-14',
    pendidikanTerakhir: 'S1',
    jurusan: 'PGSD (Pendidikan Guru Sekolah Dasar)',
    jabatan: 'Guru Kelas 1',
    penugasanKelas: 'Kelas 1A',
    statusKepegawaian: 'PNS',
    golonganRuang: 'IV/a',
    sertifikasi: true,
    noHp: '081377889920',
    email: 'siti.rahmawati@guru.sd.belajar.id',
    alamat: 'Perum Permata Indah B4/08, Depok',
    tmtKerja: '2005-01-10',
    statusAktif: true,
    fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'guru-3',
    nip: '198811202015022002',
    nuptk: '8239766668210012',
    namaLengkap: 'Dewi Anggraini, S.Pd.',
    gelar: 'S.Pd.',
    jenisKelamin: 'P',
    tempatLahir: 'Jakarta',
    tanggalLahir: '1988-11-20',
    pendidikanTerakhir: 'S1',
    jurusan: 'PGSD',
    jabatan: 'Guru Kelas 1',
    penugasanKelas: 'Kelas 1B',
    statusKepegawaian: 'PPPK',
    golonganRuang: 'IX',
    sertifikasi: true,
    noHp: '085711223344',
    email: 'dewi.anggraini@guru.sd.belajar.id',
    alamat: 'Jl. Rawa Maya III No. 19, Depok',
    tmtKerja: '2019-07-15',
    statusAktif: true,
    fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'guru-4',
    nip: '198208152008011006',
    nuptk: '3447760662200003',
    namaLengkap: 'Ahmad Fauzi, S.Pd.I.',
    gelar: 'S.Pd.I.',
    jenisKelamin: 'L',
    tempatLahir: 'Cirebon',
    tanggalLahir: '1982-08-15',
    pendidikanTerakhir: 'S1',
    jurusan: 'Pendidikan Agama Islam',
    jabatan: 'Guru PAI',
    penugasanKelas: 'Semua Kelas',
    statusKepegawaian: 'PNS',
    golonganRuang: 'III/c',
    sertifikasi: true,
    noHp: '081299887766',
    email: 'ahmad.fauzi@guru.sd.belajar.id',
    alamat: 'Kp. Tipar Tengah RT 02/08, Mekar Jaya',
    tmtKerja: '2010-02-01',
    statusAktif: true,
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'guru-5',
    nip: '199104052020121005',
    nuptk: '5136769670130102',
    namaLengkap: 'Rizky Kurniawan, S.Pd.',
    gelar: 'S.Pd.',
    jenisKelamin: 'L',
    tempatLahir: 'Bandung',
    tanggalLahir: '1991-04-05',
    pendidikanTerakhir: 'S1',
    jurusan: 'Pendidikan Jasmani & Kesehatan (PJOK)',
    jabatan: 'Guru PJOK',
    penugasanKelas: 'Semua Kelas',
    statusKepegawaian: 'PPPK',
    golonganRuang: 'IX',
    sertifikasi: true,
    noHp: '087822334455',
    email: 'rizky.kurniawan@guru.sd.belajar.id',
    alamat: 'Jl. Dahlia V No. 33, Cimanggis',
    tmtKerja: '2021-03-01',
    statusAktif: true,
    fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'guru-6',
    nip: '197906102005012011',
    nuptk: '6242757659300043',
    namaLengkap: 'Tri Astuti, S.Pd., M.M.',
    gelar: 'M.M.',
    jenisKelamin: 'P',
    tempatLahir: 'Klaten',
    tanggalLahir: '1979-06-10',
    pendidikanTerakhir: 'S2',
    jurusan: 'Magister Manajemen Pendidikan',
    jabatan: 'Guru Kelas 5',
    penugasanKelas: 'Kelas 5A',
    statusKepegawaian: 'PNS',
    golonganRuang: 'IV/a',
    sertifikasi: true,
    noHp: '081399445566',
    email: 'tri.astuti@guru.sd.belajar.id',
    alamat: 'Komplek Griya Asri Blok D1/05, Depok',
    tmtKerja: '2008-08-01',
    statusAktif: true,
    fotoUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'guru-7',
    nip: '198402172010011009',
    nuptk: '1949762664200012',
    namaLengkap: 'Hendro Nugroho, S.Pd.',
    gelar: 'S.Pd.',
    jenisKelamin: 'L',
    tempatLahir: 'Surakarta',
    tanggalLahir: '1984-02-17',
    pendidikanTerakhir: 'S1',
    jurusan: 'PGSD',
    jabatan: 'Guru Kelas 6',
    penugasanKelas: 'Kelas 6A',
    statusKepegawaian: 'PNS',
    golonganRuang: 'III/d',
    sertifikasi: true,
    noHp: '081234567890',
    email: 'hendro.nugroho@guru.sd.belajar.id',
    alamat: 'Jl. Kenanga No. 88 RT 01/RW 05, Depok',
    tmtKerja: '2011-01-15',
    statusAktif: true
  },
  {
    id: 'guru-8',
    nip: '-',
    nuptk: '9547772673230193',
    namaLengkap: 'Nadia Pratiwi, S.Pd.',
    gelar: 'S.Pd.',
    jenisKelamin: 'P',
    tempatLahir: 'Depok',
    tanggalLahir: '1996-09-24',
    pendidikanTerakhir: 'S1',
    jurusan: 'Pendidikan Bahasa Inggris',
    jabatan: 'Guru Bahasa Inggris',
    penugasanKelas: 'Kelas 4-6',
    statusKepegawaian: 'GTT / Honorer',
    golonganRuang: '-',
    sertifikasi: false,
    noHp: '089655443322',
    email: 'nadia.pratiwi@sdn01mekarjaya.sch.id',
    alamat: 'Jl. H. Dimun RT 03/11, Sukamaju',
    tmtKerja: '2022-07-11',
    statusAktif: true
  },
  {
    id: 'guru-9',
    nip: '-',
    nuptk: '-',
    namaLengkap: 'Bagus Pratama, A.Md.Kom.',
    gelar: 'A.Md.Kom.',
    jenisKelamin: 'L',
    tempatLahir: 'Jakarta',
    tanggalLahir: '1995-12-03',
    pendidikanTerakhir: 'D3',
    jurusan: 'Manajemen Informatika',
    jabatan: 'Operator Dapodik',
    penugasanKelas: '-',
    statusKepegawaian: 'GTT / Honorer',
    golonganRuang: '-',
    sertifikasi: false,
    noHp: '081288776655',
    email: 'operator.sdn01mj@gmail.com',
    alamat: 'Jl. Raden Saleh No. 14, Sukmajaya',
    tmtKerja: '2020-01-02',
    statusAktif: true
  }
];

export const initialStudents: Student[] = [
  // Kelas 1A
  {
    id: 'std-1',
    nis: '2025001',
    nisn: '3184920191',
    namaLengkap: 'Aditya Pratama Putra',
    namaPanggilan: 'Adit',
    jenisKelamin: 'L',
    kelas: '1A',
    tempatLahir: 'Depok',
    tanggalLahir: '2018-04-14',
    agama: 'Islam',
    namaAyah: 'Budi Santoso',
    pekerjaanAyah: 'Wiraswasta',
    namaIbu: 'Ratna Sari',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    noHpOrtu: '081298765432',
    alamat: 'Jl. Kamboja No. 12 RT 02/RW 04, Mekar Jaya',
    kelurahan: 'Mekar Jaya',
    kecamatan: 'Cimanggis',
    statusSiswa: 'Aktif',
    tanggalMasuk: '2024-07-15',
    anakKe: 1,
    jumlahSaudara: 2,
    tinggiBadan: 126,
    beratBadan: 25,
    catatanKesehatan: 'Pendengaran, penglihatan, dan gigi dalam kondisi sehat.',
    catatanPrestasi: 'Juara 1 Lomba Mewarnai Tingkat Kecamatan 2024'
  },
  {
    id: 'std-2',
    nis: '2025002',
    nisn: '3184920192',
    namaLengkap: 'Anindya Putri Kirana',
    namaPanggilan: 'Anin',
    jenisKelamin: 'P',
    kelas: '1A',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2018-06-21',
    agama: 'Islam',
    namaAyah: 'Dedi Kurniawan',
    pekerjaanAyah: 'Karyawan Swasta',
    namaIbu: 'Fitri Handayani',
    pekerjaanIbu: 'Guru PAUD',
    noHpOrtu: '081387654321',
    alamat: 'Perum Mekar Indah Blok A No. 5',
    kelurahan: 'Mekar Jaya',
    kecamatan: 'Cimanggis',
    statusSiswa: 'Aktif',
    tanggalMasuk: '2024-07-15',
    anakKe: 2,
    jumlahSaudara: 3,
    tinggiBadan: 122,
    beratBadan: 23,
    catatanKesehatan: 'Sehat jasmani dan rohani, tidak ada alergi.'
  },
  {
    id: 'std-3',
    nis: '2025003',
    nisn: '3184920193',
    namaLengkap: 'Bima Arya Wibowo',
    namaPanggilan: 'Bima',
    jenisKelamin: 'L',
    kelas: '1A',
    tempatLahir: 'Bogor',
    tanggalLahir: '2018-02-10',
    agama: 'Islam',
    namaAyah: 'Aryo Wibowo',
    pekerjaanAyah: 'PNS',
    namaIbu: 'Endang Wahyuni',
    pekerjaanIbu: 'PNS',
    noHpOrtu: '085712345678',
    alamat: 'Jl. H. Japat No. 89 RT 01/RW 02',
    kelurahan: 'Mekar Jaya',
    kecamatan: 'Cimanggis',
    statusSiswa: 'Aktif',
    tanggalMasuk: '2024-07-15',
    anakKe: 1,
    jumlahSaudara: 1,
    tinggiBadan: 128,
    beratBadan: 27,
    catatanKesehatan: 'Pertumbuhan fisik sangat baik dan aktif berolahraga.'
  },
  {
    id: 'std-4',
    nis: '2025004',
    nisn: '3184920194',
    namaLengkap: 'Clara Evelyn Simanjuntak',
    namaPanggilan: 'Clara',
    jenisKelamin: 'P',
    kelas: '1A',
    tempatLahir: 'Medan',
    tanggalLahir: '2018-08-30',
    agama: 'Kristen',
    namaAyah: 'Robert Simanjuntak',
    pekerjaanAyah: 'Wiraswasta',
    namaIbu: 'Maria Hutapea',
    pekerjaanIbu: 'Bidan',
    noHpOrtu: '081234112233',
    alamat: 'Jl. Flamboyan No. 17 RT 03/RW 06',
    kelurahan: 'Mekar Jaya',
    kecamatan: 'Cimanggis',
    statusSiswa: 'Aktif',
    tanggalMasuk: '2024-07-15',
    anakKe: 2,
    jumlahSaudara: 2,
    tinggiBadan: 124,
    beratBadan: 24,
    catatanKesehatan: 'Kondisi kesehatan umum sangat baik.'
  },

  // Kelas 1B
  {
    id: 'std-5',
    nis: '2025021',
    nisn: '3184920205',
    namaLengkap: 'Daffa Rizky Ramadhan',
    namaPanggilan: 'Daffa',
    jenisKelamin: 'L',
    kelas: '1B',
    tempatLahir: 'Depok',
    tanggalLahir: '2018-05-18',
    agama: 'Islam',
    namaAyah: 'Gunawan',
    pekerjaanAyah: 'TNI/Polri',
    namaIbu: 'Nur Hasanah',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    noHpOrtu: '081399887711',
    alamat: 'Asrama Brimob Blok G No. 12',
    kelurahan: 'Tugu',
    kecamatan: 'Cimanggis',
    statusSiswa: 'Aktif',
    tanggalMasuk: '2024-07-15',
    anakKe: 1,
    jumlahSaudara: 2,
    tinggiBadan: 125,
    beratBadan: 26,
    catatanKesehatan: 'Postur tegap dan kesehatan fisik baik.'
  },
  {
    id: 'std-6',
    nis: '2025022',
    nisn: '3184920206',
    namaLengkap: 'Farah Alya Azzahra',
    namaPanggilan: 'Farah',
    jenisKelamin: 'P',
    kelas: '1B',
    tempatLahir: 'Bandung',
    tanggalLahir: '2018-09-05',
    agama: 'Islam',
    namaAyah: 'Harun Al-Rasyid',
    pekerjaanAyah: 'Dosen',
    namaIbu: 'Siti Aminah',
    pekerjaanIbu: 'Dosen',
    noHpOrtu: '085811223344',
    alamat: 'Jl. Rinjani Blok C No. 4, Cimanggis',
    kelurahan: 'Mekar Jaya',
    kecamatan: 'Cimanggis',
    statusSiswa: 'Aktif',
    tanggalMasuk: '2024-07-15',
    anakKe: 1,
    jumlahSaudara: 1,
    tinggiBadan: 121,
    beratBadan: 22,
    catatanKesehatan: 'Sehat dan ceria.'
  },

  // Kelas 2A
  {
    id: 'std-7',
    nis: '2024005',
    nisn: '3173829101',
    namaLengkap: 'Gibran Rakha Alfarizi',
    namaPanggilan: 'Gibran',
    jenisKelamin: 'L',
    kelas: '2A',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2017-03-12',
    agama: 'Islam',
    namaAyah: 'Fajar Nugraha',
    pekerjaanAyah: 'Akuntan',
    namaIbu: 'Maya Lestari',
    pekerjaanIbu: 'Karyawan Swasta',
    noHpOrtu: '081277665544',
    alamat: 'Jl. Anggrek No. 4 RT 05/RW 01',
    kelurahan: 'Mekar Jaya',
    kecamatan: 'Cimanggis',
    statusSiswa: 'Aktif',
    tanggalMasuk: '2023-07-17',
    anakKe: 1,
    jumlahSaudara: 2
  },
  {
    id: 'std-8',
    nis: '2024006',
    nisn: '3173829102',
    namaLengkap: 'Hana Khairunnisa',
    namaPanggilan: 'Hana',
    jenisKelamin: 'P',
    kelas: '2A',
    tempatLahir: 'Depok',
    tanggalLahir: '2017-07-22',
    agama: 'Islam',
    namaAyah: 'Ilyas Pratama',
    pekerjaanAyah: 'Wiraswasta',
    namaIbu: 'Yuliana',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    noHpOrtu: '081366554433',
    alamat: 'Jl. Kemuning Raya No. 22',
    kelurahan: 'Mekar Jaya',
    kecamatan: 'Cimanggis',
    statusSiswa: 'Aktif',
    tanggalMasuk: '2023-07-17',
    anakKe: 2,
    jumlahSaudara: 3
  },

  // Kelas 3A
  {
    id: 'std-9',
    nis: '2023011',
    nisn: '3162718290',
    namaLengkap: 'Irfan Hakim Maulana',
    namaPanggilan: 'Irfan',
    jenisKelamin: 'L',
    kelas: '3A',
    tempatLahir: 'Depok',
    tanggalLahir: '2016-01-19',
    agama: 'Islam',
    namaAyah: 'Kamaludin',
    pekerjaanAyah: 'Pedagang',
    namaIbu: 'Jamilah',
    pekerjaanIbu: 'Pedagang',
    noHpOrtu: '087811992288',
    alamat: 'Jl. Pasar Agung No. 10 RT 03/RW 08',
    kelurahan: 'Abadijaya',
    kecamatan: 'Sukmajaya',
    statusSiswa: 'Aktif',
    tanggalMasuk: '2022-07-18',
    anakKe: 3,
    jumlahSaudara: 4
  },
  {
    id: 'std-10',
    nis: '2023012',
    nisn: '3162718291',
    namaLengkap: 'Jessica Aurelia Tan',
    namaPanggilan: 'Jessica',
    jenisKelamin: 'P',
    kelas: '3A',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2016-10-15',
    agama: 'Buddha',
    namaAyah: 'Hendrik Tan',
    pekerjaanAyah: 'Pengusaha',
    namaIbu: 'Lina Wijaya',
    pekerjaanIbu: 'Wiraswasta',
    noHpOrtu: '081299001122',
    alamat: 'Grand Depok City Cluster Angsana No. 18',
    kelurahan: 'Kalimulya',
    kecamatan: 'Cilodong',
    statusSiswa: 'Aktif',
    tanggalMasuk: '2022-07-18',
    anakKe: 1,
    jumlahSaudara: 1,
    catatanPrestasi: 'Juara 2 Lomba Sempoa & Matematika Cepat Kota Depok'
  },

  // Kelas 4A
  {
    id: 'std-11',
    nis: '2022015',
    nisn: '3151609384',
    namaLengkap: 'Kenzo Alvaro Saputra',
    namaPanggilan: 'Kenzo',
    jenisKelamin: 'L',
    kelas: '4A',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2015-05-27',
    agama: 'Islam',
    namaAyah: 'Lukman Hakim',
    pekerjaanAyah: 'Arsitek',
    namaIbu: 'Nita Rosita',
    pekerjaanIbu: 'Desainer',
    noHpOrtu: '081311445566',
    alamat: 'Jl. Merak No. 7 RT 01/RW 04',
    kelurahan: 'Mekar Jaya',
    kecamatan: 'Cimanggis',
    statusSiswa: 'Aktif',
    tanggalMasuk: '2021-07-12',
    anakKe: 2,
    jumlahSaudara: 2
  },
  {
    id: 'std-12',
    nis: '2022016',
    nisn: '3151609385',
    namaLengkap: 'Larasati Ayu Maharani',
    namaPanggilan: 'Laras',
    jenisKelamin: 'P',
    kelas: '4A',
    tempatLahir: 'Yogyakarta',
    tanggalLahir: '2015-11-09',
    agama: 'Islam',
    namaAyah: 'Mulyadi',
    pekerjaanAyah: 'PNS',
    namaIbu: 'Sri Rejeki',
    pekerjaanIbu: 'Guru SMA',
    noHpOrtu: '085699887744',
    alamat: 'Jl. Cempaka III No. 14, Depok Timur',
    kelurahan: 'Mekar Jaya',
    kecamatan: 'Cimanggis',
    statusSiswa: 'Aktif',
    tanggalMasuk: '2021-07-12',
    anakKe: 1,
    jumlahSaudara: 3,
    catatanPrestasi: 'Juara 1 Lomba Tari Tradisional FLS2N Tingkat Kecamatan'
  },

  // Kelas 5A
  {
    id: 'std-13',
    nis: '2021008',
    nisn: '3140598271',
    namaLengkap: 'Muhammad Fadhil Zaidan',
    namaPanggilan: 'Fadhil',
    jenisKelamin: 'L',
    kelas: '5A',
    tempatLahir: 'Depok',
    tanggalLahir: '2014-08-17',
    agama: 'Islam',
    namaAyah: 'Zaidan Basri',
    pekerjaanAyah: 'Dokter',
    namaIbu: 'drg. Rina Marlina',
    pekerjaanIbu: 'Dokter Gigi',
    noHpOrtu: '081122334455',
    alamat: 'Jl. Danau Toba No. 101, Sukmajaya',
    kelurahan: 'Baktijaya',
    kecamatan: 'Sukmajaya',
    statusSiswa: 'Aktif',
    tanggalMasuk: '2020-07-13',
    anakKe: 1,
    jumlahSaudara: 2,
    catatanPrestasi: 'Juara 1 Olimpiade Sains Nasional (OSN) IPA Tingkat Kota'
  },
  {
    id: 'std-14',
    nis: '2021009',
    nisn: '3140598272',
    namaLengkap: 'Naura Syakira Putri',
    namaPanggilan: 'Naura',
    jenisKelamin: 'P',
    kelas: '5A',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2014-12-04',
    agama: 'Islam',
    namaAyah: 'Teguh Prasetyo',
    pekerjaanAyah: 'BUMN',
    namaIbu: 'Indah Permatasari',
    pekerjaanIbu: 'Notaris',
    noHpOrtu: '081288990011',
    alamat: 'Villa Pertiwi Blok F No. 2',
    kelurahan: 'Sukamaju',
    kecamatan: 'Cilodong',
    statusSiswa: 'Aktif',
    tanggalMasuk: '2020-07-13',
    anakKe: 2,
    jumlahSaudara: 3
  },

  // Kelas 6A
  {
    id: 'std-15',
    nis: '2020001',
    nisn: '3139487162',
    namaLengkap: 'Rafi Ahmad Al-Ghifari',
    namaPanggilan: 'Rafi',
    jenisKelamin: 'L',
    kelas: '6A',
    tempatLahir: 'Padang',
    tanggalLahir: '2013-02-14',
    agama: 'Islam',
    namaAyah: 'Syahril Anwar',
    pekerjaanAyah: 'Pedagang',
    namaIbu: 'Rosmala Dewi',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    noHpOrtu: '085299443322',
    alamat: 'Jl. Bahagia Raya No. 44 RT 06/RW 03',
    kelurahan: 'Mekar Jaya',
    kecamatan: 'Cimanggis',
    statusSiswa: 'Aktif',
    tanggalMasuk: '2019-07-15',
    anakKe: 1,
    jumlahSaudara: 2,
    catatanPrestasi: 'Kapten Tim Futsal Juara O2SN SD 2024'
  },
  {
    id: 'std-16',
    nis: '2020002',
    nisn: '3139487163',
    namaLengkap: 'Zahra Amelia Santika',
    namaPanggilan: 'Zahra',
    jenisKelamin: 'P',
    kelas: '6A',
    tempatLahir: 'Depok',
    tanggalLahir: '2013-09-28',
    agama: 'Islam',
    namaAyah: 'Wahyudi Santika',
    pekerjaanAyah: 'Programmer',
    namaIbu: 'Dewi Lestari',
    pekerjaanIbu: 'Guru',
    noHpOrtu: '081344556677',
    alamat: 'Jl. Merapi No. 29, Mekar Jaya',
    kelurahan: 'Mekar Jaya',
    kecamatan: 'Cimanggis',
    statusSiswa: 'Aktif',
    tanggalMasuk: '2019-07-15',
    anakKe: 1,
    jumlahSaudara: 1,
    catatanPrestasi: 'Peringkat 1 Paralel Kelas 6 & Finalis Cerdas Cermat'
  },
  {
    id: 'std-17',
    nis: '2020018',
    nisn: '3139487169',
    namaLengkap: 'Reyhan Putra Pratama',
    namaPanggilan: 'Reyhan',
    jenisKelamin: 'L',
    kelas: '6B',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2013-06-11',
    agama: 'Islam',
    namaAyah: 'Danang Pratama',
    pekerjaanAyah: 'Wiraswasta',
    namaIbu: 'Ratih Purwasih',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    noHpOrtu: '081233445588',
    alamat: 'Jl. Proklamasi Blok B No. 9',
    kelurahan: 'Abadijaya',
    kecamatan: 'Sukmajaya',
    statusSiswa: 'Aktif',
    tanggalMasuk: '2019-07-15',
    anakKe: 2,
    jumlahSaudara: 2
  },
  {
    id: 'std-18',
    nis: '2020019',
    nisn: '3139487170',
    namaLengkap: 'Salma Nur Azizah',
    namaPanggilan: 'Salma',
    jenisKelamin: 'P',
    kelas: '6B',
    tempatLahir: 'Solo',
    tanggalLahir: '2013-10-05',
    agama: 'Islam',
    namaAyah: 'Triyono',
    pekerjaanAyah: 'PNS',
    namaIbu: 'Susanti',
    pekerjaanIbu: 'PNS',
    noHpOrtu: '087788991122',
    alamat: 'Jl. Kutilang No. 3 RT 02/RW 07',
    kelurahan: 'Mekar Jaya',
    kecamatan: 'Cimanggis',
    statusSiswa: 'Aktif',
    tanggalMasuk: '2019-07-15',
    anakKe: 1,
    jumlahSaudara: 2
  },
  {
    id: 'std-19',
    nis: '2022035',
    nisn: '3158829101',
    namaLengkap: 'Dimas Anggara Saputra',
    namaPanggilan: 'Dimas',
    jenisKelamin: 'L',
    kelas: '4A',
    tempatLahir: 'Depok',
    tanggalLahir: '2015-08-19',
    agama: 'Islam',
    namaAyah: 'Haryanto Saputra',
    pekerjaanAyah: 'Wiraswasta',
    namaIbu: 'Ratnawati',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    noHpOrtu: '081299881122',
    alamat: 'Jl. Merpati Putih No. 17',
    kelurahan: 'Mekar Jaya',
    kecamatan: 'Cimanggis',
    statusSiswa: 'Pindah',
    sekolahTujuan: 'SDN 2 Sukajaya',
    tanggalMutasi: '2026-07-10',
    tanggalMasuk: '2021-07-12',
    anakKe: 1,
    jumlahSaudara: 2,
    catatanPrestasi: 'Mutasi ke SDN 2 Sukajaya: Mengikuti kepindahan tugas orang tua'
  },
  {
    id: 'std-20',
    nis: '2023040',
    nisn: '3169918233',
    namaLengkap: 'Farhan Rizki Ramadhan',
    namaPanggilan: 'Farhan',
    jenisKelamin: 'L',
    kelas: '3B',
    tempatLahir: 'Bogor',
    tanggalLahir: '2016-06-12',
    agama: 'Islam',
    namaAyah: 'Mulyadi',
    pekerjaanAyah: 'Buruh Harian Lepas',
    namaIbu: 'Kalsum',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    noHpOrtu: '085711223344',
    alamat: 'Kp. Tipar RT 04/RW 08',
    kelurahan: 'Mekar Jaya',
    kecamatan: 'Cimanggis',
    statusSiswa: 'Non-Aktif',
    alasanKeluar: 'Faktor ekonomi & ikut orang tua ke luar daerah',
    tanggalKeluar: '2026-06-25',
    tanggalMasuk: '2022-07-18',
    anakKe: 2,
    jumlahSaudara: 4,
    catatanPrestasi: 'Keluar: Faktor ekonomi & ikut orang tua ke luar daerah'
  }
];

export const initialAgendas: SchoolAgenda[] = [
  {
    id: 'agenda-1',
    judul: 'Asesmen Bakat Minat & Try Out ANBK Kelas 5',
    tanggal: '2026-08-28',
    waktu: '07.30 - 11.30 WIB',
    lokasi: 'Laboratorium Komputer',
    kategori: 'Ujian',
    keterangan: 'Simulasi penggunaan perangkat Chromebook & aplikasi Pusmendik',
    selesai: false
  },
  {
    id: 'agenda-2',
    judul: 'Rapat Koordinasi Komite Sekolah & Paguyuban Kelas',
    tanggal: '2026-08-30',
    waktu: '09.00 - 12.00 WIB',
    lokasi: 'Aula Pertemuan Lantai 2',
    kategori: 'Dinas / Rapat',
    keterangan: 'Sosialisasi program P5 (Projek Penguatan Profil Pelajar Pancasila) semester ini',
    selesai: false
  },
  {
    id: 'agenda-3',
    judul: 'Pemeriksaan Kesehatan Berkala & Imunisasi BIAS',
    tanggal: '2026-09-04',
    waktu: '08.00 - selesai',
    lokasi: 'Ruang UKS & Kelas 1-2',
    kategori: 'Kesiswaan',
    keterangan: 'Kerjasama dengan UPTD Puskesmas Cimanggis untuk siswa kelas 1 dan 2',
    selesai: false
  },
  {
    id: 'agenda-4',
    judul: 'Gelar Karya P5 & Pentas Seni Budaya Nusantara',
    tanggal: '2026-09-18',
    waktu: '08.00 - 14.00 WIB',
    lokasi: 'Halaman Utama Sekolah',
    kategori: 'Akademik',
    keterangan: 'Pameran kreasi daur ulang sampah dan penampilan tari daerah siswa kelas 1-6',
    selesai: false
  }
];

export const initialAnnouncements: SchoolAnnouncement[] = [
  {
    id: 'ann-1',
    judul: 'Pembaruan Data Pokok Pendidikan (Dapodik) Semester Ganjil/Genap',
    tanggal: '2026-08-20',
    prioritas: 'Tinggi',
    isi: 'Bapak/Ibu Wali Kelas dimohon memverifikasi NISN, NIK Orang Tua, dan kelengkapan Akta Kelahiran seluruh siswa sebelum batas sinkronisasi Dapodik.',
    pembuat: 'Bagus Pratama (Operator Dapodik)'
  },
  {
    id: 'ann-2',
    judul: 'Jadwal Penggunaan Seragam Sekolah Peserta Didik',
    tanggal: '2026-08-15',
    prioritas: 'Biasa',
    isi: 'Senin-Selasa: Merah Putih lengkap dasi & topi. Rabu: Batik Sekolah. Kamis: Pramuka Lengkap. Jumat: Busana Muslim / Seragam Olahraga.',
    pembuat: 'Drs. H. Bambang Sujarwo, M.Pd.'
  }
];

export const initialAttendance: DailyClassAttendance[] = [
  // ==========================================
  // SEMESTER GENAP 2025/2026 (Januari - Juni 2026)
  // ==========================================
  {
    id: 'att-2026-02-16-1A',
    tanggal: '2026-02-16',
    kelas: '1A',
    semester: 'Genap',
    tahunAjaran: '2025/2026',
    guruPenginput: 'Siti Nurhaliza, S.Pd.SD',
    catatanKelas: 'Pembelajaran tematik lancar, 1 siswa sakit',
    updatedAt: '2026-02-16T07:45:00.000Z',
    records: [
      { studentId: 'std-1', status: 'Hadir' },
      { studentId: 'std-2', status: 'Hadir' },
      { studentId: 'std-3', status: 'Sakit', keterangan: 'Demam tinggi / istirahat' }
    ]
  },
  {
    id: 'att-2026-03-10-1A',
    tanggal: '2026-03-10',
    kelas: '1A',
    semester: 'Genap',
    tahunAjaran: '2025/2026',
    guruPenginput: 'Siti Nurhaliza, S.Pd.SD',
    catatanKelas: '1 siswa izin kontrol kesehatan gigi',
    updatedAt: '2026-03-10T07:45:00.000Z',
    records: [
      { studentId: 'std-1', status: 'Hadir' },
      { studentId: 'std-2', status: 'Izin', keterangan: 'Kontrol rutin dokter gigi' },
      { studentId: 'std-3', status: 'Hadir' }
    ]
  },
  {
    id: 'att-2026-04-14-1A',
    tanggal: '2026-04-14',
    kelas: '1A',
    semester: 'Genap',
    tahunAjaran: '2025/2026',
    guruPenginput: 'Siti Nurhaliza, S.Pd.SD',
    catatanKelas: 'Pembelajaran persiapan sumatif berjalan tertib',
    updatedAt: '2026-04-14T07:45:00.000Z',
    records: [
      { studentId: 'std-1', status: 'Hadir' },
      { studentId: 'std-2', status: 'Hadir' },
      { studentId: 'std-3', status: 'Sakit', keterangan: 'Flu dan batuk' }
    ]
  },
  {
    id: 'att-2026-05-18-1A',
    tanggal: '2026-05-18',
    kelas: '1A',
    semester: 'Genap',
    tahunAjaran: '2025/2026',
    guruPenginput: 'Siti Nurhaliza, S.Pd.SD',
    catatanKelas: 'Seluruh siswa hadir lengkap 100%',
    updatedAt: '2026-05-18T07:45:00.000Z',
    records: [
      { studentId: 'std-1', status: 'Hadir' },
      { studentId: 'std-2', status: 'Hadir' },
      { studentId: 'std-3', status: 'Hadir' }
    ]
  },
  {
    id: 'att-2026-03-10-2A',
    tanggal: '2026-03-10',
    kelas: '2A',
    semester: 'Genap',
    tahunAjaran: '2025/2026',
    guruPenginput: 'Dedi Kurniawan, S.Pd.',
    catatanKelas: '1 siswa izin ada acara keluarga',
    updatedAt: '2026-03-10T07:50:00.000Z',
    records: [
      { studentId: 'std-7', status: 'Hadir' },
      { studentId: 'std-8', status: 'Izin', keterangan: 'Acara keluarga di luar kota' },
      { studentId: 'std-9', status: 'Hadir' }
    ]
  },
  // ==========================================
  // SEMESTER GANJIL 2025/2026 (Juli - Desember)
  // ==========================================
  {
    id: 'att-2026-08-24-1A',
    tanggal: '2026-08-24',
    kelas: '1A',
    semester: 'Ganjil',
    tahunAjaran: '2025/2026',
    guruPenginput: 'Siti Nurhaliza, S.Pd.SD',
    catatanKelas: 'Siswa antusias mengikuti pembelajaran calistung ceria',
    updatedAt: '2026-08-24T07:45:00.000Z',
    records: [
      { studentId: 'std-1', status: 'Hadir' },
      { studentId: 'std-2', status: 'Hadir' },
      { studentId: 'std-3', status: 'Sakit', keterangan: 'Demam tinggi / istirahat di rumah' }
    ]
  },
  {
    id: 'att-2026-08-24-1B',
    tanggal: '2026-08-24',
    kelas: '1B',
    semester: 'Ganjil',
    tahunAjaran: '2025/2026',
    guruPenginput: 'Siti Nurhaliza, S.Pd.SD',
    catatanKelas: 'Semua siswa hadir tepat waktu',
    updatedAt: '2026-08-24T07:40:00.000Z',
    records: [
      { studentId: 'std-4', status: 'Hadir' },
      { studentId: 'std-5', status: 'Hadir' },
      { studentId: 'std-6', status: 'Hadir' }
    ]
  },
  {
    id: 'att-2026-08-24-2A',
    tanggal: '2026-08-24',
    kelas: '2A',
    semester: 'Ganjil',
    tahunAjaran: '2025/2026',
    guruPenginput: 'Dedi Kurniawan, S.Pd.',
    catatanKelas: '1 siswa izin ada urusan keluarga',
    updatedAt: '2026-08-24T07:50:00.000Z',
    records: [
      { studentId: 'std-7', status: 'Hadir' },
      { studentId: 'std-8', status: 'Izin', keterangan: 'Menghadiri hajatan keluarga' },
      { studentId: 'std-9', status: 'Hadir' }
    ]
  },
  {
    id: 'att-2026-08-24-3A',
    tanggal: '2026-08-24',
    kelas: '3A',
    guruPenginput: 'Rina Wahyuni, S.Pd.',
    catatanKelas: 'Hadir lengkap 100%',
    updatedAt: '2026-08-24T07:35:00.000Z',
    records: [
      { studentId: 'std-10', status: 'Hadir' },
      { studentId: 'std-11', status: 'Hadir' },
      { studentId: 'std-12', status: 'Hadir' }
    ]
  },
  {
    id: 'att-2026-08-24-4A',
    tanggal: '2026-08-24',
    kelas: '4A',
    guruPenginput: 'Agus Setiawan, S.Pd.',
    catatanKelas: '1 siswa alpa tanpa kabar',
    updatedAt: '2026-08-24T07:55:00.000Z',
    records: [
      { studentId: 'std-13', status: 'Hadir' },
      { studentId: 'std-14', status: 'Alpa', keterangan: 'Tanpa surat keterangan' }
    ]
  },
  {
    id: 'att-2026-08-24-5A',
    tanggal: '2026-08-24',
    kelas: '5A',
    guruPenginput: 'Nurul Hidayah, S.Pd.I',
    catatanKelas: 'Persiapan simulasi ANBK berjalan lancar',
    updatedAt: '2026-08-24T07:42:00.000Z',
    records: [
      { studentId: 'std-15', status: 'Hadir' },
      { studentId: 'std-16', status: 'Hadir' }
    ]
  },
  {
    id: 'att-2026-08-24-6A',
    tanggal: '2026-08-24',
    kelas: '6A',
    guruPenginput: 'Eko Prasetyo, M.Pd.',
    catatanKelas: 'Pembahasan materi try out ujian sekolah',
    updatedAt: '2026-08-24T07:48:00.000Z',
    records: [
      { studentId: 'std-17', status: 'Hadir' },
      { studentId: 'std-18', status: 'Hadir' }
    ]
  },
  // Data for previous dates in August 2026
  {
    id: 'att-2026-08-23-1A',
    tanggal: '2026-08-23',
    kelas: '1A',
    semester: 'Ganjil',
    tahunAjaran: '2025/2026',
    guruPenginput: 'Siti Nurhaliza, S.Pd.SD',
    updatedAt: '2026-08-23T07:45:00.000Z',
    records: [
      { studentId: 'std-1', status: 'Hadir' },
      { studentId: 'std-2', status: 'Hadir' },
      { studentId: 'std-3', status: 'Hadir' }
    ]
  },
  {
    id: 'att-2026-08-22-1A',
    tanggal: '2026-08-22',
    kelas: '1A',
    semester: 'Ganjil',
    tahunAjaran: '2025/2026',
    guruPenginput: 'Siti Nurhaliza, S.Pd.SD',
    updatedAt: '2026-08-22T07:45:00.000Z',
    records: [
      { studentId: 'std-1', status: 'Hadir' },
      { studentId: 'std-2', status: 'Izin', keterangan: 'Izin kontrol dokter gigi' },
      { studentId: 'std-3', status: 'Hadir' }
    ]
  },
  {
    id: 'att-2026-08-21-1A',
    tanggal: '2026-08-21',
    kelas: '1A',
    semester: 'Ganjil',
    tahunAjaran: '2025/2026',
    guruPenginput: 'Siti Nurhaliza, S.Pd.SD',
    updatedAt: '2026-08-21T07:45:00.000Z',
    records: [
      { studentId: 'std-1', status: 'Hadir' },
      { studentId: 'std-2', status: 'Hadir' },
      { studentId: 'std-3', status: 'Hadir' }
    ]
  }
];

export { initialCurriculum } from './curriculumData';

export const initialTeachingJournals: DailyTeachingJournal[] = [
  {
    id: 'jrn-20260824-1',
    tanggal: '2026-08-24',
    hari: 'Senin',
    kelas: '1A',
    fase: 'Fase A Kelas 1',
    mataPelajaran: 'Bahasa Indonesia',
    tujuanPembelajaran: 'TP 1.1: Mengenal bunyi huruf dan merangkai suku kata "ba-be-bi-bo-bu"',
    materi: 'Mengenal Huruf B dan Membaca Suku Kata "Ba, Be, Bi, Bo, Bu"',
    refleksi: 'Sebagian besar peserta didik (85%) antusias dan cepat mengidentifikasi huruf B. Tiga siswa masih perlu pendampingan membaca suku kata terbalik seperti "ab" dan "ba".',
    keterangan: 'KBM berjalan lancar dengan media kartu huruf bergambar dan lagu fonik. Seluruh siswa hadir.',
    jamPelajaran: 'JP 1 - 2 (07:00 - 08:10)',
    selectedJp: [1, 2],
    totalJpCount: 2,
    totalMenit: 70,
    guruPengajar: 'Siti Nurhaliza, S.Pd.SD',
    statusKBM: 'Terlaksana',
    createdAt: '2026-08-24T08:30:00.000Z',
    updatedAt: '2026-08-24T08:30:00.000Z'
  },
  {
    id: 'jrn-20260824-2',
    tanggal: '2026-08-24',
    hari: 'Senin',
    kelas: '1A',
    fase: 'Fase A Kelas 1',
    mataPelajaran: 'Matematika',
    tujuanPembelajaran: 'TP 1.1: Membilang, membaca, dan menulis bilangan cacah sampai dengan 20',
    materi: 'Mengenal dan Membilang Bilangan 1 sampai 20',
    refleksi: 'Pembelajaran interaktif menggunakan manik-manik dan stik es krim. Siswa sangat aktif saat praktik menghitung maju dan mundur.',
    keterangan: 'Dilanjutkan tugas mewarnai angka di LKS halaman 14. KBM tuntas tepat waktu.',
    jamPelajaran: 'JP 3 - 4 (08:10 - 09:40)',
    selectedJp: [3, 4],
    totalJpCount: 2,
    totalMenit: 70,
    guruPengajar: 'Siti Nurhaliza, S.Pd.SD',
    statusKBM: 'Terlaksana',
    createdAt: '2026-08-24T10:00:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z'
  },
  {
    id: 'jrn-20260823-1',
    tanggal: '2026-08-23',
    hari: 'Sabtu',
    kelas: '4A',
    fase: 'Fase B Kelas 4',
    mataPelajaran: 'Ilmu Pengetahuan Alam dan Sosial',
    tujuanPembelajaran: 'TP 4.1: Mengidentifikasi bagian-bagian tumbuhan dan fungsinya dalam fotosintesis',
    materi: 'Bagian Tubuh Tumbuhan: Akar, Batang, Daun, Bunga, dan Buah',
    refleksi: 'Observasi langsung di taman sekolah membuat siswa memahami perbedaan akar serabut dan akar tunggang secara konkret.',
    keterangan: 'Siswa dibagi menjadi 5 kelompok observasi. Hasil laporan mini ditempel di mading kelas.',
    jamPelajaran: 'JP 1 - 3 (07:00 - 08:45)',
    selectedJp: [1, 2, 3],
    totalJpCount: 3,
    totalMenit: 105,
    guruPengajar: 'Rina Kartika, S.Pd.',
    statusKBM: 'Terlaksana',
    createdAt: '2026-08-23T09:15:00.000Z',
    updatedAt: '2026-08-23T09:15:00.000Z'
  },
  {
    id: 'jrn-20260822-1',
    tanggal: '2026-08-22',
    hari: 'Jumat',
    kelas: '1A',
    fase: 'Fase A Kelas 1',
    mataPelajaran: 'Pendidikan Pancasila',
    tujuanPembelajaran: 'TP 1.1: Mengidentifikasi simbol-simbol sila Pancasila pada lambang Garuda Pancasila',
    materi: 'Mengenal 5 Simbol Sila Pancasila dan Maknanya',
    refleksi: 'Anak-anak hafal bunyi sila 1-5 dan lambang bintang serta rantai emas. Simbol pohon beringin dan kepala banteng masih sering tertukar urutan silanya.',
    keterangan: 'Diberikan lembar kerja menghubungkan simbol sila dengan nomor sila.',
    jamPelajaran: 'JP 1 - 2 (07:00 - 08:10)',
    selectedJp: [1, 2],
    totalJpCount: 2,
    totalMenit: 70,
    guruPengajar: 'Siti Nurhaliza, S.Pd.SD',
    statusKBM: 'Terlaksana',
    createdAt: '2026-08-22T08:30:00.000Z',
    updatedAt: '2026-08-22T08:30:00.000Z'
  }
];

export const initialJpScheduleConfig: JpScheduleConfig = {
  jamMulai: '07:00',
  durasiJpMenit: 35, // 1 JP = 35 menit (Standar SD)
  totalJp: 8,
  breaks: [
    {
      id: 'brk-1',
      name: 'Istirahat 1 (Pagi)',
      afterJp: 3,
      durationMinutes: 20
    },
    {
      id: 'brk-2',
      name: 'Istirahat 2 (Siang / Dhuhur)',
      afterJp: 5,
      durationMinutes: 30
    }
  ]
};

export const initialAssessments: StudentAssessment[] = [
  {
    id: 'assess-1',
    tanggal: '2026-08-18',
    kelas: '1A',
    mataPelajaran: 'Matematika',
    jenisPenilaian: 'SH 1',
    materiTp: 'Bilangan Cacah sampai dengan 10 (Menghitung & Membandingkan Benda)',
    kkm: 75,
    guruPengampu: 'Siti Rahmawati, S.Pd.',
    grades: [
      { studentId: 'std-1', nilai: 88, catatan: 'Sangat baik dalam menghitung dan mengurutkan benda konkrit' },
      { studentId: 'std-2', nilai: 92, catatan: 'Sangat teliti dan mampu membandingkan kuantitas dengan tepat' },
      { studentId: 'std-3', nilai: 78, catatan: 'Tuntas, perlu latihan pengenalan simbol bilangan 6-10' },
      { studentId: 'std-4', nilai: 85, catatan: 'Mampu menyusun urutan bilangan maju dan mundur' },
      { studentId: 'std-5', nilai: 95, catatan: 'Sangat aktif dan mandiri dalam pengerjaan soal asesmen' },
      { studentId: 'std-6', nilai: 82, catatan: 'Tuntas dengan baik' },
      { studentId: 'std-7', nilai: 90, catatan: 'Hasil sangat baik' },
      { studentId: 'std-8', nilai: 75, catatan: 'Tuntas pas KKTP, perlu pendampingan tambahan' },
      { studentId: 'std-9', nilai: 88, catatan: 'Penguasaan materi sangat baik' },
      { studentId: 'std-10', nilai: 84, catatan: 'Tuntas dengan hasil memuaskan' }
    ],
    createdAt: '2026-08-18T10:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z'
  },
  {
    id: 'assess-2',
    tanggal: '2026-08-20',
    kelas: '1A',
    mataPelajaran: 'Bahasa Indonesia',
    jenisPenilaian: 'SH 1',
    materiTp: 'Mengenal Huruf Vokal dan Konsonan pada Suku Kata Sederhana',
    kkm: 75,
    guruPengampu: 'Siti Rahmawati, S.Pd.',
    grades: [
      { studentId: 'std-1', nilai: 85, catatan: 'Lancar melafalkan suku kata ba-bi-bu' },
      { studentId: 'std-2', nilai: 90, catatan: 'Mampu merangkai huruf menjadi kata dengan tepat' },
      { studentId: 'std-3', nilai: 80, catatan: 'Tuntas membaca kartu kata' },
      { studentId: 'std-4', nilai: 88, catatan: 'Sangat baik dalam dikte huruf dan kata' },
      { studentId: 'std-5', nilai: 92, catatan: 'Mampu membaca kalimat pendek secara lancar' },
      { studentId: 'std-6', nilai: 85, catatan: 'Tuntas' },
      { studentId: 'std-7', nilai: 87, catatan: 'Baik' },
      { studentId: 'std-8', nilai: 76, catatan: 'Perlu latihan menulis huruf konsonan' },
      { studentId: 'std-9', nilai: 90, catatan: 'Sangat baik' },
      { studentId: 'std-10', nilai: 85, catatan: 'Baik' }
    ],
    createdAt: '2026-08-20T10:30:00.000Z',
    updatedAt: '2026-08-20T10:30:00.000Z'
  },
  {
    id: 'assess-3',
    tanggal: '2026-08-22',
    kelas: '1A',
    mataPelajaran: 'Pendidikan Pancasila',
    jenisPenilaian: 'SH 2',
    materiTp: 'Aturan dan Tata Tertib di Rumah serta di Sekolah',
    kkm: 75,
    guruPengampu: 'Siti Rahmawati, S.Pd.',
    grades: [
      { studentId: 'std-1', nilai: 90, catatan: 'Mampu memberi contoh aturan di kelas secara konkret' },
      { studentId: 'std-2', nilai: 95, catatan: 'Sangat memahami dan disiplin mempraktikkan tata tertib' },
      { studentId: 'std-3', nilai: 85, catatan: 'Tuntas dengan baik' },
      { studentId: 'std-4', nilai: 88, catatan: 'Mampu membedakan hak dan kewajiban sederhana' },
      { studentId: 'std-5', nilai: 90, catatan: 'Sangat baik' },
      { studentId: 'std-6', nilai: 80, catatan: 'Tuntas' },
      { studentId: 'std-7', nilai: 85, catatan: 'Baik' },
      { studentId: 'std-8', nilai: 78, catatan: 'Tuntas' },
      { studentId: 'std-9', nilai: 92, catatan: 'Sangat baik' },
      { studentId: 'std-10', nilai: 86, catatan: 'Baik' }
    ],
    createdAt: '2026-08-22T09:00:00.000Z',
    updatedAt: '2026-08-22T09:00:00.000Z'
  }
];

export const initialExtracurriculars: ExtracurricularAssessment[] = [
  {
    id: 'ekskul-1',
    namaEkskul: 'Praja Muda Karana (Pramuka Siaga)',
    kategori: 'Wajib',
    kelas: '1A',
    tahunAjaran: '2025/2026',
    semester: 'Genap',
    pembina: 'Siti Rahmawati, S.Pd.',
    tanggalPenilaian: '2026-08-25',
    deskripsiUmum: 'Pengembangan karakter disiplin, kemandirian, kecakapan umum, dan kerja sama perindukan siaga.',
    grades: [
      { studentId: 'std-1', predikat: 'A', nilaiAngka: 92, keterangan: 'Sangat aktif dalam kegiatan tali temali dasar dan upacara siaga.' },
      { studentId: 'std-2', predikat: 'A', nilaiAngka: 95, keterangan: 'Menunjukkan jiwa kepemimpinan yang baik sebagai sulung siaga.' },
      { studentId: 'std-3', predikat: 'B', nilaiAngka: 85, keterangan: 'Tertib dan disiplin dalam mengikuti latihan mingguan perindukan.' },
      { studentId: 'std-4', predikat: 'A', nilaiAngka: 90, keterangan: 'Sangat antusias dalam kegiatan penjelajahan dan mengenal alam.' },
      { studentId: 'std-5', predikat: 'A', nilaiAngka: 93, keterangan: 'Aktif, terampil, dan selalu membantu teman dalam kelompok.' },
      { studentId: 'std-6', predikat: 'B', nilaiAngka: 82, keterangan: 'Mampu mempraktikkan dwi satya dan dwi darma dengan baik.' },
      { studentId: 'std-7', predikat: 'B', nilaiAngka: 86, keterangan: 'Disiplin dan aktif mengikuti seluruh rangkaian kegiatan siaga.' },
      { studentId: 'std-8', predikat: 'B', nilaiAngka: 80, keterangan: 'Cukup antusias dan mampu mengikuti arahan yanda/bunda pembina.' },
      { studentId: 'std-9', predikat: 'A', nilaiAngka: 91, keterangan: 'Sangat mandiri dan cekatan dalam menyelesaikan tugas kepramukaan.' },
      { studentId: 'std-10', predikat: 'B', nilaiAngka: 85, keterangan: 'Menunjukkan kerja sama yang baik dengan sesama anggota barung.' }
    ],
    createdAt: '2026-08-25T14:00:00.000Z',
    updatedAt: '2026-08-25T14:00:00.000Z'
  },
  {
    id: 'ekskul-2',
    namaEkskul: 'Dokter Kecil / UKS',
    kategori: 'Pilihan Olahraga',
    kelas: '1A',
    tahunAjaran: '2025/2026',
    semester: 'Genap',
    pembina: 'Tri Wahyuni, S.Pd.',
    tanggalPenilaian: '2026-08-26',
    deskripsiUmum: 'Pembinaan pola hidup bersih dan sehat (PHBS), P3K sederhana, serta kader kesehatan sekolah.',
    grades: [
      { studentId: 'std-1', predikat: 'A', nilaiAngka: 90, keterangan: 'Terampil mempraktikkan 6 langkah cuci tangan pakai sabun dan P3K dasar.' },
      { studentId: 'std-2', predikat: 'A', nilaiAngka: 92, keterangan: 'Sangat peduli terhadap kebersihan lingkungan kelas dan kesehatan teman.' },
      { studentId: 'std-5', predikat: 'A', nilaiAngka: 94, keterangan: 'Aktif menjadi kader kesehatan cilik dan teladan pola hidup sehat.' },
      { studentId: 'std-7', predikat: 'B', nilaiAngka: 85, keterangan: 'Memahami pentingnya konsumsi jajanan sehat dan gizi seimbang.' }
    ],
    createdAt: '2026-08-26T15:00:00.000Z',
    updatedAt: '2026-08-26T15:00:00.000Z'
  },
  {
    id: 'ekskul-3',
    namaEkskul: 'Seni Tari Tradisional',
    kategori: 'Pilihan Seni & Budaya',
    kelas: '1A',
    tahunAjaran: '2025/2026',
    semester: 'Genap',
    pembina: 'Dewi Lestari, S.Pd.',
    tanggalPenilaian: '2026-08-24',
    deskripsiUmum: 'Pelestarian seni budaya daerah melalui penguasaan gerak wiraga, wirama, dan wirasa tari kreasi anak.',
    grades: [
      { studentId: 'std-3', predikat: 'A', nilaiAngka: 90, keterangan: 'Mampu memperagakan gerak dasar tari kreasi Nusantara dengan luwes dan kompak.' },
      { studentId: 'std-4', predikat: 'A', nilaiAngka: 93, keterangan: 'Sangat lentur dan percaya diri tampil dalam pentas seni tari anak.' },
      { studentId: 'std-8', predikat: 'B', nilaiAngka: 84, keterangan: 'Cepat menghafal pola lantai dan ritme ketukan iringan tari.' }
    ],
    createdAt: '2026-08-24T16:00:00.000Z',
    updatedAt: '2026-08-24T16:00:00.000Z'
  }
];

export const initialCocurricularProjects: CocurricularProject[] = [
  {
    id: 'p5-proj-1',
    judulProjek: 'Pilah Sampah, Selamatkan Bumi Kita (Eko-Enzim & Kompos Cilik)',
    tema: 'Gaya Hidup Berkelanjutan',
    fase: 'Fase A (Kelas 1-2)',
    kelas: '1A',
    tahunAjaran: '2025/2026',
    semester: 'Genap',
    deskripsiSingkat: 'Projek ini bertujuan menumbuhkan kesadaran ramah lingkungan sejak dini dengan memilah sampah organik dan anorganik di sekolah serta membuat pupuk kompos sederhana.',
    koordinator: 'Siti Rahmawati, S.Pd.',
    fasilitator: ['Dewi Lestari, S.Pd.', 'Ahmad Fauzi, S.Pd.I.'],
    tanggalMulai: '2026-07-20',
    tanggalSelesai: '2026-08-30',
    targetElements: [
      {
        id: 'elem-1',
        dimensi: 'Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia',
        elemen: 'Akhlak kepada Alam',
        subElemen: 'Menjaga Lingkungan Alam Sekitar',
        targetCapaian: 'Membiasakan bersyukur atas karunia alam dan tidak membuang sampah sembarangan di lingkungan sekitar.'
      },
      {
        id: 'elem-2',
        dimensi: 'Bergotong Royong',
        elemen: 'Kolaborasi',
        subElemen: 'Kerja Sama & Berbagi',
        targetCapaian: 'Menerima dan melaksanakan tugas serta peran yang diberikan kelompok dalam sebuah kegiatan bersama.'
      },
      {
        id: 'elem-3',
        dimensi: 'Kreatif',
        elemen: 'Menghasilkan Karya dan Tindakan yang Orisinal',
        subElemen: 'Mengeksplorasi Ide Kreatif',
        targetCapaian: 'Mengeksplorasi dan mengekspresikan pikiran melalui pemanfaatan kembali wadah plastik bekas menjadi pot mini.'
      }
    ],
    studentGrades: [
      {
        studentId: 'std-1',
        ratings: { 'elem-1': 'BSH', 'elem-2': 'SAB', 'elem-3': 'BSH' },
        catatanProses: 'Sangat antusias mengumpulkan daun kering untuk kompos dan aktif membantu anggota kelompok.'
      },
      {
        studentId: 'std-2',
        ratings: { 'elem-1': 'SAB', 'elem-2': 'SAB', 'elem-3': 'SAB' },
        catatanProses: 'Menunjukkan inisiatif tinggi dalam memilah jenis sampah dan mampu mempresentasikan karyanya dengan percaya diri.'
      },
      {
        studentId: 'std-3',
        ratings: { 'elem-1': 'BSH', 'elem-2': 'BSH', 'elem-3': 'SB' },
        catatanProses: 'Mampu bekerjasama dalam tim dengan baik dan mematuhi instruksi fasilitator proyek.'
      },
      {
        studentId: 'std-4',
        ratings: { 'elem-1': 'BSH', 'elem-2': 'SAB', 'elem-3': 'BSH' },
        catatanProses: 'Cekatan dalam menghias pot daur ulang dan memiliki kepedulian tinggi terhadap kebersihan kelas.'
      },
      {
        studentId: 'std-5',
        ratings: { 'elem-1': 'SAB', 'elem-2': 'SAB', 'elem-3': 'BSH' },
        catatanProses: 'Selalu mengingatkan teman untuk membuang sampah pada tempat sampah yang sesuai warna.'
      },
      {
        studentId: 'std-6',
        ratings: { 'elem-1': 'BSH', 'elem-2': 'SB', 'elem-3': 'SB' },
        catatanProses: 'Mengikuti seluruh tahapan proyek dengan tertib dan menunjukkan rasa tanggung jawab.'
      },
      {
        studentId: 'std-7',
        ratings: { 'elem-1': 'BSH', 'elem-2': 'BSH', 'elem-3': 'BSH' },
        catatanProses: 'Bekerja sama dengan baik dalam kelompok dan disiplin saat jadwal perawatan komposter cilik.'
      },
      {
        studentId: 'std-8',
        ratings: { 'elem-1': 'SB', 'elem-2': 'SB', 'elem-3': 'MB' },
        catatanProses: 'Mulai memahami perbedaan sampah organik dan anorganik dengan pendampingan fasilitator.'
      },
      {
        studentId: 'std-9',
        ratings: { 'elem-1': 'SAB', 'elem-2': 'BSH', 'elem-3': 'SAB' },
        catatanProses: 'Kreativitas tinggi dalam membuat poster ajakan buang sampah pada tempatnya.'
      },
      {
        studentId: 'std-10',
        ratings: { 'elem-1': 'BSH', 'elem-2': 'BSH', 'elem-3': 'BSH' },
        catatanProses: 'Berpartisipasi aktif dalam kegiatan gelar karya mini pameran hasil projek di kelas.'
      }
    ],
    createdAt: '2026-08-20T08:00:00.000Z',
    updatedAt: '2026-08-20T08:00:00.000Z'
  },
  {
    id: 'p5-proj-2',
    judulProjek: 'Kearifan Makanan Tradisional Nusantara (Festival Jajanan Pasar Sehat)',
    tema: 'Kearifan Lokal',
    fase: 'Fase A (Kelas 1-2)',
    kelas: '1A',
    tahunAjaran: '2025/2026',
    semester: 'Genap',
    deskripsiSingkat: 'Projek mengenalkan keragaman kuliner tradisional Nusantara, bahan alami lokal seperti singkong dan kelapa, serta menumbuhkan rasa bangga terhadap warisan budaya bangsa.',
    koordinator: 'Dewi Lestari, S.Pd.',
    fasilitator: ['Siti Rahmawati, S.Pd.'],
    tanggalMulai: '2026-08-01',
    tanggalSelesai: '2026-09-15',
    targetElements: [
      {
        id: 'elem-201',
        dimensi: 'Berkebinekaan Global',
        elemen: 'Mengenal dan Menghargai Budaya',
        subElemen: 'Mendalami Budaya dan Identitas Budaya',
        targetCapaian: 'Mengidentifikasi dan mendeskripsikan keragaman kue tradisional nusantara yang ditemui di daerah tempat tinggal.'
      },
      {
        id: 'elem-202',
        dimensi: 'Mandiri',
        elemen: 'Regulasi Diri',
        subElemen: 'Percaya Diri dan Adaptif',
        targetCapaian: 'Berani mencoba dan mencicipi aneka makanan tradisional serta menceritakan pengalamannya.'
      },
      {
        id: 'elem-203',
        dimensi: 'Bernalar Kritis',
        elemen: 'Memperoleh dan Memproses Informasi',
        subElemen: 'Mengajukan Pertanyaan Sederhana',
        targetCapaian: 'Mengajukan pertanyaan sederhana tentang bahan pembuat jajanan pasar dan cara pembuatannya.'
      }
    ],
    studentGrades: [
      {
        studentId: 'std-1',
        ratings: { 'elem-201': 'BSH', 'elem-202': 'SAB', 'elem-203': 'BSH' },
        catatanProses: 'Percaya diri menceritakan rasa dan bentuk kue klepon yang dibawa dari rumah.'
      },
      {
        studentId: 'std-2',
        ratings: { 'elem-201': 'SAB', 'elem-202': 'SAB', 'elem-203': 'SAB' },
        catatanProses: 'Sangat antusias bertanya mengenai asal daerah makanan tradisional nusantara.'
      },
      {
        studentId: 'std-3',
        ratings: { 'elem-201': 'BSH', 'elem-202': 'BSH', 'elem-203': 'SB' },
        catatanProses: 'Mampu mengenali nama-nama jajanan tradisional dengan baik.'
      }
    ],
    createdAt: '2026-08-22T08:00:00.000Z',
    updatedAt: '2026-08-22T08:00:00.000Z'
  }
];


