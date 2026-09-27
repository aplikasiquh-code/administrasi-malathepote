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
  ActiveTab, 
  StudentAssessment,
  ExtracurricularAssessment,
  CocurricularProject,
  ClassRoomItem,
  StudentReportConfig,
  normalizeSubjectName
} from '../types';
import { 
  initialSchoolProfile, 
  initialTeachers, 
  initialStudents, 
  initialAgendas, 
  initialAnnouncements, 
  initialAttendance, 
  initialCurriculum, 
  initialTeachingJournals, 
  initialJpScheduleConfig, 
  initialAssessments,
  initialExtracurriculars,
  initialCocurricularProjects,
  initialClasses
} from '../data/initialData';

const VALID_TABS: ActiveTab[] = [
  'dashboard',
  'data-sekolah',
  'data-guru',
  'data-siswa',
  'presensi',
  'jurnal-mengajar',
  'penilaian',
  'rapor',
  'ekstrakurikuler',
  'kokurikuler',
  'laporan'
];

const STORAGE_KEYS = {
  ACTIVE_TAB: 'sd_admin_active_tab',
  JOURNAL_SUBTAB: 'sd_admin_journal_subtab',
  ASSESSMENT_SUBTAB: 'sd_admin_assessment_subtab',
  SCHOOL: 'sd_admin_school_profile',
  TEACHERS: 'sd_admin_teachers',
  STUDENTS: 'sd_admin_students',
  CLASSES: 'sd_admin_classes',
  AGENDAS: 'sd_admin_agendas',
  ANNOUNCEMENTS: 'sd_admin_announcements',
  ATTENDANCE: 'sd_admin_attendance',
  CURRICULUM: 'sd_admin_curriculum',
  TEACHING_JOURNALS: 'sd_admin_teaching_journals',
  JP_SCHEDULE: 'sd_admin_jp_schedule',
  ASSESSMENTS: 'sd_admin_assessments',
  EXTRACURRICULARS: 'sd_admin_extracurriculars',
  COCURRICULARS: 'sd_admin_cocurriculars',
  STUDENT_REPORTS: 'sd_admin_student_reports'
};

export const getStoredActiveTab = (): ActiveTab => {
  try {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashTab = window.location.hash.replace(/^#/, '') as ActiveTab;
      if (VALID_TABS.includes(hashTab)) {
        return hashTab;
      }
    }
  } catch (e) {
    console.error('Error loading active tab from storage', e);
  }
  return 'dashboard';
};

export const saveStoredActiveTab = (tab: ActiveTab): void => {
  try {
    if (VALID_TABS.includes(tab)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, tab);
      if (typeof window !== 'undefined') {
        const targetHash = `#${tab}`;
        if (window.location.hash !== targetHash) {
          window.history.replaceState(null, '', targetHash);
        }
      }
    }
  } catch (e) {
    console.error('Error saving active tab to storage', e);
  }
};

export const getStoredJournalSubTab = (): 'jurnal' | 'kurikulum' => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JOURNAL_SUBTAB);
    if (raw === 'jurnal' || raw === 'kurikulum') {
      return raw;
    }
  } catch (e) {
    console.error('Error loading journal subtab', e);
  }
  return 'jurnal';
};

export const saveStoredJournalSubTab = (subTab: 'jurnal' | 'kurikulum'): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.JOURNAL_SUBTAB, subTab);
  } catch (e) {
    console.error('Error saving journal subtab', e);
  }
};

export const getStoredSchoolProfile = (): SchoolProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHOOL);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading school profile from storage', e);
  }
  return initialSchoolProfile;
};

export const saveStoredSchoolProfile = (profile: SchoolProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving school profile to storage', e);
  }
};

export const getStoredTeachers = (): Teacher[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading teachers from storage', e);
  }
  return initialTeachers;
};

export const saveStoredTeachers = (teachers: Teacher[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  } catch (e) {
    console.error('Error saving teachers to storage', e);
  }
};

