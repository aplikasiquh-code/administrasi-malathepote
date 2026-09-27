const fs = require('fs');
const items = JSON.parse(fs.readFileSync('/tmp/updated_curriculumKelas2.json', 'utf-8'));

let out = `import { CurriculumItem } from '../types';

/**
 * BANK KURIKULUM RESMI FASE A - KELAS 2 SD (KURIKULUM MERDEKA)
 * 
 * Capaian Pembelajaran (CP) dan Elemen disusun 100% PERSIS sesuai:
 * 1. Keputusan Kepala BSKAP Kemendikdasmen Nomor 046/H/KR/2025
 *    tentang Capaian Pembelajaran pada PAUD, Jenjang Dikdas, dan Jenjang Dikmen.
 * 2. Mencakup seluruh mata pelajaran Fase A:
 *    - Pendidikan Agama Islam dan Budi Pekerti (Halaman 27-28)
 *    - Pendidikan Pancasila (Halaman 84-85)
 *    - Bahasa Indonesia (Halaman 94-96)
 *    - Matematika (Halaman 112-113)
 *    - Pendidikan Jasmani, Olahraga, dan Kesehatan (Halaman 310-311)
 *    - Seni Budaya (4 Cabang): Seni Rupa (Hal. 246-247), Seni Musik (Hal. 233-234), Seni Tari (Hal. 256-257), Seni Teater (Hal. 265-266)
 */

export const curriculumKelas2: CurriculumItem[] = [\n`;

for (let i = 0; i < items.length; i++) {
  const item = items[i];
  out += '  {\n';
  out += `    id: '${item.id}',\n`;
  out += `    mataPelajaran: '${item.mataPelajaran}',\n`;
  if (item.subOpsiSeni) {
    out += `    subOpsiSeni: '${item.subOpsiSeni}',\n`;
  }
  out += `    faseKelas: '${item.faseKelas}',\n`;
  out += `    kelasTarget: '${item.kelasTarget}',\n`;
  out += `    semester: '${item.semester}',\n`;
  out += `    elemen: '${item.elemen}',\n`;
  out += `    capaianPembelajaran: '${item.capaianPembelajaran.replace(/'/g, "\\'")}',\n`;
  out += `    tujuanPembelajaran: '${item.tujuanPembelajaran.replace(/'/g, "\\'")}',\n`;
  out += `    materi: '${item.materi.replace(/'/g, "\\'")}',\n`;
  out += `    alokasiWaktu: '${item.alokasiWaktu}'\n`;
  out += '  }' + (i < items.length - 1 ? ',\n' : '\n');
}

out += '];\n';

fs.writeFileSync('./src/data/curriculumKelas2.ts', out, 'utf-8');
console.log('Successfully wrote src/data/curriculumKelas2.ts with', items.length, 'items');
