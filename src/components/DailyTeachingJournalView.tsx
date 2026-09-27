import React, { useState, useMemo, useEffect } from 'react';
import { 
  SchoolProfile, 
  Teacher, 
  ClassGrade, 
  CurriculumItem, 
  DailyTeachingJournal,
  ClassRoomItem,
  JpScheduleConfig,
  CalculatedJpSlot,
  STANDARD_SD_SUBJECTS,
  normalizeSubjectName,
  SENI_BUDAYA_BRANCHES,
  detectSeniBudayaBranch
} from '../types';
import { 
  BookOpen, 
  Calendar, 
  Plus, 
  FileSpreadsheet, 
  Download, 
  Search, 
  Filter, 
  Printer, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Sparkles, 
  Layers, 
  Lightbulb, 
  Clock, 
  User, 
  ChevronRight, 
  ArrowUpDown, 
  AlertCircle,
  HelpCircle,
  RotateCcw,
  BookMarked,
  FileCheck,
  FileText,
  Bookmark,
  Compass,
  Check,
  Coffee,
  Settings,
  CheckSquare,
  Square,
  Sliders
} from 'lucide-react';
import { CurriculumImportModal } from './CurriculumImportModal';
import { JpScheduleConfigModal } from './JpScheduleConfigModal';
import { OfficialSchoolKop } from './OfficialSchoolKop';
import { ConfirmDeleteModal, ConfirmDeleteState } from './ConfirmDeleteModal';
import { 
  exportTeachingJournalsToExcel,
  exportCurriculumToExcel
} from '../utils/excelCurriculumUtils';
import { initialCurriculum, initialJpScheduleConfig } from '../data/initialData';
import { calculateJpTimeline, formatSelectedJpDisplay } from '../utils/jpSchedule';
import { getStoredJournalSubTab, saveStoredJournalSubTab } from '../utils/storage';

interface DailyTeachingJournalViewProps {
  school: SchoolProfile;
  teachers: Teacher[];
  curriculum: CurriculumItem[];
  teachingJournals: DailyTeachingJournal[];
  classes?: ClassRoomItem[];
  jpSchedule?: JpScheduleConfig;
  onSaveJournal: (journal: DailyTeachingJournal) => void;
  onDeleteJournal: (id: string) => void;
  onUpdateCurriculum: (newCurriculum: CurriculumItem[]) => void;
  onSaveJpSchedule?: (newConfig: JpScheduleConfig) => void;
  onOpenPrintJournal?: () => void;
  onOpenClassModal?: () => void;
  onAddToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

const CLASS_OPTIONS: ClassGrade[] = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];

export const FASE_OPTIONS = [
  'Fase A Kelas 1',
  'Fase A Kelas 2',
  'Fase B Kelas 3',
  'Fase B Kelas 4',
  'Fase C Kelas 5',
  'Fase C Kelas 6'
];

// Helper to determine default Fase based on Kelas (e.g. 1A -> Fase A Kelas 1)
export const getFaseFromKelas = (kelas: string): string => {
  if (!kelas) return 'Fase A Kelas 1';
  const match = String(kelas).match(/\d+/);
  const grade = match ? match[0] : String(kelas).charAt(0);
  if (grade === '1') return 'Fase A Kelas 1';
  if (grade === '2') return 'Fase A Kelas 2';
  if (grade === '3') return 'Fase B Kelas 3';
  if (grade === '4') return 'Fase B Kelas 4';
  if (grade === '5') return 'Fase C Kelas 5';
  if (grade === '6') return 'Fase C Kelas 6';
  return 'Fase A Kelas 1';
};

const JP_OPTIONS = [
  'Ke 1 - 2 (07.00 - 08.10)',
  'Ke 3 - 4 (08.25 - 09.35)',
  'Ke 5 - 6 (10.00 - 11.10)',
  'Ke 7 - 8 (11.25 - 12.35)',
  'Ke 1 - 3 (07.00 - 08.45)',
  'Ke 4 - 6 (09.05 - 10.50)',
  'Ke 1 - 4 (07.00 - 09.20)'
];

const REFLECTION_TEMPLATES = [
  '🎯 90% siswa tuntas memahami materi dan aktif saat tanya jawab.',
  '💡 Siswa sangat antusias saat praktik menggunakan media benda konkret.',
  '📝 3 siswa masih membutuhkan bimbingan individual untuk pemahaman konsep.',
  '✨ Diskusi kelompok berjalan interaktif dan presentasi hasil sangat baik.',
  '⏳ Waktu pengerjaan latihan perlu ditambah pada pertemuan berikutnya.',
  '🔍 Perlu dilakukan evaluasi formatif dan remedial pada TP ini.'
];

const KETERANGAN_TEMPLATES = [
  'KBM berlangsung tertib dan tuntas sesuai jadwal.',
  'Menggunakan media LCD Proyektor dan Buku Teks Siswa.',
  'Tugas mandiri dikumpulkan di meja guru tepat waktu.',
  'Praktik di luar kelas / halaman sekolah berjalan aman.',
  'Seluruh siswa kelas hadir lengkap tanpa kendala.'
];

// Helper to get Indonesian day name from date string YYYY-MM-DD
const getIndonesianDayName = (dateStr: string): string => {
  if (!dateStr) return 'Senin';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      return days[d.getDay()] || 'Senin';
    }
  } catch {
    // fallback
  }
  return 'Senin';
};

const formatIndonesianDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(d);
    }
  } catch {
    // fallback
  }
  return dateStr;
};