export const getStoredStudents = (): Student[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const seen = new Set<string>();
        return parsed.filter((s: Student) => {
          if (!s || !s.id || seen.has(s.id)) return false;
          seen.add(s.id);
          return true;
        });
      }
    }
  } catch (e) {
    console.error('Error loading students from storage', e);
  }
  return initialStudents;
};

export const saveStoredStudents = (students: Student[]): void => {
  try {
    const seen = new Set<string>();
    const unique = students.filter(s => {
      if (!s || !s.id || seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(unique));
  } catch (e) {
    console.error('Error saving students to storage', e);
  }
};

export const getStoredClasses = (): ClassRoomItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading classes from storage', e);
  }
  return initialClasses;
};

export const saveStoredClasses = (classes: ClassRoomItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  } catch (e) {
    console.error('Error saving classes to storage', e);
  }
};

export const getStoredAgendas = (): SchoolAgenda[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AGENDAS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading agendas', e);
  }
  return initialAgendas;
};

export const saveStoredAgendas = (agendas: SchoolAgenda[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.AGENDAS, JSON.stringify(agendas));
  } catch (e) {
    console.error('Error saving agendas', e);
  }
};

export const getStoredAnnouncements = (): SchoolAnnouncement[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading announcements', e);
  }
  return initialAnnouncements;
};

export const saveStoredAnnouncements = (announcements: SchoolAnnouncement[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  } catch (e) {
    console.error('Error saving announcements', e);
  }
};

export const getStoredAttendance = (): DailyClassAttendance[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading attendance from storage', e);
  }
  return initialAttendance;
};

export const saveStoredAttendance = (attendance: DailyClassAttendance[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  } catch (e) {
    console.error('Error saving attendance to storage', e);
  }
};

export const LEGACY_DUMMY_IDS = new Set([
  'cur-pp-2',
  'cur-bi-2',
  'cur-bi-3',
  'cur-mat-2',
  'cur-mat-3',
  'cur-pjok-2',
  'cur-seni-2',
  'cur-eng-2',
  'cur-daerah-2',
  'cur-daerah-3',
  'cur-ipas-1',
  'cur-ipas-2',
  'cur-ipas-3',
  'cur-ipas-4'
]);

