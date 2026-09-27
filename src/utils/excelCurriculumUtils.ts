import * as XLSX from 'xlsx';
import { CurriculumItem, DailyTeachingJournal, SchoolProfile, normalizeSubjectName, detectSeniBudayaBranch } from '../types';

export interface ParsedCurriculumRow {
  isValid: boolean;
  errors: string[];
  data: CurriculumItem;
  originalRow: Record<string, any>;
}

// Flexible column name matching dictionary
const CURRICULUM_FIELD_ALIASES: Record<string, string[]> = {
  mataPelajaran: [
    'mata pelajaran', 'mapel', 'subject', 'mata_pelajaran', 'nama mapel', 
    'bidang studi', 'pelajaran', 'nama pelajaran'
  ],
  faseKelas: [
    'fase', 'fase kelas', 'fase / kelas', 'fase/kelas', 'tingkat fase', 
    'fase_kelas', 'fase pembelajaran'
  ],
  kelasTarget: [
    'kelas', 'rombel', 'tingkat kelas', 'target kelas', 'kelas target', 
    'kelas / rombel', 'grade', 'class'
  ],
  semester: [
    'semester', 'smt', 'semester (ganjil/genap)', 'semester ganjil/genap'
  ],
  elemen: [
    'elemen', 'elemen pembelajaran', 'elemen capaian', 'lingkup elemen', 'elemen materi',
    'elemen / capaian', 'elemen kurikulum', 'domain/elemen', 'domain'
  ],
  capaianPembelajaran: [
    'capaian pembelajaran', 'cp', 'capaian_pembelajaran', 'capaian', 'kompetensi capaian',
    'deskripsi cp', 'capaian pembelajaran (cp)', 'capaian pembelajaran / cp', 'capaian pembelajaran cp'
  ],
  tujuanPembelajaran: [
    'tujuan pembelajaran', 'tp', 'tujuan_pembelajaran', 'tujuan', 
    'learning objective', 'deskripsi tp', 'kode & tujuan pembelajaran',
    'kompetensi dasar / tujuan', 'kd / tp', 'tujuan pembelajaran / tp'
  ],
  materi: [
    'materi', 'materi pembelajaran', 'materi pokok', 'topik', 
    'pokok bahasan', 'ruang lingkup materi', 'sub materi', 'judul materi', 'tema / materi', 'materi pokok / bahasan'
  ],
  alokasiWaktu: [
    'alokasi waktu', 'alokasi', 'jp', 'alokasi jp', 'jam pelajaran', 'waktu (jp)', 'durasi'
  ],
  subOpsiSeni: [
    'sub opsi seni', 'opsi seni', 'cabang seni', 'opsi cabang seni', 'bidang seni', 'cabang seni budaya', 'pilihan seni'
  ]
};

const cleanKey = (key: string): string => {
  return key.toLowerCase().trim().replace(/[^a-z0-9]/g, ' ');
};

const matchField = (header: string): string | null => {
  const cleaned = cleanKey(header);
  for (const [standardKey, aliases] of Object.entries(CURRICULUM_FIELD_ALIASES)) {
    for (const alias of aliases) {
      if (cleaned === alias || cleaned.includes(alias)) {
        return standardKey;
      }
    }
  }
  return null;
};

/**
 * Downloads a pre-formatted Excel template for elementary school curriculum (Kurikulum Merdeka)
 */