export const DailyTeachingJournalView: React.FC<DailyTeachingJournalViewProps> = ({
  school,
  teachers,
  curriculum,
  teachingJournals,
  classes,
  jpSchedule,
  onSaveJournal,
  onDeleteJournal,
  onUpdateCurriculum,
  onSaveJpSchedule,
  onOpenPrintJournal,
  onOpenClassModal,
  onAddToast,
  onShowToast
}) => {
  const dynamicClassList: string[] = useMemo(() => {
    if (classes && classes.length > 0) {
      return classes.map(c => c.nama).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }
    return ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
  }, [classes]);

  const triggerToast = (title: string, message?: string, type?: 'success' | 'error' | 'info') => {
    if (typeof onAddToast === 'function') {
      onAddToast(title, message, type);
    } else if (typeof onShowToast === 'function') {
      onShowToast(title, message, type);
    }
  };
  const [activeSubTab, setActiveSubTab] = useState<'jurnal' | 'kurikulum'>(getStoredJournalSubTab);

  useEffect(() => {
    saveStoredJournalSubTab(activeSubTab);
  }, [activeSubTab]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isScheduleConfigModalOpen, setIsScheduleConfigModalOpen] = useState(false);

  // Active JP Schedule Configuration (1 JP = 35 mnt by default with conditional breaks)
  const activeScheduleConfig: JpScheduleConfig = useMemo(() => {
    return jpSchedule || initialJpScheduleConfig;
  }, [jpSchedule]);

  // Compute calculated slots and full timeline with conditional breaks
  const { slots: jpSlots, timeline: jpTimeline } = useMemo(() => {
    return calculateJpTimeline(activeScheduleConfig);
  }, [activeScheduleConfig]);

  // Filters
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal State for Journal Input / Edit
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);

  // Form Fields
  const todayStr = new Date().toISOString().slice(0, 10);
  const [formTanggal, setFormTanggal] = useState<string>(todayStr);
  const [formHari, setFormHari] = useState<string>(getIndonesianDayName(todayStr));
  const [formKelas, setFormKelas] = useState<string>(dynamicClassList[0] || '1A');
  const [formFase, setFormFase] = useState<string>(getFaseFromKelas(dynamicClassList[0] || '1A'));

  // Sync formKelas if dynamicClassList changes and formKelas is invalid
  useEffect(() => {
    if (dynamicClassList.length > 0 && !dynamicClassList.includes(formKelas)) {
      setFormKelas(dynamicClassList[0]);
      setFormFase(getFaseFromKelas(dynamicClassList[0]));
    }
  }, [dynamicClassList]);
  const [formSelectedJp, setFormSelectedJp] = useState<number[]>([1, 2]); // Checklist of selected JP slots
  const [formGuruPengajar, setFormGuruPengajar] = useState<string>(teachers[0]?.namaLengkap || '');
  const [formMataPelajaran, setFormMataPelajaran] = useState<string>('');
  const [formTujuanPembelajaran, setFormTujuanPembelajaran] = useState<string>('');
  const [formMateri, setFormMateri] = useState<string>('');
  const [formRefleksi, setFormRefleksi] = useState<string>('');
  const [formKeterangan, setFormKeterangan] = useState<string>('');
  const [formStatusKBM, setFormStatusKBM] = useState<'Terlaksana' | 'Tertunda' | 'Remedial' | 'Pengayaan'>('Terlaksana');

  // Custom text toggles for TP / Materi if user wants manual free typing
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [isCustomTP, setIsCustomTP] = useState(false);
  const [isCustomMateri, setIsCustomMateri] = useState(false);
  // Branch / Option for Seni Budaya in Journal form
  const [selectedSeniBranch, setSelectedSeniBranch] = useState<string>('Semua Opsi');

  // State for Add / Edit Manual Curriculum Modal
  const [isAddCurriculumModalOpen, setIsAddCurriculumModalOpen] = useState(false);
  const [editingCurriculumId, setEditingCurriculumId] = useState<string | null>(null);
  const [curMapel, setCurMapel] = useState('');
  const [curSubOpsiSeni, setCurSubOpsiSeni] = useState<string>('Seni Rupa');
  const [isCurCustomSubject, setIsCurCustomSubject] = useState(false);
  const [curFase, setCurFase] = useState('Fase A Kelas 2');
  const [curKelas, setCurKelas] = useState('Kelas 2');
  const [curSemester, setCurSemester] = useState<'Ganjil' | 'Genap' | 'Semua'>('Ganjil');
  const [curElemen, setCurElemen] = useState('');
  const [curCP, setCurCP] = useState('');
  const [curTP, setCurTP] = useState('');
  const [curMateri, setCurMateri] = useState('');
  const [curAlokasi, setCurAlokasi] = useState('2 JP');

  // Official elements & CPs for quick selection from BSKAP 046/2025 standard
  const officialElementsForSubject = useMemo(() => {
    const normMapel = normalizeSubjectName(curMapel);
    const isSeni = normMapel.toLowerCase() === 'seni budaya';
    const matches = initialCurriculum.filter(c => {
      const cMapelNorm = normalizeSubjectName(c.mataPelajaran);
      if (isSeni) {
        return cMapelNorm.toLowerCase() === 'seni budaya' && (!curSubOpsiSeni || c.subOpsiSeni === curSubOpsiSeni);
      }
      return cMapelNorm.toLowerCase() === normMapel.toLowerCase();
    });
    const phaseMatches = matches.filter(c => !curFase || c.faseKelas === curFase);
    const candidateList = phaseMatches.length > 0 ? phaseMatches : matches;
    
    const map = new Map<string, string>();
    for (const c of candidateList) {
      if (c.elemen && c.capaianPembelajaran && !map.has(c.elemen)) {
        map.set(c.elemen, c.capaianPembelajaran);
      }
    }
    return Array.from(map.entries()).map(([elemen, cp]) => ({ elemen, cp }));
  }, [curMapel, curSubOpsiSeni, curFase]);

  // Curriculum Filter
  const [curFilterMapel, setCurFilterMapel] = useState('all');
  const [curFilterSubSeni, setCurFilterSubSeni] = useState('all');
  const [curFilterFase, setCurFilterFase] = useState('all');
  const [curFilterSemester, setCurFilterSemester] = useState('all');
  const [curSearchQuery, setCurSearchQuery] = useState('');

  // Confirmation Delete Modal
  const [deleteConfirmState, setDeleteConfirmState] = useState<ConfirmDeleteState>({
    isOpen: false,
    title: '',
    itemName: '',
    description: '',
    onConfirm: () => {},
  });

  const openDeleteConfirm = (config: Omit<ConfirmDeleteState, 'isOpen'>) => {
    setDeleteConfirmState({
      ...config,
      isOpen: true,
    });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  // Helper to toggle JP slot in checklist
  const handleToggleJp = (jpNumber: number) => {
    setFormSelectedJp(prev => {
      if (prev.includes(jpNumber)) {
        return prev.filter(j => j !== jpNumber);
      } else {
        return [...prev, jpNumber].sort((a, b) => a - b);
      }
    });
  };

  // Preset JP selection shortcuts
  const handleSelectJpPreset = (preset: number[]) => {
    setFormSelectedJp(preset);
  };

  // Extract unique subjects from Curriculum Bank & standard SD subjects
  const availableSubjects = useMemo(() => {
    const set = new Set<string>(STANDARD_SD_SUBJECTS);
    curriculum.forEach(c => {
      if (c.mataPelajaran) {
        const val = normalizeSubjectName(c.mataPelajaran) || c.mataPelajaran.trim();
        set.add(val);
      }
    });
    return Array.from(set).sort();
  }, [curriculum]);

  // CASCADING STEP 1: Available Learning Objectives (TP) based on chosen Mata Pelajaran & Kelas/Fase
  const availableTPs = useMemo(() => {
    if (!formMataPelajaran) return [];
    const normalizedFormMapel = normalizeSubjectName(formMataPelajaran).toLowerCase();
    const isSeniBudayaParent = normalizedFormMapel === 'seni budaya';
    const seniBranches = ['seni rupa', 'seni musik', 'seni tari', 'seni teater', 'seni budaya'];
    const matchedItems = curriculum.filter(c => {
      const cNorm = normalizeSubjectName(c.mataPelajaran).toLowerCase();
      const isMatchSubject = cNorm === normalizedFormMapel || (isSeniBudayaParent && seniBranches.includes(cNorm));
      if (!isMatchSubject) return false;
      if (isSeniBudayaParent && selectedSeniBranch !== 'Semua Opsi') {
        const itemBranch = c.subOpsiSeni || detectSeniBudayaBranch(c.tujuanPembelajaran, c.materi);
        if (itemBranch !== selectedSeniBranch) return false;
      }
      return true;
    });

    const classNum = formKelas ? formKelas.charAt(0) : '';
    // Prefer items matching current class or target phase if available
    const classMatched = matchedItems.filter(c => {
      if (!classNum) return true;
      const matchTarget = c.kelasTarget && (c.kelasTarget.includes(classNum) || c.kelasTarget === 'Semua Kelas');
      const matchFase = c.faseKelas && (c.faseKelas.includes(`Kelas ${classNum}`) || (formFase && c.faseKelas === formFase));
      return matchTarget || matchFase;
    });

    const itemsToUse = classMatched.length > 0 ? classMatched : matchedItems;
    const set = new Set<string>();
    itemsToUse.forEach(c => {
      if (c.tujuanPembelajaran) set.add(c.tujuanPembelajaran.trim());
    });
    return Array.from(set);
  }, [curriculum, formMataPelajaran, selectedSeniBranch, formKelas, formFase]);

  // CASCADING STEP 2: Available Materials (Materi) based on chosen TP and Mata Pelajaran
  const availableMaterials = useMemo(() => {
    if (!formMataPelajaran || !formTujuanPembelajaran) return [];
    const normalizedFormMapel = normalizeSubjectName(formMataPelajaran).toLowerCase();
    const isSeniBudayaParent = normalizedFormMapel === 'seni budaya';
    const seniBranches = ['seni rupa', 'seni musik', 'seni tari', 'seni teater', 'seni budaya'];
    const matchedItems = curriculum.filter(c => {
      const cNorm = normalizeSubjectName(c.mataPelajaran).toLowerCase();
      const matchMapel = cNorm === normalizedFormMapel || (isSeniBudayaParent && seniBranches.includes(cNorm));
      return matchMapel && c.tujuanPembelajaran.toLowerCase().trim() === formTujuanPembelajaran.toLowerCase().trim();
    });
    const set = new Set<string>();
    matchedItems.forEach(c => {
      if (c.materi) set.add(c.materi.trim());
    });
    // Fallback: if no material found under the same mapel, check across curriculum for this exact TP
    if (set.size === 0) {
      curriculum.forEach(c => {
        if (c.tujuanPembelajaran.toLowerCase().trim() === formTujuanPembelajaran.toLowerCase().trim() && c.materi) {
          set.add(c.materi.trim());
        }
      });
    }
    return Array.from(set);
  }, [curriculum, formMataPelajaran, formTujuanPembelajaran]);

  // Auto-sync formMateri whenever availableMaterials updates and formMateri is empty or not in the available list
  useEffect(() => {
    if (isJournalModalOpen && !isCustomMateri && availableMaterials.length > 0) {
      if (!formMateri || !availableMaterials.includes(formMateri)) {
        setFormMateri(availableMaterials[0]);
      }
    }
  }, [isJournalModalOpen, isCustomMateri, availableMaterials, formMateri]);

  // Handle date change in form
  const handleDateChange = (newDate: string) => {
    setFormTanggal(newDate);
    setFormHari(getIndonesianDayName(newDate));
  };

  // Open Add Journal Modal
  const handleOpenAddJournal = () => {
    const defaultSubject = availableSubjects[0] || 'Bahasa Indonesia';
    const defaultKelas = dynamicClassList[0] || '1A';
    setEditingJournalId(null);
    setFormTanggal(todayStr);
    setFormHari(getIndonesianDayName(todayStr));
    setFormKelas(defaultKelas);
    const defaultFase = getFaseFromKelas(defaultKelas);
    setFormFase(defaultFase);
    setFormSelectedJp([1, 2]); // Default 2 JP (JP 1 & 2)
    setFormGuruPengajar(teachers[0]?.namaLengkap || '');
    setFormMataPelajaran(defaultSubject);

    // Find default TP and Materi for this default subject & class
    const classNum = defaultKelas ? defaultKelas.charAt(0) : '';
    const subjectItems = curriculum.filter(c => {
      const matchMapel = normalizeSubjectName(c.mataPelajaran).toLowerCase() === normalizeSubjectName(defaultSubject).toLowerCase();
      if (!matchMapel) return false;
      return !classNum || (c.kelasTarget && (c.kelasTarget.includes(classNum) || c.kelasTarget === 'Semua Kelas')) || (c.faseKelas && c.faseKelas.includes(`Kelas ${classNum}`));
    });
    const fallbackItems = curriculum.filter(c => normalizeSubjectName(c.mataPelajaran).toLowerCase() === normalizeSubjectName(defaultSubject).toLowerCase());
    const matchedItems = subjectItems.length > 0 ? subjectItems : fallbackItems;

    if (matchedItems.length > 0) {
      setFormTujuanPembelajaran(matchedItems[0].tujuanPembelajaran);
      setFormMateri(matchedItems[0].materi);
    } else {
      setFormTujuanPembelajaran('');
      setFormMateri('');
    }

    setFormRefleksi('');
    setFormKeterangan('KBM berjalan tertib dan tuntas sesuai alokasi waktu.');
    setFormStatusKBM('Terlaksana');
    setSelectedSeniBranch('Semua Opsi');
    setIsCustomSubject(false);
    setIsCustomTP(false);
    setIsCustomMateri(false);
    setIsJournalModalOpen(true);
  };

  // Open Edit Journal Modal
  const handleOpenEditJournal = (journal: DailyTeachingJournal) => {
    setEditingJournalId(journal.id);
    setFormTanggal(journal.tanggal);
    setFormHari(journal.hari || getIndonesianDayName(journal.tanggal));
    setFormKelas(journal.kelas);
    setFormFase(journal.fase || getFaseFromKelas(journal.kelas));

    // Restore selected JP array or infer from string
    if (journal.selectedJp && journal.selectedJp.length > 0) {
      setFormSelectedJp(journal.selectedJp);
    } else if (journal.jamPelajaran) {
      // Parse JP numbers from string e.g. "JP 1 - 2" or "Ke 1 - 2"
      const matches = journal.jamPelajaran.match(/\d+/g);
      if (matches && matches.length >= 2) {
        const start = parseInt(matches[0], 10);
        const end = parseInt(matches[1], 10);
        if (start > 0 && end >= start && end <= 12) {
          const arr: number[] = [];
          for (let i = start; i <= end; i++) arr.push(i);
          setFormSelectedJp(arr);
        } else if (start > 0 && start <= 12) {
          setFormSelectedJp([start]);
        } else {
          setFormSelectedJp([1, 2]);
        }
      } else if (matches && matches.length === 1) {
        const single = parseInt(matches[0], 10);
        setFormSelectedJp(single > 0 && single <= 12 ? [single] : [1, 2]);
      } else {
        setFormSelectedJp([1, 2]);
      }
    } else {
      setFormSelectedJp([1, 2]);
    }

    setFormGuruPengajar(journal.guruPengajar || teachers[0]?.namaLengkap || '');
    setFormMataPelajaran(journal.mataPelajaran);
    setFormTujuanPembelajaran(journal.tujuanPembelajaran);
    setFormMateri(journal.materi);
    setFormRefleksi(journal.refleksi || '');
    setFormKeterangan(journal.keterangan || '');
    setFormStatusKBM(journal.statusKBM || 'Terlaksana');

    // Detect branch if editing a Seni Budaya item
    if (normalizeSubjectName(journal.mataPelajaran).toLowerCase() === 'seni budaya') {
      const detectedBranch = detectSeniBudayaBranch(journal.tujuanPembelajaran, journal.materi);
      setSelectedSeniBranch(detectedBranch || 'Semua Opsi');
    } else {
      setSelectedSeniBranch('Semua Opsi');
    }

    // Check if subject / TP / materi exists in curriculum bank
    const normJournalSubject = normalizeSubjectName(journal.mataPelajaran).toLowerCase();
    const isSeniBudaya = normJournalSubject === 'seni budaya';
    const seniBranches = ['seni rupa', 'seni musik', 'seni tari', 'seni teater', 'seni budaya'];

    const subjectExists = availableSubjects.some(
      s => normalizeSubjectName(s).toLowerCase() === normJournalSubject
    );
    setIsCustomSubject(!subjectExists);

    const tpExists = curriculum.some(c => {
      const cNorm = normalizeSubjectName(c.mataPelajaran).toLowerCase();
      const matchMapel = cNorm === normJournalSubject || (isSeniBudaya && seniBranches.includes(cNorm));
      return matchMapel && c.tujuanPembelajaran.toLowerCase().trim() === journal.tujuanPembelajaran.toLowerCase().trim();
    });
    setIsCustomTP(!tpExists);

    const matExists = curriculum.some(c => {
      const cNorm = normalizeSubjectName(c.mataPelajaran).toLowerCase();
      const matchMapel = cNorm === normJournalSubject || (isSeniBudaya && seniBranches.includes(cNorm));
      return matchMapel &&
        c.tujuanPembelajaran.toLowerCase().trim() === journal.tujuanPembelajaran.toLowerCase().trim() &&
        c.materi.toLowerCase().trim() === (journal.materi || '').toLowerCase().trim();
    });
    setIsCustomMateri(!matExists);

    setIsJournalModalOpen(true);
  };

  // Handle branch change for Seni Budaya in Journal Form
  const handleSeniBranchChange = (branch: string) => {
    setSelectedSeniBranch(branch);
    setIsCustomTP(false);
    setIsCustomMateri(false);

    const isSeniBudayaParent = normalizeSubjectName(formMataPelajaran).toLowerCase() === 'seni budaya';
    if (!isSeniBudayaParent) return;

    const matched = curriculum.filter(c => {
      const cNorm = normalizeSubjectName(c.mataPelajaran).toLowerCase();
      if (cNorm !== 'seni budaya' && !['seni rupa', 'seni musik', 'seni tari', 'seni teater'].includes(cNorm)) return false;
      if (branch !== 'Semua Opsi') {
        const itemBranch = c.subOpsiSeni || detectSeniBudayaBranch(c.tujuanPembelajaran, c.materi);
        if (itemBranch !== branch) return false;
      }
      return true;
    });

    const classNum = formKelas ? formKelas.charAt(0) : '';
    const classMatched = matched.filter(c => {
      if (!classNum) return true;
      const matchTarget = c.kelasTarget && (c.kelasTarget.includes(classNum) || c.kelasTarget === 'Semua Kelas');
      const matchFase = c.faseKelas && (c.faseKelas.includes(`Kelas ${classNum}`) || (formFase && c.faseKelas === formFase));
      return matchTarget || matchFase;
    });

    const candidates = classMatched.length > 0 ? classMatched : matched;

    if (candidates.length > 0) {
      setFormTujuanPembelajaran(candidates[0].tujuanPembelajaran);
      setFormMateri(candidates[0].materi || '');
    }
  };

  // Handle Mata Pelajaran change -> Auto sync TP and Materi
  const handleSubjectChange = (subject: string) => {
    setFormMataPelajaran(subject);
    setSelectedSeniBranch('Semua Opsi');
    setIsCustomTP(false);
    setIsCustomMateri(false);

    const normSubject = normalizeSubjectName(subject).toLowerCase();
    const isSeni = normSubject === 'seni budaya';
    const matchedCurriculum = curriculum.filter(
      c => {
        const cNorm = normalizeSubjectName(c.mataPelajaran).toLowerCase();
        return cNorm === normSubject || (isSeni && ['seni rupa', 'seni musik', 'seni tari', 'seni teater', 'seni budaya'].includes(cNorm));
      }
    );

    const classNum = formKelas ? formKelas.charAt(0) : '';
    const classMatched = matchedCurriculum.filter(c => {
      if (!classNum) return true;
      const matchTarget = c.kelasTarget && (c.kelasTarget.includes(classNum) || c.kelasTarget === 'Semua Kelas');
      const matchFase = c.faseKelas && (c.faseKelas.includes(`Kelas ${classNum}`) || (formFase && c.faseKelas === formFase));
      return matchTarget || matchFase;
    });

    const candidateList = classMatched.length > 0 ? classMatched : matchedCurriculum;

    if (candidateList.length > 0) {
      const firstTP = candidateList[0].tujuanPembelajaran;
      setFormTujuanPembelajaran(firstTP);

      // Find first material for that TP
      const matchedMateriList = candidateList.filter(
        c => c.tujuanPembelajaran.toLowerCase().trim() === firstTP.toLowerCase().trim()
      );
      if (matchedMateriList.length > 0 && matchedMateriList[0].materi) {
        setFormMateri(matchedMateriList[0].materi);
      } else {
        const anyMateri = candidateList.find(c => c.materi && c.materi.trim() !== '')?.materi || '';
        setFormMateri(anyMateri);
      }
    } else {
      setFormTujuanPembelajaran('');
      setFormMateri('');
    }
  };

  // Handle TP change -> Auto sync Materi
  const handleTPChange = (tp: string) => {
    setFormTujuanPembelajaran(tp);
    setIsCustomMateri(false);

    const normSubject = normalizeSubjectName(formMataPelajaran).toLowerCase();
    const isSeni = normSubject === 'seni budaya';
    const seniBranches = ['seni rupa', 'seni musik', 'seni tari', 'seni teater', 'seni budaya'];

    const matchedCurriculum = curriculum.filter(c => {
      const cNorm = normalizeSubjectName(c.mataPelajaran).toLowerCase();
      const matchMapel = cNorm === normSubject || (isSeni && seniBranches.includes(cNorm));
      return matchMapel && c.tujuanPembelajaran.toLowerCase().trim() === tp.toLowerCase().trim();
    });

    const candidate = matchedCurriculum.find(c => c.materi && c.materi.trim() !== '') ||
      curriculum.find(c => c.tujuanPembelajaran.toLowerCase().trim() === tp.toLowerCase().trim() && c.materi && c.materi.trim() !== '');

    if (candidate && candidate.materi) {
      setFormMateri(candidate.materi.trim());
    } else {
      setFormMateri('');
    }
  };

  // Save Journal Submission
  const handleSubmitJournal = (e: React.FormEvent) => {
    e.preventDefault();

    if (formSelectedJp.length === 0) {
      triggerToast('Pilih Jam Pelajaran', 'Silakan beri tanda centang minimal pada 1 Jam Pelajaran (JP).', 'error');
      return;
    }
    if (!formMataPelajaran.trim()) {
      triggerToast('Mata Pelajaran Wajib Dipilih', 'Silakan pilih atau tuliskan mata pelajaran.', 'error');
      return;
    }

    // Resilient fallback for TP (if visible in select dropdown)
    let effectiveTP = formTujuanPembelajaran.trim();
    if (!effectiveTP && !isCustomTP && availableTPs.length > 0) {
      effectiveTP = availableTPs[0].trim();
      setFormTujuanPembelajaran(effectiveTP);
    }
    if (!effectiveTP) {
      triggerToast('Tujuan Pembelajaran Wajib Diisi', 'Silakan tentukan Tujuan Pembelajaran (TP).', 'error');
      return;
    }

    // Resilient fallback for Materi (if visible in select dropdown)
    let effectiveMateri = formMateri.trim();
    if (!effectiveMateri && !isCustomMateri && availableMaterials.length > 0) {
      effectiveMateri = availableMaterials[0].trim();
      setFormMateri(effectiveMateri);
    } else if (!effectiveMateri && availableMaterials.length > 0) {
      effectiveMateri = availableMaterials[0].trim();
      setFormMateri(effectiveMateri);
    }
    if (!effectiveMateri) {
      triggerToast('Materi Pokok Wajib Diisi', 'Silakan pilih atau tulis materi pembelajaran.', 'error');
      return;
    }

    const durasiPerJp = activeScheduleConfig.durasiJpMenit || 35;
    const totalJpCount = formSelectedJp.length;
    const totalMenit = totalJpCount * durasiPerJp;
    const jamPelajaranStr = formatSelectedJpDisplay(formSelectedJp, jpSlots);

    const newJournal: DailyTeachingJournal = {
      id: editingJournalId || `jrn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tanggal: formTanggal,
      hari: formHari || getIndonesianDayName(formTanggal),
      kelas: formKelas,
      fase: formFase,
      jamPelajaran: jamPelajaranStr,
      selectedJp: formSelectedJp,
      totalJpCount: totalJpCount,
      totalMenit: totalMenit,
      guruPengajar: formGuruPengajar,
      mataPelajaran: formMataPelajaran.trim(),
      tujuanPembelajaran: effectiveTP,
      materi: effectiveMateri,
      refleksi: formRefleksi.trim(),
      keterangan: formKeterangan.trim(),
      statusKBM: formStatusKBM,
      updatedAt: new Date().toISOString(),
      createdAt: editingJournalId ? undefined : new Date().toISOString()
    };

    onSaveJournal(newJournal);
    triggerToast(
      editingJournalId ? 'Jurnal Mengajar Diperbarui' : 'Jurnal Mengajar Disimpan',
      `Jurnal ${newJournal.mataPelajaran} (${newJournal.kelas}) - ${jamPelajaranStr} berhasil dicatat.`,
      'success'
    );
    setIsJournalModalOpen(false);
  };

  // Import Curriculum Callback
  const handleImportCurriculumComplete = (items: CurriculumItem[], replaceExisting: boolean) => {
    if (replaceExisting) {
      onUpdateCurriculum(items);
      triggerToast('Bank Kurikulum Berhasil Diganti', `${items.length} data pemetaan kurikulum baru telah disimpan.`, 'success');
    } else {
      onUpdateCurriculum([...curriculum, ...items]);
      triggerToast('Kurikulum Berhasil Ditambahkan', `${items.length} data pemetaan kurikulum berhasil digabungkan.`, 'success');
    }
  };

  // Open modal to add new curriculum item
  const handleOpenAddCurriculum = () => {
    setEditingCurriculumId(null);
    setCurMapel(availableSubjects[0] || 'Pendidikan Pancasila');
    setCurSubOpsiSeni('Seni Rupa');
    setIsCurCustomSubject(false);
    setCurFase(curFilterFase !== 'all' ? curFilterFase : 'Fase A Kelas 2');
    setCurKelas(curFilterFase.includes('Kelas 1') ? 'Kelas 1' : 'Kelas 2');
    setCurSemester('Ganjil');
    setCurElemen('');
    setCurCP('');
    setCurTP('');
    setCurMateri('');
    setCurAlokasi('2 JP');
    setIsAddCurriculumModalOpen(true);
  };

  // Open modal to edit existing curriculum item
  const handleOpenEditCurriculum = (item: CurriculumItem) => {
    setEditingCurriculumId(item.id);
    setCurMapel(item.mataPelajaran);
    setCurSubOpsiSeni(item.subOpsiSeni || 'Seni Rupa');
    setIsCurCustomSubject(!availableSubjects.includes(item.mataPelajaran));
    setCurFase(item.faseKelas || 'Fase A Kelas 2');
    setCurKelas(item.kelasTarget || (item.faseKelas?.includes('Kelas 1') ? 'Kelas 1' : 'Kelas 2'));
    setCurSemester(item.semester || 'Ganjil');
    setCurElemen(item.elemen || '');
    setCurCP(item.capaianPembelajaran || '');
    setCurTP(item.tujuanPembelajaran || '');
    setCurMateri(item.materi || '');
    setCurAlokasi(item.alokasiWaktu || '2 JP');
    setIsAddCurriculumModalOpen(true);
  };

  // Save manual curriculum item (Add or Edit)
  const handleAddManualCurriculum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!curMapel.trim() || !curTP.trim() || !curMateri.trim()) {
      triggerToast('Data Belum Lengkap', 'Mata Pelajaran, TP, dan Materi wajib diisi.', 'error');
      return;
    }

    const isSeni = curMapel.trim() === 'Seni Budaya';

    if (editingCurriculumId) {
      const updatedList = curriculum.map(c => c.id === editingCurriculumId ? {
        ...c,
        mataPelajaran: curMapel.trim(),
        subOpsiSeni: isSeni ? curSubOpsiSeni : undefined,
        faseKelas: curFase,
        kelasTarget: curKelas,
        semester: curSemester,
        elemen: curElemen.trim() || undefined,
        capaianPembelajaran: curCP.trim() || undefined,
        tujuanPembelajaran: curTP.trim(),
        materi: curMateri.trim(),
        alokasiWaktu: curAlokasi.trim() || undefined
      } : c);

      onUpdateCurriculum(updatedList);
      triggerToast('Kurikulum Diperbarui', `Pemetaan untuk ${curMapel} berhasil diperbarui.`, 'success');
      setIsAddCurriculumModalOpen(false);
      setEditingCurriculumId(null);
      return;
    }

    const newItem: CurriculumItem = {
      id: `cur-man-${Date.now()}`,
      mataPelajaran: curMapel.trim(),
      subOpsiSeni: isSeni ? curSubOpsiSeni : undefined,
      faseKelas: curFase,
      kelasTarget: curKelas,
      semester: curSemester,
      elemen: curElemen.trim() || undefined,
      capaianPembelajaran: curCP.trim() || undefined,
      tujuanPembelajaran: curTP.trim(),
      materi: curMateri.trim(),
      alokasiWaktu: curAlokasi.trim() || undefined
    };

    onUpdateCurriculum([newItem, ...curriculum]);
    triggerToast('Kurikulum Ditambahkan', `TP & Materi untuk ${curMapel}${isSeni ? ` (${curSubOpsiSeni})` : ''} berhasil ditambahkan ke Bank Kurikulum.`, 'success');
    setIsAddCurriculumModalOpen(false);
    setCurElemen('');
    setCurCP('');
    setCurTP('');
    setCurMateri('');
  };

  // Delete Curriculum item
  const handleDeleteCurriculumItem = (item: CurriculumItem) => {
    openDeleteConfirm({
      title: 'Hapus Pemetaan Kurikulum (TP)',
      itemName: `${item.mataPelajaran} (${item.faseKelas || item.kelasTarget || 'Fase'}) - TP: ${item.tujuanPembelajaran}`,
      description: 'Apakah Anda yakin ingin menghapus data TP dan Materi ini dari Bank Kurikulum?',
      confirmButtonText: 'Ya, Hapus Kurikulum',
      onConfirm: () => {
        onUpdateCurriculum(curriculum.filter(c => c.id !== item.id));
        triggerToast('Kurikulum Dihapus', 'Data pemetaan kurikulum (TP) telah dihapus.', 'info');
      }
    });
  };

  // Reset curriculum to initial standard
  const handleResetCurriculum = () => {
    openDeleteConfirm({
      title: 'Reset Bank Kurikulum',
      itemName: 'Standar Kurikulum Merdeka SD',
      description: 'Kembalikan seluruh Bank Kurikulum ke standar bawaan Kurikulum Merdeka SD? Data pemetaan TP kustom yang telah diinput akan terhapus.',
      confirmButtonText: 'Ya, Reset ke Standar',
      onConfirm: () => {
        onUpdateCurriculum(initialCurriculum);
        triggerToast('Bank Kurikulum Direset', 'Data kurikulum dikembalikan ke standar Kurikulum Merdeka.', 'success');
      }
    });
  };

  // Export entire curriculum (TP) database to Excel (.xlsx)
  // Ensures 100% of all data items in the curriculum menu are exported
  const handleExportCurriculum = (exportFilteredOnly: boolean = false) => {
    // Build full dataset guaranteeing all standard items and custom items are included
    const baseList = curriculum && curriculum.length > 0 ? curriculum : initialCurriculum;
    const existingIds = new Set(baseList.map(item => item.id));
    const fullDataset = [
      ...baseList,
      ...initialCurriculum.filter(item => !existingIds.has(item.id))
    ];

    const targetList = exportFilteredOnly ? filteredCurriculumList : fullDataset;

    if (!targetList || targetList.length === 0) {
      triggerToast('Data Kosong', 'Belum ada data Kurikulum (TP) untuk diekspor.', 'error');
      return;
    }

    exportCurriculumToExcel(targetList, school, {
      isFiltered: exportFilteredOnly,
      filterLabel: exportFilteredOnly
        ? `${curFilterMapel !== 'all' ? curFilterMapel : 'Semua Mapel'} - ${curFilterFase !== 'all' ? curFilterFase : 'Semua Fase'}${curFilterSemester !== 'all' ? ` - Sem. ${curFilterSemester}` : ''}`
        : undefined
    });

    triggerToast(
      'Ekspor Kurikulum Berhasil',
      exportFilteredOnly
        ? `Sebanyak ${targetList.length} butir TP (hasil filter) telah berhasil diekspor ke file Excel.`
        : `Seluruh isi data pada menu Kurikulum (TP) sebanyak ${targetList.length} butir (semua mapel & fase) telah berhasil diekspor ke file Excel.`,
      'success'
    );
  };

  // Delete Journal Handler with Modal
  const handleConfirmDeleteJournal = (journal: DailyTeachingJournal) => {
    openDeleteConfirm({
      title: 'Hapus Catatan Jurnal Mengajar',
      itemName: `${journal.mataPelajaran} (${journal.kelas}) - Tanggal ${journal.tanggal}`,
      description: `Apakah Anda yakin ingin menghapus catatan agenda KBM ${journal.mataPelajaran} pada tanggal ${journal.tanggal}?`,
      confirmButtonText: 'Ya, Hapus Jurnal',
      onConfirm: () => {
        onDeleteJournal(journal.id);
        triggerToast('Jurnal Dihapus', 'Catatan jurnal mengajar berhasil dihapus.', 'info');
      }
    });
  };

  // Filtered Journals
  const filteredJournals = useMemo(() => {
    return teachingJournals.filter(journal => {
      if (selectedClassFilter !== 'all' && journal.kelas !== selectedClassFilter) {
        return false;
      }
      if (selectedSubjectFilter !== 'all' && journal.mataPelajaran !== selectedSubjectFilter) {
        return false;
      }
      if (selectedTeacherFilter !== 'all' && journal.guruPengajar !== selectedTeacherFilter) {
        return false;
      }
      if (dateFilter && journal.tanggal !== dateFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inMapel = journal.mataPelajaran.toLowerCase().includes(q);
        const inTP = journal.tujuanPembelajaran.toLowerCase().includes(q);
        const inMateri = journal.materi.toLowerCase().includes(q);
        const inRefleksi = journal.refleksi.toLowerCase().includes(q);
        const inKeterangan = journal.keterangan.toLowerCase().includes(q);
        const inGuru = (journal.guruPengajar || '').toLowerCase().includes(q);
        const inDate = journal.tanggal.includes(q) || journal.hari.toLowerCase().includes(q);
        if (!inMapel && !inTP && !inMateri && !inRefleksi && !inKeterangan && !inGuru && !inDate) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      // Sort newest date first
      if (a.tanggal !== b.tanggal) {
        return b.tanggal.localeCompare(a.tanggal);
      }
      return (a.jamPelajaran || '').localeCompare(b.jamPelajaran || '');
    });
  }, [teachingJournals, selectedClassFilter, selectedSubjectFilter, selectedTeacherFilter, dateFilter, searchQuery]);

  // Filtered Curriculum Bank Items
  const filteredCurriculumList = useMemo(() => {
    return curriculum.filter(item => {
      if (curFilterMapel !== 'all') {
        const itemMapelNorm = normalizeSubjectName(item.mataPelajaran);
        const filterMapelNorm = normalizeSubjectName(curFilterMapel);
        if (filterMapelNorm === 'Seni Budaya') {
          if (itemMapelNorm !== 'Seni Budaya') return false;
          if (curFilterSubSeni !== 'all') {
            const branch = item.subOpsiSeni || detectSeniBudayaBranch(item.tujuanPembelajaran, item.materi);
            if (branch !== curFilterSubSeni) return false;
          }
        } else if (itemMapelNorm !== filterMapelNorm) {
          return false;
        }
      }
      if (curFilterFase !== 'all') {
        const itemFase = item.faseKelas || '';
        const matchFase = itemFase === curFilterFase || (item.kelasTarget && curFilterFase.includes(item.kelasTarget));
        if (!matchFase) return false;
      }
      if (curFilterSemester !== 'all') {
        const itemSem = item.semester;
        if (itemSem && itemSem !== 'Semua' && itemSem !== curFilterSemester) return false;
      }
      if (curSearchQuery.trim()) {
        const q = curSearchQuery.toLowerCase().trim();
        const matchMapel = item.mataPelajaran.toLowerCase().includes(q);
        const matchSubOpsi = (item.subOpsiSeni || '').toLowerCase().includes(q);
        const matchTP = item.tujuanPembelajaran.toLowerCase().includes(q);
        const matchMateri = item.materi.toLowerCase().includes(q);
        const matchFase = (item.faseKelas || '').toLowerCase().includes(q);
        const matchSem = (item.semester || '').toLowerCase().includes(q);
        const matchElemen = (item.elemen || '').toLowerCase().includes(q);
        const matchCP = (item.capaianPembelajaran || '').toLowerCase().includes(q);
        if (!matchMapel && !matchSubOpsi && !matchTP && !matchMateri && !matchFase && !matchSem && !matchElemen && !matchCP) return false;
      }
      return true;
    });
  }, [curriculum, curFilterMapel, curFilterSubSeni, curFilterFase, curFilterSemester, curSearchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <BookOpen className="w-3.5 h-3.5" />
                Administrasi Pembelajaran Guru
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {school.kurikulum}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                T.A. {school.tahunAjaran} ({school.semester})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              Jurnal Mengajar Harian
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Catatan agenda KBM harian terstruktur dengan sinkronisasi otomatis antara <strong className="text-slate-200">Mata Pelajaran</strong>, <strong className="text-slate-200">Tujuan Pembelajaran (TP)</strong>, dan <strong className="text-slate-200">Materi Pokok</strong> berbasis format Excel Kurikulum Merdeka.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsScheduleConfigModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium border border-amber-500/30 hover:border-amber-500/50 transition-all active:scale-95 shadow-sm"
              title="Atur durasi 1 JP (35 menit) dan jam istirahat kondisional"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Setting JP</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-200 text-[10px]">
                1 JP = {activeScheduleConfig.durasiJpMenit || 35}m
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleExportCurriculum(false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-200 text-xs font-semibold border border-sky-500/40 hover:border-sky-500/60 transition-all active:scale-95 shadow-sm"
              title={`Ekspor seluruh isi data pada menu Kurikulum (TP) (${curriculum.length} butir) ke file Excel`}
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Ekspor Kurikulum</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/40 hover:border-indigo-500/60 transition-all active:scale-95 shadow-sm"
              title="Unggah file Excel Kurikulum & TP"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
              <span>Import Kurikulum</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurMapel(availableSubjects[0] || 'Matematika');
                setIsCurCustomSubject(false);
                setIsAddCurriculumModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
              title="Input data Kurikulum, Tujuan Pembelajaran (TP) & Materi Pokok"
            >
              <Plus className="w-4 h-4" />
              <span>Input Kurikulum (TP)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddJournal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Input Jurnal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                exportTeachingJournalsToExcel(filteredJournals, school, {
                  kelas: selectedClassFilter !== 'all' ? selectedClassFilter : undefined,
                  mapel: selectedSubjectFilter !== 'all' ? selectedSubjectFilter : undefined,
                  guru: selectedTeacherFilter !== 'all' ? selectedTeacherFilter : undefined,
                  dateRange: dateFilter || undefined
                });
                (onAddToast || onShowToast)?.('Ekspor Excel Berhasil', 'File jurnal mengajar telah diunduh.', 'success');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
              title="Unduh / Simpan Jurnal KBM ke Excel (.xlsx)"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Simpan Excel</span>
            </button>

            {onOpenPrintJournal && (
              <button
                type="button"
                onClick={onOpenPrintJournal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
                title="Cetak Jurnal via Kabel USB / Nirkabel Wi-Fi Bluetooth atau Simpan PDF"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / PDF Jurnal</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-800 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveSubTab('jurnal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'jurnal'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>Jurnal Mengajar ({teachingJournals.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('kurikulum')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'kurikulum'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Kurikulum (TP) ({curriculum.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: AGENDA JURNAL MENGAJAR (DAFTAR & KALENDER)                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'jurnal' && (
        <div className="space-y-5">
          {/* Filter Toolbar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search and Filters */}
            <div className="flex items-center gap-2.5 flex-wrap flex-1">
              {/* Search Bar */}
              <div className="relative min-w-[200px] flex-1 max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari materi, TP, refleksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Class Filter */}
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Semua Rombel</option>
                {dynamicClassList.map(c => (
                  <option key={c} value={c}>Kelas {c}</option>
                ))}
              </select>

              {/* Subject Filter */}
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 max-w-[180px] truncate"
              >
                <option value="all">Semua Mapel</option>
                {availableSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>

              {/* Teacher Filter */}
              <select
                value={selectedTeacherFilter}
                onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 max-w-[170px] truncate"
              >
                <option value="all">Semua Guru</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.namaLengkap}>{t.namaLengkap}</option>
                ))}
              </select>

              {/* Date Filter */}
              <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none"
                  title="Filter berdasarkan tanggal KBM"
                />
                {dateFilter && (
                  <button
                    type="button"
                    onClick={() => setDateFilter('')}
                    className="text-slate-400 hover:text-slate-200 text-xs px-1"
                    title="Reset tanggal"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* View Mode & Export */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  exportTeachingJournalsToExcel(filteredJournals, school, {
                    kelas: selectedClassFilter !== 'all' ? selectedClassFilter : undefined,
                    mapel: selectedSubjectFilter !== 'all' ? selectedSubjectFilter : undefined,
                    guru: selectedTeacherFilter !== 'all' ? selectedTeacherFilter : undefined,
                    dateRange: dateFilter ? formatIndonesianDate(dateFilter) : undefined
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors"
                title="Ekspor Jurnal Terfilter ke Excel"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Ekspor Excel</span>
              </button>

              <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Kartu
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tabel
                </button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {filteredJournals.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-100">Belum Ada Catatan Jurnal Mengajar</h3>
                <p className="text-xs text-slate-400">
                  {searchQuery || selectedClassFilter !== 'all' || dateFilter
                    ? 'Tidak ditemukan jurnal yang cocok dengan filter pencarian saat ini.'
                    : 'Mulai dokumentasikan kegiatan belajar mengajar dengan mencatat jurnal harian guru.'}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleOpenAddJournal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Input Jurnal</span>
                </button>
              </div>
            </div>
          )}

          {/* Cards View */}
          {filteredJournals.length > 0 && viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJournals.map((journal) => (
                <div
                  key={journal.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-3.5">
                    {/* Header Card: Day, Date, Class, and Subject */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold text-xs">
                            Kelas {journal.kelas}
                          </span>
                          {journal.fase && (
                            <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium text-[11px]">
                              {journal.fase}
                            </span>
                          )}
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold text-xs truncate max-w-[200px]">
                            {journal.mataPelajaran}
                          </span>
                          {journal.statusKBM && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              journal.statusKBM === 'Terlaksana'
                                ? 'bg-teal-500/10 text-teal-300 border-teal-500/20'
                                : journal.statusKBM === 'Remedial'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                : journal.statusKBM === 'Pengayaan'
                                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                                : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                            }`}>
                              {journal.statusKBM}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 pt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-300">
                            {journal.hari}, {formatIndonesianDate(journal.tanggal)}
                          </span>
                          {journal.jamPelajaran && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {journal.jamPelajaran}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleOpenEditJournal(journal)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Edit Catatan Jurnal"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmDeleteJournal(journal)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Hapus Catatan Jurnal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Tujuan Pembelajaran (TP) */}
                    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1">
                      <span className="text-[11px] font-semibold text-blue-400 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        Tujuan Pembelajaran (TP)
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {journal.tujuanPembelajaran}
                      </p>
                    </div>

                    {/* Materi Pokok / Bahasan */}
                    <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/80 space-y-1">
                      <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5" />
                        Materi Pokok / Bahasan
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {journal.materi}
                      </p>
                    </div>

                    {/* Refleksi Pembelajaran */}
                    {journal.refleksi && (
                      <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/30 space-y-1">
                        <span className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          Refleksi Guru
                        </span>
                        <p className="text-xs text-indigo-200/90 leading-relaxed italic">
                          "{journal.refleksi}"
                        </p>
                      </div>
                    )}

                    {/* Keterangan */}
                    {journal.keterangan && (
                      <div className="text-xs text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/60 flex items-start gap-2">
                        <span className="font-semibold text-slate-300 shrink-0">Keterangan:</span>
                        <span className="text-slate-400 leading-relaxed">{journal.keterangan}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Teacher Name */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <strong className="text-slate-300 font-medium">{journal.guruPengajar || 'Guru Kelas'}</strong>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {journal.id.slice(-6)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table View */}
          {filteredJournals.length > 0 && viewMode === 'table' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/90 text-slate-300 border-b border-slate-800">
                    <tr>
                      <th className="p-3 w-10 text-center">No</th>
                      <th className="p-3 w-32">Hari, Tanggal</th>
                      <th className="p-3 min-w-[140px]">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-200">Kelas / JP</span>
                          <select
                            value={selectedClassFilter}
                            onChange={(e) => setSelectedClassFilter(e.target.value)}
                            className="px-2 py-1 bg-slate-900 border border-slate-700 text-blue-300 font-bold rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                            title="Pilih opsi kelas langsung dari kolom"
                          >
                            <option value="all">Semua Kelas</option>
                            {dynamicClassList.map(cls => (
                              <option key={cls} value={cls}>Kelas {cls}</option>
                            ))}
                          </select>
                        </div>
                      </th>
                      <th className="p-3 min-w-[180px]">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-200">Mata Pelajaran</span>
                          <select
                            value={selectedSubjectFilter}
                            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                            className="px-2 py-1 bg-slate-900 border border-slate-700 text-emerald-300 font-semibold rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer truncate"
                            title="Pilih opsi mata pelajaran langsung dari kolom"
                          >
                            <option value="all">Semua Mapel ({availableSubjects.length})</option>
                            {availableSubjects.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </th>
                      <th className="p-3 min-w-[220px]">Tujuan Pembelajaran (TP)</th>
                      <th className="p-3 min-w-[180px]">Materi</th>
                      <th className="p-3 min-w-[200px]">Refleksi & Keterangan</th>
                      <th className="p-3 min-w-[150px]">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-200">Guru Pengajar</span>
                          <select
                            value={selectedTeacherFilter}
                            onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                            className="px-2 py-1 bg-slate-900 border border-slate-700 text-slate-200 font-medium rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer truncate"
                            title="Pilih opsi guru pengajar dari kolom"
                          >
                            <option value="all">Semua Guru ({teachers.length})</option>
                            {teachers.map(t => (
                              <option key={t.id} value={t.namaLengkap}>{t.namaLengkap}</option>
                            ))}
                          </select>
                        </div>
                      </th>
                      <th className="p-3 w-16 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900">
                    {filteredJournals.map((journal, idx) => (
                      <tr key={journal.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                        <td className="p-3">
                          <p className="font-semibold text-slate-200">{journal.hari}</p>
                          <p className="text-[11px] text-slate-400">{journal.tanggal}</p>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 font-bold border border-blue-500/20">
                              {journal.kelas}
                            </span>
                            {journal.fase && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px]">
                                {journal.fase}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">{journal.jamPelajaran || '-'}</p>
                        </td>
                        <td className="p-3 font-semibold text-slate-200">
                          {journal.mataPelajaran}
                        </td>
                        <td className="p-3 text-slate-300">
                          {journal.tujuanPembelajaran}
                        </td>
                        <td className="p-3 text-slate-300">
                          {journal.materi}
                        </td>
                        <td className="p-3 space-y-1">
                          {journal.refleksi && (
                            <p className="text-indigo-300 italic text-[11px]">
                              "{journal.refleksi}"
                            </p>
                          )}
                          {journal.keterangan && (
                            <p className="text-slate-400 text-[11px]">
                              Ket: {journal.keterangan}
                            </p>
                          )}
                        </td>
                        <td className="p-3 text-slate-300">
                          {journal.guruPengajar || '-'}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditJournal(journal)}
                              className="p-1 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-800"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfirmDeleteJournal(journal)}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: BANK DATA KURIKULUM & PEMETAAN TP-MATERI                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'kurikulum' && (
        <div className="space-y-4">
          {/* Regulatory Information Banner */}
          <div className="p-3.5 bg-blue-950/40 border border-blue-800/40 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-300">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold text-blue-300">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Rujukan Regulasi Kurikulum Merdeka (Keputusan Kepala BSKAP Nomor 046/H/KR/2025)</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                <strong className="text-slate-200">Fase A (Kelas 1 & 2):</strong> Seluruh Elemen dan Capaian Pembelajaran (CP) diselaraskan persis 100% dengan Lampiran Keputusan Kepala BSKAP No. 046/H/KR/2025 (PAI & Budi Pekerti hal. 27-28, Pendidikan Pancasila hal. 84-85, Bahasa Indonesia hal. 94-96, Matematika hal. 112-113, PJOK hal. 310-311, serta Seni Budaya 4 Cabang: Seni Rupa hal. 246, Seni Musik hal. 233, Seni Tari hal. 256, Seni Teater hal. 265).
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddCurriculum}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah TP / Materi</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-3 flex-wrap bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="relative min-w-[200px] flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari mapel, TP, materi, atau fase..."
                value={curSearchQuery}
                onChange={(e) => setCurSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={curFilterMapel}
              onChange={(e) => {
                setCurFilterMapel(e.target.value);
                setCurFilterSubSeni('all');
              }}
              className="px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Semua Mata Pelajaran ({availableSubjects.length})</option>
              {availableSubjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {curFilterMapel === 'Seni Budaya' && (
              <select
                value={curFilterSubSeni}
                onChange={(e) => setCurFilterSubSeni(e.target.value)}
                className="px-3 py-1.5 bg-purple-950/50 border border-purple-800/80 rounded-xl text-xs text-purple-200 focus:outline-none focus:border-purple-500 font-semibold"
              >
                <option value="all">Semua Opsi Seni (4 Opsi)</option>
                <option value="Seni Rupa">🎨 Opsi Seni Rupa</option>
                <option value="Seni Musik">🎵 Opsi Seni Musik</option>
                <option value="Seni Tari">💃 Opsi Seni Tari</option>
                <option value="Seni Teater">🎭 Opsi Seni Teater</option>
              </select>
            )}

            <select
              value={curFilterFase}
              onChange={(e) => setCurFilterFase(e.target.value)}
              className="px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium text-amber-300"
            >
              <option value="all" className="text-slate-200">Semua Fase (6 Tingkat)</option>
              {FASE_OPTIONS.map(f => (
                <option key={f} value={f} className="text-slate-200">{f}</option>
              ))}
            </select>

            <select
              value={curFilterSemester}
              onChange={(e) => setCurFilterSemester(e.target.value)}
              className="px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-emerald-300 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="all" className="text-slate-200">Semua Semester</option>
              <option value="Ganjil" className="text-emerald-300">Semester Ganjil (1)</option>
              <option value="Genap" className="text-sky-300">Semester Genap (2)</option>
            </select>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-slate-400">
                {filteredCurriculumList.length} dari {curriculum.length} item
              </span>
              <button
                type="button"
                onClick={() => handleExportCurriculum(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-all active:scale-95 shadow-md shadow-sky-600/25"
                title={`Ekspor seluruh isi data pada menu Kurikulum (TP) (${curriculum.length} butir) ke file Excel`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor Kurikulum ({curriculum.length})</span>
              </button>
              {filteredCurriculumList.length < curriculum.length && (
                <button
                  type="button"
                  onClick={() => handleExportCurriculum(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-medium border border-sky-500/30 transition-colors"
                  title="Ekspor hanya data kurikulum yang sesuai dengan filter pencarian saat ini"
                >
                  <Download className="w-3 h-3 text-sky-400" />
                  <span>Ekspor Filter ({filteredCurriculumList.length})</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleResetCurriculum}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-700/80 transition-colors"
                title="Reset Bank Kurikulum ke standar bawaan"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>Reset Standar</span>
              </button>
            </div>
          </div>

          {/* Table of Curriculum */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/90 text-slate-300 border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-10 text-center">No</th>
                    <th className="p-3 min-w-[180px]">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-200">Mata Pelajaran</span>
                        <select
                          value={curFilterMapel}
                          onChange={(e) => {
                            setCurFilterMapel(e.target.value);
                            setCurFilterSubSeni('all');
                          }}
                          className="px-2 py-1 bg-slate-900 border border-slate-700 text-slate-200 font-semibold rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer truncate"
                          title="Pilih opsi mata pelajaran langsung dari kolom"
                        >
                          <option value="all">Semua Mapel ({availableSubjects.length})</option>
                          {availableSubjects.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {curFilterMapel === 'Seni Budaya' && (
                          <select
                            value={curFilterSubSeni}
                            onChange={(e) => setCurFilterSubSeni(e.target.value)}
                            className="mt-1 px-2 py-0.5 bg-purple-950 border border-purple-700 text-purple-200 font-medium rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                          >
                            <option value="all">Semua Opsi Seni</option>
                            <option value="Seni Rupa">Opsi: Seni Rupa</option>
                            <option value="Seni Musik">Opsi: Seni Musik</option>
                            <option value="Seni Tari">Opsi: Seni Tari</option>
                            <option value="Seni Teater">Opsi: Seni Teater</option>
                          </select>
                        )}
                      </div>
                    </th>
                    <th className="p-3 min-w-[160px]">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-200">Fase / Tingkat Kelas</span>
                        <select
                          value={curFilterFase}
                          onChange={(e) => setCurFilterFase(e.target.value)}
                          className="px-2 py-1 bg-slate-900 border border-slate-700 text-amber-300 font-semibold rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer truncate"
                          title="Pilih opsi fase / kelas langsung dari kolom"
                        >
                          <option value="all">Semua Fase (6 Tingkat)</option>
                          {FASE_OPTIONS.map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                    </th>
                    <th className="p-3 min-w-[110px]">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-200">Semester</span>
                        <select
                          value={curFilterSemester}
                          onChange={(e) => setCurFilterSemester(e.target.value)}
                          className="px-2 py-1 bg-slate-900 border border-slate-700 text-emerald-300 font-semibold rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer truncate"
                          title="Pilih opsi semester langsung dari kolom"
                        >
                          <option value="all">Semua Sem.</option>
                          <option value="Ganjil">Semester Ganjil</option>
                          <option value="Genap">Semester Genap</option>
                        </select>
                      </div>
                    </th>
                    <th className="p-3 w-32">Elemen</th>
                    <th className="p-3 min-w-[240px]">Capaian Pembelajaran (CP)</th>
                    <th className="p-3 min-w-[240px]">Tujuan Pembelajaran (TP)</th>
                    <th className="p-3 min-w-[200px]">Materi Pokok / Bahasan</th>
                    <th className="p-3 w-20">Alokasi</th>
                    <th className="p-3 w-16 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                  {filteredCurriculumList.map((item, idx) => (
                    <tr key={`${item.id}-${idx}`} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-200">
                        <div className="flex flex-col gap-1">
                          <span>{item.mataPelajaran}</span>
                          {(item.subOpsiSeni || (item.mataPelajaran === 'Seni Budaya' && detectSeniBudayaBranch(item.tujuanPembelajaran, item.materi))) && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 w-fit">
                              <span className="text-[9px] text-purple-400">Opsi:</span>
                              <span>{item.subOpsiSeni || detectSeniBudayaBranch(item.tujuanPembelajaran, item.materi)}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium text-[11px] inline-block whitespace-nowrap">
                          {item.faseKelas || (item.kelasTarget ? `Fase ${item.kelasTarget}` : 'Semua Fase')}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md font-medium text-[11px] inline-flex items-center gap-1 border ${
                          item.semester === 'Ganjil'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : item.semester === 'Genap'
                            ? 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                            : 'bg-slate-500/10 text-slate-300 border-slate-500/20'
                        }`}>
                          {item.semester ? `Semester ${item.semester}` : '-'}
                        </span>
                      </td>
                      <td className="p-3">
                        {item.elemen ? (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-medium text-[11px] border border-indigo-500/20 inline-block">
                            {item.elemen}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-300 max-w-xs leading-relaxed text-[11px]">
                        {item.capaianPembelajaran ? (
                          <p className="line-clamp-3 text-slate-300" title={item.capaianPembelajaran}>
                            {item.capaianPembelajaran}
                          </p>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-200 font-medium">
                        {item.tujuanPembelajaran}
                      </td>
                      <td className="p-3 text-slate-300">
                        {item.materi}
                      </td>
                      <td className="p-3 text-slate-400">
                        {item.alokasiWaktu || '-'}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCurriculum(item)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Edit pemetaan kurikulum (Elemen, CP, TP, Materi)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCurriculumItem(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Hapus pemetaan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INPUT & EDIT JURNAL MENGAJAR HARIAN (CASCADING FORM)              */}
      {/* ========================================================================= */}
      {isJournalModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100">
                    {editingJournalId ? 'Edit Catatan Jurnal Mengajar' : 'Tulis Jurnal Mengajar Harian'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Format resmi 6 menu standar KBM SD (Hari/Tgl, Mapel, TP, Materi, Refleksi, Keterangan)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsJournalModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitJournal} className="p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
              {/* Row 1: Hari & Tanggal (Menu 1) + Kelas + Guru Pengajar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                {/* 1. Hari dan Tanggal */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    1. Hari dan Tanggal <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formTanggal}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[11px] font-semibold text-blue-300 truncate">
                    {formHari}, {formatIndonesianDate(formTanggal)}
                  </p>
                </div>

                {/* Kelas */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Kelas / Rombel <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formKelas}
                    onChange={(e) => {
                      const newKelas = e.target.value as ClassGrade;
                      setFormKelas(newKelas);
                      const newFase = getFaseFromKelas(newKelas);
                      setFormFase(newFase);

                      // If on standard curriculum, auto refresh TP & Materi to match the new grade level
                      if (!isCustomTP && formMataPelajaran) {
                        const classNum = newKelas ? newKelas.charAt(0) : '';
                        const normSubject = normalizeSubjectName(formMataPelajaran).toLowerCase();
                        const isSeni = normSubject === 'seni budaya';
                        const matched = curriculum.filter(c => {
                          const cNorm = normalizeSubjectName(c.mataPelajaran).toLowerCase();
                          const matchMapel = cNorm === normSubject || (isSeni && ['seni rupa', 'seni musik', 'seni tari', 'seni teater', 'seni budaya'].includes(cNorm));
                          if (!matchMapel) return false;
                          if (isSeni && selectedSeniBranch !== 'Semua Opsi') {
                            const itemBranch = c.subOpsiSeni || detectSeniBudayaBranch(c.tujuanPembelajaran, c.materi);
                            if (itemBranch !== selectedSeniBranch) return false;
                          }
                          return true;
                        });
                        const classMatched = matched.filter(c => {
                          if (!classNum) return true;
                          return (c.kelasTarget && (c.kelasTarget.includes(classNum) || c.kelasTarget === 'Semua Kelas')) ||
                                 (c.faseKelas && (c.faseKelas.includes(`Kelas ${classNum}`) || c.faseKelas === newFase));
                        });
                        const candidates = classMatched.length > 0 ? classMatched : matched;
                        if (candidates.length > 0) {
                          setFormTujuanPembelajaran(candidates[0].tujuanPembelajaran);
                          setFormMateri(candidates[0].materi);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    {dynamicClassList.map(c => (
                      <option key={c} value={c}>Kelas {c}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400">Rombel SD</p>
                </div>

                {/* Guru Pengajar */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Guru Pengajar <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formGuruPengajar}
                    onChange={(e) => setFormGuruPengajar(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.namaLengkap}>
                        {t.namaLengkap} ({t.jabatan})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 truncate">Guru pengampu</p>
                </div>
              </div>

              {/* ================================================================= */}
              {/* JP CHECKLIST SECTION (1 JP = 35 MENIT DENGAN ISTIRAHAT KONDISIONAL)*/}
              {/* ================================================================= */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-3.5">
                {/* Header with Title & Schedule Config Trigger */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-700/60">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-400" />
                      Jam Pelajaran (Ceklist JP) <span className="text-rose-400">*</span>
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Standar SD: <strong className="text-slate-300">1 JP = {activeScheduleConfig.durasiJpMenit || 35} menit</strong>. Beri tanda centang pada jam mengajar Anda.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsScheduleConfigModalOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-medium border border-amber-500/30 hover:border-amber-500/50 transition-colors"
                      title="Atur jam mulai, durasi per JP (35m), dan jam istirahat sekolah"
                    >
                      <Sliders className="w-3 h-3 text-amber-400" />
                      <span>Atur Jadwal & Istirahat</span>
                    </button>
                  </div>
                </div>

                {/* Preset shortcuts bar */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mr-1">
                    Pilih Cepat:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectJpPreset([1, 2])}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      formSelectedJp.length === 2 && formSelectedJp[0] === 1 && formSelectedJp[1] === 2
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    JP 1 - 2 (2 JP)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectJpPreset([3, 4])}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      formSelectedJp.length === 2 && formSelectedJp[0] === 3 && formSelectedJp[1] === 4
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    JP 3 - 4 (2 JP)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectJpPreset([5, 6])}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      formSelectedJp.length === 2 && formSelectedJp[0] === 5 && formSelectedJp[1] === 6
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    JP 5 - 6 (2 JP)
                  </button>
                  {activeScheduleConfig.totalJp >= 8 && (
                    <button
                      type="button"
                      onClick={() => handleSelectJpPreset([7, 8])}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        formSelectedJp.length === 2 && formSelectedJp[0] === 7 && formSelectedJp[1] === 8
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      JP 7 - 8 (2 JP)
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSelectJpPreset([1, 2, 3])}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      formSelectedJp.length === 3 && formSelectedJp[0] === 1 && formSelectedJp[2] === 3
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    JP 1 - 3 (3 JP)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectJpPreset([4, 5, 6])}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      formSelectedJp.length === 3 && formSelectedJp[0] === 4 && formSelectedJp[2] === 6
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    JP 4 - 6 (3 JP)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectJpPreset(Array.from({ length: activeScheduleConfig.totalJp }, (_, i) => i + 1))}
                    className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700"
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectJpPreset([])}
                    className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700"
                  >
                    Reset
                  </button>
                </div>

                {/* Checklist Grid & Conditional Breaks Timeline */}
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {jpSlots.map((slot) => {
                      const isSelected = formSelectedJp.includes(slot.jpNumber);
                      return (
                        <button
                          key={slot.jpNumber}
                          type="button"
                          onClick={() => handleToggleJp(slot.jpNumber)}
                          className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50'
                              : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-bold ${isSelected ? 'text-blue-300' : 'text-slate-200'}`}>
                                JP {slot.jpNumber}
                              </span>
                              <span className="text-[10px] px-1 py-0.2 rounded bg-slate-900/60 text-slate-400 font-mono">
                                {slot.durationMinutes}m
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {slot.startTime} - {slot.endTime}
                            </p>
                          </div>

                          <div className="shrink-0 text-blue-400">
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-blue-400 fill-blue-500/20" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Conditional Breaks Indicator Ribbon */}
                  {activeScheduleConfig.breaks && activeScheduleConfig.breaks.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400/90">
                        <Coffee className="w-3.5 h-3.5 text-amber-400" />
                        <span>Jam Istirahat Terjadwal (Kondisional):</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeScheduleConfig.breaks.map((brk, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between"
                          >
                            <span className="font-medium">
                              ☕ {brk.name || `Istirahat ${idx + 1}`} (Setelah JP {brk.afterJp})
                            </span>
                            <span className="font-mono text-amber-200/90 text-[11px]">
                              {brk.durationMinutes} Menit
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Realtime Selection Summary Bar */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-200">
                        ✓ Terpilih: <span className="text-blue-400">{formSelectedJp.length} JP</span>
                      </span>
                      <span className="text-slate-400">
                        ({formatSelectedJpDisplay(formSelectedJp, jpSlots)})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-300 text-xs">
                      <span>
                        Total Durasi: <strong className="text-amber-300 font-semibold">{formSelectedJp.length * (activeScheduleConfig.durasiJpMenit || 35)} Menit</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Keterlaksanaan KBM */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Status Keterlaksanaan KBM
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Terlaksana', 'Tertunda', 'Remedial', 'Pengayaan'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFormStatusKBM(st)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                        formStatusKBM === st
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* ================================================================= */}
              {/* CASCADING SECTIONS (2. Mata Pelajaran -> 3. TP -> 4. Materi)      */}
              {/* ================================================================= */}
              <div className="space-y-4 p-4 rounded-xl bg-gradient-to-b from-blue-950/20 via-slate-900 to-slate-900/60 border border-blue-900/30">
                {/* 2. Mata Pelajaran */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      2. Mata Pelajaran <span className="text-rose-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomSubject(!isCustomSubject)}
                      className="text-[11px] text-blue-400 hover:underline"
                    >
                      {isCustomSubject ? 'Pilih dari Bank Kurikulum' : '+ Tulis Mapel Manual'}
                    </button>
                  </div>

                  {!isCustomSubject ? (
                    <select
                      value={formMataPelajaran}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">-- Pilih Mata Pelajaran --</option>
                      {availableSubjects.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Ketik nama mata pelajaran baru..."
                      value={formMataPelajaran}
                      onChange={(e) => setFormMataPelajaran(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  )}
                </div>

                {/* Sub-Opsi Seni Budaya when Seni Budaya is chosen */}
                {normalizeSubjectName(formMataPelajaran).toLowerCase() === 'seni budaya' && (
                  <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                        <span>Opsi Cabang Seni Budaya:</span>
                      </label>
                      <span className="text-[10px] text-purple-400">Bagian (opsi) dari Seni Budaya</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      {['Semua Opsi', 'Seni Rupa', 'Seni Musik', 'Seni Tari', 'Seni Teater'].map(branch => (
                        <button
                          key={branch}
                          type="button"
                          onClick={() => handleSeniBranchChange(branch)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all text-center truncate ${
                            selectedSeniBranch === branch
                              ? 'bg-purple-600 text-white shadow-sm font-bold'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {branch}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Tujuan Pembelajaran (Cascading from Mapel) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-blue-400" />
                      3. Tujuan Pembelajaran (TP) <span className="text-rose-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomTP(!isCustomTP)}
                      className="text-[11px] text-blue-400 hover:underline"
                    >
                      {isCustomTP ? 'Pilih dari Bank TP Kurikulum' : '+ Tulis TP Manual'}
                    </button>
                  </div>

                  {!isCustomTP && availableTPs.length > 0 ? (
                    <select
                      value={formTujuanPembelajaran || (availableTPs[0] ?? '')}
                      onChange={(e) => handleTPChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed"
                    >
                      {availableTPs.map((tp, i) => {
                        let prefix = '';
                        if (normalizeSubjectName(formMataPelajaran).toLowerCase() === 'seni budaya' && selectedSeniBranch === 'Semua Opsi') {
                          const branch = detectSeniBudayaBranch(tp);
                          if (branch) prefix = `[${branch}] `;
                        }
                        return (
                          <option key={i} value={tp}>{prefix}{tp}</option>
                        );
                      })}
                    </select>
                  ) : (
                    <textarea
                      rows={2}
                      placeholder="Ketik Tujuan Pembelajaran (TP) yang ingin dicapai..."
                      value={formTujuanPembelajaran}
                      onChange={(e) => setFormTujuanPembelajaran(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  )}
                  {availableTPs.length > 0 && !isCustomTP && (
                    <p className="text-[10px] text-slate-400">
                      Tersedia {availableTPs.length} pilihan TP terdaftar di format Excel kurikulum untuk mapel <em>{formMataPelajaran}</em>.
                    </p>
                  )}
                </div>

                {/* 4. Materi (Cascading from TP & Mapel) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                      <Bookmark className="w-4 h-4 text-blue-400" />
                      4. Materi Pokok / Bahasan <span className="text-rose-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomMateri(!isCustomMateri)}
                      className="text-[11px] text-blue-400 hover:underline"
                    >
                      {isCustomMateri ? 'Pilih dari Pemetaan Kurikulum' : '+ Tulis Materi Manual'}
                    </button>
                  </div>

                  {!isCustomMateri && availableMaterials.length > 0 ? (
                    <select
                      value={formMateri || (availableMaterials[0] ?? '')}
                      onChange={(e) => setFormMateri(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                    >
                      {availableMaterials.map((mat, i) => (
                        <option key={i} value={mat}>{mat}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Ketik topik atau pokok bahasan materi..."
                      value={formMateri}
                      onChange={(e) => setFormMateri(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  )}
                  {availableMaterials.length > 0 && !isCustomMateri && (
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Materi otomatis disinkronkan sesuai Tujuan Pembelajaran terpilih.
                    </p>
                  )}
                </div>
              </div>

              {/* 5. Refleksi Pembelajaran (Menu 5) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    5. Refleksi Guru Terhadap KBM
                  </label>
                  <span className="text-[11px] text-slate-400">Evaluasi & tindak lanjut pemahaman siswa</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Tuliskan refleksi hasil pembelajaran, tingkat ketuntasan siswa, kendala atau respon peserta didik..."
                  value={formRefleksi}
                  onChange={(e) => setFormRefleksi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                {/* Template Chips for Quick Reflection */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-medium">Contoh / Template Refleksi Cepat:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {REFLECTION_TEMPLATES.map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setFormRefleksi(prev => prev ? `${prev} ${tpl}` : tpl);
                        }}
                        className="text-[10px] px-2 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors text-left"
                      >
                        {tpl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 6. Keterangan (Menu 6) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  6. Keterangan / Catatan Tambahan
                </label>
                <input
                  type="text"
                  placeholder="Misal: Seluruh siswa hadir, media proyektor & benda konkret, tugas LKS tuntas..."
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                {/* Quick Chips for Keterangan */}
                <div className="flex flex-wrap gap-1.5">
                  {KETERANGAN_TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormKeterangan(tpl)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
                    >
                      {tpl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsJournalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{editingJournalId ? 'Simpan Perubahan' : 'Simpan Jurnal Mengajar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH KURIKULUM / TP MANUAL                                       */}
      {/* ========================================================================= */}
      {isAddCurriculumModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {editingCurriculumId ? (
                  <>
                    <Edit3 className="w-5 h-5 text-amber-400" />
                    <span>Edit Pemetaan Kurikulum (Elemen & CP)</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-blue-400" />
                    <span>Tambah Pemetaan TP & Materi Manual</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddCurriculumModalOpen(false);
                  setEditingCurriculumId(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddManualCurriculum} className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    Mata Pelajaran <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCurCustomSubject(!isCurCustomSubject);
                      if (!isCurCustomSubject && curMapel === '') {
                        setCurMapel(availableSubjects[0] || 'Matematika');
                      }
                    }}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    {isCurCustomSubject ? 'Pilih dari Bank Kurikulum' : '+ Tulis Mapel Manual'}
                  </button>
                </div>

                {!isCurCustomSubject ? (
                  <select
                    value={curMapel}
                    onChange={(e) => setCurMapel(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Mata Pelajaran --</option>
                    {availableSubjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Misal: Matematika / IPAS / Seni Budaya / Bahasa Daerah"
                    value={curMapel}
                    onChange={(e) => setCurMapel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                )}

                {normalizeSubjectName(curMapel).toLowerCase() === 'seni budaya' && (
                  <div className="mt-2.5 p-3 bg-purple-950/40 border border-purple-800/60 rounded-xl space-y-1.5">
                    <label className="font-semibold text-purple-300 flex items-center justify-between text-xs">
                      <span>Opsi Cabang Seni Budaya <span className="text-rose-400">*</span></span>
                      <span className="text-[10px] text-purple-400">Bagian (opsi) dari Seni Budaya</span>
                    </label>
                    <select
                      value={curSubOpsiSeni}
                      onChange={(e) => setCurSubOpsiSeni(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-purple-700/70 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500 font-medium text-xs"
                    >
                      <option value="Seni Rupa">🎨 Opsi Seni Rupa</option>
                      <option value="Seni Musik">🎵 Opsi Seni Musik</option>
                      <option value="Seni Tari">💃 Opsi Seni Tari</option>
                      <option value="Seni Teater">🎭 Opsi Seni Teater</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-200">Fase (Per Kelas) *</label>
                  <select
                    value={curFase}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCurFase(val);
                      if (val.includes('Kelas 1')) setCurKelas('Kelas 1');
                      else if (val.includes('Kelas 2')) setCurKelas('Kelas 2');
                      else if (val.includes('Kelas 3')) setCurKelas('Kelas 3');
                      else if (val.includes('Kelas 4')) setCurKelas('Kelas 4');
                      else if (val.includes('Kelas 5')) setCurKelas('Kelas 5');
                      else if (val.includes('Kelas 6')) setCurKelas('Kelas 6');
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 font-medium text-amber-300"
                  >
                    {FASE_OPTIONS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-200">Semester *</label>
                  <select
                    value={curSemester}
                    onChange={(e) => setCurSemester(e.target.value as 'Ganjil' | 'Genap' | 'Semua')}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 font-medium text-emerald-300"
                  >
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Genap">Semester Genap</option>
                    <option value="Semua">Semua Semester</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-200">Alokasi Waktu</label>
                  <input
                    type="text"
                    placeholder="Misal: 2 JP"
                    value={curAlokasi}
                    onChange={(e) => setCurAlokasi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-200">Elemen</label>
                  <span className="text-[10px] text-slate-400 font-normal">Rujukan BSKAP 046/2025</span>
                </div>
                {officialElementsForSubject.length > 0 && (
                  <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-semibold text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Pilih Elemen Resmi BSKAP 046/2025 ({curFase}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {officialElementsForSubject.map(opt => (
                        <button
                          key={opt.elemen}
                          type="button"
                          onClick={() => {
                            setCurElemen(opt.elemen);
                            setCurCP(opt.cp);
                          }}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all ${
                            curElemen === opt.elemen
                              ? 'bg-blue-600/40 text-blue-200 border-blue-400 font-semibold shadow-sm'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-blue-500 hover:text-white'
                          }`}
                          title="Klik untuk mengisi Elemen & Capaian Pembelajaran resmi sekaligus"
                        >
                          {opt.elemen}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Misal: Bilangan / Pancasila / Menyimak / Terampil Bergerak"
                  value={curElemen}
                  onChange={(e) => setCurElemen(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-200 flex items-center justify-between">
                  <span>Capaian Pembelajaran (CP)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Sesuai Regulasi KepKa 046/2025</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan deskripsi Capaian Pembelajaran (CP) fase terkait..."
                  value={curCP}
                  onChange={(e) => setCurCP(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Tujuan Pembelajaran (TP) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Misal: TP 1.1: Memahami nilai pecahan desimal..."
                  value={curTP}
                  onChange={(e) => setCurTP(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Materi Pokok / Bahasan *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Pecahan Senilai dan Operasi Hitung"
                  value={curMateri}
                  onChange={(e) => setCurMateri(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddCurriculumModalOpen(false);
                    setEditingCurriculumId(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md transition-all active:scale-95"
                >
                  {editingCurriculumId ? 'Simpan Perubahan' : 'Tambahkan ke Kurikulum'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: IMPORT KURIKULUM DARI EXCEL                                       */}
      {/* ========================================================================= */}
      <CurriculumImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportCurriculumComplete}
        existingCount={curriculum.length}
      />

      {/* ========================================================================= */}
      {/* MODAL: KONFIGURASI JADWAL JP & ISTIRAHAT KONDISIONAL                      */}
      {/* ========================================================================= */}
      <JpScheduleConfigModal
        isOpen={isScheduleConfigModalOpen}
        onClose={() => setIsScheduleConfigModalOpen(false)}
        currentConfig={activeScheduleConfig}
        onSaveConfig={(newConfig) => {
          if (onSaveJpSchedule) {
            onSaveJpSchedule(newConfig);
          }
          triggerToast(
            'Jadwal JP & Istirahat Disimpan',
            `Konfigurasi Jadwal (1 JP = ${newConfig.durasiJpMenit} Menit, ${newConfig.breaks.length} Sesi Istirahat) berhasil diperbarui.`,
            'success'
          );
        }}
      />

      {/* Confirmation Delete Modal */}
      <ConfirmDeleteModal 
        state={deleteConfirmState} 
        onClose={closeDeleteConfirm} 
      />
    </div>
  );
};