export const getStoredCurriculum = (): CurriculumItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRICULUM);
    if (raw) {
      const parsed: CurriculumItem[] = JSON.parse(raw);
      // Check if stored curriculum has been updated with Seni Budaya sub-branches, complete Kelas 2 (Fase A), Fase C (Kelas 5 & 6), and exact BSKAP 046/2025 Fase A
      const hasSeniSubBranches = parsed.some(item => item.mataPelajaran === 'Seni Budaya' && item.subOpsiSeni);
      const hasCompleteKelas2 = parsed.some(item => item.id === 'cur-mat-2-12') && parsed.some(item => item.id === 'cur-seni-2-rupa-5');
      const hasFaseC = parsed.some(item => item.faseKelas?.includes('Fase C') && item.id.startsWith('cur-pai-5'));
      const hasBskap046FaseAUpdated = parsed.some(item => item.id === 'cur-pp-1-1' && item.capaianPembelajaran.includes('bendera negara')) &&
                                parsed.some(item => item.id === 'cur-bi-1-1' && item.capaianPembelajaran.includes('teks nonsastra berbentuk teks aural')) &&
                                parsed.some(item => item.id === 'cur-mat-1-1' && item.capaianPembelajaran.includes('intuisi bilangan (number sense)')) &&
                                parsed.some(item => item.id === 'cur-seni-1-tari-2' && item.capaianPembelajaran.includes('Mengidentifikasi unsur utama tari')) &&
                                parsed.some(item => item.id === 'cur-pjok-1-1' && item.mataPelajaran === 'Pendidikan Jasmani, Olahraga, dan Kesehatan') &&
                                !parsed.some(item => item.id === 'cur-eng-1-1');
      const hasAllKelas2CPAndElemen = parsed.filter(item => item.faseKelas === 'Fase A Kelas 2').length >= 66 &&
                                      parsed.filter(item => item.faseKelas === 'Fase A Kelas 2').every(item => 
                                        item.capaianPembelajaran && 
                                        item.capaianPembelajaran.trim().length > 10 && 
                                        item.elemen && 
                                        item.elemen.trim().length > 0
                                      ) &&
                                       parsed.some(item => item.id === 'cur-pjok-2-6' && item.elemen === 'Bergaya Hidup Aktif') &&
                                       parsed.some(item => item.faseKelas === 'Fase A Kelas 2' && item.elemen?.includes('Merefleksikan'));

      const hasCompleteKelas3 = parsed.filter(item => item.faseKelas === 'Fase B Kelas 3').length >= 100 &&
                                parsed.some(item => item.id === 'cur-mat-3-1' && item.capaianPembelajaran.includes('10.000'));
      const hasCompleteKelas4 = parsed.filter(item => item.faseKelas === 'Fase B Kelas 4').length >= 100 &&
                                parsed.some(item => item.id === 'cur-mat-4-1' && item.capaianPembelajaran.includes('10.000')) &&
                                !parsed.some(item => item.id === 'cur-pp-2');

      const hasNoLegacyDummy = !parsed.some(item => 
        LEGACY_DUMMY_IDS.has(item.id) || 
        (typeof item.capaianPembelajaran === 'string' && item.capaianPembelajaran.includes('Peserta didik mempraktikkan variasi dan kombinasi'))
      );

      const hasExactBskap046FaseBAndC = parsed.some(item => item.id === 'cur-daerah-4-1' && item.capaianPembelajaran.includes('ragam santun bahasa daerah')) &&
                                        !parsed.some(item => item.id === 'cur-bi-ing-3-1' && item.capaianPembelajaran.includes('(understand and respond')) &&
                                        parsed.some(item => item.id === 'cur-pp-5-1' && item.capaianPembelajaran.includes('kronologi sejarah kelahiran Pancasila')) &&
                                        hasNoLegacyDummy;

      const hasExactBskap046FaseC = parsed.some(item => item.id === 'cur-pjok-5-1' && item.elemen === 'Terampil Bergerak') &&
                                    parsed.some(item => item.id === 'cur-mat-5-1' && item.capaianPembelajaran.includes('1.000.000')) &&
                                    parsed.some(item => item.id === 'cur-ipas-5-1' && item.elemen === 'Pemahaman IPAS') &&
                                    parsed.some(item => item.id === 'cur-ipas-5-12') &&
                                    parsed.some(item => item.id === 'cur-eng-5-10') &&
                                    parsed.some(item => item.id === 'cur-bi-5-12') &&
                                    parsed.some(item => item.id === 'cur-pp-5-12') &&
                                    parsed.some(item => item.id === 'cur-seni-5-rupa-1' && item.capaianPembelajaran.includes('unsur rupa dan prinsip desain')) &&
                                    parsed.some(item => item.id === 'cur-seni-5-rupa-8') &&
                                    parsed.some(item => item.id === 'cur-seni-5-musik-8') &&
                                    parsed.some(item => item.id === 'cur-seni-5-tari-8') &&
                                    parsed.some(item => item.id === 'cur-seni-5-teater-8') &&
                                    parsed.filter(item => item.faseKelas === 'Fase C Kelas 5').length >= 87;

      const hasExactBskap046FaseCKelas6 = parsed.some(item => item.id === 'cur-pjok-6-1' && item.elemen === 'Terampil Bergerak') &&
                                          parsed.some(item => item.id === 'cur-mat-6-1' && item.capaianPembelajaran.includes('1.000.000')) &&
                                          parsed.some(item => item.id === 'cur-ipas-6-1' && item.elemen === 'Pemahaman IPAS') &&
                                          parsed.some(item => item.id === 'cur-ipas-6-12') &&
                                          parsed.some(item => item.id === 'cur-eng-6-10') &&
                                          parsed.some(item => item.id === 'cur-bi-6-12') &&
                                          parsed.some(item => item.id === 'cur-pp-6-12') &&
                                          parsed.some(item => item.id === 'cur-seni-6-rupa-8') &&
                                          parsed.some(item => item.id === 'cur-seni-6-musik-8') &&
                                          parsed.some(item => item.id === 'cur-seni-6-tari-8') &&
                                          parsed.some(item => item.id === 'cur-seni-6-teater-8') &&
                                          parsed.filter(item => item.faseKelas === 'Fase C Kelas 6').length >= 87;

      const hasExpandedSeniRupa = parsed.some(item => item.id === 'cur-seni-2-rupa-8') &&
                                  parsed.some(item => item.id === 'cur-sr-3-8') &&
                                  parsed.some(item => item.id === 'cur-seni-4-rupa-8');

      const hasPesertaDidikMampuInTP = parsed.filter(item => item.id.startsWith('cur-pai-1-')).every(item => item.tujuanPembelajaran?.includes('Peserta didik mampu')) &&
                                       parsed.filter(item => item.id.startsWith('cur-pp-1-')).every(item => item.tujuanPembelajaran?.includes('Peserta didik mampu')) &&
                                       parsed.filter(item => item.id.startsWith('cur-mat-5-')).every(item => item.tujuanPembelajaran?.includes('Peserta didik mampu'));

      if (!hasSeniSubBranches || !hasCompleteKelas2 || !hasFaseC || !hasBskap046FaseAUpdated || !hasAllKelas2CPAndElemen || !hasCompleteKelas3 || !hasCompleteKelas4 || !hasExactBskap046FaseBAndC || !hasExactBskap046FaseC || !hasExactBskap046FaseCKelas6 || !hasExpandedSeniRupa || !hasPesertaDidikMampuInTP) {
        // Upgrade: preserve any custom user-added items while updating seed to complete latest standards
        const userCustomItems = parsed.filter(item => 
          !LEGACY_DUMMY_IDS.has(item.id) &&
          !item.id.startsWith('cur-mat-') && 
          !item.id.startsWith('cur-bi-') && 
          !item.id.startsWith('cur-pp-') && 
          !item.id.startsWith('cur-pai-') && 
          !item.id.startsWith('cur-pjok-') && 
          !item.id.startsWith('cur-seni-') && 
          !item.id.startsWith('cur-sr-') && 
          !item.id.startsWith('cur-sm-') && 
          !item.id.startsWith('cur-st-') && 
          !item.id.startsWith('cur-ste-') && 
          !item.id.startsWith('cur-rupa-') && 
          !item.id.startsWith('cur-musik-') && 
          !item.id.startsWith('cur-tari-') && 
          !item.id.startsWith('cur-teater-') && 
          !item.id.startsWith('cur-daerah-') && 
          !item.id.startsWith('cur-eng-') && 
          !item.id.startsWith('cur-ipas-') &&
          !(typeof item.capaianPembelajaran === 'string' && item.capaianPembelajaran.includes('Peserta didik mempraktikkan variasi dan kombinasi'))
        ).map(item => {
          const mapelNorm = normalizeSubjectName(item.mataPelajaran) || item.mataPelajaran;
          let subOpsi = item.subOpsiSeni;
          if (mapelNorm === 'Seni Budaya' && !subOpsi) {
            const combined = `${item.mataPelajaran} ${item.elemen || ''} ${item.tujuanPembelajaran} ${item.materi}`.toLowerCase();
            if (combined.includes('rupa')) subOpsi = 'Seni Rupa';
            else if (combined.includes('musik')) subOpsi = 'Seni Musik';
            else if (combined.includes('tari')) subOpsi = 'Seni Tari';
            else if (combined.includes('teater')) subOpsi = 'Seni Teater';
          }
          let customTP = item.tujuanPembelajaran;
          if (customTP && !customTP.includes('Peserta didik mampu')) {
            const match = customTP.match(/^(TP\s+[^:]+:\s*)(.*)$/);
            if (match) {
              const prefix = match[1];
              const rest = match[2].trim();
              const firstChar = rest.charAt(0);
              const firstWord = rest.split(/[\s,]+/)[0];
              const lowerFirstChar = (firstWord === 'Allah' || firstWord === 'Al-Quran' || firstWord === 'Scratch' || firstWord === 'AI') ? firstChar : firstChar.toLowerCase();
              customTP = `${prefix}Peserta didik mampu ${lowerFirstChar}${rest.slice(1)}`;
            } else {
              const firstChar = customTP.charAt(0);
              const firstWord = customTP.split(/[\s,]+/)[0];
              const lowerFirstChar = (firstWord === 'Allah' || firstWord === 'Al-Quran' || firstWord === 'Scratch' || firstWord === 'AI') ? firstChar : firstChar.toLowerCase();
              customTP = `Peserta didik mampu ${lowerFirstChar}${customTP.slice(1)}`;
            }
          }
          return {
            ...item,
            mataPelajaran: mapelNorm,
            subOpsiSeni: subOpsi,
            tujuanPembelajaran: customTP
          };
        });
        const upgraded = [...initialCurriculum, ...userCustomItems];
        saveStoredCurriculum(upgraded);
        return upgraded;
      }
      // Ensure all items from initialCurriculum are guaranteed present in the stored dataset with strict unique IDs
      const seenParsedIds = new Set<string>();
      const cleanParsed = parsed.filter(item => {
        if (!item || !item.id || seenParsedIds.has(item.id)) return false;
        if (LEGACY_DUMMY_IDS.has(item.id)) return false;
        if (typeof item.capaianPembelajaran === 'string' && item.capaianPembelajaran.includes('Peserta didik mempraktikkan variasi dan kombinasi')) return false;
        seenParsedIds.add(item.id);
        return true;
      });

      const existingIds = new Set(cleanParsed.map(item => item.id));
      const missingInitial = initialCurriculum.filter(item => !existingIds.has(item.id));
      const initialMap = new Map(initialCurriculum.map(item => [item.id, item]));

      const syncedList = (missingInitial.length > 0 ? [...cleanParsed, ...missingInitial] : cleanParsed).map(item => {
        const initItem = initialMap.get(item.id);
        const mapelNorm = normalizeSubjectName(item.mataPelajaran) || item.mataPelajaran;
        if (initItem) {
          return {
            ...item,
            mataPelajaran: initItem.mataPelajaran || mapelNorm,
            elemen: initItem.elemen || item.elemen,
            capaianPembelajaran: initItem.capaianPembelajaran,
            subOpsiSeni: initItem.subOpsiSeni || item.subOpsiSeni,
            faseKelas: initItem.faseKelas || item.faseKelas,
            kelasTarget: initItem.kelasTarget || item.kelasTarget,
            semester: item.semester || initItem.semester,
            tujuanPembelajaran: initItem.tujuanPembelajaran,
            materi: item.materi || initItem.materi,
            alokasiWaktu: item.alokasiWaktu || initItem.alokasiWaktu
          };
        }
        let customTP = item.tujuanPembelajaran;
        if (customTP && !customTP.includes('Peserta didik mampu')) {
          const match = customTP.match(/^(TP\s+[^:]+:\s*)(.*)$/);
          if (match) {
            const prefix = match[1];
            const rest = match[2].trim();
            const firstChar = rest.charAt(0);
            const firstWord = rest.split(/[\s,]+/)[0];
            const lowerFirstChar = (firstWord === 'Allah' || firstWord === 'Al-Quran' || firstWord === 'Scratch' || firstWord === 'AI') ? firstChar : firstChar.toLowerCase();
            customTP = `${prefix}Peserta didik mampu ${lowerFirstChar}${rest.slice(1)}`;
          } else {
            const firstChar = customTP.charAt(0);
            const firstWord = customTP.split(/[\s,]+/)[0];
            const lowerFirstChar = (firstWord === 'Allah' || firstWord === 'Al-Quran' || firstWord === 'Scratch' || firstWord === 'AI') ? firstChar : firstChar.toLowerCase();
            customTP = `Peserta didik mampu ${lowerFirstChar}${customTP.slice(1)}`;
          }
        }
        // If it's a PJOK item with Terampil Bergerak in Fase B, ensure BSKAP 046/2025 CP
        if (
          mapelNorm.includes('Jasmani') && 
          item.faseKelas?.includes('Fase B') && 
          item.elemen === 'Terampil Bergerak' && 
          (!item.capaianPembelajaran || item.capaianPembelajaran.includes('Peserta didik mempraktikkan'))
        ) {
          return {
            ...item,
            mataPelajaran: mapelNorm,
            tujuanPembelajaran: customTP,
            capaianPembelajaran: 'Menghaluskan keterampilan gerak fundamental dan menerapkannya dalam situasi gerak yang baru; menyesuaikan strategi gerak untuk mendapatkan capaian keterampilan gerak; dan memperagakan berbagai konsep gerak yang dapat diterapkan dalam rangkaian gerak.'
          };
        }
        return {
          ...item,
          mataPelajaran: mapelNorm,
          tujuanPembelajaran: customTP
        };
      });

      saveStoredCurriculum(syncedList);

      return syncedList;
    }
  } catch (e) {
    console.error('Error loading curriculum from storage', e);
  }
  return initialCurriculum;
};