export const downloadCurriculumTemplate = (): void => {
  const wb = XLSX.utils.book_new();

  const headers = [
    'Mata Pelajaran (Wajib)',
    'Fase / Tingkat',
    'Kelas Target',
    'Semester',
    'Elemen',
    'Capaian Pembelajaran (CP)',
    'Tujuan Pembelajaran / TP (Wajib)',
    'Materi Pokok / Bahasan (Wajib)',
    'Alokasi Waktu (JP)'
  ];

  const sampleRows = [
    [
      'Pendidikan Pancasila',
      'Fase A Kelas 1',
      'Kelas 1',
      'Ganjil',
      'Pancasila',
      'Peserta didik mampu mengenal dan menceritakan simbol dan sila-sila Pancasila dalam lambang negara Garuda Pancasila.',
      'TP 1.1: Peserta didik mampu mengidentifikasi simbol-simbol sila Pancasila pada lambang Garuda Pancasila',
      'Mengenal 5 Simbol Sila Pancasila dan Maknanya',
      '2 JP'
    ],
    [
      'Pendidikan Pancasila',
      'Fase A Kelas 1',
      'Kelas 1',
      'Ganjil',
      'Undang-Undang Dasar NRI 1945',
      'Peserta didik mampu mengidentifikasi dan mematuhi aturan di keluarga dan sekolah.',
      'TP 1.2: Peserta didik mampu menerapkan aturan dan tata tertib yang berlaku di rumah dan di sekolah',
      'Tata Tertib di Rumah dan Sekolah serta Sikap Disiplin',
      '2 JP'
    ],
    [
      'Bahasa Indonesia',
      'Fase A Kelas 1',
      'Kelas 1',
      'Ganjil',
      'Menyimak',
      'Peserta didik mampu bersikap menjadi pendengar yang penuh perhatian dan memahami pesan lisan serta informasi dari media audio.',
      'TP 1.1: Peserta didik mampu mengenal bunyi huruf dan merangkai suku kata "ba-be-bi-bo-bu"',
      'Mengenal Huruf B dan Membaca Suku Kata "Ba, Be, Bi, Bo, Bu"',
      '2 JP'
    ],
    [
      'Bahasa Indonesia',
      'Fase A Kelas 1',
      'Kelas 1',
      'Ganjil',
      'Membaca dan Memirsa',
      'Peserta didik mampu bersikap menjadi pembaca dan pemirsa yang menunjukkan minat terhadap teks yang dibaca atau dipirsa.',
      'TP 1.2: Peserta didik mampu menyimak dan menceritakan kembali isi cerita bergambar dengan bahasa sendiri',
      'Menyimak Cerita Bergambar "Duk! Duk! Bunyi Apa Itu?"',
      '3 JP'
    ],
    [
      'Matematika',
      'Fase A Kelas 1',
      'Kelas 1',
      'Ganjil',
      'Bilangan',
      'Peserta didik menunjukkan pemahaman dan intuisi bilangan (number sense) pada bilangan cacah sampai 100.',
      'TP 1.1: Peserta didik mampu membilang, membaca, dan menulis bilangan cacah sampai dengan 20',
      'Mengenal dan Membilang Bilangan 1 sampai 20',
      '2 JP'
    ],
    [
      'Matematika',
      'Fase A Kelas 1',
      'Kelas 1',
      'Ganjil',
      'Bilangan',
      'Peserta didik mampu membaca, menulis, membandingkan, dan mengurutkan bilangan cacah sampai 100.',
      'TP 1.1: Peserta didik mampu membilang, membaca, dan menulis bilangan cacah sampai dengan 20',
      'Membandingkan dan Mengurutkan Bilangan 1 sampai 20',
      '2 JP'
    ],
    [
      'Matematika',
      'Fase A Kelas 1',
      'Kelas 1',
      'Ganjil',
      'Bilangan',
      'Peserta didik mampu melakukan operasi penjumlahan dan pengurangan bilangan cacah sampai 20.',
      'TP 1.2: Peserta didik mampu melakukan operasi penjumlahan dan pengurangan bilangan cacah sampai dengan 20',
      'Penjumlahan Bilangan dengan Bantuan Benda Konkret',
      '4 JP'
    ],
    [
      'Ilmu Pengetahuan Alam dan Sosial',
      'Fase B Kelas 4',
      'Kelas 4',
      'Ganjil',
      'Pemahaman IPAS (Sains & Sosial)',
      'Peserta didik menganalisis hubungan antara bentuk serta fungsi bagian tubuh pada manusia dan tumbuhan.',
      'TP 4.1: Peserta didik mampu mengidentifikasi bagian-bagian tumbuhan dan fungsinya dalam fotosintesis',
      'Bagian Tubuh Tumbuhan: Akar, Batang, Daun, Bunga, dan Buah',
      '4 JP'
    ],
    [
      'Ilmu Pengetahuan Alam dan Sosial',
      'Fase B Kelas 4',
      'Kelas 4',
      'Ganjil',
      'Pemahaman IPAS (Sains & Sosial)',
      'Peserta didik mengidentifikasi proses fotosintesis dan mengaitkannya dengan pentingnya menjaga tumbuhan.',
      'TP 4.1: Peserta didik mampu mengidentifikasi bagian-bagian tumbuhan dan fungsinya dalam fotosintesis',
      'Proses Fotosintesis pada Tumbuhan Hijau dan Manfaatnya',
      '4 JP'
    ],
    [
      'Pendidikan Jasmani Olahraga dan Kesehatan',
      'Fase A Kelas 1',
      'Kelas 1',
      'Ganjil',
      'Terampil Bergerak',
      'Peserta didik mempraktikkan keterampilan gerak dasar lokomotor, non-lokomotor, dan manipulatif.',
      'TP 1.1: Peserta didik mampu mempraktikkan pola gerak dasar lokomotor (jalan, lari, lompat)',
      'Pola Gerak Dasar Berjalan dan Berlari Lurus Berbelok',
      '3 JP'
    ],
    [
      'Seni Budaya',
      'Fase A',
      'Kelas 1',
      'Ganjil',
      'Mengalami (Experiencing)',
      'Peserta didik mengamati, merekam, dan menuangkan pengalaman visual melalui eksplorasi garis, bentuk, dan warna.',
      'TP 1.1: Peserta didik mampu mengenal aneka macam garis, bentuk, dan warna primer pada karya seni rupa',
      'Eksplorasi Garis Lurus, Lengkung, dan Warna Primer',
      '2 JP'
    ],
    [
      'Bahasa Daerah',
      'Fase A',
      'Kelas 1',
      'Ganjil',
      'Menyimak (Nyemak)',
      'Peserta didik mampu memahami dan merespons instruksi lisan serta sapaan santun dalam bahasa daerah.',
      'TP 1.1: Peserta didik mampu mengenal bunyi bahasa, kosa kata dasar sapaan santun, dan nama anggota tubuh dalam bahasa daerah',
      'Sapaan Santun (Unggah-Ungguh / Tatakrama) dan Nama Anggota Tubuh',
      '2 JP'
    ],
    [
      'Bahasa Inggris',
      'Fase A',
      'Kelas 1',
      'Ganjil',
      'Menyimak - Berbicara',
      'Peserta didik menggunakan bahasa Inggris sederhana untuk berinteraksi dalam situasi sosial dan konteks kelas.',
      'TP 1.1: Peserta didik mampu mengucapkan salam, perkenalan diri, dan merespon instruksi sederhana',
      'Greetings and Introductions (Hello, Good Morning)',
      '2 JP'
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);

  // Styling column widths
  ws['!cols'] = [
    { wch: 30 }, // Mata Pelajaran
    { wch: 15 }, // Fase
    { wch: 15 }, // Kelas
    { wch: 12 }, // Semester
    { wch: 24 }, // Elemen
    { wch: 45 }, // Capaian Pembelajaran (CP)
    { wch: 45 }, // Tujuan Pembelajaran (TP)
    { wch: 40 }, // Materi
    { wch: 18 }  // Alokasi Waktu
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Kurikulum & TP SD');

  // Petunjuk sheet
  const instructionHeaders = ['Panduan Format Import Kurikulum SD Merdeka'];
  const instructionRows = [
    ['1. Kolom Mata Pelajaran, Tujuan Pembelajaran (TP), dan Materi Pokok adalah kolom utama yang wajib diisi.'],
    ['2. Kolom "Elemen" dan "Capaian Pembelajaran (CP)" disediakan untuk melengkapi master Bank Data Kurikulum.'],
    ['3. Pada sistem Jurnal Mengajar:'],
    ['   - Kolom Elemen & CP akan tampil di menu Bank Data Kurikulum untuk acuan pembelajaran.'],
    ['   - Saat guru menulis jurnal mengajar baru, pilihan Tujuan Pembelajaran dan Materi otomatis tersinkronisasi.'],
    ['4. Format file yang didukung adalah .xlsx dan .xls.'],
    ['5. Nama kolom tidak harus sama persis, sistem dilengkapi pengenal kolom cerdas (fuzzy matching).']
  ];
  const wsGuide = XLSX.utils.aoa_to_sheet([instructionHeaders, ...instructionRows]);
  wsGuide['!cols'] = [{ wch: 95 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Petunjuk Pengisian');

  XLSX.writeFile(wb, 'Format_Import_Kurikulum_SD_Merdeka.xlsx');
};

/**
 * Parses uploaded Excel file into CurriculumItem records with validation
 */
export const parseCurriculumFromExcel = async (file: File): Promise<{
  rows: ParsedCurriculumRow[];
  totalValid: number;
  totalInvalid: number;
  uniqueSubjects: string[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Grab first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        if (!sheet) {
          throw new Error('Lembar kerja (worksheet) Excel kosong atau tidak terbaca.');
        }

        // Find header row dynamically (handles files with or without title banners)
        const rawAoa = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
        let headerRowIndex = 0;
        for (let r = 0; r < Math.min(rawAoa.length, 15); r++) {
          const row = rawAoa[r];
          if (Array.isArray(row)) {
            const hasMatch = row.some(cell => {
              const matched = matchField(String(cell || ''));
              return matched === 'mataPelajaran' || matched === 'tujuanPembelajaran' || matched === 'materi';
            });
            if (hasMatch) {
              headerRowIndex = r;
              break;
            }
          }
        }

        // Convert sheet to json array of objects starting from detected header row
        const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
          range: headerRowIndex,
          defval: ''
        });

        if (rawJson.length === 0) {
          throw new Error('Tidak ditemukan data baris dalam file Excel.');
        }

        // Map headers to standard fields
        const firstRow = rawJson[0];
        const headerMapping: Record<string, string> = {};

        Object.keys(firstRow).forEach((rawHeader) => {
          const matched = matchField(rawHeader);
          if (matched) {
            headerMapping[rawHeader] = matched;
          }
        });

        const parsedRows: ParsedCurriculumRow[] = [];
        const subjectsSet = new Set<string>();
        let validCount = 0;
        let invalidCount = 0;

        rawJson.forEach((row, index) => {
          // Normalize row keys based on mapping
          const normalized: Record<string, any> = {};
          Object.entries(row).forEach(([rawKey, val]) => {
            const mappedKey = headerMapping[rawKey] || matchField(rawKey) || rawKey;
            normalized[mappedKey] = typeof val === 'string' ? val.trim() : val;
          });

          const errors: string[] = [];

          // Subject validation
          const rawMapel = String(normalized.mataPelajaran || normalized.mapel || '').trim();
          const mapel = normalizeSubjectName(rawMapel) || rawMapel;
          let subOpsiSeni = String(normalized.subOpsiSeni || '').trim();
          if (mapel === 'Seni Budaya' && !subOpsiSeni) {
            const combined = `${rawMapel} ${normalized.elemen || ''} ${normalized.tujuanPembelajaran || ''} ${normalized.materi || ''}`.toLowerCase();
            if (combined.includes('rupa')) subOpsiSeni = 'Seni Rupa';
            else if (combined.includes('musik')) subOpsiSeni = 'Seni Musik';
            else if (combined.includes('tari')) subOpsiSeni = 'Seni Tari';
            else if (combined.includes('teater')) subOpsiSeni = 'Seni Teater';
          }

          if (!mapel) {
            errors.push('Mata Pelajaran wajib diisi');
          } else {
            subjectsSet.add(mapel);
          }

          // TP validation
          const tp = String(normalized.tujuanPembelajaran || normalized.tp || normalized.tujuan || '').trim();
          if (!tp) {
            errors.push('Tujuan Pembelajaran (TP) wajib diisi');
          }

          // Materi validation
          const materi = String(normalized.materi || normalized.materiPokok || normalized.topik || '').trim();
          if (!materi) {
            errors.push('Materi Pokok / Bahasan wajib diisi');
          }

          const rawFase = String(normalized.faseKelas || normalized.fase || '').trim();
          const kelas = String(normalized.kelasTarget || normalized.kelas || '').trim();
          
          // Format fase to per-class if needed
          let fase = rawFase;
          if (rawFase && !rawFase.toLowerCase().includes('kelas') && kelas) {
            fase = `${rawFase} ${kelas}`;
          }

          const smtRaw = String(normalized.semester || '').trim().toLowerCase();
          const semester: 'Ganjil' | 'Genap' | 'Semua' = smtRaw.includes('genap') 
            ? 'Genap' 
            : smtRaw.includes('ganjil') 
            ? 'Ganjil' 
            : 'Semua';

          const elemen = String(normalized.elemen || normalized.elemenPembelajaran || normalized.domain || '').trim();
          const cp = String(normalized.capaianPembelajaran || normalized.cp || normalized.capaian || '').trim();

          const alokasi = String(normalized.alokasiWaktu || normalized.jp || '').trim();

          const isValid = errors.length === 0;
          if (isValid) {
            validCount++;
          } else {
            invalidCount++;
          }

          const curriculumItem: CurriculumItem = {
            id: `cur-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
            mataPelajaran: mapel || 'Mata Pelajaran',
            subOpsiSeni: subOpsiSeni || undefined,
            faseKelas: fase || undefined,
            kelasTarget: kelas || undefined,
            semester,
            elemen: elemen || undefined,
            capaianPembelajaran: cp || undefined,
            tujuanPembelajaran: tp || '-',
            materi: materi || '-',
            alokasiWaktu: alokasi || undefined
          };

          parsedRows.push({
            isValid,
            errors,
            data: curriculumItem,
            originalRow: row
          });
        });

        resolve({
          rows: parsedRows,
          totalValid: validCount,
          totalInvalid: invalidCount,
          uniqueSubjects: Array.from(subjectsSet)
        });
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca berkas Excel. Pastikan file tidak rusak.'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Exports current active curriculum database to Excel
 */
/**
 * Exports complete curriculum database to Excel (.xlsx)
 * Ensures 100% of all data items from the curriculum bank are exported cleanly
 */
export const exportCurriculumToExcel = (
  curriculumList: CurriculumItem[],
  school: SchoolProfile,
  options?: {
    isFiltered?: boolean;
    filterLabel?: string;
  }
): void => {
  const wb = XLSX.utils.book_new();

  // Helper to extract grade number for clean pedagogical sorting
  const getGradeRank = (fase: string = '', kelas: string = ''): number => {
    const combined = `${fase} ${kelas}`.toLowerCase();
    if (combined.includes('kelas 1') || combined.includes('tingkat 1')) return 1;
    if (combined.includes('kelas 2') || combined.includes('tingkat 2')) return 2;
    if (combined.includes('kelas 3') || combined.includes('tingkat 3')) return 3;
    if (combined.includes('kelas 4') || combined.includes('tingkat 4')) return 4;
    if (combined.includes('kelas 5') || combined.includes('tingkat 5')) return 5;
    if (combined.includes('kelas 6') || combined.includes('tingkat 6')) return 6;
    if (combined.includes('fase a')) return 1.5;
    if (combined.includes('fase b')) return 3.5;
    if (combined.includes('fase c')) return 5.5;
    return 9;
  };

  // Sort list logically: by Grade/Fase rank -> Subject -> Element -> TP
  const sortedList = [...curriculumList].sort((a, b) => {
    const rankA = getGradeRank(a.faseKelas, a.kelasTarget);
    const rankB = getGradeRank(b.faseKelas, b.kelasTarget);
    if (rankA !== rankB) return rankA - rankB;

    const mapelA = (a.mataPelajaran || '').localeCompare(b.mataPelajaran || '');
    if (mapelA !== 0) return mapelA;

    return (a.tujuanPembelajaran || '').localeCompare(b.tujuanPembelajaran || '');
  });

  const titleHeader = options?.isFiltered
    ? `DAFTAR DATA KURIKULUM & TUJUAN PEMBELAJARAN (TP) — FILTER: ${options.filterLabel || 'KUSTOM'}`
    : `DAFTAR SELURUH DATA BANK KURIKULUM & TUJUAN PEMBELAJARAN (TP) KELAS 1-6`;

  const titleRows = [
    [titleHeader],
    [`STANDAR KURIKULUM MERDEKA — KEPUTUSAN KEPALA BSKAP NOMOR 046/H/KR/2025`],
    [`${school.namaSekolah || 'SEKOLAH DASAR'} — TAHUN AJARAN ${school.tahunAjaran || ''}`],
    [`NPSN: ${school.npsn || '-'} | Kurikulum: ${school.kurikulum || 'Kurikulum Merdeka'} | Total: ${sortedList.length} Butir TP | Tanggal Unduh: ${new Date().toLocaleDateString('id-ID')}`],
    []
  ];

  const headers = [
    'No',
    'Mata Pelajaran',
    'Cabang / Opsi Seni',
    'Fase / Tingkat',
    'Kelas Target',
    'Semester',
    'Elemen',
    'Capaian Pembelajaran (CP)',
    'Tujuan Pembelajaran (TP)',
    'Materi Pokok / Bahasan',
    'Alokasi Waktu'
  ];

  const dataRows = sortedList.map((item, idx) => {
    const branchSeni = item.subOpsiSeni || (item.mataPelajaran === 'Seni Budaya' ? detectSeniBudayaBranch(item.tujuanPembelajaran, item.materi) : undefined);
    return [
      idx + 1,
      item.mataPelajaran,
      branchSeni || '-',
      item.faseKelas || '-',
      item.kelasTarget || 'Semua Kelas',
      item.semester || 'Semua',
      item.elemen || '-',
      item.capaianPembelajaran || '-',
      item.tujuanPembelajaran,
      item.materi,
      item.alokasiWaktu || '-'
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, headers, ...dataRows]);

  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 28 }, // Mata Pelajaran
    { wch: 18 }, // Cabang Seni
    { wch: 18 }, // Fase / Tingkat
    { wch: 15 }, // Kelas Target
    { wch: 12 }, // Semester
    { wch: 28 }, // Elemen
    { wch: 55 }, // Capaian Pembelajaran (CP)
    { wch: 55 }, // Tujuan Pembelajaran (TP)
    { wch: 45 }, // Materi
    { wch: 15 }  // Alokasi
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Kurikulum (TP)');

  // Sheet 2: Ringkasan Rekapitulasi Mapel & Fase
  const summaryMap = new Map<string, { mapel: string; fase: string; count: number }>();
  sortedList.forEach(item => {
    const key = `${item.mataPelajaran}__${item.faseKelas || 'Fase A'}`;
    const existing = summaryMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      summaryMap.set(key, {
        mapel: item.mataPelajaran,
        fase: item.faseKelas || 'Fase A',
        count: 1
      });
    }
  });

  const summaryHeaders = ['No', 'Mata Pelajaran', 'Fase / Tingkat', 'Jumlah TP'];
  const summaryRows = Array.from(summaryMap.values()).map((s, idx) => [
    idx + 1,
    s.mapel,
    s.fase,
    s.count
  ]);
  const wsSummary = XLSX.utils.aoa_to_sheet([
    ['RINGKASAN REKAPITULASI BANK DATA KURIKULUM & TP'],
    [`Total Seluruh TP: ${sortedList.length} butir | Sekolah: ${school.namaSekolah || '-'}`],
    [],
    summaryHeaders,
    ...summaryRows
  ]);
  wsSummary['!cols'] = [
    { wch: 6 },
    { wch: 30 },
    { wch: 22 },
    { wch: 16 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Mapel');

  const cleanSchool = (school.namaSekolah || 'SD').replace(/[^a-zA-Z0-9]/g, '_');
  const filePrefix = options?.isFiltered ? 'Kurikulum_TP_Filter' : 'Kurikulum_TP_Lengkap';
  XLSX.writeFile(wb, `${filePrefix}_${cleanSchool}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

/**
 * Exports Teaching Journals to Excel in official Indonesian School Layout
 */
export const exportTeachingJournalsToExcel = (
  journals: DailyTeachingJournal[],
  school: SchoolProfile,
  filterInfo?: {
    dateRange?: string;
    kelas?: string;
    mapel?: string;
    guru?: string;
  }
): void => {
  const wb = XLSX.utils.book_new();

  const titleRows = [
    [`JURNAL AGENDA HARIAN MENGAJAR GURU (KBM)`],
    [`${school.namaSekolah} — TAHUN AJARAN ${school.tahunAjaran}`],
    [`NPSN: ${school.npsn} | Kurikulum: ${school.kurikulum} | Semester: ${school.semester}`],
    [
      `Filter: ${filterInfo?.kelas ? `Kelas ${filterInfo.kelas}` : 'Semua Kelas'} | ${
        filterInfo?.mapel ? `Mapel: ${filterInfo.mapel}` : 'Semua Mapel'
      } | ${filterInfo?.guru ? `Guru: ${filterInfo.guru}` : 'Semua Guru'} | Periode: ${
        filterInfo?.dateRange || 'Semua Tanggal'
      }`
    ],
    []
  ];

  const headers = [
    'No',
    'Hari, Tanggal',
    'Jam Ke',
    'Kelas',
    'Mata Pelajaran',
    'Tujuan Pembelajaran (TP)',
    'Materi Pokok / Bahasan',
    'Refleksi Pembelajaran',
    'Keterangan / Catatan',
    'Guru Pengajar',
    'Status KBM'
  ];

  const dataRows = journals.map((j, idx) => [
    idx + 1,
    `${j.hari}, ${j.tanggal}`,
    j.jamPelajaran || '-',
    j.kelas,
    j.mataPelajaran,
    j.tujuanPembelajaran,
    j.materi,
    j.refleksi || '-',
    j.keterangan || '-',
    j.guruPengajar || '-',
    j.statusKBM || 'Terlaksana'
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, headers, ...dataRows]);

  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 22 }, // Hari, Tanggal
    { wch: 14 }, // Jam Ke
    { wch: 8 },  // Kelas
    { wch: 24 }, // Mata Pelajaran
    { wch: 40 }, // TP
    { wch: 35 }, // Materi
    { wch: 40 }, // Refleksi
    { wch: 30 }, // Keterangan
    { wch: 25 }, // Guru
    { wch: 14 }  // Status
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Jurnal Mengajar');
  XLSX.writeFile(wb, `Jurnal_Mengajar_Harian_${school.npsn || 'SD'}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
