import { CurriculumItem } from '../types';
import { curriculumKelas1 } from './curriculumKelas1';
import { curriculumKelas2 } from './curriculumKelas2';
import { curriculumKelas3 } from './curriculumKelas3';
import { curriculumKelas4 } from './curriculumKelas4';
import { curriculumFaseC } from './curriculumFaseC';

export { curriculumKelas1 } from './curriculumKelas1';
export { curriculumKelas2 } from './curriculumKelas2';
export { curriculumKelas3 } from './curriculumKelas3';
export { curriculumKelas4 } from './curriculumKelas4';
export { curriculumFaseC } from './curriculumFaseC';

/**
 * BANK KURIKULUM RESMI SEKOLAH DASAR (KURIKULUM MERDEKA)
 * 
 * Berdasarkan Regulasi Resmi Terbaru:
 * 1. BSKAP Kemendikdasmen Nomor 046/H/KR/2025 tentang Capaian Pembelajaran
 *    pada PAUD, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah (Kurikulum Merdeka)
 * 2. BKPDM Nomor 020 Tahun 2026 (Pendidikan Agama Islam dan Budi Pekerti)
 * 3. 4 Opsi Cabang Seni Budaya: Seni Rupa, Seni Musik, Seni Tari, Seni Teater
 * 4. Mendukung Penuh:
 *    - Fase A: Kelas 1 & Kelas 2
 *    - Fase B: Kelas 3 & Kelas 4 (BSKAP 046/2025)
 *    - Fase C: Kelas 5 & Kelas 6 (BSKAP 046/2025)
 */

export const legacyCurriculumFaseB: CurriculumItem[] = curriculumKelas4;

export const curriculumBaseKelas1 = curriculumKelas1;

export const initialCurriculum: CurriculumItem[] = [
  ...curriculumKelas1,
  ...curriculumKelas2,
  ...curriculumKelas3,
  ...curriculumKelas4,
  ...curriculumFaseC
];