export const saveStoredCurriculum = (curriculum: CurriculumItem[]): void => {
  try {
    const seenSaveIds = new Set<string>();
    const uniqueCurriculum = curriculum.filter(item => {
      if (!item || !item.id || seenSaveIds.has(item.id)) return false;
      seenSaveIds.add(item.id);
      return true;
    });

    const sanitized = uniqueCurriculum.map(item => {
      const normMapel = normalizeSubjectName(item.mataPelajaran) || item.mataPelajaran;
      let subOpsi = item.subOpsiSeni;
      if (normMapel === 'Seni Budaya' && !subOpsi) {
        const combined = `${item.mataPelajaran} ${item.elemen || ''} ${item.tujuanPembelajaran} ${item.materi}`.toLowerCase();
        if (combined.includes('rupa')) subOpsi = 'Seni Rupa';
        else if (combined.includes('musik')) subOpsi = 'Seni Musik';
        else if (combined.includes('tari')) subOpsi = 'Seni Tari';
        else if (combined.includes('teater')) subOpsi = 'Seni Teater';
      }
      return {
        ...item,
        mataPelajaran: normMapel,
        subOpsiSeni: subOpsi
      };
    });
    localStorage.setItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(sanitized));
  } catch (e) {
    console.error('Error saving curriculum to storage', e);
  }
};

export const getStoredTeachingJournals = (): DailyTeachingJournal[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHING_JOURNALS);
    if (raw) {
      const parsed: DailyTeachingJournal[] = JSON.parse(raw);
      return parsed.map(j => ({
        ...j,
        mataPelajaran: normalizeSubjectName(j.mataPelajaran) || j.mataPelajaran
      }));
    }
  } catch (e) {
    console.error('Error loading teaching journals from storage', e);
  }
  return initialTeachingJournals;
};

export const saveStoredTeachingJournals = (journals: DailyTeachingJournal[]): void => {
  try {
    const sanitized = journals.map(j => ({
      ...j,
      mataPelajaran: normalizeSubjectName(j.mataPelajaran) || j.mataPelajaran
    }));
    localStorage.setItem(STORAGE_KEYS.TEACHING_JOURNALS, JSON.stringify(sanitized));
  } catch (e) {
    console.error('Error saving teaching journals to storage', e);
  }
};

export const getStoredJpScheduleConfig = (): JpScheduleConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JP_SCHEDULE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          durasiJpMenit: parsed.durasiJpMenit || initialJpScheduleConfig.durasiJpMenit || 35,
          jamMulai: parsed.jamMulai || initialJpScheduleConfig.jamMulai || '07:00',
          totalJp: parsed.totalJp || initialJpScheduleConfig.totalJp || 8,
          breaks: Array.isArray(parsed.breaks) ? parsed.breaks : (initialJpScheduleConfig.breaks || [])
        };
      }
    }
  } catch (e) {
    console.error('Error loading JP schedule config from storage', e);
  }
  return initialJpScheduleConfig;
};

export const saveStoredJpScheduleConfig = (config: JpScheduleConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.JP_SCHEDULE, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving JP schedule config to storage', e);
  }
};

export const getStoredAssessments = (): StudentAssessment[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
    if (raw) {
      const parsed: StudentAssessment[] = JSON.parse(raw);
      return parsed.map(a => ({
        ...a,
        mataPelajaran: normalizeSubjectName(a.mataPelajaran) || a.mataPelajaran
      }));
    }
  } catch (e) {
    console.error('Error loading assessments from storage', e);
  }
  return initialAssessments;
};

export const saveStoredAssessments = (assessments: StudentAssessment[]): void => {
  try {
    const sanitized = assessments.map(a => ({
      ...a,
      mataPelajaran: normalizeSubjectName(a.mataPelajaran) || a.mataPelajaran
    }));
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(sanitized));
  } catch (e) {
    console.error('Error saving assessments to storage', e);
  }
};

export const getStoredExtracurriculars = (): ExtracurricularAssessment[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXTRACURRICULARS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading extracurriculars from storage', e);
  }
  return initialExtracurriculars;
};

export const saveStoredExtracurriculars = (extracurriculars: ExtracurricularAssessment[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EXTRACURRICULARS, JSON.stringify(extracurriculars));
  } catch (e) {
    console.error('Error saving extracurriculars to storage', e);
  }
};

export const getStoredCocurricularProjects = (): CocurricularProject[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COCURRICULARS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading cocurricular projects from storage', e);
  }
  return initialCocurricularProjects;
};

export const saveStoredCocurricularProjects = (projects: CocurricularProject[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.COCURRICULARS, JSON.stringify(projects));
  } catch (e) {
    console.error('Error saving cocurricular projects to storage', e);
  }
};

export const sanitizeReportDateString = (dateStr?: string, defaultYear: number = 2026): string => {
  if (!dateStr) return '';
  const str = dateStr.trim();
  const parts = str.split('-');
  if (parts.length === 3) {
    let year = parts[0];
    if (year.length > 4) {
      year = year.slice(-4);
    }
    const yNum = parseInt(year, 10);
    if (isNaN(yNum) || yNum < 2000 || yNum > 2100) {
      year = String(defaultYear);
    }
    const month = (parseInt(parts[1], 10) || 1).toString().padStart(2, '0');
    const day = (parseInt(parts[2], 10) || 1).toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};

export const getStoredStudentReports = (): StudentReportConfig[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENT_REPORTS);
    if (raw) {
      const parsed: StudentReportConfig[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        let changed = false;
        const cleaned = parsed.map(r => {
          if (r.tanggalRapor && (r.tanggalRapor.includes('202026') || r.tanggalRapor.split('-')[0]?.length > 4)) {
            changed = true;
            return {
              ...r,
              tanggalRapor: sanitizeReportDateString(r.tanggalRapor)
            };
          }
          return r;
        });
        if (changed) {
          try {
            localStorage.setItem(STORAGE_KEYS.STUDENT_REPORTS, JSON.stringify(cleaned));
          } catch {
            // ignore storage write errors
          }
        }
        return cleaned;
      }
    }
  } catch (e) {
    console.error('Error loading student reports from storage', e);
  }
  return [];
};

export const saveStoredStudentReports = (reports: StudentReportConfig[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENT_REPORTS, JSON.stringify(reports));
  } catch (e) {
    console.error('Error saving student reports to storage', e);
  }
};

export const resetAllData = (): {
  school: SchoolProfile;
  teachers: Teacher[];
  students: Student[];
  classes: ClassRoomItem[];
  agendas: SchoolAgenda[];
  announcements: SchoolAnnouncement[];
  attendance: DailyClassAttendance[];
  curriculum: CurriculumItem[];
  teachingJournals: DailyTeachingJournal[];
  jpSchedule: JpScheduleConfig;
  assessments: StudentAssessment[];
  extracurriculars: ExtracurricularAssessment[];
  cocurricularProjects: CocurricularProject[];
} => {
  localStorage.removeItem(STORAGE_KEYS.SCHOOL);
  localStorage.removeItem(STORAGE_KEYS.TEACHERS);
  localStorage.removeItem(STORAGE_KEYS.STUDENTS);
  localStorage.removeItem(STORAGE_KEYS.CLASSES);
  localStorage.removeItem(STORAGE_KEYS.AGENDAS);
  localStorage.removeItem(STORAGE_KEYS.ANNOUNCEMENTS);
  localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
  localStorage.removeItem(STORAGE_KEYS.CURRICULUM);
  localStorage.removeItem(STORAGE_KEYS.TEACHING_JOURNALS);
  localStorage.removeItem(STORAGE_KEYS.JP_SCHEDULE);
  localStorage.removeItem(STORAGE_KEYS.ASSESSMENTS);
  localStorage.removeItem(STORAGE_KEYS.EXTRACURRICULARS);
  localStorage.removeItem(STORAGE_KEYS.COCURRICULARS);
  return {
    school: initialSchoolProfile,
    teachers: initialTeachers,
    students: initialStudents,
    classes: initialClasses,
    agendas: initialAgendas,
    announcements: initialAnnouncements,
    attendance: initialAttendance,
    curriculum: initialCurriculum,
    teachingJournals: initialTeachingJournals,
    jpSchedule: initialJpScheduleConfig,
    assessments: initialAssessments,
    extracurriculars: initialExtracurriculars,
    cocurricularProjects: initialCocurricularProjects
  };
};

export const exportAllDataJSON = (
  school: SchoolProfile,
  teachers: Teacher[],
  students: Student[],
  agendas: SchoolAgenda[],
  announcements: SchoolAnnouncement[],
  attendance?: DailyClassAttendance[],
  curriculum?: CurriculumItem[],
  teachingJournals?: DailyTeachingJournal[],
  jpSchedule?: JpScheduleConfig,
  assessments?: StudentAssessment[],
  extracurriculars?: ExtracurricularAssessment[],
  cocurricularProjects?: CocurricularProject[],
  classes?: ClassRoomItem[]
): void => {
  const exportData = {
    school,
    teachers,
    students,
    classes: classes || initialClasses,
    agendas,
    announcements,
    attendance: attendance || [],
    curriculum: curriculum || [],
    teachingJournals: teachingJournals || [],
    jpSchedule: jpSchedule || initialJpScheduleConfig,
    assessments: assessments || [],
    extracurriculars: extracurriculars || [],
    cocurricularProjects: cocurricularProjects || [],
    exportDate: new Date().toISOString(),
    version: '1.5.0'
  };
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `backup_administrasi_sd_${school.npsn || 'data'}_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const parseBackupDataJSON = (jsonString: string): any => {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      throw new Error('Format berkas cadangan JSON tidak valid.');
    }
    return data;
  } catch (e: any) {
    throw new Error('Gagal membaca berkas cadangan JSON: ' + (e.message || 'File rusak'));
  }
};
